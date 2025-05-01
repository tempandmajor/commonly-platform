
export interface UserData {
  uid: string;
  email: string;
  displayName?: string;
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
  merchantStoreId?: string | null;
  createdAt?: string;
  recentLogin?: boolean;
}

export interface UserSession {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
}
