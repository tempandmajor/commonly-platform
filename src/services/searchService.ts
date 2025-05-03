
import { supabase } from "@/integrations/supabase/client";
import { UserData } from '@/types/auth';
import { SearchResult, SearchResults, LocationSearchParams, EventWithDistance } from '@/types/search';

// Export types
export type { SearchResult, SearchResults, LocationSearchParams, EventWithDistance };

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
      .map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        imageUrl: item.image_url,
        type: 'event' as const,
        createdAt: item.created_at,
      }));
    
    const venueResults = results
      .filter(item => item.type === 'venue')
      .map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        imageUrl: item.image_url,
        type: 'venue' as const,
        createdAt: item.created_at,
      }));
    
    const userResults = results
      .filter(item => item.type === 'user')
      .map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        imageUrl: item.image_url,
        type: 'user' as const,
        createdAt: item.created_at,
      }));
    
    const podcastResults = results
      .filter(item => item.type === 'podcast')
      .map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        imageUrl: item.image_url,
        type: 'podcast' as const,
        createdAt: item.created_at,
      }));
    
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
    const { latitude, longitude, radius = 50 } = params;
    
    const { data, error } = await supabase.rpc(
      'search_events_by_location',
      {
        lat: latitude,
        lng: longitude,
        radius_km: radius
      }
    );
    
    if (error) throw error;
    
    // Convert to our app's Event model with distance information
    return (data || []).map(event => ({
      id: event.id,
      title: event.title,
      description: event.description,
      imageUrl: event.image_url,
      date: event.date,
      location: event.location,
      locationLat: event.location_lat,
      locationLng: event.location_lng,
      distance: event.distance_km,
      createdAt: event.created_at,
      organizer: '',
      organizerId: '',
      eventType: 'in-person',
      ageRestriction: null,
      capacity: 0,
      price: 0,
      status: 'active'
    }));
  } catch (error) {
    console.error('Error searching events by location:', error);
    return [];
  }
};
