
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Venue } from '@/types/venue';
import { MapPin, Calendar } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface VenueCardProps {
  venue: Venue;
}

const VenueCard: React.FC<VenueCardProps> = ({ venue }) => {
  // Find primary photo or use first photo
  const primaryPhoto = venue.photos.find(photo => photo.isPrimary) || venue.photos[0];
  const imageUrl = primaryPhoto?.url || '/placeholder.svg';

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <Link to={`/venues/${venue.id}`}>
        <div className="relative h-48 overflow-hidden">
          <img 
            src={imageUrl} 
            alt={venue.name} 
            className="object-cover w-full h-full"
          />
          {venue.isVerified && (
            <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
              Verified
            </div>
          )}
        </div>
      </Link>
      
      <CardHeader className="p-4 pb-0">
        <Link to={`/venues/${venue.id}`} className="hover:underline">
          <h3 className="font-semibold text-lg line-clamp-1">{venue.name}</h3>
        </Link>
        <div className="flex items-center text-muted-foreground text-sm">
          <MapPin className="h-4 w-4 mr-1" />
          <span className="line-clamp-1">
            {venue.location.city}, {venue.location.state}
          </span>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pb-0">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {venue.description}
        </p>
        <div className="mt-2 flex items-center gap-3 text-sm">
          <span className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            Up to {venue.capacity} guests
          </span>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 flex justify-between items-center">
        <div>
          <span className="font-semibold text-lg">
            {formatCurrency(venue.pricing.hourlyRate)}
          </span>
          <span className="text-sm text-muted-foreground">/hour</span>
        </div>
        <div className="text-sm text-muted-foreground">
          {venue.size.value} {venue.size.unit}
        </div>
      </CardFooter>
    </Card>
  );
};

export default VenueCard;
