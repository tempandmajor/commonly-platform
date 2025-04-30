import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ChatWithUser } from "@/types/chat";

export const useChatList = () => {
  const [chats, setChats] = useState<ChatWithUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) return;

    const fetchChats = async () => {
      setLoading(true);
      try {
        // Fetch chats where the current user is a participant
        const { data: chatsData, error } = await supabase
          .from('chats')
          .select('*')
          .contains('participants', [currentUser.uid]);
        
        if (error) throw error;
        
        // Process each chat to get the other user's data and unread count
        const processedChats = await Promise.all(
          chatsData.map(async (chat) => {
            // Find the other user's ID
            const otherUserId = chat.participants.find(id => id !== currentUser.uid);
            if (!otherUserId) return null;
            
            // Get the other user's data
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select('*')
              .eq('id', otherUserId)
              .single();
              
            if (userError) throw userError;
            
            // Get unread message count
            const { count, error: countError } = await supabase
              .from('messages')
              .select('*', { count: 'exact', head: true })
              .eq('chat_id', chat.id)
              .eq('recipient_id', currentUser.uid)
              .eq('read', false);
              
            if (countError) throw countError;
            
            return {
              ...chat,
              user: userData,
              unreadCount: count || 0,
              lastMessage: chat.lastMessage ? {
                ...chat.lastMessage,
                recipientId: otherUserId
              } : undefined
            };
          })
        );

        // Filter out any null values and set the chats
        const validChats = processedChats.filter(Boolean) as ChatWithUser[];
        setChats(validChats);
      } catch (error) {
        console.error("Error fetching chats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
    
    // Set up real-time subscription for chat updates
    const channel = supabase
      .channel('public:chats')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'chats',
        filter: `participants=cs.{${currentUser.uid}}`
      }, (payload) => {
        // Refresh chats when there's a change
        fetchChats();
      })
      .subscribe();
      
    // Clean up subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser]);

  const fetchChats = async () => {
    setLoading(true);
    try {
      // Fetch chats where the current user is a participant
      const { data: chatsData, error } = await supabase
        .from('chats')
        .select('*')
        .contains('participants', [currentUser?.uid]);

      if (error) throw error;

      // Process each chat to get the other user's data and unread count
      const processedChats = await Promise.all(
        chatsData.map(async (chat) => {
          // Find the other user's ID
          const otherUserId = chat.participants.find(id => id !== currentUser?.uid);
          if (!otherUserId) return null;

          // Get the other user's data
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', otherUserId)
            .single();

          if (userError) throw userError;

          // Get unread message count
          const { count, error: countError } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('chat_id', chat.id)
            .eq('recipient_id', currentUser?.uid)
            .eq('read', false);

          if (countError) throw countError;

          return {
            ...chat,
            user: userData,
            unreadCount: count || 0,
            lastMessage: chat.lastMessage ? {
              ...chat.lastMessage,
              recipientId: otherUserId
            } : undefined
          };
        })
      );

      // Filter out any null values and set the chats
      const validChats = processedChats.filter(Boolean) as ChatWithUser[];
      setChats(validChats);
    } catch (error) {
      console.error("Error fetching chats:", error);
      setError(error as Error);
    } finally {
      setLoading(false);
    }
  };

  return { chats, loading, error, refresh: fetchChats };
};
