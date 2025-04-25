
import React from 'react';
import { MapPin, Flag, UtensilsCrossed } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CatererLocation } from '@/types/caterer';

interface CatererHeaderProps {
  name: string;
  location: CatererLocation;
  cuisineTypes: string[];
  ownerName: string;
  ownerPhotoURL?: string;
  onReportClick: () => void;
}

export const CatererHeader = ({
  name,
  location,
  cuisineTypes,
  ownerName,
  ownerPhotoURL,
  onReportClick
}: CatererHeaderProps) => {
  return (
    <div>
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">{name}</h1>
          <div className="flex items-center gap-2 mt-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{location.address}, {location.city}, {location.state}</span>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-red-500 hover:bg-red-50 hover:text-red-600"
          onClick={onReportClick}
        >
          <Flag className="h-4 w-4 mr-1" />
          Report
        </Button>
      </div>
      
      {/* Cuisine Types */}
      <div className="flex flex-wrap gap-2 mt-3">
        {cuisineTypes.map((cuisine, index) => (
          <span 
            key={index}
            className="bg-secondary text-secondary-foreground text-xs rounded-full px-2 py-1"
          >
            {cuisine}
          </span>
        ))}
      </div>
      
      {/* Host Info */}
      <div className="flex items-center gap-3 mt-4">
        <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
          {ownerPhotoURL ? (
            <img 
              src={ownerPhotoURL} 
              alt={ownerName} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-primary/10">
              <UtensilsCrossed className="h-6 w-6 text-primary" />
            </div>
          )}
        </div>
        <div>
          <p className="font-medium">By {ownerName}</p>
          <p className="text-sm text-muted-foreground">Catering Service</p>
        </div>
      </div>
    </div>
  );
};
