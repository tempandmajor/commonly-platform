import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { 
  UserWallet, 
  Transaction, 
  TransactionFilters, 
  ReferralStats,
  PaymentMethod
} from "@/types/wallet";
import { 
  getWalletData, 
  getUserTransactions, 
  createWithdrawal,
  createStripeConnectAccount,
  getReferralStats,
  getPaymentMethods,
} from "@/services/walletService";

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
        brand: "visa",
        last4: "4242",
        expMonth: 12,
        expYear: 2025,
        isDefault: true,
        createdAt: new Date().toISOString()
      }
    ];
  };

  // Fetch transactions with filters
  const fetchTransactions = async (page = 1, pageSize = 10, newFilters?: TransactionFilters) => {
    try {
      setTransactionsLoading(true);
    
      // Update filters if new ones are provided
      const filtersToUse = newFilters ? { ...newFilters } : filters;
      if (newFilters) {
        setFilters(newFilters);
        setCurrentPage(1);
      }
    
      // Get transactions with the given filters
      const result = await getUserTransactions(userId, page, pageSize, filtersToUse);
    
      if (result && Array.isArray(result.transactions)) {
        setTransactions(result.transactions);
        setTotalTransactions(result.total || 0);
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
  };

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
      const url = await createStripeConnectAccount(userId);
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
  const exportTransactionsToCSV = async () => {
    try {
      // Get all transactions for export (with current filters but no pagination)
      const result = await getUserTransactions(userId, 1, 1000, filters);
    
      if (!result || !result.transactions || result.transactions.length === 0) {
        toast({
          title: "No data",
          description: "No transactions to export",
        });
        return;
      }
    
      // Convert data to CSV
      const headers = ["Date", "Type", "Amount", "Status", "Description"];
      const csvContent = [
        headers.join(","),
        ...result.transactions.map(t => [
          new Date(t.createdAt).toLocaleDateString(),
          t.type,
          t.amount.toFixed(2),
          t.status,
          `"${t.description || ""}"`
        ].join(","))
      ].join("\n");
    
      // Create download link
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `transactions-${new Date().toISOString().split("T")[0]}.csv`;
      link.click();
    
      toast({
        title: "Export complete",
        description: "Transactions exported to CSV",
      });
    } catch (error) {
      console.error("Error exporting transactions:", error);
      toast({
        title: "Export failed",
        description: "Failed to export transactions",
        variant: "destructive",
      });
    }
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
