
import React from "react";
import { ChatMessage } from "@/types/chat";
import { UserData } from "@/types/auth";
import { useAuth } from "@/contexts/AuthContext";
import MessageBubble from "./MessageBubble";

interface MessageItemProps {
  message: ChatMessage;
  otherUser?: UserData;
}

const MessageItem: React.FC<MessageItemProps> = ({ message, otherUser }) => {
  const { currentUser } = useAuth();
  const isMyMessage = currentUser?.uid === message.sender_id;
  
  return (
    <MessageBubble
      message={message}
      isMyMessage={isMyMessage}
      senderAvatar={isMyMessage ? currentUser?.photoURL : otherUser?.photoURL}
      senderName={isMyMessage ? currentUser?.displayName : otherUser?.displayName}
    />
  );
};

export default MessageItem;
