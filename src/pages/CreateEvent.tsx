
import React from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CreateEventForm } from "@/components/events/create/CreateEventForm";
import { StripeConnectPrompt } from "@/components/events/create/StripeConnectPrompt";
import { useEventForm } from "@/hooks/useEventForm";

const CreateEvent = () => {
  const { currentUser, userData } = useAuth();
  const { hasStripeAccount, checkingStripe, connectStripe } = useEventForm(currentUser, userData);
  const navigate = useNavigate();

  if (!currentUser) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication Required</AlertTitle>
          <AlertDescription>
            You need to be logged in to create events.
          </AlertDescription>
        </Alert>
        <div className="flex justify-center mt-4">
          <Button onClick={() => navigate("/")}>Go to Login</Button>
        </div>
      </div>
    );
  }

  if (checkingStripe) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
        <span className="ml-2">Checking account status...</span>
      </div>
    );
  }

  if (!hasStripeAccount) {
    return (
      <div className="container max-w-3xl mx-auto px-4 py-8">
        <StripeConnectPrompt onConnect={connectStripe} />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Create Event</h1>
      <CreateEventForm currentUser={currentUser} userData={userData} />
    </div>
  );
};

export default CreateEvent;
