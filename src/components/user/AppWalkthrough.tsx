
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const steps = [
  {
    title: "Welcome to Commonly",
    description: "We're excited to have you join us! Let's take a quick tour of the app.",
    image: "/placeholder.svg",
  },
  {
    title: "Browse Events",
    description: "Discover events happening around you and connect with your community.",
    image: "/placeholder.svg",
  },
  {
    title: "Create Your Profile",
    description: "Complete your profile to connect with others and personalize your experience.",
    image: "/placeholder.svg",
  },
  {
    title: "Get Started!",
    description: "You're all set! Start exploring Commonly and discover what's happening in your community.",
    image: "/placeholder.svg",
  },
];

const AppWalkthrough: React.FC = () => {
  const { userData, currentUser } = useAuth();
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Check if user is authenticated and if this is a recent login
    if (currentUser && userData?.recentLogin) {
      setOpen(true);
    }
  }, [currentUser, userData]);

  const handleClose = async () => {
    if (!currentUser) return;
    
    setOpen(false);
    
    // Update user data to indicate walkthrough has been completed
    try {
      const { error } = await supabase
        .from('users')
        .update({ recent_login: false })
        .eq('id', currentUser.id);
        
      if (error) throw error;
    } catch (error) {
      console.error("Error updating walkthrough status:", error);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!currentUser || !userData) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px] p-0">
        <div className="relative">
          <img
            src={steps[currentStep].image}
            alt={steps[currentStep].title}
            className="w-full h-48 object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
            <h3 className="text-xl font-bold text-white">
              {steps[currentStep].title}
            </h3>
          </div>
        </div>
        
        <div className="p-6">
          <p>{steps[currentStep].description}</p>
          
          <div className="flex justify-center mt-6">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-2 rounded-full mx-1 ${
                  index === currentStep ? "bg-primary" : "bg-gray-300"
                }`}
              />
            ))}
          </div>
        </div>
        
        <DialogFooter className="border-t p-4">
          <div className="flex w-full justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              Previous
            </Button>
            <Button onClick={handleNext}>
              {currentStep === steps.length - 1 ? "Finish" : "Next"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AppWalkthrough;
