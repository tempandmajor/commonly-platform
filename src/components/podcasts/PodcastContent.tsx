
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PodcastGrid from "./PodcastGrid";
import { Podcast } from "@/types/podcast";

interface PodcastContentProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  podcasts: Podcast[];
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
}

const PodcastContent: React.FC<PodcastContentProps> = ({
  activeTab,
  onTabChange,
  podcasts,
  loading,
  hasMore,
  onLoadMore,
}) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange}>
      <TabsList>
        <TabsTrigger value="all">All Podcasts</TabsTrigger>
        <TabsTrigger value="audio">Audio</TabsTrigger>
        <TabsTrigger value="video">Video</TabsTrigger>
      </TabsList>

      <TabsContent value="all" className="mt-6">
        <PodcastGrid
          podcasts={podcasts}
          loading={loading}
          hasMore={hasMore}
          onLoadMore={onLoadMore}
        />
      </TabsContent>

      <TabsContent value="audio" className="mt-6">
        <PodcastGrid
          podcasts={podcasts.filter((podcast) => podcast.type === "audio")}
          loading={loading}
          hasMore={hasMore && podcasts.some((podcast) => podcast.type === "audio")}
          onLoadMore={onLoadMore}
        />
      </TabsContent>

      <TabsContent value="video" className="mt-6">
        <PodcastGrid
          podcasts={podcasts.filter((podcast) => podcast.type === "video")}
          loading={loading}
          hasMore={hasMore && podcasts.some((podcast) => podcast.type === "video")}
          onLoadMore={onLoadMore}
        />
      </TabsContent>
    </Tabs>
  );
};

export default PodcastContent;
