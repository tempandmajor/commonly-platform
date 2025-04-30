
import { db } from "@/lib/firebase";
import { 
  collection, 
  addDoc, 
  doc,
  updateDoc,
  serverTimestamp,
  getDoc
} from "firebase/firestore";
import { createNotification } from "@/services/notificationService";

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
  await createMessageNotification(senderId, recipientId, text, chatId);
  
  return messageRef.id;
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
    const notificationText = imageUrl ? "sent you an image" : text;
    await createMessageNotification(senderId, recipientId, notificationText, chatId);
    
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
    const notificationText = voiceUrl ? "sent you a voice message" : text;
    await createMessageNotification(senderId, recipientId, notificationText, chatId);
    
    return messageRef.id;
  } catch (error) {
    console.error("Error sending message with voice:", error);
    return null;
  }
};

/**
 * Helper function to create notifications for messages
 */
const createMessageNotification = async (
  senderId: string, 
  recipientId: string, 
  text: string,
  chatId: string
) => {
  try {
    const senderDoc = await getDoc(doc(db, "users", senderId));
    const senderData = senderDoc.data();
    const senderName = senderData?.displayName || "Someone";
    
    let notificationText = text;
    if (!text.includes("sent you")) {
      notificationText = `${senderName} sent you a message: ${text.length > 30 ? text.substring(0, 30) + '...' : text}`;
    } else {
      notificationText = `${senderName} ${text}`;
    }
    
    await createNotification(
      recipientId,
      'message',
      'New Message',
      notificationText,
      { 
        chatId, 
        senderId 
      },
      senderData?.photoURL || undefined
    );
  } catch (error) {
    console.error("Error creating message notification:", error);
  }
};
