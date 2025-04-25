
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import UserProfile from "@/components/user/UserProfile";

const Settings: React.FC = () => {
  const { resetWalkthrough } = useAuth();

  const handleResetWalkthrough = async () => {
    try {
      await resetWalkthrough();
    } catch (error) {
      console.error("Error resetting walkthrough:", error);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>

      <UserProfile />

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Application Features</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">App Walkthrough</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Reset the app walkthrough to see the introduction again on your next visit.
            </p>
            <Button onClick={handleResetWalkthrough}>
              Reset Walkthrough
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
