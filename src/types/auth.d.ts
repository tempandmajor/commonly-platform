
// User data structure
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
  isOnline?: boolean;
  lastSeen?: string | null;
}

// Authentication context type
export interface AuthContextType {
  currentUser: any | null;
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
  // Add Supabase specific methods while maintaining backward compatibility
  login: (email: string, password: string) => Promise<any>;
  signup: (email: string, password: string, displayName?: string) => Promise<any>;
  logout: () => Promise<void>;
  googleSignIn: () => Promise<any>;
  resetWalkthrough: () => Promise<void>;
  updateUserProfile: (data: Partial<UserData>) => Promise<void>;
  uploadProfileImage: (file: File) => Promise<string>;
  activateMerchantStore: () => Promise<void>;
}

// Chat message type
export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  recipientId: string;
  text?: string;
  imageUrl?: string;
  voiceUrl?: string;
  timestamp: string;
  read: boolean;
}

// Chat type
export interface Chat {
  id: string;
  participants: string[];
  lastMessage?: {
    text: string;
    senderId: string;
    timestamp: string;
    read: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

// Additional types for merchants
export interface MerchantStore {
  id: string;
  ownerId: string;
  name: string;
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  active?: boolean;
}

export interface Product {
  id: string;
  merchantId: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  inventoryCount: number;
  isDigital: boolean;
  digitalFileUrl?: string;
  createdAt: string;
  updatedAt: string;
  category?: string;
}

// Chat with user details
export interface ChatWithUser extends Chat {
  otherUser?: {
    id: string;
    displayName?: string;
    photoURL?: string;
    isOnline?: boolean;
    lastSeen?: string;
  };
  unreadCount: number;
}

// Notification types
export type NotificationType = 'message' | 'like' | 'follow' | 'comment' | 'podcast' | 'event' | 'system';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body?: string;
  imageUrl?: string;
  actionUrl?: string;
  read: boolean;
  createdAt: string;
  data?: Record<string, any>;
}

// Subscription and wallet types
export interface Subscription {
  id: string;
  userId: string;
  plan: string;
  status: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  cancelAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserWallet {
  userId: string;
  totalEarnings: number;
  availableBalance: number;
  pendingBalance: number;
  platformCredits: number;
  stripeConnectId?: string;
  hasPayoutMethod: boolean;
  createdAt: string;
  updatedAt: string;
  transactions: Transaction[];
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: string;
  status: string;
  description?: string;
  eventId?: string;
  referralId?: string;
  orderId?: string;
  paymentMethodId?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ReferralStats {
  totalReferrals: number;
  clickCount: number;
  conversionCount: number;
  totalEarnings: number;
  conversionRate: number;
  period: string;
}

export interface PaymentMethod {
  id: string;
  userId: string;
  type: string;
  last4: string;
  expMonth?: number;
  expYear?: number;
  isDefault: boolean;
  createdAt: string;
}

export interface FollowStats {
  followersCount: number;
  followingCount: number;
  followers: UserData[];
  following: UserData[];
}

export interface Order {
  id: string;
  status: string;
  total: number;
  customerName: string;
  createdAt: string;
  items: OrderItem[];
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  price: number;
  quantity: number;
}
