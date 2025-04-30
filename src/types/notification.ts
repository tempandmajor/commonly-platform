
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
