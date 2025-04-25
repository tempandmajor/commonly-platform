
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
  serverTimestamp
} from "firebase/firestore";
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { Caterer, CatererPhoto, CatererReport, MenuCategory, MenuItem } from "@/types/caterer";

const CATERERS_COLLECTION = 'caterers';
const BOOKINGS_COLLECTION = 'catererBookings';
const REPORTS_COLLECTION = 'catererReports';

// Caterer CRUD operations
export const getCaterers = async (lastVisible = null, limitCount = 12) => {
  try {
    let caterersQuery;
    
    if (lastVisible) {
      caterersQuery = query(
        collection(db, CATERERS_COLLECTION),
        where("isActive", "==", true),
        orderBy("createdAt", "desc"),
        startAfter(lastVisible),
        limit(limitCount)
      );
    } else {
      caterersQuery = query(
        collection(db, CATERERS_COLLECTION),
        where("isActive", "==", true),
        orderBy("createdAt", "desc"),
        limit(limitCount)
      );
    }
    
    const snapshot = await getDocs(caterersQuery);
    const lastVisibleDoc = snapshot.docs[snapshot.docs.length - 1];
    
    const caterers = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() as object
    } as Caterer));
    
    return { caterers, lastVisible: lastVisibleDoc };
  } catch (error) {
    console.error("Error fetching caterers:", error);
    throw error;
  }
};

export const getCaterersByOwner = async (ownerId: string) => {
  try {
    const caterersQuery = query(
      collection(db, CATERERS_COLLECTION),
      where("ownerId", "==", ownerId),
      orderBy("createdAt", "desc")
    );
    
    const snapshot = await getDocs(caterersQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() as object
    } as Caterer));
  } catch (error) {
    console.error("Error fetching owner caterers:", error);
    throw error;
  }
};

export const getCaterer = async (id: string) => {
  try {
    const catererDoc = await getDoc(doc(db, CATERERS_COLLECTION, id));
    
    if (!catererDoc.exists()) {
      throw new Error("Caterer not found");
    }
    
    return {
      id: catererDoc.id,
      ...catererDoc.data() as object
    } as Caterer;
  } catch (error) {
    console.error("Error fetching caterer:", error);
    throw error;
  }
};

export const createCaterer = async (caterer: Omit<Caterer, "id" | "createdAt" | "updatedAt">) => {
  try {
    const newCaterer = {
      ...caterer,
      isVerified: false, // Requires admin verification
      isActive: false, // Initially inactive until verified
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, CATERERS_COLLECTION), newCaterer);
    return docRef.id;
  } catch (error) {
    console.error("Error creating caterer:", error);
    throw error;
  }
};

export const updateCaterer = async (id: string, data: Partial<Caterer>) => {
  try {
    const updateData = {
      ...data,
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(doc(db, CATERERS_COLLECTION, id), updateData);
    return true;
  } catch (error) {
    console.error("Error updating caterer:", error);
    throw error;
  }
};

export const deleteCaterer = async (id: string) => {
  try {
    await deleteDoc(doc(db, CATERERS_COLLECTION, id));
    return true;
  } catch (error) {
    console.error("Error deleting caterer:", error);
    throw error;
  }
};

// Photo upload functions
export const uploadCatererPhoto = async (catererId: string, file: File, caption?: string): Promise<CatererPhoto> => {
  try {
    // Create a file path in Firebase Storage
    const fileExtension = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    const filePath = `caterers/${catererId}/photos/${fileName}.${fileExtension}`;
    const photoRef = ref(storage, filePath);
    
    // Upload the file
    await uploadBytes(photoRef, file);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(photoRef);
    
    // Create a photo object
    const photoId = Math.random().toString(36).substring(2, 15);
    const photo: CatererPhoto = {
      id: photoId,
      url: downloadURL,
      caption: caption || "",
      isPrimary: false,
      storagePath: filePath
    };
    
    // If this is the first photo, make it the primary
    const catererDoc = await getDoc(doc(db, CATERERS_COLLECTION, catererId));
    const catererData = catererDoc.data() as Caterer;
    
    if (!catererData.photos || catererData.photos.length === 0) {
      photo.isPrimary = true;
    }
    
    // Add the photo to the caterer document
    const photos = catererData.photos || [];
    await updateDoc(doc(db, CATERERS_COLLECTION, catererId), {
      photos: [...photos, photo],
      updatedAt: serverTimestamp()
    });
    
    return photo;
  } catch (error) {
    console.error("Error uploading caterer photo:", error);
    throw error;
  }
};

// Upload menu item photo
export const uploadMenuItemPhoto = async (catererId: string, menuCategoryId: string, menuItemId: string, file: File): Promise<string> => {
  try {
    // Create a file path in Firebase Storage
    const fileExtension = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    const filePath = `caterers/${catererId}/menu/${menuItemId}/${fileName}.${fileExtension}`;
    const photoRef = ref(storage, filePath);
    
    // Upload the file
    await uploadBytes(photoRef, file);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(photoRef);
    
    // Get current caterer data
    const catererDoc = await getDoc(doc(db, CATERERS_COLLECTION, catererId));
    const catererData = catererDoc.data() as Caterer;
    
    // Find the menu category and item
    const updatedMenuCategories = [...catererData.menuCategories];
    const categoryIndex = updatedMenuCategories.findIndex(category => category.id === menuCategoryId);
    
    if (categoryIndex !== -1) {
      const itemIndex = updatedMenuCategories[categoryIndex].items.findIndex(item => item.id === menuItemId);
      
      if (itemIndex !== -1) {
        updatedMenuCategories[categoryIndex].items[itemIndex].photoUrl = downloadURL;
        
        // Update the caterer document
        await updateDoc(doc(db, CATERERS_COLLECTION, catererId), {
          menuCategories: updatedMenuCategories,
          updatedAt: serverTimestamp()
        });
      }
    }
    
    return downloadURL;
  } catch (error) {
    console.error("Error uploading menu item photo:", error);
    throw error;
  }
};

// Report caterer
export const reportCaterer = async (report: Omit<CatererReport, "id" | "createdAt" | "updatedAt" | "status">) => {
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
    console.error("Error reporting caterer:", error);
    throw error;
  }
};

// Search caterers by location
export const searchCaterersByLocation = async (lat: number, lng: number, radiusKm: number = 50) => {
  // This is a simplistic implementation since Firestore doesn't support geospatial queries directly
  // For production, consider using Algolia or a Cloud Function with GeoFirestore
  try {
    const caterersQuery = query(
      collection(db, CATERERS_COLLECTION),
      where("isActive", "==", true),
      orderBy("createdAt", "desc")
    );
    
    const snapshot = await getDocs(caterersQuery);
    const caterers = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() as object
    } as Caterer));
    
    // Filter caterers by distance (simplified - assumes flat earth)
    const filteredCaterers = caterers.filter(caterer => {
      // Calculate distance using Haversine formula
      const R = 6371; // Earth radius in km
      const dLat = toRad(caterer.location.lat - lat);
      const dLng = toRad(caterer.location.lng - lng);
      
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(toRad(lat)) * Math.cos(toRad(caterer.location.lat)) * 
        Math.sin(dLng/2) * Math.sin(dLng/2);
      
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = R * c;
      
      return distance <= radiusKm;
    });
    
    return filteredCaterers;
  } catch (error) {
    console.error("Error searching caterers by location:", error);
    throw error;
  }
};

// Add a menu category to a caterer
export const addMenuCategory = async (catererId: string, category: Omit<MenuCategory, "id">) => {
  try {
    const catererDoc = await getDoc(doc(db, CATERERS_COLLECTION, catererId));
    if (!catererDoc.exists()) {
      throw new Error("Caterer not found");
    }
    
    const catererData = catererDoc.data() as Caterer;
    const categoryId = Math.random().toString(36).substring(2, 15);
    
    const newCategory: MenuCategory = {
      id: categoryId,
      ...category
    };
    
    const updatedCategories = [...(catererData.menuCategories || []), newCategory];
    
    await updateDoc(doc(db, CATERERS_COLLECTION, catererId), {
      menuCategories: updatedCategories,
      updatedAt: serverTimestamp()
    });
    
    return categoryId;
  } catch (error) {
    console.error("Error adding menu category:", error);
    throw error;
  }
};

// Add a menu item to a category
export const addMenuItem = async (catererId: string, categoryId: string, item: Omit<MenuItem, "id">) => {
  try {
    const catererDoc = await getDoc(doc(db, CATERERS_COLLECTION, catererId));
    if (!catererDoc.exists()) {
      throw new Error("Caterer not found");
    }
    
    const catererData = catererDoc.data() as Caterer;
    const categories = [...catererData.menuCategories];
    const categoryIndex = categories.findIndex(cat => cat.id === categoryId);
    
    if (categoryIndex === -1) {
      throw new Error("Category not found");
    }
    
    const itemId = Math.random().toString(36).substring(2, 15);
    const newItem: MenuItem = {
      id: itemId,
      ...item
    };
    
    categories[categoryIndex].items = [...(categories[categoryIndex].items || []), newItem];
    
    await updateDoc(doc(db, CATERERS_COLLECTION, catererId), {
      menuCategories: categories,
      updatedAt: serverTimestamp()
    });
    
    return itemId;
  } catch (error) {
    console.error("Error adding menu item:", error);
    throw error;
  }
};

// Helper function for Haversine formula
const toRad = (value: number) => {
  return value * Math.PI / 180;
};
