
import { supabase } from '@/integrations/supabase/client';
import { EventEngagement } from '@/types/event';

/**
 * Get engagement metrics for an event
 */
export const getEventEngagement = async (eventId: string): Promise<EventEngagement> => {
  try {
    const { data: eventData, error: eventError } = await supabase
      .from('events')
      .select('likes_count, shares_count')
      .eq('id', eventId)
      .single();
    
    if (eventError) throw eventError;
    
    return {
      likes: eventData.likes_count || 0,
      shares: eventData.shares_count || 0,
    };
  } catch (error) {
    console.error('Error getting event engagement:', error);
    return {
      likes: 0,
      shares: 0,
    };
  }
};

/**
 * Increase the like count for an event
 */
export const likeEvent = async (
  eventId: string,
  userId: string
): Promise<boolean> => {
  try {
    // Check if user already liked the event
    const { data: existingLike } = await supabase
      .from('event_likes')
      .select('id')
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .single();
    
    if (existingLike) {
      return false; // User already liked this event
    }
    
    // Add like record
    const { error: likeError } = await supabase
      .from('event_likes')
      .insert([{ event_id: eventId, user_id: userId }]);
    
    if (likeError) throw likeError;
    
    // Increment likes count in events table
    const { error: updateError } = await supabase.rpc('increment_event_likes', { 
      event_id_param: eventId 
    });
    
    if (updateError) throw updateError;
    
    return true;
  } catch (error) {
    console.error('Error liking event:', error);
    return false;
  }
};

/**
 * Record a share for an event
 */
export const shareEvent = async (
  eventId: string,
  userId: string
): Promise<boolean> => {
  try {
    // Record share
    const { error: shareError } = await supabase
      .from('event_shares')
      .insert([{ event_id: eventId, user_id: userId }]);
    
    if (shareError) throw shareError;
    
    // Increment shares count in events table
    const { error: updateError } = await supabase.rpc('increment_event_shares', { 
      event_id_param: eventId 
    });
    
    if (updateError) throw updateError;
    
    return true;
  } catch (error) {
    console.error('Error sharing event:', error);
    return false;
  }
};

/**
 * Check if a user has already liked an event
 */
export const hasUserLikedEvent = async (
  eventId: string,
  userId: string
): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('event_likes')
      .select('id')
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    
    return !!data; // Returns true if like exists, false otherwise
  } catch (error) {
    console.error('Error checking if user liked event:', error);
    return false;
  }
};
