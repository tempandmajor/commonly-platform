
import { User } from "@supabase/supabase-js";
import { AdaptedUser } from "@/utils/userAdapter";

export interface UserData {
  uid: string;
  email: string | null;
  displayName?: string | null;
  photoURL?: string | null;
  bio?: string | null;
  isAdmin?: boolean;
  isPro?: boolean;
  isMerchant?: boolean;
  isPrivate?: boolean;
  isOnline?: boolean;
  lastSeen?: string | null;
  followerCount?: number;
  followingCount?: number;
  following?: string[];
  followers?: string[];
  merchantStoreId?: string | null;
  createdAt?: string;
  recentLogin?: boolean;
  hasTwoFactorEnabled?: boolean;
}

export interface UserSession {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
}

export interface AuthContextType {
  currentUser: AdaptedUser | null;
  userData: UserData | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, displayName?: string) => Promise<any>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: Partial<UserData>) => Promise<void>;
  deleteAccount: () => Promise<void>;
  followUser: (userId: string) => Promise<void>;
  unfollowUser: (userId: string) => Promise<void>;
  isFollowing: (userId: string) => boolean;
  enableTwoFactorAuth: () => Promise<void>;
  disableTwoFactorAuth: () => Promise<void>;
  // Supabase specific methods
  login: (email: string, password: string) => Promise<any>;
  signup: (email: string, password: string, displayName?: string) => Promise<any>;
  logout: () => Promise<void>;
  googleSignIn: () => Promise<any>;
  resetWalkthrough: () => Promise<void>;
  updateUserProfile: (data: Partial<UserData>) => Promise<void>;
  uploadProfileImage: (file: File) => Promise<string>;
  activateMerchantStore: () => Promise<void>;
}
