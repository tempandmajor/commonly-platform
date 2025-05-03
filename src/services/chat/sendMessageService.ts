
import { supabase } from "@/integrations/supabase/client";
import { updateLastMessage } from "./chatService";

export const sendMessage = async (
  chatId: string,
  senderId: string,
  recipientId: string,
  text: string,
  imageUrl?: string,
  voiceUrl?: string
): Promise<{ messageId?: string; error?: string }> => {
  try {
    // Generate a timestamp
    const timestamp = new Date().toISOString();
    
    // Use the insert_message RPC function
    const { data, error } = await supabase
      .rpc('insert_message', {
        p_chat_id: chatId,
        p_sender_id: senderId,
        p_recipient_id: recipientId,
        p_text: text,
        p_image_url: imageUrl,
        p_voice_url: voiceUrl
      });

    if (error) {
      throw error;
    }

    const messageId = data;

    // Update the last message in the chat
    await updateLastMessage(
      chatId,
      senderId,
      recipientId,
      text,
      timestamp,
      false
    );

    return { messageId };
  } catch (error) {
    console.error("Error sending message:", error);
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
};
