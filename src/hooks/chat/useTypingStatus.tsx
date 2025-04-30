
import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { updateTypingStatus, clearTypingStatus } from "@/services/chat";
import { debounce } from "lodash";
import { toast } from "@/hooks/use-toast";

export const useTypingStatus = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const { currentUser } = useAuth();
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to update typing status - debounced to prevent too many updates
  const handleUserTyping = useCallback(
    debounce(() => {
      if (currentUser && chatId) {
        updateTypingStatus(chatId, currentUser.uid, true)
          .then(({ success, error }) => {
            if (!success && error) {
              console.error("Failed to update typing status:", error);
              setError(`Typing status error: ${error}`);
            }
          });
        
        // Automatically reset typing status after 5 seconds of inactivity
        setTimeout(() => {
          if (currentUser && chatId) {
            updateTypingStatus(chatId, currentUser.uid, false)
              .catch(err => {
                console.error("Error resetting typing status:", err);
              });
          }
        }, 5000);
      }
    }, 500),
    [chatId, currentUser]
  );

  // Subscribe to typing status changes for other users in this chat
  useEffect(() => {
    if (!chatId || !currentUser) return;

    // Get the other user's ID from the chat ID
    const getOtherUserID = async () => {
      try {
        const { data: chatData, error } = await supabase
          .from('chats')
          .select('participants')
          .eq('id', chatId)
          .single();
          
        if (error) {
          console.error("Error fetching chat data:", error);
          setError(`Failed to get chat data: ${error.message}`);
          return null;
        }
        
        if (chatData) {
          const otherUserId = chatData.participants.find(id => id !== currentUser.uid);
          return otherUserId || null;
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error("Exception in getOtherUserID:", errorMessage);
        setError(`Failed to get other user: ${errorMessage}`);
      }
      
      return null;
    };
    
    // Subscribe to typing status changes
    const setupSubscription = async () => {
      try {
        const otherUserId = await getOtherUserID();
        
        if (!otherUserId) {
          console.warn("Could not find other user ID in chat");
          return;
        }
        
        // Subscribe to user_typing table for other user
        const channel = supabase
          .channel(`typing_${chatId}`)
          .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'user_typing',
            filter: `chat_id=eq.${chatId} AND user_id=eq.${otherUserId}`
          }, (payload) => {
            try {
              if (payload.new) {
                setIsOtherUserTyping((payload.new as any).is_typing || false);
              }
            } catch (err) {
              console.error("Error processing typing update:", err);
            }
          })
          .subscribe((status) => {
            if (status !== 'SUBSCRIBED') {
              console.error("Failed to subscribe to typing channel:", status);
              setError("Failed to monitor typing status");
            }
          });
          
        return channel;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error("Error in setupSubscription:", errorMessage);
        setError(`Subscription error: ${errorMessage}`);
        return null;
      }
    };
    
    let channel: any = null;
    
    setupSubscription().then(ch => {
      channel = ch;
    });
    
    // Clean up typing status when leaving the chat
    return () => {
      if (currentUser) {
        // Ensure we clear the typing status when leaving the component
        updateTypingStatus(chatId, currentUser.uid, false)
          .then(() => clearTypingStatus(currentUser.uid))
          .catch(err => {
            console.error("Error cleaning up typing status on unmount:", err);
          });
      }
      
      // Remove the subscription
      if (channel) {
        supabase.removeChannel(channel).catch(err => {
          console.error("Error removing typing channel:", err);
        });
      }
    };
  }, [chatId, currentUser]);

  return {
    isOtherUserTyping,
    handleUserTyping,
    error
  };
};
