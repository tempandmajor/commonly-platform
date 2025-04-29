
import { supabase } from '@/integrations/supabase/client';

export const getAdminVenues = async (
  limit = 20,
  offset = 0,
  filters = {}
) => {
  try {
    let query = supabase
      .from('venues')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    // Apply filters if any
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error("Error fetching admin venues:", error);
    throw error;
  }
};

export const updateVenueVerification = async (venueId: string, isVerified: boolean) => {
  try {
    const { error } = await supabase
      .from('venues')
      .update({ is_verified: isVerified })
      .eq('id', venueId);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error("Error updating venue verification:", error);
    throw error;
  }
};
