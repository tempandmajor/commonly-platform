
import { collection, getDocs, addDoc, query, where, orderBy, serverTimestamp, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { PodcastComment } from "@/types/podcast";
import { getUserProfile } from "../userService";

// Get podcast comments
export const getPodcastComments = async (
  podcastId: string
): Promise<PodcastComment[]> => {
  try {
    const commentsRef = collection(db, "podcastComments");
    const q = query(
      commentsRef,
      where("podcastId", "==", podcastId),
      orderBy("createdAt", "desc")
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.().toISOString() || new Date().toISOString(),
      updatedAt: doc.data().updatedAt?.toDate?.().toISOString() || new Date().toISOString(),
    })) as PodcastComment[];
  } catch (error) {
    console.error("Error fetching podcast comments:", error);
    throw error;
  }
};

// Add a comment to a podcast
export const addPodcastComment = async (
  podcastId: string,
  userId: string,
  content: string
): Promise<PodcastComment> => {
  try {
    const user = await getUserProfile(userId);
    
    if (!user) {
      throw new Error("User not found");
    }
    
    const commentRef = collection(db, "podcastComments");
    const comment = {
      podcastId,
      userId,
      userName: user.displayName || "Anonymous",
      userPhotoUrl: user.photoURL,
      content,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      likes: 0,
    };
    
    const docRef = await addDoc(commentRef, comment);
    const timestamp = new Date().toISOString();
    
    return {
      id: docRef.id,
      podcastId,
      userId,
      userName: user.displayName || "Anonymous",
      userPhotoUrl: user.photoURL,
      content,
      createdAt: timestamp,
      updatedAt: timestamp,
      likes: 0
    };
  } catch (error) {
    console.error("Error adding podcast comment:", error);
    throw error;
  }
};
