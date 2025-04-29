
export interface SponsorshipTier {
  id?: string;
  name: string;
  price: number;
  benefits: string[];
  limitedSpots?: number;
  spotsTaken?: number;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  date: string;
  location: string;
  price: number;
  organizer: string;
  organizerId: string;
  published: boolean;
  category: string;
  eventType: 'single' | 'multi' | 'tour';
  ageRestriction: 'all' | '13+' | '18+' | '21+';
  isPrivate: boolean;
  isFree: boolean;
  isVirtual?: boolean;
  agoraChannel?: string;
  agoraToken?: string;
  streamStartedAt?: string;
  streamEndedAt?: string;
  recordingUrl?: string;
  likesCount?: number;
  sharesCount?: number;
  rewards?: string;
  scheduledPublishDate?: string;
  endDate?: string;
  eventDuration?: string;
  stripeConnectId?: string;
  sponsorshipTiers?: SponsorshipTier[];
  preSaleGoal?: number;
  preSaleCount?: number;
  referralPercentage: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface EventDraft {
  id: string;
  userId: string;
  eventData: Partial<Event>;
  lastSaved: Date;
}

export interface EventReport {
  id: string;
  eventId: string;
  userId: string;
  reporterEmail?: string;
  reason: string;
  description: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: Date;
}

export interface Referral {
  id: string;
  eventId: string;
  referrerId: string;
  purchaserId: string;
  amount: number;
  status: 'pending' | 'paid';
  createdAt: Date;
  code: string;
  earnings: number;
  conversionCount: number;
}

export interface UserWallet {
  userId: string;
  balance: number;
  totalEarned: number;
  lastPayout?: Date;
  availableBalance: number;
  pendingBalance: number;
  totalEarnings: number;
  transactions: Array<{
    id: string;
    amount: number;
    description: string;
    type: 'referral' | 'withdrawal';
    status: 'pending' | 'completed';
    createdAt: string | Date;
  }>;
}
