
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getVenues } from '@/services/venueService';
import VenueCard from '@/components/venues/VenueCard';
import { Venue } from '@/types/venue';
import { Button } from '@/components/ui/button';
import { SlidersHorizontal } from 'lucide-react';

const VenueList = () => {
  const [filteredVenues, setFilteredVenues] = useState<Venue[]>([]);
  
  const { data: venues, isLoading } = useQuery({
    queryKey: ['venues'],
    queryFn: () => getVenues().then(res => res.venues)
  });

  useEffect(() => {
    if (venues) {
      setFilteredVenues(venues);
    }
  }, [venues]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array(6).fill(null).map((_, i) => (
          <div key={i} className="h-[320px] bg-gray-100 rounded-lg animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (!venues || venues.length === 0) {
    return (
      <div className="text-center py-16">
        <SlidersHorizontal className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Venues Available</h3>
        <p className="text-gray-500 mb-6 max-w-md mx-auto">
          We couldn't find any venues. Check back later or try adjusting your search criteria.
        </p>
        <Button>Browse All Locations</Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredVenues.map((venue) => (
        <VenueCard key={venue.id} venue={venue} />
      ))}
      
      {filteredVenues.length >= 6 && (
        <div className="col-span-full mt-6 flex justify-center">
          <Button variant="outline">Load More</Button>
        </div>
      )}
    </div>
  );
};

export default VenueList;
