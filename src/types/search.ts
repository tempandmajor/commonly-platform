
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

export interface SearchResults {
  events: Array<{
    id: string;
    title: string;
    description: string | null;
    image_url: string | null;
    type: string;
    created_at: string;
  }>;
  venues: Array<{
    id: string;
    title: string; // name is mapped to title
    description: string | null;
    image_url: string | null;
    type: string;
    created_at: string;
  }>;
  users: Array<{
    id: string;
    title: string; // display_name is mapped to title
    description: string | null; // bio is mapped to description
    image_url: string | null; // photo_url is mapped to image_url
    type: string;
    created_at: string;
  }>;
  podcasts: Array<{
    id: string;
    title: string;
    description: string | null;
    image_url: string | null;
    type: string;
    created_at: string;
  }>;
}

