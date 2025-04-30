
import { supabase } from "@/integrations/supabase/client";
import { Chat, ChatMessage, ChatWithUser, ChatUser } from "@/types/chat";
import { getUserProfile } from "@/services/userService";

// Chat core functions
export const createChat = async (currentUserId: string, otherUserId: string): Promise<string> => {
  try {
    // Check if a chat already exists between these users
    const { data: existingChats, error: queryError } = await supabase
      .from('chats')
      .select('*')
      .contains('participants', [currentUserId, otherUserId]);
    
    if (queryError) throw queryError;
    
    // If chat exists, return its ID
    if (existingChats && existingChats.length > 0) {
      return existingChats[0].id;
    }
    
    // Create a new chat
    const { data: newChat, error: insertError } = await supabase
      .from('chats')
      .insert({
        participants: [currentUserId, otherUserId],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (insertError) throw insertError;
    
    return newChat.id;
  } catch (error) {
    console.error("Error creating chat:", error);
    throw error;
  }
};

export const getUserChats = async (userId: string): Promise<Chat[]> => {
  try {
    const { data: chats, error } = await supabase
      .from('chats')
      .select('*')
      .contains('participants', [userId])
      .order('updated_at', { ascending: false });
    
    if (error) throw error;
    
    if (!chats) return [];
    
    return chats.map(chat => ({
      id: chat.id,
      participants: chat.participants,
      lastMessage: chat.last_message ? {
        text: chat.last_message.text || '',
        senderId: chat.last_message.sender_id || '',
        timestamp: chat.last_message.timestamp || '',
        read: chat.last_message.read || false
      } : undefined,
      createdAt: chat.created_at,
      updatedAt: chat.updated_at
    }));
  } catch (error) {
    console.error("Error fetching user chats:", error);
    throw error;
  }
};

export const subscribeToChats = (userId: string, callback: (chats: ChatWithUser[]) => void) => {
  // Channel to listen for changes
  const channel = supabase
    .channel('public:chats')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'chats',
      filter: `participants=cs.{${userId}}`
    }, () => {
      // When changes occur, fetch updated chats
      fetchChatsWithUsers(userId).then(callback);
    })
    .subscribe();
  
  // Initial fetch
  fetchChatsWithUsers(userId).then(callback);
  
  // Return unsubscribe function
  return () => {
    supabase.removeChannel(channel);
  };
};

// Helper function to fetch chats with user data
const fetchChatsWithUsers = async (userId: string): Promise<ChatWithUser[]> => {
  try {
    const { data: chats, error } = await supabase
      .from('chats')
      .select('*')
      .contains('participants', [userId])
      .order('updated_at', { ascending: false });
    
    if (error) throw error;
    
    if (!chats) return [];
    
    // Get other user details for each chat
    const chatsWithUser = await Promise.all(chats.map(async (chat) => {
      // Find the other user's ID
      const otherUserId = chat.participants.find((id: string) => id !== userId);
      
      let otherUser: ChatUser | null = null;
      
      if (otherUserId) {
        // Get other user's data
        const userData = await getUserProfile(otherUserId);
        
        if (userData) {
          otherUser = {
            uid: userData.uid,
            displayName: userData.displayName,
            photoURL: userData.photoURL,
            email: userData.email,
            isOnline: userData.isOnline || false,
            lastSeen: userData.lastSeen
          };
        }
      }
      
      return {
        id: chat.id,
        participants: chat.participants,
        lastMessage: chat.last_message ? {
          text: chat.last_message.text || '',
          senderId: chat.last_message.sender_id || '',
          timestamp: chat.last_message.timestamp || '',
          read: chat.last_message.read || false
        } : undefined,
        user: otherUser,
        createdAt: chat.created_at,
        updatedAt: chat.updated_at
      };
    }));
    
    return chatsWithUser;
  } catch (error) {
    console.error("Error fetching chats with users:", error);
    return [];
  }
};

export const getMessages = async (chatId: string): Promise<ChatMessage[]> => {
  try {
    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('timestamp', { ascending: true });
    
    if (error) throw error;
    
    return messages || [];
  } catch (error) {
    console.error("Error fetching messages:", error);
    throw error;
  }
};

export const subscribeToMessages = (chatId: string, callback: (messages: ChatMessage[]) => void) => {
  // Initial fetch
  getMessages(chatId).then(callback);
  
  // Real-time subscription
  const channel = supabase
    .channel(`messages:${chatId}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'messages',
      filter: `chat_id=eq.${chatId}`
    }, () => {
      // When messages change, fetch all messages again
      getMessages(chatId).then(callback);
    })
    .subscribe();
  
  // Return unsubscribe function
  return () => {
    supabase.removeChannel(channel);
  };
};

export const sendMessage = async (
  chatId: string, 
  senderId: string, 
  recipientId: string, 
  text: string,
  imageUrl?: string,
  voiceUrl?: string
): Promise<string> => {
  try {
    // Create the message object
    const messageData: any = {
      chat_id: chatId,
      sender_id: senderId,
      recipient_id: recipientId,
      text: text,
      timestamp: new Date().toISOString(),
      read: false
    };
    
    if (imageUrl) messageData.image_url = imageUrl;
    if (voiceUrl) messageData.voice_url = voiceUrl;
    
    // Insert the message
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .insert(messageData)
      .select()
      .single();
    
    if (messageError) throw messageError;
    
    // Update the chat's last message
    const { error: chatError } = await supabase
      .from('chats')
      .update({
        last_message: {
          id: message.id,
          sender_id: senderId,
          recipient_id: recipientId,
          text: imageUrl ? '📷 Image' : voiceUrl ? '🎤 Voice message' : text,
          timestamp: message.timestamp,
          read: false
        },
        updated_at: new Date().toISOString()
      })
      .eq('id', chatId);
    
    if (chatError) throw chatError;
    
    // Create notification
    await createMessageNotification(senderId, recipientId, text, chatId, imageUrl, voiceUrl);
    
    return message.id;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

export const markMessagesAsRead = async (chatId: string, userId: string): Promise<void> => {
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
    
    if (chat && chat.last_message && 
        chat.last_message.recipient_id === userId && 
        !chat.last_message.read) {
      
      const { error: updateError } = await supabase
        .from('chats')
        .update({
          last_message: {
            ...chat.last_message,
            read: true
          }
        })
        .eq('id', chatId);
      
      if (updateError) throw updateError;
    }
  } catch (error) {
    console.error("Error marking messages as read:", error);
    throw error;
  }
};

export const updateTypingStatus = async (
  chatId: string, 
  userId: string, 
  isTyping: boolean
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('user_typing')
      .upsert({
        chat_id: chatId,
        user_id: userId,
        is_typing: isTyping,
        updated_at: new Date().toISOString()
      });
    
    if (error) {
      console.error("Error updating typing status:", error);
    }
  } catch (error) {
    console.error("Error updating typing status:", error);
  }
};

// Helper function to create message notifications
const createMessageNotification = async (
  senderId: string,
  recipientId: string,
  text: string,
  chatId: string,
  imageUrl?: string,
  voiceUrl?: string
): Promise<void> => {
  try {
    const sender = await getUserProfile(senderId);
    if (!sender) return;
    
    const senderName = sender.displayName || "Someone";
    
    let notificationText;
    if (imageUrl) {
      notificationText = `${senderName} sent you an image`;
    } else if (voiceUrl) {
      notificationText = `${senderName} sent you a voice message`;
    } else {
      // Truncate long messages
      const truncatedText = text.length > 30 ? text.substring(0, 30) + '...' : text;
      notificationText = `${senderName} sent you a message: ${truncatedText}`;
    }
    
    const notificationData = {
      user_id: recipientId,
      type: 'message',
      title: 'New Message',
      body: notificationText,
      image_url: sender.photoURL || null,
      read: false,
      data: { chatId, senderId }
    };
    
    const { error } = await supabase
      .from('notifications')
      .insert(notificationData);
    
    if (error) {
      console.error("Error creating message notification:", error);
    }
  } catch (error) {
    console.error("Error creating message notification:", error);
  }
};

// Export functions for backward compatibility
export { 
  createChat, 
  getUserChats, 
  subscribeToChats, 
  getMessages, 
  subscribeToMessages, 
  sendMessage, 
  markMessagesAsRead, 
  updateTypingStatus 
};
