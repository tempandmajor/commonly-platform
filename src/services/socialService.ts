
import { supabase } from "@/integrations/supabase/client";
import { UserData } from "@/types/auth";

/**
 * Get a user's followers
 */
export const getUserFollowers = async (userId: string): Promise<UserData[]> => {
  try {
    const { data: userData, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    
    if (!userData || !userData.followers || !Array.isArray(userData.followers)) {
      return [];
    }
    
    // Get the full user data for each follower
    if (userData.followers.length === 0) {
      return [];
    }
    
    const { data: followersData, error: followersError } = await supabase
      .from('users')
      .select('*')
      .in('id', userData.followers);
    
    if (followersError) throw followersError;
    
    return followersData.map(user => ({
      uid: user.id,
      displayName: user.display_name,
      email: user.email,
      photoURL: user.photo_url,
      bio: user.bio,
      isOnline: user.is_online || false,
      lastSeen: user.last_seen || null
    }));
  } catch (error) {
    console.error("Error getting user followers:", error);
    return [];
  }
};

/**
 * Get users that a user is following
 */
export const getUserFollowing = async (userId: string): Promise<UserData[]> => {
  try {
    const { data: userData, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    
    if (!userData || !userData.following || !Array.isArray(userData.following)) {
      return [];
    }
    
    // Get the full user data for each followed user
    if (userData.following.length === 0) {
      return [];
    }
    
    const { data: followingData, error: followingError } = await supabase
      .from('users')
      .select('*')
      .in('id', userData.following);
    
    if (followingError) throw followingError;
    
    return followingData.map(user => ({
      uid: user.id,
      displayName: user.display_name,
      email: user.email,
      photoURL: user.photo_url,
      bio: user.bio,
      isOnline: user.is_online || false,
      lastSeen: user.last_seen || null
    }));
  } catch (error) {
    console.error("Error getting user following:", error);
    return [];
  }
};
