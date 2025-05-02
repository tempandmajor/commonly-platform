
export interface UserWallet {
  userId: string;
  totalEarnings: number;
  availableBalance: number;
  pendingBalance: number;
  platformCredits: number;
  stripeConnectId?: string;
  hasPayoutMethod: boolean;
  createdAt: string;
  updatedAt: string;
  transactions: Transaction[];
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: string;
  status: string;
  description?: string;
  eventId?: string;
  referralId?: string;
  orderId?: string;
  paymentMethodId?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ReferralStats {
  totalReferrals: number;
  clickCount: number;
  conversionCount: number;
  totalEarnings: number;
  conversionRate: number;
  period: string;
}

export interface PaymentMethod {
  id: string;
  userId: string;
  type: string;
  brand?: string;
  last4: string;
  expMonth?: number;
  expYear?: number;
  isDefault: boolean;
  createdAt: string;
}
