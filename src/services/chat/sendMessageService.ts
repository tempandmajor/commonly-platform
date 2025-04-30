
import { supabase } from "@/integrations/supabase/client";
import { updateLastMessage } from "./chatService";

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

    const timestamp = new Date().toISOString();

    // Insert the message into the messages table
    const { data, error } = await supabase
      .from('messages')
      .insert({
        chat_id: chatId,
        sender_id: senderId,
        recipient_id: recipientId,
        text: text || null,
        image_url: imageUrl || null,
        voice_url: voiceUrl || null,
        timestamp,
        read: false
      })
      .select()
      .single();

    if (error) {
      console.error("Error sending message:", error);
      return { error: error.message };
    }

    // Update the last message in the chat
    await updateLastMessage(chatId, {
      senderId,
      text: text || (imageUrl ? "📷 Image" : "🎤 Voice message"),
      timestamp,
      read: false
    });

    return { messageId: data.id };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Exception in sendMessage:", errorMessage);
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
      return { messages: [], error: error.message };
    }

    return { messages: data || [] };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Exception in getMessagesByChatId:", errorMessage);
    return { messages: [], error: errorMessage };
  }
};
