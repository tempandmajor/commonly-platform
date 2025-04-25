
import React from "react";
import { UserData } from "@/types/auth";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageSquare, UserPlus, UserMinus, ShieldCheck, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getUserFollowers, getUserFollowing } from "@/services/userService";
import { useToast } from "@/hooks/use-toast";
import { createChat } from "@/services/chatService";
import { isUserPro } from "@/services/subscriptionService";

interface UserProfileHeaderProps {
  user: UserData;
  isOwnProfile: boolean;
  onToggleFollowersModal: () => void;
  onToggleFollowingModal: () => void;
}

const UserProfileHeader: React.FC<UserProfileHeaderProps> = ({
  user,
  isOwnProfile,
  onToggleFollowersModal,
  onToggleFollowingModal
}) => {
  const { currentUser, userData, followUser, unfollowUser, isFollowing } = useAuth();
  const [following, setFollowing] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [isPro, setIsPro] = React.useState<boolean>(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  React.useEffect(() => {
    if (user && currentUser) {
      setFollowing(isFollowing(user.uid));
      
      // Check if user is pro
      const checkProStatus = async () => {
        const proStatus = await isUserPro(user.uid);
        setIsPro(proStatus);
      };
      
      checkProStatus();
    }
  }, [user, currentUser, isFollowing]);

  const handleFollowToggle = async () => {
    if (!currentUser) {
      toast({
        title: "Not logged in",
        description: "Please log in to follow users",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      if (following) {
        await unfollowUser(user.uid);
        setFollowing(false);
        toast({
          title: "Unfollowed",
          description: `You no longer follow ${user.displayName}`,
        });
      } else {
        await followUser(user.uid);
        setFollowing(true);
        toast({
          title: "Success",
          description: `You are now following ${user.displayName}`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update follow status",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMessageUser = async () => {
    if (!currentUser) {
      toast({
        title: "Not logged in",
        description: "Please log in to message users",
        variant: "destructive"
      });
      return;
    }

    try {
      const chatId = await createChat(currentUser.uid, user.uid);
      navigate(`/messages/${chatId}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create conversation",
        variant: "destructive"
      });
    }
  };

  const userInitials = user.displayName
    ? user.displayName
        .split(" ")
        .map(name => name[0])
        .join("")
        .toUpperCase()
    : "U";

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
        <div className="relative">
          <Avatar className="h-24 w-24">
            <AvatarImage src={user.photoURL || undefined} />
            <AvatarFallback>{userInitials}</AvatarFallback>
          </Avatar>
          {isPro && (
            <div className="absolute -bottom-1 -right-1 bg-yellow-500 text-white p-1 rounded-full">
              <ShieldCheck className="h-4 w-4" />
            </div>
          )}
        </div>
        
        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-wrap items-center gap-2 justify-center md:justify-start">
            <h1 className="text-2xl font-bold">{user.displayName}</h1>
            {user.isPrivate && <Lock className="h-4 w-4 text-gray-500" />}
            {isPro && (
              <span className="text-xs bg-yellow-500 text-white px-2 py-0.5 rounded-full">
                PRO
              </span>
            )}
          </div>
          
          {user.bio && (
            <p className="text-gray-600 mt-2">{user.bio}</p>
          )}
          
          <div className="flex gap-4 mt-3 justify-center md:justify-start">
            <button 
              onClick={onToggleFollowersModal}
              className="text-sm hover:underline"
            >
              <span className="font-bold">{user.followerCount || 0}</span> followers
            </button>
            <button 
              onClick={onToggleFollowingModal}
              className="text-sm hover:underline"
            >
              <span className="font-bold">{user.followingCount || 0}</span> following
            </button>
          </div>
        </div>
        
        {!isOwnProfile && (
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={handleFollowToggle}
              variant={following ? "outline" : "default"}
              disabled={loading}
              className="flex items-center gap-1"
            >
              {following ? (
                <>
                  <UserMinus className="h-4 w-4 mr-1" />
                  Unfollow
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-1" />
                  Follow
                </>
              )}
            </Button>
            
            <Button
              onClick={handleMessageUser}
              variant="outline"
              className="flex items-center gap-1"
            >
              <MessageSquare className="h-4 w-4 mr-1" />
              Message
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfileHeader;
