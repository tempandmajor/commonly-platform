
import { supabase } from "@/integrations/supabase/client";
import { UserData } from "@/types/auth";

// Export isUserPro function for use in UserProfile.tsx
export { isUserPro } from "@/services/userService";

export const getUserProfile = async (userId: string): Promise<UserData | null> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    
    return {
      uid: data.id,
      email: data.email || '',
      displayName: data.display_name || '',
      photoURL: data.photo_url || null,
      bio: data.bio || null,
      isAdmin: data.is_admin || false,
      isPro: data.is_pro || false,
      isMerchant: data.is_merchant || false,
      isOnline: data.is_online || false,
      lastSeen: data.last_seen || null,
      followerCount: data.follower_count || 0,
      followingCount: data.following_count || 0,
      merchantStoreId: data.merchant_store_id || null,
      createdAt: data.created_at
    };
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
};

export const getUserEventsFeed = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('created_by', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error("Error fetching user events:", error);
    return [];
  }
};

export const getUserFollowers = async (userId: string) => {
  try {
    // Using direct SQL query instead of RPC to avoid type issues
    const { data, error } = await supabase
      .from('user_follows')
      .select('follower_id')
      .eq('following_id', userId);
    
    if (error) throw error;
    
    // Return array of follower IDs
    return data ? data.map(item => item.follower_id) : [];
  } catch (error) {
    console.error("Error fetching user followers:", error);
    return [];
  }
};

export const getUserFollowing = async (userId: string) => {
  try {
    // Using direct SQL query instead of RPC
    const { data, error } = await supabase
      .from('user_follows')
      .select('following_id')
      .eq('follower_id', userId);
    
    if (error) throw error;
    
    // Return array of following IDs
    return data ? data.map(item => item.following_id) : [];
  }
  catch (error) {
    console.error("Error fetching user following:", error);
    return [];
  }
};

export const followUser = async (followerId: string, followingId: string) => {
  try {
    // Check if this follow relationship already exists
    const { data: existingFollow, error: checkError } = await supabase
      .from('user_follows')
      .select('*')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .maybeSingle();
    
    if (checkError) throw checkError;
    
    if (existingFollow) {
      // Already following, unfollow
      const { error } = await supabase
        .from('user_follows')
        .delete()
        .eq('follower_id', followerId)
        .eq('following_id', followingId);
      
      if (error) throw error;
      return { followed: false };
    } else {
      // Not following, follow
      const { error } = await supabase
        .from('user_follows')
        .insert({
          follower_id: followerId,
          following_id: followingId,
          created_at: new Date().toISOString()
        });
      
      if (error) throw error;
      return { followed: true };
    }
  } catch (error) {
    console.error("Error updating follow status:", error);
    throw error;
  }
};

export const updateUserProfile = async (userId: string, profileData: Partial<UserData>) => {
  try {
    // Transform from our app model to database model
    const dbData: any = {};
    
    if ('displayName' in profileData) dbData.display_name = profileData.displayName;
    if ('photoURL' in profileData) dbData.photo_url = profileData.photoURL;
    if ('bio' in profileData) dbData.bio = profileData.bio;
    
    const { error } = await supabase
      .from('users')
      .update(dbData)
      .eq('id', userId);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

export const searchUsers = async (query: string): Promise<UserData[]> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .or(`display_name.ilike.%${query}%,email.ilike.%${query}%`)
      .limit(10);

    if (error) throw error;
    
    return data.map((user) => ({
      uid: user.id,
      email: user.email,
      displayName: user.display_name,
      photoURL: user.photo_url,
      isAdmin: user.is_admin,
      isPro: user.is_pro,
      isMerchant: user.is_merchant,
      bio: user.bio,
      isOnline: user.is_online,
      lastSeen: user.last_seen,
      createdAt: user.created_at,
    }));
  } catch (error) {
    console.error("Error searching users:", error);
    throw error;
  }
};

/**
 * Check if a user has a pro subscription
 */
export const isUserPro = async (userId: string): Promise<boolean> => {
  try {
    // First check the cached flag on the user object
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('is_pro')
      .eq('id', userId)
      .single();
    
    if (userError) throw userError;
    
    if (userData && userData.is_pro === true) {
      return true;
    }
    
    // If not pro in user object, check subscriptions table for active pro subscription
    const { data: subscriptionData, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .eq('plan', 'pro')
      .single();
    
    if (subscriptionError && subscriptionError.code !== 'PGRST116') {
      throw subscriptionError;
    }
    
    return !!subscriptionData;
  } catch (error) {
    console.error("Error checking pro status:", error);
    return false;
  }
};

/**
 * Toggle follow status for a user
 */
export const toggleFollowUser = async (currentUserId: string, targetUserId: string): Promise<boolean> => {
  try {
    return await followUser(currentUserId, targetUserId).then(result => result.followed);
  } catch (error) {
    console.error("Error toggling follow status:", error);
    throw error;
  }
};
