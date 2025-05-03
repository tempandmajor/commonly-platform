
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWallet } from "@/hooks/useWallet";
import WalletOverview from "./WalletOverview";
import TransactionsTab from "./TransactionsTab";
import PlatformCreditsTab from "./PlatformCreditsTab";
import ReferralsTab from "./ReferralsTab";
import PaymentMethodsTab from "./PaymentMethodsTab";
import { Loader2 } from "../ui/icons";

interface WalletDashboardProps {
  userId: string;
}

const WalletDashboard: React.FC<WalletDashboardProps> = ({ userId }) => {
  const {
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
  } = useWallet(userId);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!walletData) {
    return (
      <Card>
        <CardContent className="py-6">
          <p className="text-center text-muted-foreground">
            Could not load wallet information. Please try again later.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Create a combined wallet object that matches the UserWallet type expected by components
  const wallet = {
    ...walletData,
    transactions: transactions,
    stripeConnectId: walletData.stripeConnectId || null,
    platformCredits: walletData.platformCredits || 0
  };

  // Create wrapper functions to handle return type mismatches
  const handleWithdrawalWrapper = async (amount: number): Promise<void> => {
    await handleWithdrawal(amount);
  };

  const handleCreateConnectAccountWrapper = async (): Promise<void> => {
    await handleCreateConnectAccount();
  };

  return (
    <div className="space-y-6">
      <WalletOverview 
        wallet={wallet} 
        onWithdraw={handleWithdrawalWrapper} 
        withdrawalLoading={withdrawalLoading}
        onConnectAccount={handleCreateConnectAccountWrapper}
        connectAccountLoading={connectAccountLoading}
      />
      
      <Tabs defaultValue="transactions" className="w-full">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="credits">Platform Credits</TabsTrigger>
          <TabsTrigger value="referrals">Referral Earnings</TabsTrigger>
          <TabsTrigger value="payment-methods">Payment Methods</TabsTrigger>
        </TabsList>
        
        <TabsContent value="transactions" className="mt-4">
          <TransactionsTab 
            transactions={transactions}
            loading={transactionsLoading}
            filters={filters}
            currentPage={currentPage}
            totalTransactions={totalTransactions}
            onFilterChange={setFilters}
            onPageChange={setCurrentPage}
            onExport={exportTransactionsToCSV}
          />
        </TabsContent>
        
        <TabsContent value="credits" className="mt-4">
          <PlatformCreditsTab wallet={wallet} refreshWallet={loadWalletData} />
        </TabsContent>
        
        <TabsContent value="referrals" className="mt-4">
          <ReferralsTab 
            referralStats={referralStats} 
            onPeriodChange={(period) => loadReferralStats(period)} 
          />
        </TabsContent>
        
        <TabsContent value="payment-methods" className="mt-4">
          <PaymentMethodsTab 
            paymentMethods={paymentMethods} 
            refreshPaymentMethods={loadWalletData} 
            hasStripeConnect={!!wallet.stripeConnectId}
            onConnectAccount={handleCreateConnectAccountWrapper}
            connectAccountLoading={connectAccountLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WalletDashboard;
