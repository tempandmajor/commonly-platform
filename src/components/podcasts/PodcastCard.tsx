
import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Podcast } from "@/types/podcast";
import { Headphones, Video, PlayCircle, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface PodcastCardProps {
  podcast: Podcast;
}

const PodcastCard: React.FC<PodcastCardProps> = ({ podcast }) => {
  const formatDate = (timestamp: any): string => {
    try {
      const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return "Unknown date";
    }
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <Card className="h-full hover:shadow-md transition-shadow">
      <Link to={`/podcasts/${podcast.id}`} className="block h-full">
        <CardHeader className="p-4 pb-2 relative">
          <div className="aspect-video rounded-md overflow-hidden bg-gray-100 mb-3">
            {podcast.thumbnailUrl ? (
              <img
                src={podcast.thumbnailUrl}
                alt={podcast.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                <PlayCircle className="h-12 w-12 text-gray-400" />
              </div>
            )}
            
            <div className="absolute top-6 right-6">
              <Badge variant={podcast.type === "audio" ? "outline" : "secondary"}>
                {podcast.type === "audio" ? (
                  <Headphones className="h-3 w-3 mr-1" />
                ) : (
                  <Video className="h-3 w-3 mr-1" />
                )}
                {podcast.type}
              </Badge>
            </div>
          </div>
          
          <CardTitle className="text-lg font-medium line-clamp-2">{podcast.title}</CardTitle>
        </CardHeader>
        
        <CardContent className="p-4 pt-0">
          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
            {podcast.description}
          </p>
          
          <div className="flex items-center mb-2">
            <Avatar className="h-6 w-6 mr-2">
              <AvatarFallback>
                {podcast.creatorName?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium truncate">
              {podcast.creatorName}
            </span>
          </div>
        </CardContent>
        
        <CardFooter className="p-4 pt-0 flex justify-between text-xs text-muted-foreground">
          <div className="flex items-center">
            <Calendar className="h-3 w-3 mr-1" />
            {formatDate(podcast.createdAt)}
          </div>
          
          <div className="flex items-center">
            <span>{formatDuration(podcast.duration)}</span>
            <span className="mx-2">•</span>
            <span>{podcast.listens} listens</span>
          </div>
        </CardFooter>
      </Link>
    </Card>
  );
};

export default PodcastCard;
