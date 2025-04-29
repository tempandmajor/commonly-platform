
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getUsersByIds } from "@/services/userService";
import { getUserChats, subscribeToChats, getTotalUnreadMessages } from "@/services/chatService";
import Navbar from "@/components/layout/Navbar";
import { UserData, Chat } from "@/types/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageSquare, Plus } from "lucide-react";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { searchUsers } from "@/services/userService";
import { createChat } from "@/services/chatService";
import { useNavigate } from "react-router-dom";

interface ChatWithUser extends Chat {
  user: UserData;
  unreadCount?: number;
}

const MessagesList = () => {
  const { currentUser } = useAuth();
  const [chats, setChats] = useState<ChatWithUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [newChatOpen, setNewChatOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<UserData[]>([]);
  const [searching, setSearching] = useState<boolean>(false);
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
              // For a more accurate count, we'd need to query each chat's messages
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

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setSearching(true);
    try {
      const results = await searchUsers(searchQuery);
      // Filter out the current user
      setSearchResults(results.filter(user => user.uid !== currentUser?.uid));
    } catch (error) {
      console.error("Error searching users:", error);
      toast({
        title: "Error",
        description: "Failed to search users",
        variant: "destructive"
      });
    } finally {
      setSearching(false);
    }
  };

  const handleStartChat = async (userId: string) => {
    if (!currentUser) return;
    
    try {
      const chatId = await createChat(currentUser.uid, userId);
      setNewChatOpen(false);
      navigate(`/messages/${chatId}`);
    } catch (error) {
      console.error("Error creating chat:", error);
      toast({
        title: "Error",
        description: "Failed to start conversation",
        variant: "destructive"
      });
    }
  };

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Messages</h1>
          <Button onClick={() => setNewChatOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Message
          </Button>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : chats.length === 0 ? (
          <Card className="p-8 text-center">
            <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-medium mb-2">No messages yet</h2>
            <p className="text-gray-500 mb-4">
              Start a conversation with another user to see messages here
            </p>
            <Button onClick={() => setNewChatOpen(true)}>
              Start a conversation
            </Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {chats.map((chat) => {
              const lastMessageText = chat.lastMessage?.text || "No messages yet";
              const lastMessageTime = chat.lastMessage?.timestamp 
                ? format(
                    chat.lastMessage.timestamp.toDate 
                      ? chat.lastMessage.timestamp.toDate() 
                      : new Date(chat.lastMessage.timestamp), 
                    "MMM d, p"
                  )
                : "";
                
              const userInitials = chat.user?.displayName
                ? chat.user.displayName
                    .split(" ")
                    .map(name => name[0])
                    .join("")
                    .toUpperCase()
                : "?";
                
              const hasUnread = chat.unreadCount && chat.unreadCount > 0;
              const hasImage = chat.lastMessage?.hasImage;
              
              return (
                <Link 
                  key={chat.id} 
                  to={`/messages/${chat.id}`}
                  className="block"
                >
                  <div className={`p-4 border rounded-lg hover:bg-gray-50 ${hasUnread ? 'bg-blue-50' : ''}`}>
                    <div className="flex items-center">
                      <Avatar className="h-10 w-10 mr-3">
                        <AvatarImage src={chat.user?.photoURL || undefined} />
                        <AvatarFallback>{userInitials}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <h3 className={`font-medium truncate ${hasUnread ? 'text-blue-700' : ''}`}>
                            {chat.user?.displayName}
                          </h3>
                          {lastMessageTime && (
                            <span className="text-xs text-gray-500">{lastMessageTime}</span>
                          )}
                        </div>
                        <div className="flex items-center">
                          <p className={`text-sm text-gray-600 truncate ${hasUnread ? 'font-medium text-gray-700' : ''}`}>
                            {hasImage ? "📷 Image" : lastMessageText}
                          </p>
                          {hasUnread && (
                            <span className="ml-2 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                              {chat.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
      
      {/* New Message Dialog */}
      <Dialog open={newChatOpen} onOpenChange={setNewChatOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Message</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input 
                placeholder="Search users..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button 
                onClick={handleSearch} 
                disabled={searching || !searchQuery.trim()}
              >
                Search
              </Button>
            </div>
            
            <div className="max-h-[300px] overflow-y-auto">
              {searching ? (
                <div className="py-8 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
                </div>
              ) : searchResults.length === 0 ? (
                <p className="text-center py-8 text-gray-500">
                  {searchQuery.trim() 
                    ? "No users found. Try a different search." 
                    : "Search for users to start a conversation"}
                </p>
              ) : (
                <ul className="divide-y">
                  {searchResults.map((user) => {
                    const userInitials = user.displayName
                      ? user.displayName
                          .split(" ")
                          .map(name => name[0])
                          .join("")
                          .toUpperCase()
                      : "?";
                      
                    return (
                      <li 
                        key={user.uid} 
                        className="py-2 hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleStartChat(user.uid)}
                      >
                        <div className="flex items-center px-2 py-1">
                          <Avatar className="h-8 w-8 mr-3">
                            <AvatarImage src={user.photoURL || undefined} />
                            <AvatarFallback>{userInitials}</AvatarFallback>
                          </Avatar>
                          <span>{user.displayName}</span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MessagesList;
