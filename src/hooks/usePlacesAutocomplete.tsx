
import React, { useState, useEffect, useRef } from 'react';

interface PlacesAutocompleteProps {
  onPlaceSelect: (place: google.maps.places.PlaceResult) => void;
}

declare global {
  interface Window {
    initializeGoogleMapsCallback: () => void;
    google: {
      maps: {
        places: {
          Autocomplete: new (input: HTMLInputElement, options?: google.maps.places.AutocompleteOptions) => google.maps.places.Autocomplete;
        };
        Map: any;
        Marker: any;
      };
    };
  }
}

export const usePlacesAutocomplete = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    // Check if Google Maps API is already loaded
    if (window.google && window.google.maps && window.google.maps.places) {
      setIsLoaded(true);
      return;
    }

    // Initialize Google Maps API
    window.initializeGoogleMapsCallback = () => {
      setIsLoaded(true);
    };

    // Load Google Maps API script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.GOOGLE_MAPS_API_KEY || "YOUR_API_KEY_HERE"}&libraries=places&callback=initializeGoogleMapsCallback`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    return () => {
      window.initializeGoogleMapsCallback = () => {};
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  const initializeAutocomplete = (input: HTMLInputElement) => {
    if (!isLoaded || !input) return;

    inputRef.current = input;
    autocompleteRef.current = new window.google.maps.places.Autocomplete(input, {
      types: ['address'],
    });
  };

  const getPlace = (): Promise<google.maps.places.PlaceResult> => {
    return new Promise((resolve, reject) => {
      if (!autocompleteRef.current) {
        reject(new Error('Autocomplete not initialized'));
        return;
      }

      const place = autocompleteRef.current.getPlace();
      if (place && place.formatted_address) {
        resolve(place);
      } else {
        reject(new Error('No place selected'));
      }
    });
  };

  return {
    isLoaded,
    initializeAutocomplete,
    getPlace,
    inputRef,
  };
};

export const PlacesAutocomplete: React.FC<PlacesAutocompleteProps> = ({ onPlaceSelect }) => {
  const { isLoaded, initializeAutocomplete } = usePlacesAutocomplete();
  const inputRef = useRef<HTMLInputElement | null>(null);
  
  useEffect(() => {
    if (isLoaded && inputRef.current) {
      const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ['address'],
      });
      
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place && place.formatted_address) {
          onPlaceSelect(place);
        }
      });
    }
  }, [isLoaded, onPlaceSelect]);

  return (
    <input
      ref={(ref) => {
        inputRef.current = ref;
        if (ref && isLoaded) {
          initializeAutocomplete(ref);
        }
      }}
      type="text"
      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
      placeholder="Enter event location"
    />
  );
};
