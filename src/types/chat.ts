import { Podcast, PodcastCreateInput } from "@/types/podcast";

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  recipientId: string;
  text?: string;
  imageUrl?: string;
  voiceUrl?: string;
  timestamp: string;
  read: boolean;
}

export interface ChatParticipant {
  id: string;
  displayName?: string;
  photoURL?: string;
  online?: boolean;
  typing?: boolean;
  lastSeen?: string;
}

export interface Chat {
  id: string;
  participants: string[];
  lastMessage?: {
    id: string;
    senderId: string;
    recipientId: string;
    text?: string;
    timestamp: string;
    read: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface ChatWithParticipants extends Chat {
  participantDetails: ChatParticipant[];
  unreadCount: number;
}

export interface ChatWithUser extends Chat {
  otherUser?: {
    id: string;
    displayName?: string;
    photoURL?: string;
    isOnline?: boolean;
    lastSeen?: string;
  };
  unreadCount: number;
}

// Change re-exports to use the 'export type' syntax for isolatedModules compatibility
export type { PodcastCreateInput, Podcast } from './podcast';
