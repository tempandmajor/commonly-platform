import React, { useState, useRef, useEffect } from "react";
import { format } from "date-fns";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Share2,
  Clock,
  Headphones,
  Video,
  MusicIcon,
  CalendarIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Podcast } from "@/types/podcast";
import { formatDuration } from "@/lib/utils";
import { incrementListenCount } from "@/services/podcastService";

const PodcastPlayer = ({ podcast }: { podcast: Podcast }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize audio element
    if (!audioRef.current) {
      const audio = new Audio(podcast.type === "audio" ? podcast.audioUrl : podcast.videoUrl);
      audio.volume = volume;
      audio.addEventListener("loadedmetadata", () => {
        setDuration(audio.duration);
      });
      audio.addEventListener("timeupdate", handleTimeUpdate);
      audio.addEventListener("ended", () => setIsPlaying(false));
      audioRef.current = audio;
    }

    // Increment listen count after 5 seconds of playback
    let listenTimeout: NodeJS.Timeout;
    if (isPlaying) {
      listenTimeout = setTimeout(() => {
        incrementListenCount(podcast.id).catch(console.error);
      }, 5000);
    }

    return () => {
      if (listenTimeout) {
        clearTimeout(listenTimeout);
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener("timeupdate", handleTimeUpdate);
      }
    };
  }, [isPlaying, podcast.id, podcast.audioUrl, podcast.videoUrl, podcast.type, volume]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    if (newVolume === 0) {
      setIsMuted(true);
    } else {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume;
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const skipBackward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10);
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const skipForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(
        duration,
        audioRef.current.currentTime + 10
      );
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: podcast.title,
          text: podcast.description,
          url: window.location.href,
        });
      } else {
        // Fallback for browsers that don't support the Web Share API
        navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard!");
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Player header with podcast info */}
      <div className="p-4 md:p-6 flex flex-col md:flex-row gap-4">
        <div className="flex-shrink-0">
          <div className="relative w-20 h-20 md:w-32 md:h-32 overflow-hidden rounded-md">
            {podcast.thumbnailUrl ? (
              <img
                src={podcast.thumbnailUrl}
                alt={podcast.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg";
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <MusicIcon className="h-12 w-12 text-gray-400" />
              </div>
            )}

            {podcast.type === "video" && !showVideo && (
              <Button
                size="sm"
                className="absolute inset-0 m-auto w-10 h-10 rounded-full bg-black/60 hover:bg-black/70"
                onClick={() => setShowVideo(true)}
              >
                <Play className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>

        <div className="flex-1">
          <h2 className="text-xl font-bold line-clamp-2">{podcast.title}</h2>
          <p className="text-sm text-gray-500 mt-1">{podcast.creatorName}</p>
          
          <div className="flex items-center mt-2 space-x-2">
            <Badge variant="outline" className="text-xs">
              {podcast.type === "audio" ? (
                <Headphones className="h-3 w-3 mr-1" />
              ) : (
                <Video className="h-3 w-3 mr-1" />
              )}
              {podcast.type.charAt(0).toUpperCase() + podcast.type.slice(1)}
            </Badge>
            
            <div className="text-xs text-gray-500 flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {formatDuration(podcast.duration)}
            </div>
            
            <div className="text-xs text-gray-500 flex items-center">
              <CalendarIcon className="h-3 w-3 mr-1" />
              {format(new Date(podcast.createdAt), "MMM d, yyyy")}
            </div>
          </div>

          <p className="text-sm line-clamp-3 mt-2">{podcast.description}</p>
        </div>
      </div>

      {/* Video player (if podcast is video type and showVideo is true) */}
      {podcast.type === "video" && showVideo && podcast.videoUrl && (
        <div className="w-full aspect-video bg-black">
          <video
            ref={audioRef as React.RefObject<HTMLVideoElement>}
            src={podcast.videoUrl}
            className="w-full h-full"
            controls
            autoPlay
            onTimeUpdate={handleTimeUpdate}
          />
        </div>
      )}

      {/* Audio player controls (if podcast is audio type or video is not showing) */}
      {(podcast.type === "audio" || !showVideo) && (
        <div>
          {/* Waveform visualization (placeholder) */}
          <div className="h-16 bg-gray-50 px-4 flex items-center">
            <div className="w-full h-8 bg-gray-100 rounded-md overflow-hidden">
              <div
                className="h-full bg-blue-500"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Audio controls */}
          <div className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={skipBackward}
                title="Skip backward 10 seconds"
              >
                <SkipBack className="h-5 w-5" />
              </Button>

              <Button
                variant="default"
                size="icon"
                className="rounded-full"
                onClick={togglePlayPause}
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={skipForward}
                title="Skip forward 10 seconds"
              >
                <SkipForward className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex-1 px-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">
                  {formatDuration(currentTime)}
                </span>
                <Slider
                  value={[currentTime]}
                  min={0}
                  max={duration || 100}
                  step={1}
                  onValueChange={handleSeek}
                  className="flex-1"
                />
                <span className="text-xs text-gray-500">
                  {formatDuration(duration)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMute}
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? (
                  <VolumeX className="h-5 w-5" />
                ) : (
                  <Volume2 className="h-5 w-5" />
                )}
              </Button>

              <Slider
                value={[isMuted ? 0 : volume]}
                min={0}
                max={1}
                step={0.01}
                onValueChange={handleVolumeChange}
                className="w-24"
              />
            </div>
          </div>
        </div>
      )}

      {/* Sharing options */}
      <div className="p-4 border-t">
        <Button
          variant="outline"
          size="sm"
          onClick={handleShare}
          className="flex items-center gap-2"
        >
          <Share2 className="h-4 w-4" />
          Share Podcast
        </Button>
      </div>
    </div>
  );
};

export default PodcastPlayer;
