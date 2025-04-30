
import { Json } from "@/integrations/supabase/types";

export interface UserTyping {
  chat_id: string;
  user_id: string;
  is_typing: boolean;
  updated_at: string;
}

export interface SupabaseNotification {
  id: string;
  user_id: string;
  type: 'message' | 'like' | 'follow' | 'comment' | 'podcast' | 'event' | 'system' | 'event_update' | 'new_follower' | 'referral_earnings' | 'sponsorship';
  title: string;
  body: string;
  image_url: string | null;
  action_url: string | null;
  read: boolean;
  created_at: string;
  data: Json | null;
}
