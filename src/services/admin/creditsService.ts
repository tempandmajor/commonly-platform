
import { supabase } from '@/integrations/supabase/client';

// Credits and rewards distribution
export const distributeCredits = async (userId: string, amount: number, reason: string) => {
  try {
    // Start a transaction
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('wallet')
      .eq('id', userId)
      .single();
    
    if (userError) throw userError;
    
    // Create or update wallet with platform credits
    const currentWallet = userData?.wallet || {};
    const currentCredits = currentWallet.platform_credits || 0;
    
    const updatedWallet = {
      ...currentWallet,
      platform_credits: currentCredits + amount
    };
    
    // Update user's wallet
    const { error: updateError } = await supabase
      .from('users')
      .update({
        wallet: updatedWallet,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
    
    if (updateError) throw updateError;
    
    // Record the transaction
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        amount: amount,
        type: 'credit',
        status: 'completed',
        description: reason || 'Admin credit distribution',
        created_at: new Date().toISOString()
      });
    
    if (transactionError) throw transactionError;
    
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
        created_at: new Date().toISOString()
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
