
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Send, Image as ImageIcon, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MessageInputProps {
  onSendMessage: (e: React.FormEvent, text: string, file: File | null) => void;
  sending: boolean;
  isUploading: boolean;
  uploadProgress: number;
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  sending,
  isUploading,
  uploadProgress
}) => {
  const [newMessage, setNewMessage] = useState<string>("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSendMessage(e, newMessage, selectedFile);
    setNewMessage("");
    // The image will be cleared in the parent component after successful upload
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
      
      {/* Message input */}
      <div className="border-t p-3 flex items-center">
        <Button 
          type="button" 
          variant="ghost" 
          className="p-2" 
          onClick={() => fileInputRef.current?.click()}
        >
          <ImageIcon className="h-5 w-5 text-gray-500" />
        </Button>
        <input 
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*"
        />
        
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 mx-2"
          disabled={sending || isUploading}
        />
        <Button 
          type="submit" 
          disabled={(!newMessage.trim() && !selectedFile) || sending || isUploading}
        >
          <Send className="h-4 w-4" />
          <span className="sr-only">Send</span>
        </Button>
      </div>
    </form>
  );
};

export default MessageInput;
