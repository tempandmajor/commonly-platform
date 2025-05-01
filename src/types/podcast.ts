
export interface Podcast {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  audioUrl?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  duration: number;
  createdAt: string;
  userId: string;
  userName?: string;
  userPhotoUrl?: string;
  categoryId?: string;
  likeCount: number;
  viewCount: number;
  shareCount: number;
  published: boolean;
  type: 'audio' | 'video';
  visibility: 'public' | 'private' | 'unlisted';
  listens?: number;
  tags?: string[];
  creatorId?: string;
  creatorName?: string;
  isExternal?: boolean;
}

export interface PodcastCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
}

export interface PodcastComment {
  id: string;
  podcastId: string;
  userId: string;
  userName: string;
  userPhotoUrl?: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  likes?: number;
}

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

export interface PodcastSession {
  id?: string;
  userId: string;
  hostId?: string;
  title: string;
  description?: string;
  participants: string[];
  duration?: number;
  status: 'recording' | 'processing' | 'completed' | 'failed' | 'scheduled';
  recordingUrl?: string;
  createdAt?: string;
  agoraChannelName?: string;
}
