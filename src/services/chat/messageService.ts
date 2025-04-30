
import { supabase } from "@/integrations/supabase/client";
import { ChatMessage } from "@/types/chat";

// Send a message in a chat
export const sendMessage = async (
  chatId: string,
  senderId: string,
  recipientId: string,
  text?: string,
  imageUrl?: string,
  voiceUrl?: string
): Promise<ChatMessage> => {
  try {
    if (!text && !imageUrl && !voiceUrl) {
      throw new Error("Message must have text, image, or voice content");
    }

    // Create the message
    const timestamp = new Date().toISOString();
    
    const messageData = {
      chat_id: chatId,
      sender_id: senderId,
      recipient_id: recipientId,
      text,
      image_url: imageUrl,
      voice_url: voiceUrl,
      timestamp,
      read: false
    };
    
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .insert(messageData)
      .select()
      .single();
      
    if (messageError) throw messageError;

    // Update the chat's last message
    const lastMessage = {
      text: text || (imageUrl ? "📷 Image" : "🎤 Voice message"),
      senderId,
      recipientId,
      timestamp,
      read: false
    };
    
    const { error: chatError } = await supabase
      .from('chats')
      .update({
        last_message: lastMessage,
        updated_at: timestamp
      })
      .eq('id', chatId);
      
    if (chatError) throw chatError;

    return message as ChatMessage;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

// Get messages for a specific chat
export const getMessages = async (chatId: string): Promise<ChatMessage[]> => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('timestamp', { ascending: true });
    
    if (error) throw error;
    
    return data as ChatMessage[] || [];
  } catch (error) {
    console.error("Error fetching messages:", error);
    throw error;
  }
};

// Mark messages as read
export const markMessagesAsRead = async (
  chatId: string, 
  userId: string
): Promise<void> => {
  try {
    // Update all unread messages where the current user is the recipient
    const { error: messagesError } = await supabase
      .from('messages')
      .update({ read: true })
      .eq('chat_id', chatId)
      .eq('recipient_id', userId)
      .eq('read', false);
    
    if (messagesError) throw messagesError;
    
    // Check if the last message needs to be updated as well
    const { data: chat, error: chatError } = await supabase
      .from('chats')
      .select('last_message')
      .eq('id', chatId)
      .single();
    
    if (chatError) throw chatError;
    
    if (chat && chat.last_message) {
      const lastMessage = chat.last_message as any;
      
      if (lastMessage.recipientId === userId && !lastMessage.read) {
        const { error: updateError } = await supabase
          .from('chats')
          .update({
            last_message: {
              ...lastMessage,
              read: true
            }
          })
          .eq('id', chatId);
        
        if (updateError) throw updateError;
      }
    }
  } catch (error) {
    console.error("Error marking messages as read:", error);
    throw error;
  }
};
