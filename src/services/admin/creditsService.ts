
import { supabase } from '@/integrations/supabase/client';

export const distributeCredits = async (
  userIds: string[], 
  amount: number,
  description: string
) => {
  try {
    // Create a transaction batch
    const batch = [];
    const timestamp = new Date().toISOString();
    
    for (const userId of userIds) {
      // Create transaction record
      batch.push({
        user_id: userId,
        amount,
        type: 'admin_credit',
        status: 'completed',
        description,
        created_at: timestamp
      });
      
      // Update user wallet
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('wallet')
        .eq('id', userId)
        .single();
      
      if (userError) throw userError;
      
      const wallet = userData.wallet || {};
      const currentCredits = wallet.platform_credits || 0;
      
      const { error: updateError } = await supabase
        .from('users')
        .update({
          wallet: {
            ...wallet,
            platform_credits: currentCredits + amount
          }
        })
        .eq('id', userId);
      
      if (updateError) throw updateError;
    }
    
    // Insert all transaction records
    const { error: batchError } = await supabase
      .from('transactions')
      .insert(batch);
    
    if (batchError) throw batchError;
    
    return true;
  } catch (error) {
    console.error("Error distributing credits:", error);
    throw error;
  }
};

export const createCreditsCampaign = async (
  name: string,
  description: string,
  amount: number,
  targetUserType: string,
  startDate: Date,
  endDate: Date
) => {
  try {
    const { data, error } = await supabase
      .from('credits_campaigns')
      .insert({
        name,
        description,
        amount,
        target_user_type: targetUserType,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        active: true
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error("Error creating credits campaign:", error);
    throw error;
  }
};
