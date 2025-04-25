
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  onSnapshot,
  getDoc, 
  doc,
  serverTimestamp,
  updateDoc,
  arrayUnion,
  setDoc
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ChatMessage, Chat } from "@/types/auth";

// Create a new chat between two users
export const createChat = async (currentUserId: string, otherUserId: string): Promise<string> => {
  try {
    // Check if chat already exists
    const existingChat = await findChatByParticipants(currentUserId, otherUserId);
    if (existingChat) {
      return existingChat.id;
    }
    
    // Create new chat
    const chatRef = await addDoc(collection(db, "chats"), {
      participants: [currentUserId, otherUserId],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    // Add chat reference to both users
    await updateDoc(doc(db, "users", currentUserId), {
      chats: arrayUnion(chatRef.id)
    });
    
    await updateDoc(doc(db, "users", otherUserId), {
      chats: arrayUnion(chatRef.id)
    });
    
    return chatRef.id;
  } catch (error) {
    console.error("Error creating chat:", error);
    throw error;
  }
};

// Find a chat by participants
export const findChatByParticipants = async (userId1: string, userId2: string): Promise<Chat | null> => {
  try {
    const q1 = query(
      collection(db, "chats"),
      where("participants", "array-contains", userId1)
    );
    
    const chatSnap = await getDocs(q1);
    let existingChat: Chat | null = null;
    
    chatSnap.forEach(doc => {
      const chatData = doc.data() as Omit<Chat, "id">;
      if (chatData.participants.includes(userId2)) {
        existingChat = {
          id: doc.id,
          ...chatData
        } as Chat;
      }
    });
    
    return existingChat;
  } catch (error) {
    console.error("Error finding chat:", error);
    throw error;
  }
};

// Send a message in a chat
export const sendMessage = async (chatId: string, senderId: string, recipientId: string, text: string): Promise<string> => {
  try {
    // Add message to messages collection
    const messageRef = await addDoc(collection(db, "messages"), {
      chatId,
      senderId,
      recipientId,
      text,
      timestamp: serverTimestamp(),
      read: false
    });
    
    // Update chat with last message
    await updateDoc(doc(db, "chats", chatId), {
      lastMessage: {
        text,
        timestamp: serverTimestamp(),
        senderId
      },
      updatedAt: serverTimestamp()
    });
    
    return messageRef.id;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

// Get messages for a chat
export const getMessages = async (chatId: string, limit = 50): Promise<ChatMessage[]> => {
  try {
    const q = query(
      collection(db, "messages"),
      where("chatId", "==", chatId),
      orderBy("timestamp", "desc"),
      limit(limit)
    );
    
    const messagesSnap = await getDocs(q);
    const messages: ChatMessage[] = [];
    
    messagesSnap.forEach(doc => {
      messages.push({
        id: doc.id,
        ...doc.data()
      } as ChatMessage);
    });
    
    return messages.reverse();
  } catch (error) {
    console.error("Error getting messages:", error);
    throw error;
  }
};

// Get all chats for a user
export const getUserChats = async (userId: string): Promise<Chat[]> => {
  try {
    const q = query(
      collection(db, "chats"),
      where("participants", "array-contains", userId),
      orderBy("updatedAt", "desc")
    );
    
    const chatsSnap = await getDocs(q);
    const chats: Chat[] = [];
    
    chatsSnap.forEach(doc => {
      chats.push({
        id: doc.id,
        ...doc.data()
      } as Chat);
    });
    
    return chats;
  } catch (error) {
    console.error("Error getting user chats:", error);
    throw error;
  }
};

// Mark messages as read
export const markMessagesAsRead = async (chatId: string, userId: string): Promise<void> => {
  try {
    const q = query(
      collection(db, "messages"),
      where("chatId", "==", chatId),
      where("recipientId", "==", userId),
      where("read", "==", false)
    );
    
    const unreadMessagesSnap = await getDocs(q);
    
    unreadMessagesSnap.forEach(async (message) => {
      await updateDoc(doc(db, "messages", message.id), {
        read: true
      });
    });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    throw error;
  }
};

// Listen to new messages in real time
export const subscribeToMessages = (
  chatId: string, 
  callback: (messages: ChatMessage[]) => void
): (() => void) => {
  const q = query(
    collection(db, "messages"),
    where("chatId", "==", chatId),
    orderBy("timestamp", "asc")
  );
  
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const messages: ChatMessage[] = [];
    querySnapshot.forEach((doc) => {
      messages.push({ id: doc.id, ...doc.data() } as ChatMessage);
    });
    callback(messages);
  });
  
  return unsubscribe;
};
