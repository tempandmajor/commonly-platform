
import React from "react";
import { UserData } from "@/types/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { UserPlus, UserMinus, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { isUserPro } from "@/services/subscriptionService";

interface UserListProps {
  users: UserData[];
  onClose: () => void;
}

const UserList: React.FC<UserListProps> = ({ users, onClose }) => {
  const { currentUser, isFollowing, followUser, unfollowUser } = useAuth();
  const { toast } = useToast();
  const [proUsers, setProUsers] = React.useState<Set<string>>(new Set());

  React.useEffect(() => {
    // Check which users are pro
    const checkProUsers = async () => {
      const proSet = new Set<string>();
      for (const user of users) {
        const isPro = await isUserPro(user.uid);
        if (isPro) {
          proSet.add(user.uid);
        }
      }
      setProUsers(proSet);
    };
    
    checkProUsers();
  }, [users]);

  const handleFollowToggle = async (user: UserData) => {
    if (!currentUser) {
      toast({
        title: "Not logged in",
        description: "Please log in to follow users",
        variant: "destructive"
      });
      return;
    }

    try {
      const following = isFollowing(user.uid);
      
      if (following) {
        await unfollowUser(user.uid);
        toast({
          title: "Unfollowed",
          description: `You no longer follow ${user.displayName}`,
        });
      } else {
        await followUser(user.uid);
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
    }
  };

  if (users.length === 0) {
    return <p className="text-gray-500 text-center py-8">No users to display</p>;
  }

  return (
    <div className="max-h-[400px] overflow-y-auto">
      <ul className="divide-y">
        {users.map((user) => {
          const userInitials = user.displayName
            ? user.displayName
                .split(" ")
                .map(name => name[0])
                .join("")
                .toUpperCase()
            : "U";
          
          const following = currentUser ? isFollowing(user.uid) : false;
          const isCurrentUser = currentUser && currentUser.uid === user.uid;
          const isPro = proUsers.has(user.uid);
            
          return (
            <li key={user.uid} className="py-3">
              <div className="flex items-center justify-between">
                <Link 
                  to={`/profile/${user.uid}`} 
                  onClick={onClose}
                  className="flex items-center gap-3"
                >
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.photoURL || undefined} />
                      <AvatarFallback>{userInitials}</AvatarFallback>
                    </Avatar>
                    {isPro && (
                      <div className="absolute -bottom-1 -right-1 bg-yellow-500 text-white p-0.5 rounded-full">
                        <ShieldCheck className="h-3 w-3" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{user.displayName}</p>
                    {isPro && (
                      <span className="text-xs bg-yellow-500 text-white px-1 py-0.5 rounded-full">
                        PRO
                      </span>
                    )}
                  </div>
                </Link>
                
                {!isCurrentUser && (
                  <Button
                    onClick={() => handleFollowToggle(user)}
                    variant={following ? "outline" : "default"}
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    {following ? (
                      <>
                        <UserMinus className="h-3 w-3 mr-1" />
                        Unfollow
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-3 w-3 mr-1" />
                        Follow
                      </>
                    )}
                  </Button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default UserList;
