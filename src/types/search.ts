
import { Event } from './event';
import { Venue } from './venue';
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

export interface EventWithDistance extends Event {
  distance: number;
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
