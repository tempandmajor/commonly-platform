
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { getCaterer } from '@/services/catererService';
import Navbar from '@/components/layout/Navbar';
import ReportCatererDialog from '@/components/catering/ReportCatererDialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MapPin, Calendar, Image, FileText, 
  DollarSign, Flag, UtensilsCrossed, Users, Clock
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

const CatererDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  
  const { data: caterer, isLoading, error } = useQuery({
    queryKey: ['caterer', id],
    queryFn: () => getCaterer(id!),
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
  
  if (error || !caterer) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold mb-4">Caterer not found</h2>
          <p className="text-muted-foreground mb-8">The caterer you're looking for doesn't exist or has been removed.</p>
          <Link to="/catering">
            <Button>Browse Other Caterers</Button>
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
            src={caterer.photos[selectedPhotoIndex]?.url || '/placeholder.svg'} 
            alt={caterer.name}
            className="w-full h-full object-cover"
          />
          
          {/* Photo Gallery Navigator */}
          <div className="absolute bottom-4 left-4 right-4 flex justify-center">
            <div className="bg-black/70 rounded-lg p-2 flex gap-2 overflow-x-auto max-w-full">
              {caterer.photos.map((photo, index) => (
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
            {caterer.isVerified && (
              <div className="bg-green-500 text-white px-3 py-1 rounded-full font-medium text-sm">
                Verified Caterer
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
                  <h1 className="text-3xl font-bold">{caterer.name}</h1>
                  <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{caterer.location.address}, {caterer.location.city}, {caterer.location.state}</span>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-red-500 hover:bg-red-50 hover:text-red-600"
                  onClick={() => setReportDialogOpen(true)}
                >
                  <Flag className="h-4 w-4 mr-1" />
                  Report
                </Button>
              </div>
              
              {/* Cuisine Types */}
              <div className="flex flex-wrap gap-2 mt-3">
                {caterer.cuisineTypes.map((cuisine, index) => (
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
                  {caterer.ownerPhotoURL ? (
                    <img 
                      src={caterer.ownerPhotoURL} 
                      alt={caterer.ownerName} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/10">
                      <UtensilsCrossed className="h-6 w-6 text-primary" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-medium">By {caterer.ownerName}</p>
                  <p className="text-sm text-muted-foreground">Catering Service</p>
                </div>
              </div>
            </div>
            
            {/* Tabs for different sections */}
            <Tabs defaultValue="menu" className="w-full">
              <TabsList className="grid grid-cols-3 mb-6">
                <TabsTrigger value="menu">Menu</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="gallery">Gallery</TabsTrigger>
              </TabsList>
              
              {/* Menu Tab */}
              <TabsContent value="menu" className="space-y-6">
                {caterer.menuCategories.length > 0 ? (
                  caterer.menuCategories.map(category => (
                    <div key={category.id} className="space-y-4">
                      <h3 className="text-xl font-semibold">{category.name}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {category.items.map(item => (
                          <div key={item.id} className="border rounded-lg overflow-hidden flex">
                            {item.photoUrl && (
                              <div className="w-24 h-24 flex-shrink-0">
                                <img 
                                  src={item.photoUrl} 
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <div className="p-3 flex-grow">
                              <div className="flex justify-between">
                                <h4 className="font-medium">{item.name}</h4>
                                <span className="font-semibold">{formatCurrency(item.price, caterer.pricing.currency)}</span>
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{item.description}</p>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {item.dietaryOptions.map((option, index) => (
                                  <span key={index} className="text-xs bg-secondary/50 px-2 py-0.5 rounded-full">
                                    {option}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10">
                    <p className="text-muted-foreground">No menu items available</p>
                  </div>
                )}
              </TabsContent>
              
              {/* Details Tab */}
              <TabsContent value="details" className="space-y-6">
                {/* Description */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Description
                  </h2>
                  <p className="text-muted-foreground whitespace-pre-line">
                    {caterer.description}
                  </p>
                </div>
                
                {/* Services */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Services Offered</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {caterer.services.map(service => (
                      <div key={service.id} className="border rounded-lg p-4">
                        <h3 className="font-medium text-lg mb-1">{service.name}</h3>
                        <p className="text-sm text-muted-foreground mb-3">{service.description}</p>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Price per guest:</span>
                            <span className="font-medium">{formatCurrency(service.pricePerGuest, caterer.pricing.currency)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Guest capacity:</span>
                            <span>{service.minGuests} - {service.maxGuests}</span>
                          </div>
                          {service.setupFee && (
                            <div className="flex justify-between">
                              <span>Setup fee:</span>
                              <span>{formatCurrency(service.setupFee, caterer.pricing.currency)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Specialties */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Specialties</h2>
                  <div className="flex flex-wrap gap-2">
                    {caterer.specialties.map((specialty, index) => (
                      <span 
                        key={index}
                        className="bg-primary/10 text-primary rounded-full px-3 py-1"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* Availability */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Availability
                  </h2>
                  <div className="space-y-1 text-sm">
                    {caterer.availability.length > 0 ? 
                      caterer.availability.map((slot, index) => {
                        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                        return (
                          <p key={index} className="flex justify-between py-1 border-b">
                            <span className="font-medium">{days[slot.dayOfWeek]}</span>
                            <span>{slot.startTime} - {slot.endTime}</span>
                          </p>
                        );
                      }) : 
                      <p className="text-muted-foreground">Contact caterer for availability</p>
                    }
                  </div>
                </div>
              </TabsContent>
              
              {/* Gallery Tab */}
              <TabsContent value="gallery" className="space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Image className="h-5 w-5" />
                  Photo Gallery
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {caterer.photos.map((photo, index) => (
                    <div 
                      key={photo.id}
                      className="aspect-square rounded-md overflow-hidden cursor-pointer"
                      onClick={() => setSelectedPhotoIndex(index)}
                    >
                      <img 
                        src={photo.url} 
                        alt={photo.caption || `Photo ${index + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border p-6 sticky top-8">
              <div className="flex justify-between items-baseline mb-6">
                <div>
                  <span className="text-2xl font-bold">
                    {formatCurrency(caterer.pricing.minimumOrderAmount, caterer.pricing.currency)}
                  </span>
                  <span className="text-muted-foreground"> min. order</span>
                </div>
              </div>
              
              {/* Service Types */}
              <div className="space-y-4 mb-6">
                <h3 className="font-medium">Available Services</h3>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(caterer.pricing.serviceTypes).map(([key, available]) => {
                    if (!available) return null;
                    
                    const serviceNames: Record<string, string> = {
                      pickup: 'Pickup',
                      delivery: 'Delivery',
                      fullService: 'Full Service'
                    };
                    
                    return (
                      <div 
                        key={key}
                        className="flex flex-col items-center p-2 border rounded-md text-center"
                      >
                        <span className="text-xs text-muted-foreground">{serviceNames[key]}</span>
                        <span className="text-lg">✓</span>
                      </div>
                    );
                  })}
                </div>
                
                {/* Fee Breakdown */}
                <div className="text-sm space-y-1 border-t pt-4 mt-4">
                  <p className="flex justify-between">
                    <span>Minimum order</span>
                    <span>{formatCurrency(caterer.pricing.minimumOrderAmount, caterer.pricing.currency)}</span>
                  </p>
                  {caterer.pricing.deliveryFee && (
                    <p className="flex justify-between">
                      <span>Delivery fee</span>
                      <span>{formatCurrency(caterer.pricing.deliveryFee, caterer.pricing.currency)}</span>
                    </p>
                  )}
                  <p className="flex justify-between text-xs text-muted-foreground">
                    <span>Commonly service fee (5%)</span>
                    <span>Added at checkout</span>
                  </p>
                </div>
                
                {/* Guest Count Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Guest Count</span>
                    <span>50 guests</span>
                  </div>
                  <Slider
                    defaultValue={[50]}
                    min={caterer.services[0]?.minGuests || 10}
                    max={caterer.services[0]?.maxGuests || 100}
                    step={5}
                    className="mb-3"
                  />
                </div>
              </div>
              
              <Button className="w-full mb-3">
                <Calendar className="h-4 w-4 mr-2" />
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
      <ReportCatererDialog 
        catererId={caterer.id}
        catererName={caterer.name}
        isOpen={reportDialogOpen}
        onClose={() => setReportDialogOpen(false)}
      />
    </>
  );
};

export default CatererDetail;
