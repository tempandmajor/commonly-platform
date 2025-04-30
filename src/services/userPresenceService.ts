
import { supabase } from "@/integrations/supabase/client";

/**
 * Update user's online status in Supabase
 */
export const updateUserPresence = async (userId: string, isOnline: boolean): Promise<void> => {
  try {
    // Update user's online status
    const { error } = await supabase
      .from('users')
      .update({
        is_online: isOnline,
        last_seen: isOnline ? null : new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
    
    if (error) throw error;
  } catch (error) {
    console.error("Error updating user presence:", error);
  }
};

/**
 * Subscribe to a user's online status
 */
export const subscribeToUserPresence = (
  userId: string,
  callback: (isOnline: boolean, lastSeen: Date | null) => void
) => {
  // Initial fetch
  fetchUserPresence(userId).then(({ isOnline, lastSeen }) => {
    callback(isOnline, lastSeen);
  });
  
  // Set up real-time subscription
  const channel = supabase
    .channel(`presence_${userId}`)
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'users',
      filter: `id=eq.${userId}`
    }, (payload) => {
      const userData = payload.new as any;
      const isOnline = Boolean(userData.is_online);
      const lastSeen = userData.last_seen ? new Date(userData.last_seen) : null;
      callback(isOnline, lastSeen);
    })
    .subscribe();
  
  // Return unsubscribe function
  return () => {
    supabase.removeChannel(channel);
  };
};

/**
 * Fetch a user's current presence status
 */
const fetchUserPresence = async (userId: string): Promise<{ isOnline: boolean; lastSeen: Date | null }> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('is_online, last_seen')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    
    return {
      isOnline: Boolean(data?.is_online),
      lastSeen: data?.last_seen ? new Date(data.last_seen) : null
    };
  } catch (error) {
    console.error("Error fetching user presence:", error);
    return { isOnline: false, lastSeen: null };
  }
};

/**
 * Setup presence system for current user
 * This updates the user's status to online and sets up listeners
 * to handle connection state changes
 */
export const setupPresenceSystem = (userId: string): () => void => {
  // Set user as online
  updateUserPresence(userId, true);
  
  // Setup listener for page visibility changes
  const handleVisibilityChange = () => {
    updateUserPresence(userId, document.visibilityState === 'visible');
  };
  
  document.addEventListener('visibilitychange', handleVisibilityChange);
  
  // Setup handler for before unload
  const handleBeforeUnload = () => {
    updateUserPresence(userId, false);
  };
  
  window.addEventListener('beforeunload', handleBeforeUnload);
  
  // Return cleanup function
  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    window.removeEventListener('beforeunload', handleBeforeUnload);
    updateUserPresence(userId, false);
  };
};
