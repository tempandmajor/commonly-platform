
import { supabase } from '@/integrations/supabase/client';

export interface SearchResult {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  type: string;
  created_at: string;
}

export interface EventWithDistance {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  location: string;
  date: string;
  distance_km: number;
  created_by: string;
}

export const globalSearch = async (query: string): Promise<SearchResult[]> => {
  if (!query || query.length < 3) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('global_search_view')
      .select('*')
      .ilike('title', `%${query}%`)
      .limit(20);
      
    if (error) throw error;
    
    return data as SearchResult[];
  } catch (error) {
    console.error('Error in global search:', error);
    return [];
  }
};

export const searchEventsByLocation = async (
  latitude: number,
  longitude: number,
  radiusKm: number = 10
): Promise<EventWithDistance[]> => {
  try {
    const { data, error } = await supabase
      .rpc('find_events_by_location', {
        user_lat: latitude,
        user_lng: longitude,
        radius_km: radiusKm
      });
    
    if (error) throw error;
    
    return data as EventWithDistance[];
  } catch (error) {
    console.error('Error in location-based event search:', error);
    return [];
  }
};
