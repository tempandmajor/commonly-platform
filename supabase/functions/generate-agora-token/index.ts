
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { RtcTokenBuilder, RtcRole } from "https://esm.sh/agora-token@2.0.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Load environment variables
const appId = Deno.env.get("AGORA_APP_ID") || "";
const appCertificate = Deno.env.get("AGORA_APP_CERTIFICATE") || "";

// Handle CORS and token generation
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!appId || !appCertificate) {
      throw new Error("Missing Agora credentials in environment variables");
    }

    const { channelName, uid, role } = await req.json();
    
    if (!channelName) {
      throw new Error("Channel name is required");
    }

    // User ID can be string or number
    const userId = typeof uid === "string" ? uid : String(uid);
    
    // Set role type (default to publisher)
    const roleType = role === "audience" 
      ? RtcRole.SUBSCRIBER 
      : RtcRole.PUBLISHER;

    // Set expiration time (1 hour)
    const expirationTimeInSeconds = 3600;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    // Generate token
    const token = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      channelName,
      userId,
      roleType,
      privilegeExpiredTs
    );

    // Return token in response
    return new Response(
      JSON.stringify({ token }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error generating token:", error.message);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
