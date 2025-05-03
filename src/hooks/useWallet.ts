
import { useState, useEffect } from 'react';
import { 
  Transaction, 
  WalletData, 
  ReferralStats, 
  PaymentMethod, 
  WithdrawalRequest,
  TransactionFilters 
} from '@/types/wallet';
import {
  getUserTransactions,
  getUserWallet,
  requestWithdrawal,
  createStripeConnectAccountLink
} from '@/services/walletService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from './use-toast';

export function useWallet() {
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [referralStats, setReferralStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [filters, setFilters] = useState<TransactionFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [connectAccountLoading, setConnectAccountLoading] = useState(false);
  const { toast } = useToast();
  const { currentUser } = useAuth();

  // Fetch wallet data
  useEffect(() => {
    const fetchWalletData = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        const data = await getUserWallet(currentUser.uid);
        setWalletData(data);
      } catch (error) {
        console.error('Error fetching wallet data:', error);
        toast({
          title: "Error",
          description: "Failed to load wallet data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchWalletData();
  }, [currentUser, toast]);

  // Load transactions with pagination and filters
  const loadTransactions = async () => {
    if (!currentUser) return;
    
    try {
      setTransactionsLoading(true);
      
      const result = await getUserTransactions(
        currentUser.uid,
        currentPage,
        10, // pageSize
        filters
      );
      
      setTransactions(result.transactions);
      setTotalTransactions(result.totalCount);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast({
        title: "Error",
        description: "Failed to load transactions",
        variant: "destructive",
      });
    } finally {
      setTransactionsLoading(false);
    }
  };

  // Load referral stats
  const loadReferralStats = async () => {
    if (!currentUser) return;
    
    try {
      // Using correct function name as imported
      const stats = await getUserReferralStats(currentUser.uid);
      setReferralStats(stats);
    } catch (error) {
      console.error('Error fetching referral stats:', error);
      toast({
        title: "Error",
        description: "Failed to load referral statistics",
        variant: "destructive",
      });
    }
  };

  // Load payment methods
  const loadPaymentMethods = async () => {
    if (!currentUser) return;
    
    try {
      // Using correct function name as imported
      const methods = await getUserPaymentMethods(currentUser.uid);
      setPaymentMethods(methods);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      toast({
        title: "Error",
        description: "Failed to load payment methods",
        variant: "destructive",
      });
    }
  };

  // Trigger a refresh of all wallet data
  const refreshWalletData = async () => {
    setLoading(true);
    
    try {
      if (currentUser) {
        await Promise.all([
          getUserWallet(currentUser.uid).then(setWalletData),
          loadTransactions(),
          loadReferralStats(),
          loadPaymentMethods(),
        ]);
      }
    } catch (error) {
      console.error('Error refreshing wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initiate a withdrawal
  const initiateWithdrawal = async (withdrawalData: WithdrawalRequest) => {
    if (!currentUser || !walletData) {
      toast({
        title: "Error",
        description: "User information is missing",
        variant: "destructive",
      });
      return false;
    }
    
    if (walletData.availableBalance < withdrawalData.amount) {
      toast({
        title: "Insufficient balance",
        description: "You don't have enough funds to withdraw this amount",
        variant: "destructive",
      });
      return false;
    }
    
    try {
      // Using correct function
      await requestWithdrawal(currentUser.uid, withdrawalData);
      
      toast({
        title: "Withdrawal requested",
        description: "Your withdrawal request has been submitted",
      });
      
      await refreshWalletData();
      return true;
    } catch (error) {
      console.error('Error initiating withdrawal:', error);
      toast({
        title: "Error",
        description: "Failed to request withdrawal",
        variant: "destructive",
      });
      return false;
    }
  };

  // Connect Stripe account for payouts
  const connectStripeAccount = async () => {
    if (!currentUser) return;
    
    try {
      setConnectAccountLoading(true);
      const url = await createStripeConnectAccountLink(currentUser.uid);
      
      if (url) {
        window.location.href = url;
        return true;
      } else {
        throw new Error("Failed to create account link");
      }
    } catch (error) {
      console.error('Error connecting Stripe account:', error);
      toast({
        title: "Error",
        description: "Failed to initiate Stripe Connect",
        variant: "destructive",
      });
      return false;
    } finally {
      setConnectAccountLoading(false);
    }
  };

  // Filter transactions
  const handleFilterChange = (newFilters: TransactionFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Change page
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Export transactions to CSV
  const exportTransactions = () => {
    if (transactions.length === 0) return;
    
    // Create CSV content
    const headers = ['Date', 'Type', 'Amount', 'Status', 'Description'];
    const csvContent = [
      headers.join(','),
      ...transactions.map(t => [
        new Date(t.createdAt).toLocaleDateString(),
        t.type,
        t.amount.toFixed(2),
        t.status,
        `"${t.description.replace(/"/g, '""')}"`
      ].join(','))
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `transactions-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Load initial data
  useEffect(() => {
    if (currentUser) {
      loadTransactions();
    }
  }, [currentUser, filters, currentPage]);

  return {
    walletData,
    transactions,
    paymentMethods,
    referralStats,
    loading,
    transactionsLoading,
    connectAccountLoading,
    filters,
    currentPage,
    totalTransactions,
    refreshWalletData,
    initiateWithdrawal,
    connectStripeAccount,
    handleFilterChange,
    handlePageChange,
    exportTransactions,
    loadPaymentMethods,
  };
}
