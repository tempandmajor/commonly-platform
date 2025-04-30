
import React, { useState, useRef } from "react";
import { ChatMessage, UserData } from "@/types/auth";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Check, Mic, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MessageItemProps {
  message: ChatMessage;
  otherUser?: UserData;
}

const MessageItem: React.FC<MessageItemProps> = ({ message, otherUser }) => {
  const { currentUser } = useAuth();
  const isOwnMessage = message.senderId === currentUser?.uid;
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Format timestamp if it exists
  const formattedTime = message.timestamp ? 
    format(message.timestamp.toDate ? message.timestamp.toDate() : new Date(message.timestamp), "p") : 
    "";
  
  // Check if message contains media
  const hasImage = message.imageUrl !== undefined && message.imageUrl !== null;
  const hasVoice = message.voiceUrl !== undefined && message.voiceUrl !== null;

  const handlePlayVoice = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(error => {
          console.error("Error playing audio:", error);
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };
  
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
        
        {hasVoice && (
          <div className="mb-2">
            <div className={`flex items-center gap-2 ${isOwnMessage ? 'text-white' : 'text-gray-700'}`}>
              <Button 
                variant={isOwnMessage ? "outline" : "secondary"} 
                size="icon" 
                className="h-8 w-8" 
                onClick={handlePlayVoice}
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
              
              <span className="flex items-center gap-1">
                <Mic className="h-3 w-3" />
                <span className="text-xs">Voice message</span>
              </span>
              
              <audio 
                ref={audioRef} 
                src={message.voiceUrl as string} 
                onEnded={handleAudioEnded} 
                className="hidden"
              />
            </div>
          </div>
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
