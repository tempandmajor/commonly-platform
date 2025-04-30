import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  CalendarDays, 
  ShoppingBag, 
  Users, 
  Headphones,
  Settings,
  MessageSquare,
  Share2,
  Heart,
  AlertTriangle,
  Loader2,
  Edit,
  User,
  Calendar,
  Activity,
  Lock,
  Crown,
  MessageCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { UserData } from "@/types/auth";
import UserProfileHeader from "@/components/profile/UserProfileHeader";
import UserEvents from "@/components/profile/UserEvents";
import UserPodcasts from "@/components/profile/UserPodcasts";
import UserList from "@/components/profile/UserList";
import MerchantStoreTab from "@/components/profile/MerchantStoreTab";
import SubscriptionTab from "@/components/profile/SubscriptionTab";
import LoadingIndicator from "@/components/podcasts/LoadingIndicator"; 
import { getUserProfile, toggleFollowUser, isUserPro } from "@/services/userService";
import { createChat } from "@/services/chat";
import { getUserFollowers, getUserFollowing } from "@/services/socialService";
import { useNavigate } from "react-router-dom";
import { reportUser } from "@/services/reportService";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";

// Define the props for UserList
interface UserListProps {
  userId: string;
  listType: 'followers' | 'following';
}

// Define the props for MerchantStoreTab
interface MerchantStoreTabProps {
  userId: string;
  merchantStoreId: string;
}

// Define the props for SubscriptionTab
interface SubscriptionTabProps {
  userId: string;
}

const UserProfile: React.FC = () => {
  const { userId } = useParams();
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
        const userIsPro = await isUserPro(userId);
        setIsPro(userIsPro);
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center" style={{ minHeight: "calc(100vh - 64px)" }}>
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">User Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The user profile you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Button asChild>
            <Link to="/">Return Home</Link>
          </Button>
        </Card>
      </div>
    );
  }

  // Determine which tabs to show based on user type
  const showSubscriptionTab = isCurrentUser;
  const showMerchantTab = isCurrentUser && profileUser.isMerchant;
  const showEditProfileButton = isCurrentUser;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Card className="mb-6">
        <CardContent className="p-6">
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
              
              {!isCurrentUser && currentUser && (
                <div className="mt-4 w-full">
                  <Button
                    onClick={handleFollowToggle}
                    variant={isFollowingUser ? "outline" : "default"}
                    className="w-full"
                    disabled={followLoading}
                  >
                    {followLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
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
                    <Link to={`/messages/${userId}`}>
                      <MessageCircle className="h-4 w-4 mr-2" /> Message
                    </Link>
                  </Button>
                </div>
              )}
              
              {showEditProfileButton && (
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
        </CardContent>
      </Card>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="podcasts">Podcasts</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="followers">Followers</TabsTrigger>
          <TabsTrigger value="following">Following</TabsTrigger>
          {showSubscriptionTab && (
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
          )}
          {showMerchantTab && (
            <TabsTrigger value="store">Store</TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="podcasts">
          <UserPodcasts userId={profileUser.uid} />
        </TabsContent>
        
        <TabsContent value="events">
          <UserEvents userId={profileUser.uid} />
        </TabsContent>
        
        <TabsContent value="followers">
          <UserList userId={profileUser.uid} listType="followers" />
        </TabsContent>
        
        <TabsContent value="following">
          <UserList userId={profileUser.uid} listType="following" />
        </TabsContent>
        
        {showSubscriptionTab && (
          <TabsContent value="subscription">
            <SubscriptionTab userId={profileUser.uid} />
          </TabsContent>
        )}
        
        {showMerchantTab && (
          <TabsContent value="store">
            <MerchantStoreTab userId={profileUser.uid} merchantStoreId={profileUser.merchantStoreId || ''} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default UserProfile;
