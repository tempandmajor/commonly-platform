
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Agora customer credentials
const customerId = Deno.env.get("AGORA_CUSTOMER_ID") || "";
const customerSecret = Deno.env.get("AGORA_CUSTOMER_SECRET") || "";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!customerId || !customerSecret) {
      throw new Error("Missing Agora customer credentials");
    }

    const { channelName, uid, token } = await req.json();
    
    if (!channelName || !uid || !token) {
      throw new Error("Missing required parameters");
    }

    // Step 1: Get a resource ID
    const auth = btoa(`${customerId}:${customerSecret}`);
    const region = "na"; // North America region, change as needed
    const acquireUrl = `https://api.agora.io/v1/apps/${Deno.env.get("AGORA_APP_ID")}/cloud_recording/acquire`;

    const acquireResponse = await fetch(acquireUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${auth}`
      },
      body: JSON.stringify({
        cname: channelName,
        uid: uid.toString(),
        clientRequest: {
          resourceExpiredHour: 24
        }
      })
    });

    const acquireData = await acquireResponse.json();
    
    if (!acquireResponse.ok) {
      throw new Error(`Failed to acquire resource: ${JSON.stringify(acquireData)}`);
    }

    const resourceId = acquireData.resourceId;

    // Step 2: Start recording
    const startUrl = `https://api.agora.io/v1/apps/${Deno.env.get("AGORA_APP_ID")}/cloud_recording/resourceid/${resourceId}/mode/mix/start`;

    const startResponse = await fetch(startUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${auth}`
      },
      body: JSON.stringify({
        cname: channelName,
        uid: uid.toString(),
        clientRequest: {
          token,
          recordingConfig: {
            maxIdleTime: 30,
            streamTypes: 2, // Audio and video
            channelType: 0, // Communication channel
            transcodingConfig: {
              width: 640,
              height: 360,
              fps: 15,
              bitrate: 600,
              mixedVideoLayout: 1, // Default layout
              backgroundColor: "#000000"
            }
          },
          recordingFileConfig: {
            avFileType: ["hls"]
          },
          storageConfig: {
            vendor: 1, // Agora Cloud Storage
            region: 1, // US region
            accessKey: "default", // Not needed for Agora Cloud Storage
            secretKey: "default", // Not needed for Agora Cloud Storage
            bucket: "default", // Not needed for Agora Cloud Storage
            fileNamePrefix: [`recordings/${channelName}`]
          }
        }
      })
    });

    const startData = await startResponse.json();
    
    if (!startResponse.ok) {
      throw new Error(`Failed to start recording: ${JSON.stringify(startData)}`);
    }

    // Return the resource ID for later use
    return new Response(
      JSON.stringify({ resourceId }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error starting recording:", error.message);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
