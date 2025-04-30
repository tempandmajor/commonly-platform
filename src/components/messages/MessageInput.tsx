
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Paperclip, Send, Mic, X } from "lucide-react";
import ImagePreview from "./ImagePreview";
import VoiceRecording from "./VoiceRecording";
import VoicePreview from "./VoicePreview";
import { Progress } from "@/components/ui/progress";
import MessageInputActions from "./MessageInputActions";

interface MessageInputProps {
  onSendMessage: (
    e: React.FormEvent, 
    text: string, 
    file: File | null, 
    voiceBlob: Blob | null
  ) => void;
  onTyping: () => void;
  sending: boolean;
  isUploading: boolean;
  uploadProgress: number;
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onTyping,
  sending,
  isUploading,
  uploadProgress,
}) => {
  const [message, setMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVoice, setRecordedVoice] = useState<Blob | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Ensure we clean up the typing timeout when component unmounts
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Trigger the typing indicator
    onTyping();
    
    // Reset the typing indicator after 3 seconds of inactivity
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      // Let the typing indicator expire naturally
    }, 3000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Send message on Enter (without shift for new line)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if ((message.trim() || selectedFile || recordedVoice) && !sending && !isUploading) {
      onSendMessage(e, message, selectedFile, recordedVoice);
      setMessage("");
      setSelectedFile(null);
      setRecordedVoice(null);
      if (messageInputRef.current) {
        messageInputRef.current.focus();
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      // Reset voice recording when an image is selected
      setRecordedVoice(null);
    }
  };

  const handleFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleVoiceRecorded = (voiceBlob: Blob) => {
    setRecordedVoice(voiceBlob);
    // Reset image selection when a voice is recorded
    setSelectedFile(null);
  };

  const cancelFileSelection = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const cancelVoiceRecording = () => {
    setRecordedVoice(null);
  };

  const startRecording = () => {
    setIsRecording(true);
  };

  const stopRecording = () => {
    setIsRecording(false);
  };
  
  // Adjust textarea height based on content
  const autoResizeTextarea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    textarea.style.height = 'auto'; // Reset height
    textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`; // Set new height with max limit
  };

  return (
    <div className="px-4 pb-4 pt-0">
      {/* Show upload progress if uploading */}
      {isUploading && (
        <div className="mb-2">
          <Progress value={uploadProgress} className="h-1" />
          <p className="text-xs text-muted-foreground text-right mt-1">
            {uploadProgress}% uploaded
          </p>
        </div>
      )}

      {/* Show image preview if file is selected */}
      {selectedFile && (
        <ImagePreview 
          file={selectedFile} 
          onCancel={cancelFileSelection}
        />
      )}

      {/* Show voice preview if recording is completed */}
      {recordedVoice && (
        <VoicePreview 
          voiceBlob={recordedVoice}
          onCancel={cancelVoiceRecording}
        />
      )}

      {/* Show recording UI when recording */}
      {isRecording && (
        <VoiceRecording 
          onStop={handleVoiceRecorded}
          onCancel={stopRecording}
        />
      )}

      {/* Main message input form */}
      <form 
        onSubmit={handleSubmit}
        className={`flex items-end gap-2 rounded-lg border bg-background ${isRecording ? 'hidden' : 'block'}`}
      >
        <MessageInputActions 
          onFileSelect={handleFileSelect}
          onStartRecording={startRecording}
          disabled={sending || isUploading}
        />
        
        <textarea
          ref={messageInputRef}
          value={message}
          onChange={(e) => {
            handleChange(e);
            autoResizeTextarea(e);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="flex-1 p-3 resize-none outline-none min-h-[40px] max-h-[150px] bg-transparent"
          disabled={sending || isUploading}
          rows={1}
        />
        
        <Button
          type="submit"
          size="icon"
          variant="ghost"
          className="h-10 w-10"
          disabled={
            (message.trim() === "" && !selectedFile && !recordedVoice) || 
            sending || 
            isUploading
          }
        >
          <Send className="h-5 w-5" />
        </Button>
      </form>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
    </div>
  );
};

export default MessageInput;
