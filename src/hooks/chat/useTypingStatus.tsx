
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
                const errorMessage = err instanceof Error ? err.message : 'Unknown error';
                console.error("Error resetting typing status:", errorMessage);
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

    let channel: any = null;
    
    // Subscribe to user_typing table for this chat
    const setupSubscription = async () => {
      try {
        // Get the other user's ID from the chat ID
        const { data: chatData, error } = await supabase
          .from('chats')
          .select('participants')
          .eq('id', chatId)
          .maybeSingle();
          
        if (error) {
          console.error("Error fetching chat data:", error);
          setError(`Failed to get chat data: ${error.message}`);
          return null;
        }
        
        if (!chatData || !chatData.participants) {
          console.warn("Chat not found or has no participants:", chatId);
          return null;
        }
        
        const otherUserId = chatData.participants.find(id => id !== currentUser.uid);
        
        if (!otherUserId) {
          console.warn("Could not find other user ID in chat");
          return null;
        }
        
        // Subscribe to typing status changes for the other user in this chat
        channel = supabase
          .channel(`typing_${chatId}`)
          .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'user_typing',
            filter: `chat_id=eq.${chatId} AND user_id=eq.${otherUserId}`
          }, (payload) => {
            try {
              if (payload.new) {
                setIsOtherUserTyping((payload.new as any).is_typing ?? false);
              }
            } catch (err) {
              const errorMessage = err instanceof Error ? err.message : 'Unknown error';
              console.error("Error processing typing update:", errorMessage);
              setError(`Error processing typing update: ${errorMessage}`);
            }
          })
          .subscribe((status) => {
            if (status !== 'SUBSCRIBED') {
              console.error("Failed to subscribe to typing channel:", status);
              setError(`Failed to monitor typing status: ${status}`);
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
    
    setupSubscription().then(ch => {
      channel = ch;
    });
    
    // Clear typing status when component unmounts or chatId/currentUser changes
    return () => {
      if (currentUser && chatId) {
        // First, set typing status to false
        updateTypingStatus(chatId, currentUser.uid, false)
          .then(() => {
            // Then clear the typing status for this user in this chat
            clearTypingStatus(currentUser.uid, chatId)
              .catch(err => {
                const errorMessage = err instanceof Error ? err.message : 'Unknown error';
                console.error("Error cleaning up typing status on unmount:", errorMessage);
              });
          })
          .catch(err => {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            console.error("Error updating typing status on unmount:", errorMessage);
          });
      }
      
      // Remove the subscription
      if (channel) {
        supabase.removeChannel(channel).catch(err => {
          const errorMessage = err instanceof Error ? err.message : 'Unknown error';
          console.error("Error removing typing channel:", errorMessage);
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
