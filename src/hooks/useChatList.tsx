
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getUsersByIds } from "@/services/userService";
import { getUserChats, subscribeToChats } from "@/services/chat";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { ChatWithUser } from "@/types/chat";

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

    // Initial fetch
    const fetchChats = async () => {
      try {
        setLoading(true);
        const userChats = await getUserChats(currentUser.uid);
        
        // Get all unique user IDs from the chats (excluding the current user)
        const userIds = new Set<string>();
        userChats.forEach(chat => {
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
        
        // Map chats with their corresponding user
        const chatsWithUsers: ChatWithUser[] = userChats.map(chat => {
          const otherUserId = chat.participants.find(id => id !== currentUser.uid) || "";
          return {
            ...chat,
            user: usersMap.get(otherUserId) as UserData
          };
        });
        
        setChats(chatsWithUsers);
      } catch (error) {
        console.error("Error fetching chats:", error);
        toast({
          title: "Error",
          description: "Failed to load your messages",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchChats();
    
    // Subscribe to chats in real-time
    const unsubscribe = subscribeToChats(
      currentUser.uid,
      async (updatedChats) => {
        // Get all unique user IDs from the chats
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
              // If the last message is unread, check how many unread messages in total
              // We'll just use the last message's read status as an indicator for now
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
      }
    );
    
    return () => {
      unsubscribe();
    };
  }, [currentUser, navigate, toast]);

  return { chats, loading };
};
