
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import AuthDialog from "@/components/auth/AuthDialog";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import EventList from '@/components/events/EventList';

const Index = () => {
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);

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
