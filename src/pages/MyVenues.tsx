
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { getVenuesByOwner } from '@/services/venueService';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Plus, Building, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

const MyVenues = () => {
  const { currentUser } = useAuth();
  const [selectedTab, setSelectedTab] = useState('all');
  
  const { data: venues, isLoading } = useQuery({
    queryKey: ['my-venues', currentUser?.uid],
    queryFn: () => currentUser ? getVenuesByOwner(currentUser.uid) : Promise.resolve([]),
    enabled: !!currentUser
  });
  
  const filteredVenues = venues?.filter(venue => {
    if (selectedTab === 'all') return true;
    if (selectedTab === 'active') return venue.isActive;
    if (selectedTab === 'pending') return !venue.isActive && !venue.isVerified;
    if (selectedTab === 'rejected') return !venue.isActive && venue.isVerified === false;
    return true;
  });
  
  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Venues</h1>
            <p className="text-muted-foreground mt-2">
              Manage your listed spaces and view bookings
            </p>
          </div>
          
          <div className="mt-4 sm:mt-0">
            <Link to="/create-venue">
              <Button>
                <Plus className="mr-1 h-4 w-4" />
                List New Space
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="border-b mb-6">
          <div className="flex space-x-6 overflow-x-auto">
            <button
              className={`pb-2 px-1 -mb-px ${
                selectedTab === 'all'
                  ? 'border-b-2 border-primary font-medium text-primary'
                  : 'text-muted-foreground hover:text-foreground transition-colors'
              }`}
              onClick={() => setSelectedTab('all')}
            >
              All Venues
            </button>
            <button
              className={`pb-2 px-1 -mb-px ${
                selectedTab === 'active'
                  ? 'border-b-2 border-primary font-medium text-primary'
                  : 'text-muted-foreground hover:text-foreground transition-colors'
              }`}
              onClick={() => setSelectedTab('active')}
            >
              Active
            </button>
            <button
              className={`pb-2 px-1 -mb-px ${
                selectedTab === 'pending'
                  ? 'border-b-2 border-primary font-medium text-primary'
                  : 'text-muted-foreground hover:text-foreground transition-colors'
              }`}
              onClick={() => setSelectedTab('pending')}
            >
              Pending Review
            </button>
          </div>
        </div>
        
        {/* Venues List */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-100 animate-pulse rounded-xl"></div>
            ))}
          </div>
        ) : !venues || venues.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Building className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-medium mb-2">No venues yet</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              You haven't listed any venues yet. Start earning by sharing your space with event creators.
            </p>
            <Link to="/create-venue">
              <Button>
                <Plus className="mr-1 h-4 w-4" />
                List Your First Venue
              </Button>
            </Link>
          </div>
        ) : filteredVenues?.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No venues match the selected filter</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVenues?.map(venue => {
              // Find primary photo or use first photo
              const primaryPhoto = venue.photos.find(photo => photo.isPrimary) || venue.photos[0];
              const imageUrl = primaryPhoto?.url || '/placeholder.svg';
              
              return (
                <Card key={venue.id} className="overflow-hidden">
                  <div className="relative">
                    <div className="h-40 overflow-hidden">
                      <img 
                        src={imageUrl} 
                        alt={venue.name} 
                        className="object-cover w-full h-full"
                      />
                    </div>
                    
                    {/* Status Badge */}
                    <div className="absolute top-2 right-2">
                      {venue.isActive ? (
                        <Badge className="bg-green-500 text-white">Active</Badge>
                      ) : venue.isVerified === false ? (
                        <Badge variant="destructive">Rejected</Badge>
                      ) : (
                        <Badge variant="secondary">Pending Review</Badge>
                      )}
                    </div>
                  </div>
                  
                  <CardHeader className="p-4 pb-0">
                    <h3 className="font-semibold text-lg line-clamp-1">{venue.name}</h3>
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
                    
                    {!venue.isActive && venue.isVerified === false && (
                      <div className="mt-2 text-sm text-red-500">
                        Your venue was not approved. Please update and resubmit.
                      </div>
                    )}
                    
                    {!venue.isActive && venue.isVerified === null && (
                      <div className="mt-2 text-sm text-amber-500">
                        Your venue is being reviewed and will be live soon.
                      </div>
                    )}
                  </CardContent>
                  
                  <CardFooter className="p-4 flex justify-between items-center">
                    <div>
                      <span className="font-semibold text-lg">
                        {formatCurrency(venue.pricing.hourlyRate, venue.pricing.currency)}
                      </span>
                      <span className="text-sm text-muted-foreground">/hour</span>
                    </div>
                    <div>
                      <Link to={`/venues/${venue.id}`}>
                        <Button variant="outline" size="sm">View Details</Button>
                      </Link>
                    </div>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
        
        {/* Bottom CTA for No Stripe Connect */}
        <div className="mt-12 bg-primary/10 rounded-lg p-6 text-center">
          <div className="flex flex-col items-center max-w-xl mx-auto">
            <DollarSign className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              Complete your Stripe verification to get paid
            </h3>
            <p className="text-muted-foreground mb-6">
              Before your venues can go live, you need to complete identity verification 
              with Stripe Connect to receive payments securely.
            </p>
            <Button>
              Complete Stripe Verification
            </Button>
          </div>
        </div>
      </main>
    </>
  );
};

export default MyVenues;
