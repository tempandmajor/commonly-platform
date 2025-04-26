
import React, { useState, useRef, useEffect } from "react";
import { Podcast } from "@/types/podcast";
import { Card } from "@/components/ui/card";
import {
  PlayCircle,
  PauseCircle,
  Volume2,
  VolumeX,
  SkipBack,
  SkipForward,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { incrementListenCount } from "@/services/podcastService";

interface PodcastPlayerProps {
  podcast: Podcast;
}

const PodcastPlayer: React.FC<PodcastPlayerProps> = ({ podcast }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [hasListenTracked, setHasListenTracked] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerContainerRef = useRef<HTMLDivElement | null>(null);

  const isVideo = podcast.type === "video" && podcast.videoUrl;

  useEffect(() => {
    const mediaElement = isVideo ? videoRef.current : audioRef.current;
    
    if (!mediaElement) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleTimeUpdate = () => setCurrentTime(mediaElement.currentTime);
    const handleLoadedMetadata = () => setDuration(mediaElement.duration);
    
    // Track listen after playing for 10 seconds
    const trackListen = () => {
      if (!hasListenTracked && mediaElement.currentTime > 10) {
        incrementListenCount(podcast.id).then(() => {
          setHasListenTracked(true);
        });
      }
    };

    mediaElement.addEventListener("play", handlePlay);
    mediaElement.addEventListener("pause", handlePause);
    mediaElement.addEventListener("timeupdate", handleTimeUpdate);
    mediaElement.addEventListener("loadedmetadata", handleLoadedMetadata);
    mediaElement.addEventListener("timeupdate", trackListen);

    return () => {
      mediaElement.removeEventListener("play", handlePlay);
      mediaElement.removeEventListener("pause", handlePause);
      mediaElement.removeEventListener("timeupdate", handleTimeUpdate);
      mediaElement.removeEventListener("loadedmetadata", handleLoadedMetadata);
      mediaElement.removeEventListener("timeupdate", trackListen);
    };
  }, [isVideo, podcast.id, hasListenTracked]);

  useEffect(() => {
    const mediaElement = isVideo ? videoRef.current : audioRef.current;
    if (!mediaElement) return;
    
    mediaElement.volume = isMuted ? 0 : volume;
  }, [volume, isMuted, isVideo]);

  const togglePlay = () => {
    const mediaElement = isVideo ? videoRef.current : audioRef.current;
    if (!mediaElement) return;
    
    if (isPlaying) {
      mediaElement.pause();
    } else {
      mediaElement.play();
    }
  };

  const handleSliderChange = (value: number[]) => {
    const mediaElement = isVideo ? videoRef.current : audioRef.current;
    if (!mediaElement) return;
    
    const newTime = value[0] * duration / 100;
    mediaElement.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0] / 100);
    setIsMuted(value[0] === 0);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const skipForward = () => {
    const mediaElement = isVideo ? videoRef.current : audioRef.current;
    if (!mediaElement) return;
    
    mediaElement.currentTime = Math.min(mediaElement.currentTime + 10, duration);
  };

  const skipBackward = () => {
    const mediaElement = isVideo ? videoRef.current : audioRef.current;
    if (!mediaElement) return;
    
    mediaElement.currentTime = Math.max(mediaElement.currentTime - 10, 0);
  };

  const toggleFullScreen = () => {
    if (!playerContainerRef.current) return;

    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullScreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
    };
  }, []);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <Card className="overflow-hidden">
      <div 
        ref={playerContainerRef}
        className={`w-full ${isVideo ? "bg-black" : "bg-gray-50"} relative`}
      >
        {isVideo ? (
          <video
            ref={videoRef}
            src={podcast.videoUrl}
            className="w-full aspect-video"
            poster={podcast.thumbnailUrl}
            playsInline
            controlsList="nodownload"
          />
        ) : (
          <div className="aspect-[16/9] md:aspect-[21/9] w-full flex items-center justify-center bg-gradient-to-r from-gray-900 to-gray-700 relative">
            <div 
              className="absolute inset-0 bg-center bg-cover opacity-20 blur-sm"
              style={{ backgroundImage: podcast.thumbnailUrl ? `url(${podcast.thumbnailUrl})` : undefined }}
            />
            
            <div className="z-10 max-w-full px-4 flex flex-col items-center">
              {podcast.thumbnailUrl && (
                <img
                  src={podcast.thumbnailUrl}
                  alt={podcast.title}
                  className="w-32 h-32 md:w-48 md:h-48 object-cover rounded-lg shadow-lg mb-4"
                />
              )}
              <h2 className="text-white text-xl md:text-2xl font-bold text-center mb-2">
                {podcast.title}
              </h2>
              <p className="text-gray-200 text-sm md:text-base text-center max-w-md">
                {podcast.creatorName}
              </p>
            </div>
            
            <audio
              ref={audioRef}
              src={podcast.audioUrl}
              className="hidden"
            />
          </div>
        )}

        <div className="p-4 bg-white">
          <div className="flex items-center mb-2">
            <Slider 
              value={[duration > 0 ? (currentTime / duration) * 100 : 0]}
              onValueChange={handleSliderChange}
              max={100}
              step={0.1}
              className="mr-2"
            />
            <span className="text-xs text-gray-500 min-w-[80px] text-right">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={skipBackward}
                className="p-2 rounded-full hover:bg-gray-100"
                aria-label="Skip backward 10 seconds"
              >
                <SkipBack className="h-5 w-5" />
              </button>
              
              <button
                type="button"
                onClick={togglePlay}
                className="p-2 rounded-full hover:bg-gray-100"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <PauseCircle className="h-8 w-8 text-primary" />
                ) : (
                  <PlayCircle className="h-8 w-8 text-primary" />
                )}
              </button>
              
              <button
                type="button"
                onClick={skipForward}
                className="p-2 rounded-full hover:bg-gray-100"
                aria-label="Skip forward 10 seconds"
              >
                <SkipForward className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={toggleMute}
                className="p-2 rounded-full hover:bg-gray-100"
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? (
                  <VolumeX className="h-5 w-5" />
                ) : (
                  <Volume2 className="h-5 w-5" />
                )}
              </button>
              
              <Slider 
                value={[isMuted ? 0 : volume * 100]}
                onValueChange={handleVolumeChange}
                max={100}
                step={1}
                className="w-24"
              />
              
              {isVideo && (
                <button
                  type="button"
                  onClick={toggleFullScreen}
                  className="p-2 rounded-full hover:bg-gray-100"
                  aria-label={isFullScreen ? "Exit fullscreen" : "Enter fullscreen"}
                >
                  {isFullScreen ? (
                    <Minimize2 className="h-5 w-5" />
                  ) : (
                    <Maximize2 className="h-5 w-5" />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PodcastPlayer;
