
import React from "react";
import { UserData } from "@/types/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ChatHeaderProps {
  otherUser: UserData | null;
  isOnline: boolean;
  lastSeen: Date | null;
  isTyping?: boolean;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ 
  otherUser, 
  isOnline, 
  lastSeen,
  isTyping = false
}) => {
  const formatLastSeen = () => {
    if (!lastSeen) return '';
    
    const now = new Date();
    const diffMs = now.getTime() - lastSeen.getTime();
    const diffMins = Math.round(diffMs / 60000);
    
    if (diffMins < 1) {
      return 'just now';
    } else if (diffMins < 60) {
      return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffMins < 1440) {
      const hours = Math.floor(diffMins / 60);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    } else {
      const days = Math.floor(diffMins / 1440);
      return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    }
  };

  if (!otherUser) return null;

  const userInitials = otherUser?.displayName
    ? otherUser.displayName
        .split(" ")
        .map(name => name[0])
        .join("")
        .toUpperCase()
    : "?";

  return (
    <div className="border-b p-4 flex items-center justify-between">
      <div className="flex items-center">
        <div className="relative">
          <Avatar className="h-10 w-10 mr-3">
            <AvatarImage src={otherUser.photoURL || undefined} />
            <AvatarFallback>{userInitials}</AvatarFallback>
          </Avatar>
          {isOnline && (
            <span className="absolute bottom-0 right-2 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></span>
          )}
        </div>
        <div>
          <h2 className="font-medium">{otherUser.displayName}</h2>
          <div className="text-xs text-gray-500">
            {isTyping ? (
              <div className="flex items-center">
                <span className="mr-1">Typing</span>
                <span className="flex space-x-1">
                  <span className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </span>
              </div>
            ) : isOnline ? (
              'Online'
            ) : lastSeen ? (
              `Last seen ${formatLastSeen()}`
            ) : (
              ''
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
