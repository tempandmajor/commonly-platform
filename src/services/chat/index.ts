
// Chat core functions
import { 
  createChat,
  getUserChats,
  subscribeToChats,
  getChatById,
  getChatByParticipants
} from "./chatService";

// Message-related functions
import { 
  getMessages,
  subscribeToMessages,
  markMessagesAsRead,
  updateTypingStatus
} from "./messageService";

// Message sending functions
import { 
  sendMessage,
  sendMessageWithImage,
  sendMessageWithVoice
} from "./sendMessageService";

// Participant functions
import { 
  getOtherParticipant 
} from "./participantService";

// Unread messages functions
import { 
  getUnreadCount,
  markAllAsRead,
  getTotalUnreadCount,
  updateMessageReadStatus
} from "./unreadService";

// Export chat core functions
export const chatCore = {
  createChat,
  getUserChats,
  subscribeToChats,
  getChatById,
  getChatByParticipants
};

// Export message functions
export const messageOperations = {
  getMessages,
  subscribeToMessages,
  markMessagesAsRead,
  updateTypingStatus
};

// Export message sending functions
export const messageSending = {
  sendMessage,
  sendMessageWithImage,
  sendMessageWithVoice
};

// Export participant functions
export const participantOperations = {
  getOtherParticipant
};

// Export unread status functions
export const unreadOperations = {
  getUnreadCount,
  markAllAsRead,
  getTotalUnreadCount,
  updateMessageReadStatus
};

// Also export individual functions for backward compatibility
export {
  // Chat core
  createChat,
  getUserChats,
  subscribeToChats,
  getChatById,
  getChatByParticipants,
  
  // Messages
  getMessages,
  subscribeToMessages,
  markMessagesAsRead,
  updateTypingStatus,
  
  // Message sending
  sendMessage,
  sendMessageWithImage,
  sendMessageWithVoice,
  
  // Participants
  getOtherParticipant,
  
  // Unread status
  getUnreadCount as getMessagesUnreadCount,
  markAllAsRead,
  getTotalUnreadCount,
  updateMessageReadStatus
};
