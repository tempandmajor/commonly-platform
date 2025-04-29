
import { collection, doc, getDoc, addDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { PodcastSession } from "@/types/podcast";

// Create podcast session (for recording)
export const createPodcastSession = async (
  session: Omit<PodcastSession, "id" | "createdAt">
): Promise<string> => {
  try {
    const sessionRef = collection(db, "podcastSessions");
    const sessionData = {
      ...session,
      createdAt: serverTimestamp(),
    };
    
    const docRef = await addDoc(sessionRef, sessionData);
    return docRef.id;
  } catch (error) {
    console.error("Error creating podcast session:", error);
    throw error;
  }
};

// Get podcast session by ID
export const getPodcastSession = async (
  sessionId: string
): Promise<PodcastSession | null> => {
  try {
    const sessionDoc = await getDoc(doc(db, "podcastSessions", sessionId));
    
    if (!sessionDoc.exists()) {
      return null;
    }
    
    return {
      id: sessionDoc.id,
      ...sessionDoc.data(),
    } as PodcastSession;
  } catch (error) {
    console.error("Error fetching podcast session:", error);
    throw error;
  }
};

// Update podcast session
export const updatePodcastSession = async (
  sessionId: string,
  updates: Partial<PodcastSession>
): Promise<void> => {
  try {
    await updateDoc(doc(db, "podcastSessions", sessionId), updates);
  } catch (error) {
    console.error("Error updating podcast session:", error);
    throw error;
  }
};
