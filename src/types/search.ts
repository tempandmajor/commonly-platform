
// Define the search types that are missing
export interface SearchResult {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  type: 'event' | 'venue' | 'user' | 'podcast';
  createdAt: string;
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
}

export interface EventWithDistance {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  date: string;
  location: string;
  locationLat: number;
  locationLng: number;
  distance: number;
  createdAt: string;
  organizer: string;
  organizerId: string;
  eventType: string;
  ageRestriction: string | null;
  capacity: number;
  price: number;
  status: string;
}
