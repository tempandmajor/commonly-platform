
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
