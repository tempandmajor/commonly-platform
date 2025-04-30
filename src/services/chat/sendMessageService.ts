
import { supabase } from "@/integrations/supabase/client";
import { updateLastMessage } from "./chatService";
import { toast } from "@/hooks/use-toast";

/**
 * Send a message in a chat
 */
export const sendMessage = async (
  chatId: string,
  senderId: string,
  recipientId: string,
  text?: string,
  imageUrl?: string,
  voiceUrl?: string
): Promise<{ messageId?: string; error?: string }> => {
  try {
    if (!text && !imageUrl && !voiceUrl) {
      return { error: "Message cannot be empty" };
    }

    // Call our new insert_message database function
    const { data, error } = await supabase
      .rpc('insert_message', {
        p_chat_id: chatId, 
        p_sender_id: senderId,
        p_recipient_id: recipientId,
        p_text: text || null,
        p_image_url: imageUrl || null,
        p_voice_url: voiceUrl || null
      })
      .single();

    if (error) {
      console.error("Error sending message:", error);
      return { error: error.message };
    }

    // Update the last message in the chat
    const timestamp = new Date().toISOString();
    await updateLastMessage(chatId, {
      senderId,
      recipientId,
      text: text || (imageUrl ? "📷 Image" : "🎤 Voice message"),
      timestamp,
      read: false
    });

    return { messageId: data };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Exception in sendMessage:", errorMessage);
    toast({
      title: "Error sending message",
      description: errorMessage,
      variant: "destructive"
    });
    return { error: errorMessage };
  }
};

/**
 * Send a message with an image
 */
export const sendMessageWithImage = async (
  chatId: string,
  senderId: string,
  recipientId: string,
  imageUrl: string,
  text?: string
): Promise<{ messageId?: string; error?: string }> => {
  return sendMessage(
    chatId,
    senderId,
    recipientId,
    text,
    imageUrl
  );
};

/**
 * Send a message with a voice recording
 */
export const sendMessageWithVoice = async (
  chatId: string,
  senderId: string,
  recipientId: string,
  voiceUrl: string,
  text?: string
): Promise<{ messageId?: string; error?: string }> => {
  return sendMessage(
    chatId,
    senderId,
    recipientId,
    text,
    undefined,
    voiceUrl
  );
};

/**
 * Get messages by chat ID
 */
export const getMessagesByChatId = async (
  chatId: string
): Promise<{ messages: any[]; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('timestamp', { ascending: true });

    if (error) {
      console.error("Error getting messages:", error);
      toast({
        title: "Error loading messages",
        description: error.message,
        variant: "destructive"
      });
      return { messages: [], error: error.message };
    }

    return { messages: data || [] };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Exception in getMessagesByChatId:", errorMessage);
    toast({
      title: "Error loading messages",
      description: errorMessage,
      variant: "destructive"
    });
    return { messages: [], error: errorMessage };
  }
};
