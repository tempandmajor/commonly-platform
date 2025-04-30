
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import AuthDialog from "@/components/auth/AuthDialog";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import EventList from '@/components/events/EventList';
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { currentUser } = useAuth();

  useEffect(() => {
    // Simulate loading completion
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Check if app is loaded correctly
    const checkAppStatus = () => {
      if (document.readyState === 'complete') {
        console.log('App loaded successfully');
      } else {
        console.error('App failed to load completely');
        toast({
          title: "Connection issue detected",
          description: "We're experiencing some technical difficulties. Please refresh the page.",
          variant: "destructive",
        });
      }
    };

    window.addEventListener('load', checkAppStatus);
    return () => window.removeEventListener('load', checkAppStatus);
  }, [toast]);

  // Loading state UI
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex flex-col">
          {/* Hero Section Skeleton */}
          <div className="bg-gray-50 py-12 md:py-20 border-b">
            <div className="airbnb-container px-6 lg:px-8 mx-auto">
              <div className="max-w-2xl mx-auto text-center">
                <Skeleton className="h-12 w-3/4 mx-auto mb-6" />
                <Skeleton className="h-6 w-5/6 mx-auto mb-4" />
                <Skeleton className="h-6 w-4/6 mx-auto mb-8" />
                <div className="flex flex-wrap justify-center gap-4">
                  <Skeleton className="h-12 w-32" />
                  <Skeleton className="h-12 w-32" />
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Skeleton */}
          <main className="airbnb-container px-6 lg:px-8 mx-auto py-12 flex-grow">
            <section>
              <div className="flex flex-col md:flex-row justify-between items-baseline mb-8">
                <Skeleton className="h-8 w-48 mb-4 md:mb-0" />
                <Skeleton className="h-6 w-32" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <div key={item} className="airbnb-card border rounded-xl overflow-hidden">
                    <Skeleton className="h-48 w-full" />
                    <div className="p-4">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2 mb-3" />
                      <Skeleton className="h-4 w-5/6" />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </main>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <div className="bg-gray-50 py-12 md:py-20 border-b">
        <div className="airbnb-container px-6 lg:px-8 mx-auto">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Find your next experience
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Discover events, venues, and connections in your community
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="/events" className="bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-black/90 transition-colors">
                Browse Events
              </a>
              <a href="/venues" className="bg-white text-black px-6 py-3 rounded-lg font-medium border border-gray-300 hover:shadow-md transition-all">
                Explore Venues
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="airbnb-container px-6 lg:px-8 mx-auto py-12 flex-grow">
        <section>
          <div className="flex flex-col md:flex-row justify-between items-baseline mb-8">
            <h2 className="text-2xl font-semibold">Upcoming Events</h2>
            <a href="/events" className="text-black underline font-medium hover:no-underline mt-2 md:mt-0">
              View all events
            </a>
          </div>
          <EventList />
        </section>
      </main>

      <Footer />

      {/* Auth Dialog */}
      <AuthDialog
        isOpen={isAuthDialogOpen}
        onClose={() => setIsAuthDialogOpen(false)}
      />
    </div>
  );
};

export default Index;
