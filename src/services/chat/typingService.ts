
import { supabase } from "@/integrations/supabase/client";
import { UserTyping } from "@/types/chat";

/**
 * Update user typing status in a chat
 */
export const updateTypingStatus = async (
  chatId: string, 
  userId: string, 
  isTyping: boolean
): Promise<void> => {
  try {
    // Use the RPC function if available
    try {
      const { error } = await supabase.rpc('update_typing_status', {
        p_chat_id: chatId,
        p_user_id: userId,
        p_is_typing: isTyping
      });
      
      if (error) throw error;
    } catch (error) {
      // Fallback to direct table operations if RPC fails
      await supabase
        .from('user_typing')
        .upsert({
          chat_id: chatId,
          user_id: userId,
          is_typing: isTyping,
          updated_at: new Date().toISOString()
        });
    }
  } catch (error) {
    console.error('Error updating typing status:', error);
  }
};

/**
 * Get typing status for users in a chat
 */
export const getTypingStatus = async (chatId: string): Promise<UserTyping[]> => {
  try {
    const { data, error } = await supabase
      .from('user_typing')
      .select('*')
      .eq('chat_id', chatId);
    
    if (error) throw error;
    
    return data as UserTyping[];
  } catch (error) {
    console.error('Error getting typing status:', error);
    return [];
  }
};
