
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
  };
  createdAt: string;
  updatedAt: string;
}

export interface ChatWithUser extends Chat {
  user: ChatUser | null;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  recipientId: string | null;
  text?: string;
  imageUrl?: string;
  voiceUrl?: string;
  timestamp: string;
  read: boolean;
}
