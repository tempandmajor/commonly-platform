
import React from "react";
import { Avatar } from "@/components/ui/avatar";
import { ChatMessage } from "@/types/chat";
import { UserData } from "@/types/auth";
import { formatTime } from "@/lib/utils";

interface MessageBubbleProps {
  message: ChatMessage;
  isMyMessage: boolean;
  senderAvatar: string | null | undefined;
  senderName: string | null | undefined;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  message, 
  isMyMessage,
  senderAvatar,
  senderName
}) => {
  // Format the time from timestamp
  const timestamp = new Date(message.timestamp);
  const formattedTime = formatTime(timestamp);
  
  return (
    <div className={`flex items-start gap-2 mb-4 ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
      {!isMyMessage && (
        <Avatar className="h-8 w-8">
          <img 
            src={senderAvatar || '/placeholder.svg'} 
            alt={senderName || 'User'} 
            className="rounded-full"
          />
        </Avatar>
      )}
      
      <div className={`max-w-[70%] ${isMyMessage ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800'} rounded-lg px-4 py-2`}>
        {message.text && <p>{message.text}</p>}
        
        {message.image_url && (
          <div className="mt-2">
            <img 
              src={message.image_url} 
              alt="Message attachment" 
              className="rounded-md max-w-full" 
              style={{ maxHeight: '200px' }}
            />
          </div>
        )}
        
        {message.voice_url && (
          <div className="mt-2">
            <audio 
              controls 
              src={message.voice_url}
              className="w-full"
            >
              Your browser does not support the audio element.
            </audio>
          </div>
        )}
        
        <div className={`text-xs mt-1 ${isMyMessage ? 'text-blue-100' : 'text-gray-500'}`}>
          {formattedTime}
          {isMyMessage && message.read && (
            <span className="ml-2">✓</span>
          )}
        </div>
      </div>
      
      {isMyMessage && (
        <Avatar className="h-8 w-8">
          <img 
            src={senderAvatar || '/placeholder.svg'} 
            alt={senderName || 'You'} 
            className="rounded-full"
          />
        </Avatar>
      )}
    </div>
  );
};

export default MessageBubble;
