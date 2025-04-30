
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

export const checkSubscriptionEligibility = async (userId: string): Promise<{ eligible: boolean; reason?: string }> => {
  try {
    // Check if user is eligible for subscription
    const { data, error } = await supabase
      .from('users')
      .select('follower_count, is_pro')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    
    // Already a Pro user
    if (data.is_pro) {
      return { eligible: false, reason: "User is already a Pro member" };
    }
    
    // Check follower count requirement (example: need 100+ followers)
    if (data.follower_count < 100) {
      return { 
        eligible: false, 
        reason: `Need at least 100 followers to subscribe (currently has ${data.follower_count})` 
      };
    }
    
    return { eligible: true };
  } catch (error) {
    console.error("Error checking subscription eligibility:", error);
    throw error;
  }
};
