
import { supabase } from "@/integrations/supabase/client";
import { UserData } from '@/types/auth';
import { SearchResult, SearchResults, LocationSearchParams, EventWithDistance, SearchType } from '@/types/search';

/**
 * Type for raw search results coming from Supabase RPC
 */
interface RawSearchResult {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  type: string;
  created_at: string;
}

interface RawEventWithDistance {
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

/**
 * Converts a raw search result to a typed SearchResult
 */
const mapToSearchResult = (item: RawSearchResult): SearchResult => {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    image_url: item.image_url,
    type: item.type as SearchType,
    created_at: item.created_at,
  };
};

/**
 * Converts a raw event with distance to a typed EventWithDistance
 */
const mapToEventWithDistance = (event: RawEventWithDistance): EventWithDistance => {
  return {
    id: event.id,
    title: event.title,
    description: event.description,
    image_url: event.image_url,
    date: event.date,
    location: event.location,
    location_lat: event.location_lat,
    location_lng: event.location_lng,
    distance_km: event.distance_km
  };
};

/**
 * Performs a global search across events, venues, and users
 */
export const globalSearch = async (query: string): Promise<SearchResults> => {
  try {
    const { data, error } = await supabase.rpc('global_search', {
      search_query: query
    });
    
    if (error) throw error;
    
    const results = data as RawSearchResult[] || [];
    
    // Organize results by type
    const eventResults = results
      .filter(item => item.type === 'event')
      .map(mapToSearchResult);
    
    const venueResults = results
      .filter(item => item.type === 'venue')
      .map(mapToSearchResult);
    
    const userResults = results
      .filter(item => item.type === 'user')
      .map(mapToSearchResult);
    
    const podcastResults = results
      .filter(item => item.type === 'podcast')
      .map(mapToSearchResult);
    
    return {
      events: eventResults,
      venues: venueResults,
      users: userResults,
      podcasts: podcastResults,
    };
  } catch (error) {
    console.error('Global search error:', error);
    return { events: [], venues: [], users: [], podcasts: [] };
  }
};

/**
 * Search events by location
 */
export const searchEventsByLocation = async (params: LocationSearchParams): Promise<EventWithDistance[]> => {
  try {
    const { latitude, longitude, radius = 50, limit = 20 } = params;
    
    const { data, error } = await supabase.rpc(
      'search_events_by_location',
      {
        lat: latitude,
        lng: longitude,
        radius: radius,
        limit_count: limit
      }
    );
    
    if (error) throw error;
    
    // Convert to our app's Event model with distance information
    return (data as RawEventWithDistance[] || []).map(mapToEventWithDistance);
  } catch (error) {
    console.error('Error searching events by location:', error);
    return [];
  }
};
