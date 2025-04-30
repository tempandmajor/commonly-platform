
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
  recentLogin?: boolean;
  notificationSettings?: NotificationSettings;
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

// Wallet related types
export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: 'sale' | 'payout' | 'withdrawal' | 'referral' | 'credit' | 'fee';
  status: 'pending' | 'completed' | 'failed' | 'canceled';
  description: string;
  createdAt: string | Date;
  updatedAt?: string | Date;
  referralId?: string;
  eventId?: string;
  orderId?: string;
}

export interface UserWallet {
  id?: string; // Added to match usage in services
  userId: string;
  availableBalance: number;
  pendingBalance: number;
  totalEarnings: number;
  platformCredits: number;
  hasPayoutMethod: boolean;
  stripeConnectId?: string;
  transactions: Transaction[];
  lastUpdated: string | Date;
  createdAt?: string | Date; // Added to match usage in services
  updatedAt?: string | Date; // Added to match usage in services
}

export interface PaymentMethod {
  id: string;
  userId: string;
  type: 'card' | 'bank';
  last4: string;
  expiryMonth?: number;
  expiryYear?: number;
  brand?: string;
  isDefault: boolean;
  createdAt: string | Date;
}

export interface ReferralStats {
  userId: string;
  totalReferrals: number;
  clickCount: number;
  conversionCount: number;
  conversionRate: number;
  totalEarnings: number;
  period: 'week' | 'month' | 'year' | 'all';
}

// Chat related types
export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  recipientId: string;
  text: string;
  timestamp: any; // Firebase timestamp or Date
  read: boolean;
  imageUrl?: string;
  voiceUrl?: string;
}

export interface Chat {
  id: string;
  participants: string[];
  createdAt: any; // Firebase timestamp or Date
  updatedAt: any; // Firebase timestamp or Date
  lastMessage?: {
    id?: string;
    text: string;
    timestamp: any; // Firebase timestamp or Date
    senderId: string;
    recipientId: string;
    read: boolean;
    hasImage?: boolean;
    hasVoice?: boolean;
  };
}

// Merchant related types
export interface MerchantStore {
  id: string;
  userId: string;
  name: string;
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
  logo?: string; 
  banner?: string; 
  ownerId?: string; 
  isActive?: boolean; 
  createdAt: string | Date | any; 
  updatedAt: string | Date | any; 
  isVerified: boolean;
  productCount: number;
  orderCount: number;
  totalSales: number;
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
  isDigital: boolean;
  isAvailable: boolean;
  isActive?: boolean; // Added to match usage in services
  createdAt: string | Date | any; // Modified to account for Firebase FieldValue
  updatedAt: string | Date | any; // Modified to account for Firebase FieldValue
  salesCount?: number;
}

// Subscription related types
export interface Subscription {
  id: string;
  userId: string;
  plan: 'free' | 'pro' | 'enterprise';
  status: 'active' | 'canceled' | 'past_due' | 'trial';
  currentPeriodStart: string | Date;
  currentPeriodEnd: string | Date;
  cancelAtPeriodEnd: boolean;
  createdAt: string | Date;
  trialEnd?: string | Date | null;
  paymentMethodId?: string;
  priceId?: string;
}

// Follow stats
export interface FollowStats {
  userId: string;
  followersCount: number;
  followingCount: number;
  mutualCount: number;
  recentFollowers: UserData[];
  recentFollowing: UserData[];
}

// Notification related types
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  data?: Record<string, any>;
  createdAt: any; // Firebase timestamp or Date
  image?: string;
}

export type NotificationType = 
  | 'event_update' 
  | 'new_follower' 
  | 'referral_earnings' 
  | 'message' 
  | 'sponsorship' 
  | 'payout'
  | 'system';

export interface NotificationSettings {
  email: {
    eventUpdates: boolean;
    newFollowers: boolean;
    messages: boolean;
    earnings: boolean;
    marketing: boolean;
  };
  push: {
    eventUpdates: boolean;
    newFollowers: boolean;
    messages: boolean;
    earnings: boolean;
  };
  inApp: {
    eventUpdates: boolean;
    newFollowers: boolean;
    messages: boolean;
    earnings: boolean;
  };
}

export interface NotificationBadge {
  unreadCount: number;
  lastChecked: any; // Firebase timestamp or Date
}
