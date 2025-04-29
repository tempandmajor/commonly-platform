
import { supabase } from '@/integrations/supabase/client';

export const getAdminEvents = async (
  limit = 20,
  offset = 0,
  filterOptions: Record<string, any> = {}
) => {
  try {
    let query = supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    // Apply filters if any
    if (Object.keys(filterOptions).length > 0) {
      Object.entries(filterOptions).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          // @ts-ignore - Handle filtering dynamically
          query = query.eq(key, value);
        }
      });
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error("Error fetching admin events:", error);
    throw error;
  }
};
