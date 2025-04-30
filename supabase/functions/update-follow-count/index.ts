
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
    const { follower_id, following_id, action } = await req.json();
    
    if (!follower_id || !following_id || !action) {
      throw new Error("Missing required parameters");
    }

    if (action !== "follow" && action !== "unfollow") {
      throw new Error("Invalid action parameter");
    }

    // Create a Supabase client using the provided environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase credentials");
    }

    // Call the appropriate RPC function based on action
    const rpcFunction = action === "follow" ? "increment_follower_count" : "decrement_follower_count";
    
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/${rpcFunction}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${supabaseServiceKey}`,
        "apikey": supabaseServiceKey
      },
      body: JSON.stringify({ 
        follower_id_param: follower_id,
        following_id_param: following_id
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to update follow count: ${error}`);
    }

    // Also create or delete the user_follows record
    const tablePath = `${supabaseUrl}/rest/v1/user_follows`;
    let operationResponse;

    if (action === "follow") {
      // Create a follow relationship
      operationResponse = await fetch(tablePath, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${supabaseServiceKey}`,
          "apikey": supabaseServiceKey,
          "Prefer": "return=minimal"
        },
        body: JSON.stringify({
          follower_id: follower_id,
          following_id: following_id,
          created_at: new Date().toISOString()
        })
      });
    } else {
      // Delete a follow relationship
      const queryString = new URLSearchParams({
        follower_id: `eq.${follower_id}`,
        following_id: `eq.${following_id}`
      }).toString();
      
      operationResponse = await fetch(`${tablePath}?${queryString}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${supabaseServiceKey}`,
          "apikey": supabaseServiceKey
        }
      });
    }

    if (!operationResponse.ok) {
      const error = await operationResponse.text();
      throw new Error(`Failed to update follow relationship: ${error}`);
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error updating follow count:", error.message);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
