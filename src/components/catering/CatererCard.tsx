
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Caterer } from '@/types/caterer';
import { MapPin, Users, UtensilsCrossed } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface CatererCardProps {
  caterer: Caterer;
}

const CatererCard: React.FC<CatererCardProps> = ({ caterer }) => {
  // Find primary photo or use first photo
  const primaryPhoto = caterer.photos.find(photo => photo.isPrimary) || caterer.photos[0];
  const imageUrl = primaryPhoto?.url || '/placeholder.svg';

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <Link to={`/catering/${caterer.id}`}>
        <div className="relative h-48 overflow-hidden">
          <img 
            src={imageUrl} 
            alt={caterer.name} 
            className="object-cover w-full h-full"
          />
          {caterer.isVerified && (
            <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
              Verified
            </div>
          )}
        </div>
      </Link>
      
      <CardHeader className="p-4 pb-0">
        <Link to={`/catering/${caterer.id}`} className="hover:underline">
          <h3 className="font-semibold text-lg line-clamp-1">{caterer.name}</h3>
        </Link>
        <div className="flex items-center text-muted-foreground text-sm">
          <MapPin className="h-4 w-4 mr-1" />
          <span className="line-clamp-1">
            {caterer.location.city}, {caterer.location.state}
          </span>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pb-0">
        <div className="flex flex-wrap gap-1 mb-2">
          {caterer.cuisineTypes.slice(0, 3).map((cuisine, index) => (
            <span key={index} className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
              {cuisine}
            </span>
          ))}
          {caterer.cuisineTypes.length > 3 && (
            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
              +{caterer.cuisineTypes.length - 3} more
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {caterer.description}
        </p>
        <div className="mt-2 flex items-center gap-3 text-sm">
          <span className="flex items-center">
            <Users className="h-4 w-4 mr-1" />
            {caterer.services[0]?.minGuests}-{caterer.services[0]?.maxGuests} guests
          </span>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 flex justify-between items-center">
        <div>
          <span className="font-semibold text-lg">
            {formatCurrency(caterer.pricing.minimumOrderAmount)}
          </span>
          <span className="text-sm text-muted-foreground"> min. order</span>
        </div>
        <div className="text-sm flex items-center text-muted-foreground">
          <UtensilsCrossed className="h-4 w-4 mr-1" />
          {caterer.specialties[0] || "Catering"}
        </div>
      </CardFooter>
    </Card>
  );
};

export default CatererCard;
