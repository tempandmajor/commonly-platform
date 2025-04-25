
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/layout/Navbar";
import { getUserProfile } from "@/services/userService";
import { getMessages, sendMessage, subscribeToMessages, markMessagesAsRead } from "@/services/chatService";
import { ChatMessage, UserData } from "@/types/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import MessageItem from "@/components/messages/MessageItem";
import { useToast } from "@/hooks/use-toast";

const Messages = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const { currentUser } = useAuth();
  const [otherUser, setOtherUser] = useState<UserData | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [sending, setSending] = useState<boolean>(false);
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
    
    if (!newMessage.trim() || !currentUser || !otherUser || !chatId) return;
    
    setSending(true);
    
    try {
      await sendMessage(
        chatId,
        currentUser.uid,
        otherUser.uid,
        newMessage.trim()
      );
      
      setNewMessage("");
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
            <div className="border-b p-4 flex items-center">
              <Avatar className="h-10 w-10 mr-3">
                <AvatarImage src={otherUser.photoURL || undefined} />
                <AvatarFallback>{userInitials}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="font-medium">{otherUser.displayName}</h2>
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
          
          {/* Message input */}
          <form onSubmit={handleSendMessage} className="border-t p-3 flex">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1"
              disabled={sending}
            />
            <Button 
              type="submit" 
              className="ml-2" 
              disabled={!newMessage.trim() || sending}
            >
              <Send className="h-4 w-4" />
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Messages;
