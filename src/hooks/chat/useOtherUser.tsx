
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
        const { data: presenceData, error: presenceError } = await supabase
          .from('users')
          .select('is_online, last_seen')
          .eq('id', userId)
          .single();
          
        if (presenceData) {
          setIsOnline(presenceData.is_online || false);
          setLastSeen(presenceData.last_seen || null);
        }
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
    
    // Subscribe to presence changes using Supabase Realtime
    const presenceSubscription = supabase
      .channel(`presence_${userId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'users',
        filter: `id=eq.${userId}`
      }, (payload) => {
        const userData = payload.new as any;
        setIsOnline(userData.is_online || false);
        setLastSeen(userData.last_seen || null);
      })
      .subscribe();
      
    return () => {
      presenceSubscription.unsubscribe();
    };
  }, [userId]);

  return { user, loading, error, isOnline, lastSeen };
};
