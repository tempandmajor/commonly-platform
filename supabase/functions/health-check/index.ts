
// Supabase edge function for monitoring service health

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Set up CORS headers for browser access
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
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing environment variables');
    }

    const requestData = await req.json();
    const timestamp = requestData.timestamp || new Date().toISOString();

    // Create Supabase client with service role for admin access
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check database connection
    const { data: dbCheck, error: dbError } = await supabase
      .from('system_configuration')
      .select('key')
      .limit(1);

    // Record health check result
    const { error: logError } = await supabase
      .from('service_health_logs')
      .insert({
        service: 'edge-functions',
        status: dbError ? 'error' : 'healthy',
        check_time: timestamp,
        response_time_ms: Date.now() - new Date(timestamp).getTime(),
        details: dbError ? { error: dbError.message } : { success: true }
      });

    if (logError) {
      console.error('Error logging health check:', logError);
    }

    // Return health status
    return new Response(
      JSON.stringify({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        checks: {
          database: dbError ? 'error' : 'healthy',
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (error) {
    console.error('Health check error:', error.message);
    
    return new Response(
      JSON.stringify({
        status: 'error',
        message: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
