
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserWallet } from '@/types/auth';
import { useToast } from '@/hooks/use-toast';

interface PlatformCreditsTabProps {
  wallet: UserWallet;
  refreshWallet: () => Promise<void>;
}

export default function PlatformCreditsTab({ wallet, refreshWallet }: PlatformCreditsTabProps) {
  const { toast } = useToast();
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [creditState, setCreditState] = useState({
    platformCredits: wallet.platformCredits || 0
  });

  const handleRedeemCredits = async () => {
    if (creditState.platformCredits <= 0) {
      toast({
        title: "No credits available",
        description: "You don't have any platform credits to redeem",
        variant: "destructive",
      });
      return;
    }

    setIsRedeeming(true);
    try {
      // Implement credit redemption logic
      toast({
        title: "Credits redeemed",
        description: `You have successfully redeemed ${creditState.platformCredits} credits`,
      });
      
      await refreshWallet();
    } catch (error: any) {
      toast({
        title: "Redemption failed",
        description: error.message || "Failed to redeem credits",
        variant: "destructive",
      });
    } finally {
      setIsRedeeming(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Platform Credits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-muted-foreground text-sm">Available Credits</p>
              <p className="text-3xl font-bold">{wallet.platformCredits || 0}</p>
            </div>
            <Button 
              onClick={handleRedeemCredits} 
              disabled={wallet.platformCredits <= 0 || isRedeeming}
            >
              {isRedeeming ? "Redeeming..." : "Redeem Credits"}
            </Button>
          </div>
          
          <div className="mt-6">
            <p className="text-sm text-muted-foreground">
              Platform credits can be used to purchase premium features, boost content, or access exclusive events.
              Credits cannot be converted to cash.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>How to Earn Credits</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <div className="h-6 w-6 flex items-center justify-center rounded-full bg-primary/10 text-primary text-xs">1</div>
              <p className="text-sm">Refer new users to the platform</p>
            </li>
            <li className="flex items-start gap-2">
              <div className="h-6 w-6 flex items-center justify-center rounded-full bg-primary/10 text-primary text-xs">2</div>
              <p className="text-sm">Create popular content that gets high engagement</p>
            </li>
            <li className="flex items-start gap-2">
              <div className="h-6 w-6 flex items-center justify-center rounded-full bg-primary/10 text-primary text-xs">3</div>
              <p className="text-sm">Participate in platform events and campaigns</p>
            </li>
            <li className="flex items-start gap-2">
              <div className="h-6 w-6 flex items-center justify-center rounded-full bg-primary/10 text-primary text-xs">4</div>
              <p className="text-sm">Complete your profile and stay active</p>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
