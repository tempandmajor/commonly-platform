
import { db } from "@/lib/firebase";
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  getDocs, 
  serverTimestamp, 
  updateDoc 
} from "firebase/firestore";
import { ChatMessage } from "@/types/auth";
import { createNotification } from "../notificationService";
import { getUserProfile } from "../userService";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";

/**
 * Send a text message in a chat
 */
export const sendMessage = async (chatId: string, senderId: string, recipientId: string, text: string) => {
  if (!text.trim()) return null;
  
  const messageRef = await addDoc(collection(db, "chats", chatId, "messages"), {
    senderId,
    recipientId,
    text,
    timestamp: serverTimestamp(),
    read: false
  });
  
  // Update the chat's updatedAt timestamp
  await updateDoc(doc(db, "chats", chatId), {
    updatedAt: serverTimestamp(),
    "lastMessage": {
      id: messageRef.id,
      senderId,
      recipientId,
      text,
      timestamp: serverTimestamp(),
      read: false
    }
  });
  
  // Create notification for the recipient
  try {
    const senderDoc = await getUserProfile(senderId);
    const senderName = senderDoc?.displayName || "Someone";
    
    await createNotification(
      recipientId,
      'message',
      'New Message',
      `${senderName} sent you a message: ${text.length > 30 ? text.substring(0, 30) + '...' : text}`,
      { 
        chatId, 
        senderId
      },
      senderDoc?.photoURL || undefined
    );
  } catch (error) {
    console.error("Error creating message notification:", error);
  }
  
  return messageRef.id;
};

/**
 * Get all messages in a chat
 */
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
      imageUrl: data.imageUrl
    };
  });
};

/**
 * Subscribe to messages in a chat
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
        imageUrl: data.imageUrl
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
 * Count unread messages in a chat
 */
export const getUnreadCount = (messages: ChatMessage[], currentUserId: string): number => {
  return messages.filter(msg => msg.recipientId === currentUserId && !msg.read).length;
};

/**
 * Send a message with an image attachment
 */
export const sendMessageWithImage = async (
  chatId: string,
  senderId: string,
  recipientId: string,
  text: string,
  imageUrl: string
): Promise<string | null> => {
  try {
    const messageRef = await addDoc(collection(db, "chats", chatId, "messages"), {
      senderId,
      recipientId,
      text,
      imageUrl,
      timestamp: serverTimestamp(),
      read: false
    });
    
    // Update the chat's updatedAt timestamp
    await updateDoc(doc(db, "chats", chatId), {
      updatedAt: serverTimestamp(),
      "lastMessage": {
        id: messageRef.id,
        senderId,
        recipientId,
        text: imageUrl ? "📷 Image" : text,
        timestamp: serverTimestamp(),
        read: false,
        hasImage: !!imageUrl
      }
    });
    
    // Create notification for the recipient
    try {
      const senderDoc = await getUserProfile(senderId);
      const senderName = senderDoc?.displayName || "Someone";
      
      await createNotification(
        recipientId,
        'message',
        'New Message',
        imageUrl ? `${senderName} sent you an image` : `${senderName} sent you a message`,
        { 
          chatId, 
          senderId 
        },
        senderDoc?.photoURL || undefined
      );
    } catch (error) {
      console.error("Error creating message notification:", error);
    }
    
    return messageRef.id;
  } catch (error) {
    console.error("Error sending message with image:", error);
    return null;
  }
};

// Import missing function and add missing imports
import { doc, getDoc } from "firebase/firestore";
