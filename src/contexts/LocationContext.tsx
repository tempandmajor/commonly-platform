
import React, { createContext, useContext, useState, useEffect } from "react";

interface Coordinates {
  lat: number;
  lng: number;
}

interface LocationContextType {
  currentLocation: Coordinates | null;
  selectedLocation: Coordinates | null;
  selectedLocationName: string;
  updateSelectedLocation: (location: Coordinates | null, name: string) => void;
  isLoadingLocation: boolean;
}

const LocationContext = createContext<LocationContextType>({
  currentLocation: null,
  selectedLocation: null,
  selectedLocationName: "",
  updateSelectedLocation: () => {},
  isLoadingLocation: false,
});

export const useLocation = () => useContext(LocationContext);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLocation, setCurrentLocation] = useState<Coordinates | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Coordinates | null>(null);
  const [selectedLocationName, setSelectedLocationName] = useState<string>("");
  const [isLoadingLocation, setIsLoadingLocation] = useState<boolean>(true);

  // Get user's current location on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCurrentLocation(coords);
          // Initially set selected location to current location
          if (!selectedLocation) {
            setSelectedLocation(coords);
            setSelectedLocationName("Current Location");
          }
          setIsLoadingLocation(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setIsLoadingLocation(false);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
      setIsLoadingLocation(false);
    }
  }, []);

  const updateSelectedLocation = (location: Coordinates | null, name: string) => {
    setSelectedLocation(location);
    setSelectedLocationName(name);
  };

  return (
    <LocationContext.Provider
      value={{
        currentLocation,
        selectedLocation,
        selectedLocationName,
        updateSelectedLocation,
        isLoadingLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};
