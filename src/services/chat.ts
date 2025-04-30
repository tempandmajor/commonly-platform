
import { supabase } from "@/integrations/supabase/client";
import { Chat, ChatMessage, ChatWithUser } from "@/types/chat";
import { getUserProfile } from "./userService";
import { updateTypingStatus as updateTypingStatusFromService } from "./chat/typingService";

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
      
      // Convert Supabase chat to our app's format
      return {
        id: chat.id,
        participants: chat.participants,
        lastMessage: chat.last_message ? {
          text: chat.last_message.text || '',
          senderId: chat.last_message.senderId || '',
          timestamp: chat.last_message.timestamp || '',
          read: chat.last_message.read || false
        } : null,
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

// Check if a user is typing in a chat
export const isUserTyping = async (chatId: string, userId: string): Promise<boolean> => {
  try {
    // Use the direct query instead of RPC for now
    const { data, error } = await supabase
      .from('user_typing')
      .select('is_typing')
      .eq('chat_id', chatId)
      .eq('user_id', userId)
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') {
        // No record means not typing
        return false;
      }
      throw error;
    }
    
    return Boolean(data?.is_typing);
  } catch (error) {
    console.error("Error checking typing status:", error);
    return false;
  }
};

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

// Update user typing status
export const updateTypingStatus = async (
  chatId: string,
  userId: string,
  isTyping: boolean
): Promise<void> => {
  return updateTypingStatusFromService(chatId, userId, isTyping);
};
