
import { supabase } from '@/integrations/supabase/client';

export const getDashboardMetrics = async () => {
  try {
    // Get total users count
    const { count: userCount, error: userError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });
    
    if (userError) throw userError;
    
    // Get total events count
    const { count: eventCount, error: eventError } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true });
    
    if (eventError) throw eventError;
    
    // Get total transactions
    const { data: transactions, error: transactionError } = await supabase
      .from('transactions')
      .select('amount, type');
    
    if (transactionError) throw transactionError;
    
    // Calculate revenue
    const revenue = transactions
      .filter(tx => tx.type === 'payment' || tx.type === 'subscription')
      .reduce((sum, tx) => sum + Number(tx.amount), 0);
    
    // Get new users in the last 7 days
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    const { count: newUsers, error: newUserError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', lastWeek.toISOString());
    
    if (newUserError) throw newUserError;
    
    return {
      totalUsers: userCount || 0,
      totalEvents: eventCount || 0,
      totalRevenue: revenue,
      newUsers: newUsers || 0
    };
  } catch (error) {
    console.error("Error getting dashboard metrics:", error);
    throw error;
  }
};
