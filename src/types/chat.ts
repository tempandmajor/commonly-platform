
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
    text?: string;
    senderId?: string;
    timestamp?: string;
    read?: boolean;
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
  image_url?: string | null;
  voice_url?: string | null;
  timestamp: string;
  read: boolean;
}

export interface UserTyping {
  chat_id: string;
  user_id: string;
  is_typing: boolean;
  updated_at: string;
}

// Update podcast interfaces to match what our createPodcast function expects
export interface PodcastCreateInput {
  title: string;
  description?: string;
  userId: string;
  userName?: string;
  userPhotoUrl?: string;
  categoryId?: string;
  type: 'audio' | 'video';
  duration?: number;
  published: boolean;
  visibility: 'public' | 'private' | 'unlisted';
  tags?: string[];
  audioUrl?: string;
  videoUrl?: string;
  imageUrl?: string;
  likeCount?: number;
  viewCount?: number;
  shareCount?: number;
  creatorId?: string;
  creatorName?: string;
}
