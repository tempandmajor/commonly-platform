
import { supabase } from '@/integrations/supabase/client';

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
          // Handle filtering dynamically
          if (query) {
            query = query.eq(key, value);
          }
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
    const { error: updateError } = await supabase.rpc('increment_likes_count', { 
      event_id: eventId as any 
    });
    if (updateError) throw updateError;
    
  } catch (error) {
    console.error("Error liking event:", error);
    throw error;
  }
};

export const unlikeEvent = async (eventId: string, userId: string) => {
  try {
    const { error } = await supabase
      .from('event_likes')
      .delete()
      .eq('event_id', eventId)
      .eq('user_id', userId);
    
    if (error) throw error;

    // Update likes count
    const { error: updateError } = await supabase.rpc('decrement_likes_count', { 
      event_id: eventId as any 
    });
    if (updateError) throw updateError;
    
  } catch (error) {
    console.error("Error unliking event:", error);
    throw error;
  }
};

export const shareEvent = async (eventId: string, userId: string) => {
  try {
    const { error } = await supabase
      .from('event_shares')
      .insert({ event_id: eventId, user_id: userId });
    
    if (error) throw error;

    // Update shares count
    const { error: updateError } = await supabase.rpc('increment_shares_count', { 
      event_id: eventId as any 
    });
    if (updateError) throw updateError;
    
    return true;
  } catch (error) {
    console.error("Error sharing event:", error);
    throw error;
  }
};

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

export const uploadRecording = async (file: File, eventId: string) => {
  try {
    const fileExtension = file.name.split('.').pop();
    const fileName = `${eventId}/${Date.now()}.${fileExtension}`;
    const filePath = `recordings/${fileName}`;
    
    const { error: uploadError } = await supabase.storage
      .from('event_recordings')
      .upload(filePath, file);
    
    if (uploadError) throw uploadError;
    
    const { data } = supabase.storage
      .from('event_recordings')
      .getPublicUrl(filePath);
    
    // Update the event with the recording URL
    const { error } = await supabase
      .from('events')
      .update({ recording_url: data.publicUrl })
      .eq('id', eventId);
    
    if (error) throw error;
    
    return data.publicUrl;
  } catch (error) {
    console.error("Error uploading recording:", error);
    throw error;
  }
};

export const startStream = async (eventId: string, agoraChannel: string, agoraToken: string) => {
  try {
    const { error } = await supabase
      .from('events')
      .update({
        agora_channel: agoraChannel,
        agora_token: agoraToken,
        stream_started_at: new Date().toISOString()
      })
      .eq('id', eventId);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error("Error starting stream:", error);
    throw error;
  }
};

export const endStream = async (eventId: string) => {
  try {
    const { error } = await supabase
      .from('events')
      .update({
        stream_ended_at: new Date().toISOString()
      })
      .eq('id', eventId);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error("Error ending stream:", error);
    throw error;
  }
};
