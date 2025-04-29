
export interface UserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAdmin?: boolean;
  isPro?: boolean;
  isMerchant?: boolean;
  merchantStoreId?: string | null;
  createdAt?: string;
  followers?: string[];
  following?: string[];
  followerCount?: number;
  followingCount?: number;
  isPrivate?: boolean;
  hasTwoFactorEnabled?: boolean;
  bio?: string;
  recentLogin?: boolean; // Added this property that was missing
}

export interface AuthContextType {
  currentUser: any;
  userData: UserData | null;
  loading: boolean;
  signup: (email: string, password: string, displayName: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  googleSignIn: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (data: Partial<UserData>) => Promise<void>;
  uploadProfileImage: (file: File) => Promise<string>;
  resetWalkthrough: () => Promise<void>;
  followUser: (userId: string) => Promise<void>;
  unfollowUser: (userId: string) => Promise<void>;
  isFollowing: (userId: string) => boolean;
  enableTwoFactorAuth: () => Promise<void>;
  disableTwoFactorAuth: () => Promise<void>;
  activateMerchantStore?: () => Promise<void>;
}
