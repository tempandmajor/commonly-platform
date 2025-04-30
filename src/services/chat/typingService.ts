
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
    // Use direct table operations since RPC might not be available yet
    await supabase
      .from('user_typing')
      .upsert({
        chat_id: chatId,
        user_id: userId,
        is_typing: isTyping,
        updated_at: new Date().toISOString()
      });
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
