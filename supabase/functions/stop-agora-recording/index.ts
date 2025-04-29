
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

    const { resourceId, channelName, uid } = await req.json();

    if (!resourceId || !channelName || !uid) {
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

    // Try to acquire the sid from the resourceId
    const basicAuth = btoa(`${customerID}:${customerSecret}`);
    const queryUrl = `https://api.agora.io/v1/apps/${appID}/cloud_recording/resourceid/${resourceId}/query`;
    
    const queryResponse = await fetch(queryUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${basicAuth}`,
      }
    });
    
    if (!queryResponse.ok) {
      const errorData = await queryResponse.json();
      return new Response(
        JSON.stringify({
          error: "Failed to query recording session",
          details: errorData,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: queryResponse.status,
        }
      );
    }
    
    const queryData = await queryResponse.json();
    const sid = queryData.sid;
    
    if (!sid) {
      return new Response(
        JSON.stringify({
          error: "No active recording session found",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 404,
        }
      );
    }
    
    // Stop the recording using the acquired sid
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
