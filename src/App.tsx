
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { setupPresenceSystem } from './services/userPresenceService';
import { useAuth } from './contexts/AuthContext';
import Messages from './pages/Messages';
import { Toaster } from "@/components/ui/toaster";

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
          <Route path="/messages/:chatId" element={<Messages />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="*" element={<Navigate to="/messages" replace />} />
        </Routes>
      </Router>
      <Toaster />
    </>
  );
}

export default App;
