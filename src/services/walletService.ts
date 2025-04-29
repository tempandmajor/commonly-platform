import { db, functions } from "@/lib/firebase";
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  addDoc,
  updateDoc,
  serverTimestamp,
  Timestamp
} from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { UserWallet, Transaction, ReferralStats, PaymentMethod } from "@/types/auth";

// Get user wallet
export const getUserWallet = async (userId: string): Promise<UserWallet | null> => {
  try {
    const walletRef = doc(db, "wallets", userId);
    const walletDoc = await getDoc(walletRef);
    
    if (!walletDoc.exists()) {
      // Create a new wallet for the user
      return createUserWallet(userId);
    }
    
    const walletData = walletDoc.data();
    
    // Get recent transactions
    const transactionsQuery = query(
      collection(db, "transactions"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(20)
    );
    
    const transactionsSnapshot = await getDocs(transactionsQuery);
    const transactions = transactionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Transaction[];
    
    return {
      id: walletDoc.id,
      userId,
      availableBalance: walletData.availableBalance || 0,
      pendingBalance: walletData.pendingBalance || 0,
      totalEarnings: walletData.totalEarnings || 0,
      platformCredits: walletData.platformCredits || 0,
      hasPayoutMethod: walletData.hasPayoutMethod || false,
      stripeConnectId: walletData.stripeConnectId,
      transactions,
      lastUpdated: walletData.updatedAt || Timestamp.now()
    } as UserWallet;
  } catch (error) {
    console.error("Error fetching user wallet:", error);
    return null;
  }
};

// Create a new wallet for a user
const createUserWallet = async (userId: string): Promise<UserWallet> => {
  try {
    const newWallet = {
      userId,
      totalEarnings: 0,
      availableBalance: 0,
      pendingBalance: 0,
      platformCredits: 0,
      hasPayoutMethod: false,
      updatedAt: serverTimestamp(),
      lastUpdated: serverTimestamp()
    };
    
    await updateDoc(doc(db, "wallets", userId), newWallet);
    
    return {
      id: userId,
      userId,
      totalEarnings: 0,
      availableBalance: 0,
      pendingBalance: 0,
      platformCredits: 0,
      hasPayoutMethod: false,
      transactions: [],
      lastUpdated: Timestamp.now()
    };
  } catch (error) {
    console.error("Error creating user wallet:", error);
    // Create the document if it doesn't exist
    const walletRef = doc(db, "wallets", userId);
    await updateDoc(walletRef, {
      userId,
      totalEarnings: 0,
      availableBalance: 0,
      pendingBalance: 0,
      platformCredits: 0,
      hasPayoutMethod: false,
      updatedAt: serverTimestamp(),
      lastUpdated: serverTimestamp()
    });
    
    return {
      id: userId,
      userId,
      totalEarnings: 0,
      availableBalance: 0,
      pendingBalance: 0,
      platformCredits: 0,
      hasPayoutMethod: false,
      transactions: [],
      lastUpdated: Timestamp.now()
    };
  }
};

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
  page = 1,
  pageSize = 10
): Promise<{ transactions: Transaction[], total: number }> => {
  try {
    let transactionsRef = collection(db, "transactions");
    let constraints: any[] = [where("userId", "==", userId)];
    
    // Apply filters
    if (filters.type) {
      constraints.push(where("type", "==", filters.type));
    }
    
    if (filters.status) {
      constraints.push(where("status", "==", filters.status));
    }
    
    if (filters.startDate) {
      constraints.push(where("createdAt", ">=", filters.startDate.toISOString()));
    }
    
    if (filters.endDate) {
      constraints.push(where("createdAt", "<=", filters.endDate.toISOString()));
    }
    
    // Create query
    let q = query(
      transactionsRef,
      ...constraints,
      orderBy("createdAt", "desc"),
      limit(pageSize * page)
    );
    
    const snapshot = await getDocs(q);
    
    // Filter by search if provided
    let transactions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Transaction[];
    
    if (filters.search && filters.search.trim() !== "") {
      const searchTerm = filters.search.toLowerCase();
      transactions = transactions.filter(
        t => t.description.toLowerCase().includes(searchTerm)
      );
    }
    
    // Get the total count
    const countQuery = query(transactionsRef, ...constraints);
    const countSnapshot = await getDocs(countQuery);
    const total = countSnapshot.size;
    
    // Paginate
    const startIndex = (page - 1) * pageSize;
    const paginatedTransactions = transactions.slice(startIndex, startIndex + pageSize);
    
    return { 
      transactions: paginatedTransactions, 
      total 
    };
  } catch (error) {
    console.error("Error fetching user transactions:", error);
    return { transactions: [], total: 0 };
  }
};

// Get user referral stats
export const getUserReferralStats = async (
  userId: string,
  period: 'week' | 'month' | 'year' | 'all' = 'month'
): Promise<ReferralStats> => {
  try {
    const getReferralStats = httpsCallable(functions, 'getReferralStats');
    const result = await getReferralStats({ userId, period });
    return result.data as ReferralStats;
  } catch (error) {
    console.error("Error fetching referral stats:", error);
    return {
      userId,
      totalReferrals: 0,
      conversionRate: 0,
      totalEarnings: 0,
      clickCount: 0,
      conversionCount: 0,
      period
    };
  }
};

// Initiate withdrawal to Stripe Connect account
export const initiateWithdrawal = async (userId: string, amount: number): Promise<boolean> => {
  try {
    const initiateWithdrawalFunc = httpsCallable(functions, 'initiateWithdrawal');
    await initiateWithdrawalFunc({ userId, amount });
    return true;
  } catch (error) {
    console.error("Error initiating withdrawal:", error);
    throw error;
  }
};

// Get user payment methods
export const getUserPaymentMethods = async (userId: string): Promise<PaymentMethod[]> => {
  try {
    const paymentMethodsQuery = query(
      collection(db, "paymentMethods"),
      where("userId", "==", userId),
      orderBy("isDefault", "desc")
    );
    
    const snapshot = await getDocs(paymentMethodsQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as PaymentMethod[];
  } catch (error) {
    console.error("Error fetching payment methods:", error);
    return [];
  }
};

// Add platform credits to user wallet
export const addPlatformCredits = async (userId: string, amount: number, description: string): Promise<boolean> => {
  try {
    const addCreditsFunc = httpsCallable(functions, 'addPlatformCredits');
    await addCreditsFunc({ userId, amount, description });
    return true;
  } catch (error) {
    console.error("Error adding platform credits:", error);
    throw error;
  }
};

// Use platform credits for a transaction
export const usePlatformCredits = async (userId: string, amount: number, description: string): Promise<boolean> => {
  try {
    const useCreditsFunc = httpsCallable(functions, 'usePlatformCredits');
    await useCreditsFunc({ userId, amount, description });
    return true;
  } catch (error) {
    console.error("Error using platform credits:", error);
    throw error;
  }
};

// Create a Stripe Connect account setup link
export const createConnectAccountLink = async (userId: string): Promise<string> => {
  try {
    const createAccountLinkFunc = httpsCallable(functions, 'createConnectAccountLink');
    const result = await createAccountLinkFunc({ userId });
    return (result.data as { url: string }).url;
  } catch (error) {
    console.error("Error creating Connect account link:", error);
    throw error;
  }
};
