
import React from "react";
import { Mic, Upload, Podcast as PodcastIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface PodcastHeaderProps {
  onRecordClick: () => void;
  onUploadClick: () => void;
  isAuthenticated: boolean;
  isProUser: boolean;
}

const PodcastHeader: React.FC<PodcastHeaderProps> = ({
  onRecordClick,
  onUploadClick,
  isAuthenticated,
  isProUser,
}) => {
  const { toast } = useToast();

  const handleCreateClick = () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create a podcast",
        variant: "destructive",
      });
      return;
    }

    if (isProUser) {
      onRecordClick();
    } else {
      toast({
        title: "Pro subscription required",
        description: "You need a Pro subscription to record podcasts. You can still upload external podcasts.",
        variant: "default",
      });
    }
  };

  const handleUploadClick = () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please sign in to upload a podcast",
        variant: "destructive",
      });
      return;
    }

    onUploadClick();
  };

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
      <div>
        <h1 className="text-3xl font-bold flex items-center">
          <PodcastIcon className="h-8 w-8 mr-2" />
          Podcasts
        </h1>
        <p className="text-muted-foreground">
          Discover and listen to podcasts from creators
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <Button onClick={handleCreateClick} className="flex items-center">
          <Mic className="h-4 w-4 mr-2" />
          Record Podcast
        </Button>
        <Button variant="outline" onClick={handleUploadClick}>
          <Upload className="h-4 w-4 mr-2" />
          Upload Podcast
        </Button>
      </div>
    </div>
  );
};

export default PodcastHeader;
