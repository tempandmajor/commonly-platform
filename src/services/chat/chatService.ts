
import { supabase } from "@/integrations/supabase/client";
import { Chat, ChatWithUser } from "@/types/chat";
import { toast } from "@/hooks/use-toast";

// Helper to map database fields to our Chat type
const mapDatabaseChat = (dbChat: any): Chat => {
  return {
    id: dbChat.id,
    participants: dbChat.participants || [],
    lastMessage: dbChat.last_message ? {
      text: dbChat.last_message.text,
      senderId: dbChat.last_message.senderId,
      timestamp: dbChat.last_message.timestamp,
      read: dbChat.last_message.read || false
    } : undefined,
    createdAt: dbChat.created_at,
    updatedAt: dbChat.updated_at
  };
};

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
      toast({
        title: "Error creating chat",
        description: fetchError.message,
        variant: "destructive"
      });
      return { chat: null, error: fetchError.message };
    }

    // If chat already exists, return it
    if (existingChats && existingChats.length > 0) {
      return { chat: mapDatabaseChat(existingChats[0]) };
    }

    // Create new chat if none exists
    const { data: newChat, error: insertError } = await supabase
      .from('chats')
      .insert({
        participants: [currentUserId, otherUserId]
        // Let database handle timestamps with default values
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error creating chat:", insertError);
      toast({
        title: "Error creating chat",
        description: insertError.message,
        variant: "destructive"
      });
      return { chat: null, error: insertError.message };
    }

    return { chat: mapDatabaseChat(newChat) };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Exception in createChat:", errorMessage);
    toast({
      title: "Error creating chat",
      description: errorMessage,
      variant: "destructive"
    });
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
      toast({
        title: "Error loading chats",
        description: error.message,
        variant: "destructive"
      });
      return { chats: [], error: error.message };
    }

    return { chats: data ? data.map(mapDatabaseChat) : [] };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Exception in getChatsForUser:", errorMessage);
    toast({
      title: "Error loading chats",
      description: errorMessage,
      variant: "destructive"
    });
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
      toast({
        title: "Error loading chat",
        description: error.message,
        variant: "destructive"
      });
      return { chat: null, error: error.message };
    }

    return { chat: data ? mapDatabaseChat(data) : null };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Exception in getChatById:", errorMessage);
    toast({
      title: "Error loading chat",
      description: errorMessage,
      variant: "destructive"
    });
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
    recipientId?: string;
    timestamp: string;
    read: boolean;
  }
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .rpc('update_chat_last_message', {
        p_chat_id: chatId,
        p_last_message: messageData
      });

    if (error) {
      console.error("Error updating last message:", error);
      toast({
        title: "Error updating chat",
        description: error.message,
        variant: "destructive"
      });
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Exception in updateLastMessage:", errorMessage);
    toast({
      title: "Error updating chat",
      description: errorMessage,
      variant: "destructive"
    });
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
      toast({
        title: "Error deleting chat",
        description: fetchError.message,
        variant: "destructive"
      });
      return { success: false, error: fetchError.message };
    }

    if (!chat || !chat.participants.includes(userId)) {
      toast({
        title: "Unauthorized",
        description: "You cannot delete a chat you're not part of",
        variant: "destructive"
      });
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
      toast({
        title: "Error deleting chat",
        description: deleteError.message,
        variant: "destructive"
      });
      return { success: false, error: deleteError.message };
    }

    // We now have triggers that will automatically clean up related data

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Exception in deleteChat:", errorMessage);
    toast({
      title: "Error deleting chat",
      description: errorMessage,
      variant: "destructive"
    });
    return { success: false, error: errorMessage };
  }
};

/**
 * Mark a chat as read
 */
export const markChatAsRead = async (chatId: string, userId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .rpc('mark_messages_as_read', {
        p_chat_id: chatId,
        p_recipient_id: userId
      });
    
    if (error) {
      console.error("Error marking chat as read:", error);
      toast({
        title: "Error updating message status",
        description: error.message,
        variant: "destructive"
      });
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Exception in markChatAsRead:", errorMessage);
    toast({
      title: "Error updating message status",
      description: errorMessage,
      variant: "destructive"
    });
    return { success: false, error: errorMessage };
  }
};
