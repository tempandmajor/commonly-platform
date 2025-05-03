import { supabase } from "@/integrations/supabase/client";
import { ChatMessage } from "@/types/chat";

/**
 * Adapts a message from Supabase format (snake_case) to our app format (camelCase)
 */
const adaptMessage = (message: any): ChatMessage => {
  return {
    id: message.id,
    chatId: message.chat_id,
    senderId: message.sender_id,
    recipientId: message.recipient_id,
    text: message.text,
    imageUrl: message.image_url,
    voiceUrl: message.voice_url,
    timestamp: message.timestamp,
    read: message.read
  };
};

/**
 * Fetches messages for a specific chat from Supabase
 * @param chatId - The ID of the chat
 * @returns A promise that resolves with an array of ChatMessage objects
 */
export const getMessages = async (chatId: string): Promise<ChatMessage[]> => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('timestamp', { ascending: true });
    
    if (error) throw error;
    
    // Convert the data to our ChatMessage format using the adapter
    return (data || []).map(adaptMessage);
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
};
