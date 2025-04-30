
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
        const { data: presenceData } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();
          
        if (presenceData) {
          // Use the appropriate field names based on your database structure
          setIsOnline(Boolean(presenceData.recent_login));
          setLastSeen(presenceData.updated_at || null);
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
        setIsOnline(Boolean(userData.recent_login));
        setLastSeen(userData.updated_at || null);
      })
      .subscribe();
      
    return () => {
      presenceSubscription.unsubscribe();
    };
  }, [userId]);

  return { user, loading, error, isOnline, lastSeen };
};
