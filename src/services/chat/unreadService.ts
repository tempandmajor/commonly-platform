
import { db } from "@/lib/firebase";
import { 
  collection, 
  query, 
  where, 
  getDocs,
  writeBatch,
  doc,
  updateDoc,
  onSnapshot
} from "firebase/firestore";
import { ChatMessage } from "@/types/auth";

/**
 * Get unread count for a specific chat
 */
export const getUnreadCount = (messages: ChatMessage[], currentUserId: string): number => {
  return messages.filter(msg => msg.recipientId === currentUserId && !msg.read).length;
};

/**
 * Mark all unread messages in a chat as read
 */
export const markAllAsRead = async (chatId: string, currentUserId: string): Promise<void> => {
  // Get all unread messages where the current user is the recipient
  const messagesRef = collection(db, "chats", chatId, "messages");
  const q = query(
    messagesRef,
    where("recipientId", "==", currentUserId),
    where("read", "==", false)
  );
  
  const querySnapshot = await getDocs(q);
  
  // If there are no unread messages, return
  if (querySnapshot.empty) {
    return;
  }
  
  // Use a batch to update all messages as read
  const batch = writeBatch(db);
  
  querySnapshot.docs.forEach(doc => {
    batch.update(doc.ref, { read: true });
  });
  
  await batch.commit();
};

/**
 * Get total number of unread messages across all chats
 */
export const getTotalUnreadCount = async (userId: string): Promise<number> => {
  try {
    const chatsRef = collection(db, "chats");
    const q = query(
      chatsRef,
      where("participants", "array-contains", userId)
    );
    
    const querySnapshot = await getDocs(q);
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
    
    return total;
  } catch (error) {
    console.error("Error counting total unread messages:", error);
    return 0;
  }
};

/**
 * Update the read status of a message
 */
export const updateMessageReadStatus = async (chatId: string, messageId: string, isRead: boolean): Promise<void> => {
  const messageRef = doc(db, "chats", chatId, "messages", messageId);
  await updateDoc(messageRef, { read: isRead });
};
