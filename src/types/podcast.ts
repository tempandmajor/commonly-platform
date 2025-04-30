export interface Podcast {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  audioUrl?: string;
  videoUrl?: string;
  duration: number;
  creatorId: string;
  creatorName: string;
  type: "audio" | "video";
  category: string;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
  published: boolean;
  viewCount: number;
  likeCount: number;
  shareCount: number;
  featured: boolean;
  tags?: string[];
  visibility: "public" | "private" | "unlisted";
  userId: string;
  listens: number;
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
}

export interface PodcastSession {
  id: string;
  hostId: string;
  title: string;
  description?: string;
  scheduledFor: string;
  duration: number;
  participants: string[];
  status: "scheduled" | "live" | "ended" | "cancelled";
  agoraChannelName: string;
  recordingUrl?: string;
  createdAt: string;
}
