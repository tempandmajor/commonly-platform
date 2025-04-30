
import React, { useState } from 'react';
import { MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { PlacesAutocomplete } from '@/hooks/usePlacesAutocomplete';
import { useLocation } from '@/contexts/LocationContext';

export function LocationSelector() {
  const [open, setOpen] = useState(false);
  const { selectedLocationName, updateSelectedLocation, currentLocation } = useLocation();

  const handlePlaceSelect = (place: google.maps.places.PlaceResult) => {
    if (place.geometry?.location) {
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      
      updateSelectedLocation(
        { lat, lng },
        place.formatted_address || place.name || "Selected location"
      );
      
      setOpen(false);
    }
  };

  const handleUseCurrentLocation = () => {
    if (currentLocation) {
      updateSelectedLocation(currentLocation, "Current Location");
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2 max-w-[150px] md:max-w-[200px]">
          <MapPin className="h-4 w-4" />
          <span className="truncate">{selectedLocationName || "Set location"}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <h4 className="font-medium">Select location</h4>
          <div className="space-y-2">
            <PlacesAutocomplete onPlaceSelect={handlePlaceSelect} />
          </div>
          {currentLocation && (
            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleUseCurrentLocation}
            >
              Use current location
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
