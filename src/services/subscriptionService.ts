
import { supabase } from '@/integrations/supabase/client';

export const isUserPro = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('is_pro')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    
    return !!data?.is_pro;
  } catch (error) {
    console.error("Error checking user pro status:", error);
    return false;
  }
};

export const getUserSubscription = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return null;
  }
};

export const cancelSubscription = async (subscriptionId: string) => {
  try {
    // Call Edge Function to cancel subscription
    const { data, error } = await supabase.functions.invoke('cancel-subscription', {
      body: { subscription_id: subscriptionId }
    });
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error("Error cancelling subscription:", error);
    throw error;
  }
};

export const updateSubscription = async (userId: string, plan: string) => {
  try {
    // Call Edge Function to update subscription
    const { data, error } = await supabase.functions.invoke('update-subscription', {
      body: { user_id: userId, plan }
    });
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error("Error updating subscription:", error);
    throw error;
  }
};
