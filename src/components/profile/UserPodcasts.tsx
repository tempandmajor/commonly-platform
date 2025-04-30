
import React, { useState, useEffect } from "react";
import { getPodcastsByCreator } from "@/services/podcast";
import { Podcast } from "@/types/podcast";
import PodcastGrid from "@/components/podcasts/PodcastGrid";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UserPodcastsProps {
  userId: string;
}

const UserPodcasts: React.FC<UserPodcastsProps> = ({ userId }) => {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserPodcasts = async () => {
      if (!userId) return;

      try {
        setLoading(true);
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

    fetchUserPodcasts();
  }, [userId, toast]);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      {podcasts.length > 0 ? (
        <PodcastGrid podcasts={podcasts} />
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-muted-foreground">No podcasts found</p>
        </div>
      )}
    </div>
  );
};

export default UserPodcasts;
