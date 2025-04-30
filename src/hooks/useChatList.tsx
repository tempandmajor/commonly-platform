
import { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/contexts/AuthContext';
import { Chat, ChatWithUser } from '@/types/chat';

export function useChatList() {
  const [chats, setChats] = useState<ChatWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { currentUser } = useAuth();

  const mapDbChatToChat = useCallback((dbChat: any): ChatWithUser => {
    return {
      id: dbChat.id,
      participants: dbChat.participants || [],
      lastMessage: dbChat.last_message ? {
        text: dbChat.last_message.text || '',
        senderId: dbChat.last_message.sender_id || '',
        timestamp: dbChat.last_message.timestamp || new Date().toISOString(),
        read: dbChat.last_message.read ?? false,
      } : undefined,
      user: dbChat.user ? {
        uid: dbChat.user.id,
        displayName: dbChat.user.display_name,
        photoURL: dbChat.user.photo_url,
        email: dbChat.user.email,
      } : null,
      createdAt: dbChat.created_at,
      updatedAt: dbChat.updated_at,
    };
  }, []);

  const fetchChats = useCallback(async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      
      // Fetch all chats where current user is a participant
      const { data: chatData, error: chatError } = await supabase
        .from('chats')
        .select('*')
        .contains('participants', [currentUser.id]);
      
      if (chatError) throw chatError;
      
      // For each chat, get the other user's data
      const chatsWithUserData = await Promise.all(
        chatData.map(async (chat) => {
          // Find the other user's ID
          const otherUserId = chat.participants.find(
            (id: string) => id !== currentUser.id
          );
          
          if (!otherUserId) {
            return { ...chat, user: null };
          }
          
          // Get other user's data
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', otherUserId)
            .single();
          
          if (userError) {
            console.error('Error fetching user data:', userError);
            return { ...chat, user: null };
          }
          
          return { ...chat, user: userData };
        })
      );
      
      // Map the data to our Chat type
      const mappedChats = chatsWithUserData.map(mapDbChatToChat);
      
      // Sort by last message timestamp
      mappedChats.sort((a, b) => {
        const timeA = a.lastMessage?.timestamp ? new Date(a.lastMessage.timestamp).getTime() : 0;
        const timeB = b.lastMessage?.timestamp ? new Date(b.lastMessage.timestamp).getTime() : 0;
        return timeB - timeA;
      });
      
      setChats(mappedChats);
    } catch (err) {
      setError(err as Error);
      console.error("Error fetching chats:", err);
    } finally {
      setLoading(false);
    }
  }, [currentUser, mapDbChatToChat]);

  const subscribeToChats = useCallback(() => {
    if (!currentUser) return null;
    
    const channel = supabase
      .channel('public:chats')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'chats',
        filter: `participants=cs.{${currentUser.id}}`,
      }, () => {
        fetchChats();
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser, fetchChats]);

  useEffect(() => {
    fetchChats();
    const unsubscribe = subscribeToChats();
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [fetchChats, subscribeToChats]);

  return { chats, loading, error, refreshChats: fetchChats };
}
