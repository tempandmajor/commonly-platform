import { db } from "@/lib/firebase";
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  doc, 
  getDoc, 
  getDocs, 
  serverTimestamp, 
  updateDoc
} from "firebase/firestore";
import { Chat, ChatMessage, UserData } from "@/types/auth";
import { createNotification } from "./notificationService";

export const createChat = async (currentUserId: string, otherUserId: string) => {
  // Check if a chat already exists between these two users
  const existingChat = await getChatByParticipants(currentUserId, otherUserId);
  
  if (existingChat) {
    return existingChat.id;
  }
  
  // If no chat exists, create a new one
  const chatRef = await addDoc(collection(db, "chats"), {
    participants: [currentUserId, otherUserId],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  
  return chatRef.id;
};

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

export const getUserChats = async (userId: string): Promise<Chat[]> => {
  const chatsRef = collection(db, "chats");
  const q = query(
    chatsRef,
    where("participants", "array-contains", userId),
    orderBy("updatedAt", "desc")
  );
  
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      participants: data.participants,
      lastMessage: data.lastMessage,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    };
  });
};

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
        read: data.read
      };
    });
    
    callback(messages);
  });
};

export const subscribeToChats = (
  userId: string, 
  callback: (chats: Chat[]) => void
) => {
  const chatsRef = collection(db, "chats");
  const q = query(
    chatsRef,
    where("participants", "array-contains", userId),
    orderBy("updatedAt", "desc")
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const chats = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        participants: data.participants,
        lastMessage: data.lastMessage,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      };
    });
    
    callback(chats);
  });
};

export const getChatById = async (chatId: string): Promise<Chat | null> => {
  const chatDoc = await getDoc(doc(db, "chats", chatId));
  
  if (!chatDoc.exists()) {
    return null;
  }
  
  const data = chatDoc.data();
  return {
    id: chatDoc.id,
    participants: data.participants,
    lastMessage: data.lastMessage,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt
  };
};

export const getChatByParticipants = async (userId1: string, userId2: string): Promise<Chat | null> => {
  const chatsRef = collection(db, "chats");
  const q1 = query(
    chatsRef,
    where("participants", "array-contains", userId1)
  );
  
  const querySnapshot = await getDocs(q1);
  const chat = querySnapshot.docs.find(doc => {
    const data = doc.data();
    return data.participants.includes(userId2);
  });
  
  if (!chat) {
    return null;
  }
  
  const data = chat.data();
  return {
    id: chat.id,
    participants: data.participants,
    lastMessage: data.lastMessage,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt
  };
};

export const getOtherParticipant = async (chat: Chat, currentUserId: string): Promise<UserData | null> => {
  const otherUserId = chat.participants.find(id => id !== currentUserId);
  
  if (!otherUserId) {
    return null;
  }
  
  const userDoc = await getDoc(doc(db, "users", otherUserId));
  
  if (!userDoc.exists()) {
    return null;
  }
  
  return {
    uid: userDoc.id,
    ...userDoc.data()
  } as UserData;
};

export const getUnreadCount = (messages: ChatMessage[], currentUserId: string): number => {
  return messages.filter(msg => msg.recipientId === currentUserId && !msg.read).length;
};

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
