
import { supabase } from "@/integrations/supabase/client";

export interface Subscription {
  id: string;
  userId: string;
  plan: string;
  status: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export const createSubscription = async (subscription: Partial<Subscription>): Promise<Subscription | null> => {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .insert({
        user_id: subscription.userId,
        plan: subscription.plan,
        status: subscription.status,
        stripe_customer_id: subscription.stripeCustomerId,
        stripe_subscription_id: subscription.stripeSubscriptionId,
        current_period_start: subscription.currentPeriodStart,
        current_period_end: subscription.currentPeriodEnd,
        cancel_at: subscription.cancelAt,
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return mapSubscriptionFromDatabase(data);
  } catch (error) {
    console.error("Error creating subscription:", error);
    return null;
  }
};

export const getUserSubscription = async (userId: string): Promise<Subscription | null> => {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) throw error;
    
    return data ? mapSubscriptionFromDatabase(data) : null;
  } catch (error) {
    console.error("Error fetching user subscription:", error);
    return null;
  }
};

export const cancelSubscription = async (subscriptionId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('subscriptions')
      .update({ 
        status: 'canceled',
        cancel_at: new Date().toISOString()
      })
      .eq('id', subscriptionId);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error("Error canceling subscription:", error);
    return false;
  }
};

const mapSubscriptionFromDatabase = (data: any): Subscription => {
  return {
    id: data.id,
    userId: data.user_id,
    plan: data.plan,
    status: data.status,
    stripeCustomerId: data.stripe_customer_id,
    stripeSubscriptionId: data.stripe_subscription_id,
    currentPeriodStart: data.current_period_start,
    currentPeriodEnd: data.current_period_end,
    cancelAt: data.cancel_at,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
};
