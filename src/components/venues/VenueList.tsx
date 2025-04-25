
import React, { useState } from 'react';
import { useVenueSearch } from '@/hooks/useVenueSearch';
import VenueCard from './VenueCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { PlacesAutocomplete } from '@/hooks/usePlacesAutocomplete';
import { MapPin, Filter } from 'lucide-react';

const VenueList: React.FC = () => {
  const { 
    venues, 
    searchParams, 
    updateSearch, 
    loadMore, 
    hasMore, 
    isLoading 
  } = useVenueSearch();
  
  const [filterOpen, setFilterOpen] = useState(false);
  
  const handlePlaceSelect = (place: google.maps.places.PlaceResult) => {
    if (place.geometry?.location) {
      updateSearch({ 
        location: { 
          lat: place.geometry.location.lat(), 
          lng: place.geometry.location.lng() 
        }
      });
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Search Controls */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-grow">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <PlacesAutocomplete onPlaceSelect={handlePlaceSelect} />
          </div>
          
          <Button 
            variant="outline" 
            onClick={() => setFilterOpen(!filterOpen)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" /> Filters
          </Button>
        </div>
        
        {filterOpen && (
          <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Capacity Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Capacity</label>
              <div className="pt-2 px-2">
                <Slider
                  defaultValue={[0, 100]}
                  max={500}
                  step={10}
                  onValueChange={(value) => {
                    updateSearch({ 
                      capacityMin: value[0], 
                      capacityMax: value[1] 
                    });
                  }}
                />
                <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                  <span>0</span>
                  <span>500+ guests</span>
                </div>
              </div>
            </div>
            
            {/* Price Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Hourly Price ($)</label>
              <div className="pt-2 px-2">
                <Slider
                  defaultValue={[0, 1000]}
                  max={1000}
                  step={50}
                  onValueChange={(value) => {
                    updateSearch({ 
                      priceMin: value[0], 
                      priceMax: value[1] 
                    });
                  }}
                />
                <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                  <span>$0</span>
                  <span>$1,000+</span>
                </div>
              </div>
            </div>
            
            {/* Venue Type Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Venue Type</label>
              <div className="grid grid-cols-2 gap-2">
                {['Conference Room', 'Event Hall', 'Studio', 'Office', 'Outdoor', 'Other'].map(type => (
                  <div 
                    key={type}
                    className={`border rounded px-3 py-2 text-sm cursor-pointer ${
                      searchParams.venueType === type ? 'bg-primary/10 border-primary' : ''
                    }`}
                    onClick={() => updateSearch({ 
                      venueType: searchParams.venueType === type ? null : type 
                    })}
                  >
                    {type}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Results */}
      {isLoading && venues.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-[300px] bg-gray-100 animate-pulse rounded-md"></div>
          ))}
        </div>
      ) : venues.length === 0 ? (
        <div className="text-center py-10">
          <h3 className="text-lg font-medium">No venues found</h3>
          <p className="text-muted-foreground mt-2">Try adjusting your search criteria</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {venues.map(venue => (
              <VenueCard key={venue.id} venue={venue} />
            ))}
          </div>
          
          {hasMore && (
            <div className="flex justify-center mt-8">
              <Button 
                variant="outline" 
                onClick={loadMore}
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : 'Load More'}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default VenueList;
