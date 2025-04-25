
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getVenues, searchVenuesByLocation } from '@/services/venueService';
import { Venue } from '@/types/venue';

interface UseVenueSearchProps {
  initialLocation?: { lat: number, lng: number };
  initialRadius?: number;
}

export const useVenueSearch = (props?: UseVenueSearchProps) => {
  const [searchParams, setSearchParams] = useState({
    location: props?.initialLocation,
    radius: props?.initialRadius || 50, // Default 50km radius
    lastVisible: null,
    capacityMin: 0,
    capacityMax: null as number | null,
    priceMin: 0,
    priceMax: null as number | null,
    venueType: null as string | null,
  });
  
  const [venues, setVenues] = useState<Venue[]>([]);
  const [hasMore, setHasMore] = useState(true);
  
  // Fetch venues based on search criteria
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['venues', searchParams],
    queryFn: async () => {
      if (searchParams.location) {
        // Search by location
        return searchVenuesByLocation(
          searchParams.location.lat,
          searchParams.location.lng,
          searchParams.radius
        );
      } else {
        // Regular fetch
        const result = await getVenues(searchParams.lastVisible);
        return {
          venues: result.venues,
          lastVisible: result.lastVisible
        };
      }
    },
    enabled: true
  });
  
  // Update venues when data changes
  useEffect(() => {
    if (data) {
      if (Array.isArray(data)) {
        // For location search results
        const filteredVenues = filterVenues(data);
        setVenues(filteredVenues);
        setHasMore(filteredVenues.length > 0);
      } else {
        // For regular pagination results
        const filteredVenues = filterVenues(data.venues);
        setVenues(prevVenues => {
          if (searchParams.lastVisible === null) {
            return filteredVenues;
          } else {
            return [...prevVenues, ...filteredVenues];
          }
        });
        setHasMore(filteredVenues.length > 0 && !!data.lastVisible);
      }
    }
  }, [data]);
  
  // Filter venues based on capacity, price, etc.
  const filterVenues = (venueList: Venue[]) => {
    return venueList.filter(venue => {
      let isMatch = true;
      
      // Filter by capacity
      if (searchParams.capacityMin !== null && venue.capacity < searchParams.capacityMin) {
        isMatch = false;
      }
      
      if (searchParams.capacityMax !== null && venue.capacity > searchParams.capacityMax) {
        isMatch = false;
      }
      
      // Filter by price
      if (searchParams.priceMin !== null && venue.pricing.hourlyRate < searchParams.priceMin) {
        isMatch = false;
      }
      
      if (searchParams.priceMax !== null && venue.pricing.hourlyRate > searchParams.priceMax) {
        isMatch = false;
      }
      
      // Filter by venue type
      if (searchParams.venueType !== null && venue.type !== searchParams.venueType) {
        isMatch = false;
      }
      
      return isMatch;
    });
  };
  
  // Load more venues
  const loadMore = () => {
    if (data && !Array.isArray(data) && data.lastVisible) {
      setSearchParams(prev => ({
        ...prev,
        lastVisible: data.lastVisible
      }));
    }
  };
  
  // Update search parameters
  const updateSearch = (newParams: Partial<typeof searchParams>) => {
    setSearchParams(prev => ({
      ...prev,
      ...newParams,
      lastVisible: null // Reset pagination when search params change
    }));
  };
  
  return {
    venues,
    searchParams,
    updateSearch,
    loadMore,
    hasMore,
    isLoading,
    error,
    refetch
  };
};
