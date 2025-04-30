
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

// Import components
import ImagePreview from "./ImagePreview";
import VoiceRecording from "./VoiceRecording";
import VoicePreview from "./VoicePreview";
import MessageInputActions from "./MessageInputActions";

// Import hooks
import { useImageUpload } from "@/hooks/chat/useImageUpload";
import { useVoiceRecorder } from "@/hooks/chat/useVoiceRecorder";

interface MessageInputProps {
  onSendMessage: (e: React.FormEvent, text: string, file: File | null, voiceBlob: Blob | null) => void;
  onTyping?: (isTyping: boolean) => void;
  sending: boolean;
  isUploading: boolean;
  uploadProgress: number;
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onTyping,
  sending,
  isUploading,
  uploadProgress
}) => {
  const [newMessage, setNewMessage] = useState<string>("");
  const [lastTypingTime, setLastTypingTime] = useState<number>(0);
  
  // Image upload handling
  const {
    imagePreview,
    selectedFile,
    fileInputRef,
    handleFileChange,
    clearImageSelection,
    triggerFileInput
  } = useImageUpload();
  
  // Voice recording handling
  const {
    isRecording,
    recordingTime,
    recordedVoice,
    startRecording,
    stopRecording,
    clearRecording
  } = useVoiceRecorder();

  // Track typing status
  useEffect(() => {
    if (!onTyping) return;
    
    const now = Date.now();
    
    // If user started or continued typing
    if (newMessage && now - lastTypingTime > 1000) {
      setLastTypingTime(now);
      onTyping(true);
    }
    
    // If user stopped typing (message is empty)
    if (!newMessage) {
      onTyping(false);
    }
    
    // Reset typing status after some inactivity
    const timeoutId = setTimeout(() => {
      if (lastTypingTime && now - lastTypingTime > 3000) {
        onTyping(false);
      }
    }, 3000);
    
    return () => clearTimeout(timeoutId);
  }, [newMessage, onTyping, lastTypingTime]);

  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    setLastTypingTime(Date.now());
  };
  
  const handleToggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSendMessage(e, newMessage, selectedFile, recordedVoice);
    setNewMessage("");
    clearRecording();
    // The image will be cleared in the parent component after successful upload
    
    // Reset typing status after sending
    if (onTyping) {
      onTyping(false);
    }
  };

  // Set a data attribute if we have attachments for button enablement
  const hasAttachments = selectedFile || recordedVoice;

  return (
    <form onSubmit={handleSubmit} data-has-attachments={hasAttachments ? "true" : undefined}>
      {/* Image preview */}
      {imagePreview && (
        <ImagePreview
          imagePreview={imagePreview}
          isUploading={isUploading}
          uploadProgress={uploadProgress}
          onCancel={clearImageSelection}
        />
      )}
      
      {/* Voice message preview */}
      {recordedVoice && (
        <VoicePreview
          isUploading={isUploading}
          uploadProgress={uploadProgress}
          onCancel={clearRecording}
        />
      )}
      
      {/* Recording state */}
      {isRecording && (
        <VoiceRecording
          recordingTime={recordingTime}
          onStopRecording={stopRecording}
        />
      )}
      
      {/* Message input */}
      <MessageInputActions
        newMessage={newMessage}
        onMessageChange={handleMessageChange}
        onSelectFile={triggerFileInput}
        onToggleRecording={handleToggleRecording}
        isRecording={isRecording}
        fileInputRef={fileInputRef}
        disabled={sending || isUploading || isRecording}
        recordingDisabled={!!recordedVoice}
      />
    </form>
  );
};

export default MessageInput;
