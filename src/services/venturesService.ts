
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  updateDoc,
  addDoc,
  deleteDoc
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { ArtistProfile, VenturesContent } from '@/types/ventures';

// Get all artists by category
export const getArtistsByCategory = async (category: string) => {
  try {
    const artistsQuery = query(
      collection(db, 'artists'),
      where('category', '==', category),
      orderBy('featured', 'desc'),
      orderBy('name', 'asc')
    );
    
    const snapshot = await getDocs(artistsQuery);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as ArtistProfile[];
  } catch (error) {
    console.error("Error fetching artists:", error);
    throw error;
  }
};

// Get featured artists
export const getFeaturedArtists = async (limit = 6) => {
  try {
    const artistsQuery = query(
      collection(db, 'artists'),
      where('featured', '==', true),
      orderBy('name', 'asc'),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(artistsQuery);
    
    return snapshot.docs.slice(0, limit).map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as ArtistProfile[];
  } catch (error) {
    console.error("Error fetching featured artists:", error);
    throw error;
  }
};

// Get ventures content
export const getVenturesContent = async (contentId: string) => {
  try {
    const docRef = doc(db, 'ventures', contentId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as VenturesContent;
    }
    
    return null;
  } catch (error) {
    console.error("Error fetching ventures content:", error);
    throw error;
  }
};

// Admin functions
export const updateVenturesContent = async (contentId: string, content: Partial<VenturesContent>) => {
  try {
    const contentRef = doc(db, 'ventures', contentId);
    await updateDoc(contentRef, {
      ...content,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error("Error updating ventures content:", error);
    throw error;
  }
};

export const addArtist = async (artist: Omit<ArtistProfile, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const docRef = await addDoc(collection(db, 'artists'), {
      ...artist,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding artist:", error);
    throw error;
  }
};

export const updateArtist = async (artistId: string, artist: Partial<ArtistProfile>) => {
  try {
    const artistRef = doc(db, 'artists', artistId);
    await updateDoc(artistRef, {
      ...artist,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error("Error updating artist:", error);
    throw error;
  }
};

export const deleteArtist = async (artistId: string) => {
  try {
    await deleteDoc(doc(db, 'artists', artistId));
    return true;
  } catch (error) {
    console.error("Error deleting artist:", error);
    throw error;
  }
};

export const uploadArtistImage = async (file: File) => {
  try {
    const storageRef = ref(storage, `artists/${file.name}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading artist image:", error);
    throw error;
  }
};

export const uploadContentImage = async (file: File, contentType: string) => {
  try {
    const storageRef = ref(storage, `ventures/${contentType}/${file.name}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading content image:", error);
    throw error;
  }
};

export const deleteImage = async (imageUrl: string) => {
  try {
    const storageRef = ref(storage, imageUrl);
    await deleteObject(storageRef);
    return true;
  } catch (error) {
    console.error("Error deleting image:", error);
    throw error;
  }
};
