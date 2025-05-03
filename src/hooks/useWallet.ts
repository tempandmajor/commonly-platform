import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { WalletData, Transaction, PaymentMethod, ReferralStats, TransactionFilters, UserWallet } from "@/types/wallet";

export const useWallet = (userId: string) => {
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [referralStats, setReferralStats] = useState<ReferralStats>({
    totalReferrals: 0,
    activeReferrals: 0,
    referralEarnings: 0,
    pendingEarnings: 0,
    clickCount: 0,
    conversionCount: 0,
    conversionRate: 0,
    totalEarnings: 0
  });
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [withdrawalLoading, setWithdrawalLoading] = useState(false);
  const [connectAccountLoading, setConnectAccountLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [filters, setFilters] = useState<TransactionFilters>({});

  // Fetch wallet data
  const loadWalletData = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error) {
        console.error("Error fetching wallet:", error);
        return;
      }
      
      if (data) {
        setWalletData({
          availableBalance: data.available_balance || 0,
          pendingBalance: data.pending_balance || 0,
          totalEarnings: data.total_earnings || 0,
          platformCredits: data.platform_credits || 0,
          hasPayoutMethod: data.has_payout_method || false,
          stripeConnectId: data.stripe_connect_id
        });
      }
      
      // Also load payment methods
      await loadPaymentMethods();
    } catch (error) {
      console.error("Error in loadWalletData:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch transactions with pagination and filtering
  const loadTransactions = async (page = 1, pageSize = 10) => {
    if (!userId) return;
    
    try {
      setTransactionsLoading(true);
      
      const { data, error, count } = await supabase
        .from('transactions')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1);
      
      if (error) {
        console.error("Error fetching transactions:", error);
        return;
      }
      
      if (data) {
        const formattedTransactions: Transaction[] = data.map(item => ({
          id: item.id,
          userId: item.user_id,
          amount: item.amount,
          type: item.type as 'referral' | 'payout' | 'sale' | 'credit' | 'withdrawal' | 'fee',
          status: item.status as 'pending' | 'completed' | 'failed' | 'canceled',
          description: item.description,
          createdAt: item.created_at,
          updatedAt: item.updated_at
        }));
        
        setTransactions(formattedTransactions);
        setTotalTransactions(count || 0);
      }
    } catch (error) {
      console.error("Error in loadTransactions:", error);
    } finally {
      setTransactionsLoading(false);
    }
  };

  // Fetch referral stats
  const loadReferralStats = async (period?: 'week' | 'month' | 'year' | 'all') => {
    if (!userId) return;
    
    try {
      // Implement referral stats fetching from Supabase here
      // This is a placeholder implementation
      setReferralStats({
        totalReferrals: 0,
        activeReferrals: 0,
        referralEarnings: 0,
        pendingEarnings: 0,
        clickCount: 0,
        conversionCount: 0,
        conversionRate: 0,
        totalEarnings: 0,
        period: period
      });
    } catch (error) {
      console.error("Error fetching referral stats:", error);
    }
  };

  // Handle withdrawal request
  const handleWithdrawal = async (amount: number): Promise<{success: boolean, message: string}> => {
    if (!userId) return { success: false, message: "User not authenticated" };
    
    try {
      setWithdrawalLoading(true);
      
      // Implement withdrawal request logic here
      
      // Refresh wallet data after withdrawal
      await fetchWalletData();
      
      return { success: true, message: "Withdrawal request submitted successfully" };
    } catch (error) {
      console.error("Error in handleWithdrawal:", error);
      return { success: false, message: "Failed to submit withdrawal request" };
    } finally {
      setWithdrawalLoading(false);
    }
  };

  // Handle creating Stripe Connect account
  const handleCreateConnectAccount = async (): Promise<{success: boolean, url?: string, message?: string}> => {
    if (!userId) return { success: false, message: "User not authenticated" };
    
    try {
      setConnectAccountLoading(true);
      
      // Implement Stripe Connect account creation logic here
      
      // Refresh wallet data after account creation
      await fetchWalletData();
      
      return { success: true, url: "https://connect.stripe.com/..." };
    } catch (error) {
      console.error("Error in handleCreateConnectAccount:", error);
      return { success: false, message: "Failed to create Stripe Connect account" };
    } finally {
      setConnectAccountLoading(false);
    }
  };

  // Export transactions to CSV
  const exportTransactionsToCSV = async (): Promise<{success: boolean, message: string}> => {
    if (!userId || transactions.length === 0) return { success: false, message: "No transactions to export" };
    
    try {
      // Implement CSV export logic here
      
      return { success: true, message: "Transactions exported successfully" };
    } catch (error) {
      console.error("Error in exportTransactionsToCSV:", error);
      return { success: false, message: "Failed to export transactions" };
    }
  };

  // Load payment methods
  const loadPaymentMethods = async () => {
    if (!userId) return;
    
    try {
      // Implement payment methods loading logic here
      // This is a placeholder implementation
      setPaymentMethods([]);
    } catch (error) {
      console.error("Error loading payment methods:", error);
    }
  };

  // Provide wallet data in the format expected by components
  const wallet: UserWallet = walletData ? {
    availableBalance: walletData.availableBalance,
    pendingBalance: walletData.pendingBalance,
    totalEarnings: walletData.totalEarnings,
    platformCredits: walletData.platformCredits || 0,
    transactions: transactions,
    hasPayoutMethod: walletData.hasPayoutMethod,
    stripeConnectId: walletData.stripeConnectId
  } : {
    availableBalance: 0,
    pendingBalance: 0,
    totalEarnings: 0,
    platformCredits: 0,
    transactions: [],
    hasPayoutMethod: false
  };

  // Initial data load
  useEffect(() => {
    if (userId) {
      loadWalletData();
      loadTransactions(1, 10);
      loadReferralStats();
    }
  }, [userId]);

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
