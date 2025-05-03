import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://kweskshyumqhijjileky.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3ZXNrc2h5dW1xaGlqamlsZWt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5NDgyNTYsImV4cCI6MjA2MTUyNDI1Nn0.Qo-OpAXUOP-W_XYbAzlo61wtzjMlpja0imTNR-eLKJs";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

// Define a type if not available in the types.ts file
export type Tables = {
  users: {
    Row: {
      id: string;
      email: string | null;
      display_name: string | null;
      photo_url: string | null;
      recent_login: boolean | null;
      created_at: string;
      updated_at: string;
      stripe_connect_id: string | null;
      followers: string[] | null;
      following: string[] | null;
      follower_count: number | null;
      following_count: number | null;
      is_private: boolean | null;
      has_two_factor_enabled: boolean | null;
      bio: string | null;
      is_merchant: boolean | null;
      merchant_store_id: string | null;
      is_pro: boolean | null;
      is_podcaster: boolean | null;
      podcast_channel_name: string | null;
      featured_podcasts: string[] | null;
      is_admin: boolean | null;
      wallet: Record<string, any> | null;
    }
  };
  events: {
    Row: {
      id: string;
      title: string;
      description: string | null;
      date: string | null;
      location: string | null;
      created_by: string | null;
      created_at: string;
      updated_at: string;
      published: boolean | null;
      image_url: string | null;
      geo_location: unknown | null; // PostGIS geography type
    }
  };
  orders: {
    Row: {
      id: string;
      user_id: string;
      merchant_id: string;
      items: Record<string, any>;
      total_amount: number;
      status: string;
      payment_intent_id: string | null;
      shipping_address: Record<string, any> | null;
      created_at: string;
      updated_at: string;
    }
  };
  venues: {
    Row: {
      id: string;
      name: string;
      description: string | null;
      address: string | null;
      created_by: string | null;
      created_at: string;
      updated_at: string;
      image_url: string | null;
      capacity: number | null;
      is_verified: boolean | null;
    }
  };
  transactions: {
    Row: {
      id: string;
      user_id: string | null;
      amount: number;
      type: string | null;
      status: string | null;
      description: string | null;
      created_at: string;
      updated_at: string | null;
      event_id: string | null;
      referral_id: string | null;
      order_id: string | null;
      payment_method_id: string | null;
    }
  };
  credits_campaigns: {
    Row: {
      id: string;
      name: string;
      description: string | null;
      amount: number;
      target_user_type: string | null;
      active: boolean | null;
      created_at: string;
      updated_at: string;
      start_date: string | null;
      end_date: string | null;
    }
  };
  content: {
    Row: {
      id: string;
      title: string | null;
      content: Record<string, any> | null;
      created_at: string;
      updated_at: string;
    }
  };
  artists: {
    Row: {
      id: string;
      name: string;
      bio: string | null;
      image_url: string | null;
      category: string | null;
      featured: boolean | null;
      social_links: Record<string, any> | null;
      created_at: string;
      updated_at: string | null;
    }
  };
};

// Add type definition for the RPC functions
declare module '@supabase/supabase-js' {
  interface SupabaseClient {
    rpc<T = any>(
      fn: 
        | 'create_notification' 
        | 'decrement_event_likes' 
        | 'global_search' 
        | 'increment_event_likes' 
        | 'increment_event_shares' 
        | 'increment_podcast_listens' 
        | 'insert_message' 
        | 'mark_messages_as_read' 
        | 'search_events_by_location' 
        | 'update_chat_last_message'
        | 'decrement_wallet_amount',
      params?: object
    ): PostgrestFilterBuilder<T>;
  }
}

// Create the typed client
// This helps TypeScript understand what tables are available
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
