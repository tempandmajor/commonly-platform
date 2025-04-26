
import React, { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/layout/Navbar";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import WalletDashboard from "@/components/wallet/WalletDashboard";
import { Loader2 } from "lucide-react";

const Wallet = () => {
  const { currentUser, userData, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // If the user is not authenticated and we're done loading, redirect to home
    if (!loading && !currentUser) {
      toast({
        title: "Authentication required",
        description: "Please sign in to view your wallet",
        variant: "destructive"
      });
      navigate("/");
    }
  }, [currentUser, loading, navigate, toast]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex justify-center items-center" style={{ minHeight: "calc(100vh - 64px)" }}>
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </>
    );
  }

  if (!currentUser || !userData) {
    return null; // This will be handled by the useEffect redirect
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold">Wallet & Earnings</h1>
            <p className="text-muted-foreground">
              Manage your earnings, withdrawals, and payment methods
            </p>
          </div>
        </div>
        
        <WalletDashboard userId={currentUser.uid} />
      </div>
    </>
  );
};

export default Wallet;
