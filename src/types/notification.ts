
export type NotificationType = 'message' | 'like' | 'follow' | 'comment' | 'podcast' | 'event' | 'system' | 'event_update' | 'new_follower' | 'referral_earnings' | 'sponsorship';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  image?: string;
  actionUrl?: string;
  read: boolean;
  createdAt: string;
  data?: {
    eventId?: string;
    eventTitle?: string;
    podcastId?: string;
    podcastTitle?: string;
    senderId?: string;
    senderName?: string;
    senderPhoto?: string;
    amount?: number;
    message?: string;
  };
}

export interface NotificationSettings {
  userId: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  inAppNotifications: boolean;
  marketingEmails: boolean;
  updatedAt: string;
}
