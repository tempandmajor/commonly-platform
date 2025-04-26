
import React, { useState, useEffect, useRef } from "react";
import { useAgora } from "@/hooks/useAgora";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { startCloudRecording, stopCloudRecording } from "@/services/agoraService";
import { useToast } from "@/hooks/use-toast";
import VideoPreview from "./studio/VideoPreview";
import RecordingTimer from "./studio/RecordingTimer";
import MediaControls from "./studio/MediaControls";

interface RecordingStudioProps {
  channelName: string;
  uid: string;
  onRecordingCompleted: (recordingUrl: string, duration: number) => void;
  onCancel: () => void;
}

const RecordingStudio: React.FC<RecordingStudioProps> = ({
  channelName,
  uid,
  onRecordingCompleted,
  onCancel,
}) => {
  const {
    localAudioTrack,
    localVideoTrack,
    remoteUsers,
    isJoined,
    mediaStatus,
    loading,
    error,
    joinChannel,
    leaveChannel,
    toggleMute,
  } = useAgora(channelName, uid);

  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [resourceId, setResourceId] = useState<string | null>(null);
  const [isProcessingRecording, setIsProcessingRecording] = useState(false);
  const recordingTimerRef = useRef<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Auto-join channel when component mounts
    joinChannel();

    // Clean up when component unmounts
    return () => {
      leaveChannel();
      if (recordingTimerRef.current) {
        window.clearInterval(recordingTimerRef.current);
      }
    };
  }, []);

  // For demo purposes - in a real app, get a token from your backend
  const generateDummyToken = async (): Promise<string> => {
    return "dummy_token";
  };

  const startRecording = async () => {
    if (!isJoined) {
      toast({
        title: "Cannot start recording",
        description: "Please join the channel first",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsProcessingRecording(true);
      const token = await generateDummyToken();
      const resId = await startCloudRecording(channelName, uid, token);
      setResourceId(resId);
      setIsRecording(true);
      
      recordingTimerRef.current = window.setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      
      toast({
        title: "Recording started",
        description: "Your podcast recording has started",
      });
    } catch (error) {
      console.error("Error starting recording:", error);
      toast({
        title: "Recording failed",
        description: "Could not start recording. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingRecording(false);
    }
  };

  const stopRecording = async () => {
    if (!isRecording || !resourceId) {
      return;
    }

    try {
      setIsProcessingRecording(true);
      
      if (recordingTimerRef.current) {
        window.clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
      
      const recordingUrl = await stopCloudRecording(channelName, uid, resourceId);
      setIsRecording(false);
      onRecordingCompleted(recordingUrl, recordingDuration);
      
      toast({
        title: "Recording completed",
        description: "Your podcast has been recorded successfully",
      });
    } catch (error) {
      console.error("Error stopping recording:", error);
      setIsRecording(false);
      toast({
        title: "Recording error",
        description: "There was a problem finishing the recording",
        variant: "destructive",
      });
    } finally {
      setIsProcessingRecording(false);
    }
  };

  const handleLeaveStudio = async () => {
    if (isRecording) {
      await stopRecording();
    }
    await leaveChannel();
    onCancel();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-6">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={onCancel} variant="outline">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <VideoPreview videoTrack={localVideoTrack} name="You (Host)" />
          
          {remoteUsers.length > 0 ? (
            remoteUsers.map(user => (
              <VideoPreview
                key={user.uid.toString()}
                videoTrack={user.videoTrack}
                name="Guest"
              />
            ))
          ) : (
            <div className="bg-gray-800 rounded-md overflow-hidden aspect-video flex items-center justify-center text-gray-500">
              <p>No guests have joined yet</p>
            </div>
          )}
        </div>

        {isRecording && (
          <RecordingTimer duration={recordingDuration} />
        )}

        <MediaControls
          mediaStatus={mediaStatus}
          isRecording={isRecording}
          isProcessingRecording={isProcessingRecording}
          isJoined={isJoined}
          onToggleMute={toggleMute}
          onStartRecording={startRecording}
          onStopRecording={stopRecording}
          onLeaveStudio={handleLeaveStudio}
        />

        <div className="text-center text-sm text-muted-foreground">
          <p>
            All recordings will be saved to your account and can be edited later.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecordingStudio;
