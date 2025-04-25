
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { getVenue } from '@/services/venueService';
import Navbar from '@/components/layout/Navbar';
import ReportVenueDialog from '@/components/venues/ReportVenueDialog';
import { Button } from '@/components/ui/button';
import { 
  MapPin, Calendar, Image, FileText, 
  DollarSign, Report, Building
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

const VenueDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  
  const { data: venue, isLoading, error } = useQuery({
    queryKey: ['venue', id],
    queryFn: () => getVenue(id!),
    enabled: !!id
  });
  
  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-16 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </>
    );
  }
  
  if (error || !venue) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold mb-4">Venue not found</h2>
          <p className="text-muted-foreground mb-8">The venue you're looking for doesn't exist or has been removed.</p>
          <Link to="/venues">
            <Button>Browse Other Venues</Button>
          </Link>
        </div>
      </>
    );
  }
  
  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="relative h-[60vh] md:h-[50vh] overflow-hidden rounded-xl mb-8">
          <img 
            src={venue.photos[selectedPhotoIndex]?.url || '/placeholder.svg'} 
            alt={venue.name}
            className="w-full h-full object-cover"
          />
          
          {/* Photo Gallery Navigator */}
          <div className="absolute bottom-4 left-4 right-4 flex justify-center">
            <div className="bg-black/70 rounded-lg p-2 flex gap-2 overflow-x-auto max-w-full">
              {venue.photos.map((photo, index) => (
                <div 
                  key={photo.id}
                  className={`w-16 h-16 cursor-pointer rounded overflow-hidden transition-all ${
                    index === selectedPhotoIndex ? 'ring-2 ring-white' : 'opacity-70'
                  }`}
                  onClick={() => setSelectedPhotoIndex(index)}
                >
                  <img 
                    src={photo.url} 
                    alt={photo.caption || `Photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
          
          {/* Badges */}
          <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
            {venue.isVerified && (
              <div className="bg-green-500 text-white px-3 py-1 rounded-full font-medium text-sm">
                Verified Venue
              </div>
            )}
          </div>
        </div>
        
        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold">{venue.name}</h1>
                  <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{venue.location.address}, {venue.location.city}, {venue.location.state}</span>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-red-500 hover:bg-red-50 hover:text-red-600"
                  onClick={() => setReportDialogOpen(true)}
                >
                  <Report className="h-4 w-4 mr-1" />
                  Report
                </Button>
              </div>
              
              {/* Host Info */}
              <div className="flex items-center gap-3 mt-4">
                <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
                  {venue.ownerPhotoURL ? (
                    <img 
                      src={venue.ownerPhotoURL} 
                      alt={venue.ownerName} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/10">
                      <Building className="h-6 w-6 text-primary" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-medium">Hosted by {venue.ownerName}</p>
                  <p className="text-sm text-muted-foreground">Space Host</p>
                </div>
              </div>
            </div>
            
            {/* Details */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pb-4 border-b">
              <div>
                <p className="text-sm text-muted-foreground">Venue Type</p>
                <p className="font-medium">{venue.type}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Capacity</p>
                <p className="font-medium">Up to {venue.capacity} guests</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Size</p>
                <p className="font-medium">{venue.size.value} {venue.size.unit}</p>
              </div>
            </div>
            
            {/* Description */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Description
              </h2>
              <p className="text-muted-foreground whitespace-pre-line">
                {venue.description}
              </p>
            </div>
            
            {/* Amenities */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2">
                {venue.amenities.map(amenity => (
                  <div key={amenity.id} className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      {amenity.icon ? (
                        <img 
                          src={amenity.icon} 
                          alt={amenity.name} 
                          className="w-4 h-4"
                        />
                      ) : (
                        <div className="w-2 h-2 bg-primary rounded-full" />
                      )}
                    </div>
                    <span>{amenity.name}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Rules */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Venue Rules</h2>
              <ul className="space-y-2 list-disc pl-5">
                {venue.rules.map(rule => (
                  <li key={rule.id}>{rule.description}</li>
                ))}
              </ul>
            </div>
            
            {/* Photos */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Image className="h-5 w-5" />
                Photos
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {venue.photos.map((photo, index) => (
                  <div 
                    key={photo.id}
                    className="aspect-square rounded-md overflow-hidden cursor-pointer"
                    onClick={() => setSelectedPhotoIndex(index)}
                  >
                    <img 
                      src={photo.url} 
                      alt={photo.caption || `Venue photo ${index + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border p-6 sticky top-8">
              <div className="flex justify-between items-baseline mb-6">
                <div>
                  <span className="text-2xl font-bold">
                    {formatCurrency(venue.pricing.hourlyRate, venue.pricing.currency)}
                  </span>
                  <span className="text-muted-foreground"> /hour</span>
                </div>
                {venue.pricing.dailyRate && (
                  <div className="text-muted-foreground text-sm">
                    {formatCurrency(venue.pricing.dailyRate, venue.pricing.currency)} /day
                  </div>
                )}
              </div>
              
              <div className="space-y-4 mb-6">
                {/* Fee Breakdown */}
                <div className="text-sm space-y-1">
                  <p className="flex justify-between">
                    <span>Minimum booking</span>
                    <span>{venue.pricing.minimumHours} hours</span>
                  </p>
                  {venue.pricing.cleaningFee && (
                    <p className="flex justify-between">
                      <span>Cleaning fee</span>
                      <span>{formatCurrency(venue.pricing.cleaningFee, venue.pricing.currency)}</span>
                    </p>
                  )}
                  {venue.pricing.securityDeposit && (
                    <p className="flex justify-between">
                      <span>Security deposit</span>
                      <span>{formatCurrency(venue.pricing.securityDeposit, venue.pricing.currency)}</span>
                    </p>
                  )}
                  <p className="flex justify-between text-xs text-muted-foreground">
                    <span>Commonly service fee (5%)</span>
                    <span>Added at checkout</span>
                  </p>
                </div>
                
                {/* Availability Schedule UI would go here */}
                <div className="border-t pt-4">
                  <h3 className="font-medium mb-2 flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Available Hours
                  </h3>
                  <div className="space-y-1 text-sm">
                    {venue.availability.length > 0 ? 
                      venue.availability.map((slot, index) => {
                        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                        return (
                          <p key={index} className="flex justify-between">
                            <span>{days[slot.dayOfWeek]}</span>
                            <span>{slot.startTime} - {slot.endTime}</span>
                          </p>
                        );
                      }) : 
                      <p className="text-muted-foreground">Contact host for availability</p>
                    }
                  </div>
                </div>
              </div>
              
              <Button className="w-full mb-3">
                <DollarSign className="h-4 w-4 mr-2" />
                Book Now
              </Button>
              
              <p className="text-center text-xs text-muted-foreground">
                You won't be charged yet
              </p>
            </div>
          </div>
        </div>
      </main>
      
      {/* Report Dialog */}
      <ReportVenueDialog 
        venueId={venue.id}
        venueName={venue.name}
        isOpen={reportDialogOpen}
        onClose={() => setReportDialogOpen(false)}
      />
    </>
  );
};

export default VenueDetail;
