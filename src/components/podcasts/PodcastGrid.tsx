
import React from "react";
import PodcastCard from "./PodcastCard";
import { Podcast } from "@/types/podcast";
import { Button } from "@/components/ui/button";

interface PodcastGridProps {
  podcasts: Podcast[];
  loading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
}

const PodcastGrid: React.FC<PodcastGridProps> = ({
  podcasts,
  loading = false,
  hasMore = false,
  onLoadMore,
}) => {
  if (loading && podcasts.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="bg-gray-100 rounded-md aspect-[4/3] animate-pulse" />
        ))}
      </div>
    );
  }

  if (podcasts.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">No podcasts found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {podcasts.map((podcast) => (
          <PodcastCard key={podcast.id} podcast={podcast} />
        ))}
      </div>
      
      {hasMore && onLoadMore && (
        <div className="flex justify-center mt-4">
          <Button 
            variant="outline" 
            onClick={onLoadMore}
            disabled={loading}
          >
            {loading ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default PodcastGrid;
