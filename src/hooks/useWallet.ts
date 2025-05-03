
import { useState, useEffect, useCallback } from "react";
import { Transaction, PaymentMethod, ReferralStats, UserWallet, TransactionFilters, WalletData } from "@/types/wallet";
import { useToast } from "./use-toast";

export const useWallet = (userId: string) => {
  // State for wallet data
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [referralStats, setReferralStats] = useState<ReferralStats>({
    userId,
    totalEarnings: 0,
    clickCount: 0,
    conversionCount: 0,
    conversionRate: 0,
    period: 'month'
  });

  // UI state
  const [loading, setLoading] = useState(true);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [withdrawalLoading, setWithdrawalLoading] = useState(false);
  const [connectAccountLoading, setConnectAccountLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [filters, setFilters] = useState<TransactionFilters>({});

  const { toast } = useToast();

  // Load wallet data
  const loadWalletData = useCallback(async () => {
    setLoading(true);
    try {
      // In a real app, this would be an API call to fetch wallet data
      // For demonstration, we'll use mock data
      const mockWalletData: WalletData = {
        id: "wallet_1",
        userId,
        availableBalance: 235.50,
        pendingBalance: 75.00,
        totalEarnings: 1250.75,
        platformCredits: 25,
        stripeConnectId: null,
        hasPayoutMethod: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Mock payment methods
      const mockPaymentMethods: PaymentMethod[] = [
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
        },
        {
          id: "pm_2",
          userId,
          type: "card",
          brand: "Mastercard",
          last4: "5555",
          expMonth: 10,
          expYear: 2024,
          isDefault: false,
          createdAt: new Date().toISOString()
        }
      ];

      setWalletData(mockWalletData);
      setPaymentMethods(mockPaymentMethods);
    } catch (error) {
      console.error("Error loading wallet data:", error);
      toast({
        title: "Error loading wallet data",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [userId, toast]);

  // Load transactions with filtering and pagination
  const loadTransactions = useCallback(async () => {
    setTransactionsLoading(true);
    try {
      // In a real app, this would be an API call with filters and pagination
      // For demonstration, we'll use mock data
      const mockTransactions: Transaction[] = [
        {
          id: "tx_1",
          userId,
          amount: 50.00,
          type: "referral",
          status: "completed",
          description: "Referral bonus",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: "tx_2",
          userId,
          amount: 75.00,
          type: "payout",
          status: "pending",
          description: "Weekly payout",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: "tx_3",
          userId,
          amount: 120.00,
          type: "sale",
          status: "completed",
          description: "Event ticket sales",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

      setTransactions(mockTransactions);
      setTotalTransactions(mockTransactions.length);
    } catch (error) {
      console.error("Error loading transactions:", error);
      toast({
        title: "Error loading transactions",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setTransactionsLoading(false);
    }
  }, [userId, filters, currentPage, toast]);

  // Load referral statistics
  const loadReferralStats = useCallback(async (period: 'week' | 'month' | 'year' | 'all' = 'month') => {
    try {
      // In a real app, this would be an API call
      // For demonstration, we'll use mock data
      setReferralStats({
        userId,
        totalEarnings: 350.25,
        clickCount: 142,
        conversionCount: 18,
        conversionRate: 12.7,
        totalReferrals: 18,
        period
      });
    } catch (error) {
      console.error("Error loading referral stats:", error);
      toast({
        title: "Error loading referral statistics",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  }, [userId, toast]);

  // Handle withdrawal
  const handleWithdrawal = async (amount: number) => {
    setWithdrawalLoading(true);
    try {
      // In a real app, this would call an API endpoint
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
      
      toast({
        title: "Withdrawal Initiated",
        description: `$${amount.toFixed(2)} will be transferred to your account within 1-3 business days.`,
      });
      
      // Refresh wallet data
      await loadWalletData();
      return { success: true, message: "Withdrawal successful" };
    } catch (error) {
      console.error("Error processing withdrawal:", error);
      toast({
        title: "Withdrawal Failed",
        description: "Please try again later.",
        variant: "destructive",
      });
      return { success: false, message: "Withdrawal failed" };
    } finally {
      setWithdrawalLoading(false);
    }
  };

  // Handle connecting a Stripe account
  const handleCreateConnectAccount = async () => {
    setConnectAccountLoading(true);
    try {
      // In a real app, this would call an API endpoint
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
      
      toast({
        title: "Account Connection Initiated",
        description: "You'll be redirected to complete the setup.",
      });
      
      // Refresh wallet data
      await loadWalletData();
      return { success: true, url: "https://example.com/connect" };
    } catch (error) {
      console.error("Error creating connect account:", error);
      toast({
        title: "Account Connection Failed",
        description: "Please try again later.",
        variant: "destructive",
      });
      return { success: false, message: "Connection failed" };
    } finally {
      setConnectAccountLoading(false);
    }
  };

  // Export transactions to CSV
  const exportTransactionsToCSV = () => {
    // This would generate and download a CSV file
    toast({
      title: "Export Started",
      description: "Your CSV export is being prepared.",
    });
  };

  // Load data on component mount
  useEffect(() => {
    if (userId) {
      loadWalletData();
      loadTransactions();
      loadReferralStats();
    }
  }, [userId, loadWalletData, loadTransactions, loadReferralStats]);

  // Load transactions when filters or pagination changes
  useEffect(() => {
    if (userId) {
      loadTransactions();
    }
  }, [userId, filters, currentPage, loadTransactions]);

  // Combine wallet data with transactions for easy access
  const combinedWallet: UserWallet = walletData ? {
    id: walletData.id,
    userId: walletData.userId,
    availableBalance: walletData.availableBalance,
    pendingBalance: walletData.pendingBalance,
    totalEarnings: walletData.totalEarnings,
    platformCredits: walletData.platformCredits,
    transactions: transactions,
    hasPayoutMethod: walletData.hasPayoutMethod,
    stripeConnectId: walletData.stripeConnectId,
    createdAt: walletData.createdAt,
    updatedAt: walletData.updatedAt
  } : {
    id: '',
    userId: '',
    availableBalance: 0,
    pendingBalance: 0,
    totalEarnings: 0,
    platformCredits: 0,
    stripeConnectId: null,
    hasPayoutMethod: false,
    transactions: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  return {
    walletData,
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
    loadWalletData,
    loadTransactions,
    loadReferralStats,
    handleWithdrawal,
    handleCreateConnectAccount,
    exportTransactionsToCSV,
    setFilters,
    setCurrentPage
  };
};
