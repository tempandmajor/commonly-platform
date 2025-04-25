
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import AuthDialog from "@/components/auth/AuthDialog";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";

const Index = () => {
  const { currentUser, userData, logout } = useAuth();
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Commonly</h1>
          <div className="flex items-center space-x-4">
            {currentUser ? (
              <>
                <Link to="/create-event">
                  <Button>
                    <Plus className="mr-1 h-4 w-4" />
                    Create Event
                  </Button>
                </Link>
                <Link to="/settings">
                  <Button variant="outline">Settings</Button>
                </Link>
                <Button variant="outline" onClick={logout}>
                  Sign Out
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsAuthDialogOpen(true)}>
                Sign In
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold mb-6">Welcome to Commonly</h1>
          <p className="text-xl text-gray-600 mb-8">
            Your platform for community events and connections
          </p>

          {currentUser ? (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-semibold mb-4">
                Welcome back, {userData?.displayName || "User"}!
              </h2>
              <p className="mb-4">
                You're signed in and ready to explore events in your community.
              </p>
              <div className="flex justify-center space-x-4">
                <Button>Explore Events</Button>
                <Link to="/settings">
                  <Button variant="outline">View Settings</Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-semibold mb-4">
                Join Our Community
              </h2>
              <p className="mb-4">
                Sign in to explore events, connect with others, and be part of your local community.
              </p>
              <Button onClick={() => setIsAuthDialogOpen(true)}>
                Get Started
              </Button>
            </div>
          )}
        </div>
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
