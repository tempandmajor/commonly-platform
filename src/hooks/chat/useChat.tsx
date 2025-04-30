import { useMessages } from "./useMessages";
import { useOtherUser } from "./useOtherUser";
import { useTypingStatus } from "./useTypingStatus";
import { useMessageSender } from "./useMessageSender";
import { useEmojiPicker } from "./useEmojiPicker";

export const useChat = () => {
  const { messages, loading, handleMarkMessagesAsRead } = useMessages();
  const { otherUser, isOnline, lastSeen } = useOtherUser(messages);
  const { isOtherUserTyping, handleUserTyping } = useTypingStatus();
  const { sending, isUploading, uploadProgress, handleSendMessage } = useMessageSender(otherUser?.uid || null);
  const { showEmojiPicker, setShowEmojiPicker, handleEmojiSelect } = useEmojiPicker();

  return {
    // Messages
    messages,
    loading,
    handleMarkMessagesAsRead,
    
    // Other User
    otherUser,
    isOnline,
    lastSeen,
    
    // Typing Status
    isOtherUserTyping,
    handleUserTyping,
    
    // Message Sending
    sending,
    isUploading,
    uploadProgress,
    handleSendMessage,
    
    // Emoji Picker
    showEmojiPicker,
    setShowEmojiPicker,
    handleEmojiSelect
  };
};
