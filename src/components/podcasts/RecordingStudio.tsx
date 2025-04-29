
import React, { useEffect } from "react";
import { useAgora } from "@/hooks/useAgora";
import { Card, CardContent } from "@/components/ui/card";
import RecordingTimer from "./studio/RecordingTimer";
import MediaControls from "./studio/MediaControls";
import VideoGrid from "./studio/VideoGrid";
import StudioHeader from "./studio/StudioHeader";
import StudioFooter from "./studio/StudioFooter";
import { useRecording } from "./studio/hooks/useRecording";

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

  const {
    isRecording,
    recordingDuration,
    isProcessingRecording,
    startRecording,
    stopRecording
  } = useRecording(channelName, uid, isJoined, onRecordingCompleted);

  useEffect(() => {
    // Auto-join channel when component mounts
    joinChannel();

    // Clean up when component unmounts
    return () => {
      leaveChannel();
    };
  }, []);

  const handleLeaveStudio = async () => {
    if (isRecording) {
      await stopRecording();
    }
    await leaveChannel();
    onCancel();
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6 space-y-4">
        <StudioHeader loading={loading} error={error} onCancel={onCancel} />

        {!loading && !error && (
          <>
            <VideoGrid localVideoTrack={localVideoTrack} remoteUsers={remoteUsers} />

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

            <StudioFooter />
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default RecordingStudio;
