
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Chat, UserData } from "@/types/auth";

/**
 * Get the other participant in a chat
 */
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
