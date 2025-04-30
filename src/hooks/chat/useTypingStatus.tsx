
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { updateTypingStatus } from "@/services/chat";
import { debounce } from "lodash";

export const useTypingStatus = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const { currentUser } = useAuth();
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);

  // Function to update typing status - debounced to prevent too many updates
  const handleUserTyping = debounce(() => {
    if (currentUser && chatId) {
      updateTypingStatus(chatId, currentUser.uid, true);
      
      // Automatically reset typing status after 5 seconds of inactivity
      setTimeout(() => {
        updateTypingStatus(chatId, currentUser.uid, false);
      }, 5000);
    }
  }, 500);

  // Subscribe to typing status changes for other users in this chat
  useEffect(() => {
    if (!chatId || !currentUser) return;

    // Get the other user's ID from the chat ID
    const getOtherUserID = async () => {
      const { data: chatData } = await supabase
        .from('chats')
        .select('participants')
        .eq('id', chatId)
        .single();
        
      if (chatData) {
        const otherUserId = chatData.participants.find(id => id !== currentUser.uid);
        
        if (!otherUserId) return null;
        
        return otherUserId;
      }
      
      return null;
    };
    
    // Subscribe to typing status changes
    const setupSubscription = async () => {
      const otherUserId = await getOtherUserID();
      
      if (!otherUserId) return;
      
      // Subscribe to user_typing table for other user
      const channel = supabase
        .channel(`typing_${chatId}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'user_typing',
          filter: `chat_id=eq.${chatId} AND user_id=eq.${otherUserId}`
        }, (payload) => {
          if (payload.new) {
            setIsOtherUserTyping((payload.new as any).is_typing || false);
          }
        })
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    };
    
    const unsubscribe = setupSubscription();
    
    return () => {
      if (unsubscribe) {
        unsubscribe.then(fn => fn && fn());
      }
    };
  }, [chatId, currentUser]);

  return {
    isOtherUserTyping,
    handleUserTyping
  };
};
