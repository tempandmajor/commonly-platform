
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { setupPresenceSystem } from './services/userPresenceService';
import { useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Messages from './pages/Messages';
import MessagesList from './pages/MessagesList';
import { Toaster } from "@/components/ui/toaster";
import UserProfile from './pages/UserProfile';
import AppWalkthrough from './components/user/AppWalkthrough';
import NotFound from './pages/NotFound';

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
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  // Handle auth redirection logic separately to avoid unnecessary re-renders
  const getDefaultRedirect = () => {
    return currentUser ? "/messages" : "/login";
  };

  return (
    <>
      <Router>
        <Routes>
          {/* Authentication */}
          <Route 
            path="/login" 
            element={currentUser ? <Navigate to="/" replace /> : <Navigate to="/" replace />} 
          />
          
          {/* Messages */}
          <Route 
            path="/messages/:chatId" 
            element={
              <ProtectedRoute>
                <Messages />
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
          
          {/* User Profile */}
          <Route path="/profile/:userId" element={<UserProfile />} />
          
          {/* Default Route - only navigate once */}
          <Route 
            path="/" 
            element={<Navigate to={getDefaultRedirect()} replace />} 
          />
          
          {/* Fallback - prevent infinite redirects */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      <AppWalkthrough />
      <Toaster />
    </>
  );
}

export default App;
