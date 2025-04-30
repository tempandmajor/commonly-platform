
import { supabase } from "@/integrations/supabase/client";
import { Chat, ChatMessage } from "@/types/auth";
import { UserData } from "@/types/auth";

/**
 * Send a text message
 */
export const sendMessage = async (
  chatId: string,
  senderId: string,
  recipientId: string,
  text: string
): Promise<void> => {
  try {
    // Insert message
    const { error: messageError } = await supabase
      .from("messages")
      .insert({
        chat_id: chatId,
        sender_id: senderId,
        recipient_id: recipientId,
        text,
        read: false,
      });

    if (messageError) throw messageError;

    // Update chat's last message
    const { error: chatError } = await supabase
      .from("chats")
      .update({
        last_message: {
          text,
          senderId,
          timestamp: new Date().toISOString(),
          read: false,
          recipientId
        },
        updated_at: new Date().toISOString(),
      })
      .eq("id", chatId);

    if (chatError) throw chatError;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

/**
 * Send a message with an image
 */
export const sendMessageWithImage = async (
  chatId: string,
  senderId: string,
  recipientId: string,
  text: string,
  imageUrl: string
): Promise<void> => {
  try {
    // Insert message
    const { error: messageError } = await supabase
      .from("messages")
      .insert({
        chat_id: chatId,
        sender_id: senderId,
        recipient_id: recipientId,
        text,
        image_url: imageUrl,
        read: false,
      });

    if (messageError) throw messageError;

    // Update chat's last message
    const { error: chatError } = await supabase
      .from("chats")
      .update({
        last_message: {
          text: text || "Image",
          senderId,
          timestamp: new Date().toISOString(),
          read: false,
          recipientId
        },
        updated_at: new Date().toISOString(),
      })
      .eq("id", chatId);

    if (chatError) throw chatError;
  } catch (error) {
    console.error("Error sending message with image:", error);
    throw error;
  }
};

/**
 * Send a message with a voice recording
 */
export const sendMessageWithVoice = async (
  chatId: string,
  senderId: string,
  recipientId: string,
  text: string,
  voiceUrl: string
): Promise<void> => {
  try {
    // Insert message
    const { error: messageError } = await supabase
      .from("messages")
      .insert({
        chat_id: chatId,
        sender_id: senderId,
        recipient_id: recipientId,
        text,
        voice_url: voiceUrl,
        read: false,
      });

    if (messageError) throw messageError;

    // Update chat's last message
    const { error: chatError } = await supabase
      .from("chats")
      .update({
        last_message: {
          text: text || "Voice message",
          senderId,
          timestamp: new Date().toISOString(),
          read: false,
          recipientId
        },
        updated_at: new Date().toISOString(),
      })
      .eq("id", chatId);

    if (chatError) throw chatError;
  } catch (error) {
    console.error("Error sending message with voice:", error);
    throw error;
  }
};

/**
 * Get messages for a chat
 */
export const getMessages = async (chatId: string): Promise<ChatMessage[]> => {
  try {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("chat_id", chatId)
      .order("timestamp", { ascending: true });

    if (error) throw error;

    return data.map(message => ({
      id: message.id,
      chatId: message.chat_id,
      senderId: message.sender_id,
      recipientId: message.recipient_id,
      text: message.text || undefined,
      imageUrl: message.image_url || undefined,
      voiceUrl: message.voice_url || undefined,
      timestamp: message.timestamp,
      read: message.read,
    }));
  } catch (error) {
    console.error("Error getting messages:", error);
    throw error;
  }
};

/**
 * Get chats for a user
 */
export const getUserChats = async (userId: string): Promise<Chat[]> => {
  try {
    const { data, error } = await supabase
      .from("chats")
      .select("*")
      .contains("participants", [userId])
      .order("updated_at", { ascending: false });

    if (error) throw error;

    return data.map(chat => ({
      id: chat.id,
      participants: chat.participants,
      lastMessage: chat.last_message || undefined,
      createdAt: chat.created_at,
      updatedAt: chat.updated_at,
    }));
  } catch (error) {
    console.error("Error getting user chats:", error);
    throw error;
  }
};

/**
 * Mark messages as read
 */
export const markMessagesAsRead = async (
  chatId: string,
  userId: string
): Promise<void> => {
  try {
    // Update messages
    const { error: messageError } = await supabase
      .from("messages")
      .update({ read: true })
      .eq("chat_id", chatId)
      .eq("recipient_id", userId)
      .eq("read", false);

    if (messageError) throw messageError;

    // Get chat to update last message if needed
    const { data: chatData, error: chatFetchError } = await supabase
      .from("chats")
      .select("last_message, id")
      .eq("id", chatId)
      .single();

    if (chatFetchError) throw chatFetchError;

    // Only update the chat if the last message is unread and for this recipient
    if (
      chatData.last_message &&
      !chatData.last_message.read &&
      chatData.last_message.recipientId === userId
    ) {
      const updatedLastMessage = {
        ...chatData.last_message,
        read: true,
      };

      const { error: chatUpdateError } = await supabase
        .from("chats")
        .update({ last_message: updatedLastMessage })
        .eq("id", chatId);

      if (chatUpdateError) throw chatUpdateError;
    }
  } catch (error) {
    console.error("Error marking messages as read:", error);
    throw error;
  }
};

/**
 * Update typing status
 */
export const updateTypingStatus = async (
  chatId: string,
  userId: string,
  isTyping: boolean
): Promise<void> => {
  try {
    const { error } = await supabase
      .from("typing_status")
      .upsert(
        {
          chat_id: chatId,
          user_id: userId,
          is_typing: isTyping,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "chat_id,user_id" }
      );

    if (error) throw error;
  } catch (error) {
    console.error("Error updating typing status:", error);
    // Don't throw here to avoid breaking the chat if typing indicator fails
  }
};

/**
 * Subscribe to messages in a chat using Supabase Realtime
 */
export const subscribeToMessages = (
  chatId: string,
  callback: (messages: ChatMessage[]) => void
) => {
  // Initial fetch
  getMessages(chatId).then(callback).catch(console.error);
  
  // Set up realtime subscription
  const channel = supabase
    .channel(`chat:${chatId}`)
    .on(
      'postgres_changes',
      {
        event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
        schema: 'public',
        table: 'messages',
        filter: `chat_id=eq.${chatId}`
      },
      () => {
        // Refetch messages when there's a change
        getMessages(chatId).then(callback).catch(console.error);
      }
    )
    .subscribe();

  // Return unsubscribe function
  return () => {
    supabase.removeChannel(channel);
  };
};

/**
 * Subscribe to chats for a user using Supabase Realtime
 */
export const subscribeToChats = (
  userId: string,
  callback: (chats: Chat[]) => void
) => {
  // Initial fetch
  getUserChats(userId).then(callback).catch(console.error);
  
  // Set up realtime subscription
  const channel = supabase
    .channel(`user-chats:${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*', // Listen to all events
        schema: 'public',
        table: 'chats',
        filter: `participants=cs.{${userId}}`
      },
      () => {
        // Refetch chats when there's a change
        getUserChats(userId).then(callback).catch(console.error);
      }
    )
    .subscribe();

  // Return unsubscribe function
  return () => {
    supabase.removeChannel(channel);
  };
};

/**
 * Create a new chat between users
 */
export const createChat = async (
  currentUserId: string,
  otherUserId: string
): Promise<string> => {
  try {
    // Check if chat already exists
    const { data: existingChats, error: fetchError } = await supabase
      .from("chats")
      .select("id")
      .contains("participants", [currentUserId, otherUserId])
      .limit(1);

    if (fetchError) throw fetchError;

    // Return existing chat if found
    if (existingChats.length > 0) {
      return existingChats[0].id;
    }

    // Create new chat
    const { data, error } = await supabase
      .from("chats")
      .insert({
        participants: [currentUserId, otherUserId],
      })
      .select("id")
      .single();

    if (error) throw error;

    return data.id;
  } catch (error) {
    console.error("Error creating chat:", error);
    throw error;
  }
};
