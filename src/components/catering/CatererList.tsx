
import React, { useState } from 'react';
import { useCatererSearch } from '@/hooks/useCatererSearch';
import CatererCard from './CatererCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { PlacesAutocomplete } from '@/hooks/usePlacesAutocomplete';
import { MapPin, Filter, UtensilsCrossed } from 'lucide-react';

const CatererList: React.FC = () => {
  const { 
    caterers, 
    searchParams, 
    updateSearch, 
    loadMore, 
    hasMore, 
    isLoading 
  } = useCatererSearch();
  
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null);
  
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

  const cuisineTypes = [
    "American", "Italian", "Mexican", "Asian", "Mediterranean", 
    "Indian", "BBQ", "Vegetarian", "Desserts", "Breakfast"
  ];

  const handleCuisineSelect = (cuisine: string) => {
    const newCuisine = selectedCuisine === cuisine ? null : cuisine;
    setSelectedCuisine(newCuisine);
    updateSearch({ cuisineType: newCuisine });
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
          <div className="mt-4 space-y-4">
            {/* Cuisine Type Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">Cuisine Type</label>
              <div className="flex flex-wrap gap-2">
                {cuisineTypes.map(cuisine => (
                  <div
                    key={cuisine}
                    className={`cursor-pointer rounded-full px-3 py-1 text-sm transition-all ${
                      selectedCuisine === cuisine
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    }`}
                    onClick={() => handleCuisineSelect(cuisine)}
                  >
                    {cuisine}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Price Range Filter */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">Price Range</label>
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
            
            {/* Guest Count Filter */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">Guest Count</label>
              <div className="pt-2 px-2">
                <Slider
                  defaultValue={[10, 100]}
                  max={500}
                  step={10}
                  onValueChange={(value) => {
                    updateSearch({ 
                      minGuests: value[0], 
                      maxGuests: value[1] 
                    });
                  }}
                />
                <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                  <span>10 guests</span>
                  <span>500+ guests</span>
                </div>
              </div>
            </div>
            
            {/* Service Type Filter */}
            <div>
              <label className="block text-sm font-medium mb-2">Service Type</label>
              <div className="flex flex-wrap gap-2">
                {['pickup', 'delivery', 'fullService'].map((service) => {
                  const serviceLabels: Record<string, string> = {
                    pickup: 'Pickup',
                    delivery: 'Delivery',
                    fullService: 'Full Service'
                  };
                  
                  return (
                    <div
                      key={service}
                      className={`cursor-pointer rounded-full px-3 py-1 text-sm transition-all ${
                        searchParams.serviceType === service
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                      }`}
                      onClick={() => updateSearch({
                        serviceType: searchParams.serviceType === service 
                          ? null 
                          : service as 'pickup' | 'delivery' | 'fullService'
                      })}
                    >
                      {serviceLabels[service]}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Results */}
      {isLoading && caterers.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-[300px] bg-gray-100 animate-pulse rounded-md"></div>
          ))}
        </div>
      ) : caterers.length === 0 ? (
        <div className="text-center py-10">
          <div className="inline-flex rounded-full p-4 bg-muted mb-4">
            <UtensilsCrossed className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium">No caterers found</h3>
          <p className="text-muted-foreground mt-2">Try adjusting your search criteria</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {caterers.map(caterer => (
              <CatererCard key={caterer.id} caterer={caterer} />
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

export default CatererList;
