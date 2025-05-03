
import { supabase } from "@/integrations/supabase/client";

/**
 * Updates the last message in a chat
 */
export const updateLastMessage = async (
  chatId: string,
  senderId: string,
  recipientId: string,
  text: string,
  timestamp: string,
  read: boolean
): Promise<boolean> => {
  try {
    const lastMessageData = {
      text,
      senderId,
      recipientId,
      timestamp,
      read
    };
    
    const { error } = await supabase.rpc(
      'update_chat_last_message',
      {
        p_chat_id: chatId,
        p_last_message: lastMessageData
      }
    );
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error("Error updating last message:", error);
    return false;
  }
};
