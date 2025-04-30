
import React from 'react';
import { Button } from '@/components/ui/button';
import { Paperclip, Mic } from 'lucide-react';

export interface MessageInputActionsProps {
  onFileSelect: () => void;
  onStartRecording: () => void;
  disabled?: boolean;
}

const MessageInputActions: React.FC<MessageInputActionsProps> = ({ 
  onFileSelect, 
  onStartRecording,
  disabled = false 
}) => {
  return (
    <div className="flex items-center space-x-1">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="text-gray-500 hover:text-primary"
        onClick={onFileSelect}
        disabled={disabled}
      >
        <Paperclip className="h-5 w-5" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="text-gray-500 hover:text-primary"
        onClick={onStartRecording}
        disabled={disabled}
      >
        <Mic className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default MessageInputActions;
