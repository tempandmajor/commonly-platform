
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Image as ImageIcon, Send, Mic, Square } from "lucide-react";

interface MessageInputActionsProps {
  newMessage: string;
  onMessageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectFile: () => void;
  onToggleRecording: () => void;
  isRecording: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
  disabled: boolean;
  recordingDisabled: boolean;
}

const MessageInputActions: React.FC<MessageInputActionsProps> = ({
  newMessage,
  onMessageChange,
  onSelectFile,
  onToggleRecording,
  isRecording,
  fileInputRef,
  disabled,
  recordingDisabled
}) => {
  return (
    <div className="border-t p-3 flex items-center">
      <div className="flex gap-1">
        <Button 
          type="button" 
          variant="ghost" 
          className="p-2" 
          onClick={onSelectFile}
          disabled={isRecording}
        >
          <ImageIcon className="h-5 w-5 text-gray-500" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="p-2"
          onClick={onToggleRecording}
          disabled={recordingDisabled}
        >
          {isRecording ? (
            <Square className="h-5 w-5 text-red-500" />
          ) : (
            <Mic className="h-5 w-5 text-gray-500" />
          )}
        </Button>
      </div>
      
      <input 
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
      />
      
      <Input
        value={newMessage}
        onChange={onMessageChange}
        placeholder="Type a message..."
        className="flex-1 mx-2"
        disabled={disabled}
      />
      <Button 
        type="submit" 
        disabled={disabled || (!newMessage.trim() && !document.querySelector('form').hasAttribute('data-has-attachments'))}
      >
        <Send className="h-4 w-4" />
        <span className="sr-only">Send</span>
      </Button>
    </div>
  );
};

export default MessageInputActions;
