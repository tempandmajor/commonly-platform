
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useOtherUser } from "./useOtherUser";
import { ChatMessage } from "@/types/auth";

export default function useChat(chatId: string, otherUserId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { currentUser } = useAuth();
  const { user, isOnline, lastSeen, loading: userLoading } = useOtherUser(otherUserId);

  const fetchMessages = useCallback(async () => {
    if (!chatId) return;
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('timestamp', { ascending: true });
        
      if (error) throw error;
      
      const formattedMessages = data.map(message => ({
        id: message.id,
        chatId: message.chat_id,
        senderId: message.sender_id,
        recipientId: message.recipient_id,
        text: message.text || undefined,
        imageUrl: message.image_url || undefined,
        voiceUrl: message.voice_url || undefined,
        timestamp: message.timestamp || new Date().toISOString(),
        read: message.read || false,
      }));
      
      setMessages(formattedMessages);
    } catch (err) {
      console.error("Error fetching messages:", err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [chatId]);

  const markAsRead = useCallback(async () => {
    if (!chatId || !currentUser) return;
    
    try {
      await supabase
        .from('messages')
        .update({ read: true })
        .eq('chat_id', chatId)
        .eq('recipient_id', currentUser.id)
        .eq('read', false);
    } catch (err) {
      console.error("Error marking messages as read:", err);
    }
  }, [chatId, currentUser]);

  // Subscribe to new messages
  useEffect(() => {
    if (!chatId) return;
    
    fetchMessages();
    
    const channel = supabase
      .channel(`messages:${chatId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `chat_id=eq.${chatId}`,
      }, (payload) => {
        const newMessage = payload.new as any;
        
        const formattedMessage: ChatMessage = {
          id: newMessage.id,
          chatId: newMessage.chat_id,
          senderId: newMessage.sender_id,
          recipientId: newMessage.recipient_id,
          text: newMessage.text || undefined,
          imageUrl: newMessage.image_url || undefined,
          voiceUrl: newMessage.voice_url || undefined,
          timestamp: newMessage.timestamp || new Date().toISOString(),
          read: newMessage.read || false,
        };
        
        setMessages(prev => [...prev, formattedMessage]);
        
        // Mark as read if the message is for the current user
        if (formattedMessage.recipientId === currentUser?.id) {
          markAsRead();
        }
      })
      .subscribe();
      
    // Mark messages as read when opening the chat
    markAsRead();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId, fetchMessages, markAsRead, currentUser?.id]);

  return { messages, loading, error, otherUser: user, isOnline, lastSeen };
}

// Export the hook to be used in other components
export { useChat };
