export interface Transaction {
  id: string;
  userId: string;
  type: 'deposit' | 'withdrawal' | 'payment' | 'refund' | 'referral';
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
  description?: string;
}

// Add UserWallet interface
export interface UserWallet {
  id: string;
  userId: string;
  availableBalance: number;
  pendingBalance: number;
  totalEarnings: number;
  platformCredits: number;
  stripeCustomerId?: string;
  stripeConnectId?: string | null;
  hasPayoutMethod: boolean;
  createdAt: string;
  updatedAt: string;
  transactions: Transaction[];
}

export interface PaymentMethod {
  id: string;
  userId: string;
  type: 'card' | 'paypal' | 'bank_account';
  brand?: string;
  last4?: string;
  expMonth?: number;
  expYear?: number;
  isDefault: boolean;
  createdAt: string;
}

export interface ReferralStats {
  userId: string;
  totalEarnings: number;
  clickCount: number;
  conversionCount: number;
  conversionRate: number;
  period: 'week' | 'month' | 'year' | 'all';
  // Add other properties as needed
}
