
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/layout/Navbar";
import { getPodcastsByCreator } from "@/services/podcastService";
import { getUserProfile } from "@/services/userService";
import { Podcast } from "@/types/podcast";
import { UserData } from "@/types/auth";
import PodcastGrid from "@/components/podcasts/PodcastGrid";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const UserPodcasts = () => {
  const { userId } = useParams<{ userId: string }>();
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<UserData | null>(null);
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const isOwnProfile = userId === currentUser?.uid;

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        const userData = await getUserProfile(userId);
        setUser(userData);
        
        const userPodcasts = await getPodcastsByCreator(userId);
        setPodcasts(userPodcasts);
      } catch (error) {
        console.error("Error fetching user podcasts:", error);
        toast({
          title: "Error",
          description: "Failed to load podcasts",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, toast]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to={`/profile/${userId}`} className="inline-flex items-center text-blue-600 hover:underline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to profile
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-2">
          {isOwnProfile ? "My Podcasts" : `${user?.displayName || "User"}'s Podcasts`}
        </h1>
        <p className="text-muted-foreground mb-6">
          {isOwnProfile
            ? "Manage and view all your podcasts"
            : `Browse podcasts by ${user?.displayName || "this user"}`}
        </p>

        <div className="mt-6">
          {podcasts.length > 0 ? (
            <PodcastGrid podcasts={podcasts} />
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-muted-foreground mb-2">
                {isOwnProfile
                  ? "You haven't created any podcasts yet"
                  : `${user?.displayName || "This user"} hasn't created any podcasts yet`}
              </p>
              {isOwnProfile && (
                <Link to="/podcasts" className="text-blue-600 hover:underline">
                  Create your first podcast
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default UserPodcasts;
