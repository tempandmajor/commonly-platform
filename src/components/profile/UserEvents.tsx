
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Clock, Users } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  image_url?: string;
  created_by: string;
  published: boolean;
}

interface UserEventsProps {
  userId: string;
}

const UserEvents: React.FC<UserEventsProps> = ({ userId }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserEvents = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('created_by', userId)
          .order('date', { ascending: false });

        if (error) throw error;
        setEvents(data);
      } catch (error) {
        console.error("Error fetching user events:", error);
        toast({
          title: "Error",
          description: "Failed to load events",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserEvents();
  }, [userId, toast]);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      {events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map((event) => (
            <Card key={event.id} className="overflow-hidden">
              <div className="aspect-video relative">
                {event.image_url ? (
                  <img
                    src={event.image_url}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <Calendar className="h-12 w-12 text-gray-400" />
                  </div>
                )}
                {!event.published && (
                  <Badge
                    variant="secondary"
                    className="absolute top-2 right-2"
                  >
                    Draft
                  </Badge>
                )}
              </div>
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold mb-2">{event.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                  {event.description}
                </p>
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                    <span>
                      {event.date ? format(new Date(event.date), 'PPP') : 'Date not set'}
                    </span>
                  </div>
                  {event.location && (
                    <div className="flex items-center text-sm">
                      <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                      <span>{event.location}</span>
                    </div>
                  )}
                </div>
                <div className="mt-4 flex justify-end">
                  <Button variant="outline" size="sm" asChild>
                    <a href={`/events/${event.id}`}>View Details</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-muted-foreground">No events found</p>
        </div>
      )}
    </div>
  );
};

export default UserEvents;
