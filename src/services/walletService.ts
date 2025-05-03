import { supabase } from "@/integrations/supabase/client";
import { UserWallet, Transaction, TransactionFilters, ReferralStats, PaymentMethod } from "@/types/wallet";

// Get user wallet
export const getUserWallet = async (userId: string): Promise<UserWallet | null> => {
  try {
    const { data, error } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) throw error;
    
    if (!data) return null;
    
    return {
      userId: data.user_id,
      totalEarnings: data.total_earnings || 0,
      availableBalance: data.available_balance || 0,
      pendingBalance: data.pending_balance || 0,
      platformCredits: data.platform_credits || 0,
      stripeConnectId: data.stripe_connect_id,
      hasPayoutMethod: data.has_payout_method || false,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      transactions: [] // Transactions are fetched separately
    };
  } catch (error) {
    console.error("Error fetching user wallet:", error);
    throw error;
  }
};

// Get user transactions
export const getUserTransactions = async (
  userId: string,
  page: number = 1,
  pageSize: number = 10,
  filters?: TransactionFilters
): Promise<{ transactions: Transaction[], total: number }> => {
  try {
    let query = supabase
      .from('transactions')
      .select('*', { count: 'exact' })
      .eq('user_id', userId);

    // Apply filters if provided
    if (filters) {
      if (filters.type) {
        query = query.eq('type', filters.type);
      }
      
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      
      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }
      
      if (filters.dateTo) {
        query = query.lte('created_at', filters.dateTo);
      }
    }

    // Add pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    
    // Fetch transactions with pagination
    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    return {
      transactions: data || [],
      total: count || 0
    };
  } catch (error) {
    console.error("Error fetching transactions:", error);
    throw error;
  }
};

// Get referral stats for user
export const getUserReferralStats = async (userId: string, period: string = '30days'): Promise<ReferralStats> => {
  try {
    // In a real implementation, you would fetch this from Supabase
    // This is mock data for development
    return {
      totalReferrals: 12,
      clickCount: 54,
      conversionCount: 8,
      totalEarnings: 120,
      conversionRate: 14.8,
      period
    };
  } catch (error) {
    console.error("Error fetching referral stats:", error);
    throw error;
  }
};

// Get user payment methods
export const getUserPaymentMethods = async (userId: string): Promise<PaymentMethod[]> => {
  try {
    // In a real implementation, you would fetch this from Supabase
    // This is mock data for development
    return [
      {
        id: "pm_1",
        userId: userId,
        type: "card",
        last4: "4242",
        expMonth: 12,
        expYear: 2024,
        isDefault: true,
        createdAt: new Date().toISOString()
      }
    ];
  } catch (error) {
    console.error("Error fetching payment methods:", error);
    throw error;
  }
};

// Initiate a withdrawal
export const initiateWithdrawal = async (userId: string, amount: number): Promise<{ success: boolean; message: string }> => {
  try {
    // In a real implementation, you would create a withdrawal request in Supabase
    // Mock implementation for development
    console.log(`Initiating withdrawal of $${amount} for user ${userId}`);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      message: `Withdrawal of $${amount.toFixed(2)} initiated successfully.`
    };
  } catch (error) {
    console.error("Error initiating withdrawal:", error);
    throw error;
  }
};

// Create a Stripe Connect account link
export const createConnectAccountLink = async (userId: string): Promise<{ url: string }> => {
  try {
    // In a real implementation, you would call a serverless function to create a Stripe Connect account link
    // Mock implementation for development
    console.log(`Creating Stripe Connect account link for user ${userId}`);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return a mock URL
    return {
      url: "https://connect.stripe.com/setup/s/mock-link"
    };
  } catch (error) {
    console.error("Error creating Connect account link:", error);
    throw error;
  }
};
