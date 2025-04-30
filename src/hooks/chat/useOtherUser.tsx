
import { useState, useEffect } from "react";
import { UserData } from "@/types/auth";
import { supabase } from "@/integrations/supabase/client";
import { getUserProfile } from "@/services/userService";

export const useOtherUser = (userId: string | null) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(false);
  const [lastSeen, setLastSeen] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const userData = await getUserProfile(userId);
        setUser(userData);
        
        // Get user presence from users table
        // Note: We need to make sure is_online and last_seen columns exist
        try {
          const { data: presenceData, error: presenceError } = await supabase
            .from('users')
            .select('id')
            .eq('id', userId)
            .single();
            
          if (presenceData) {
            // For now, default to false/null until we add these columns
            setIsOnline(false);
            setLastSeen(null);
          }
        } catch (presenceError) {
          console.error("Error fetching presence data:", presenceError);
        }
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
    
    // Subscribe to presence changes using Supabase Realtime
    const channel = supabase
      .channel(`presence_${userId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'users',
        filter: `id=eq.${userId}`
      }, (payload) => {
        // Use type assertion to access is_online and last_seen
        const userData = payload.new as any;
        if (userData) {
          // For now, use defaults until we add these columns
          setIsOnline(false);
          setLastSeen(null);
        }
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return { user, loading, error, isOnline, lastSeen };
};
