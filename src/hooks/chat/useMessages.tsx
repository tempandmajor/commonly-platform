
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getMessages, subscribeToMessages, markMessagesAsRead } from "@/services/chat";
import { ChatMessage } from "@/types/auth";
import { useToast } from "@/hooks/use-toast";

export const useMessages = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Load initial messages and subscribe to updates
  useEffect(() => {
    if (!currentUser || !chatId) {
      navigate('/');
      return;
    }

    setLoading(true);

    // Load initial messages
    const loadMessages = async () => {
      try {
        const messagesData = await getMessages(chatId);
        setMessages(messagesData);
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

    loadMessages();

    // Subscribe to real-time updates
    const unsubscribe = subscribeToMessages(chatId, (updatedMessages) => {
      setMessages(updatedMessages);
    });
    
    return () => {
      unsubscribe();
    };
  }, [chatId, currentUser, navigate, toast]);

  // Handle marking messages as read
  const handleMarkMessagesAsRead = async () => {
    if (!currentUser || !chatId) return;
    
    try {
      await markMessagesAsRead(chatId, currentUser.uid);
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
