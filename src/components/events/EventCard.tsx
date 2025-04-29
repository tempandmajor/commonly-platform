
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Heart, Share2, Users, Video, Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { Event } from '@/types/event';
import { useAuth } from '@/contexts/AuthContext';
import { likeEvent, unlikeEvent, shareEvent, checkIfUserLiked } from '@/services/admin/eventService';
import { supabase } from '@/integrations/supabase/client';

interface EventCardProps {
  event: Event;
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const { currentUser } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(event.likesCount || 0);
  const [sharesCount, setSharesCount] = useState(event.sharesCount || 0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLikeStatus = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }
      
      try {
        const liked = await checkIfUserLiked(event.id, currentUser.uid);
        setIsLiked(liked);
      } catch (error) {
        console.error('Error checking like status:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkLikeStatus();
  }, [event.id, currentUser]);

  // Set up realtime subscription for likes and shares
  useEffect(() => {
    const channel = supabase
      .channel('event-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'events',
          filter: `id=eq.${event.id}`,
        },
        (payload) => {
          if (payload.new && typeof payload.new === 'object') {
            const updatedEvent = payload.new as any;
            if (updatedEvent.likes_count !== undefined) {
              setLikesCount(updatedEvent.likes_count);
            }
            if (updatedEvent.shares_count !== undefined) {
              setSharesCount(updatedEvent.shares_count);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [event.id]);

  const handleLike = async () => {
    if (!currentUser) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to like this event",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isLiked) {
        await unlikeEvent(event.id, currentUser.uid);
        setIsLiked(false);
        setLikesCount(prev => Math.max(0, prev - 1));
      } else {
        await likeEvent(event.id, currentUser.uid);
        setIsLiked(true);
        setLikesCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: "Error",
        description: "Failed to process your like",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    if (!currentUser) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to share this event",
        variant: "destructive",
      });
      return;
    }

    try {
      // Copy share URL
      const shareUrl = `${window.location.origin}/events/${event.id}`;
      await navigator.clipboard.writeText(shareUrl);
      
      // Record share
      await shareEvent(event.id, currentUser.uid);
      setSharesCount(prev => prev + 1);
      
      toast({
        title: "Link Copied",
        description: "Event link has been copied to clipboard",
      });
    } catch (error) {
      console.error('Error sharing event:', error);
      toast({
        title: "Error",
        description: "Failed to share the event",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="h-full hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="line-clamp-1">{event.title}</CardTitle>
            <CardDescription>
              {format(new Date(event.date), 'PPP')}
              {event.isVirtual ? ' • Virtual Event' : ` • ${event.location}`}
            </CardDescription>
          </div>
          {event.isVirtual && (
            <Badge variant="outline" className="bg-blue-50">
              <Video className="h-3 w-3 mr-1" /> Virtual
            </Badge>
          )}
        </div>
      </CardHeader>
      <Link to={`/events/${event.id}`}>
        <CardContent>
          <div 
            className="w-full h-32 bg-cover bg-center rounded-md mb-4"
            style={{ backgroundImage: `url(${event.imageUrl || '/placeholder.svg'})` }}
          />
          <p className="text-sm text-gray-600 line-clamp-2">
            {event.description}
          </p>
          <div className="mt-4 flex justify-between items-center">
            <span className="text-sm font-medium">
              {event.isFree ? 'Free' : `$${event.price}`}
            </span>
            <span className="text-sm text-gray-500">
              By {event.organizer}
            </span>
          </div>
        </CardContent>
      </Link>
      <CardFooter className="flex justify-between border-t pt-4">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center gap-1 px-2"
            onClick={(e) => {
              e.preventDefault();
              handleLike();
            }}
            disabled={loading}
          >
            <Heart className={`h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
            {loading ? <Skeleton className="h-4 w-8" /> : likesCount}
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center gap-1 px-2"
            onClick={(e) => {
              e.preventDefault();
              handleShare();
            }}
          >
            <Share2 className="h-4 w-4" />
            {sharesCount}
          </Button>
        </div>

        {event.isVirtual && event.streamStartedAt && !event.streamEndedAt && (
          <Badge variant="destructive" className="flex items-center gap-1">
            <Clock className="h-3 w-3" /> Live Now
          </Badge>
        )}

        {event.isPrivate && (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Users className="h-3 w-3" /> Private
          </Badge>
        )}
      </CardFooter>
    </Card>
  );
};

export default EventCard;
