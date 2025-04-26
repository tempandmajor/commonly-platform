
import { db, storage } from "@/lib/firebase";
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, query, where, orderBy, limit, Timestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
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

// Function to get published events
export const getPublishedEvents = async (): Promise<Event[]> => {
  try {
    const eventsRef = collection(db, "events");
    const q = query(
      eventsRef,
      where("published", "==", true),
      orderBy("date", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Event[];
  }
  catch (error) {
    console.error("Error fetching published events:", error);
    return [];
  }
};

// Function to create a new event
export const createEvent = async (eventData: Omit<Event, "id">): Promise<string> => {
  try {
    const eventsRef = collection(db, "events");
    const eventWithTimestamps = {
      ...eventData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    
    const newEventRef = await addDoc(eventsRef, eventWithTimestamps);
    return newEventRef.id;
  } catch (error) {
    console.error("Error creating event:", error);
    throw error;
  }
};

// Function to save event draft
export const saveEventDraft = async (userId: string, draftData: Partial<Event>, draftId?: string): Promise<string> => {
  try {
    if (draftId) {
      // Update existing draft
      const draftRef = doc(db, "eventDrafts", draftId);
      await updateDoc(draftRef, {
        ...draftData,
        updatedAt: Timestamp.now()
      });
      return draftId;
    } else {
      // Create new draft
      const draftsRef = collection(db, "eventDrafts");
      const draftWithData = {
        userId,
        eventData: draftData,
        lastSaved: Timestamp.now()
      };
      
      const newDraftRef = await addDoc(draftsRef, draftWithData);
      return newDraftRef.id;
    }
  } catch (error) {
    console.error("Error saving event draft:", error);
    throw error;
  }
};

// Function to upload event image
export const uploadEventImage = async (file: File, userId: string): Promise<string> => {
  try {
    const fileExtension = file.name.split('.').pop();
    const fileName = `events/${userId}/${Date.now()}.${fileExtension}`;
    const storageRef = ref(storage, fileName);
    
    await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(storageRef);
    
    return downloadUrl;
  } catch (error) {
    console.error("Error uploading event image:", error);
    throw error;
  }
};

// Function to check if user has a Stripe Connect account
export const checkStripeConnectAccount = async (userId: string): Promise<boolean> => {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      return false;
    }
    
    const userData = userSnap.data();
    return !!userData.stripeConnectId;
  } catch (error) {
    console.error("Error checking Stripe connect account:", error);
    throw error;
  }
};

// Function to update Stripe Connect ID
export const updateStripeConnectId = async (userId: string, stripeConnectId: string): Promise<void> => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, { stripeConnectId });
  } catch (error) {
    console.error("Error updating Stripe connect ID:", error);
    throw error;
  }
};

// Function to report an event
export const reportEvent = async (reportData: {
  eventId: string;
  userId: string;
  reporterEmail: string;
  reason: string;
  description: string;
}): Promise<void> => {
  try {
    const reportsRef = collection(db, "eventReports");
    const reportWithTimestamp = {
      ...reportData,
      status: "pending",
      createdAt: Timestamp.now()
    };
    
    await addDoc(reportsRef, reportWithTimestamp);
  } catch (error) {
    console.error("Error reporting event:", error);
    throw error;
  }
};
