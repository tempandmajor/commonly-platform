
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
  const [error, setError] = useState<string | null>(null);
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
        
        if (error) {
          setError(error.message);
          console.error("Error loading messages:", error);
          toast({
            title: "Error",
            description: "Failed to load messages",
            variant: "destructive"
          });
          return;
        }
        
        // Map the snake_case fields to camelCase
        const formattedMessages = data?.map(msg => ({
          id: msg.id,
          chatId: msg.chat_id,
          senderId: msg.sender_id,
          recipientId: msg.recipient_id,
          text: msg.text,
          imageUrl: msg.image_url,
          voiceUrl: msg.voice_url,
          timestamp: msg.timestamp,
          read: msg.read
        })) || [];
        
        setMessages(formattedMessages);
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        console.error("Exception in fetchMessages:", errorMessage);
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
      .subscribe((status) => {
        if (status !== 'SUBSCRIBED') {
          console.error("Failed to subscribe to messages channel:", status);
          setError(`Failed to subscribe to messages: ${status}`);
        }
      });
    
    return () => {
      supabase.removeChannel(channel).catch(err => {
        console.error("Error removing messages channel:", err);
      });
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
      
      if (messagesError) {
        console.error("Error marking messages as read:", messagesError);
        toast({
          title: "Error",
          description: "Failed to mark messages as read",
          variant: "destructive"
        });
        return;
      }
      
      // Check if the last message needs to be updated as well
      const { data: chat, error: chatError } = await supabase
        .from('chats')
        .select('last_message')
        .eq('id', chatId)
        .maybeSingle(); // Use maybeSingle instead of single
      
      if (chatError) {
        console.error("Error fetching chat for read status update:", chatError);
        return;
      }
      
      if (chat && chat.last_message) {
        const lastMessage = chat.last_message as any;
        
        if (lastMessage.recipientId === currentUser.uid && !lastMessage.read) {
          const { error: updateError } = await supabase
            .from('chats')
            .update({
              last_message: {
                ...lastMessage,
                read: true
              }
            })
            .eq('id', chatId);
          
          if (updateError) {
            console.error("Error updating chat last message read status:", updateError);
          }
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error("Exception in handleMarkMessagesAsRead:", errorMessage);
      setError(errorMessage);
      toast({
        title: "Error",
        description: "Failed to update message status",
        variant: "destructive"
      });
    }
  };

  return {
    messages,
    loading,
    handleMarkMessagesAsRead,
    error
  };
};
