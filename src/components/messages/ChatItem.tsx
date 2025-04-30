
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { ChatWithUser } from "@/types/chat";
import { formatDistanceToNow } from "date-fns";

interface ChatItemProps {
  chat: ChatWithUser;
  active?: boolean;
}

const ChatItem: React.FC<ChatItemProps> = ({ chat, active }) => {
  // Format the timestamp to a readable format
  const timestamp = chat.lastMessage?.timestamp 
    ? formatDistanceToNow(new Date(chat.lastMessage.timestamp), { addSuffix: true })
    : "";

  // Get user initials for avatar fallback
  const userInitial = chat.user?.displayName
    ? chat.user.displayName.charAt(0).toUpperCase()
    : "U";
    
  // Determine if the chat has unread messages
  const unreadCount = chat.lastMessage?.read === false && chat.lastMessage?.senderId !== "currentUserId" ? 1 : 0;

  return (
    <Link
      to={`/messages/${chat.id}`}
      className={cn(
        "flex items-center p-3 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800",
        active && "bg-gray-100 dark:bg-gray-800"
      )}
    >
      <div className="relative">
        <Avatar className="h-12 w-12">
          <AvatarImage src={chat.user?.photoURL || ""} alt={chat.user?.displayName || "User"} />
          <AvatarFallback>{userInitial}</AvatarFallback>
        </Avatar>
        {chat.user?.isOnline && (
          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white dark:border-gray-900"></span>
        )}
      </div>
      <div className="ml-3 flex-1 overflow-hidden">
        <div className="flex justify-between items-center">
          <h4 className="text-sm font-medium truncate">{chat.user?.displayName || "Unknown User"}</h4>
          <span className="text-xs text-gray-500">{timestamp}</span>
        </div>
        <div className="flex justify-between items-center mt-1">
          <p className="text-xs text-gray-500 truncate">
            {chat.lastMessage?.text || "No messages yet"}
          </p>
          {unreadCount > 0 && (
            <span className="h-5 w-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs">
              {unreadCount}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ChatItem;
