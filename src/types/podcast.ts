
import { User } from "firebase/auth";
import { UserData } from "./auth";

export type PodcastType = "audio" | "video";

export interface Podcast {
  id: string;
  title: string;
  description: string;
  creatorId: string;
  creatorName: string;
  thumbnailUrl?: string;
  audioUrl?: string;
  videoUrl?: string;
  duration: number; // in seconds
  type: PodcastType;
  category: string;
  isExternal: boolean; // Whether it was recorded on Commonly or uploaded
  visibility: "public" | "private" | "unlisted";
  listens: number;
  createdAt: any; // Firebase timestamp
  updatedAt: any;
  tags?: string[];
}

export interface PodcastCategory {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
}

export interface PodcastComment {
  id: string;
  podcastId: string;
  userId: string;
  userName: string;
  userPhotoUrl?: string;
  content: string;
  createdAt: any;
  likes: number;
}

export interface PodcastSession {
  id: string;
  hostId: string;
  title: string;
  description?: string;
  scheduledFor: any;
  duration: number; // scheduled duration in minutes
  participants: string[]; // User IDs
  status: "scheduled" | "live" | "completed" | "canceled";
  agoraChannelName: string;
  agoraToken?: string;
  recordingUrl?: string;
  createdAt: any;
  thumbnailUrl?: string;
}
