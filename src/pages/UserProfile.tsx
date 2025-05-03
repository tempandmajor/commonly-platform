
import React from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileTabs from "@/components/profile/ProfileTabs";
import NotFoundCard from "@/components/profile/NotFoundCard";
import useProfileData from "@/hooks/useProfileData";

const UserProfile: React.FC = () => {
  const { userId } = useParams<{ userId?: string }>();
  const {
    profileUser,
    loading,
    followLoading,
    activeTab,
    setActiveTab,
    isPro,
    isCurrentUser,
    isFollowingUser,
    handleFollowToggle
  } = useProfileData(userId);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center" style={{ minHeight: "calc(100vh - 64px)" }}>
        <LoadingSpinner />
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="container mx-auto px-4 py-8">
        <NotFoundCard />
      </div>
    );
  }

  // Determine which tabs to show based on user type
  const showSubscriptionTab = isCurrentUser;
  const showMerchantTab = isCurrentUser && profileUser.isMerchant;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Card className="mb-6">
        <CardContent className="p-6">
          <ProfileHeader
            profileUser={profileUser}
            isCurrentUser={isCurrentUser}
            isFollowingUser={isFollowingUser}
            isPro={isPro}
            followLoading={followLoading}
            handleFollowToggle={handleFollowToggle}
          />
        </CardContent>
      </Card>
      
      <ProfileTabs
        userId={profileUser.uid}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        showSubscriptionTab={showSubscriptionTab}
        showMerchantTab={showMerchantTab}
        merchantStoreId={profileUser.merchantStoreId}
      />
    </div>
  );
};

export default UserProfile;
