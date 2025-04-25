
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { getCaterer } from '@/services/catererService';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/layout/Navbar';
import ReportCatererDialog from '@/components/catering/ReportCatererDialog';
import { PhotoGallery } from '@/components/catering/detail/PhotoGallery';
import { CatererHeader } from '@/components/catering/detail/CatererHeader';
import { BookingSidebar } from '@/components/catering/detail/BookingSidebar';
import { MenuTab } from '@/components/catering/detail/MenuTab';
import { DetailsTab } from '@/components/catering/detail/DetailsTab';
import { GalleryTab } from '@/components/catering/detail/GalleryTab';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
              
              <TabsContent value="menu">
                <MenuTab 
                  menuCategories={caterer.menuCategories}
                  currency={caterer.pricing.currency}
                />
              </TabsContent>
              
              <TabsContent value="details">
                <DetailsTab 
                  description={caterer.description}
                  services={caterer.services}
                  specialties={caterer.specialties}
                  availability={caterer.availability}
                  currency={caterer.pricing.currency}
                />
              </TabsContent>
              
              <TabsContent value="gallery">
                <GalleryTab 
                  photos={caterer.photos}
                  onPhotoSelect={setSelectedPhotoIndex}
                />
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
