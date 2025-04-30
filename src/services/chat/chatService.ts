
import { supabase } from "@/integrations/supabase/client";
import { Chat, ChatWithUser } from "@/types/chat";
import { toast } from "@/hooks/use-toast";

/**
 * Create a new chat between users
 */
export const createChat = async (
  currentUserId: string,
  otherUserId: string
): Promise<{ chat: Chat | null; error?: string }> => {
  try {
    // Check if chat already exists between these users
    const { data: existingChats, error: fetchError } = await supabase
      .from('chats')
      .select('*')
      .contains('participants', [currentUserId, otherUserId]);

    if (fetchError) {
      console.error("Error checking for existing chat:", fetchError);
      return { chat: null, error: fetchError.message };
    }

    // If chat already exists, return it
    if (existingChats && existingChats.length > 0) {
      return { chat: existingChats[0] as Chat };
    }

    // Create new chat if none exists
    const { data: newChat, error: insertError } = await supabase
      .from('chats')
      .insert({
        participants: [currentUserId, otherUserId],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error creating chat:", insertError);
      return { chat: null, error: insertError.message };
    }

    return { chat: newChat as Chat };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Exception in createChat:", errorMessage);
    return { chat: null, error: errorMessage };
  }
};

/**
 * Get all chats for a user
 */
export const getChatsForUser = async (
  userId: string
): Promise<{ chats: Chat[]; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('chats')
      .select('*')
      .contains('participants', [userId])
      .order('updated_at', { ascending: false });

    if (error) {
      console.error("Error fetching chats:", error);
      return { chats: [], error: error.message };
    }

    return { chats: data as Chat[] };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Exception in getChatsForUser:", errorMessage);
    return { chats: [], error: errorMessage };
  }
};

/**
 * Get a specific chat by ID
 */
export const getChatById = async (
  chatId: string
): Promise<{ chat: Chat | null; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('chats')
      .select('*')
      .eq('id', chatId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching chat:", error);
      return { chat: null, error: error.message };
    }

    return { chat: data as Chat };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Exception in getChatById:", errorMessage);
    return { chat: null, error: errorMessage };
  }
};

/**
 * Update the last message in a chat
 */
export const updateLastMessage = async (
  chatId: string,
  messageData: {
    text?: string;
    senderId: string;
    timestamp: string;
    read: boolean;
  }
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('chats')
      .update({
        last_message: messageData,
        updated_at: new Date().toISOString()
      })
      .eq('id', chatId);

    if (error) {
      console.error("Error updating last message:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Exception in updateLastMessage:", errorMessage);
    return { success: false, error: errorMessage };
  }
};

/**
 * Delete a chat by ID
 */
export const deleteChat = async (
  chatId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // First check if the user is a participant in this chat
    const { data: chat, error: fetchError } = await supabase
      .from('chats')
      .select('*')
      .eq('id', chatId)
      .maybeSingle();

    if (fetchError) {
      console.error("Error fetching chat to delete:", fetchError);
      return { success: false, error: fetchError.message };
    }

    if (!chat || !chat.participants.includes(userId)) {
      return { 
        success: false, 
        error: "Unauthorized: You cannot delete a chat you're not part of" 
      };
    }

    // Delete the chat
    const { error: deleteError } = await supabase
      .from('chats')
      .delete()
      .eq('id', chatId);

    if (deleteError) {
      console.error("Error deleting chat:", deleteError);
      return { success: false, error: deleteError.message };
    }

    // With cascade delete enabled, this will automatically delete related messages and typing statuses

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Exception in deleteChat:", errorMessage);
    return { success: false, error: errorMessage };
  }
};

/**
 * Mark a chat as read
 */
export const markChatAsRead = async (chatId: string, userId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    // We need to get the current last message first
    const { data: chat, error: fetchError } = await supabase
      .from('chats')
      .select('last_message')
      .eq('id', chatId)
      .single();
    
    if (fetchError) {
      console.error("Error fetching chat for marking as read:", fetchError);
      return { success: false, error: fetchError.message };
    }
    
    if (!chat || !chat.last_message) {
      // No last message to mark as read
      return { success: true };
    }
    
    const lastMessage = chat.last_message as any;
    
    // Only update if the current user is the recipient and message is unread
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
      
      if (updateError) {
        console.error("Error marking chat as read:", updateError);
        return { success: false, error: updateError.message };
      }
    }
    
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Exception in markChatAsRead:", errorMessage);
    return { success: false, error: errorMessage };
  }
};
