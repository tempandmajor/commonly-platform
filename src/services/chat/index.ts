
import { supabase } from "@/integrations/supabase/client";
import { Chat, ChatMessage, ChatWithUser } from "@/types/chat";

// Re-export functions from chat service modules
export * from './chatService';
export * from './messageService';
export * from './sendMessageService';
export * from './typingService';
export * from './unreadService';

// Explicitly export sendMessage for backward compatibility
export { sendMessage } from './sendMessageService';

// Additional exports for backward compatibility
export const sendMessageWithImage = async (
  chatId: string,
  senderId: string,
  recipientId: string,
  text: string,
  imageUrl: string
): Promise<string | null> => {
  try {
    // Insert the message
    const { data, error } = await supabase
      .from('messages')
      .insert({
        chat_id: chatId,
        sender_id: senderId,
        recipient_id: recipientId,
        text,
        image_url: imageUrl,
        read: false,
        timestamp: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // Update the chat with the last message
    await supabase
      .from('chats')
      .update({
        updated_at: new Date().toISOString(),
        last_message: {
          text: imageUrl ? "📷 Image" : text,
          senderId: senderId,
          timestamp: new Date().toISOString(),
          read: false
        }
      })
      .eq('id', chatId);
    
    return data.id;
  } catch (error) {
    console.error("Error sending message with image:", error);
    return null;
  }
};

export const sendMessageWithVoice = async (
  chatId: string,
  senderId: string,
  recipientId: string,
  text: string,
  voiceUrl: string
): Promise<string | null> => {
  try {
    // Insert the message
    const { data, error } = await supabase
      .from('messages')
      .insert({
        chat_id: chatId,
        sender_id: senderId,
        recipient_id: recipientId,
        text,
        voice_url: voiceUrl,
        read: false,
        timestamp: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // Update the chat with the last message
    await supabase
      .from('chats')
      .update({
        updated_at: new Date().toISOString(),
        last_message: {
          text: voiceUrl ? "🎤 Voice message" : text,
          senderId: senderId,
          recipientId: recipientId,
          timestamp: new Date().toISOString(),
          read: false
        }
      })
      .eq('id', chatId);
    
    return data.id;
  } catch (error) {
    console.error("Error sending message with voice:", error);
    return null;
  }
};
