
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

    const { channelName, uid, resourceId } = await req.json();
    
    if (!channelName || !uid || !resourceId) {
      throw new Error("Missing required parameters");
    }

    // Stop recording
    const auth = btoa(`${customerId}:${customerSecret}`);
    const stopUrl = `https://api.agora.io/v1/apps/${Deno.env.get("AGORA_APP_ID")}/cloud_recording/resourceid/${resourceId}/sid/${resourceId}/mode/mix/stop`;

    const stopResponse = await fetch(stopUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${auth}`
      },
      body: JSON.stringify({
        cname: channelName,
        uid: uid.toString(),
        clientRequest: {}
      })
    });

    const stopData = await stopResponse.json();
    
    if (!stopResponse.ok) {
      throw new Error(`Failed to stop recording: ${JSON.stringify(stopData)}`);
    }

    // Extract recording URL from response
    const recordingUrl = stopData.serverResponse?.fileList?.[0]?.fileUrl || "";

    // Return the recording URL
    return new Response(
      JSON.stringify({ recordingUrl }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error stopping recording:", error.message);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
