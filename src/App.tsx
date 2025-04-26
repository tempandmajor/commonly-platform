
import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate, useParams } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Toaster } from "./components/ui/toaster";
import { httpsCallable } from "firebase/functions";
import { functions } from "./lib/firebase";
import AppWalkthrough from "./components/user/AppWalkthrough";
import Index from "./pages/Index";
import Events from "./pages/Events";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import CreateEvent from "./pages/CreateEvent";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Venues from "./pages/Venues";
import VenueDetail from "./pages/VenueDetail";
import CreateVenue from "./pages/CreateVenue";
import MyVenues from "./pages/MyVenues";
import Catering from "./pages/Catering";
import CatererDetail from "./pages/CatererDetail";
import UserProfile from "./pages/UserProfile";
import Messages from "./pages/Messages";
import MessagesList from "./pages/MessagesList";
import StoreMarketplace from "./pages/StoreMarketplace";
import StoreDashboard from "./components/merchant/StoreDashboard";
import AddProduct from "./pages/AddProduct";
import Wallet from "./pages/Wallet";
import Podcasts from "./pages/Podcasts";
import PodcastDetails from "./pages/PodcastDetails";
import UserPodcasts from "./pages/UserPodcasts";

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppWalkthrough />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/events" element={<Events />} />
          <Route path="/venues" element={<Venues />} />
          <Route path="/venues/:id" element={<VenueDetail />} />
          <Route path="/catering" element={<Catering />} />
          <Route path="/catering/:id" element={<CatererDetail />} />
          <Route path="/profile/:id" element={<UserProfile />} />
          <Route path="/marketplace" element={<StoreMarketplace />} />
          <Route path="/podcasts" element={<Podcasts />} />
          <Route path="/podcasts/:id" element={<PodcastDetails />} />
          <Route path="/user/:userId/podcasts" element={<UserPodcasts />} />
          
          <Route
            path="/create-venue"
            element={
              <ProtectedRoute>
                <CreateVenue />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-venues"
            element={
              <ProtectedRoute>
                <MyVenues />
              </ProtectedRoute>
            }
          />
          <Route
            path="/messages"
            element={
              <ProtectedRoute>
                <MessagesList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/messages/:chatId"
            element={
              <ProtectedRoute>
                <Messages />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-event"
            element={
              <ProtectedRoute>
                <CreateEvent />
              </ProtectedRoute>
            }
          />
          <Route
            path="/store/dashboard"
            element={
              <ProtectedRoute>
                <StoreDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/store/add-product"
            element={
              <ProtectedRoute>
                <AddProduct />
              </ProtectedRoute>
            }
          />
          <Route
            path="/wallet"
            element={
              <ProtectedRoute>
                <Wallet />
              </ProtectedRoute>
            }
          />
          <Route
            path="/referrals"
            element={
              <ProtectedRoute>
                <div className="container max-w-4xl mx-auto px-4 py-8">
                  <h1 className="text-3xl font-bold mb-6">My Referrals & Earnings</h1>
                  <div className="mb-8">
                    <p className="text-muted-foreground">
                      Track your referrals, view your earnings, and manage your wallet.
                    </p>
                  </div>
                  <div className="space-y-8">
                    {React.createElement(
                      React.lazy(() => import("./components/user/ReferralsDashboard"))
                    )}
                  </div>
                </div>
              </ProtectedRoute>
            }
          />
          <Route path="/r/:code" element={<ReferralRedirect />} />
          <Route path="/about" element={<div className="container mx-auto px-4 py-8">About Commonly</div>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </AuthProvider>
    </Router>
  );
}

const ReferralRedirect = () => {
  const navigate = useNavigate();
  const { code } = useParams();
  const { currentUser } = useAuth();
  
  useEffect(() => {
    const trackClick = async () => {
      try {
        const trackReferralClick = httpsCallable(functions, 'trackReferralClick');
        await trackReferralClick({ code });
        
        navigate('/');
      } catch (error) {
        console.error('Error tracking referral:', error);
        navigate('/');
      }
    };
    
    trackClick();
  }, [code, navigate]);
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
    </div>
  );
};

export default App;
