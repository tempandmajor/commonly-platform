
import { supabase } from "@/integrations/supabase/client";
import { 
  Transaction, 
  WalletData, 
  ReferralStats, 
  PaymentMethod, 
  TransactionFilters,
  WithdrawalRequest
} from "@/types/wallet";

// Get wallet data for a user
export const getUserWallet = async (userId: string): Promise<WalletData> => {
  try {
    const { data, error } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) throw error;
    
    if (!data) {
      // Create wallet if it doesn't exist
      const { data: newWallet, error: createError } = await supabase
        .from('wallets')
        .insert({ user_id: userId })
        .select()
        .single();
      
      if (createError) throw createError;
      
      if (!newWallet) {
        // Provide default wallet data if creation failed
        return {
          id: `temp_${userId}`,
          userId: userId,
          availableBalance: 0,
          pendingBalance: 0,
          totalEarnings: 0,
          platformCredits: 0,
          hasPayoutMethod: false,
          stripeConnectId: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      }
      
      // Map DB wallet to our wallet data structure
      return {
        id: newWallet.id || `new_${userId}`,
        userId: newWallet.user_id,
        availableBalance: newWallet.available_balance || 0,
        pendingBalance: newWallet.pending_balance || 0,
        totalEarnings: newWallet.total_earnings || 0,
        platformCredits: newWallet.platform_credits || 0,
        hasPayoutMethod: newWallet.has_payout_method || false,
        stripeConnectId: newWallet.stripe_connect_id,
        createdAt: newWallet.created_at || new Date().toISOString(),
        updatedAt: newWallet.updated_at || new Date().toISOString()
      };
    }
    
    return {
      id: `wallet_${userId}`, // Generate an ID if none exists
      userId: data.user_id,
      availableBalance: data.available_balance || 0,
      pendingBalance: data.pending_balance || 0,
      totalEarnings: data.total_earnings || 0,
      platformCredits: data.platform_credits || 0,
      hasPayoutMethod: data.has_payout_method || false,
      stripeConnectId: data.stripe_connect_id,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  } catch (error) {
    console.error("Error getting wallet data:", error);
    throw error;
  }
};

// Get user transactions with pagination and filtering
export const getUserTransactions = async (
  userId: string,
  page: number = 1,
  limit: number = 10,
  filters: TransactionFilters = {}
): Promise<{ transactions: Transaction[]; totalCount: number }> => {
  try {
    let query = supabase
      .from('transactions')
      .select('*', { count: 'exact' })
      .eq('user_id', userId);
    
    // Apply filters
    if (filters.search) {
      query = query.ilike('description', `%${filters.search}%`);
    }
    
    if (filters.type) {
      query = query.eq('type', filters.type);
    }
    
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    
    if (filters.startDate) {
      query = query.gte('created_at', filters.startDate.toISOString());
    }
    
    if (filters.endDate) {
      // Add a day to include the end date
      const endDate = new Date(filters.endDate);
      endDate.setDate(endDate.getDate() + 1);
      query = query.lt('created_at', endDate.toISOString());
    }
    
    // Add pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    
    query = query
      .order('created_at', { ascending: false })
      .range(from, to);
    
    const { data, error, count } = await query;
    
    if (error) throw error;
    
    const transactions: Transaction[] = (data || []).map(item => ({
      id: item.id,
      userId: item.user_id,
      amount: item.amount,
      type: item.type as Transaction['type'], // Cast to the specific union type
      status: item.status as Transaction['status'] || 'completed',
      description: item.description || '',
      createdAt: item.created_at,
      updatedAt: item.updated_at
    }));
    
    return {
      transactions,
      totalCount: count || 0
    };
  } catch (error) {
    console.error("Error getting user transactions:", error);
    return {
      transactions: [],
      totalCount: 0
    };
  }
};

// Create a withdrawal request
export const requestWithdrawal = async (
  userId: string,
  withdrawalData: WithdrawalRequest
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        amount: withdrawalData.amount,
        type: 'withdrawal',
        status: 'pending',
        description: `Withdrawal request ${withdrawalData.notes ? `- ${withdrawalData.notes}` : ''}`,
        payment_method_id: withdrawalData.paymentMethodId
      });
    
    if (error) throw error;
    
    // Update the wallet balance directly using RPC function
    const { error: updateError } = await supabase
      .from('wallets')
      .update({ 
        available_balance: supabase.rpc('decrement_wallet_amount', {
          p_user_id: userId,
          p_amount: withdrawalData.amount
        })
      })
      .eq('user_id', userId);
    
    if (updateError) throw updateError;
    
    return true;
  } catch (error) {
    console.error("Error requesting withdrawal:", error);
    throw error;
  }
};

// Create a Stripe Connect account link
export const createStripeConnectAccountLink = async (
  userId: string
): Promise<string> => {
  try {
    // This should be an edge function in a real app
    // For now, we'll just simulate it
    const response = await fetch('/api/stripe/create-connect-link', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId })
    });
    
    if (!response.ok) {
      throw new Error('Failed to create connect link');
    }
    
    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error("Error creating Stripe connect link:", error);
    throw error;
  }
};

// Get user's referral statistics
export const getUserReferralStats = async (userId: string, period: 'week' | 'month' | 'year' | 'all' = 'month'): Promise<ReferralStats> => {
  // This would ideally fetch from your database
  // For now returning mock data
  return {
    userId,
    totalEarnings: 350.25,
    clickCount: 142,
    conversionCount: 18,
    conversionRate: 12.7,
    totalReferrals: 18,
    period
  };
};

// Get user's payment methods
export const getUserPaymentMethods = async (userId: string): Promise<PaymentMethod[]> => {
  // This would ideally fetch from your database or Stripe
  // For now returning mock data
  return [
    {
      id: "pm_1",
      userId: userId,
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
      userId: userId,
      type: "card",
      brand: "Mastercard",
      last4: "5555",
      expMonth: 10,
      expYear: 2024,
      isDefault: false,
      createdAt: new Date().toISOString()
    }
  ];
};
