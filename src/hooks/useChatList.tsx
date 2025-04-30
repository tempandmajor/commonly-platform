
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getUsersByIds } from "@/services/userService";
import { getUserChats, subscribeToChats } from "@/services/chat";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { ChatWithUser } from "@/types/chat";
import { UserData } from "@/types/auth";

export const useChatList = () => {
  const { currentUser } = useAuth();
  const [chats, setChats] = useState<ChatWithUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate('/');
      return;
    }

    // Initial fetch is now handled by the subscribeToChats function
    setLoading(true);
    
    // Subscribe to chats in real-time
    const unsubscribe = subscribeToChats(
      currentUser.uid,
      async (updatedChats) => {
        try {
          // Get all unique user IDs from the chats (excluding the current user)
          const userIds = new Set<string>();
          updatedChats.forEach(chat => {
            chat.participants.forEach(id => {
              if (id !== currentUser.uid) {
                userIds.add(id);
              }
            });
          });
          
          const users = await getUsersByIds(Array.from(userIds));
          const usersMap = new Map<string, UserData>();
          users.forEach(user => {
            usersMap.set(user.uid, user);
          });
          
          // Map chats with their corresponding user and calculate unread counts
          const chatsWithUsers = await Promise.all(
            updatedChats.map(async (chat) => {
              const otherUserId = chat.participants.find(id => id !== currentUser.uid) || "";
              
              // For each chat, count unread messages where current user is recipient
              let unreadCount = 0;
              if (chat.lastMessage && 
                  chat.lastMessage.recipientId === currentUser.uid && 
                  !chat.lastMessage.read) {
                // If the last message is unread, set unread count to 1
                // In a full implementation, you would query the database for all unread messages
                unreadCount = 1;
              }
              
              return {
                ...chat,
                user: usersMap.get(otherUserId) as UserData,
                unreadCount
              };
            })
          );
          
          setChats(chatsWithUsers);
          setLoading(false);
        } catch (error) {
          console.error("Error processing chats:", error);
          toast({
            title: "Error",
            description: "Failed to load your messages",
            variant: "destructive"
          });
          setLoading(false);
        }
      }
    );
    
    return () => {
      unsubscribe();
    };
  }, [currentUser, navigate, toast]);

  return { chats, loading };
};
