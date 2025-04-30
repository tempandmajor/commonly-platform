
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { sendMessage, sendMessageWithImage, sendMessageWithVoice } from "@/services/chat";
import { useToast } from "@/hooks/use-toast";
import { uploadFile } from "@/services/storageService";

export const useMessageSender = (otherUserId: string | null) => {
  const { chatId } = useParams<{ chatId: string }>();
  const { currentUser } = useAuth();
  const [sending, setSending] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
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
          
          await sendMessageWithImage(
            chatId,
            currentUser.uid,
            otherUserId,
            newMessage.trim(),
            downloadURL
          );
          
          setIsUploading(false);
          setUploadProgress(0);
        } catch (error) {
          console.error("Error uploading image:", error);
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
          
          await sendMessageWithVoice(
            chatId,
            currentUser.uid,
            otherUserId,
            newMessage.trim(),
            downloadURL
          );
          
          setIsUploading(false);
          setUploadProgress(0);
        } catch (error) {
          console.error("Error uploading voice:", error);
          toast({
            title: "Error",
            description: "Failed to upload voice message",
            variant: "destructive"
          });
          setIsUploading(false);
        }
      } else {
        // Send text-only message
        await sendMessage(
          chatId,
          currentUser.uid,
          otherUserId,
          newMessage.trim()
        );
      }
    } catch (error) {
      console.error("Error sending message:", error);
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
    handleSendMessage
  };
};
