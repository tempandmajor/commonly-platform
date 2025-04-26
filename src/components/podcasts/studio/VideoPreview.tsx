
import React, { useRef, useEffect } from 'react';

interface VideoTrack {
  play: (element: HTMLElement) => void;
  stop: () => void;
}

interface VideoPreviewProps {
  videoTrack: VideoTrack | null;
  name: string;
}

const VideoPreview: React.FC<VideoPreviewProps> = ({ videoTrack, name }) => {
  const videoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (videoTrack && videoRef.current) {
      videoTrack.play(videoRef.current);
    }
    return () => {
      if (videoTrack) {
        videoTrack.stop();
      }
    };
  }, [videoTrack]);

  return (
    <div className="bg-black rounded-md overflow-hidden aspect-video relative">
      <div ref={videoRef} className="w-full h-full" />
      <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
        {name}
      </div>
    </div>
  );
};

export default VideoPreview;
