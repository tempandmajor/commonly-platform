
import React, { useRef, useEffect } from "react";
import { ChatMessage, UserData } from "@/types/auth";
import MessageItem from "@/components/messages/MessageItem";

interface MessageDisplayProps {
  messages: ChatMessage[];
  loading: boolean;
  otherUser: UserData | null;
}

const MessageDisplay: React.FC<MessageDisplayProps> = ({ 
  messages, 
  loading, 
  otherUser 
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to the bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="p-4 h-[calc(100vh-250px)] overflow-y-auto bg-gray-50">
      {loading ? (
        <div className="flex justify-center items-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : messages.length === 0 ? (
        <div className="flex justify-center items-center h-full text-gray-500">
          No messages yet. Start the conversation!
        </div>
      ) : (
        <>
          {messages.map((message) => (
            <MessageItem 
              key={message.id} 
              message={message} 
              otherUser={otherUser || undefined} 
            />
          ))}
          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
};

export default MessageDisplay;
