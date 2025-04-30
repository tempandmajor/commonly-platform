
import { supabase } from "@/integrations/supabase/client";
import { ChatMessage } from "@/types/chat";

/**
 * Get count of unread messages in a chat for a user
 */
export const getUnreadCount = async (chatId: string, userId: string): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('chat_id', chatId)
      .eq('recipient_id', userId)
      .eq('read', false);

    if (error) throw error;
    
    return count || 0;
  } catch (error) {
    console.error("Error counting unread messages:", error);
    return 0;
  }
};

/**
 * Get total number of unread messages across all chats
 */
export const getTotalUnreadCount = async (userId: string): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('recipient_id', userId)
      .eq('read', false);

    if (error) throw error;
    
    return count || 0;
  } catch (error) {
    console.error("Error counting total unread messages:", error);
    return 0;
  }
};

/**
 * Update the read status of a specific message
 */
export const updateMessageReadStatus = async (
  messageId: string, 
  isRead: boolean
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('messages')
      .update({ read: isRead })
      .eq('id', messageId);
      
    if (error) throw error;
  } catch (error) {
    console.error("Error updating message read status:", error);
  }
};
