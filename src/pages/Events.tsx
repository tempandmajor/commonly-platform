
import React from "react";
import { Link } from "react-router-dom";
import { useEventsByLocation } from "@/hooks/useEventsByLocation";
import { LocationSearchParams } from "@/types/search";
import { CalendarIcon } from "lucide-react";

const Events: React.FC = () => {
  // Default location parameters (e.g., San Francisco)
  const defaultLocation: LocationSearchParams = {
    latitude: 37.7749,
    longitude: -122.4194,
    radius: 50, // kilometers
    limit: 20 // Number of events to fetch
  };

  const { events, loading, error } = useEventsByLocation(defaultLocation);

  if (loading) {
    return <div className="text-center p-4">Loading events...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Events Near You</h1>
      
      {events.length === 0 ? (
        <div className="text-center p-4">No events found near your location.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((event) => (
            <div key={event.id} className="rounded-lg shadow-md overflow-hidden">
              
              <div className="h-40 overflow-hidden rounded-t-lg">
                {event.imageUrl ? (
                  <img 
                    src={event.imageUrl} 
                    alt={event.title} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <CalendarIcon className="h-10 w-10 text-gray-400" />
                  </div>
                )}
              </div>

              <div className="p-4">
                <h2 className="text-lg font-semibold mb-2">{event.title}</h2>
                <p className="text-gray-600 mb-2">{event.date}</p>
                <p className="text-gray-700">{event.description}</p>
                <Link to={`/events/${event.id}`} className="inline-block mt-4 text-blue-500 hover:underline">
                  Learn More
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Events;
