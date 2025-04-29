
import { supabase } from '@/integrations/supabase/client';

/**
 * Add a like to an event
 * @param eventId The ID of the event to like
 * @param userId The ID of the user liking the event
 */
export const likeEvent = async (eventId: string, userId: string) => {
  try {
    const { data: existingLike, error: checkError } = await supabase
      .from('event_likes')
      .select('id')
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // Not PGRST116 (not found)
      throw checkError;
    }

    // If like doesn't exist, create it
    if (!existingLike) {
      const { error } = await supabase
        .from('event_likes')
        .insert({
          event_id: eventId as any, // Type assertion to fix error
          user_id: userId,
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      // Increment like count in events table
      const { error: updateError } = await supabase.rpc(
        'increment_event_likes',
        { event_id: eventId }
      );

      if (updateError) throw updateError;
    }

    return true;
  } catch (error) {
    console.error("Error liking event:", error);
    throw error;
  }
};

/**
 * Remove a like from an event
 * @param eventId The ID of the event to unlike
 * @param userId The ID of the user unliking the event
 */
export const unlikeEvent = async (eventId: string, userId: string) => {
  try {
    const { error } = await supabase
      .from('event_likes')
      .delete()
      .eq('event_id', eventId)
      .eq('user_id', userId);

    if (error) throw error;

    // Decrement like count in events table
    const { error: updateError } = await supabase.rpc(
      'decrement_event_likes',
      { event_id: eventId as any } // Type assertion to fix error
    );

    if (updateError) throw updateError;

    return true;
  } catch (error) {
    console.error("Error unliking event:", error);
    throw error;
  }
};

/**
 * Check if a user has liked an event
 */
export const checkIfUserLiked = async (eventId: string, userId: string) => {
  try {
    const { data, error } = await supabase
      .from('event_likes')
      .select('id')
      .eq('event_id', eventId as any) // Type assertion to fix error
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // Not found
        return false;
      }
      throw error;
    }

    return !!data;
  } catch (error) {
    console.error("Error checking if user liked event:", error);
    throw error;
  }
};

/**
 * Record a share of an event
 */
export const shareEvent = async (eventId: string, userId: string, platform: string) => {
  try {
    const { error } = await supabase
      .from('event_shares')
      .insert({
        event_id: eventId,
        user_id: userId,
        platform,
        created_at: new Date().toISOString()
      });

    if (error) throw error;

    // Increment share count in events table
    const { error: updateError } = await supabase.rpc(
      'increment_event_shares',
      { event_id: eventId }
    );

    if (updateError) throw updateError;

    return true;
  } catch (error) {
    console.error("Error recording event share:", error);
    throw error;
  }
};
