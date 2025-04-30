
import { supabase } from "@/integrations/supabase/client";
import { Chat, ChatWithUser } from "@/types/chat";
import { getUserProfile } from "../userService";
import { toast } from "@/hooks/use-toast";

// Create a new chat between two users
export const createChat = async (participantIds: string[]): Promise<{ id?: string; error?: string }> => {
  try {
    if (!participantIds || participantIds.length < 2) {
      return { error: "At least two participants are required" };
    }

    // Check for existing chat with these participants
    const { data: existingChats, error: queryError } = await supabase
      .from('chats')
      .select('*')
      .contains('participants', participantIds);

    if (queryError) {
      console.error("Error checking existing chats:", queryError);
      return { error: queryError.message };
    }

    // If chat exists, return the first match
    if (existingChats && existingChats.length > 0) {
      // Verify exact participant match (no additional participants)
      const exactMatch = existingChats.find(
        chat => chat.participants.length === participantIds.length &&
               chat.participants.every(id => participantIds.includes(id))
      );
      
      if (exactMatch) return { id: exactMatch.id };
    }

    // Create a new chat
    const { data, error } = await supabase
      .from('chats')
      .insert({
        participants: participantIds,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_message: null
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating chat:", error);
      return { error: error.message };
    }
    
    if (!data) {
      return { error: "No data returned when creating chat" };
    }
    
    return { id: data.id };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Exception in createChat:", errorMessage);
    return { error: errorMessage };
  }
};

// Get all chats for a user with the most recent message
export const getUserChats = async (userId: string): Promise<{ chats: ChatWithUser[]; error?: string }> => {
  try {
    if (!userId) {
      return { chats: [], error: "User ID is required" };
    }
    
    // Fetch all chats where the user is a participant
    const { data: chatData, error } = await supabase
      .from('chats')
      .select('*')
      .contains('participants', [userId])
      .order('updated_at', { ascending: false });

    if (error) {
      console.error("Error fetching user chats:", error);
      return { chats: [], error: error.message };
    }

    if (!chatData || chatData.length === 0) {
      return { chats: [] };
    }

    // Collect all unique participant IDs (excluding the current user)
    const otherUserIds = new Set<string>();
    chatData.forEach(chat => {
      chat.participants.forEach(id => {
        if (id !== userId) {
          otherUserIds.add(id);
        }
      });
    });

    // Fetch all user profiles in one batch
    const userProfiles = new Map();
    for (const id of otherUserIds) {
      try {
        const profile = await getUserProfile(id);
        if (profile) {
          userProfiles.set(id, profile);
        }
      } catch (e) {
        console.error(`Error fetching user ${id}:`, e);
        toast({
          title: "Error",
          description: "Failed to load some user profiles",
          variant: "destructive"
        });
      }
    }

    // Map chats to include user information
    const chatsWithUsers: ChatWithUser[] = chatData.map(chat => {
      // Find the other user in this chat
      const otherUserId = chat.participants.find(id => id !== userId);
      
      // Get their profile (or null if not found)
      const otherUser = otherUserId ? userProfiles.get(otherUserId) : null;
      
      // Handle last_message properly with type safety
      let lastMessage = null;
      if (chat.last_message) {
        const lastMsg = chat.last_message as any; // Type assertion to help with JSON data
        lastMessage = {
          text: lastMsg.text || '',
          senderId: lastMsg.senderId || '',
          timestamp: lastMsg.timestamp || '',
          read: lastMsg.read || false
        };
      }
      
      // Convert Supabase chat to our app's format
      return {
        id: chat.id,
        participants: chat.participants,
        lastMessage: lastMessage,
        createdAt: chat.created_at,
        updatedAt: chat.updated_at,
        user: otherUser ? {
          uid: otherUser.uid,
          displayName: otherUser.displayName,
          photoURL: otherUser.photoURL,
          email: otherUser.email,
          isOnline: false, // Default until we implement presence
          lastSeen: null // Default until we implement presence
        } : null
      };
    });

    return { chats: chatsWithUsers };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Exception in getUserChats:", errorMessage);
    return { chats: [], error: errorMessage };
  }
};

/**
 * Check if a chat exists between two users
 */
export const checkChatExists = async (userIds: string[]): Promise<{ exists: boolean; chatId?: string; error?: string }> => {
  try {
    if (!userIds || userIds.length < 2) {
      return { exists: false, error: "At least two user IDs required" };
    }

    const { data, error } = await supabase
      .from('chats')
      .select('id')
      .contains('participants', userIds)
      .filter(`array_length(participants, 1) = ${userIds.length}`)
      .maybeSingle();

    if (error) {
      console.error("Error checking if chat exists:", error);
      return { exists: false, error: error.message };
    }

    return {
      exists: !!data,
      chatId: data?.id
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Exception in checkChatExists:", errorMessage);
    return { exists: false, error: errorMessage };
  }
};
