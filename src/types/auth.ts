
import { User } from "firebase/auth";

export interface UserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  recentLogin: boolean;
  createdAt?: any;
  stripeConnectId?: string;
  followers?: string[];
  following?: string[];
  followerCount?: number;
  followingCount?: number;
  isPrivate?: boolean;
  hasTwoFactorEnabled?: boolean;
  bio?: string;
  isMerchant?: boolean;
  merchantStoreId?: string;
}

export interface AuthContextType {
  currentUser: User | null;
  userData: UserData | null;
  signup: (email: string, password: string, displayName: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  googleSignIn: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (data: Partial<UserData>) => Promise<void>;
  uploadProfileImage: (file: File) => Promise<string>;
  resetWalkthrough: () => Promise<void>;
  loading: boolean;
  followUser: (userId: string) => Promise<void>;
  unfollowUser: (userId: string) => Promise<void>;
  isFollowing: (userId: string) => boolean;
  enableTwoFactorAuth: () => Promise<void>;
  disableTwoFactorAuth: () => Promise<void>;
  activateMerchantStore: () => Promise<void>;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  recipientId: string;
  text: string;
  timestamp: any; // Firebase Timestamp
  read: boolean;
}

export interface Chat {
  id: string;
  participants: string[];
  lastMessage?: ChatMessage;
  createdAt: any;
  updatedAt: any;
}

export interface Subscription {
  id: string;
  userId: string;
  stripeSubscriptionId: string;
  status: 'active' | 'canceled' | 'past_due';
  currentPeriodEnd: any;
  plan: 'pro';
  createdAt: any;
}

export interface FollowStats {
  userId: string;
  followerCount: number;
  followingCount: number;
}

export interface Product {
  id: string;
  storeId: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  inventory: number;
  createdAt: any;
  updatedAt: any;
  isActive: boolean;
  stripeProductId?: string;
  stripePriceId?: string;
}

export interface MerchantStore {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  logo?: string;
  banner?: string;
  createdAt: any;
  updatedAt: any;
  isActive: boolean;
}
