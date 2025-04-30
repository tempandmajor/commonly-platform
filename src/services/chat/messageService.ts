
import { db } from "@/lib/firebase";
import { 
  collection, 
  addDoc, 
  doc,
  updateDoc,
  serverTimestamp,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot
} from "firebase/firestore";
import { createNotification } from "@/services/notificationService";
import { ChatMessage } from "@/types/auth";

export const getMessages = async (chatId: string): Promise<ChatMessage[]> => {
  const messagesRef = collection(db, "chats", chatId, "messages");
  const q = query(messagesRef, orderBy("timestamp", "asc"));
  
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      chatId,
      senderId: data.senderId,
      recipientId: data.recipientId,
      text: data.text,
      timestamp: data.timestamp,
      read: data.read,
      imageUrl: data.imageUrl,
      voiceUrl: data.voiceUrl
    };
  });
};

/**
 * Subscribe to messages in real-time
 */
export const subscribeToMessages = (
  chatId: string, 
  callback: (messages: ChatMessage[]) => void
) => {
  const messagesRef = collection(db, "chats", chatId, "messages");
  const q = query(messagesRef, orderBy("timestamp", "asc"));
  
  return onSnapshot(q, (querySnapshot) => {
    const messages = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        chatId,
        senderId: data.senderId,
        recipientId: data.recipientId,
        text: data.text,
        timestamp: data.timestamp,
        read: data.read,
        imageUrl: data.imageUrl,
        voiceUrl: data.voiceUrl
      };
    });
    
    callback(messages);
  });
};

/**
 * Mark messages as read
 */
export const markMessagesAsRead = async (chatId: string, currentUserId: string) => {
  // Get all unread messages sent to the current user
  const messagesRef = collection(db, "chats", chatId, "messages");
  const q = query(
    messagesRef,
    where("recipientId", "==", currentUserId),
    where("read", "==", false)
  );
  
  const querySnapshot = await getDocs(q);
  
  // Mark each message as read
  const updatePromises = querySnapshot.docs.map(doc => 
    updateDoc(doc.ref, { read: true })
  );
  
  await Promise.all(updatePromises);
  
  // Check if the last message needs to be updated as well
  const chatDoc = await getDoc(doc(db, "chats", chatId));
  const chatData = chatDoc.data();
  
  if (chatData && chatData.lastMessage && 
      chatData.lastMessage.recipientId === currentUserId && 
      !chatData.lastMessage.read) {
    await updateDoc(doc(db, "chats", chatId), {
      "lastMessage.read": true
    });
  }
};

/**
 * Update typing status for a user in a chat
 */
export const updateTypingStatus = async (
  chatId: string, 
  userId: string, 
  isTyping: boolean
): Promise<void> => {
  try {
    // Store typing status in a separate collection for better performance
    const typingRef = doc(db, "chats", chatId, "typing", userId);
    
    try {
      await updateDoc(typingRef, {
        userId,
        isTyping,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      // If document doesn't exist, create it
      if (error.code === 'not-found') {
        await addDoc(collection(db, "chats", chatId, "typing"), {
          userId,
          isTyping,
          timestamp: serverTimestamp()
        });
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error("Error updating typing status:", error);
  }
};
