
import { Json } from "@/integrations/supabase/types";

export interface UserTyping {
  chat_id: string;
  user_id: string;
  is_typing: boolean;
  updated_at: string;
}
