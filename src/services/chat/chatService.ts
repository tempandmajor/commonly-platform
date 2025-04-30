
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
import { Chat } from "@/types/auth";

/**
 * Create a new chat between two users
 */
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

/**
 * Get all chats for a user
 */
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

/**
 * Subscribe to user chats in real-time
 */
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

/**
 * Get a specific chat by ID
 */
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

/**
 * Find a chat between two specific users
 */
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
