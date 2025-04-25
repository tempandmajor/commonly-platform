
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/layout/Navbar';
import VenueList from '@/components/venues/VenueList';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const Venues = () => {
  const { currentUser } = useAuth();

  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Book Venues</h1>
            <p className="text-muted-foreground mt-2">
              Find and book perfect spaces for your events
            </p>
          </div>
          
          {currentUser && (
            <div className="mt-4 sm:mt-0 flex space-x-4">
              <Link to="/my-venues">
                <Button variant="outline">My Venues</Button>
              </Link>
              <Link to="/create-venue">
                <Button>
                  <Plus className="mr-1 h-4 w-4" />
                  List Your Space
                </Button>
              </Link>
            </div>
          )}
        </div>
        
        <VenueList />
      </main>
    </>
  );
};

export default Venues;
