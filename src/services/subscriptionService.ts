
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp,
  query,
  collection,
  where,
  getDocs
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Subscription, UserData } from "@/types/auth";

// Check if user is eligible for Pro subscription (1000+ followers)
export const checkSubscriptionEligibility = async (userId: string): Promise<boolean> => {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    
    if (userDoc.exists()) {
      const userData = userDoc.data() as UserData;
      return (userData.followerCount || 0) >= 1000;
    }
    
    return false;
  } catch (error) {
    console.error("Error checking subscription eligibility:", error);
    throw error;
  }
};

// Get user subscription status
export const getUserSubscription = async (userId: string): Promise<Subscription | null> => {
  try {
    const q = query(
      collection(db, "subscriptions"),
      where("userId", "==", userId),
      where("status", "==", "active")
    );
    
    const subSnap = await getDocs(q);
    
    if (!subSnap.empty) {
      const doc = subSnap.docs[0];
      return { id: doc.id, ...doc.data() } as Subscription;
    }
    
    return null;
  } catch (error) {
    console.error("Error getting user subscription:", error);
    throw error;
  }
};

// Create a new subscription record
export const createSubscription = async (
  userId: string,
  stripeSubscriptionId: string,
  currentPeriodEnd: Date
): Promise<string> => {
  try {
    const subscriptionRef = doc(collection(db, "subscriptions"));
    
    await setDoc(subscriptionRef, {
      userId,
      stripeSubscriptionId,
      status: "active",
      plan: "pro",
      currentPeriodEnd: currentPeriodEnd,
      createdAt: serverTimestamp()
    });
    
    // Update user's pro status
    await updateDoc(doc(db, "users", userId), {
      isPro: true
    });
    
    return subscriptionRef.id;
  } catch (error) {
    console.error("Error creating subscription:", error);
    throw error;
  }
};

// Update subscription status
export const updateSubscriptionStatus = async (
  subscriptionId: string,
  status: "active" | "canceled" | "past_due",
  currentPeriodEnd?: Date
): Promise<void> => {
  try {
    const updateData: any = { status };
    
    if (currentPeriodEnd) {
      updateData.currentPeriodEnd = currentPeriodEnd;
    }
    
    await updateDoc(doc(db, "subscriptions", subscriptionId), updateData);
    
    // If canceling, update user's pro status
    if (status === "canceled") {
      const subDoc = await getDoc(doc(db, "subscriptions", subscriptionId));
      if (subDoc.exists()) {
        const subData = subDoc.data() as Subscription;
        await updateDoc(doc(db, "users", subData.userId), {
          isPro: false
        });
      }
    }
  } catch (error) {
    console.error("Error updating subscription status:", error);
    throw error;
  }
};

// Check if user has pro subscription
export const isUserPro = async (userId: string): Promise<boolean> => {
  const subscription = await getUserSubscription(userId);
  return !!subscription && subscription.status === 'active';
};
