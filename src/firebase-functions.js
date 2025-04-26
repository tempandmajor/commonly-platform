
// This file simulates the Firebase Cloud Functions code
// In a real implementation, this would be deployed to Firebase Functions

/**
 * Process a sponsorship payment using Stripe
 * 
 * @param {Object} data - The payment data
 * @param {string} data.eventId - The event ID
 * @param {string} data.tierId - The sponsorship tier ID
 * @param {string} data.userId - The user ID
 * @param {string} data.paymentMethodId - The Stripe payment method ID
 * @param {string} data.referralCode - Optional referral code
 * @returns {string} - The payment ID
 */
exports.processSponsorshipPayment = async (data, context) => {
  // Authenticate the user
  if (!context.auth) {
    throw new Error('Unauthenticated');
  }

  const { eventId, tierId, userId, paymentMethodId, referralCode } = data;
  
  try {
    // Get the event data to check if pre-sale goal has been met
    const admin = require('firebase-admin');
    const db = admin.firestore();
    const eventDoc = await db.collection('events').doc(eventId).get();
    
    if (!eventDoc.exists) {
      throw new Error('Event not found');
    }
    
    const event = eventDoc.data();
    
    // Get the sponsorship tier
    const tierDoc = await db.collection('sponsorshipTiers').doc(tierId).get();
    if (!tierDoc.exists) {
      throw new Error('Sponsorship tier not found');
    }
    
    const tier = tierDoc.data();
    
    // Check if the tier has limited spots and if they're already taken
    if (tier.limitedSpots && tier.spotsTaken >= tier.limitedSpots) {
      throw new Error('This sponsorship tier is sold out');
    }
    
    // Create a payment intent with Stripe
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    
    // Get the event organizer's Stripe Connect account
    const organizerDoc = await db.collection('users').doc(event.organizerId).get();
    const organizerData = organizerDoc.data();
    
    if (!organizerData.stripeConnectId) {
      throw new Error('Event organizer does not have a Stripe Connect account');
    }
    
    // Create a payment intent with deferred capture (authorize now, capture later)
    // This allows us to only charge when pre-sale goal is met
    const paymentIntent = await stripe.paymentIntents.create({
      amount: tier.price * 100, // Convert to cents
      currency: 'usd',
      payment_method: paymentMethodId,
      confirm: true,
      capture_method: 'manual', // Authorize now, capture later
      application_fee_amount: tier.price * 5, // 5% platform fee
      transfer_data: {
        destination: organizerData.stripeConnectId,
      },
      metadata: {
        eventId,
        tierId,
        sponsorshipTier: tier.name,
        userId
      }
    });
    
    // Record the sponsorship in Firestore
    const sponsorshipRef = await db.collection('sponsorships').add({
      eventId,
      tierId,
      userId,
      amount: tier.price,
      paymentIntentId: paymentIntent.id,
      status: 'pending', // Will be captured when pre-sale goal is met
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      referralCode: referralCode || null
    });
    
    // Increment the spots taken for this tier
    await db.collection('sponsorshipTiers').doc(tierId).update({
      spotsTaken: admin.firestore.FieldValue.increment(1)
    });
    
    // Process referral if a code was provided
    if (referralCode) {
      const referralsQuery = await db.collection('referrals')
        .where('code', '==', referralCode)
        .limit(1)
        .get();
      
      if (!referralsQuery.empty) {
        const referralDoc = referralsQuery.docs[0];
        const referral = referralDoc.data();
        
        // Calculate commission
        const commissionPercentage = event.referralPercentage || 5;
        const commissionAmount = (tier.price * commissionPercentage) / 100;
        
        // Update referral stats
        await referralDoc.ref.update({
          conversionCount: admin.firestore.FieldValue.increment(1),
          earnings: admin.firestore.FieldValue.increment(commissionAmount)
        });
        
        // Add to the referrer's wallet
        const walletRef = db.collection('wallets').doc(referral.userId);
        const walletDoc = await walletRef.get();
        
        if (walletDoc.exists) {
          // Update existing wallet
          await walletRef.update({
            totalEarnings: admin.firestore.FieldValue.increment(commissionAmount),
            pendingBalance: admin.firestore.FieldValue.increment(commissionAmount),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            transactions: admin.firestore.FieldValue.arrayUnion({
              id: admin.firestore.FieldValue.serverTimestamp().toMillis().toString(),
              amount: commissionAmount,
              type: 'referral',
              status: 'pending',
              description: `Referral commission for ${event.title}`,
              createdAt: new Date().toISOString(),
              eventId,
              referralId: referralDoc.id
            })
          });
        } else {
          // Create new wallet
          await walletRef.set({
            userId: referral.userId,
            totalEarnings: commissionAmount,
            availableBalance: 0,
            pendingBalance: commissionAmount,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            transactions: [{
              id: admin.firestore.FieldValue.serverTimestamp().toMillis().toString(),
              amount: commissionAmount,
              type: 'referral',
              status: 'pending',
              description: `Referral commission for ${event.title}`,
              createdAt: new Date().toISOString(),
              eventId,
              referralId: referralDoc.id
            }]
          });
        }
      }
    }
    
    return sponsorshipRef.id;
  } catch (error) {
    console.error('Error processing sponsorship payment:', error);
    throw new Error(`Payment processing failed: ${error.message}`);
  }
};

/**
 * Generate a unique referral link for a user and event
 * 
 * @param {Object} data - The referral data
 * @param {string} data.userId - The user ID
 * @param {string} data.eventId - The event ID
 * @returns {string} - The referral link
 */
exports.generateReferralLink = async (data, context) => {
  // Authenticate the user
  if (!context.auth) {
    throw new Error('Unauthenticated');
  }

  const { userId, eventId } = data;
  
  // Rate limiting: Check if user has generated too many links recently
  const admin = require('firebase-admin');
  const db = admin.firestore();
  
  // Check if user has reached the limit (e.g., 5 referral links per hour)
  const oneHourAgo = new Date();
  oneHourAgo.setHours(oneHourAgo.getHours() - 1);
  
  const recentReferralsQuery = await db.collection('referrals')
    .where('userId', '==', userId)
    .where('createdAt', '>=', oneHourAgo)
    .get();
  
  if (recentReferralsQuery.size >= 5) {
    throw new Error('Rate limit exceeded. Please try again later.');
  }
  
  try {
    // Check if a referral for this user and event already exists
    const existingReferralQuery = await db.collection('referrals')
      .where('userId', '==', userId)
      .where('eventId', '==', eventId)
      .limit(1)
      .get();
    
    if (!existingReferralQuery.empty) {
      // Return the existing referral code
      const existingReferral = existingReferralQuery.docs[0].data();
      return `https://commonly-platform.web.app/r/${existingReferral.code}`;
    }
    
    // Generate a unique referral code
    const crypto = require('crypto');
    const code = crypto.randomBytes(4).toString('hex');
    
    // Create a new referral
    const referralRef = await db.collection('referrals').add({
      userId,
      eventId,
      code,
      createdAt: new Date().toISOString(),
      clickCount: 0,
      conversionCount: 0,
      earnings: 0
    });
    
    return `https://commonly-platform.web.app/r/${code}`;
  } catch (error) {
    console.error('Error generating referral link:', error);
    throw new Error(`Failed to generate referral link: ${error.message}`);
  }
};

/**
 * Track a referral link click
 * 
 * @param {Object} data - The click data
 * @param {string} data.code - The referral code
 * @returns {boolean} - Success status
 */
exports.trackReferralClick = async (data, context) => {
  const { code } = data;
  
  try {
    const admin = require('firebase-admin');
    const db = admin.firestore();
    
    // Find the referral by code
    const referralsQuery = await db.collection('referrals')
      .where('code', '==', code)
      .limit(1)
      .get();
    
    if (referralsQuery.empty) {
      throw new Error('Referral code not found');
    }
    
    const referralDoc = referralsQuery.docs[0];
    
    // Increment click count
    await referralDoc.ref.update({
      clickCount: admin.firestore.FieldValue.increment(1)
    });
    
    return true;
  } catch (error) {
    console.error('Error tracking referral click:', error);
    throw new Error(`Failed to track referral click: ${error.message}`);
  }
};

/**
 * Initiate a withdrawal from a user's wallet to their Stripe Connect account
 * 
 * @param {Object} data - The withdrawal data
 * @param {string} data.userId - The user ID
 * @param {number} data.amount - The amount to withdraw
 * @returns {boolean} - Success status
 */
exports.initiateWithdrawal = async (data, context) => {
  // Authenticate the user
  if (!context.auth) {
    throw new Error('Unauthenticated');
  }

  const { userId, amount } = data;
  
  if (!amount || amount <= 0) {
    throw new Error('Invalid withdrawal amount');
  }
  
  try {
    const admin = require('firebase-admin');
    const db = admin.firestore();
    
    // Get the user's wallet
    const walletRef = db.collection('wallets').doc(userId);
    const walletDoc = await walletRef.get();
    
    if (!walletDoc.exists) {
      throw new Error('Wallet not found');
    }
    
    const wallet = walletDoc.data();
    
    // Check if the user has enough funds
    if (wallet.availableBalance < amount) {
      throw new Error('Insufficient funds for withdrawal');
    }
    
    // Check if the user has a Stripe Connect account
    if (!wallet.stripeConnectId) {
      throw new Error('No payout method found. Please connect a Stripe account');
    }
    
    // Create a transfer to the user's Stripe Connect account
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const transfer = await stripe.transfers.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      destination: wallet.stripeConnectId,
      description: `Withdrawal to Connect account for user ${userId}`
    });
    
    // Update the wallet
    const transactionId = new Date().getTime().toString();
    await walletRef.update({
      availableBalance: admin.firestore.FieldValue.increment(-amount),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Add a transaction record
    await db.collection('transactions').add({
      userId,
      amount,
      type: 'withdrawal',
      status: 'completed',
      description: 'Withdrawal to connected account',
      createdAt: new Date().toISOString(),
      stripeTransferId: transfer.id
    });
    
    return true;
  } catch (error) {
    console.error('Error initiating withdrawal:', error);
    throw new Error(`Withdrawal failed: ${error.message}`);
  }
};

/**
 * Create a Stripe Connect account link for a user
 * 
 * @param {Object} data - The user data
 * @param {string} data.userId - The user ID
 * @returns {Object} - The account link URL
 */
exports.createConnectAccountLink = async (data, context) => {
  // Authenticate the user
  if (!context.auth) {
    throw new Error('Unauthenticated');
  }

  const { userId } = data;
  
  try {
    const admin = require('firebase-admin');
    const db = admin.firestore();
    
    // Get the user data
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      throw new Error('User not found');
    }
    
    const userData = userDoc.data();
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    let accountId = userData.stripeConnectId;
    
    // If the user doesn't have a Connect account, create one
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        email: userData.email,
        capabilities: {
          transfers: { requested: true },
          card_payments: { requested: true }
        },
        business_type: 'individual',
        metadata: {
          userId
        }
      });
      
      accountId = account.id;
      
      // Update the user with the account ID
      await userDoc.ref.update({
        stripeConnectId: accountId
      });
      
      // Also update the wallet if it exists
      const walletRef = db.collection('wallets').doc(userId);
      const walletDoc = await walletRef.get();
      
      if (walletDoc.exists) {
        await walletRef.update({
          stripeConnectId: accountId,
          hasPayoutMethod: true,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      } else {
        await walletRef.set({
          userId,
          totalEarnings: 0,
          availableBalance: 0,
          pendingBalance: 0,
          platformCredits: 0,
          stripeConnectId: accountId,
          hasPayoutMethod: true,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }
    }
    
    // Create an account link
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `https://commonly-platform.web.app/wallet`,
      return_url: `https://commonly-platform.web.app/wallet`,
      type: 'account_onboarding'
    });
    
    return { url: accountLink.url };
  } catch (error) {
    console.error('Error creating Connect account link:', error);
    throw new Error(`Failed to create account link: ${error.message}`);
  }
};

/**
 * Add platform credits to a user's wallet
 * 
 * @param {Object} data - The credit data
 * @param {string} data.userId - The user ID
 * @param {number} data.amount - The amount to add
 * @param {string} data.description - Description of the credit
 * @returns {boolean} - Success status
 */
exports.addPlatformCredits = async (data, context) => {
  // Check if the request is from an authorized admin
  if (!context.auth || !context.auth.token.admin) {
    throw new Error('Unauthorized');
  }

  const { userId, amount, description } = data;
  
  if (!amount || amount <= 0) {
    throw new Error('Invalid credit amount');
  }
  
  try {
    const admin = require('firebase-admin');
    const db = admin.firestore();
    
    // Get the user's wallet
    const walletRef = db.collection('wallets').doc(userId);
    const walletDoc = await walletRef.get();
    
    // Update or create the wallet
    if (walletDoc.exists) {
      await walletRef.update({
        platformCredits: admin.firestore.FieldValue.increment(amount),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    } else {
      await walletRef.set({
        userId,
        totalEarnings: 0,
        availableBalance: 0,
        pendingBalance: 0,
        platformCredits: amount,
        hasPayoutMethod: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
    
    // Add a transaction record
    await db.collection('transactions').add({
      userId,
      amount,
      type: 'credit',
      status: 'completed',
      description: description || 'Platform credits added',
      createdAt: new Date().toISOString()
    });
    
    return true;
  } catch (error) {
    console.error('Error adding platform credits:', error);
    throw new Error(`Failed to add credits: ${error.message}`);
  }
};

/**
 * Use platform credits for a transaction
 * 
 * @param {Object} data - The transaction data
 * @param {string} data.userId - The user ID
 * @param {number} data.amount - The amount to use
 * @param {string} data.description - Description of the transaction
 * @returns {boolean} - Success status
 */
exports.usePlatformCredits = async (data, context) => {
  // Authenticate the user
  if (!context.auth) {
    throw new Error('Unauthenticated');
  }

  const { userId, amount, description } = data;
  
  if (!amount || amount <= 0) {
    throw new Error('Invalid amount');
  }
  
  try {
    const admin = require('firebase-admin');
    const db = admin.firestore();
    
    // Get the user's wallet
    const walletRef = db.collection('wallets').doc(userId);
    const walletDoc = await walletRef.get();
    
    if (!walletDoc.exists) {
      throw new Error('Wallet not found');
    }
    
    const wallet = walletDoc.data();
    
    // Check if the user has enough credits
    if (wallet.platformCredits < amount) {
      throw new Error('Insufficient platform credits');
    }
    
    // Update the wallet
    await walletRef.update({
      platformCredits: admin.firestore.FieldValue.increment(-amount),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Add a transaction record
    await db.collection('transactions').add({
      userId,
      amount,
      type: 'credit',
      status: 'completed',
      description: description || 'Platform credits used',
      createdAt: new Date().toISOString()
    });
    
    return true;
  } catch (error) {
    console.error('Error using platform credits:', error);
    throw new Error(`Failed to use credits: ${error.message}`);
  }
};

/**
 * Get referral statistics for a user
 * 
 * @param {Object} data - The request data
 * @param {string} data.userId - The user ID
 * @param {string} data.period - The time period ('week', 'month', 'year', 'all')
 * @returns {Object} - Referral statistics
 */
exports.getReferralStats = async (data, context) => {
  // Authenticate the user
  if (!context.auth) {
    throw new Error('Unauthenticated');
  }

  const { userId, period = 'month' } = data;
  
  try {
    const admin = require('firebase-admin');
    const db = admin.firestore();
    
    // Determine the start date based on the period
    let startDate;
    const now = new Date();
    
    if (period === 'week') {
      startDate = new Date();
      startDate.setDate(now.getDate() - 7);
    } else if (period === 'month') {
      startDate = new Date();
      startDate.setMonth(now.getMonth() - 1);
    } else if (period === 'year') {
      startDate = new Date();
      startDate.setFullYear(now.getFullYear() - 1);
    } else {
      // 'all' - no start date filter
      startDate = new Date(0); // January 1, 1970
    }
    
    // Query for referrals within the period
    let referralsQuery = db.collection('referrals').where('userId', '==', userId);
    
    if (period !== 'all') {
      referralsQuery = referralsQuery.where('createdAt', '>=', startDate.toISOString());
    }
    
    const referralsSnapshot = await referralsQuery.get();
    
    // Calculate statistics
    let totalReferrals = referralsSnapshot.size;
    let clickCount = 0;
    let conversionCount = 0;
    let totalEarnings = 0;
    
    referralsSnapshot.forEach(doc => {
      const referral = doc.data();
      clickCount += referral.clickCount || 0;
      conversionCount += referral.conversionCount || 0;
      totalEarnings += referral.earnings || 0;
    });
    
    // Calculate conversion rate
    const conversionRate = clickCount > 0 ? conversionCount / clickCount : 0;
    
    return {
      totalReferrals,
      clickCount,
      conversionCount,
      totalEarnings,
      conversionRate,
      period
    };
  } catch (error) {
    console.error('Error getting referral stats:', error);
    throw new Error(`Failed to get referral statistics: ${error.message}`);
  }
};
