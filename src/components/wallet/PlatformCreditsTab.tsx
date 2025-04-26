
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserWallet } from "@/types/auth";
import {
  AlertCircle,
  HelpCircle,
  DollarSign,
  ShoppingCart,
  Calendar,
  Video
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PlatformCreditsTabProps {
  wallet: UserWallet;
  refreshWallet: () => Promise<void>;
}

const PlatformCreditsTab: React.FC<PlatformCreditsTabProps> = ({
  wallet,
  refreshWallet
}) => {
  const creditTransactions = wallet.transactions.filter(t => t.type === "credit");
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Platform Credits</span>
            <span className="text-2xl font-bold">${wallet.platformCredits.toFixed(2)}</span>
          </CardTitle>
          <CardDescription>
            Platform credits can be used to pay for Commonly platform services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium">About Platform Credits</h4>
                <p className="text-sm text-muted-foreground">
                  Platform credits are a digital currency that can be used to pay for various services within Commonly. 
                  These credits cannot be withdrawn as cash but can be applied to reduce fees on platform services.
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Where to Use</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-2">
                    <li className="flex gap-2 items-center">
                      <DollarSign className="h-4 w-4 text-green-500" />
                      <span>Pro subscription ($29.99/month)</span>
                    </li>
                    <li className="flex gap-2 items-center">
                      <ShoppingCart className="h-4 w-4 text-purple-500" />
                      <span>Platform fees (5% on transactions)</span>
                    </li>
                    <li className="flex gap-2 items-center">
                      <Calendar className="h-4 w-4 text-blue-500" />
                      <span>Premium event features</span>
                    </li>
                    <li className="flex gap-2 items-center">
                      <Video className="h-4 w-4 text-red-500" />
                      <span>Promoted listings</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center justify-between">
                    <span>How to Earn Credits</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <HelpCircle className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">
                            Earn credits through various activities on the platform
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-2">
                    <li className="flex gap-2 items-center">
                      <div className="h-4 w-4 flex items-center justify-center text-blue-500">🔗</div>
                      <span>Refer friends to Commonly</span>
                    </li>
                    <li className="flex gap-2 items-center">
                      <div className="h-4 w-4 flex items-center justify-center text-green-500">✨</div>
                      <span>Create popular events</span>
                    </li>
                    <li className="flex gap-2 items-center">
                      <div className="h-4 w-4 flex items-center justify-center text-purple-500">🎉</div>
                      <span>Special promotions and offers</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Credit History</CardTitle>
          <CardDescription>Recent platform credit transactions</CardDescription>
        </CardHeader>
        <CardContent>
          {creditTransactions.length > 0 ? (
            <div className="space-y-4">
              {creditTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between border-b pb-3">
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className={`text-right ${transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.amount >= 0 ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              No credit transactions yet
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PlatformCreditsTab;
