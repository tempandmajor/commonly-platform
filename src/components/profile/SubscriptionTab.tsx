
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Lock, Calendar, Users, CalendarCheck } from "lucide-react";
import { getUserSubscription, createSubscription } from "@/services/subscriptionService";
import { Subscription } from "@/types/auth";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface SubscriptionTabProps {
  userId: string;
}

const SubscriptionTab: React.FC<SubscriptionTabProps> = ({ userId }) => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const sub = await getUserSubscription(userId);
        setSubscription(sub);
      } catch (error) {
        console.error("Error fetching subscription:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSubscription();
  }, [userId]);

  const handleSubscribe = async () => {
    try {
      // In a real app, we would redirect to a checkout page
      // or create a Stripe Checkout session
      toast({
        title: "Starting checkout",
        description: "Redirecting to payment page...",
      });
      
      // For demo purposes, we can mock this by redirecting to /subscription-checkout
      window.location.href = "/subscription-checkout";
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to initiate subscription",
        variant: "destructive"
      });
    }
  };

  const handleManageSubscription = () => {
    // In a real app, this would redirect to a subscription management page
    // or the Stripe customer portal
    window.location.href = "/manage-subscription";
  };

  return (
    <div className="space-y-6">
      <div className="max-w-3xl">
        <h2 className="text-2xl font-bold mb-4 flex items-center">
          <ShieldCheck className="mr-2 h-6 w-6 text-yellow-500" />
          Commonly Pro Subscription
        </h2>
        <p className="text-gray-600 mb-6">
          As a creator with 1,000+ followers, you're eligible to host recurring monthly events 
          and gain access to premium features with Commonly Pro.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className={`border-2 ${subscription ? 'border-primary' : ''}`}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl">Commonly Pro</CardTitle>
                {subscription && (
                  <Badge variant="outline" className="bg-primary/10">Current Plan</Badge>
                )}
              </div>
              <CardDescription>
                Premium tools for event creators
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-3xl font-bold">$29.99<span className="text-sm text-gray-600 font-normal">/month</span></p>
              <ul className="space-y-2 mt-4">
                <li className="flex items-start">
                  <Calendar className="h-5 w-5 mr-2 text-primary flex-shrink-0 mt-0.5" />
                  <span>Host recurring monthly events</span>
                </li>
                <li className="flex items-start">
                  <Users className="h-5 w-5 mr-2 text-primary flex-shrink-0 mt-0.5" />
                  <span>Priority in search results</span>
                </li>
                <li className="flex items-start">
                  <CalendarCheck className="h-5 w-5 mr-2 text-primary flex-shrink-0 mt-0.5" />
                  <span>Advanced analytics for your events</span>
                </li>
                <li className="flex items-start">
                  <ShieldCheck className="h-5 w-5 mr-2 text-primary flex-shrink-0 mt-0.5" />
                  <span>Verified badge on your profile</span>
                </li>
                <li className="flex items-start">
                  <Lock className="h-5 w-5 mr-2 text-primary flex-shrink-0 mt-0.5" />
                  <span>Create members-only events</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              {subscription ? (
                <div className="w-full space-y-4">
                  <p className="text-sm text-gray-600">
                    Your subscription will renew on {subscription.currentPeriodEnd ? 
                    format(new Date(subscription.currentPeriodEnd), 'MMMM d, yyyy') : 'N/A'}
                  </p>
                  <Button 
                    className="w-full" 
                    variant="outline" 
                    onClick={handleManageSubscription}
                  >
                    Manage Subscription
                  </Button>
                </div>
              ) : (
                <Button 
                  className="w-full" 
                  onClick={handleSubscribe}
                  disabled={loading}
                >
                  Subscribe Now
                </Button>
              )}
            </CardFooter>
          </Card>
          
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-medium mb-4">What you'll get with Commonly Pro</h3>
            <div className="space-y-6">
              <div>
                <h4 className="font-medium">Monthly Recurring Events</h4>
                <p className="text-gray-600 text-sm mt-1">
                  Create subscription-based events that your followers can join
                  on a recurring basis.
                </p>
              </div>
              <div>
                <h4 className="font-medium">Premium Analytics</h4>
                <p className="text-gray-600 text-sm mt-1">
                  Get detailed insights about attendees, engagement, and revenue
                  for all your events.
                </p>
              </div>
              <div>
                <h4 className="font-medium">Priority Support</h4>
                <p className="text-gray-600 text-sm mt-1">
                  Get prioritized customer support and early access to new features.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionTab;
