
import { NotificationType } from "./auth";

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  data?: Record<string, any>;
  createdAt: any; // Firebase timestamp or Date
  image?: string;
}

export interface NotificationSettings {
  email: {
    eventUpdates: boolean;
    newFollowers: boolean;
    messages: boolean;
    earnings: boolean;
    marketing: boolean;
  };
  push: {
    eventUpdates: boolean;
    newFollowers: boolean;
    messages: boolean;
    earnings: boolean;
  };
  inApp: {
    eventUpdates: boolean;
    newFollowers: boolean;
    messages: boolean;
    earnings: boolean;
  };
}
