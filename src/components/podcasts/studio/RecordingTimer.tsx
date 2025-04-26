
import React from 'react';
import { Podcast } from 'lucide-react';

interface RecordingTimerProps {
  duration: number;
}

const RecordingTimer: React.FC<RecordingTimerProps> = ({ duration }) => {
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex items-center justify-center bg-red-50 py-2 rounded-md">
      <Podcast className="h-4 w-4 text-red-500 animate-pulse mr-2" />
      <span className="text-red-500 font-medium">
        Recording: {formatDuration(duration)}
      </span>
    </div>
  );
};

export default RecordingTimer;
