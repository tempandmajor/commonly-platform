import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { getCaterer } from '@/services/catererService';
import Navbar from '@/components/layout/Navbar';
import ReportCatererDialog from '@/components/catering/ReportCatererDialog';
import { PhotoGallery } from '@/components/catering/detail/PhotoGallery';
import { CatererHeader } from '@/components/catering/detail/CatererHeader';
import { BookingSidebar } from '@/components/catering/detail/BookingSidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Image, Clock } from 'lucide-react';
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
        <PhotoGallery 
          photos={caterer.photos}
          selectedIndex={selectedPhotoIndex}
          onPhotoSelect={setSelectedPhotoIndex}
        />
        
        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <CatererHeader
              name={caterer.name}
              location={caterer.location}
              cuisineTypes={caterer.cuisineTypes}
              ownerName={caterer.ownerName}
              ownerPhotoURL={caterer.ownerPhotoURL}
              onReportClick={() => setReportDialogOpen(true)}
            />
            
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
            <BookingSidebar
              pricing={caterer.pricing}
              minGuests={caterer.services[0]?.minGuests || 10}
              maxGuests={caterer.services[0]?.maxGuests || 100}
            />
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
