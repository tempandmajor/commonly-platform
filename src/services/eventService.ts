import { db } from "@/lib/firebase";
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, query, where, orderBy, limit } from "firebase/firestore";
import { Event } from "@/types/event";

// Function to get user's events
export const getEventsByUser = async (userId: string): Promise<Event[]> => {
  try {
    const eventsRef = collection(db, "events");
    const q = query(
      eventsRef,
      where("creatorId", "==", userId),
      orderBy("date", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Event[];
  } catch (error) {
    console.error("Error fetching user events:", error);
    throw error;
  }
};

// This is just a placeholder to avoid TypeScript errors
// The actual implementation would be in the real eventService.ts file
export const getPublishedEvents = async () => {
  return [];
};
