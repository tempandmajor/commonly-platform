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
