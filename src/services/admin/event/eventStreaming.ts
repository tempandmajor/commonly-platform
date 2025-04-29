
import { supabase } from '@/integrations/supabase/client';

/**
 * Starts a livestream for an event
 */
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

/**
 * Ends a livestream for an event
 */
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

/**
 * Uploads a recording for an event
 */
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
