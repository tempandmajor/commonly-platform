import { supabase } from "@/integrations/supabase/client";
import { Event, EventWithDistance, SearchResult, VenueSearchResult, UserSearchResult } from "@/types/search";

// Global search across events, venues, and users
export const globalSearch = async (query: string, limit = 10): Promise<SearchResult[]> => {
  try {
    if (!query) return [];

    const { data, error } = await supabase.rpc('global_search', {
      search_query: query,
      limit_count: limit
    });

    if (error) {
      console.error("Search error:", error);
      throw error;
    }

    return (data || []).map((item: any) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      imageUrl: item.image_url,
      type: item.type,
      createdAt: item.created_at
    }));
  } catch (error) {
    console.error("Error in globalSearch:", error);
    return [];
  }
};

// Search events by location
export const searchEventsByLocation = async (
  lat: number, 
  lng: number, 
  radius: number = 50, 
  limit: number = 20
): Promise<EventWithDistance[]> => {
  try {
    const { data, error } = await supabase.rpc('search_events_by_location', {
      lat,
      lng,
      radius,
      limit_count: limit
    });

    if (error) {
      console.error("Location search error:", error);
      throw error;
    }

    // Type assertion to adapt the returned data structure
    return (data || []).map((item: any): EventWithDistance => ({
      id: item.id,
      title: item.title,
      description: item.description,
      imageUrl: item.image_url,
      date: new Date(item.date),
      location: item.location,
      locationLat: item.location_lat,
      locationLng: item.location_lng,
      distanceKm: item.distance_km,
      createdBy: 'unknown', // This field might not be available from the RPC
      category: 'uncategorized', // This field might not be available from the RPC
      attendees: [] // This field might not be available from the RPC
    }));
  } catch (error) {
    console.error("Error in searchEventsByLocation:", error);
    return [];
  }
};

// Search events by text
export const searchEvents = async (query: string, limit = 20): Promise<Event[]> => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .or(`title.ilike.%${query}%,description.ilike.%${query}%,location.ilike.%${query}%`)
      .eq('published', true)
      .limit(limit);

    if (error) {
      console.error("Event search error:", error);
      throw error;
    }

    return (data || []).map(event => ({
      id: event.id,
      title: event.title,
      description: event.description,
      imageUrl: event.image_url,
      date: new Date(event.date),
      location: event.location,
      locationLat: event.location_lat,
      locationLng: event.location_lng,
      createdBy: event.created_by,
      category: event.category,
      attendees: []
    }));
  } catch (error) {
    console.error("Error in searchEvents:", error);
    return [];
  }
};

// Search venues
export const searchVenues = async (query: string, limit = 20): Promise<VenueSearchResult[]> => {
  try {
    const { data, error } = await supabase
      .from('venues')
      .select('*')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%,address.ilike.%${query}%`)
      .limit(limit);

    if (error) {
      console.error("Venue search error:", error);
      throw error;
    }

    return (data || []).map(venue => ({
      id: venue.id,
      name: venue.name,
      description: venue.description,
      imageUrl: venue.image_url,
      address: venue.address,
      latitude: venue.latitude,
      longitude: venue.longitude
    }));
  } catch (error) {
    console.error("Error in searchVenues:", error);
    return [];
  }
};

// Search users
export const searchUsers = async (query: string, limit = 20): Promise<UserSearchResult[]> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, display_name, photo_url, bio')
      .or(`display_name.ilike.%${query}%,bio.ilike.%${query}%`)
      .limit(limit);

    if (error) {
      console.error("User search error:", error);
      throw error;
    }

    return (data || []).map(user => ({
      id: user.id,
      displayName: user.display_name,
      photoURL: user.photo_url,
      bio: user.bio
    }));
  } catch (error) {
    console.error("Error in searchUsers:", error);
    return [];
  }
};
