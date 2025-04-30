
import { supabase } from "@/integrations/supabase/client";
import { Chat, ChatWithUser } from "@/types/chat";
import { getUserProfile } from "../userService";

// Create a new chat between two users
export const createChat = async (participantIds: string[]): Promise<string> => {
  try {
    // Check for existing chat with these participants
    const { data: existingChats, error: queryError } = await supabase
      .from('chats')
      .select('*')
      .contains('participants', participantIds);

    if (queryError) throw queryError;

    // If chat exists, return the first match
    if (existingChats && existingChats.length > 0) {
      // Verify exact participant match (no additional participants)
      const exactMatch = existingChats.find(
        chat => chat.participants.length === participantIds.length &&
               chat.participants.every(id => participantIds.includes(id))
      );
      
      if (exactMatch) return exactMatch.id;
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

    if (error) throw error;
    
    return data.id;
  } catch (error) {
    console.error("Error creating chat:", error);
    throw error;
  }
};

// Get all chats for a user with the most recent message
export const getUserChats = async (userId: string): Promise<ChatWithUser[]> => {
  try {
    // Fetch all chats where the user is a participant
    const { data: chatData, error } = await supabase
      .from('chats')
      .select('*')
      .contains('participants', [userId])
      .order('updated_at', { ascending: false });

    if (error) throw error;

    if (!chatData || chatData.length === 0) {
      return [];
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

    return chatsWithUsers;
  } catch (error) {
    console.error("Error fetching user chats:", error);
    throw error;
  }
};
