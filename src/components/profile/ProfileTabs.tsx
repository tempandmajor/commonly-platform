
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserEvents from "./UserEvents";
import UserPodcasts from "./UserPodcasts";
import SubscriptionTab from "./SubscriptionTab";
import MerchantStoreTab from "./MerchantStoreTab";
import UserFollowLists from "./UserFollowLists";

interface ProfileTabsProps {
  userId: string;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  showSubscriptionTab: boolean;
  showMerchantTab: boolean;
  merchantStoreId?: string;
}

const ProfileTabs: React.FC<ProfileTabsProps> = ({
  userId,
  activeTab,
  setActiveTab,
  showSubscriptionTab,
  showMerchantTab,
  merchantStoreId = '',
}) => {
  return (
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
        <UserPodcasts userId={userId} />
      </TabsContent>
      
      <TabsContent value="events">
        <UserEvents userId={userId} />
      </TabsContent>
      
      <TabsContent value="followers">
        <UserFollowLists userId={userId} listType="followers" />
      </TabsContent>
      
      <TabsContent value="following">
        <UserFollowLists userId={userId} listType="following" />
      </TabsContent>
      
      {showSubscriptionTab && (
        <TabsContent value="subscription">
          <SubscriptionTab userId={userId} />
        </TabsContent>
      )}
      
      {showMerchantTab && (
        <TabsContent value="store">
          <MerchantStoreTab 
            userId={userId} 
            merchantStoreId={merchantStoreId}
          />
        </TabsContent>
      )}
    </Tabs>
  );
};

export default ProfileTabs;
