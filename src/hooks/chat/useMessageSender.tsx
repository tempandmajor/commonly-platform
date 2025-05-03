
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { sendMessage } from "@/services/chat/sendMessageService";
import { useToast } from "@/hooks/use-toast";
import { uploadFile } from "@/services/storageService";

export const useMessageSender = (otherUserId: string | null) => {
  const { chatId } = useParams<{ chatId: string }>();
  const { currentUser } = useAuth();
  const [sending, setSending] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Handle sending messages
  const handleSendMessage = async (
    e: React.FormEvent, 
    newMessage: string, 
    selectedFile: File | null,
    voiceBlob: Blob | null
  ) => {
    e.preventDefault();
    
    if ((!newMessage.trim() && !selectedFile && !voiceBlob) || !currentUser || !otherUserId || !chatId) return;
    
    setSending(true);
    setError(null);
    
    try {
      if (selectedFile) {
        // Upload image first using Supabase Storage
        setIsUploading(true);
        
        try {
          // Show upload progress simulation since Supabase doesn't have built-in progress reporting
          const simulateProgress = setInterval(() => {
            setUploadProgress(prev => {
              const newProgress = prev + 10;
              return newProgress <= 90 ? newProgress : 90;
            });
          }, 300);
          
          const downloadURL = await uploadFile(selectedFile, "chat-images");
          
          // Clear progress simulation
          clearInterval(simulateProgress);
          setUploadProgress(100);
          
          const result = await sendMessage(
            chatId,
            currentUser.uid,
            otherUserId,
            newMessage.trim(),
            downloadURL
          );
          
          if (result.error) {
            setError(result.error);
            toast({
              title: "Error",
              description: "Failed to send message with image",
              variant: "destructive"
            });
          }
          
          setIsUploading(false);
          setUploadProgress(0);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.error("Error uploading image:", errorMessage);
          setError(errorMessage);
          toast({
            title: "Error",
            description: "Failed to upload image",
            variant: "destructive"
          });
          setIsUploading(false);
        }
      } else if (voiceBlob) {
        // Upload voice recording
        setIsUploading(true);
        
        try {
          // Convert Blob to File
          const voiceFile = new File([voiceBlob], "voice-message.mp3", { type: "audio/mp3" });
          
          // Show upload progress simulation
          const simulateProgress = setInterval(() => {
            setUploadProgress(prev => {
              const newProgress = prev + 10;
              return newProgress <= 90 ? newProgress : 90;
            });
          }, 300);
          
          const downloadURL = await uploadFile(voiceFile, "chat-voice");
          
          // Clear progress simulation
          clearInterval(simulateProgress);
          setUploadProgress(100);
          
          const result = await sendMessage(
            chatId,
            currentUser.uid,
            otherUserId,
            newMessage.trim(),
            undefined,
            downloadURL
          );
          
          if (result.error) {
            setError(result.error);
            toast({
              title: "Error",
              description: "Failed to send voice message",
              variant: "destructive"
            });
          }
          
          setIsUploading(false);
          setUploadProgress(0);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.error("Error uploading voice:", errorMessage);
          setError(errorMessage);
          toast({
            title: "Error",
            description: "Failed to upload voice message",
            variant: "destructive"
          });
          setIsUploading(false);
        }
      } else {
        // Send text-only message
        const result = await sendMessage(
          chatId,
          currentUser.uid,
          otherUserId,
          newMessage.trim()
        );
        
        if (result.error) {
          setError(result.error);
          toast({
            title: "Error",
            description: "Failed to send message",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error("Error sending message:", errorMessage);
      setError(errorMessage);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  return {
    sending,
    isUploading,
    uploadProgress,
    handleSendMessage,
    error
  };
};
