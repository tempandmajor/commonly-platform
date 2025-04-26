
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { UserWallet } from "@/types/auth";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowDownToLine, BadgeDollarSign, Clock, CreditCard, Loader2 } from "lucide-react";

interface WalletOverviewProps {
  wallet: UserWallet;
  onWithdraw: (amount: number) => Promise<void>;
  onConnectAccount: () => Promise<void>;
  withdrawalLoading: boolean;
  connectAccountLoading: boolean;
}

const WalletOverview: React.FC<WalletOverviewProps> = ({
  wallet,
  onWithdraw,
  onConnectAccount,
  withdrawalLoading,
  connectAccountLoading
}) => {
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState("");

  const handleWithdrawalSubmit = async () => {
    const amount = parseFloat(withdrawalAmount);
    if (isNaN(amount) || amount <= 0) return;
    
    await onWithdraw(amount);
    setIsWithdrawDialogOpen(false);
    setWithdrawalAmount("");
  };

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Available Balance
            </CardTitle>
            <BadgeDollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${wallet.availableBalance.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Funds available for withdrawal
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Platform Credits
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${wallet.platformCredits.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Use for platform services
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Balance
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${wallet.pendingBalance.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Processing within 7 days
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Earnings
            </CardTitle>
            <BadgeDollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${wallet.totalEarnings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Lifetime earnings
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Wallet Actions</CardTitle>
          <CardDescription>Manage your funds and payment methods</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              onClick={() => setIsWithdrawDialogOpen(true)}
              disabled={wallet.availableBalance <= 0 || !wallet.hasPayoutMethod || withdrawalLoading}
              className="w-full sm:w-auto"
            >
              {withdrawalLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ArrowDownToLine className="mr-2 h-4 w-4" />
              )}
              Withdraw Funds
            </Button>
            
            {!wallet.stripeConnectId && (
              <Button 
                onClick={onConnectAccount}
                disabled={connectAccountLoading}
                variant="outline"
                className="w-full sm:w-auto"
              >
                {connectAccountLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CreditCard className="mr-2 h-4 w-4" />
                )}
                Connect Payout Account
              </Button>
            )}
          </div>
        </CardContent>
        <CardFooter className="text-sm text-muted-foreground">
          {!wallet.hasPayoutMethod ? (
            <p>Please connect a payout account to withdraw funds.</p>
          ) : wallet.availableBalance <= 0 ? (
            <p>You don't have any funds available for withdrawal.</p>
          ) : (
            <p>Withdrawals typically process within 1-3 business days.</p>
          )}
        </CardFooter>
      </Card>

      <Dialog open={isWithdrawDialogOpen} onOpenChange={setIsWithdrawDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Withdraw Funds</DialogTitle>
            <DialogDescription>
              Enter the amount you want to withdraw to your connected account.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={withdrawalAmount}
                onChange={(e) => setWithdrawalAmount(e.target.value)}
                min={1}
                max={wallet.availableBalance}
                step={0.01}
              />
              <p className="text-sm text-muted-foreground">
                Available: ${wallet.availableBalance.toFixed(2)}
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsWithdrawDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleWithdrawalSubmit}
              disabled={
                parseFloat(withdrawalAmount) <= 0 || 
                parseFloat(withdrawalAmount) > wallet.availableBalance ||
                withdrawalLoading
              }
            >
              {withdrawalLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Withdraw
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WalletOverview;
