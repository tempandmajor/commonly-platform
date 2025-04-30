
import React, { useEffect } from "react";
import { ChatMessage } from "@/types/chat"; 
import { UserData } from "@/types/auth";
import MessageList from "./MessageList";
import EmptyState from "./EmptyState";
import LoadingSpinner from "./LoadingSpinner";

interface MessageDisplayProps {
  messages: ChatMessage[];
  loading: boolean;
  otherUser: UserData | null;
  onMessagesRead?: () => void;
}

const MessageDisplay: React.FC<MessageDisplayProps> = ({ 
  messages, 
  loading, 
  otherUser,
  onMessagesRead
}) => {
  // Mark messages as read when displayed
  useEffect(() => {
    if (messages.length > 0 && !loading && onMessagesRead) {
      onMessagesRead();
    }
  }, [messages, loading, onMessagesRead]);

  return (
    <div className="p-4 h-[calc(100vh-250px)] overflow-y-auto bg-gray-50">
      {loading ? (
        <LoadingSpinner />
      ) : messages.length === 0 ? (
        <EmptyState />
      ) : (
        <MessageList messages={messages} otherUser={otherUser} />
      )}
    </div>
  );
};

export default MessageDisplay;
