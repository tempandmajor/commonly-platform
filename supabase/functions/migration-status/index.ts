
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

// Get secrets from environment variables
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

// Set CORS headers for browser access
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Initialize Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Check if we've received path parameters
    const url = new URL(req.url);
    const feature = url.searchParams.get("feature");
    
    // Get migration status
    const migrationStatus = await getMigrationStatus(supabase, feature);
    
    return new Response(
      JSON.stringify({ success: true, data: migrationStatus }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error checking migration status:", error.message);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function getMigrationStatus(supabase, feature = null) {
  // Check counts in different tables to gauge migration progress
  const tables = [
    "podcasts",
    "podcast_comments",
    "orders",
    "users",
    "events",
    "notifications"
  ];
  
  const stats = {};
  
  if (feature) {
    // Check specific feature
    switch (feature) {
      case "podcasts":
        const { count: podcastCount } = await supabase
          .from("podcasts")
          .select("*", { count: "exact", head: true });
        
        return {
          name: "Podcasts",
          migratedCount: podcastCount,
          status: podcastCount > 0 ? "completed" : "pending"
        };
        
      case "users":
        const { count: userCount } = await supabase
          .from("users")
          .select("*", { count: "exact", head: true });
        
        return {
          name: "User Profiles",
          migratedCount: userCount,
          status: userCount > 0 ? "completed" : "pending"
        };
        
      // Add more feature checks as needed
      
      default:
        throw new Error("Unknown feature specified");
    }
  } else {
    // Get stats for all modules
    for (const table of tables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select("*", { count: "exact", head: true });
          
        if (!error) {
          stats[table] = count;
        }
      } catch (e) {
        console.error(`Error fetching count for ${table}:`, e);
        stats[table] = 0;
      }
    }
    
    // Return overall status
    return {
      tables: stats,
      podcasts: { 
        status: stats.podcasts > 0 ? "completed" : "pending",
        count: stats.podcasts || 0
      },
      users: { 
        status: stats.users > 0 ? "completed" : "pending",
        count: stats.users || 0
      },
      events: { 
        status: stats.events > 0 ? "completed" : "pending",
        count: stats.events || 0
      },
      ecommerce: { 
        status: stats.orders > 0 ? "completed" : "pending",
        count: stats.orders || 0
      },
      notifications: { 
        status: stats.notifications > 0 ? "completed" : "pending",
        count: stats.notifications || 0
      }
    };
  }
}
