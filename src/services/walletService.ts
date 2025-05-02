
import { PaymentMethod, ReferralStats, Transaction, UserWallet } from "@/types/wallet";
import { supabase } from '@/integrations/supabase/client';

// Get user transactions with filtering
export const getUserTransactions = async (
  userId: string,
  filters: {
    type?: string;
    startDate?: Date;
    endDate?: Date;
    status?: string;
    search?: string;
  },
  page: number = 1,
  pageSize: number = 10
): Promise<{ transactions: Transaction[], total: number }> => {
  try {
    // Mock implementation for now
    // In real implementation, this would query Supabase
    
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Generate mock transactions
    const mockTransactions: Transaction[] = Array.from({ length: 20 }).map((_, i) => ({
      id: `tr-${i + 1}`,
      userId,
      amount: Math.floor(Math.random() * 500) / 100 * (Math.random() > 0.5 ? 1 : -1),
      type: ['payment', 'payout', 'refund', 'deposit', 'withdrawal'][Math.floor(Math.random() * 5)],
      status: ['completed', 'pending', 'failed'][Math.floor(Math.random() * 3)],
      description: `Transaction #${i + 1}`,
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
    }));
    
    // Filter transactions based on filters
    let filtered = [...mockTransactions];
    
    if (filters.type) {
      filtered = filtered.filter(t => t.type === filters.type);
    }
    
    if (filters.status) {
      filtered = filtered.filter(t => t.status === filters.status);
    }
    
    if (filters.search) {
      filtered = filtered.filter(t => 
        t.description?.toLowerCase().includes(filters.search!.toLowerCase()) || 
        t.id.toLowerCase().includes(filters.search!.toLowerCase())
      );
    }
    
    if (filters.startDate) {
      filtered = filtered.filter(t => 
        new Date(t.createdAt) >= new Date(filters.startDate!)
      );
    }
    
    if (filters.endDate) {
      filtered = filtered.filter(t => 
        new Date(t.createdAt) <= new Date(filters.endDate!)
      );
    }
    
    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    // Paginate
    const start = (page - 1) * pageSize;
    const paginatedTransactions = filtered.slice(start, start + pageSize);
    
    return {
      transactions: paginatedTransactions,
      total: filtered.length
    };
  } catch (error) {
    console.error('Error getting transactions:', error);
    throw error;
  }
};

// Get user referral stats
export const getUserReferralStats = async (
  userId: string,
  period: 'week' | 'month' | 'year' | 'all' = 'month'
): Promise<ReferralStats> => {
  try {
    // Mock implementation
    // In real implementation, this would query Supabase
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Generate mock stats based on period
    let clickCount = 0;
    let conversionCount = 0;
    
    switch (period) {
      case 'week':
        clickCount = Math.floor(Math.random() * 50);
        conversionCount = Math.floor(clickCount * 0.2);
        break;
      case 'month':
        clickCount = Math.floor(Math.random() * 200);
        conversionCount = Math.floor(clickCount * 0.15);
        break;
      case 'year':
        clickCount = Math.floor(Math.random() * 1000);
        conversionCount = Math.floor(clickCount * 0.12);
        break;
      case 'all':
        clickCount = Math.floor(Math.random() * 2000);
        conversionCount = Math.floor(clickCount * 0.1);
        break;
    }
    
    const totalEarnings = conversionCount * 5; // $5 per conversion
    const conversionRate = clickCount > 0 ? (conversionCount / clickCount) * 100 : 0;
    
    return {
      totalReferrals: clickCount,
      clickCount,
      conversionCount,
      totalEarnings,
      conversionRate,
      period
    };
  } catch (error) {
    console.error('Error getting referral stats:', error);
    throw error;
  }
};

// Get user payment methods
export const getUserPaymentMethods = async (userId: string): Promise<PaymentMethod[]> => {
  try {
    // Mock implementation
    // In real implementation, this would query Supabase
    
    await new Promise(resolve => setTimeout(resolve, 200));
    
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
  } catch (error) {
    console.error('Error getting payment methods:', error);
    throw error;
  }
};

// Initiate withdrawal
export const initiateWithdrawal = async (userId: string, amount: number): Promise<void> => {
  try {
    // Mock implementation
    // In real implementation, this would call Supabase functions
    
    if (amount <= 0) {
      throw new Error('Amount must be greater than zero');
    }
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In real implementation, would update wallet balance and create transaction
    console.log(`Initiated withdrawal of ${amount} for user ${userId}`);
    
    return;
  } catch (error) {
    console.error('Error initiating withdrawal:', error);
    throw error;
  }
};

// Create Stripe Connect account link
export const createConnectAccountLink = async (userId: string): Promise<string> => {
  try {
    // Mock implementation
    // In real implementation, this would call a Supabase function/API
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Return a mock URL
    return "https://connect.stripe.com/setup/c/mock-account-link";
  } catch (error) {
    console.error('Error creating connect account link:', error);
    throw error;
  }
};
