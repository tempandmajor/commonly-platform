
import { useState, useEffect } from "react";
import { UserData } from "@/types/auth";
import { supabase } from "@/integrations/supabase/client";
import { getUserProfile } from "@/services/userService";
import { toast } from "@/hooks/use-toast";

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
        // Optimized query: Get both user profile and presence data in one query
        const { data, error } = await supabase
          .from('users')
          .select('id, email, display_name, photo_url, bio, is_online, last_seen')
          .eq('id', userId)
          .single();
          
        if (error) {
          console.error("Error fetching user data:", error);
          setError(new Error(`Failed to fetch user: ${error.message}`));
          toast({
            title: "Error",
            description: "Could not load user information",
            variant: "destructive"
          });
          return;
        }
          
        if (data) {
          // Map to UserData structure
          const userData: UserData = {
            uid: data.id,
            email: data.email || '',
            displayName: data.display_name || 'Unknown User',
            photoURL: data.photo_url || null,
            bio: data.bio || null
          };
          
          setUser(userData);
          setIsOnline(data.is_online || false);
          setLastSeen(data.last_seen || null);
        }
      } catch (err) {
        console.error("Error in useOtherUser hook:", err);
        setError(err as Error);
        toast({
          title: "Error",
          description: "Failed to load user data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
    
    // Subscribe to presence changes using Supabase Realtime
    if (!userId) return;
    
    const channel = supabase
      .channel(`presence_${userId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'users',
        filter: `id=eq.${userId}`
      }, (payload) => {
        try {
          // Use type assertion to access is_online and last_seen
          const userData = payload.new as any;
          if (userData) {
            setIsOnline(userData.is_online || false);
            setLastSeen(userData.last_seen || null);
          }
        } catch (err) {
          console.error("Error processing realtime update:", err);
        }
      })
      .subscribe((status) => {
        if (status !== 'SUBSCRIBED') {
          console.error("Failed to subscribe to presence channel:", status);
        }
      });
      
    return () => {
      supabase.removeChannel(channel).catch(err => {
        console.error("Error removing channel:", err);
      });
    };
  }, [userId]);

  return { user, loading, error, isOnline, lastSeen };
};
