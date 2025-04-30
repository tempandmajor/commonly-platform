
import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { extractInitials } from "@/lib/utils";
import { Link } from "react-router-dom";
import { UserData } from "@/types/auth";
import { getUserFollowers, getUserFollowing } from "@/services/socialService";
import { Loader2 } from "lucide-react";

export interface UserListProps {
  userId: string;
  listType: 'followers' | 'following';
}

const UserList: React.FC<UserListProps> = ({
  userId,
  listType
}) => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        let fetchedUsers: UserData[];
        
        if (listType === 'followers') {
          fetchedUsers = await getUserFollowers(userId);
        } else {
          fetchedUsers = await getUserFollowing(userId);
        }
        
        setUsers(fetchedUsers);
      } catch (err) {
        console.error(`Error fetching ${listType}:`, err);
        setError(`Failed to load ${listType}. Please try again.`);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [userId, listType]);

  if (loading) {
    return <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  if (error) {
    return <div className="text-center p-8 text-destructive">{error}</div>;
  }

  if (!users || users.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        {listType === 'followers' 
          ? "This user doesn't have any followers yet."
          : "This user isn't following anyone yet."}
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
