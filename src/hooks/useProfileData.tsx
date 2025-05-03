
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { getUserProfile, toggleFollowUser, isUserPro } from "@/services/userService";
import { UserData } from "@/types/auth";

export const useProfileData = (userId: string | undefined) => {
  const { currentUser, userData: currentUserData, followUser, unfollowUser, isFollowing } = useAuth();
  const { toast } = useToast();
  
  const [profileUser, setProfileUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [followLoading, setFollowLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState("podcasts");
  const [isPro, setIsPro] = useState<boolean>(false);

  const isCurrentUser = currentUser && userId === currentUser.uid;
  const isFollowingUser = currentUserData && profileUser && isFollowing(profileUser.uid);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) return;
      
      try {
        setLoading(true);
        const userData = await getUserProfile(userId);
        setProfileUser(userData);
        
        // Check if user is pro
        if (userData) {
          const userIsPro = await isUserPro(userId);
          setIsPro(userIsPro);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not load user profile",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId, toast]);

  const handleFollowToggle = async () => {
    if (!currentUser || !profileUser) return;
    
    try {
      setFollowLoading(true);
      
      if (isFollowingUser) {
        await unfollowUser(profileUser.uid);
        toast({
          title: "Unfollowed",
          description: `You are no longer following ${profileUser.displayName || "this user"}`,
        });
      } else {
        await followUser(profileUser.uid);
        toast({
          title: "Following",
          description: `You are now following ${profileUser.displayName || "this user"}`,
        });
      }
    } catch (error) {
      console.error("Error toggling follow status:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not update follow status",
      });
    } finally {
      setFollowLoading(false);
    }
  };

  return {
    profileUser,
    loading,
    followLoading,
    activeTab,
    setActiveTab,
    isPro,
    isCurrentUser,
    isFollowingUser,
    handleFollowToggle
  };
};

export default useProfileData;
