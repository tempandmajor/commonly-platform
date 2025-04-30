// Update the AuthContextType to include the loading property
export interface AuthContextType {
  currentUser: any | null;
  userData: UserData | null;
  loading: boolean;  // Add this property to fix the TypeScript error
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
}

// Keep the rest of the file as it is
export interface UserData {
  uid: string;
  email?: string | null;
  displayName?: string | null;
  photoURL?: string | null;
  isAdmin?: boolean;
  isPro?: boolean;
  isMerchant?: boolean;
  merchantStoreId?: string | null;
  followers?: string[];
  following?: string[];
  followerCount?: number;
  followingCount?: number;
  isPrivate?: boolean;
  hasTwoFactorEnabled?: boolean;
  bio?: string | null;
  recentLogin?: boolean;
  createdAt?: string;
}

// Keep other interfaces in this file as they are
export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  recipientId: string;
  text?: string;
  imageUrl?: string;
  voiceUrl?: string;
  timestamp: any;
  read: boolean;
}

export interface Chat {
  id: string;
  participants: string[];
  lastMessage?: {
    text: string;
    senderId: string;
    timestamp: any;
    read: boolean;
  };
  createdAt: any;
  updatedAt: any;
}
