
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { 
  createPodcast, 
  createPodcastSession 
} from "@/services/podcast"; // Updated import path
import { PodcastFormData } from "./PodcastForm";
import RecordingStudio from "./RecordingStudio";
import PodcastForm from "./PodcastForm";
import { PodcastCategory } from "@/types/podcast";
import { v4 as uuidv4 } from "uuid";

interface RecordPodcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: PodcastCategory[];
  onSuccess: (podcastId: string) => void;
}

const RecordPodcastModal: React.FC<RecordPodcastModalProps> = ({
  isOpen,
  onClose,
  categories,
  onSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<string>("details");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<PodcastFormData | null>(null);
  const [channelName, setChannelName] = useState<string>("");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const { currentUser, userData } = useAuth();
  const { toast } = useToast();

  const handleDetailsSubmit = async (
    data: PodcastFormData,
    _audioFile?: File,
    _videoFile?: File,
    thumbnailFile?: File
  ) => {
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to create a podcast",
        variant: "destructive",
      });
      return;
    }

    setFormData(data);
    if (thumbnailFile) {
      setThumbnailFile(thumbnailFile);
    }
    
    // Generate a channel name for Agora
    const uniqueChannelName = `podcast_${currentUser.uid}_${uuidv4().substring(0, 8)}`;
    setChannelName(uniqueChannelName);
    
    // Create a podcast session
    try {
      await createPodcastSession({
        hostId: currentUser.uid,
        title: data.title,
        description: data.description,
        scheduledFor: new Date(),
        duration: 60, // Default scheduled duration (minutes)
        participants: [currentUser.uid],
        status: "scheduled",
        agoraChannelName: uniqueChannelName,
      });
      
      setActiveTab("record");
    } catch (error) {
      console.error("Error creating podcast session:", error);
      toast({
        title: "Error",
        description: "Failed to create podcast session",
        variant: "destructive",
      });
    }
  };

  const handleRecordingCompleted = async (
    recordingUrl: string,
    duration: number
  ) => {
    if (!formData || !currentUser || !userData) return;

    setIsLoading(true);

    try {
      const podcastId = await createPodcast(
        {
          title: formData.title,
          description: formData.description,
          creatorId: currentUser.uid,
          creatorName: userData.displayName || "Unknown Creator",
          type: formData.type,
          category: formData.category,
          duration: duration,
          isExternal: false,
          visibility: formData.visibility,
          tags: formData.tags,
          videoUrl: formData.type === "video" ? recordingUrl : undefined,
          audioUrl: formData.type === "audio" ? recordingUrl : undefined,
        },
        undefined,
        undefined,
        thumbnailFile || undefined
      );

      toast({
        title: "Podcast created",
        description: "Your podcast has been created successfully",
      });
      
      onSuccess(podcastId);
      onClose();
    } catch (error) {
      console.error("Error creating podcast:", error);
      toast({
        title: "Error",
        description: "Failed to create podcast",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Record New Podcast</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="details">1. Podcast Details</TabsTrigger>
            <TabsTrigger value="record" disabled={!formData}>
              2. Record Podcast
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="py-4">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground mb-4">
                First, let's set up your podcast details. You'll be able to record after completing this step.
              </p>

              <PodcastForm
                categories={categories}
                onSubmit={handleDetailsSubmit}
                isLoading={isLoading}
                isExternal={false}
              />
            </div>
          </TabsContent>

          <TabsContent value="record" className="py-4">
            {channelName && currentUser && (
              <RecordingStudio
                channelName={channelName}
                uid={currentUser.uid}
                onRecordingCompleted={handleRecordingCompleted}
                onCancel={handleCancel}
              />
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default RecordPodcastModal;
