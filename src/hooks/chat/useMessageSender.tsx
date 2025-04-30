
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { sendMessage, sendMessageWithImage, sendMessageWithVoice } from "@/services/chat";
import { useToast } from "@/hooks/use-toast";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { storage } from "@/lib/firebase";

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
        // Upload image first
        setIsUploading(true);
        const storageRef = ref(storage, `chat-images/${Date.now()}_${selectedFile.name}`);
        const uploadTask = uploadBytesResumable(storageRef, selectedFile);
        
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(progress);
          },
          (error) => {
            console.error("Error uploading image:", error);
            toast({
              title: "Error",
              description: "Failed to upload image",
              variant: "destructive"
            });
            setIsUploading(false);
          },
          async () => {
            // Upload completed
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            await sendMessageWithImage(
              chatId,
              currentUser.uid,
              otherUserId,
              newMessage.trim(),
              downloadURL
            );
            
            setIsUploading(false);
            setUploadProgress(0);
          }
        );
      } else if (voiceBlob) {
        // Upload voice recording
        setIsUploading(true);
        const storageRef = ref(storage, `chat-voice/${Date.now()}_voice.mp3`);
        const uploadTask = uploadBytesResumable(storageRef, voiceBlob);
        
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(progress);
          },
          (error) => {
            console.error("Error uploading voice:", error);
            toast({
              title: "Error",
              description: "Failed to upload voice message",
              variant: "destructive"
            });
            setIsUploading(false);
          },
          async () => {
            // Upload completed
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            await sendMessageWithVoice(
              chatId,
              currentUser.uid,
              otherUserId,
              newMessage.trim(),
              downloadURL
            );
            
            setIsUploading(false);
            setUploadProgress(0);
          }
        );
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
