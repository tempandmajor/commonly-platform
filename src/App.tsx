
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { Toaster } from "./components/ui/toaster";
import Index from "./pages/Index";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import CreateEvent from "./pages/CreateEvent";
import ProtectedRoute from "./components/auth/ProtectedRoute";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Index />} />
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
                    {/* Include the ReferralsDashboard component */}
                    {React.createElement(
                      React.lazy(() => import("./components/user/ReferralsDashboard"))
                    )}
                  </div>
                </div>
              </ProtectedRoute>
            }
          />
          <Route path="/r/:code" element={<ReferralRedirect />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </AuthProvider>
    </Router>
  );
}

// This component handles referral link redirects
const ReferralRedirect = () => {
  const navigate = useNavigate();
  const { code } = useParams();
  const { currentUser } = useAuth();
  
  useEffect(() => {
    const trackClick = async () => {
      try {
        // Track the referral click using Firebase Functions
        const trackReferralClick = httpsCallable(functions, 'trackReferralClick');
        await trackReferralClick({ code });
        
        // Redirect to the event page
        // In a real app, you would query for the event ID associated with this code
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
