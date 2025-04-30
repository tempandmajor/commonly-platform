
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useMessages } from "./useMessages";
import { useOtherUser } from "./useOtherUser";
import { useTypingStatus } from "./useTypingStatus";
import { useMessageSender } from "./useMessageSender";
import { useEmojiPicker } from "./useEmojiPicker";

export const useChat = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const { currentUser } = useAuth();
  
  // Get messages and read status
  const { messages, loading, handleMarkMessagesAsRead } = useMessages();
  
  // Get info about the other user
  const { otherUser, isOnline, lastSeen } = useOtherUser();
  
  // Typing status handling
  const { isOtherUserTyping, handleUserTyping } = useTypingStatus(
    chatId || "", 
    currentUser?.uid || "", 
    otherUser?.uid || ""
  );
  
  // Message sending functionality
  const { 
    sending, 
    isUploading, 
    uploadProgress, 
    handleSendMessage 
  } = useMessageSender(otherUser?.uid || null);
  
  // Emoji picker
  const { showEmojiPicker, setShowEmojiPicker, handleEmojiSelect } = useEmojiPicker();
  
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
    handleUserTyping
  };
};
