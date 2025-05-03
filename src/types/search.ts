
// Define search types that need to be exported
export interface LocationSearchParams {
  latitude: number;
  longitude: number;
  radius?: number;
  limit?: number;
}

export interface EventWithDistance {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  date: string | null;
  location: string | null;
  location_lat: number;
  location_lng: number;
  distance_km: number;
}

// Add SearchResult interface that's needed by components
export interface SearchResult {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  type: string;
  created_at: string;
}

export interface SearchResults {
  events: Array<SearchResult>;
  venues: Array<SearchResult>;
  users: Array<SearchResult>;
  podcasts: Array<SearchResult>;
}
