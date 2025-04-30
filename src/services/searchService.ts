
import { supabase } from "@/integrations/supabase/client";
import { Event } from "@/types/event";

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

export const searchEventsByLocation = async (
  lat: number,
  lng: number,
  radius: number = 50
): Promise<EventWithDistance[]> => {
  try {
    const { data, error } = await supabase.rpc('search_events_by_location', {
      lat,
      lng,
      radius
    });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error searching events by location:', error);
    return [];
  }
};

export const globalSearch = async (query: string, limit: number = 10) => {
  try {
    const { data, error } = await supabase.rpc('global_search', {
      search_query: query,
      limit_count: limit
    });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error performing global search:', error);
    return [];
  }
};
