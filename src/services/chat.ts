
import { supabase } from '@/integrations/supabase/client';
import { ChatMessage, Chat } from '@/types/auth';

// Fetch messages for a chat
export const getMessages = async (chatId: string): Promise<ChatMessage[]> => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('timestamp', { ascending: true });
      
    if (error) throw error;
    
    return data.map(message => ({
      id: message.id,
      chatId: message.chat_id,
      senderId: message.sender_id,
      recipientId: message.recipient_id || '',
      text: message.text || undefined,
      imageUrl: message.image_url || undefined,
      voiceUrl: message.voice_url || undefined,
      timestamp: message.timestamp,
      read: message.read || false,
    }));
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
};

// Subscribe to new messages
export const subscribeToMessages = (
  chatId: string,
  callback: (messages: ChatMessage[]) => void
): (() => void) => {
  const channel = supabase
    .channel(`messages:${chatId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `chat_id=eq.${chatId}`,
    }, (payload) => {
      // Fetch all messages again when a new message arrives
      getMessages(chatId)
        .then(callback)
        .catch(console.error);
    })
    .subscribe();
  
  return () => {
    supabase.removeChannel(channel);
  };
};

// Mark messages as read
export const markMessagesAsRead = async (chatId: string, userId: string): Promise<void> => {
  try {
    await supabase
      .from('messages')
      .update({ read: true })
      .eq('chat_id', chatId)
      .eq('recipient_id', userId)
      .eq('read', false);
  } catch (error) {
    console.error('Error marking messages as read:', error);
    throw error;
  }
};

// Send a message
export const sendMessage = async (
  chatId: string, 
  senderId: string,
  recipientId: string,
  text?: string,
  imageUrl?: string,
  voiceUrl?: string
): Promise<ChatMessage> => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert([{
        chat_id: chatId,
        sender_id: senderId,
        recipient_id: recipientId,
        text: text,
        image_url: imageUrl,
        voice_url: voiceUrl,
        timestamp: new Date().toISOString(),
        read: false,
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    // Update last_message in the chats table
    await supabase
      .from('chats')
      .update({
        last_message: {
          text: text || imageUrl ? 'Image' : voiceUrl ? 'Voice message' : '',
          sender_id: senderId,
          timestamp: data.timestamp,
          read: false,
        },
        updated_at: new Date().toISOString(),
      })
      .eq('id', chatId);
    
    return {
      id: data.id,
      chatId: data.chat_id,
      senderId: data.sender_id,
      recipientId: data.recipient_id || '',
      text: data.text || undefined,
      imageUrl: data.image_url || undefined,
      voiceUrl: data.voice_url || undefined,
      timestamp: data.timestamp,
      read: data.read || false,
    };
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

// Create a new chat
export const createChat = async (participants: string[]): Promise<Chat> => {
  try {
    const { data, error } = await supabase
      .from('chats')
      .insert({
        participants,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      participants: data.participants,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  } catch (error) {
    console.error('Error creating chat:', error);
    throw error;
  }
};

// Check if a chat exists between users
export const findChatByParticipants = async (userIds: string[]): Promise<string | null> => {
  try {
    // We need to check both possible orderings of participants
    const { data, error } = await supabase
      .from('chats')
      .select('id')
      .contains('participants', userIds)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
    
    return data?.id || null;
  } catch (error) {
    console.error('Error finding chat:', error);
    return null;
  }
};

// Update typing status
export const updateTypingStatus = async (
  chatId: string, 
  userId: string, 
  isTyping: boolean
): Promise<void> => {
  try {
    await supabase.from('user_typing').upsert({
      chat_id: chatId,
      user_id: userId,
      is_typing: isTyping,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'chat_id,user_id' });
  } catch (error) {
    console.error('Error updating typing status:', error);
  }
};

// Get all chats for a user
export const getUserChats = async (userId: string): Promise<Chat[]> => {
  try {
    const { data, error } = await supabase
      .from('chats')
      .select('*')
      .contains('participants', [userId]);
    
    if (error) throw error;
    
    return data.map(chat => ({
      id: chat.id,
      participants: chat.participants,
      lastMessage: chat.last_message,
      createdAt: chat.created_at,
      updatedAt: chat.updated_at,
    }));
  } catch (error) {
    console.error('Error fetching user chats:', error);
    throw error;
  }
};

// Count unread messages in a chat
export const countUnreadMessages = async (chatId: string, userId: string): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('chat_id', chatId)
      .eq('recipient_id', userId)
      .eq('read', false);
    
    if (error) throw error;
    
    return count || 0;
  } catch (error) {
    console.error('Error counting unread messages:', error);
    return 0;
  }
};
