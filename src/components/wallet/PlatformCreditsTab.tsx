import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Coins, Loader2 } from "lucide-react";
import { format } from "date-fns";

interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  type: string;
  status: string;
  description: string;
  created_at: string;
}

const PlatformCreditsTab = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [wallet, setWallet] = useState<{ platformCredits: number } | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load user wallet on component mount
  useEffect(() => {
    const loadWallet = async () => {
      if (currentUser) {
        setIsLoading(true);
        try {
          const { data: walletData } = await supabase
            .from('wallets')
            .select('*')
            .eq('user_id', currentUser.uid)
            .single();
            
          if (walletData) {
            setWallet(walletData);
          }
          
          // Get recent transactions
          const { data: transactionsData } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', currentUser.uid)
            .order('created_at', { ascending: false })
            .limit(5);
            
          if (transactionsData) {
            setTransactions(transactionsData);
          }
          
        } catch (error) {
          console.error("Error loading wallet data:", error);
          toast({
            title: "Error loading wallet data",
            description: "Please try again later",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadWallet();
  }, [currentUser, toast]);

  return (
    <div>
      {/* Platform credits info */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Credits</CardTitle>
          <CardDescription>
            View your available platform credits and recent transactions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Coins className="h-5 w-5 text-yellow-500" />
                <span className="text-2xl font-semibold">
                  {wallet?.platformCredits || 0} Credits
                </span>
              </div>
              <div>
                <h3 className="text-lg font-medium">Recent Transactions</h3>
                {transactions.length > 0 ? (
                  <ul className="mt-2 space-y-2">
                    {transactions.map((transaction) => (
                      <li key={transaction.id} className="border rounded-md p-3">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium">{transaction.description}</div>
                            <div className="text-sm text-gray-500">
                              {format(new Date(transaction.created_at), "MMM d, yyyy h:mm a")}
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge
                              variant="secondary"
                              className={transaction.type === "credit" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}
                            >
                              {transaction.type === "credit" ? "+" : "-"} {transaction.amount}
                            </Badge>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No recent transactions.</p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PlatformCreditsTab;
