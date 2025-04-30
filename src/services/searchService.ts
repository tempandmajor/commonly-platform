
import { supabase } from "@/integrations/supabase/client";

export interface SearchResult {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  type: 'event' | 'venue' | 'user';
  created_at: string;
}

export interface EventWithDistance {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  date: string;
  location: string;
  location_lat: number;
  location_lng: number;
  distance_km: number;
}

// Global search across multiple tables
export const globalSearch = async (query: string, limit: number = 10): Promise<SearchResult[]> => {
  if (!query || query.trim() === '') {
    return [];
  }

  const { data, error } = await supabase
    .rpc('global_search', {
      search_query: query.trim(),
      limit_count: limit
    });

  if (error) {
    console.error('Error performing global search:', error);
    throw error;
  }

  // Ensure the data matches the SearchResult type
  return (data as SearchResult[]) || [];
};

// Search events by location
export const searchEventsByLocation = async (
  lat: number,
  lng: number,
  radius: number = 50,
  limit: number = 20
): Promise<EventWithDistance[]> => {
  const { data, error } = await supabase
    .rpc('search_events_by_location', {
      lat,
      lng,
      radius,
      limit_count: limit
    });

  if (error) {
    console.error('Error searching events by location:', error);
    throw error;
  }

  return data || [];
};

// Update event location coordinates
export const updateEventLocation = async (
  eventId: string,
  lat: number,
  lng: number
): Promise<void> => {
  const { error } = await supabase
    .from('events')
    .update({
      location_lat: lat,
      location_lng: lng
    })
    .eq('id', eventId);

  if (error) {
    console.error('Error updating event location:', error);
    throw error;
  }
};
