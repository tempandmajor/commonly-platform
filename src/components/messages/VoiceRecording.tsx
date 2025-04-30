
import React from "react";
import { Button } from "@/components/ui/button";
import { Square } from "lucide-react";

interface VoiceRecordingProps {
  recordingTime: number;
  onStopRecording: () => void;
}

const VoiceRecording: React.FC<VoiceRecordingProps> = ({
  recordingTime,
  onStopRecording
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  return (
    <div className="p-3 border-t">
      <div className="flex items-center gap-2">
        <div className="bg-red-500/10 text-red-500 px-3 py-2 rounded-lg flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></div>
          <span>Recording {formatTime(recordingTime)}</span>
        </div>
        <Button 
          type="button" 
          size="sm" 
          variant="destructive"
          onClick={onStopRecording}
        >
          <Square className="h-3 w-3 mr-1" />
          Stop
        </Button>
      </div>
    </div>
  );
};

export default VoiceRecording;
