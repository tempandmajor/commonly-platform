
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

    const { resourceId, sid, channelName, uid } = await req.json();

    if (!resourceId || !sid || !channelName || !uid) {
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

    // Stop the recording
    const basicAuth = btoa(`${customerID}:${customerSecret}`);
    const stopResponse = await fetch(
      `https://api.agora.io/v1/apps/${appID}/cloud_recording/resourceid/${resourceId}/sid/${sid}/mode/mix/stop`,
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

    if (!stopResponse.ok) {
      const errorData = await stopResponse.json();
      return new Response(
        JSON.stringify({
          error: "Failed to stop recording",
          details: errorData,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: stopResponse.status,
        }
      );
    }

    const stopData = await stopResponse.json();
    
    // Extract the recording URL
    let recordingUrl = "Unknown";
    if (stopData.serverResponse && 
        stopData.serverResponse.fileList && 
        stopData.serverResponse.fileList.length > 0) {
      recordingUrl = stopData.serverResponse.fileList[0].fileName;
    }
    
    return new Response(
      JSON.stringify({
        resourceId: resourceId,
        sid: sid,
        status: "stopped",
        recordingUrl: recordingUrl,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error stopping recording:", error);
    return new Response(
      JSON.stringify({ error: "Failed to stop recording" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
