
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getUserProfile } from "@/services/userService";
import { 
  getMessages, 
  sendMessage, 
  sendMessageWithImage,
  sendMessageWithVoice,
  subscribeToMessages, 
  markMessagesAsRead 
} from "@/services/chat";
import { ChatMessage, UserData } from "@/types/auth";
import { useToast } from "@/hooks/use-toast";
import { doc, onSnapshot } from "firebase/firestore";
import { db, storage } from "@/lib/firebase";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";

export const useChat = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const { currentUser } = useAuth();
  const [otherUser, setOtherUser] = useState<UserData | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [sending, setSending] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(false);
  const [lastSeen, setLastSeen] = useState<Date | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Load initial messages and subscribe to updates
  useEffect(() => {
    if (!currentUser || !chatId) {
      navigate('/');
      return;
    }

    setLoading(true);

    // Load initial messages
    const loadMessages = async () => {
      try {
        const messagesData = await getMessages(chatId);
        setMessages(messagesData);
        
        // Get the other user's data
        if (messagesData.length > 0) {
          const otherUserId = messagesData[0].senderId === currentUser.uid
            ? messagesData[0].recipientId
            : messagesData[0].senderId;
          
          const userData = await getUserProfile(otherUserId);
          setOtherUser(userData);
          
          // Subscribe to user's online status
          if (userData) {
            const userStatusRef = doc(db, "userStatus", userData.uid);
            const unsubscribeStatus = onSnapshot(userStatusRef, (doc) => {
              if (doc.exists()) {
                const statusData = doc.data();
                setIsOnline(statusData.isOnline || false);
                setLastSeen(statusData.lastSeen ? new Date(statusData.lastSeen) : null);
              } else {
                setIsOnline(false);
                setLastSeen(null);
              }
            });
            
            return () => {
              unsubscribeStatus();
            };
          }
        }
      } catch (error) {
        console.error("Error loading messages:", error);
        toast({
          title: "Error",
          description: "Failed to load messages",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadMessages();

    // Subscribe to real-time updates
    const unsubscribe = subscribeToMessages(chatId, (updatedMessages) => {
      setMessages(updatedMessages);
    });

    return () => {
      unsubscribe();
    };
  }, [chatId, currentUser, navigate, toast]);

  // Handle marking messages as read
  const handleMarkMessagesAsRead = async () => {
    if (!currentUser || !chatId) return;
    
    try {
      await markMessagesAsRead(chatId, currentUser.uid);
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  // Handle sending messages
  const handleSendMessage = async (
    e: React.FormEvent, 
    newMessage: string, 
    selectedFile: File | null,
    voiceBlob: Blob | null
  ) => {
    e.preventDefault();
    
    if ((!newMessage.trim() && !selectedFile && !voiceBlob) || !currentUser || !otherUser || !chatId) return;
    
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
              otherUser.uid,
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
              otherUser.uid,
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
          otherUser.uid,
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

  // Add an emoji to the message
  const handleEmojiSelect = (emoji: string) => {
    setShowEmojiPicker(false);
    // This will be used in the parent component to update the message input
    return emoji;
  };

  return {
    messages,
    otherUser,
    loading,
    sending,
    isOnline,
    lastSeen,
    isUploading,
    uploadProgress,
    showEmojiPicker,
    setShowEmojiPicker,
    handleSendMessage,
    handleEmojiSelect,
    handleMarkMessagesAsRead
  };
};
