
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/layout/Navbar";
import { getUserProfile, getUserEventsFeed, getUserFollowers, getUserFollowing } from "@/services/userService";
import { UserData } from "@/types/auth";
import { Event } from "@/types/event";
import UserProfileHeader from "@/components/profile/UserProfileHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import EventList from "@/components/events/EventList";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import UserList from "@/components/profile/UserList";
import { Loader2 } from "lucide-react";
import { checkSubscriptionEligibility } from "@/services/subscriptionService";
import SubscriptionTab from "@/components/profile/SubscriptionTab";
import MerchantStoreTab from "@/components/profile/MerchantStoreTab";

const UserProfile = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser, userData } = useAuth();
  const [profileUser, setProfileUser] = useState<UserData | null>(null);
  const [isOwnProfile, setIsOwnProfile] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [followers, setFollowers] = useState<UserData[]>([]);
  const [following, setFollowing] = useState<UserData[]>([]);
  const [followersOpen, setFollowersOpen] = useState<boolean>(false);
  const [followingOpen, setFollowingOpen] = useState<boolean>(false);
  const [isEligibleForPro, setIsEligibleForPro] = useState<boolean>(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      try {
        if (!id) {
          // If no ID in URL, use current user's ID
          if (currentUser) {
            navigate(`/profile/${currentUser.uid}`);
          } else {
            navigate('/');
            return;
          }
        }
        
        const userId = id || currentUser?.uid;
        
        if (!userId) {
          throw new Error("No user ID available");
        }
        
        // Check if viewing own profile
        setIsOwnProfile(userId === currentUser?.uid);
        
        // Get user profile data
        const profile = await getUserProfile(userId);
        
        if (!profile) {
          toast({
            title: "User not found",
            description: "The requested user profile does not exist",
            variant: "destructive"
          });
          navigate('/');
          return;
        }
        
        setProfileUser(profile);
        
        // Fetch feed if it's the user's own profile
        if (isOwnProfile) {
          const userEvents = await getUserEventsFeed(userId);
          setEvents(userEvents);
          
          // Check eligibility for pro subscription
          const eligible = await checkSubscriptionEligibility(userId);
          setIsEligibleForPro(eligible);
        }
        
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast({
          title: "Error",
          description: "Failed to load user profile",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfileData();
  }, [id, currentUser, navigate, toast]);

  const handleToggleFollowersModal = async () => {
    if (!profileUser) return;
    
    if (!followersOpen && followers.length === 0) {
      try {
        const followersList = await getUserFollowers(profileUser.uid);
        setFollowers(followersList);
      } catch (error) {
        console.error("Error fetching followers:", error);
      }
    }
    
    setFollowersOpen(!followersOpen);
  };

  const handleToggleFollowingModal = async () => {
    if (!profileUser) return;
    
    if (!followingOpen && following.length === 0) {
      try {
        const followingList = await getUserFollowing(profileUser.uid);
        setFollowing(followingList);
      } catch (error) {
        console.error("Error fetching following:", error);
      }
    }
    
    setFollowingOpen(!followingOpen);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex justify-center items-center" style={{ minHeight: "calc(100vh - 64px)" }}>
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </>
    );
  }

  if (!profileUser) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-gray-500">User not found</p>
        </div>
      </>
    );
  }

  // Check if user is eligible for merchant store (1000+ followers)
  const isEligibleForMerchant = (profileUser.followerCount || 0) >= 1000;

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <UserProfileHeader 
          user={profileUser} 
          isOwnProfile={isOwnProfile} 
          onToggleFollowersModal={handleToggleFollowersModal}
          onToggleFollowingModal={handleToggleFollowingModal}
        />

        <Tabs defaultValue="events" className="w-full">
          <TabsList className="w-full md:w-auto">
            {isOwnProfile && <TabsTrigger value="feed">My Feed</TabsTrigger>}
            <TabsTrigger value="events">Events</TabsTrigger>
            {isOwnProfile && isEligibleForPro && (
              <TabsTrigger value="subscription">Subscription</TabsTrigger>
            )}
            {isOwnProfile && isEligibleForMerchant && (
              <TabsTrigger value="merchant">Merchant Store</TabsTrigger>
            )}
          </TabsList>
          
          {isOwnProfile && (
            <TabsContent value="feed" className="mt-4">
              <h2 className="text-xl font-bold mb-4">Events from people you follow</h2>
              {events.length > 0 ? (
                <EventList events={events} />
              ) : (
                <p className="text-gray-500 text-center py-10">
                  No events from people you follow yet. Start following users to see their events here!
                </p>
              )}
            </TabsContent>
          )}
          
          <TabsContent value="events" className="mt-4">
            <h2 className="text-xl font-bold mb-4">
              {isOwnProfile ? "My Events" : `${profileUser.displayName}'s Events`}
            </h2>
            <EventList userId={profileUser.uid} />
          </TabsContent>
          
          {isOwnProfile && isEligibleForPro && (
            <TabsContent value="subscription" className="mt-4">
              <SubscriptionTab userId={profileUser.uid} />
            </TabsContent>
          )}
          
          {isOwnProfile && isEligibleForMerchant && (
            <TabsContent value="merchant" className="mt-4">
              <MerchantStoreTab userId={profileUser.uid} isEligible={isEligibleForMerchant} />
            </TabsContent>
          )}
        </Tabs>
      </div>

      <Dialog open={followersOpen} onOpenChange={setFollowersOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Followers</DialogTitle>
          </DialogHeader>
          <UserList users={followers} onClose={() => setFollowersOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={followingOpen} onOpenChange={setFollowingOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Following</DialogTitle>
          </DialogHeader>
          <UserList users={following} onClose={() => setFollowingOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UserProfile;
