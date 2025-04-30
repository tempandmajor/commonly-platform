
import { supabase } from "@/integrations/supabase/client";
import { ChatMessage } from "@/types/chat";

/**
 * Get count of unread messages in a chat for a user
 */
export const getUnreadCount = async (chatId: string, userId: string): Promise<{ count: number; error?: string }> => {
  try {
    if (!chatId) return { count: 0, error: "Chat ID is required" };
    if (!userId) return { count: 0, error: "User ID is required" };
    
    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('chat_id', chatId)
      .eq('recipient_id', userId)
      .eq('read', false);

    if (error) {
      console.error("Error counting unread messages:", error);
      return { count: 0, error: error.message };
    }
    
    return { count: count || 0 };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Exception in getUnreadCount:", errorMessage);
    return { count: 0, error: errorMessage };
  }
};

/**
 * Get total number of unread messages across all chats
 */
export const getTotalUnreadCount = async (userId: string): Promise<{ count: number; error?: string }> => {
  try {
    if (!userId) return { count: 0, error: "User ID is required" };
    
    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('recipient_id', userId)
      .eq('read', false);

    if (error) {
      console.error("Error counting total unread messages:", error);
      return { count: 0, error: error.message };
    }
    
    return { count: count || 0 };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Exception counting total unread messages:", errorMessage);
    return { count: 0, error: errorMessage };
  }
};

/**
 * Update the read status of a specific message
 */
export const updateMessageReadStatus = async (
  messageId: string, 
  isRead: boolean
): Promise<{ success: boolean; error?: string }> => {
  try {
    if (!messageId) return { success: false, error: "Message ID is required" };
    
    const { error } = await supabase
      .from('messages')
      .update({ read: isRead })
      .eq('id', messageId);
      
    if (error) {
      console.error("Error updating message read status:", error);
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Error updating message read status:", errorMessage);
    return { success: false, error: errorMessage };
  }
};

/**
 * Get all unread message IDs for a user
 */
export const getUnreadMessageIds = async (userId: string): Promise<{ ids: string[]; error?: string }> => {
  try {
    if (!userId) return { ids: [], error: "User ID is required" };
    
    const { data, error } = await supabase
      .from('messages')
      .select('id')
      .eq('recipient_id', userId)
      .eq('read', false);
      
    if (error) {
      console.error("Error getting unread message IDs:", error);
      return { ids: [], error: error.message };
    }
    
    return { ids: data.map(msg => msg.id) };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Exception getting unread message IDs:", errorMessage);
    return { ids: [], error: errorMessage };
  }
};
