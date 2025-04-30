
// Re-export all functions from the chat module
export * from './chat/index';

// Add these functions here for backward compatibility
// in case they were directly imported from this file
import { 
  createChat, getUserChats, sendMessage, 
  markMessagesAsRead, getMessages, getUnreadCount,
  getTotalUnreadCount, updateMessageReadStatus,
  updateTypingStatus, getTypingStatus,
  sendMessageWithImage, sendMessageWithVoice
} from './chat/index';

export {
  createChat, getUserChats, sendMessage, 
  markMessagesAsRead, getMessages, getUnreadCount,
  getTotalUnreadCount, updateMessageReadStatus,
  updateTypingStatus, getTypingStatus,
  sendMessageWithImage, sendMessageWithVoice
};
