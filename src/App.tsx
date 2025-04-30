
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { setupPresenceSystem } from './services/userPresenceService';
import { useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Messages from './pages/Messages';
import MessagesList from './pages/MessagesList';
import { Toaster } from "@/components/ui/toaster";
import UserProfile from './pages/UserProfile';

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

  return (
    <>
      <Router>
        <Routes>
          {/* Authentication */}
          <Route path="/login" element={<Navigate to="/" replace />} />
          
          {/* Messages */}
          <Route path="/messages/:chatId" element={
            <ProtectedRoute>
              <Messages />
            </ProtectedRoute>
          } />
          <Route path="/messages" element={
            <ProtectedRoute>
              <MessagesList />
            </ProtectedRoute>
          } />
          
          {/* User Profile */}
          <Route path="/profile/:userId" element={<UserProfile />} />
          
          {/* Default Route */}
          <Route path="/" element={
            currentUser ? 
            <Navigate to="/messages" replace /> : 
            <Navigate to="/login" replace />
          } />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      <Toaster />
    </>
  );
}

export default App;
