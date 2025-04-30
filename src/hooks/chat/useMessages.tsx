
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ChatMessage } from "@/types/chat";

export const useMessages = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();

  // Load initial messages and subscribe to updates
  useEffect(() => {
    if (!currentUser || !chatId) {
      return;
    }

    setLoading(true);

    // Function to fetch messages
    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('chat_id', chatId)
          .order('timestamp', { ascending: true });
        
        if (error) throw error;
        
        setMessages(data as ChatMessage[] || []);
      } catch (error) {
        console.error("Error loading messages:", error);
        toast({
          title: "Error",
          description: "Failed to load messages",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    // Fetch initial messages
    fetchMessages();

    // Set up real-time subscription
    const channel = supabase
      .channel(`messages:${chatId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'messages',
        filter: `chat_id=eq.${chatId}`
      }, () => {
        fetchMessages();
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId, currentUser, toast]);

  // Handle marking messages as read
  const handleMarkMessagesAsRead = async () => {
    if (!currentUser || !chatId) return;
    
    try {
      // Update all unread messages where the current user is the recipient
      const { error: messagesError } = await supabase
        .from('messages')
        .update({ read: true })
        .eq('chat_id', chatId)
        .eq('recipient_id', currentUser.uid)
        .eq('read', false);
      
      if (messagesError) throw messagesError;
      
      // Check if the last message needs to be updated as well
      const { data: chat, error: chatError } = await supabase
        .from('chats')
        .select('last_message')
        .eq('id', chatId)
        .single();
      
      if (chatError) throw chatError;
      
      if (chat && chat.last_message) {
        // Use type assertion to safely access the properties
        const lastMessage = chat.last_message as any;
        
        if (lastMessage.recipient_id === currentUser.uid && !lastMessage.read) {
          const { error: updateError } = await supabase
            .from('chats')
            .update({
              last_message: {
                ...lastMessage,
                read: true
              }
            })
            .eq('id', chatId);
          
          if (updateError) throw updateError;
        }
      }
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  return {
    messages,
    loading,
    handleMarkMessagesAsRead
  };
};
