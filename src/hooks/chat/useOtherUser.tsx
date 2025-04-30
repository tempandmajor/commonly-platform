
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
        
        // Check online status
        const { data: presenceData } = await supabase
          .from('user_presence')
          .select('online, last_seen')
          .eq('user_id', userId)
          .single();
          
        if (presenceData) {
          setIsOnline(presenceData.online || false);
          setLastSeen(presenceData.last_seen);
        }
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
    
    // Subscribe to presence changes
    const presenceChannel = supabase
      .channel(`presence:${userId}`)
      .on('presence', { event: 'sync' }, () => {
        // Update presence state when changes occur
        supabase
          .from('user_presence')
          .select('online, last_seen')
          .eq('user_id', userId)
          .single()
          .then(({ data }) => {
            if (data) {
              setIsOnline(data.online || false);
              setLastSeen(data.last_seen);
            }
          });
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(presenceChannel);
    };
  }, [userId]);

  return { user, loading, error, isOnline, lastSeen };
};
