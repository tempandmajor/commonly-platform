
// This must match the Supabase enum definition for notification_type
export type NotificationType = 
  | 'message' 
  | 'like' 
  | 'follow' 
  | 'comment' 
  | 'podcast' 
  | 'event' 
  | 'system'
  | 'event_update'
  | 'new_follower'
  | 'referral_earnings'
  | 'sponsorship';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  imageUrl?: string;
  actionUrl?: string;
  read: boolean;
  createdAt: string;
  data?: Record<string, any>;
}

export interface NotificationSettings {
  userId: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  inAppNotifications: boolean;
  marketingEmails: boolean;
  updatedAt: string;
}

// Add this type to map from Supabase notification format
export interface SupabaseNotification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string;
  image_url: string | null;
  action_url: string | null;
  read: boolean;
  created_at: string;
  data: Record<string, any> | null;
}

// Utility function to convert from Supabase format to our app format
export function mapSupabaseNotification(notification: SupabaseNotification): Notification {
  return {
    id: notification.id,
    userId: notification.user_id,
    type: notification.type,
    title: notification.title,
    body: notification.body,
    imageUrl: notification.image_url || undefined,
    actionUrl: notification.action_url || undefined,
    read: notification.read,
    createdAt: notification.created_at,
    data: notification.data || undefined
  };
}
