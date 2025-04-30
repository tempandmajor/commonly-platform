import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Send, Image as ImageIcon, X, Mic, Square } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedVoice, setRecordedVoice] = useState<Blob | null>(null);
  const [lastTypingTime, setLastTypingTime] = useState<number>(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);
  
  const { toast } = useToast();

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file (JPEG, PNG, GIF, WEBP)",
        variant: "destructive"
      });
      return;
    }
    
    // Check file size (max 5 MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5 MB",
        variant: "destructive"
      });
      return;
    }
    
    setSelectedFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };
  
  const handleCancelImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCancelVoice = () => {
    setRecordedVoice(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const startRecording = async () => {
    try {
      // Reset recording state
      audioChunksRef.current = [];
      setRecordingTime(0);
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mp3' });
        setRecordedVoice(audioBlob);
        
        // Stop all audio tracks
        stream.getAudioTracks().forEach(track => track.stop());
        
        // Clear the timer
        if (timerIntervalRef.current !== null) {
          clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = null;
        }
        
        setIsRecording(false);
      };
      
      // Start recording
      mediaRecorder.start();
      setIsRecording(true);
      
      // Start timer
      timerIntervalRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: "Microphone access error",
        description: "Please allow microphone access to record voice messages",
        variant: "destructive"
      });
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSendMessage(e, newMessage, selectedFile, recordedVoice);
    setNewMessage("");
    setRecordedVoice(null);
    // The image will be cleared in the parent component after successful upload
    
    // Reset typing status after sending
    if (onTyping) {
      onTyping(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Image preview */}
      {imagePreview && (
        <div className="p-3 border-t">
          <div className="relative inline-block">
            <img 
              src={imagePreview} 
              alt="Upload preview" 
              className="h-20 w-20 object-cover rounded"
            />
            <button 
              onClick={handleCancelImage}
              className="absolute -top-2 -right-2 bg-gray-700 text-white rounded-full p-1 hover:bg-gray-900"
              type="button"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
          
          {isUploading && (
            <Progress value={uploadProgress} className="mt-2 h-1" />
          )}
        </div>
      )}
      
      {/* Voice message preview */}
      {recordedVoice && (
        <div className="p-3 border-t">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 text-primary px-3 py-2 rounded-lg">
              <div className="flex items-center gap-2">
                <Mic className="h-4 w-4" />
                <span className="text-sm">Voice message</span>
                <button 
                  onClick={handleCancelVoice}
                  className="ml-2 text-gray-500 hover:text-gray-700"
                  type="button"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>
            
            {isUploading && (
              <Progress value={uploadProgress} className="h-1 flex-1" />
            )}
          </div>
        </div>
      )}
      
      {/* Recording state */}
      {isRecording && (
        <div className="p-3 border-t">
          <div className="flex items-center gap-2">
            <div className="bg-red-500/10 text-red-500 px-3 py-2 rounded-lg flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></div>
              <span>Recording {formatTime(recordingTime)}</span>
            </div>
            <Button 
              type="button" 
              size="sm" 
              variant="destructive"
              onClick={stopRecording}
            >
              <Square className="h-3 w-3 mr-1" />
              Stop
            </Button>
          </div>
        </div>
      )}
      
      {/* Message input */}
      <div className="border-t p-3 flex items-center">
        <div className="flex gap-1">
          <Button 
            type="button" 
            variant="ghost" 
            className="p-2" 
            onClick={() => fileInputRef.current?.click()}
            disabled={isRecording}
          >
            <ImageIcon className="h-5 w-5 text-gray-500" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="p-2"
            onClick={isRecording ? stopRecording : startRecording}
            disabled={!!recordedVoice}
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
          onChange={handleFileChange}
          className="hidden"
          accept="image/*"
        />
        
        <Input
          value={newMessage}
          onChange={(e) => {
            setNewMessage(e.target.value);
            setLastTypingTime(Date.now());
          }}
          placeholder="Type a message..."
          className="flex-1 mx-2"
          disabled={sending || isUploading || isRecording}
        />
        <Button 
          type="submit" 
          disabled={((!newMessage.trim() && !selectedFile && !recordedVoice) || sending || isUploading || isRecording)}
        >
          <Send className="h-4 w-4" />
          <span className="sr-only">Send</span>
        </Button>
      </div>
    </form>
  );
};

export default MessageInput;
