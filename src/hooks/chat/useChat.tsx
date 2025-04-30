
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useMessages } from "./useMessages";
import { useOtherUser } from "./useOtherUser";
import { useTypingStatus } from "./useTypingStatus";
import { useMessageSender } from "./useMessageSender";
import { useEmojiPicker } from "./useEmojiPicker";
import { toast } from "@/hooks/use-toast";
import { clearTypingStatus } from "@/services/chat";

export const useChat = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const { currentUser } = useAuth();
  const [error, setError] = useState<string | null>(null);
  
  // Get messages and read status
  const { 
    messages, 
    loading, 
    handleMarkMessagesAsRead, 
    error: messagesError 
  } = useMessages();
  
  // Get info about the other user
  const { 
    user: otherUser, 
    isOnline, 
    lastSeen, 
    error: userError 
  } = useOtherUser(chatId ? chatId.split("/")[0] : null);
  
  // Typing status handling
  const { 
    isOtherUserTyping, 
    handleUserTyping, 
    error: typingError 
  } = useTypingStatus();
  
  // Message sending functionality
  const { 
    sending, 
    isUploading, 
    uploadProgress, 
    handleSendMessage,
    error: sendError
  } = useMessageSender(otherUser?.uid || null);
  
  // Emoji picker
  const { showEmojiPicker, setShowEmojiPicker, handleEmojiSelect } = useEmojiPicker();

  // Handle and display errors
  useEffect(() => {
    const errors = [messagesError, userError, typingError, sendError]
      .filter(Boolean)
      .join("; ");
      
    if (errors) {
      setError(errors);
      toast({
        title: "Chat Error",
        description: "There was an error in the chat. Please try refreshing the page.",
        variant: "destructive"
      });
    } else {
      setError(null);
    }
  }, [messagesError, userError, typingError, sendError]);

  // Clean up typing status when the hook unmounts or when chatId/user changes
  useEffect(() => {
    return () => {
      if (currentUser && chatId) {
        // Clear typing status for this user in this chat when leaving
        clearTypingStatus(currentUser.uid, chatId).catch(err => {
          console.error("Error clearing typing status when leaving chat:", err);
        });
      }
    };
  }, [chatId, currentUser]);
  
  return {
    messages,
    otherUser,
    loading,
    sending,
    isOnline,
    lastSeen,
    isUploading,
    uploadProgress,
    showEmojiPicker,
    isOtherUserTyping,
    setShowEmojiPicker,
    handleSendMessage,
    handleEmojiSelect,
    handleMarkMessagesAsRead,
    handleUserTyping,
    error
  };
};
