
import { db } from "@/lib/firebase";
import { doc, setDoc, onSnapshot, serverTimestamp } from "firebase/firestore";

/**
 * Update user's online status in Firestore
 */
export const updateUserPresence = async (userId: string, isOnline: boolean): Promise<void> => {
  try {
    const userStatusRef = doc(db, "userStatus", userId);
    await setDoc(userStatusRef, {
      userId,
      isOnline,
      lastSeen: isOnline ? null : serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.error("Error updating user presence:", error);
  }
};

/**
 * Subscribe to a user's online status
 */
export const subscribeToUserPresence = (
  userId: string,
  callback: (isOnline: boolean, lastSeen: Date | null) => void
) => {
  const userStatusRef = doc(db, "userStatus", userId);
  
  return onSnapshot(userStatusRef, (doc) => {
    if (doc.exists()) {
      const data = doc.data();
      callback(
        data.isOnline || false,
        data.lastSeen ? (data.lastSeen.toDate ? data.lastSeen.toDate() : new Date(data.lastSeen)) : null
      );
    } else {
      callback(false, null);
    }
  });
};

/**
 * Setup presence system for current user
 * This updates the user's status to online and sets up listeners
 * to handle connection state changes
 */
export const setupPresenceSystem = (userId: string): () => void => {
  // Set user as online
  updateUserPresence(userId, true);
  
  // Setup listener for page visibility changes
  const handleVisibilityChange = () => {
    updateUserPresence(userId, document.visibilityState === 'visible');
  };
  
  document.addEventListener('visibilitychange', handleVisibilityChange);
  
  // Setup handler for before unload
  const handleBeforeUnload = () => {
    updateUserPresence(userId, false);
  };
  
  window.addEventListener('beforeunload', handleBeforeUnload);
  
  // Return cleanup function
  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    window.removeEventListener('beforeunload', handleBeforeUnload);
    updateUserPresence(userId, false);
  };
};
