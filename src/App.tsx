
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LocationProvider } from './contexts/LocationContext'; 
import { Toaster } from './components/ui/toaster';
import ErrorBoundary from './components/ErrorBoundary';
import Index from './pages/Index';
import Events from './pages/Events';
import CreateEvent from './pages/CreateEvent';
import NotFound from './pages/NotFound';
import UserProfile from './pages/UserProfile';
import Venues from './pages/Venues';
import VenueDetail from './pages/VenueDetail';
import CreateVenue from './pages/CreateVenue';
import MyVenues from './pages/MyVenues';
import AdminRoutes from './pages/admin/AdminRoutes';
import AdminLogin from './pages/AdminLogin';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Settings from './pages/Settings';
import ContentPage from './pages/ContentPage';
import Catering from './pages/Catering';
import CatererDetail from './pages/CatererDetail';
import Wallet from './pages/Wallet';
import Podcasts from './pages/Podcasts';
import PodcastDetails from './pages/PodcastDetails';
import UserPodcasts from './pages/UserPodcasts';
import Messages from './pages/Messages';
import MessagesList from './pages/MessagesList';
import StoreMarketplace from './pages/StoreMarketplace';
import AddProduct from './pages/AddProduct';
import NotificationSettings from './pages/NotificationSettings';
import { useToast } from './components/ui/use-toast';

const AppContent = () => {
  const { currentUser, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isServiceInitialized, setIsServiceInitialized] = useState(false);
  
  // Initialize services when user logs in
  useEffect(() => {
    if (authLoading) return;
    
    // No Firebase services to initialize, so just mark as initialized
    setIsServiceInitialized(true);
    
  }, [currentUser, authLoading, toast]);
  
  // Show app-wide loading state
  if (authLoading && !isServiceInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <p className="text-gray-500">Loading EventRoom...</p>
        </div>
      </div>
    );
  }
  
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/events" element={<Events />} />
        <Route path="/venues" element={<Venues />} />
        <Route path="/venues/:id" element={<VenueDetail />} />
        <Route path="/catering" element={<Catering />} />
        <Route path="/catering/:id" element={<CatererDetail />} />
        <Route path="/profile/:id" element={<UserProfile />} />
        <Route path="/content/:slug" element={<ContentPage />} />
        <Route path="/podcast/:id" element={<PodcastDetails />} />
        <Route path="/podcasts" element={<Podcasts />} />
        
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin/*" element={<AdminRoutes />} />
        
        {/* Protected Routes */}
        <Route path="/create-event" element={
          <ProtectedRoute>
            <CreateEvent />
          </ProtectedRoute>
        } />
        
        <Route path="/create-venue" element={
          <ProtectedRoute>
            <CreateVenue />
          </ProtectedRoute>
        } />
        
        <Route path="/my-venues" element={
          <ProtectedRoute>
            <MyVenues />
          </ProtectedRoute>
        } />
        
        <Route path="/settings" element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } />
        
        <Route path="/notification-settings" element={
          <ProtectedRoute>
            <NotificationSettings />
          </ProtectedRoute>
        } />
        
        <Route path="/wallet" element={
          <ProtectedRoute>
            <Wallet />
          </ProtectedRoute>
        } />
        
        <Route path="/my-podcasts" element={
          <ProtectedRoute>
            <UserPodcasts />
          </ProtectedRoute>
        } />
        
        <Route path="/messages" element={
          <ProtectedRoute>
            <MessagesList />
          </ProtectedRoute>
        } />
        
        <Route path="/messages/:chatId" element={
          <ProtectedRoute>
            <Messages />
          </ProtectedRoute>
        } />
        
        <Route path="/store" element={
          <ProtectedRoute>
            <StoreMarketplace />
          </ProtectedRoute>
        } />
        
        <Route path="/add-product" element={
          <ProtectedRoute>
            <AddProduct />
          </ProtectedRoute>
        } />
        
        {/* Catch-all route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ErrorBoundary>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LocationProvider>
          <Router>
            <div className="min-h-screen">
              <AppContent />
            </div>
          </Router>
          <Toaster />
        </LocationProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
