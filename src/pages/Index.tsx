
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import AuthDialog from "@/components/auth/AuthDialog";
import Navbar from "@/components/layout/Navbar";
import EventList from '@/components/events/EventList';

const Index = () => {
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h1 className="text-4xl font-bold mb-6">Welcome to Commonly</h1>
          <p className="text-xl text-gray-600 mb-8">
            Your platform for community events and connections
          </p>
        </div>

        {/* Events Section */}
        <section>
          <h2 className="text-2xl font-semibold mb-6">Upcoming Events</h2>
          <EventList />
        </section>
      </main>

      {/* Auth Dialog */}
      <AuthDialog
        isOpen={isAuthDialogOpen}
        onClose={() => setIsAuthDialogOpen(false)}
      />
    </div>
  );
};

export default Index;
