
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const appID = Deno.env.get("AGORA_APP_ID");
    const customerID = Deno.env.get("AGORA_CUSTOMER_ID");
    const customerSecret = Deno.env.get("AGORA_CUSTOMER_SECRET");

    if (!appID || !customerID || !customerSecret) {
      return new Response(
        JSON.stringify({
          error: "Agora credentials not configured",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }

    const { channelName, uid, token } = await req.json();

    if (!channelName || !uid || !token) {
      return new Response(
        JSON.stringify({
          error: "Missing required parameters",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Step 1: Get recording resources
    const basicAuth = btoa(`${customerID}:${customerSecret}`);
    const acquisitionResponse = await fetch(
      `https://api.agora.io/v1/apps/${appID}/cloud_recording/acquire`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Basic ${basicAuth}`,
        },
        body: JSON.stringify({
          cname: channelName,
          uid: uid,
          clientRequest: {},
        }),
      }
    );

    if (!acquisitionResponse.ok) {
      const errorData = await acquisitionResponse.json();
      return new Response(
        JSON.stringify({
          error: "Failed to acquire recording resources",
          details: errorData,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: acquisitionResponse.status,
        }
      );
    }

    const { resourceId } = await acquisitionResponse.json();

    // Step 2: Start the recording
    // Use Agora's default cloud storage for simplicity
    // For production, you should configure your own cloud storage
    
    const startResponse = await fetch(
      `https://api.agora.io/v1/apps/${appID}/cloud_recording/resourceid/${resourceId}/mode/mix/start`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Basic ${basicAuth}`,
        },
        body: JSON.stringify({
          cname: channelName,
          uid: uid,
          clientRequest: {
            token,
            recordingConfig: {
              maxIdleTime: 30,
              streamTypes: 2, // Audio & video
              channelType: 0, // Communication channel
              transcodingConfig: {
                width: 640,
                height: 360,
                fps: 30,
                bitrate: 600,
                mixedVideoLayout: 1, // Best fit
                backgroundColor: "#000000",
              },
            },
            recordingFileConfig: {
              avFileType: ["hls"],
            },
            storageConfig: {
              vendor: 0, // Agora's cloud storage
              region: 0, // Global default
            },
          },
        }),
      }
    );

    if (!startResponse.ok) {
      const errorData = await startResponse.json();
      return new Response(
        JSON.stringify({
          error: "Failed to start recording",
          details: errorData,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: startResponse.status,
        }
      );
    }

    const startData = await startResponse.json();
    
    return new Response(
      JSON.stringify({
        resourceId: resourceId,
        sid: startData.sid,
        status: "started",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error starting recording:", error);
    return new Response(
      JSON.stringify({ error: "Failed to start recording" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
