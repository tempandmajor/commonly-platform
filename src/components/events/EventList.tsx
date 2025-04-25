
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getPublishedEvents } from '@/services/eventService';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

const EventList = () => {
  const { data: events, isLoading, error } = useQuery({
    queryKey: ['events'],
    queryFn: getPublishedEvents,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="w-full">
            <CardHeader>
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2 mt-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500">
        Error loading events. Please try again later.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {events?.map((event) => (
        <Link to={`/events/${event.id}`} key={event.id}>
          <Card className="h-full hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="line-clamp-1">{event.title}</CardTitle>
              <CardDescription>
                {format(new Date(event.date), 'PPP')} • {event.location}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div 
                className="w-full h-32 bg-cover bg-center rounded-md mb-4"
                style={{ backgroundImage: `url(${event.imageUrl})` }}
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
          </Card>
        </Link>
      ))}
    </div>
  );
};

export default EventList;
