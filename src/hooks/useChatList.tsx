
import { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/contexts/AuthContext';
import { Chat, ChatWithUser } from '@/types/chat';
import { getUserProfile } from '@/services/userService';

export function useChatList() {
  const [chats, setChats] = useState<ChatWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { currentUser } = useAuth();

  const mapDbChatToChat = useCallback(async (dbChat: any): Promise<ChatWithUser> => {
    // Find the other user's ID (not the current user)
    const otherUserId = dbChat.participants.find(
      (id: string) => id !== currentUser?.uid
    );
    
    let userData = null;
    
    if (otherUserId) {
      userData = await getUserProfile(otherUserId);
    }
    
    return {
      id: dbChat.id,
      participants: dbChat.participants || [],
      lastMessage: dbChat.last_message ? {
        text: dbChat.last_message.text || '',
        senderId: dbChat.last_message.sender_id || '',
        timestamp: dbChat.last_message.timestamp || new Date().toISOString(),
        read: dbChat.last_message.read ?? false,
      } : undefined,
      user: userData ? {
        uid: userData.uid,
        displayName: userData.displayName,
        photoURL: userData.photoURL,
        email: userData.email,
        isOnline: userData.isOnline || false,
        lastSeen: userData.lastSeen
      } : null,
      createdAt: dbChat.created_at,
      updatedAt: dbChat.updated_at,
    };
  }, [currentUser]);

  const fetchChats = useCallback(async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      
      // Fetch all chats where current user is a participant
      const { data: chatData, error: chatError } = await supabase
        .from('chats')
        .select('*')
        .contains('participants', [currentUser.uid])
        .order('updated_at', { ascending: false });
      
      if (chatError) throw chatError;
      
      if (!chatData) {
        setChats([]);
        return;
      }
      
      // For each chat, get the other user's data
      const chatsWithUserData = await Promise.all(
        chatData.map(mapDbChatToChat)
      );
      
      setChats(chatsWithUserData);
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
        filter: `participants=cs.{${currentUser.uid}}`
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
