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
  orderBy
} from "firebase/firestore";
import { createNotification } from "@/services/notificationService";
import { ChatMessage } from "@/types/auth";
import { markAllAsRead } from "./unreadService";

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
    const senderDoc = await getDoc(doc(db, "users", senderId));
    const senderData = senderDoc.data();
    const senderName = senderData?.displayName || "Someone";
    
    await createNotification(
      recipientId,
      'message',
      'New Message',
      `${senderName} sent you a message: ${text.length > 30 ? text.substring(0, 30) + '...' : text}`,
      { 
        chatId, 
        senderId
      },
      senderData?.photoURL || undefined
    );
  } catch (error) {
    console.error("Error creating message notification:", error);
  }
  
  return messageRef.id;
};

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
      read: data.read
    };
  });
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
      const senderDoc = await getDoc(doc(db, "users", senderId));
      const senderData = senderDoc.data();
      const senderName = senderData?.displayName || "Someone";
      
      await createNotification(
        recipientId,
        'message',
        'New Message',
        imageUrl ? `${senderName} sent you an image` : `${senderName} sent you a message`,
        { 
          chatId, 
          senderId 
        },
        senderData?.photoURL || undefined
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

/**
 * Send a message with a voice recording
 */
export const sendMessageWithVoice = async (
  chatId: string,
  senderId: string,
  recipientId: string,
  text: string,
  voiceUrl: string
): Promise<string | null> => {
  try {
    const messageRef = await addDoc(collection(db, "chats", chatId, "messages"), {
      senderId,
      recipientId,
      text,
      voiceUrl,
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
        text: voiceUrl ? "🎤 Voice message" : text,
        timestamp: serverTimestamp(),
        read: false,
        hasVoice: !!voiceUrl
      }
    });
    
    // Create notification for the recipient
    try {
      const senderDoc = await getDoc(doc(db, "users", senderId));
      const senderData = senderDoc.data();
      const senderName = senderData?.displayName || "Someone";
      
      await createNotification(
        recipientId,
        'message',
        'New Message',
        voiceUrl ? `${senderName} sent you a voice message` : `${senderName} sent you a message`,
        { 
          chatId, 
          senderId 
        },
        senderData?.photoURL || undefined
      );
    } catch (error) {
      console.error("Error creating message notification:", error);
    }
    
    return messageRef.id;
  } catch (error) {
    console.error("Error sending message with voice:", error);
    return null;
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
    
    await updateDoc(typingRef, {
      isTyping,
      timestamp: serverTimestamp()
    }).catch(async (error) => {
      // If document doesn't exist, create it
      if (error.code === 'not-found') {
        await updateDoc(typingRef, {
          userId,
          isTyping,
          timestamp: serverTimestamp()
        });
      } else {
        throw error;
      }
    });
  } catch (error) {
    console.error("Error updating typing status:", error);
  }
};
