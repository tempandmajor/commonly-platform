
import React, { useState } from "react";
import EventList from "../components/events/EventList";
import Navbar from "../components/layout/Navbar";
import { useLocation } from "@/contexts/LocationContext";
import { useEventsByLocation } from "@/hooks/useEventsByLocation";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { MapPin, SlidersHorizontal } from "lucide-react";
import { Event } from "@/types/event";

// Define interface for events with distance as returned from the API
interface EventWithDistance {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  date: string;
  location: string;
  location_lat: number;
  location_lng: number;
  distance_km: number;
}

const Events = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [radius, setRadius] = useState<number>(50);
  const { selectedLocationName } = useLocation();
  const { events: eventsWithDistance, isLoading } = useEventsByLocation(radius);
  
  // Transform EventWithDistance to Event type needed by EventList
  const events: Event[] = eventsWithDistance.map(event => ({
    id: event.id,
    title: event.title,
    description: event.description || "",
    imageUrl: event.image_url || "",
    date: event.date,
    location: event.location,
    price: 0, // Default values for required fields from Event type
    organizer: "",
    organizerId: "",
    published: true,
    category: "",
    eventType: 'single',
    ageRestriction: 'all',
    isPrivate: false,
    isFree: true,
    referralPercentage: 0
  }));

  return (
    <>
      <Navbar />
      <main className="airbnb-container mx-auto px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold">Events</h1>
          <p className="text-gray-600 mt-2">
            Discover and join upcoming events in your area
          </p>
        </div>
        
        {/* Location information and filters */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center text-gray-600">
            <MapPin className="h-5 w-5 mr-2" />
            <span>
              {selectedLocationName ? `Events near ${selectedLocationName}` : 'All events'}
            </span>
          </div>
          
          <Button 
            variant="outline" 
            size="sm"
            className="flex items-center gap-2 self-start rounded-full border border-gray-300 shadow-sm hover:shadow-md"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="h-4 w-4" />
            {showFilters ? 'Hide filters' : 'Show filters'}
          </Button>
        </div>
        
        {showFilters && (
          <div className="bg-white p-6 rounded-xl shadow-sm border mb-8">
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="font-medium">Search radius</label>
                  <span className="text-sm font-medium bg-gray-100 px-2 py-1 rounded-full">{radius} km</span>
                </div>
                <Slider
                  value={[radius]}
                  min={5}
                  max={500}
                  step={5}
                  onValueChange={(value) => setRadius(value[0])}
                  className="py-4"
                />
                <div className="flex justify-between mt-1 text-xs text-gray-500">
                  <span>5 km</span>
                  <span>500 km</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <EventList events={events} />
      </main>
    </>
  );
};

export default Events;
