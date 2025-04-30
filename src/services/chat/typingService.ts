
import { supabase } from "@/integrations/supabase/client";
import { UserTyping } from "@/types/supabase";
import { toast } from "@/hooks/use-toast";

/**
 * Update user typing status in a chat
 */
export const updateTypingStatus = async (
  chatId: string, 
  userId: string, 
  isTyping: boolean
): Promise<{ success: boolean; error?: string }> => {
  try {
    if (!chatId || !userId) {
      console.error("Missing required parameters for updateTypingStatus");
      return { 
        success: false, 
        error: "Missing chat ID or user ID" 
      };
    }
    
    // Use direct table operations but rely on database defaults for timestamp
    const { error } = await supabase
      .from('user_typing')
      .upsert({
        chat_id: chatId,
        user_id: userId,
        is_typing: isTyping
        // Let database handle the updated_at timestamp with its default
      });
      
    if (error) {
      console.error('Error updating typing status:', error);
      toast({
        title: "Error",
        description: "Failed to update typing status",
        variant: "destructive"
      });
      return { 
        success: false, 
        error: error.message 
      };
    }
    
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Exception updating typing status:', errorMessage);
    toast({
      title: "Error",
      description: "Failed to update typing status",
      variant: "destructive"
    });
    return { 
      success: false, 
      error: errorMessage 
    };
  }
};

/**
 * Get typing status for users in a chat
 */
export const getTypingStatus = async (chatId: string): Promise<{ data: UserTyping[]; error?: string }> => {
  try {
    if (!chatId) {
      console.error("Missing required chat ID parameter");
      return { 
        data: [], 
        error: "Missing chat ID" 
      };
    }
    
    const { data, error } = await supabase
      .from('user_typing')
      .select('*')
      .eq('chat_id', chatId);
    
    if (error) {
      console.error('Error getting typing status:', error);
      toast({
        title: "Error",
        description: "Failed to get typing status",
        variant: "destructive"
      });
      return { 
        data: [], 
        error: error.message 
      };
    }
    
    return { data: data as UserTyping[] || [] };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Exception getting typing status:', errorMessage);
    toast({
      title: "Error",
      description: "Failed to get typing status",
      variant: "destructive"
    });
    return { 
      data: [], 
      error: errorMessage 
    };
  }
};

/**
 * Clear typing status for a user (used when they leave chat)
 * Can be called with just userId to clear all typing statuses for that user
 * Or with both chatId and userId to clear status for a specific chat
 */
export const clearTypingStatus = async (
  userId: string,
  chatId?: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    if (!userId) {
      return { success: false, error: "Missing user ID" };
    }
    
    let query = supabase
      .from('user_typing')
      .delete()
      .eq('user_id', userId);
      
    // If chatId is provided, only delete for that specific chat
    if (chatId) {
      query = query.eq('chat_id', chatId);
    }
    
    const { error } = await query;
      
    if (error) {
      console.error('Error clearing typing status:', error);
      toast({
        title: "Error",
        description: "Failed to clear typing status",
        variant: "destructive"
      });
      return { 
        success: false, 
        error: error.message 
      };
    }
    
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Exception clearing typing status:', errorMessage);
    toast({
      title: "Error",
      description: "Failed to clear typing status",
      variant: "destructive"
    });
    return { 
      success: false, 
      error: errorMessage 
    };
  }
};

/**
 * Clear all typing statuses in a specific chat
 */
export const clearChatTypingStatuses = async (
  chatId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    if (!chatId) {
      return { success: false, error: "Missing chat ID" };
    }
    
    const { error } = await supabase
      .from('user_typing')
      .delete()
      .eq('chat_id', chatId);
      
    if (error) {
      console.error('Error clearing chat typing statuses:', error);
      toast({
        title: "Error",
        description: "Failed to clear typing statuses",
        variant: "destructive"
      });
      return { 
        success: false, 
        error: error.message 
      };
    }
    
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Exception clearing chat typing statuses:', errorMessage);
    toast({
      title: "Error",
      description: "Failed to clear typing statuses",
      variant: "destructive"
    });
    return { 
      success: false, 
      error: errorMessage 
    };
  }
};
