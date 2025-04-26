
import React, { useState, useEffect, useRef } from "react";
import { useAgora } from "@/hooks/useAgora";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Phone,
  Podcast,
  StopCircle,
  Loader2,
} from "lucide-react";
import { startCloudRecording, stopCloudRecording } from "@/services/agoraService";
import { useToast } from "@/hooks/use-toast";

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
  const localVideoRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    if (localVideoTrack && localVideoRef.current) {
      localVideoTrack.play(localVideoRef.current);
    }
    
    return () => {
      if (localVideoTrack) {
        localVideoTrack.stop();
      }
    };
  }, [localVideoTrack]);

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
      const token = await generateDummyToken(); // In a real app, get from your backend
      const resId = await startCloudRecording(channelName, uid, token);
      setResourceId(resId);
      setIsRecording(true);
      
      // Start timer to track recording duration
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
      
      // Stop the timer
      if (recordingTimerRef.current) {
        window.clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
      
      const recordingUrl = await stopCloudRecording(channelName, uid, resourceId);
      setIsRecording(false);
      
      // Pass the recording URL and duration back to parent component
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

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
    }
    
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // For demo purposes - in a real app, get a token from your backend
  const generateDummyToken = async (): Promise<string> => {
    return "dummy_token";
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
          <div className="bg-black rounded-md overflow-hidden aspect-video relative">
            <div
              ref={localVideoRef}
              className="w-full h-full"
            />
            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
              You (Host)
            </div>
          </div>
          
          {remoteUsers.length > 0 ? (
            remoteUsers.map(user => (
              <div 
                key={user.uid.toString()}
                className="bg-black rounded-md overflow-hidden aspect-video relative"
                id={`remote-${user.uid}`}
              >
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  Guest
                </div>
              </div>
            ))
          ) : (
            <div className="bg-gray-800 rounded-md overflow-hidden aspect-video flex items-center justify-center text-gray-500">
              <p>No guests have joined yet</p>
            </div>
          )}
        </div>

        {isRecording && (
          <div className="flex items-center justify-center bg-red-50 py-2 rounded-md">
            <Podcast className="h-4 w-4 text-red-500 animate-pulse mr-2" />
            <span className="text-red-500 font-medium">
              Recording: {formatDuration(recordingDuration)}
            </span>
          </div>
        )}

        <div className="flex flex-wrap justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => toggleMute("audio")}
            className={!mediaStatus.audio ? "bg-red-100" : ""}
          >
            {mediaStatus.audio ? (
              <Mic className="h-4 w-4 mr-2" />
            ) : (
              <MicOff className="h-4 w-4 mr-2" />
            )}
            {mediaStatus.audio ? "Mute" : "Unmute"}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => toggleMute("video")}
            className={!mediaStatus.video ? "bg-red-100" : ""}
          >
            {mediaStatus.video ? (
              <Video className="h-4 w-4 mr-2" />
            ) : (
              <VideoOff className="h-4 w-4 mr-2" />
            )}
            {mediaStatus.video ? "Hide Video" : "Show Video"}
          </Button>

          {isRecording ? (
            <Button
              variant="destructive"
              size="sm"
              onClick={stopRecording}
              disabled={isProcessingRecording}
            >
              {isProcessingRecording ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <StopCircle className="h-4 w-4 mr-2" />
              )}
              Stop Recording
            </Button>
          ) : (
            <Button
              variant="default"
              size="sm"
              onClick={startRecording}
              disabled={isProcessingRecording || !isJoined}
            >
              {isProcessingRecording ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Podcast className="h-4 w-4 mr-2" />
              )}
              Start Recording
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleLeaveStudio}
          >
            <Phone className="h-4 w-4 mr-2 rotate-135" />
            Leave Studio
          </Button>
        </div>

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
