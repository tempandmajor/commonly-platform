
import { supabase } from "@/integrations/supabase/client";
import { UserData } from '@/types/auth';
import { SearchResult, SearchResults, LocationSearchParams, EventWithDistance } from '@/types/search';

/**
 * Performs a global search across events, venues, and users
 */
export const globalSearch = async (query: string): Promise<SearchResults> => {
  try {
    const { data, error } = await supabase.rpc('global_search', {
      search_query: query
    });
    
    if (error) throw error;
    
    const results = data || [];
    
    // Organize results by type
    const eventResults = results
      .filter(item => item.type === 'event')
      .map<SearchResult>((item) => {
        return {
          id: item.id,
          title: item.title,
          description: item.description,
          image_url: item.image_url,
          type: 'event',
          created_at: item.created_at,
        };
      });
    
    const venueResults = results
      .filter(item => item.type === 'venue')
      .map<SearchResult>((item) => {
        return {
          id: item.id,
          title: item.title,
          description: item.description,
          image_url: item.image_url,
          type: 'venue',
          created_at: item.created_at,
        };
      });
    
    const userResults = results
      .filter(item => item.type === 'user')
      .map<SearchResult>((item) => {
        return {
          id: item.id,
          title: item.title,
          description: item.description,
          image_url: item.image_url,
          type: 'user',
          created_at: item.created_at,
        };
      });
    
    const podcastResults = results
      .filter(item => item.type === 'podcast')
      .map<SearchResult>((item) => {
        return {
          id: item.id,
          title: item.title,
          description: item.description,
          image_url: item.image_url,
          type: 'podcast',
          created_at: item.created_at,
        };
      });
    
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
    return (data || []).map<EventWithDistance>((event) => {
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
    });
  } catch (error) {
    console.error('Error searching events by location:', error);
    return [];
  }
};
