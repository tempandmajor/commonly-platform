
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { extractInitials } from "@/lib/utils";
import { Link } from "react-router-dom";
import { UserData } from "@/types/auth";

export interface UserListProps {
  users: UserData[];
  emptyMessage: string;
  loading?: boolean;
  userId?: string;
  listType?: string;
}

const UserList: React.FC<UserListProps> = ({
  users,
  emptyMessage,
  loading = false,
  userId,
  listType
}) => {
  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  if (!users || users.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {users.map((user) => (
        <Link
          key={user.uid}
          to={`/profile/${user.uid}`}
          className="flex items-center gap-3 p-4 rounded-lg border hover:bg-accent transition-colors"
        >
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "User"} />
            <AvatarFallback>{extractInitials(user.displayName)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{user.displayName || "User"}</p>
            {user.bio && (
              <p className="text-sm text-muted-foreground line-clamp-1">
                {user.bio}
              </p>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
};

export default UserList;
