
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
  updatedAt: string;
}
