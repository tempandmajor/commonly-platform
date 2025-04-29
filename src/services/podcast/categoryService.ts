
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { PodcastCategory } from "@/types/podcast";

// Fetch all podcast categories
export const getPodcastCategories = async (): Promise<PodcastCategory[]> => {
  try {
    const categoriesRef = collection(db, "podcastCategories");
    const snapshot = await getDocs(categoriesRef);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as PodcastCategory[];
  } catch (error) {
    console.error("Error fetching podcast categories:", error);
    throw error;
  }
};
