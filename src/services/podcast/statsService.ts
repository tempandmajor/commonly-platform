
import { updateDoc, doc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Increment listen count
export const incrementListenCount = async (id: string): Promise<void> => {
  try {
    await updateDoc(doc(db, "podcasts", id), {
      listens: increment(1),
    });
  } catch (error) {
    console.error("Error incrementing listen count:", error);
    throw error;
  }
};
