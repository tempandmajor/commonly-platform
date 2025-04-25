
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
}

export interface UserWallet {
  userId: string;
  balance: number;
  totalEarned: number;
  lastPayout?: Date;
}
