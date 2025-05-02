import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { PaymentMethod, ReferralStats, Transaction, UserWallet } from "@/types/wallet";
import { useToast } from "@/hooks/use-toast";

interface TransactionFilters {
  type?: string;
  startDate?: Date;
  endDate?: Date;
  status?: string;
  search?: string;
}

export const useWallet = (userId: string) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [wallet, setWallet] = useState<UserWallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [referralStats, setReferralStats] = useState<ReferralStats | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [transactionsLoading, setTransactionsLoading] = useState<boolean>(false);
  const [withdrawalLoading, setWithdrawalLoading] = useState<boolean>(false);
  const [connectAccountLoading, setConnectAccountLoading] = useState<boolean>(false);
  const [filters, setFilters] = useState<TransactionFilters>({});
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalTransactions, setTotalTransactions] = useState<number>(0);
  const [statsPeriod, setStatsPeriod] = useState<'week' | 'month' | 'year' | 'all'>('month');

  // Mock implementation for now
  const fetchWalletData = useCallback(async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setWallet({
        userId,
        totalEarnings: 1250.75,
        availableBalance: 875.50,
        pendingBalance: 200.00,
        platformCredits: 50,
        stripeConnectId: null,
        hasPayoutMethod: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        transactions: []
      });
      setPaymentMethods(generateMockPaymentMethods(userId));
      setLoading(false);
    }, 800);
  }, [userId]);

  // Mock helper function
  const generateMockPaymentMethods = (userId: string): PaymentMethod[] => {
    return [
      {
        id: "pm_1",
        userId,
        type: "card",
        brand: "Visa",
        last4: "4242",
        expMonth: 12,
        expYear: 2025,
        isDefault: true,
        createdAt: new Date().toISOString()
      }
    ];
  };

  // Fetch transactions with filters
  const fetchTransactions = useCallback(async (
    page: number = 1,
    pageSize: number = 10,
    newFilters?: TransactionFilters
  ) => {
    if (!userId) return;
    
    setTransactionsLoading(true);
    try {
      const filtersToUse = newFilters || filters;
      const { transactions: fetchedTransactions, total } = await getUserTransactions(
        userId,
        filtersToUse,
        page,
        pageSize
      );
      
      setTransactions(fetchedTransactions);
      setTotalTransactions(total);
      setCurrentPage(page);
      
      if (newFilters) {
        setFilters(newFilters);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast({
        title: "Error",
        description: "Failed to load transactions",
        variant: "destructive",
      });
    } finally {
      setTransactionsLoading(false);
    }
  }, [userId, filters, toast]);

  // Fetch referral stats
  const fetchReferralStats = useCallback(async (period: 'week' | 'month' | 'year' | 'all' = 'month') => {
    if (!userId) return;
    
    try {
      const stats = await getUserReferralStats(userId, period);
      setReferralStats(stats);
      setStatsPeriod(period);
    } catch (error) {
      console.error("Error fetching referral stats:", error);
      toast({
        title: "Error",
        description: "Failed to load referral statistics",
        variant: "destructive",
      });
    }
  }, [userId, toast]);

  // Fetch payment methods
  const fetchPaymentMethods = useCallback(async () => {
    if (!userId) return;
    
    try {
      const methods = await getUserPaymentMethods(userId);
      setPaymentMethods(methods);
    } catch (error) {
      console.error("Error fetching payment methods:", error);
      toast({
        title: "Error",
        description: "Failed to load payment methods",
        variant: "destructive",
      });
    }
  }, [userId, toast]);

  // Initiate withdrawal
  const handleWithdrawal = async (amount: number) => {
    if (!userId || !wallet) return;
    
    if (amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Withdrawal amount must be greater than zero",
        variant: "destructive",
      });
      return;
    }
    
    if (amount > wallet.availableBalance) {
      toast({
        title: "Insufficient funds",
        description: "Withdrawal amount exceeds available balance",
        variant: "destructive",
      });
      return;
    }
    
    setWithdrawalLoading(true);
    try {
      await initiateWithdrawal(userId, amount);
      toast({
        title: "Withdrawal initiated",
        description: "Your withdrawal has been initiated and will be processed shortly",
      });
      await fetchWalletData();
    } catch (error) {
      console.error("Error initiating withdrawal:", error);
      toast({
        title: "Withdrawal failed",
        description: error instanceof Error ? error.message : "Failed to process withdrawal",
        variant: "destructive",
      });
    } finally {
      setWithdrawalLoading(false);
    }
  };

  // Create Stripe Connect account link
  const handleCreateConnectAccount = async () => {
    if (!userId) return;
    
    setConnectAccountLoading(true);
    try {
      const url = await createConnectAccountLink(userId);
      window.open(url, "_blank");
    } catch (error) {
      console.error("Error creating Connect account:", error);
      toast({
        title: "Error",
        description: "Failed to create Stripe Connect account link",
        variant: "destructive",
      });
    } finally {
      setConnectAccountLoading(false);
    }
  };

  // Export transactions to CSV
  const exportTransactionsToCSV = () => {
    if (transactions.length === 0) {
      toast({
        title: "No transactions",
        description: "There are no transactions to export",
        variant: "destructive",
      });
      return;
    }
    
    // Create CSV content
    const headers = "ID,Date,Description,Amount,Type,Status\n";
    const csvContent = transactions.reduce((content, transaction) => {
      const row = [
        transaction.id,
        new Date(transaction.createdAt).toLocaleDateString(),
        `"${transaction.description.replace(/"/g, '""')}"`,
        transaction.amount.toFixed(2),
        transaction.type,
        transaction.status
      ].join(',');
      return content + row + '\n';
    }, headers);
    
    // Create download link
    const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `transactions-${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Initial data loading
  useEffect(() => {
    if (userId) {
      fetchWalletData();
    }
  }, [userId, fetchWalletData]);

  return {
    wallet,
    transactions,
    referralStats,
    paymentMethods,
    loading,
    transactionsLoading,
    withdrawalLoading,
    connectAccountLoading,
    currentPage,
    totalTransactions,
    filters,
    fetchWalletData,
    fetchTransactions,
    fetchReferralStats,
    fetchPaymentMethods,
    handleWithdrawal,
    handleCreateConnectAccount,
    exportTransactionsToCSV,
    setFilters,
    setCurrentPage
  };
};
