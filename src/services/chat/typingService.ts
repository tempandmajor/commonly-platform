
import { supabase } from "@/integrations/supabase/client";
import { UserTyping } from "@/types/supabase";

/**
 * Update user typing status in a chat
 */
export const updateTypingStatus = async (
  chatId: string, 
  userId: string, 
  isTyping: boolean
): Promise<void> => {
  try {
    // Try using the RPC function first
    const { error: rpcError } = await supabase.rpc('update_typing_status', {
      p_chat_id: chatId,
      p_user_id: userId,
      p_is_typing: isTyping
    });
    
    if (rpcError) {
      // Fallback to direct table operations if RPC fails
      const { error } = await supabase
        .from('user_typing')
        .upsert({
          chat_id: chatId,
          user_id: userId,
          is_typing: isTyping,
          updated_at: new Date().toISOString()
        });
        
      if (error) {
        console.error('Error updating typing status:', error);
      }
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
    // Try using the RPC function first for a single user
    const { data: typingData, error: queryError } = await supabase
      .from('user_typing')
      .select('*')
      .eq('chat_id', chatId);
    
    if (queryError) throw queryError;
    
    return typingData as UserTyping[];
  } catch (error) {
    console.error('Error getting typing status:', error);
    return [];
  }
};
