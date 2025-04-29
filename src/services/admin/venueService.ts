
import { supabase } from '@/integrations/supabase/client';

// Venue management
export const getAdminVenues = async (lastVisible = null, limitCount = 20) => {
  try {
    let query = supabase
      .from('venues')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limitCount);
    
    if (lastVisible) {
      // For pagination
      const offset = lastVisible * limitCount;
      query = query.range(offset, offset + limitCount - 1);
    }
    
    const { data: venues, error } = await query;
    
    if (error) throw error;
    
    // Using the last index as the lastVisible value for pagination
    const lastVisibleIndex = lastVisible ? lastVisible + 1 : 1;
    return { venues, lastVisible: venues.length === limitCount ? lastVisibleIndex : null };
  } catch (error) {
    console.error("Error fetching venues:", error);
    throw error;
  }
};

export const updateVenueVerification = async (venueId: string, isVerified: boolean) => {
  try {
    const { error } = await supabase
      .from('venues')
      .update({ 
        is_verified: isVerified,
        updated_at: new Date().toISOString()
      })
      .eq('id', venueId);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error updating venue verification:", error);
    throw error;
  }
};
