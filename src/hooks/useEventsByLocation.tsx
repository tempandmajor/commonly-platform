
import { useState, useEffect } from "react";
import { LocationSearchParams, searchEventsByLocation, EventWithDistance } from "@/services/searchService";

export const useEventsByLocation = (params: LocationSearchParams) => {
  const [events, setEvents] = useState<EventWithDistance[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const results = await searchEventsByLocation(params);
        setEvents(results);
        setError(null);
      } catch (err) {
        console.error("Error fetching events by location:", err);
        setError("Failed to fetch events near your location");
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [params.latitude, params.longitude, params.radius, params.limit]);

  return { events, loading, error };
};

export default useEventsByLocation;
