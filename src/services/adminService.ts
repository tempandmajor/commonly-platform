
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  updateDoc, 
  deleteDoc, 
  orderBy, 
  limit, 
  startAfter,
  Timestamp,
  addDoc,
  setDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { UserData } from '@/types/auth';

// User management
export const getUsers = async (lastVisible = null, limitCount = 20) => {
  try {
    let usersQuery;
    
    if (lastVisible) {
      usersQuery = query(
        collection(db, 'users'),
        orderBy('createdAt', 'desc'),
        startAfter(lastVisible),
        limit(limitCount)
      );
    } else {
      usersQuery = query(
        collection(db, 'users'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
    }
    
    const snapshot = await getDocs(usersQuery);
    const lastDoc = snapshot.docs[snapshot.docs.length - 1];
    
    const users = snapshot.docs.map(doc => ({
      ...doc.data()
    } as UserData));
    
    return { users, lastVisible: lastDoc };
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

export const searchUsers = async (searchTerm: string, limitCount = 20) => {
  try {
    const usersQuery = query(
      collection(db, 'users'),
      where('displayName', '>=', searchTerm),
      where('displayName', '<=', searchTerm + '\uf8ff'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(usersQuery);
    
    return snapshot.docs.map(doc => ({
      ...doc.data()
    } as UserData));
  } catch (error) {
    console.error("Error searching users:", error);
    throw error;
  }
};

export const updateUser = async (userId: string, data: Partial<UserData>) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};

export const setAdminStatus = async (userId: string, isAdmin: boolean) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      isAdmin,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error("Error setting admin status:", error);
    throw error;
  }
};

// Event management
export const getAdminEvents = async (lastVisible = null, limitCount = 20) => {
  try {
    let eventsQuery;
    
    if (lastVisible) {
      eventsQuery = query(
        collection(db, 'events'),
        orderBy('createdAt', 'desc'),
        startAfter(lastVisible),
        limit(limitCount)
      );
    } else {
      eventsQuery = query(
        collection(db, 'events'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
    }
    
    const snapshot = await getDocs(eventsQuery);
    const lastDoc = snapshot.docs[snapshot.docs.length - 1];
    
    const events = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return { events, lastVisible: lastDoc };
  } catch (error) {
    console.error("Error fetching events:", error);
    throw error;
  }
};

// Venue management
export const getAdminVenues = async (lastVisible = null, limitCount = 20) => {
  try {
    let venuesQuery;
    
    if (lastVisible) {
      venuesQuery = query(
        collection(db, 'venues'),
        orderBy('createdAt', 'desc'),
        startAfter(lastVisible),
        limit(limitCount)
      );
    } else {
      venuesQuery = query(
        collection(db, 'venues'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
    }
    
    const snapshot = await getDocs(venuesQuery);
    const lastDoc = snapshot.docs[snapshot.docs.length - 1];
    
    const venues = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return { venues, lastVisible: lastDoc };
  } catch (error) {
    console.error("Error fetching venues:", error);
    throw error;
  }
};

export const updateVenueVerification = async (venueId: string, isVerified: boolean) => {
  try {
    const venueRef = doc(db, 'venues', venueId);
    await updateDoc(venueRef, {
      isVerified,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error("Error updating venue verification:", error);
    throw error;
  }
};

// Platform credits
export const distributeCredits = async (userId: string, amount: number, description: string) => {
  try {
    // Add transaction
    await addDoc(collection(db, 'transactions'), {
      userId,
      amount,
      type: 'credit',
      status: 'completed',
      description,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    // Update user's wallet
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const wallet = userData.wallet || {};
      
      await updateDoc(doc(db, 'users', userId), {
        wallet: {
          ...wallet,
          platformCredits: (wallet.platformCredits || 0) + amount,
          updatedAt: serverTimestamp(),
        }
      });
    }
    
    return true;
  } catch (error) {
    console.error("Error distributing credits:", error);
    throw error;
  }
};

export const createCreditsCampaign = async (campaignData: any) => {
  try {
    const docRef = await addDoc(collection(db, 'creditsCampaigns'), {
      ...campaignData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      active: true,
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating credits campaign:", error);
    throw error;
  }
};

// Analytics dashboard
export const getDashboardMetrics = async () => {
  try {
    // Users count
    const usersQuery = query(collection(db, 'users'));
    const usersSnapshot = await getDocs(usersQuery);
    const totalUsers = usersSnapshot.size;
    
    // Active events count
    const now = new Date();
    const activeEventsQuery = query(
      collection(db, 'events'),
      where('date', '>=', now.toISOString()),
      where('published', '==', true)
    );
    const activeEventsSnapshot = await getDocs(activeEventsQuery);
    const activeEvents = activeEventsSnapshot.size;
    
    // Past events count
    const pastEventsQuery = query(
      collection(db, 'events'),
      where('date', '<', now.toISOString()),
      where('published', '==', true)
    );
    const pastEventsSnapshot = await getDocs(pastEventsQuery);
    const pastEvents = pastEventsSnapshot.size;
    
    // Venues count
    const venuesQuery = query(collection(db, 'venues'));
    const venuesSnapshot = await getDocs(venuesQuery);
    const venues = venuesSnapshot.size;
    
    return {
      totalUsers,
      activeEvents,
      pastEvents,
      venues,
    };
  } catch (error) {
    console.error("Error fetching dashboard metrics:", error);
    throw error;
  }
};

// Content management
export const updateContentPage = async (pageId: string, content: any) => {
  try {
    await setDoc(doc(db, 'content', pageId), {
      ...content,
      updatedAt: serverTimestamp()
    }, { merge: true });
    return true;
  } catch (error) {
    console.error("Error updating content:", error);
    throw error;
  }
};

// Ventures content
export const addArtistProfile = async (profile: any) => {
  try {
    const docRef = await addDoc(collection(db, 'artists'), {
      ...profile,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding artist profile:", error);
    throw error;
  }
};

export const uploadArtistImage = async (artistId: string, file: File) => {
  try {
    const storageRef = ref(storage, `artists/${artistId}/${file.name}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    
    await updateDoc(doc(db, 'artists', artistId), {
      imageUrl: downloadURL,
      updatedAt: serverTimestamp()
    });
    
    return downloadURL;
  } catch (error) {
    console.error("Error uploading artist image:", error);
    throw error;
  }
};
