
import { db } from "@/lib/firebase";
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  getDocs,
  doc,
  updateDoc,
  Timestamp,
  deleteDoc,
  getDoc,
  setDoc,
  serverTimestamp,
  limit,
  onSnapshot
} from "firebase/firestore";
import { Notification, NotificationType, NotificationSettings } from "@/types/auth";
import { v4 as uuidv4 } from 'uuid';

/**
 * Initialize notifications for a user
 */
export const initializeNotifications = async (userId: string): Promise<void> => {
  // Check if badge count document exists, if not create it
  const badgeRef = doc(db, "notificationBadges", userId);
  const badgeDoc = await getDoc(badgeRef);
  
  if (!badgeDoc.exists()) {
    await setDoc(badgeRef, {
      unreadCount: 0,
      lastChecked: serverTimestamp()
    });
  }
  
  // Check if notification settings exist, if not create default ones
  const settingsRef = doc(db, "notificationSettings", userId);
  const settingsDoc = await getDoc(settingsRef);
  
  if (!settingsDoc.exists()) {
    await setDoc(settingsRef, getDefaultNotificationSettings());
  }
};

/**
 * Subscribe to notifications in real-time
 */
export const subscribeToNotifications = (
  userId: string,
  callback: (notifications: Notification[]) => void
): () => void => {
  const notificationsRef = collection(db, "notifications");
  const q = query(
    notificationsRef,
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
    limit(10)
  );
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const notifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Notification));
    
    callback(notifications);
  }, (error) => {
    console.error("Error listening to notifications:", error);
  });
  
  return unsubscribe;
};

/**
 * Subscribe to unread notification count in real-time
 */
export const subscribeToUnreadCount = (
  userId: string,
  callback: (count: number) => void
): () => void => {
  const badgeRef = doc(db, "notificationBadges", userId);
  
  const unsubscribe = onSnapshot(badgeRef, (doc) => {
    if (doc.exists()) {
      const data = doc.data();
      callback(data.unreadCount || 0);
    } else {
      callback(0);
    }
  }, (error) => {
    console.error("Error listening to notification badge:", error);
  });
  
  return unsubscribe;
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
 * Get notification settings for a user
 */
export const getNotificationSettings = async (userId: string): Promise<NotificationSettings | null> => {
  const settingsRef = doc(db, "notificationSettings", userId);
  const settingsDoc = await getDoc(settingsRef);
  
  if (settingsDoc.exists()) {
    return settingsDoc.data() as NotificationSettings;
  }
  
  return null;
};

/**
 * Update notification settings for a user
 */
export const updateNotificationSettings = async (userId: string, settings: NotificationSettings): Promise<void> => {
  const settingsRef = doc(db, "notificationSettings", userId);
  await setDoc(settingsRef, settings);
};

/**
 * Create a new notification
 */
export const createNotification = async (
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  data: Record<string, any> = {},
  image?: string
): Promise<string> => {
  // Create the notification
  const notificationData = {
    userId,
    type,
    title,
    message,
    read: false,
    data,
    createdAt: serverTimestamp(),
    ...(image && { image })
  };

  // Save to Firestore
  const docRef = await addDoc(collection(db, "notifications"), notificationData);
  
  // Update notification badge count
  await updateBadgeCount(userId);

  return docRef.id;
};

/**
 * Get all notifications for a user
 */
export const getNotifications = async (userId: string, count: number = 10): Promise<Notification[]> => {
  return getUserNotifications(userId, count);
};

/**
 * Get all notifications for a user (alias for getNotifications)
 */
export const getUserNotifications = async (userId: string, count: number = 10): Promise<Notification[]> => {
  const notificationsRef = collection(db, "notifications");
  const q = query(
    notificationsRef,
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
    limit(count)
  );
  
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Notification));
};

/**
 * Mark a notification as read
 */
export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  const notificationRef = doc(db, "notifications", notificationId);
  await updateDoc(notificationRef, { read: true });
  
  // Get the notification to find the user ID
  const notificationDoc = await getDoc(notificationRef);
  if (notificationDoc.exists()) {
    const userId = notificationDoc.data().userId;
    if (userId) {
      await updateBadgeCount(userId);
    }
  }
};

/**
 * Mark all notifications as read for a user
 */
export const markAllAsRead = async (userId: string): Promise<void> => {
  const notificationsRef = collection(db, "notifications");
  const q = query(
    notificationsRef,
    where("userId", "==", userId),
    where("read", "==", false)
  );
  
  const querySnapshot = await getDocs(q);
  
  const updatePromises = querySnapshot.docs.map(doc => 
    updateDoc(doc.ref, { read: true })
  );
  
  await Promise.all(updatePromises);
  
  // Reset badge count
  await setDoc(doc(db, "notificationBadges", userId), {
    unreadCount: 0,
    lastChecked: serverTimestamp()
  });
};

/**
 * Get unread notification count
 */
export const getUnreadCount = async (userId: string): Promise<number> => {
  const notificationsRef = collection(db, "notifications");
  const q = query(
    notificationsRef,
    where("userId", "==", userId),
    where("read", "==", false),
    limit(100)
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.size;
};

/**
 * Delete a notification
 */
export const deleteNotification = async (notificationId: string): Promise<void> => {
  const notificationRef = doc(db, "notifications", notificationId);
  
  // Get the notification to find the user ID before deleting
  const notificationDoc = await getDoc(notificationRef);
  if (notificationDoc.exists()) {
    const userId = notificationDoc.data().userId;
    
    // Delete the notification
    await deleteDoc(notificationRef);
    
    // Update badge count if we have a userId
    if (userId) {
      await updateBadgeCount(userId);
    }
  } else {
    await deleteDoc(notificationRef);
  }
};

/**
 * Update the notification badge count
 */
const updateBadgeCount = async (userId: string): Promise<void> => {
  const count = await getUnreadCount(userId);
  
  await setDoc(doc(db, "notificationBadges", userId), {
    unreadCount: count,
    lastChecked: serverTimestamp()
  });
};

/**
 * Get the notification badge data
 */
export const getNotificationBadge = async (userId: string): Promise<{ unreadCount: number; lastChecked: Date | null }> => {
  const badgeRef = doc(db, "notificationBadges", userId);
  const badgeDoc = await getDoc(badgeRef);
  
  if (!badgeDoc.exists()) {
    return { unreadCount: 0, lastChecked: null };
  }
  
  const data = badgeDoc.data();
  return {
    unreadCount: data.unreadCount || 0,
    lastChecked: data.lastChecked ? new Date(data.lastChecked.toDate()) : null
  };
};
