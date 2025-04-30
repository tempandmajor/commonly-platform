
import React from "react";
import { ChatMessage, UserData } from "@/types/auth";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Check } from "lucide-react";

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
  
  // Check if message contains an image
  const hasImage = message.imageUrl !== undefined && message.imageUrl !== null;
  
  return (
    <div className={`flex ${isOwnMessage ? "justify-end" : "justify-start"} mb-4`}>
      <div 
        className={`max-w-[70%] px-4 py-2 rounded-lg ${
          isOwnMessage 
            ? "bg-primary text-white rounded-br-none" 
            : "bg-muted rounded-bl-none"
        }`}
      >
        {hasImage && (
          <Dialog>
            <DialogTrigger asChild>
              <div className="mb-2 cursor-pointer">
                <img 
                  src={message.imageUrl as string} 
                  alt="Message attachment" 
                  className="max-h-48 rounded-md object-cover"
                />
              </div>
            </DialogTrigger>
            <DialogContent className="max-w-3xl p-0 overflow-hidden">
              <img 
                src={message.imageUrl as string} 
                alt="Message attachment" 
                className="w-full h-full object-contain"
              />
            </DialogContent>
          </Dialog>
        )}
        
        {message.text && <p className="text-sm">{message.text}</p>}
        
        <div className={`flex items-center justify-end text-xs mt-1 ${isOwnMessage ? "text-primary-foreground/70" : "text-gray-500"}`}>
          <span className="mr-1">{formattedTime}</span>
          {isOwnMessage && (
            <span className="flex items-center ml-1">
              {message.read ? (
                <Check className="h-3 w-3 text-blue-400" />
              ) : (
                <Check className="h-3 w-3 text-gray-400" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageItem;
