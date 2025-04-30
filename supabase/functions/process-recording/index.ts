
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

// Get secrets from environment variables
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const agoraCustomerId = Deno.env.get("AGORA_CUSTOMER_ID") || "";
const agoraCustomerSecret = Deno.env.get("AGORA_CUSTOMER_SECRET") || "";

// Set CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Initialize Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { eventId, channelName, userId } = await req.json();
    
    if (!eventId || !channelName) {
      return new Response(
        JSON.stringify({ error: "Event ID and channel name are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Get the recording from Agora Cloud Recording
    const recordingUrl = await getRecordingUrl(channelName);
    
    if (recordingUrl) {
      // Update event with recording URL
      const { error: updateError } = await supabase
        .from('events')
        .update({ recording_url: recordingUrl, stream_ended_at: new Date().toISOString() })
        .eq('id', eventId);
      
      if (updateError) throw updateError;
      
      // Create notification for event creator
      const { data: eventData } = await supabase
        .from('events')
        .select('title, created_by')
        .eq('id', eventId)
        .single();
      
      if (eventData && eventData.created_by) {
        await supabase.rpc('create_notification', {
          user_id_param: eventData.created_by,
          type_param: 'event',
          title_param: 'Recording Available',
          body_param: `Your event "${eventData.title}" recording is now available.`,
          action_url_param: `/events/${eventId}`,
          data_param: { eventId }
        });
      }
      
      return new Response(
        JSON.stringify({ success: true, recordingUrl }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      return new Response(
        JSON.stringify({ error: "Recording not found or still processing" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("Error processing recording:", error.message);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Function to get recording URL from Agora Cloud Recording
async function getRecordingUrl(channelName: string): Promise<string | null> {
  try {
    // This is a simplified version - in a real implementation, you would:
    // 1. Query Agora's API for the recording status using the channel name
    // 2. Parse the response to get the recording file URLs
    // 3. Return the appropriate URL
    
    // For now, we'll just simulate this with a delay and a fake URL
    // In a real implementation, you'd call the Agora Cloud Recording API
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return a simulated recording URL
    // In production, this would be the actual URL from Agora's response
    return `https://storage.example.com/recordings/${channelName}/recording.mp4`;
  } catch (error) {
    console.error("Error getting recording URL:", error);
    return null;
  }
}
