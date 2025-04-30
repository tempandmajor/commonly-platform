
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { RtcRole, RtcTokenBuilder } from "https://esm.sh/agora-token@2.0.3";

// Get secrets from environment variables
const appId = Deno.env.get("AGORA_APP_ID") || "";
const appCertificate = Deno.env.get("AGORA_APP_CERTIFICATE") || "";

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
    const { channelName, uid, role, expirationTimeInSeconds } = await req.json();
    
    if (!channelName) {
      return new Response(
        JSON.stringify({ error: "Channel name is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Set default values if not provided
    const userRole = role === "publisher" ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;
    const userId = uid || 0;
    const expirationTime = expirationTimeInSeconds || 3600; // Default to 1 hour
    
    // Current timestamp in seconds
    const currentTimestamp = Math.floor(Date.now() / 1000);
    
    // Token expiration time
    const privilegeExpiredTs = currentTimestamp + expirationTime;
    
    // Generate token
    const token = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      channelName,
      userId,
      userRole,
      privilegeExpiredTs
    );
    
    // Return token
    return new Response(
      JSON.stringify({ token, channelName, uid: userId, expiresAt: privilegeExpiredTs }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating token:", error.message);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
