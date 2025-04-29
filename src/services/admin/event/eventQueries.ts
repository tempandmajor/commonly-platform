
import { supabase } from '@/integrations/supabase/client';

/**
 * Retrieves events for the admin dashboard with filtering and pagination options
 */
export const getAdminEvents = async (
  limit = 20,
  offset = 0,
  filterOptions: Record<string, any> = {}
) => {
  try {
    let query = supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    // Apply filters if any
    if (Object.keys(filterOptions).length > 0) {
      Object.entries(filterOptions).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          // Handle filtering dynamically - using explicit any type to avoid recursive type inference
          query = (query as any).eq(key, value);
        }
      });
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error("Error fetching admin events:", error);
    throw error;
  }
};

/**
 * Retrieves virtual events with pagination options
 */
export const getVirtualEvents = async (
  limit = 20,
  offset = 0
) => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('is_virtual', true)
      .eq('published', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error("Error fetching virtual events:", error);
    throw error;
  }
};

/**
 * Retrieves currently live streaming events
 */
export const getLiveEvents = async (
  limit = 20,
  offset = 0
) => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('is_virtual', true)
      .not('stream_started_at', 'is', null)
      .is('stream_ended_at', null)
      .order('stream_started_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error("Error fetching live events:", error);
    throw error;
  }
};

/**
 * Checks if a user has liked an event
 */
export const checkIfUserLiked = async (eventId: string, userId: string) => {
  try {
    const { data, error } = await supabase
      .from('event_likes')
      .select('*')
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "not found" error

    return !!data;
  } catch (error) {
    console.error("Error checking if user liked event:", error);
    throw error;
  }
};
