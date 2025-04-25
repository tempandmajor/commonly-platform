
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDoc, 
  query, 
  where,
  getDocs,
  serverTimestamp,
  increment
} from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { db, functions } from "@/lib/firebase";
import { SponsorshipTier, Referral, UserWallet } from "@/types/event";

// Create sponsorship tiers for an event
export const createSponsorshipTiers = async (
  eventId: string,
  tiers: Omit<SponsorshipTier, "id">[]
): Promise<string[]> => {
  try {
    const eventRef = doc(db, "events", eventId);
    const eventDoc = await getDoc(eventRef);
    
    if (!eventDoc.exists()) {
      throw new Error("Event not found");
    }
    
    const tierIds: string[] = [];
    
    // Add each tier with a unique ID
    for (const tier of tiers) {
      const tierRef = await addDoc(collection(db, "sponsorshipTiers"), {
        ...tier,
        eventId,
        spotsTaken: 0,
        createdAt: serverTimestamp()
      });
      
      tierIds.push(tierRef.id);
    }
    
    // Update event with sponsorship tier IDs
    await updateDoc(eventRef, {
      sponsorshipTiers: tierIds,
      updatedAt: serverTimestamp()
    });
    
    return tierIds;
  } catch (error) {
    console.error("Error creating sponsorship tiers:", error);
    throw error;
  }
};

// Get sponsorship tiers for an event
export const getSponsorshipTiers = async (eventId: string): Promise<SponsorshipTier[]> => {
  try {
    const tiersQuery = query(
      collection(db, "sponsorshipTiers"), 
      where("eventId", "==", eventId)
    );
    
    const snapshot = await getDocs(tiersQuery);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SponsorshipTier));
  } catch (error) {
    console.error("Error getting sponsorship tiers:", error);
    throw error;
  }
};

// Purchase a sponsorship
export const purchaseSponsorship = async (
  eventId: string, 
  tierId: string, 
  userId: string,
  paymentMethodId: string,
  referralCode?: string
): Promise<string> => {
  try {
    const processPayment = httpsCallable(functions, 'processSponsorshipPayment');
    const response = await processPayment({
      eventId,
      tierId,
      userId,
      paymentMethodId,
      referralCode
    });
    
    return response.data as string;
  } catch (error) {
    console.error("Error purchasing sponsorship:", error);
    throw error;
  }
};

// Create a referral link for an event
export const createReferralLink = async (userId: string, eventId: string): Promise<string> => {
  try {
    const generateReferral = httpsCallable(functions, 'generateReferralLink');
    const response = await generateReferral({ userId, eventId });
    return response.data as string;
  } catch (error) {
    console.error("Error creating referral link:", error);
    throw error;
  }
};

// Get user's referrals
export const getUserReferrals = async (userId: string): Promise<Referral[]> => {
  try {
    const referralsQuery = query(
      collection(db, "referrals"), 
      where("userId", "==", userId)
    );
    
    const snapshot = await getDocs(referralsQuery);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Referral));
  } catch (error) {
    console.error("Error getting user referrals:", error);
    throw error;
  }
};

// Get user wallet info
export const getUserWallet = async (userId: string): Promise<UserWallet | null> => {
  try {
    const walletRef = doc(db, "wallets", userId);
    const walletDoc = await getDoc(walletRef);
    
    if (!walletDoc.exists()) {
      return null;
    }
    
    return { userId, ...walletDoc.data() } as UserWallet;
  } catch (error) {
    console.error("Error getting user wallet:", error);
    throw error;
  }
};

// Share referral link to social media
export const shareReferralLink = async (
  platform: "facebook" | "twitter" | "linkedin", 
  referralLink: string, 
  eventTitle: string
): Promise<boolean> => {
  try {
    const shareContent = encodeURIComponent(`Check out this event: ${eventTitle}`);
    const encodedLink = encodeURIComponent(referralLink);
    
    let shareUrl = "";
    
    switch (platform) {
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedLink}`;
        break;
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?url=${encodedLink}&text=${shareContent}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedLink}`;
        break;
    }
    
    window.open(shareUrl, '_blank');
    return true;
  } catch (error) {
    console.error("Error sharing referral link:", error);
    throw error;
  }
};
