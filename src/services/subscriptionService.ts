
import { supabase } from "@/integrations/supabase/client";

/**
 * Check if a user has Pro status
 * @param userId User ID to check
 * @returns Boolean indicating Pro status
 */
export const isUserPro = async (userId: string): Promise<boolean> => {
  try {
    // First, check the user record for direct isPro flag
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("is_pro")
      .eq("id", userId)
      .single();
    
    if (userError) throw userError;
    
    if (userData?.is_pro) {
      return true;
    }
    
    // Next, check for active subscription
    const { data: subscriptionData, error: subscriptionError } = await supabase
      .from("subscriptions")
      .select("plan, status")
      .eq("user_id", userId)
      .eq("status", "active")
      .limit(1);
    
    if (subscriptionError) throw subscriptionError;
    
    if (subscriptionData && subscriptionData.length > 0) {
      const subscription = subscriptionData[0];
      return subscription.plan === "pro" && subscription.status === "active";
    }
    
    return false;
  } catch (error) {
    console.error("Error checking user Pro status:", error);
    return false; // Default to false on error
  }
};

/**
 * Get user subscription details
 */
export const getUserSubscription = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1);
    
    if (error) throw error;
    
    return data && data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error("Error getting user subscription:", error);
    throw error;
  }
};

/**
 * Cancel a subscription
 */
export const cancelSubscription = async (userId: string, stripeSubscriptionId: string) => {
  try {
    // We'll call an edge function for handling the Stripe API call
    const { data, error } = await supabase.functions.invoke('cancel-subscription', {
      body: { userId, stripeSubscriptionId }
    });
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error("Error cancelling subscription:", error);
    throw error;
  }
};

/**
 * Create checkout session for subscription
 */
export const createCheckoutSession = async (
  userId: string,
  email: string,
  plan: string,
  successUrl: string,
  cancelUrl: string
) => {
  try {
    // Call our edge function to create checkout session
    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
      body: { 
        userId, 
        email, 
        plan, 
        successUrl, 
        cancelUrl 
      }
    });
    
    if (error) throw error;
    
    return data.sessionUrl;
  } catch (error) {
    console.error("Error creating checkout session:", error);
    throw error;
  }
};
