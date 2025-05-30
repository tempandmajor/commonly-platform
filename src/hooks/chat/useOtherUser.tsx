
import { useState, useEffect } from "react";
import { UserData } from "@/types/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const useOtherUser = (userId: string | null) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(false);
  const [lastSeen, setLastSeen] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    
    // Keep a reference to the active subscription
    let presenceChannel: any = null;

    const fetchUser = async () => {
      try {
        // Optimized query: Get user profile and presence data in one query
        const { data, error } = await supabase
          .from('users')
          .select('id, email, display_name, photo_url, bio, is_online, last_seen')
          .eq('id', userId)
          .maybeSingle(); // Use maybeSingle instead of single to prevent errors
          
        if (error) {
          console.error("Error fetching user data:", error);
          setError(new Error(`Failed to fetch user: ${error.message}`));
          toast({
            title: "Error",
            description: "Could not load user information",
            variant: "destructive"
          });
          setLoading(false);
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
          // Use database defaults if values are null
          setIsOnline(data.is_online ?? false);
          setLastSeen(data.last_seen || null);
          
          // Subscribe to presence changes using Supabase Realtime
          presenceChannel = supabase
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
                  setIsOnline(userData.is_online ?? false);
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
        } else {
          // Handle case when user not found
          console.log("No user found with ID:", userId);
          toast({
            title: "User not found",
            description: "The requested user profile could not be found",
            variant: "destructive"
          });
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
    
    // Clean up subscription when component unmounts or userId changes
    return () => {
      if (presenceChannel) {
        supabase.removeChannel(presenceChannel).catch(err => {
          console.error("Error removing presence channel:", err);
        });
      }
    };
  }, [userId]);

  return { user, loading, error, isOnline, lastSeen };
};
