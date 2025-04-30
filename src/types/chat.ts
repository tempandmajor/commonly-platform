
export interface ChatUser {
  uid: string;
  displayName?: string | null;
  photoURL?: string | null;
  email?: string | null;
  isOnline?: boolean;
  lastSeen?: string | null;
}

export interface Chat {
  id: string;
  participants: string[];
  lastMessage?: {
    text: string;
    senderId: string;
    timestamp: string;
    read: boolean;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface ChatWithUser extends Chat {
  user: ChatUser | null;
}

export interface ChatMessage {
  id: string;
  chat_id: string;
  sender_id: string;
  recipient_id: string | null;
  text?: string;
  image_url?: string;
  voice_url?: string;
  timestamp: string;
  read: boolean;
}
