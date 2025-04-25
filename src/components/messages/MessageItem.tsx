
import React from "react";
import { ChatMessage, UserData } from "@/types/auth";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";

interface MessageItemProps {
  message: ChatMessage;
  otherUser?: UserData;
}

const MessageItem: React.FC<MessageItemProps> = ({ message, otherUser }) => {
  const { currentUser } = useAuth();
  const isOwnMessage = message.senderId === currentUser?.uid;
  
  // Format timestamp if it exists
  const formattedTime = message.timestamp ? 
    format(message.timestamp.toDate ? message.timestamp.toDate() : new Date(message.timestamp), "p") : 
    "";
  
  return (
    <div className={`flex ${isOwnMessage ? "justify-end" : "justify-start"} mb-4`}>
      <div 
        className={`max-w-[70%] px-4 py-2 rounded-lg ${
          isOwnMessage 
            ? "bg-primary text-white rounded-br-none" 
            : "bg-muted rounded-bl-none"
        }`}
      >
        <p className="text-sm">{message.text}</p>
        <p className={`text-xs mt-1 ${isOwnMessage ? "text-primary-foreground/70" : "text-gray-500"}`}>
          {formattedTime}
        </p>
      </div>
    </div>
  );
};

export default MessageItem;
