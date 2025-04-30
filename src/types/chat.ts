
import { UserData } from "./auth";

export interface ChatWithUser {
  id: string;
  participants: string[];
  lastMessage?: {
    text: string;
    senderId: string;
    timestamp: any;
    read: boolean;
    recipientId: string;
  };
  createdAt: any;
  updatedAt: any;
  user: UserData;
  unreadCount?: number;
}

export interface TypingStatus {
  userId: string;
  isTyping: boolean;
  timestamp: any;
}
