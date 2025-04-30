import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { setupPresenceSystem } from './services/userPresenceService';
import { useAuth } from './contexts/AuthContext';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Messages from './pages/Messages';
import Admin from './pages/Admin';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import CreateEvent from './pages/CreateEvent';
import EditEvent from './pages/EditEvent';
import Users from './pages/admin/Users';
import Products from './pages/admin/Products';
import Orders from './pages/admin/Orders';
import Venues from './pages/admin/Venues';
import Content from './pages/admin/Content';
import Artists from './pages/admin/Artists';
import Podcasts from './pages/Podcasts';
import PodcastDetails from './pages/PodcastDetails';
import CreatePodcast from './pages/CreatePodcast';
import EditPodcast from './pages/EditPodcast';
import UserPodcasts from './pages/UserPodcasts';
import UserProfile from './pages/UserProfile';
import SearchResults from './pages/SearchResults';
import Notifications from './pages/Notifications';
import Pricing from './pages/Pricing';
import CheckoutSuccess from './pages/CheckoutSuccess';
import CheckoutCancel from './pages/CheckoutCancel';
import SubscriptionSettings from './pages/SubscriptionSettings';
import UserEvents from './pages/UserEvents';
import { Toaster } from "@/components/ui/toaster"

function App() {
  const { currentUser, loading } = useAuth();

  // Set up presence system when user is logged in
  useEffect(() => {
    if (!currentUser) return;
    
    // Setup user presence system
    const cleanup = setupPresenceSystem(currentUser.uid);
    
    return cleanup;
  }, [currentUser]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/home" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/messages/:userId" element={<Messages />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:eventId" element={<EventDetails />} />
          <Route path="/create-event" element={<CreateEvent />} />
          <Route path="/edit-event/:eventId" element={<EditEvent />} />
          <Route path="/admin/users" element={<Users />} />
          <Route path="/admin/products" element={<Products />} />
          <Route path="/admin/orders" element={<Orders />} />
          <Route path="/admin/venues" element={<Venues />} />
          <Route path="/admin/content" element={<Content />} />
          <Route path="/admin/artists" element={<Artists />} />
          <Route path="/podcasts" element={<Podcasts />} />
          <Route path="/podcasts/:podcastId" element={<PodcastDetails />} />
          <Route path="/create-podcast" element={<CreatePodcast />} />
          <Route path="/edit-podcast/:podcastId" element={<EditPodcast />} />
          <Route path="/user/:userId/podcasts" element={<UserPodcasts />} />
          <Route path="/user/:userId" element={<UserProfile />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/checkout/success" element={<CheckoutSuccess />} />
          <Route path="/checkout/cancel" element={<CheckoutCancel />} />
          <Route path="/subscription-settings" element={<SubscriptionSettings />} />
          <Route path="/user/:userId/events" element={<UserEvents />} />
        </Routes>
      </Router>
      <Toaster />
    </>
  );
}

export default App;
