
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

// Get secrets from environment variables
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

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
    
    const { userId, type, title, body, imageUrl, actionUrl, data } = await req.json();
    
    if (!userId || !type || !title) {
      return new Response(
        JSON.stringify({ error: "User ID, type, and title are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Check if user has notification settings
    const { data: notificationSettings } = await supabase
      .from('notification_settings')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    // If user has disabled in-app notifications, don't create the notification
    if (notificationSettings && !notificationSettings.in_app_notifications) {
      return new Response(
        JSON.stringify({ success: false, message: "User has disabled in-app notifications" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Create notification
    const { data: notification, error } = await supabase
      .from('notifications')
      .insert([{
        user_id: userId,
        type,
        title,
        body: body || "",
        image_url: imageUrl || null,
        action_url: actionUrl || null,
        data: data || null,
        read: false,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    return new Response(
      JSON.stringify({ success: true, notificationId: notification.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error sending notification:", error.message);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
