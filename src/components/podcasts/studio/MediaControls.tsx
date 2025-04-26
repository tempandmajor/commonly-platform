
import React from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Video, VideoOff, Phone, Podcast, StopCircle, Loader2 } from 'lucide-react';

interface MediaControlsProps {
  mediaStatus: {
    audio: boolean;
    video: boolean;
  };
  isRecording: boolean;
  isProcessingRecording: boolean;
  isJoined: boolean;
  onToggleMute: (type: "audio" | "video") => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onLeaveStudio: () => void;
}

const MediaControls: React.FC<MediaControlsProps> = ({
  mediaStatus,
  isRecording,
  isProcessingRecording,
  isJoined,
  onToggleMute,
  onStartRecording,
  onStopRecording,
  onLeaveStudio,
}) => {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onToggleMute("audio")}
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
        onClick={() => onToggleMute("video")}
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
          onClick={onStopRecording}
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
          onClick={onStartRecording}
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
        onClick={onLeaveStudio}
      >
        <Phone className="h-4 w-4 mr-2 rotate-135" />
        Leave Studio
      </Button>
    </div>
  );
};

export default MediaControls;
