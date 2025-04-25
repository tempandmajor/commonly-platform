
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
