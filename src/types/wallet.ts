
export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: 'referral' | 'payout' | 'sale' | 'credit' | 'withdrawal' | 'fee';
  status: 'pending' | 'completed' | 'failed' | 'canceled';
  description: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PaymentMethod {
  id: string;
  userId: string;
  type: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
  createdAt: string;
}

export interface WalletData {
  availableBalance: number;
  pendingBalance: number;
  totalEarnings: number;
  platformCredits: number;
  hasPayoutMethod: boolean;
  stripeConnectId?: string;
}

export interface ReferralStats {
  totalReferrals: number;
  activeReferrals: number;
  referralEarnings: number;
  pendingEarnings: number;
}

export interface WithdrawalRequest {
  amount: number;
  paymentMethodId?: string;
  notes?: string;
}

export interface TransactionFilters {
  search?: string;
  type?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
}
