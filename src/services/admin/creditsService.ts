
import { supabase } from '@/integrations/supabase/client';

// Platform credits
export const distributeCredits = async (userId: string, amount: number, description: string) => {
  try {
    // Add transaction
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        amount,
        type: 'credit',
        status: 'completed',
        description,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    
    if (transactionError) throw transactionError;
    
    // Get user data
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('wallet')
      .eq('id', userId)
      .single();
    
    if (userError) throw userError;
    
    // Update user's wallet
    const wallet = userData.wallet || {};
    const { error: updateError } = await supabase
      .from('users')
      .update({
        wallet: {
          ...wallet,
          platform_credits: (wallet.platform_credits || 0) + amount,
          updated_at: new Date().toISOString(),
        }
      })
      .eq('id', userId);
    
    if (updateError) throw updateError;
    
    return true;
  } catch (error) {
    console.error("Error distributing credits:", error);
    throw error;
  }
};

export const createCreditsCampaign = async (campaignData: any) => {
  try {
    const { data, error } = await supabase
      .from('credits_campaigns')
      .insert({
        ...campaignData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        active: true,
      })
      .select('id')
      .single();
    
    if (error) throw error;
    return data.id;
  } catch (error) {
    console.error("Error creating credits campaign:", error);
    throw error;
  }
};
