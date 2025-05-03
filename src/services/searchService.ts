
import { supabase } from "@/integrations/supabase/client";
import { SearchResult, SearchResults, LocationSearchParams, EventWithDistance, SearchType } from '@/types/search';

/**
 * Interface for raw search results coming from Supabase RPC
 */
interface RawSearchResult {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  type: string;
  created_at: string;
}

/**
 * Interface for raw events with distance from Supabase RPC
 */
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
 * Error class for search-related errors
 */
export class SearchError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'SearchError';
  }
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
 * Organizes search results by their type
 */
const organizeSearchResults = (results: RawSearchResult[]): SearchResults => {
  return {
    events: results.filter(item => item.type === 'event').map(mapToSearchResult),
    venues: results.filter(item => item.type === 'venue').map(mapToSearchResult),
    users: results.filter(item => item.type === 'user').map(mapToSearchResult),
    podcasts: results.filter(item => item.type === 'podcast').map(mapToSearchResult),
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
    
    if (error) {
      throw new SearchError(`Global search failed: ${error.message}`, error.code);
    }
    
    // Fixed: Properly handle the data type by checking if it's an array first
    const results = Array.isArray(data) ? data as RawSearchResult[] : [];
    
    return organizeSearchResults(results);
  } catch (error) {
    console.error('Global search error:', error);
    if (error instanceof SearchError) {
      throw error;
    }
    throw new SearchError('Failed to perform global search');
  }
};

/**
 * Search events by location with distance calculation
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
    
    if (error) {
      throw new SearchError(`Location search failed: ${error.message}`, error.code);
    }
    
    // Fixed: Properly handle the data type by checking if it's an array first
    const results = Array.isArray(data) ? data as RawEventWithDistance[] : [];
    
    return results.map(mapToEventWithDistance);
  } catch (error) {
    console.error('Error searching events by location:', error);
    if (error instanceof SearchError) {
      throw error;
    }
    throw new SearchError('Failed to search events by location');
  }
};
