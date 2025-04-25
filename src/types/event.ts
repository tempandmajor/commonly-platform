
export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  imageUrl: string;
  category: string;
  price: number;
  organizer: string;
  organizerId: string;
  createdAt: string;
  updatedAt: string;
  published: boolean;
  scheduledPublishDate?: string;
  isPrivate: boolean;
  isFree: boolean;
  ageRestriction: string;
  eventType: "single" | "multi" | "tour";
  endDate?: string;
  rewards?: string;
  stripeConnectId?: string;
  eventDuration?: string;
  sponsorshipTiers?: SponsorshipTier[];
  preSaleGoal?: number;
  preSaleCount?: number;
  referralPercentage?: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface EventReport {
  id: string;
  eventId: string;
  reporterId: string;
  reporterEmail: string;
  reason: string;
  description: string;
  status: "pending" | "reviewed" | "resolved";
  createdAt: string;
}

export interface EventDraft {
  id: string;
  userId: string;
  eventData: Partial<Event>;
  lastSaved: string;
}

export interface SponsorshipTier {
  id?: string; // Making id optional during creation
  name: string;
  price: number;
  benefits: string[];
  limitedSpots?: number;
  spotsTaken?: number;
}

export interface Referral {
  id: string;
  userId: string;
  eventId: string;
  code: string;
  createdAt: string;
  clickCount: number;
  conversionCount: number;
  earnings: number;
}

export interface UserWallet {
  userId: string;
  totalEarnings: number;
  availableBalance: number;
  pendingBalance: number;
  transactions: WalletTransaction[];
}

export interface WalletTransaction {
  id: string;
  amount: number;
  type: "referral" | "sponsorship" | "withdrawal" | "other";
  status: "pending" | "completed" | "failed";
  description: string;
  createdAt: string;
  eventId?: string;
  referralId?: string;
}
