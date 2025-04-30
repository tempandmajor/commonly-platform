import React from "react";
import { Podcast } from "@/types/podcast";
import { formatDistanceToNow } from "date-fns";
import {
  Clock,
  Headphones,
  MusicIcon,
  PlayCircle,
  Video,
} from "lucide-react";
import { formatDuration } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const PodcastCard = ({ podcast, onClick }: { podcast: Podcast; onClick?: () => void }) => {
  // Placeholder for additional logic if needed

  // Format the relative time
  const relativeTime = formatDistanceToNow(new Date(podcast.createdAt), {
    addSuffix: true,
  });

  return (
    <div
      className={`group relative flex flex-col overflow-hidden rounded-lg border ${
        onClick ? "cursor-pointer" : ""
      }`}
      onClick={onClick}
    >
      {/* Podcast thumbnail */}
      <div className="aspect-square w-full overflow-hidden bg-gray-100 relative">
        {podcast.thumbnailUrl ? (
          <img
            src={podcast.thumbnailUrl}
            alt={podcast.title}
            className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.src = "/placeholder.svg";
            }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-100">
            <MusicIcon className="h-12 w-12 text-gray-400" />
          </div>
        )}

        {/* Podcast type badge */}
        <div className="absolute top-2 left-2">
          <Badge
            variant="secondary"
            className={`${
              podcast.type === "audio" ? "bg-indigo-100" : "bg-rose-100"
            }`}
          >
            {podcast.type === "audio" ? (
              <Headphones className="h-3 w-3 mr-1" />
            ) : (
              <Video className="h-3 w-3 mr-1" />
            )}
            {podcast.type.charAt(0).toUpperCase() + podcast.type.slice(1)}
          </Badge>
        </div>
      </div>

      {/* Podcast info */}
      <div className="flex flex-1 flex-col space-y-2 p-4">
        <h3 className="text-sm font-medium text-gray-900 line-clamp-1">
          {podcast.title}
        </h3>
        <p className="text-xs text-gray-500 line-clamp-2">
          {podcast.description}
        </p>

        <div className="mt-auto pt-2">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                <PlayCircle className="h-3.5 w-3.5 mr-1 text-gray-400" />
                {podcast.listens || 0}
              </div>
              <div className="flex items-center">
                <Clock className="h-3.5 w-3.5 mr-1 text-gray-400" />
                {formatDuration(podcast.duration)}
              </div>
            </div>
            <div>{relativeTime}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PodcastCard;
