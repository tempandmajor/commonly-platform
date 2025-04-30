
import React from "react";
import { ChatMessage, UserData } from "@/types/auth";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

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
        
        <p className={`text-xs mt-1 ${isOwnMessage ? "text-primary-foreground/70" : "text-gray-500"}`}>
          {formattedTime}
        </p>
      </div>
    </div>
  );
};

export default MessageItem;
