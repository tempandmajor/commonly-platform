
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  Timestamp,
  serverTimestamp
} from "firebase/firestore";
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { Venue, VenuePhoto, VenueReport } from "@/types/venue";

const VENUES_COLLECTION = 'venues';
const BOOKINGS_COLLECTION = 'venueBookings';
const REPORTS_COLLECTION = 'venueReports';

// Venue CRUD operations
export const getVenues = async (lastVisible = null, limitCount = 12) => {
  try {
    let venuesQuery;
    
    if (lastVisible) {
      venuesQuery = query(
        collection(db, VENUES_COLLECTION),
        where("isActive", "==", true),
        orderBy("createdAt", "desc"),
        startAfter(lastVisible),
        limit(limitCount)
      );
    } else {
      venuesQuery = query(
        collection(db, VENUES_COLLECTION),
        where("isActive", "==", true),
        orderBy("createdAt", "desc"),
        limit(limitCount)
      );
    }
    
    const snapshot = await getDocs(venuesQuery);
    const lastVisibleDoc = snapshot.docs[snapshot.docs.length - 1];
    
    const venues = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Venue));
    
    return { venues, lastVisible: lastVisibleDoc };
  } catch (error) {
    console.error("Error fetching venues:", error);
    throw error;
  }
};

export const getVenuesByOwner = async (ownerId: string) => {
  try {
    const venuesQuery = query(
      collection(db, VENUES_COLLECTION),
      where("ownerId", "==", ownerId),
      orderBy("createdAt", "desc")
    );
    
    const snapshot = await getDocs(venuesQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Venue));
  } catch (error) {
    console.error("Error fetching owner venues:", error);
    throw error;
  }
};

export const getVenue = async (id: string) => {
  try {
    const venueDoc = await getDoc(doc(db, VENUES_COLLECTION, id));
    
    if (!venueDoc.exists()) {
      throw new Error("Venue not found");
    }
    
    return {
      id: venueDoc.id,
      ...venueDoc.data() as object
    } as Venue;
  } catch (error) {
    console.error("Error fetching venue:", error);
    throw error;
  }
};

export const createVenue = async (venue: Omit<Venue, "id" | "createdAt" | "updatedAt">) => {
  try {
    const newVenue = {
      ...venue,
      isVerified: false, // Requires admin verification
      isActive: false, // Initially inactive until verified
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, VENUES_COLLECTION), newVenue);
    return docRef.id;
  } catch (error) {
    console.error("Error creating venue:", error);
    throw error;
  }
};

export const updateVenue = async (id: string, data: Partial<Venue>) => {
  try {
    const updateData = {
      ...data,
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(doc(db, VENUES_COLLECTION, id), updateData);
    return true;
  } catch (error) {
    console.error("Error updating venue:", error);
    throw error;
  }
};

export const deleteVenue = async (id: string) => {
  try {
    await deleteDoc(doc(db, VENUES_COLLECTION, id));
    return true;
  } catch (error) {
    console.error("Error deleting venue:", error);
    throw error;
  }
};

// Photo upload functions
export const uploadVenuePhoto = async (venueId: string, file: File, caption?: string): Promise<VenuePhoto> => {
  try {
    // Create a file path in Firebase Storage
    const fileExtension = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    const filePath = `venues/${venueId}/photos/${fileName}.${fileExtension}`;
    const photoRef = ref(storage, filePath);
    
    // Upload the file
    await uploadBytes(photoRef, file);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(photoRef);
    
    // Create a photo object
    const photoId = Math.random().toString(36).substring(2, 15);
    const photo: VenuePhoto = {
      id: photoId,
      url: downloadURL,
      caption: caption || "",
      isPrimary: false,
      storagePath: filePath
    };
    
    // If this is the first photo, make it the primary
    const venueDoc = await getDoc(doc(db, VENUES_COLLECTION, venueId));
    const venueData = venueDoc.data() as Venue;
    
    if (!venueData.photos || venueData.photos.length === 0) {
      photo.isPrimary = true;
    }
    
    // Add the photo to the venue document
    const photos = venueData.photos || [];
    await updateDoc(doc(db, VENUES_COLLECTION, venueId), {
      photos: [...photos, photo],
      updatedAt: serverTimestamp()
    });
    
    return photo;
  } catch (error) {
    console.error("Error uploading venue photo:", error);
    throw error;
  }
};

export const deleteVenuePhoto = async (venueId: string, photoId: string) => {
  try {
    // Get the venue document
    const venueDoc = await getDoc(doc(db, VENUES_COLLECTION, venueId));
    const venueData = venueDoc.data() as Venue;
    
    // Find the photo to delete
    const photoToDelete = venueData.photos.find(photo => photo.id === photoId);
    
    if (!photoToDelete) {
      throw new Error("Photo not found");
    }
    
    // Delete from Firebase Storage if storagePath exists
    if (photoToDelete.storagePath) {
      await deleteObject(ref(storage, photoToDelete.storagePath));
    }
    
    // Remove the photo from the venue document
    const updatedPhotos = venueData.photos.filter(photo => photo.id !== photoId);
    
    // If the deleted photo was primary, set a new primary photo
    if (photoToDelete.isPrimary && updatedPhotos.length > 0) {
      updatedPhotos[0].isPrimary = true;
    }
    
    await updateDoc(doc(db, VENUES_COLLECTION, venueId), {
      photos: updatedPhotos,
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error("Error deleting venue photo:", error);
    throw error;
  }
};

export const setPrimaryPhoto = async (venueId: string, photoId: string) => {
  try {
    // Get the venue document
    const venueDoc = await getDoc(doc(db, VENUES_COLLECTION, venueId));
    const venueData = venueDoc.data() as Venue;
    
    // Update isPrimary for all photos
    const updatedPhotos = venueData.photos.map(photo => ({
      ...photo,
      isPrimary: photo.id === photoId
    }));
    
    await updateDoc(doc(db, VENUES_COLLECTION, venueId), {
      photos: updatedPhotos,
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error("Error setting primary photo:", error);
    throw error;
  }
};

// Report venue
export const reportVenue = async (report: Omit<VenueReport, "id" | "createdAt" | "updatedAt" | "status">) => {
  try {
    const newReport = {
      ...report,
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, REPORTS_COLLECTION), newReport);
    return docRef.id;
  } catch (error) {
    console.error("Error reporting venue:", error);
    throw error;
  }
};

// Search venues by location
export const searchVenuesByLocation = async (lat: number, lng: number, radiusKm: number = 50) => {
  // This is a simplistic implementation since Firestore doesn't support geospatial queries directly
  // For production, consider using Algolia or a Cloud Function with GeoFirestore
  try {
    const venuesQuery = query(
      collection(db, VENUES_COLLECTION),
      where("isActive", "==", true),
      orderBy("createdAt", "desc")
    );
    
    const snapshot = await getDocs(venuesQuery);
    const venues = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Venue));
    
    // Filter venues by distance (simplified - assumes flat earth)
    const filteredVenues = venues.filter(venue => {
      // Calculate distance using Haversine formula
      const R = 6371; // Earth radius in km
      const dLat = toRad(venue.location.lat - lat);
      const dLng = toRad(venue.location.lng - lng);
      
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(toRad(lat)) * Math.cos(toRad(venue.location.lat)) * 
        Math.sin(dLng/2) * Math.sin(dLng/2);
      
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = R * c;
      
      return distance <= radiusKm;
    });
    
    return filteredVenues;
  } catch (error) {
    console.error("Error searching venues by location:", error);
    throw error;
  }
};

// Helper function for Haversine formula
const toRad = (value: number) => {
  return value * Math.PI / 180;
};
