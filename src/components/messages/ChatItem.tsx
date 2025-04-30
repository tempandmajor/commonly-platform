
import React from "react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { ChatWithUser } from "@/types/chat";

interface ChatItemProps {
  chat: ChatWithUser;
}

const ChatItem: React.FC<ChatItemProps> = ({ chat }) => {
  // Format the timestamp if available
  const lastMessageTime = chat.lastMessage?.timestamp
    ? format(
        chat.lastMessage.timestamp.toDate
          ? chat.lastMessage.timestamp.toDate()
          : new Date(chat.lastMessage.timestamp),
        "p"
      )
    : "";

  // Generate user initials for avatar fallback
  const userInitials = chat.user?.displayName
    ? chat.user.displayName
        .split(" ")
        .map(name => name[0])
        .join("")
        .toUpperCase()
    : "?";

  // Truncate last message text if it's too long
  const messagePreview = chat.lastMessage?.text 
    ? chat.lastMessage.text.length > 30
      ? `${chat.lastMessage.text.substring(0, 30)}...`
      : chat.lastMessage.text
    : "No messages yet";

  // Check if there are unread messages
  const hasUnread = chat.unreadCount && chat.unreadCount > 0;

  return (
    <Link to={`/messages/${chat.id}`} className="block">
      <div className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors">
        <Avatar className="h-12 w-12 mr-3">
          <AvatarImage src={chat.user?.photoURL || undefined} />
          <AvatarFallback>{userInitials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="font-medium truncate">
              {chat.user?.displayName || "Unknown User"}
            </h3>
            <span className="text-xs text-gray-500">{lastMessageTime}</span>
          </div>
          <div className="flex items-center justify-between">
            <p className={`text-sm truncate ${hasUnread ? 'font-semibold text-black' : 'text-gray-500'}`}>
              {messagePreview}
            </p>
            {hasUnread && (
              <span className="ml-2 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {chat.unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ChatItem;
