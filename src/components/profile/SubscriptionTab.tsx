
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Info, Loader2 } from "lucide-react";
import { isUserPro } from "@/services/subscriptionService";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils";

export interface SubscriptionTabProps {
  userId: string;
}

const SubscriptionTab: React.FC<SubscriptionTabProps> = ({ userId }) => {
  const [loading, setLoading] = useState(true);
  const [isPro, setIsPro] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const checkProStatus = async () => {
      try {
        setLoading(true);
        const proStatus = await isUserPro(userId);
        setIsPro(proStatus);
      } catch (error) {
        console.error("Error checking pro status:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not check subscription status. Please try again."
        });
      } finally {
        setLoading(false);
      }
    };

    checkProStatus();
  }, [userId, toast]);

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Subscription</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className={`border-2 ${isPro ? "border-primary" : ""}`}>
          <CardHeader className="pb-3">
            <CardTitle className="flex justify-between">
              Free Plan
              {!isPro && <Badge>Current Plan</Badge>}
            </CardTitle>
            <div className="text-2xl font-bold">$0 <span className="text-sm font-normal text-muted-foreground">/month</span></div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-center">
                <Check className="h-4 w-4 mr-2 text-primary" />
                <span>Basic access</span>
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 mr-2 text-primary" />
                <span>Listen to podcasts</span>
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 mr-2 text-primary" />
                <span>Follow creators</span>
              </li>
            </ul>

            {isPro ? (
              <Button className="w-full mt-4" variant="outline">Downgrade</Button>
            ) : (
              <Button className="w-full mt-4" disabled>Current Plan</Button>
            )}
          </CardContent>
        </Card>

        <Card className={`border-2 ${isPro ? "border-primary" : ""}`}>
          <CardHeader className="pb-3">
            <CardTitle className="flex justify-between">
              Pro Plan
              {isPro && <Badge>Current Plan</Badge>}
            </CardTitle>
            <div className="text-2xl font-bold">$9.99 <span className="text-sm font-normal text-muted-foreground">/month</span></div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-center">
                <Check className="h-4 w-4 mr-2 text-primary" />
                <span>All Free features</span>
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 mr-2 text-primary" />
                <span>Create unlimited podcasts</span>
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 mr-2 text-primary" />
                <span>Advanced analytics</span>
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 mr-2 text-primary" />
                <span>Priority support</span>
              </li>
            </ul>

            {isPro ? (
              <Button className="w-full mt-4" variant="outline">Manage Subscription</Button>
            ) : (
              <Button className="w-full mt-4">Upgrade to Pro</Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Business Plan</CardTitle>
            <div className="text-2xl font-bold">$24.99 <span className="text-sm font-normal text-muted-foreground">/month</span></div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-center">
                <Check className="h-4 w-4 mr-2 text-primary" />
                <span>All Pro features</span>
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 mr-2 text-primary" />
                <span>Team collaboration</span>
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 mr-2 text-primary" />
                <span>Monetization options</span>
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 mr-2 text-primary" />
                <span>White-label support</span>
              </li>
            </ul>

            <Button className="w-full mt-4" variant="outline">Contact Sales</Button>
          </CardContent>
        </Card>
      </div>

      <div className="bg-muted p-4 rounded-lg">
        <div className="flex items-start">
          <Info className="h-5 w-5 mr-2 text-muted-foreground mt-0.5" />
          <div>
            <h3 className="font-medium">Subscription Information</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {isPro ? (
                <>
                  Your Pro subscription is active. Next billing date: {formatDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))}
                </>
              ) : (
                <>
                  Upgrade to Pro to unlock premium features and support content creators.
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionTab;
