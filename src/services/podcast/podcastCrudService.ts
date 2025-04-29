
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  addDoc,
  updateDoc,
  serverTimestamp,
  deleteDoc,
  startAfter,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { Podcast } from "@/types/podcast";

// Fetch podcasts with pagination and filtering
export const getPodcasts = async (
  pageSize = 10,
  lastDoc?: any,
  category?: string,
  searchTerm?: string
): Promise<{ podcasts: Podcast[]; lastDoc: any }> => {
  try {
    let podcastsQuery = query(
      collection(db, "podcasts"),
      where("visibility", "==", "public"),
      orderBy("createdAt", "desc")
    );

    if (category) {
      podcastsQuery = query(
        podcastsQuery,
        where("category", "==", category)
      );
    }

    if (lastDoc) {
      podcastsQuery = query(podcastsQuery, startAfter(lastDoc));
    }

    podcastsQuery = query(podcastsQuery, limit(pageSize));
    const snapshot = await getDocs(podcastsQuery);

    if (snapshot.empty) {
      return { podcasts: [], lastDoc: null };
    }

    const podcasts = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Podcast[];

    // Filter by search term if provided
    const filteredPodcasts = searchTerm
      ? podcasts.filter((podcast) =>
          podcast.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          podcast.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : podcasts;

    return {
      podcasts: filteredPodcasts,
      lastDoc: snapshot.docs[snapshot.docs.length - 1],
    };
  } catch (error) {
    console.error("Error fetching podcasts:", error);
    throw error;
  }
};

// Fetch a single podcast by ID
export const getPodcast = async (id: string): Promise<Podcast | null> => {
  try {
    const podcastDoc = await getDoc(doc(db, "podcasts", id));
    
    if (!podcastDoc.exists()) {
      return null;
    }
    
    return {
      id: podcastDoc.id,
      ...podcastDoc.data(),
    } as Podcast;
  } catch (error) {
    console.error("Error fetching podcast:", error);
    throw error;
  }
};

// Get podcasts by creator ID
export const getPodcastsByCreator = async (
  creatorId: string
): Promise<Podcast[]> => {
  try {
    const podcastsRef = collection(db, "podcasts");
    const q = query(
      podcastsRef,
      where("creatorId", "==", creatorId),
      orderBy("createdAt", "desc")
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Podcast[];
  } catch (error) {
    console.error("Error fetching creator podcasts:", error);
    throw error;
  }
};

// Upload a new podcast
export const createPodcast = async (
  podcastData: Omit<Podcast, "id" | "createdAt" | "updatedAt" | "listens">,
  audioFile?: File,
  videoFile?: File,
  thumbnailFile?: File
): Promise<string> => {
  try {
    let audioUrl;
    let videoUrl;
    let thumbnailUrl;

    // Upload thumbnail if provided
    if (thumbnailFile) {
      const thumbnailRef = ref(
        storage,
        `podcasts/thumbnails/${Date.now()}_${thumbnailFile.name}`
      );
      await uploadBytes(thumbnailRef, thumbnailFile);
      thumbnailUrl = await getDownloadURL(thumbnailRef);
    }

    // Upload audio if provided
    if (audioFile) {
      const audioRef = ref(
        storage,
        `podcasts/audio/${Date.now()}_${audioFile.name}`
      );
      await uploadBytes(audioRef, audioFile);
      audioUrl = await getDownloadURL(audioRef);
    }

    // Upload video if provided
    if (videoFile) {
      const videoRef = ref(
        storage,
        `podcasts/video/${Date.now()}_${videoFile.name}`
      );
      await uploadBytes(videoRef, videoFile);
      videoUrl = await getDownloadURL(videoRef);
    }

    // Create podcast document
    const podcastRef = collection(db, "podcasts");
    const docRef = await addDoc(podcastRef, {
      ...podcastData,
      audioUrl,
      videoUrl,
      thumbnailUrl,
      listens: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return docRef.id;
  } catch (error) {
    console.error("Error creating podcast:", error);
    throw error;
  }
};

// Update an existing podcast
export const updatePodcast = async (
  id: string,
  podcastData: Partial<Podcast>,
  thumbnailFile?: File
): Promise<void> => {
  try {
    const updateData = { ...podcastData, updatedAt: serverTimestamp() };
    
    // Upload new thumbnail if provided
    if (thumbnailFile) {
      const thumbnailRef = ref(
        storage,
        `podcasts/thumbnails/${Date.now()}_${thumbnailFile.name}`
      );
      await uploadBytes(thumbnailRef, thumbnailFile);
      updateData.thumbnailUrl = await getDownloadURL(thumbnailRef);
    }

    await updateDoc(doc(db, "podcasts", id), updateData);
  } catch (error) {
    console.error("Error updating podcast:", error);
    throw error;
  }
};

// Delete a podcast
export const deletePodcast = async (id: string): Promise<void> => {
  try {
    const podcastDoc = await getDoc(doc(db, "podcasts", id));
    
    if (podcastDoc.exists()) {
      const podcastData = podcastDoc.data() as Podcast;
      
      // Delete audio file if it exists
      if (podcastData.audioUrl) {
        try {
          const audioRef = ref(storage, podcastData.audioUrl);
          await deleteObject(audioRef);
        } catch (error) {
          console.error("Error deleting audio file:", error);
        }
      }
      
      // Delete video file if it exists
      if (podcastData.videoUrl) {
        try {
          const videoRef = ref(storage, podcastData.videoUrl);
          await deleteObject(videoRef);
        } catch (error) {
          console.error("Error deleting video file:", error);
        }
      }
      
      // Delete thumbnail if it exists
      if (podcastData.thumbnailUrl) {
        try {
          const thumbnailRef = ref(storage, podcastData.thumbnailUrl);
          await deleteObject(thumbnailRef);
        } catch (error) {
          console.error("Error deleting thumbnail:", error);
        }
      }
    }
    
    // Delete podcast document
    await deleteDoc(doc(db, "podcasts", id));
  } catch (error) {
    console.error("Error deleting podcast:", error);
    throw error;
  }
};
