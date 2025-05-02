
import React, { useRef, useEffect } from "react";
import { ChatMessage } from "@/types/chat";
import { UserData } from "@/types/auth";
import { useAuth } from "@/contexts/AuthContext";
import MessageBubble from "./MessageBubble";

interface MessageListProps {
  messages: ChatMessage[];
  otherUser: UserData | null;
}

const MessageList: React.FC<MessageListProps> = ({ 
  messages, 
  otherUser 
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { currentUser } = useAuth();
  
  // Auto-scroll to the bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <>
      {messages.map((message) => {
        const isMyMessage = currentUser?.uid === message.senderId;
        
        return (
          <MessageBubble 
            key={message.id} 
            message={message} 
            isMyMessage={isMyMessage}
            senderAvatar={isMyMessage ? currentUser?.photoURL : otherUser?.photoURL}
            senderName={isMyMessage ? currentUser?.displayName : otherUser?.displayName}
          />
        );
      })}
      <div ref={messagesEndRef} />
    </>
  );
};

export default MessageList;
