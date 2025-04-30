
import { db } from "@/lib/firebase";
import { 
  collection, 
  query, 
  where, 
  onSnapshot,
  getDocs
} from "firebase/firestore";

/**
 * Get total number of unread messages for a user across all chats
 */
export const getTotalUnreadMessages = async (userId: string): Promise<number> => {
  try {
    const chatsRef = collection(db, "chats");
    const q = query(
      chatsRef,
      where("participants", "array-contains", userId)
    );
    
    const querySnapshot = await getDocs(q);
    let total = 0;
    
    // For each chat, check for unread messages where the user is the recipient
    for (const chatDoc of querySnapshot.docs) {
      const chatId = chatDoc.id;
      const messagesRef = collection(db, "chats", chatId, "messages");
      const unreadQuery = query(
        messagesRef,
        where("recipientId", "==", userId),
        where("read", "==", false)
      );
      
      const unreadSnapshot = await getDocs(unreadQuery);
      total += unreadSnapshot.size;
    }
    
    return total;
  } catch (error) {
    console.error("Error counting total unread messages:", error);
    return 0;
  }
};

/**
 * Subscribe to total unread messages count for a user
 */
export const subscribeToTotalUnreadMessages = (
  userId: string,
  callback: (count: number) => void
) => {
  const chatsRef = collection(db, "chats");
  const q = query(
    chatsRef,
    where("participants", "array-contains", userId)
  );
  
  // This will listen for changes to any chat the user is part of
  return onSnapshot(q, async (querySnapshot) => {
    try {
      let total = 0;
      
      for (const chatDoc of querySnapshot.docs) {
        const chatId = chatDoc.id;
        const messagesRef = collection(db, "chats", chatId, "messages");
        const unreadQuery = query(
          messagesRef,
          where("recipientId", "==", userId),
          where("read", "==", false)
        );
        
        const unreadSnapshot = await getDocs(unreadQuery);
        total += unreadSnapshot.size;
      }
      
      callback(total);
    } catch (error) {
      console.error("Error in unread messages subscription:", error);
      callback(0);
    }
  });
};
