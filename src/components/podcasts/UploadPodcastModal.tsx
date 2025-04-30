
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { createPodcast } from "@/services/podcast";
import { PodcastFormData } from "./PodcastForm";
import PodcastForm from "./PodcastForm";
import { PodcastCategory } from "@/types/podcast";

interface UploadPodcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: PodcastCategory[];
  onSuccess: (podcastId: string) => void;
}

const UploadPodcastModal: React.FC<UploadPodcastModalProps> = ({
  isOpen,
  onClose,
  categories,
  onSuccess,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { currentUser, userData } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (
    data: PodcastFormData,
    audioFile?: File,
    videoFile?: File,
    thumbnailFile?: File
  ) => {
    if (!currentUser || !userData) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to upload a podcast",
        variant: "destructive",
      });
      return;
    }

    if (data.type === "audio" && !audioFile) {
      toast({
        title: "Audio file required",
        description: "Please upload an audio file for your podcast",
        variant: "destructive",
      });
      return;
    }

    if (data.type === "video" && !videoFile) {
      toast({
        title: "Video file required",
        description: "Please upload a video file for your podcast",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const podcastId = await createPodcast(
        {
          title: data.title,
          description: data.description,
          creatorId: currentUser.uid,
          creatorName: userData.displayName || "Unknown Creator",
          type: data.type,
          categoryId: data.category,
          duration: data.duration,
          published: data.visibility === "public",
          visibility: data.visibility,
          tags: data.tags,
        },
        audioFile,
        videoFile,
        thumbnailFile
      );

      toast({
        title: "Podcast uploaded",
        description: "Your podcast has been uploaded successfully",
      });
      
      onSuccess(podcastId);
      onClose();
    } catch (error) {
      console.error("Error uploading podcast:", error);
      toast({
        title: "Error",
        description: "Failed to upload podcast",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Upload Podcast</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-muted-foreground mb-4">
            Upload an existing podcast that you've recorded elsewhere.
          </p>

          <PodcastForm
            categories={categories}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            isExternal={true}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UploadPodcastModal;
