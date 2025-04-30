
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchEventsByLocation, EventWithDistance } from '@/services/searchService';
import { useLocation } from '@/contexts/LocationContext';

export const useEventsByLocation = (radius: number = 50) => {
  const { selectedLocation } = useLocation();
  const [events, setEvents] = useState<EventWithDistance[]>([]);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['eventsByLocation', selectedLocation?.lat, selectedLocation?.lng, radius],
    queryFn: () => {
      if (!selectedLocation) return Promise.resolve([]);
      return searchEventsByLocation(
        selectedLocation.lat,
        selectedLocation.lng,
        radius
      );
    },
    enabled: !!selectedLocation,
  });

  useEffect(() => {
    if (data) {
      setEvents(data);
    } else {
      setEvents([]);
    }
  }, [data]);

  // Refresh when location changes
  useEffect(() => {
    if (selectedLocation) {
      refetch();
    }
  }, [selectedLocation, refetch]);

  return { events, isLoading, error, refetch };
};
