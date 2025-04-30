import React, { useState, useEffect } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { getUserSubscription } from "@/services/subscriptionService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const SubscriptionTab = () => {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchSubscription = async () => {
      if (currentUser) {
        setLoading(true);
        try {
          const data = await getUserSubscription(currentUser.uid);
          if (data) {
            setSubscription(data);
          }
        } catch (error) {
          console.error("Error fetching subscription:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchSubscription();
  }, [currentUser]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription</CardTitle>
        <CardDescription>Manage your subscription plan</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading subscription...
          </div>
        ) : subscription ? (
          <>
            <div className="space-y-2">
              <p className="text-sm font-medium">Plan: {subscription.plan}</p>
              <p className="text-sm text-gray-500">Status: {subscription.status}</p>
              <p className="text-sm text-gray-500">
                Current Period End: {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
              </p>
            </div>
            <Button variant="destructive">Cancel Subscription</Button>
          </>
        ) : (
          <p className="text-sm text-gray-500">You do not have an active subscription.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default SubscriptionTab;
