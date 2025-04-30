
import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { UserTyping } from "@/types/supabase";
import { updateTypingStatus } from "@/services/chat/typingService";

export const useTypingStatus = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const { currentUser } = useAuth();
  const [isOtherUserTyping, setIsOtherUserTyping] = useState<boolean>(false);
  const typingTimeoutRef = useRef<number | null>(null);

  // Subscribe to typing status
  useEffect(() => {
    if (!chatId || !currentUser) return;

    // Set up channel subscription for typing status
    const channel = supabase
      .channel(`typing_${chatId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_typing',
        filter: `chat_id=eq.${chatId}`
      }, (payload) => {
        const typingData = payload.new as UserTyping;
        
        // If the typing status is from another user
        if (typingData && typingData.user_id !== currentUser.uid) {
          setIsOtherUserTyping(typingData.is_typing);
        }
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId, currentUser]);

  // Handle user typing
  const handleUserTyping = useCallback(async (isTyping: boolean) => {
    if (!currentUser?.uid || !chatId) return;
    
    try {
      await updateTypingStatus(chatId, currentUser.uid, isTyping);
    } catch (error) {
      console.error('Error handling typing status:', error);
    }
    
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      window.clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    
    // If user is typing, set a timeout to automatically set typing to false
    if (isTyping) {
      typingTimeoutRef.current = window.setTimeout(async () => {
        try {
          await updateTypingStatus(chatId, currentUser.uid, false);
        } catch (error) {
          console.error('Error resetting typing status:', error);
        }
        
        typingTimeoutRef.current = null;
      }, 5000); // Stop typing indicator after 5 seconds of inactivity
    }
  }, [chatId, currentUser]);

  return {
    isOtherUserTyping,
    handleUserTyping
  };
};
