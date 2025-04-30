
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/layout/Navbar";
import { getUserProfile } from "@/services/userService";
import { 
  getMessages, 
  sendMessage, 
  sendMessageWithImage,
  subscribeToMessages, 
  markMessagesAsRead 
} from "@/services/chat";
import { ChatMessage, UserData } from "@/types/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Image as ImageIcon, X, Smile } from "lucide-react";
import MessageItem from "@/components/messages/MessageItem";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { doc, onSnapshot } from "firebase/firestore";
import { db, storage } from "@/lib/firebase";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { Progress } from "@/components/ui/progress";

const Messages = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const { currentUser } = useAuth();
  const [otherUser, setOtherUser] = useState<UserData | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [sending, setSending] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(false);
  const [lastSeen, setLastSeen] = useState<Date | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Auto-scroll to the bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
        
        // Mark messages as read
        await markMessagesAsRead(chatId, currentUser.uid);
        
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
      // Mark new messages as read
      markMessagesAsRead(chatId, currentUser.uid).catch(console.error);
    });

    return () => {
      unsubscribe();
    };
  }, [chatId, currentUser, navigate, toast]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if ((!newMessage.trim() && !selectedFile) || !currentUser || !otherUser || !chatId) return;
    
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
            
            setNewMessage("");
            setSelectedFile(null);
            setImagePreview(null);
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
        
        setNewMessage("");
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

  const formatLastSeen = () => {
    if (!lastSeen) return '';
    
    const now = new Date();
    const diffMs = now.getTime() - lastSeen.getTime();
    const diffMins = Math.round(diffMs / 60000);
    
    if (diffMins < 1) {
      return 'just now';
    } else if (diffMins < 60) {
      return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffMins < 1440) {
      const hours = Math.floor(diffMins / 60);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    } else {
      const days = Math.floor(diffMins / 1440);
      return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    }
  };

  const userInitials = otherUser?.displayName
    ? otherUser.displayName
        .split(" ")
        .map(name => name[0])
        .join("")
        .toUpperCase()
    : "?";

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Chat header */}
          {otherUser && (
            <div className="border-b p-4 flex items-center justify-between">
              <div className="flex items-center">
                <div className="relative">
                  <Avatar className="h-10 w-10 mr-3">
                    <AvatarImage src={otherUser.photoURL || undefined} />
                    <AvatarFallback>{userInitials}</AvatarFallback>
                  </Avatar>
                  {isOnline && (
                    <span className="absolute bottom-0 right-2 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></span>
                  )}
                </div>
                <div>
                  <h2 className="font-medium">{otherUser.displayName}</h2>
                  <div className="text-xs text-gray-500">
                    {isOnline ? 'Online' : lastSeen ? `Last seen ${formatLastSeen()}` : ''}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Messages area */}
          <div className="p-4 h-[calc(100vh-250px)] overflow-y-auto bg-gray-50">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex justify-center items-center h-full text-gray-500">
                No messages yet. Start the conversation!
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <MessageItem 
                    key={message.id} 
                    message={message} 
                    otherUser={otherUser || undefined} 
                  />
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
          
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
          <form onSubmit={handleSendMessage} className="border-t p-3 flex items-center">
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
            
            <Button
              type="button"
              variant="ghost"
              className="p-2"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              <Smile className="h-5 w-5 text-gray-500" />
            </Button>
            
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
          </form>
        </div>
      </div>
      
      {/* Emoji picker dialog */}
      {showEmojiPicker && (
        <Dialog open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Choose an emoji</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-8 gap-2 p-4">
              {['😊', '😂', '❤️', '👍', '🎉', '🔥', '😍', '🙏', 
                '😎', '🤔', '😢', '😡', '🤮', '👋', '🤝', '👀'].map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => {
                    setNewMessage(prev => prev + emoji);
                    setShowEmojiPicker(false);
                  }}
                  className="text-2xl p-2 hover:bg-gray-100 rounded"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default Messages;
