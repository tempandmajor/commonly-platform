
import { UserData } from './auth';

export interface SearchResult {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  type: 'event' | 'venue' | 'user' | 'podcast';
  createdAt: string;
  category?: string;
  latitude?: number;
  longitude?: number;
}

export interface EventWithDistance {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  date?: string;
  location?: string;
  locationLat?: number;
  locationLng?: number;
  distance?: number;
  createdAt?: string;
  organizer: string;
  organizerId: string;
  eventType: 'in-person' | 'virtual' | 'hybrid';
  ageRestriction: string | null;
  capacity: number;
  price: number;
  status: 'draft' | 'active' | 'canceled' | 'completed';
}

export interface SearchResults {
  events: SearchResult[];
  venues: SearchResult[];
  users: SearchResult[];
  podcasts: SearchResult[];
}

export interface LocationSearchParams {
  latitude: number;
  longitude: number;
  radius?: number;
  limit?: number;
}
