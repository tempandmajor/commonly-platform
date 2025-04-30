
import React from "react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { ChatWithUser } from "@/types/chat";

interface ChatItemProps {
  chat: ChatWithUser;
}

const ChatItem: React.FC<ChatItemProps> = ({ chat }) => {
  const lastMessageText = chat.lastMessage?.text || "No messages yet";
  const lastMessageTime = chat.lastMessage?.timestamp 
    ? format(
        chat.lastMessage.timestamp.toDate 
          ? chat.lastMessage.timestamp.toDate() 
          : new Date(chat.lastMessage.timestamp), 
        "MMM d, p"
      )
    : "";
    
  const userInitials = chat.user?.displayName
    ? chat.user.displayName
        .split(" ")
        .map(name => name[0])
        .join("")
        .toUpperCase()
    : "?";
    
  const hasUnread = chat.unreadCount && chat.unreadCount > 0;
  const hasImage = chat.lastMessage?.hasImage;
  
  return (
    <Link 
      to={`/messages/${chat.id}`}
      className="block"
    >
      <div className={`p-4 border rounded-lg hover:bg-gray-50 ${hasUnread ? 'bg-blue-50' : ''}`}>
        <div className="flex items-center">
          <Avatar className="h-10 w-10 mr-3">
            <AvatarImage src={chat.user?.photoURL || undefined} />
            <AvatarFallback>{userInitials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center">
              <h3 className={`font-medium truncate ${hasUnread ? 'text-blue-700' : ''}`}>
                {chat.user?.displayName}
              </h3>
              {lastMessageTime && (
                <span className="text-xs text-gray-500">{lastMessageTime}</span>
              )}
            </div>
            <div className="flex items-center">
              <p className={`text-sm text-gray-600 truncate ${hasUnread ? 'font-medium text-gray-700' : ''}`}>
                {hasImage ? "📷 Image" : lastMessageText}
              </p>
              {hasUnread && (
                <span className="ml-2 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {chat.unreadCount}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ChatItem;
