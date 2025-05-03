
import { supabase } from "@/integrations/supabase/client";
import { Event } from "@/types/event";
import { Venue } from "@/types/venue";
import { SearchResult, EventWithDistance, SearchResults, LocationSearchParams } from "@/types/search";
import { UserData } from "@/types/auth";

// Properly export types
export type { SearchResult, EventWithDistance, SearchResults, LocationSearchParams };

/**
 * Perform a global search across multiple content types
 */
export const globalSearch = async (query: string, limit = 10): Promise<SearchResults> => {
  try {
    if (!query.trim()) {
      return { events: [], venues: [], users: [], podcasts: [] };
    }

    const { data, error } = await supabase
      .rpc('global_search', { 
        search_query: query.trim(),
        limit_count: limit 
      });

    if (error) throw error;

    // Group results by type
    const results: SearchResults = {
      events: [],
      venues: [],
      users: [],
      podcasts: []
    };

    if (data) {
      // Map the results to the proper format and categorize them
      data.forEach((item: any) => {
        const result: SearchResult = {
          id: item.id,
          title: item.title,
          description: item.description,
          imageUrl: item.image_url,
          type: item.type,
          createdAt: item.created_at
        };

        switch (item.type) {
          case 'event':
            results.events.push(result);
            break;
          case 'venue':
            results.venues.push(result);
            break;
          case 'user':
            results.users.push(result);
            break;
          case 'podcast':
            results.podcasts.push(result);
            break;
        }
      });
    }

    return results;
  } catch (error) {
    console.error("Error performing search:", error);
    return { events: [], venues: [], users: [], podcasts: [] };
  }
};

/**
 * Adapts event data from Supabase to our application format
 */
const adaptEvent = (event: any): SearchResult => {
  const result: SearchResult = {
    id: event.id,
    title: event.title,
    description: event.description,
    imageUrl: event.image_url,
    type: 'event',
    createdAt: event.created_at,
  };
  // Safely add optional properties
  if (event.category) {
    result.category = event.category;
  }
  return result;
};

/**
 * Adapts venue data from Supabase to our application format
 */
const adaptVenue = (venue: any): SearchResult => {
  const result: SearchResult = {
    id: venue.id,
    title: venue.name,
    description: venue.description,
    imageUrl: venue.image_url,
    type: 'venue',
    createdAt: venue.created_at,
  };
  // Safely add optional properties
  if (venue.latitude || venue.location_lat) {
    result.latitude = venue.latitude || venue.location_lat;
  }
  if (venue.longitude || venue.location_lng) {
    result.longitude = venue.longitude || venue.location_lng;
  }
  return result;
};

/**
 * Search for events near a specific location
 */
export const searchEventsByLocation = async (
  params: LocationSearchParams
): Promise<EventWithDistance[]> => {
  try {
    const { latitude, longitude, radius = 50, limit = 20 } = params;
    
    const { data, error } = await supabase
      .rpc('search_events_by_location', {
        lat: latitude,
        lng: longitude,
        radius,
        limit_count: limit
      });
    
    if (error) throw error;
    
    // Create proper Event objects with distance property
    return (data || []).map((event: any) => {
      // Create base Event object with all required properties
      const baseEvent: Event = {
        id: event.id,
        title: event.title,
        description: event.description || '',
        imageUrl: event.image_url,
        date: event.date,
        location: event.location || '',
        locationLat: event.location_lat || 0,
        locationLng: event.location_lng || 0,
        createdAt: event.created_at,
        createdBy: event.created_by || '',
        isVirtual: event.is_virtual || false,
        price: event.price || 0,
        published: true,
        attendees: [],
        category: event.category || 'general',
        tags: event.tags || [],
        organizer: event.organizer || { name: '', email: '', phone: '' },
        organizerId: event.organizer_id || '',
        eventType: event.event_type || 'general',
        ageRestriction: event.age_restriction || 'all',
        capacity: event.capacity || 0,
        ticketsAvailable: event.tickets_available || 0,
        updatedAt: event.updated_at || event.created_at
      };

      // Return as EventWithDistance
      return {
        ...baseEvent,
        distance: event.distance_km
      };
    });
  } catch (error) {
    console.error("Error searching events by location:", error);
    return [];
  }
};
