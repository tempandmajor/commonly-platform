
import { supabase } from '@/integrations/supabase/client';

// Event management
export const getAdminEvents = async (lastVisible = null, limitCount = 20) => {
  try {
    let query = supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limitCount);
    
    if (lastVisible) {
      // For pagination, similar approach as getUsers
      const offset = lastVisible * limitCount;
      query = query.range(offset, offset + limitCount - 1);
    }
    
    const { data: events, error } = await query;
    
    if (error) throw error;
    
    // Using the last index as the lastVisible value for pagination
    const lastVisibleIndex = lastVisible ? lastVisible + 1 : 1;
    return { events, lastVisible: events.length === limitCount ? lastVisibleIndex : null };
  } catch (error) {
    console.error("Error fetching events:", error);
    throw error;
  }
};
