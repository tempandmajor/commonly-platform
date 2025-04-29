
import { supabase } from '@/integrations/supabase/client';

// Analytics dashboard
export const getDashboardMetrics = async () => {
  try {
    // Get users count
    const { count: totalUsers, error: usersError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });
    
    if (usersError) throw usersError;
    
    // Get active events count (future events)
    const now = new Date().toISOString();
    const { count: activeEvents, error: activeEventsError } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .gte('date', now)
      .eq('published', true);
    
    if (activeEventsError) throw activeEventsError;
    
    // Get past events count
    const { count: pastEvents, error: pastEventsError } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .lt('date', now)
      .eq('published', true);
    
    if (pastEventsError) throw pastEventsError;
    
    // Get venues count
    const { count: venues, error: venuesError } = await supabase
      .from('venues')
      .select('*', { count: 'exact', head: true });
    
    if (venuesError) throw venuesError;
    
    return {
      totalUsers,
      activeEvents,
      pastEvents,
      venues,
    };
  } catch (error) {
    console.error("Error fetching dashboard metrics:", error);
    throw error;
  }
};
