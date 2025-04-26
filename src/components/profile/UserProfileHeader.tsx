
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { UserData } from "@/types/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { MessageSquare, Settings, CheckCircle2, Podcast } from "lucide-react";

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
  onToggleFollowingModal,
}) => {
  const { followUser, unfollowUser, isFollowing } = useAuth();
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  const handleFollow = async () => {
    if (!user || !user.uid) return;
    
    setIsFollowLoading(true);
    try {
      if (isFollowing(user.uid)) {
        await unfollowUser(user.uid);
      } else {
        await followUser(user.uid);
      }
    } catch (error) {
      console.error("Error following/unfollowing user:", error);
    } finally {
      setIsFollowLoading(false);
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
    <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
      <div className="relative">
        <Avatar className="h-24 w-24 md:h-32 md:h-32">
          <AvatarImage src={user.photoURL || undefined} />
          <AvatarFallback className="text-lg">{userInitials}</AvatarFallback>
        </Avatar>
        {(user.isPro || user.isMerchant) && (
          <Badge 
            className="absolute -top-2 -right-2 bg-yellow-500 text-white border-white border-2"
          >
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Verified
          </Badge>
        )}
      </div>
      
      <div className="flex-1 text-center md:text-left">
        <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
          <h1 className="text-2xl font-bold">
            {user.displayName || "Anonymous User"}
          </h1>
          
          {user.isPro && (
            <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
              Pro
            </Badge>
          )}
          
          {user.isMerchant && (
            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
              Merchant
            </Badge>
          )}
        </div>
        
        {user.bio && (
          <p className="text-muted-foreground mb-4">{user.bio}</p>
        )}
        
        <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-4">
          <button 
            onClick={onToggleFollowersModal}
            className="text-sm hover:underline"
          >
            <span className="font-bold">{user.followerCount || 0}</span> Followers
          </button>
          
          <button 
            onClick={onToggleFollowingModal}
            className="text-sm hover:underline"
          >
            <span className="font-bold">{user.followingCount || 0}</span> Following
          </button>
        </div>
        
        <div className="flex flex-wrap justify-center md:justify-start gap-2">
          {isOwnProfile ? (
            <>
              <Button variant="outline" asChild>
                <Link to="/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Edit Profile
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to={`/user/${user.uid}/podcasts`}>
                  <Podcast className="mr-2 h-4 w-4" />
                  My Podcasts
                </Link>
              </Button>
            </>
          ) : (
            <>
              <Button 
                onClick={handleFollow}
                disabled={isFollowLoading}
                variant={isFollowing(user.uid) ? "outline" : "default"}
              >
                {isFollowing(user.uid) ? "Unfollow" : "Follow"}
              </Button>
              
              <Button variant="outline" asChild>
                <Link to={`/messages/${user.uid}`}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Message
                </Link>
              </Button>
              
              <Button variant="outline" asChild>
                <Link to={`/user/${user.uid}/podcasts`}>
                  <Podcast className="mr-2 h-4 w-4" />
                  Podcasts
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfileHeader;
