import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  limit, 
  updateDoc,
  getDoc,
  doc,
  deleteDoc,
  onSnapshot,
  Firestore
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getToken, getMessaging, onMessage } from "firebase/messaging";
import { NotificationSettings, NotificationType } from "@/types/auth";
import { Notification } from "@/types/notification";
import { getUserProfile } from "./userService";

/**
 * Get notifications for a user
 */
export const getUserNotifications = async (
  userId: string,
  limitCount: number = 20
): Promise<Notification[]> => {
  try {
    const notificationsRef = collection(db, "notifications");
    const q = query(
      notificationsRef,
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    const notifications: Notification[] = [];
    
    querySnapshot.forEach((doc) => {
      notifications.push({
        id: doc.id,
        ...doc.data()
      } as Notification);
    });
    
    return notifications;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }
};

/**
 * Subscribe to real-time notifications
 */
export const subscribeToNotifications = (
  userId: string,
  callback: (notifications: Notification[]) => void
) => {
  const notificationsRef = collection(db, "notifications");
  const q = query(
    notificationsRef,
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
    limit(20)
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const notifications: Notification[] = [];
    querySnapshot.forEach((doc) => {
      notifications.push({
        id: doc.id,
        ...doc.data()
      } as Notification);
    });
    
    callback(notifications);
  });
};

/**
 * Mark a notification as read
 */
export const markNotificationAsRead = async (notificationId: string): Promise<boolean> => {
  try {
    await updateDoc(doc(db, "notifications", notificationId), {
      read: true
    });
    
    return true;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return false;
  }
};

/**
 * Mark all notifications as read for a user
 */
export const markAllNotificationsAsRead = async (userId: string): Promise<boolean> => {
  try {
    const notificationsRef = collection(db, "notifications");
    const q = query(
      notificationsRef,
      where("userId", "==", userId),
      where("read", "==", false),
      limit(100) // Batch operations limited to 500 documents, using 100 to be safe
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return true;
    }
    
    const batch = writeBatch(db as FirebaseFirestore);
    
    querySnapshot.forEach((document) => {
      batch.update(doc(db, "notifications", document.id), { read: true });
    });
    
    await batch.commit();
    return true;
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return false;
  }
};

/**
 * Update user notification settings
 */
export const updateNotificationSettings = async (
  userId: string, 
  settings: NotificationSettings
): Promise<boolean> => {
  try {
    await updateDoc(doc(db, "users", userId), {
      notificationSettings: settings
    });
    
    return true;
  } catch (error) {
    console.error("Error updating notification settings:", error);
    return false;
  }
};

/**
 * Get user notification settings
 */
export const getNotificationSettings = async (
  userId: string
): Promise<NotificationSettings | null> => {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    
    if (userDoc.exists()) {
      return userDoc.data().notificationSettings || getDefaultNotificationSettings();
    }
    
    return null;
  } catch (error) {
    console.error("Error getting notification settings:", error);
    return null;
  }
};

/**
 * Get default notification settings
 */
export const getDefaultNotificationSettings = (): NotificationSettings => {
  return {
    email: {
      eventUpdates: true,
      newFollowers: true,
      messages: true,
      earnings: true,
      marketing: false
    },
    push: {
      eventUpdates: true,
      newFollowers: true,
      messages: true,
      earnings: true
    },
    inApp: {
      eventUpdates: true,
      newFollowers: true,
      messages: true,
      earnings: true
    }
  };
};

/**
 * Create a notification for a user
 */
export const createNotification = async (
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  data?: Record<string, any>,
  image?: string
): Promise<string | null> => {
  try {
    const notificationsRef = collection(db, "notifications");
    const docRef = await addDoc(notificationsRef, {
      userId,
      type,
      title,
      message,
      read: false,
      data,
      image,
      createdAt: serverTimestamp()
    });
    
    return docRef.id;
  } catch (error) {
    console.error("Error creating notification:", error);
    return null;
  }
};

/**
 * Delete a notification
 */
export const deleteNotification = async (notificationId: string): Promise<boolean> => {
  try {
    await deleteDoc(doc(db, "notifications", notificationId));
    
    return true;
  } catch (error) {
    console.error("Error deleting notification:", error);
    return false;
  }
};

/**
 * Get unread notification count for a user
 */
export const getUnreadNotificationCount = async (userId: string): Promise<number> => {
  try {
    const notificationsRef = collection(db, "notifications");
    const q = query(
      notificationsRef,
      where("userId", "==", userId),
      where("read", "==", false)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  } catch (error) {
    console.error("Error getting unread notification count:", error);
    return 0;
  }
};

/**
 * Subscribe to unread notification count
 */
export const subscribeToUnreadNotificationCount = (
  userId: string,
  callback: (count: number) => void
) => {
  const notificationsRef = collection(db, "notifications");
  const q = query(
    notificationsRef,
    where("userId", "==", userId),
    where("read", "==", false)
  );
  
  return onSnapshot(q, (querySnapshot) => {
    callback(querySnapshot.size);
  });
};

// Firebase Cloud Messaging (FCM) for push notifications

/**
 * Request permission for push notifications
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
  try {
    const messaging = getMessaging();
    
    const permission = await Notification.requestPermission();
    
    if (permission !== 'granted') {
      console.log('Notification permission denied');
      return false;
    }
    
    const token = await getToken(messaging, {
      vapidKey: 'YOUR_PUBLIC_VAPID_KEY' // Replace with your VAPID key
    });
    
    if (token) {
      console.log('Got FCM token:', token);
      return true;
    } else {
      console.log('No registration token available');
      return false;
    }
  } catch (error) {
    console.error('Error getting notification permission:', error);
    return false;
  }
};

/**
 * Save user's FCM token to Firestore
 */
export const saveUserFcmToken = async (userId: string, token: string): Promise<boolean> => {
  try {
    const userRef = doc(db, "users", userId);
    const userTokensRef = collection(userRef, "fcmTokens");
    
    // Check if token already exists
    const q = query(userTokensRef, where("token", "==", token));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      // Add new token
      await addDoc(userTokensRef, {
        token,
        createdAt: serverTimestamp(),
        device: navigator.userAgent
      });
    }
    
    return true;
  } catch (error) {
    console.error("Error saving FCM token:", error);
    return false;
  }
};

/**
 * Subscribe to incoming push notifications
 */
export const subscribeToIncomingPushNotifications = (
  callback: (payload: any) => void
) => {
  try {
    const messaging = getMessaging();
    return onMessage(messaging, (payload) => {
      console.log('Message received:', payload);
      callback(payload);
    });
  } catch (error) {
    console.error('Error setting up push notification listener:', error);
    return () => {}; // Return empty unsubscribe function
  }
};

/**
 * Initialize the notification system
 */
export const initializeNotifications = async (userId: string): Promise<void> => {
  try {
    // Request permission and get token
    const permissionGranted = await requestNotificationPermission();
    
    if (permissionGranted) {
      // Save token to user's document
      const token = await getToken(getMessaging());
      if (token) {
        await saveUserFcmToken(userId, token);
      }
    }
    
    // Set up listener for incoming messages
    subscribeToIncomingPushNotifications((payload) => {
      // Handle incoming notification
      // This could display a toast or update the notification list
      console.log('Received notification:', payload);
    });
  } catch (error) {
    console.error('Error initializing notifications:', error);
  }
};
