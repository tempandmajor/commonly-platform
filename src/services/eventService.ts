import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  serverTimestamp, 
  setDoc,
  getDoc,
  query,
  where,
  getDocs
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { Event, EventDraft, EventReport } from "@/types/event";

// Save event to Firestore
export const createEvent = async (eventData: Omit<Event, "id" | "createdAt" | "updatedAt">): Promise<string> => {
  try {
    const eventsRef = collection(db, "events");
    const docRef = await addDoc(eventsRef, {
      ...eventData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating event:", error);
    throw error;
  }
};

// Update existing event
export const updateEvent = async (eventId: string, eventData: Partial<Event>): Promise<void> => {
  try {
    const eventRef = doc(db, "events", eventId);
    await updateDoc(eventRef, {
      ...eventData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error updating event:", error);
    throw error;
  }
};

// Upload event image to Firebase Storage
export const uploadEventImage = async (file: File, userId: string): Promise<string> => {
  try {
    const storageRef = ref(storage, `event_images/${userId}/${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading event image:", error);
    throw error;
  }
};

// Save event draft
export const saveEventDraft = async (userId: string, eventData: Partial<Event>, draftId?: string): Promise<string> => {
  try {
    const draftsCollection = collection(db, "eventDrafts");
    
    if (draftId) {
      const draftRef = doc(db, "eventDrafts", draftId);
      await updateDoc(draftRef, {
        eventData,
        lastSaved: serverTimestamp()
      });
      return draftId;
    } else {
      const draftRef = await addDoc(draftsCollection, {
        userId,
        eventData,
        lastSaved: serverTimestamp()
      });
      return draftRef.id;
    }
  } catch (error) {
    console.error("Error saving event draft:", error);
    throw error;
  }
};

// Get event draft by ID
export const getEventDraft = async (draftId: string): Promise<EventDraft | null> => {
  try {
    const draftRef = doc(db, "eventDrafts", draftId);
    const draftSnapshot = await getDoc(draftRef);
    
    if (draftSnapshot.exists()) {
      return { id: draftSnapshot.id, ...draftSnapshot.data() } as EventDraft;
    }
    return null;
  } catch (error) {
    console.error("Error getting event draft:", error);
    throw error;
  }
};

// Get user's event drafts
export const getUserEventDrafts = async (userId: string): Promise<EventDraft[]> => {
  try {
    const draftsQuery = query(
      collection(db, "eventDrafts"), 
      where("userId", "==", userId)
    );
    
    const snapshot = await getDocs(draftsQuery);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EventDraft));
  } catch (error) {
    console.error("Error getting user event drafts:", error);
    throw error;
  }
};

// Report an event
export const reportEvent = async (reportData: Omit<EventReport, "id" | "createdAt" | "status">): Promise<string> => {
  try {
    const reportsRef = collection(db, "eventReports");
    const docRef = await addDoc(reportsRef, {
      ...reportData,
      status: "pending",
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error reporting event:", error);
    throw error;
  }
};

// Check if user has a Stripe Connect account
export const checkStripeConnectAccount = async (userId: string): Promise<boolean> => {
  try {
    const userRef = doc(db, "users", userId);
    const userSnapshot = await getDoc(userRef);
    
    if (userSnapshot.exists()) {
      const userData = userSnapshot.data();
      return !!userData.stripeConnectId;
    }
    return false;
  } catch (error) {
    console.error("Error checking Stripe Connect account:", error);
    throw error;
  }
};

// Update user's Stripe Connect ID
export const updateStripeConnectId = async (userId: string, stripeConnectId: string): Promise<void> => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      stripeConnectId,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error updating Stripe Connect ID:", error);
    throw error;
  }
};

// Fetch all published events
export const getPublishedEvents = async (): Promise<Event[]> => {
  try {
    const eventsRef = collection(db, "events");
    const q = query(
      eventsRef, 
      where("published", "==", true),
      orderBy("date", "asc")
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    }) as Event);
  } catch (error) {
    console.error("Error fetching events:", error);
    throw error;
  }
};
