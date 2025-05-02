import { supabase } from "@/integrations/supabase/client";
import { ChatMessage } from "@/types/chat";

// Convert database message format to application format
const adaptMessageFromDB = (dbMessage: any): ChatMessage => {
  return {
    id: dbMessage.id,
    chatId: dbMessage.chat_id,
    senderId: dbMessage.sender_id,
    recipientId: dbMessage.recipient_id,
    text: dbMessage.text || undefined,
    imageUrl: dbMessage.image_url || undefined,
    voiceUrl: dbMessage.voice_url || undefined,
    timestamp: dbMessage.timestamp,
    read: dbMessage.read,
  };
};

// Send a message in a chat
export const sendMessage = async (
  chatId: string,
  senderId: string,
  recipientId: string,
  text?: string,
  imageUrl?: string,
  voiceUrl?: string
): Promise<{ message?: ChatMessage; error?: string }> => {
  try {
    // Input validation
    if (!chatId) return { error: "Chat ID is required" };
    if (!senderId) return { error: "Sender ID is required" };
    if (!recipientId) return { error: "Recipient ID is required" };
    if (!text && !imageUrl && !voiceUrl) {
      return { error: "Message must have text, image, or voice content" };
    }

    // Create the message - only specifying necessary fields, let DB defaults handle the rest
    const messageData = {
      chat_id: chatId,
      sender_id: senderId,
      recipient_id: recipientId,
      text,
      image_url: imageUrl,
      voice_url: voiceUrl,
      // No need to set 'read' and 'timestamp' as they have defaults in the database
    };
    
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .insert(messageData)
      .select()
      .single();
      
    if (messageError) {
      console.error("Error creating message:", messageError);
      return { error: messageError.message };
    }

    if (!message) {
      return { error: "Failed to create message - no data returned" };
    }

    // Update the chat's last message
    const lastMessage = {
      text: text || (imageUrl ? "📷 Image" : "🎤 Voice message"),
      senderId,
      recipientId,
      timestamp: message.timestamp, // Use timestamp from the created message
      read: false
    };
    
    const { error: chatError } = await supabase
      .from('chats')
      .update({
        last_message: lastMessage,
        // Let the database handle the updated_at timestamp
      })
      .eq('id', chatId);
      
    if (chatError) {
      console.error("Error updating chat last message:", chatError);
      // Don't fail the entire operation if updating the chat fails
      // as the message was already sent
    }

    return { message: message as ChatMessage };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Exception in sendMessage:", errorMessage);
    return { error: errorMessage };
  }
};

// Get a single message by ID
export const getMessageById = async (messageId: string): Promise<ChatMessage | null> => {
  try {
    const { data: message, error } = await supabase
      .from('messages')
      .select('*')
      .eq('id', messageId)
      .single();
    
    if (error) throw error;
    if (!message) return null;
    
    return adaptMessageFromDB(message);
  } catch (error) {
    console.error('Error getting message:', error);
    throw error;
  }
};

// Get messages for a specific chat
export const getMessages = async (chatId: string): Promise<ChatMessage[]> => {
  try {
    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('timestamp', { ascending: true });
      
    if (error) throw error;
    
    return messages ? messages.map(adaptMessageFromDB) : [];
  } catch (error) {
    console.error('Error getting messages:', error);
    return [];
  }
};

// Mark messages as read
export const markMessagesAsRead = async (
  chatId: string, 
  userId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    if (!chatId) return { success: false, error: "Chat ID is required" };
    if (!userId) return { success: false, error: "User ID is required" };
    
    // Update all unread messages where the current user is the recipient
    const { error: messagesError } = await supabase
      .from('messages')
      .update({ read: true })
      .eq('chat_id', chatId)
      .eq('recipient_id', userId)
      .eq('read', false);
    
    if (messagesError) {
      console.error("Error marking messages as read:", messagesError);
      return { success: false, error: messagesError.message };
    }
    
    // Check if the last message needs to be updated as well
    const { data: chat, error: chatError } = await supabase
      .from('chats')
      .select('last_message')
      .eq('id', chatId)
      .maybeSingle(); // Use maybeSingle instead of single
    
    if (chatError) {
      console.error("Error fetching chat for read status update:", chatError);
      // Don't fail the entire operation if this part fails
      return { success: true };
    }
    
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
            // Let the database handle the updated_at timestamp
          })
          .eq('id', chatId);
        
        if (updateError) {
          console.error("Error updating chat last message read status:", updateError);
          // Don't fail the entire operation if this part fails
        }
      }
    }
    
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Exception in markMessagesAsRead:", errorMessage);
    return { success: false, error: errorMessage };
  }
};

/**
 * Delete a specific message
 */
export const deleteMessage = async (messageId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    if (!messageId) {
      return { success: false, error: "Message ID is required" };
    }
    
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId);
      
    if (error) {
      console.error("Error deleting message:", error);
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Exception in deleteMessage:", errorMessage);
    return { success: false, error: errorMessage };
  }
};
