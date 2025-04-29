
import { supabase } from '@/integrations/supabase/client';

/**
 * Adds a like to an event from a user
 */
export const likeEvent = async (eventId: string, userId: string) => {
  try {
    const { error } = await supabase
      .from('event_likes')
      .insert({ event_id: eventId, user_id: userId });
    
    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        console.log('User already liked this event');
        return;
      }
      throw error;
    }

    // Update likes count
    // Cast parameters to proper type to avoid "not assignable to parameter of type 'never'" error
    const { error: updateError } = await supabase.rpc(
      'increment_likes_count', 
      { event_id: eventId } as unknown as Record<string, never>
    );
    
    if (updateError) throw updateError;
    
  } catch (error) {
    console.error("Error liking event:", error);
    throw error;
  }
};

/**
 * Removes a like from an event by a user
 */
export const unlikeEvent = async (eventId: string, userId: string) => {
  try {
    const { error } = await supabase
      .from('event_likes')
      .delete()
      .eq('event_id', eventId)
      .eq('user_id', userId);
    
    if (error) throw error;

    // Update likes count
    const { error: updateError } = await supabase.rpc(
      'decrement_likes_count',
      { event_id: eventId } as unknown as Record<string, never>
    );
    
    if (updateError) throw updateError;
    
  } catch (error) {
    console.error("Error unliking event:", error);
    throw error;
  }
};

/**
 * Records a share of an event by a user
 */
export const shareEvent = async (eventId: string, userId: string) => {
  try {
    const { error } = await supabase
      .from('event_shares')
      .insert({ event_id: eventId, user_id: userId });
    
    if (error) throw error;

    // Update shares count
    const { error: updateError } = await supabase.rpc(
      'increment_shares_count',
      { event_id: eventId } as unknown as Record<string, never>
    );
    
    if (updateError) throw updateError;
    
    return true;
  } catch (error) {
    console.error("Error sharing event:", error);
    throw error;
  }
};
