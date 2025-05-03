
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserData } from "@/types/auth";

interface UserFollowListsProps {
  userId: string;
  listType: 'followers' | 'following';
}

export const UserFollowLists: React.FC<UserFollowListsProps> = ({ userId, listType }) => {
  return (
    <div className="text-center p-10">
      <h3 className="text-lg font-medium">{listType === 'followers' ? 'Followers' : 'Following'}</h3>
      <p className="text-muted-foreground">User list coming soon</p>
    </div>
  );
};

export default UserFollowLists;
