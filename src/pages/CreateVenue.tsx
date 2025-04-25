
import React from 'react';
import Navbar from '@/components/layout/Navbar';
import VenueForm from '@/components/venues/VenueForm';

const CreateVenue = () => {
  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-3xl font-bold mb-6">List Your Space</h1>
        <p className="text-muted-foreground mb-8">
          Share your venue with event creators and earn money by renting your space.
        </p>
        <VenueForm />
      </div>
    </>
  );
};

export default CreateVenue;
