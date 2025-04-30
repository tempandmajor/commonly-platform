
import { useState } from "react";
import { searchUsers } from "@/services/userService";
import { createChat } from "@/services/chat";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { UserData } from "@/types/auth";

export const useNewChat = () => {
  const { currentUser } = useAuth();
  const [newChatOpen, setNewChatOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<UserData[]>([]);
  const [searching, setSearching] = useState<boolean>(false);
  const { toast } = useToast();
  const navigate = useNavigate();

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
      // Use the correct function signature - passing currentUserId and otherUserId
      const { chat, error } = await createChat(currentUser.uid, userId);
      
      if (error || !chat) {
        throw new Error(error || "Failed to create chat");
      }
      
      setNewChatOpen(false);
      navigate(`/messages/${chat.id}`);
    } catch (error) {
      console.error("Error creating chat:", error);
      toast({
        title: "Error",
        description: "Failed to start conversation",
        variant: "destructive"
      });
    }
  };

  return {
    newChatOpen,
    setNewChatOpen,
    searchQuery,
    setSearchQuery,
    searchResults,
    searching,
    handleSearch,
    handleStartChat
  };
};
