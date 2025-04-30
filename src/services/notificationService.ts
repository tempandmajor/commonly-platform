
import { supabase } from "@/integrations/supabase/client";
import { Notification, SupabaseNotification, mapSupabaseNotification } from "@/types/notification";

/**
 * Get all notifications for a user
 */
export const getUserNotifications = async (userId: string, limit: number = 20): Promise<Notification[]> => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    
    // Convert from Supabase format to our app format
    return (data as SupabaseNotification[]).map(mapSupabaseNotification);
  } catch (error) {
    console.error('Error getting user notifications:', error);
    return [];
  }
};

/**
 * Get notifications (alias for getUserNotifications)
 */
export const getNotifications = getUserNotifications;

/**
 * Mark all notifications as read for a user
 */
export const markAllAsRead = async (userId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
  }
};

/**
 * Get count of unread notifications for a user
 */
export const getUnreadCount = async (userId: string): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false);
    
    if (error) throw error;
    
    return count || 0;
  } catch (error) {
    console.error('Error counting unread notifications:', error);
    return 0;
  }
};

/**
 * Mark a specific notification as read
 */
export const markNotificationAsRead = async (notificationId: string, userId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)
      .eq('user_id', userId);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
};

/**
 * Subscribe to notifications in real-time
 */
export const subscribeToNotifications = (
  userId: string,
  callback: (notifications: Notification[]) => void
): (() => void) => {
  const channel = supabase
    .channel('public:notifications')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      },
      async () => {
        // When any change happens, fetch updated notifications
        const notifications = await getUserNotifications(userId);
        callback(notifications);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

/**
 * Subscribe to unread notification count in real-time
 */
export const subscribeToUnreadCount = (
  userId: string,
  callback: (count: number) => void
): (() => void) => {
  const channel = supabase
    .channel('public:notifications:unread')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      },
      async () => {
        // When any change happens, fetch updated unread count
        const count = await getUnreadCount(userId);
        callback(count);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

/**
 * Create a new notification
 */
export const createNotification = async (
  userId: string,
  type: Notification['type'],
  title: string,
  body: string,
  imageUrl?: string,
  actionUrl?: string,
  data?: Record<string, any>
): Promise<string | null> => {
  try {
    const { data: notificationData, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type,
        title,
        body,
        image_url: imageUrl || null,
        action_url: actionUrl || null,
        read: false,
        created_at: new Date().toISOString(),
        data: data || null
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return notificationData.id;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};
