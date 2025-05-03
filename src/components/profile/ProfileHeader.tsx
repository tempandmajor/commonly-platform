
import React from "react";
import { User } from "lucide-react";
import { Link } from "react-router-dom";
import { UserData } from "@/types/auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Edit,
  Lock,
  Crown,
  ShoppingBag,
  Calendar,
  Activity,
} from "lucide-react";

interface ProfileHeaderProps {
  profileUser: UserData;
  isCurrentUser: boolean;
  isFollowingUser: boolean;
  isPro: boolean;
  followLoading: boolean;
  handleFollowToggle: () => Promise<void>;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profileUser,
  isCurrentUser,
  isFollowingUser,
  isPro,
  followLoading,
  handleFollowToggle,
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-6">
      <div className="flex-shrink-0 flex flex-col items-center">
        <Avatar className="h-32 w-32 md:h-40 md:w-40">
          <AvatarImage src={profileUser.photoURL || undefined} />
          <AvatarFallback className="text-3xl">
            {profileUser.displayName
              ? profileUser.displayName.charAt(0).toUpperCase()
              : "U"}
          </AvatarFallback>
        </Avatar>
        
        {!isCurrentUser && (
          <div className="mt-4 w-full">
            <Button
              onClick={handleFollowToggle}
              variant={isFollowingUser ? "outline" : "default"}
              className="w-full"
              disabled={followLoading}
            >
              {followLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading
                </span>
              ) : isFollowingUser ? (
                "Unfollow"
              ) : (
                "Follow"
              )}
            </Button>
            
            <Button
              variant="outline"
              className="w-full mt-2"
              asChild
            >
              <Link to={`/messages/${profileUser.uid}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg> 
                Message
              </Link>
            </Button>
          </div>
        )}
        
        {isCurrentUser && (
          <div className="mt-4 w-full">
            <Button
              variant="outline"
              className="w-full"
              asChild
            >
              <Link to="/settings/profile">
                <Edit className="h-4 w-4 mr-2" /> Edit Profile
              </Link>
            </Button>
          </div>
        )}
      </div>
      
      <div className="flex-grow">
        <div className="flex flex-wrap items-start justify-between gap-2 mb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center">
              {profileUser.displayName || "User"}
              {profileUser.isPrivate && (
                <Lock className="h-5 w-5 ml-2 text-muted-foreground" />
              )}
              {isPro && (
                <span className="ml-2 bg-gradient-to-r from-amber-500 to-yellow-300 text-white text-xs px-2 py-0.5 rounded-full flex items-center">
                  <Crown className="h-3 w-3 mr-1" /> PRO
                </span>
              )}
              {profileUser.isMerchant && (
                <span className="ml-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-xs px-2 py-0.5 rounded-full flex items-center">
                  <ShoppingBag className="h-3 w-3 mr-1" /> MERCHANT
                </span>
              )}
            </h1>
            <p className="text-muted-foreground">{profileUser.email}</p>
          </div>
          <div className="flex flex-wrap gap-4 mt-2 md:mt-0">
            <div className="text-center">
              <p className="text-lg font-semibold">{profileUser.followerCount || 0}</p>
              <p className="text-sm text-muted-foreground">Followers</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold">{profileUser.followingCount || 0}</p>
              <p className="text-sm text-muted-foreground">Following</p>
            </div>
          </div>
        </div>
        
        {profileUser.bio && (
          <p className="mb-4">{profileUser.bio}</p>
        )}
        
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <div className="flex items-center">
            <User className="h-4 w-4 mr-1" />
            {isFollowingUser ? "Following" : "Not following"}
          </div>
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            Joined {new Date(profileUser.createdAt || Date.now()).toLocaleDateString()}
          </div>
          <div className="flex items-center">
            <Activity className="h-4 w-4 mr-1" />
            {profileUser.recentLogin ? "Online now" : profileUser.createdAt ? `Last seen ${new Date(profileUser.createdAt).toLocaleDateString()}` : "Not recently active"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
