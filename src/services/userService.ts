import { supabase } from "@/integrations/supabase/client";
import { UserData } from "@/types/auth";

// Export userPro function
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
    // Instead of querying a non-existent user_follows table, let's query the users table
    // and check the followers array field which should contain user IDs
    const { data, error } = await supabase
      .from('users')
      .select('followers')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    
    // Return array of follower IDs from the followers array field
    return data && data.followers ? data.followers : [];
  } catch (error) {
    console.error("Error fetching user followers:", error);
    return [];
  }
};

export const getUserFollowing = async (userId: string) => {
  try {
    // Instead of querying a non-existent user_follows table, let's query the users table
    // and check the following array field which should contain user IDs
    const { data, error } = await supabase
      .from('users')
      .select('following')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    
    // Return array of following IDs from the following array field
    return data && data.following ? data.following : [];
  } catch (error) {
    console.error("Error fetching user following:", error);
    return [];
  }
};

// Toggle follow status for a user
export const toggleFollowUser = async (currentUserId: string, targetUserId: string): Promise<boolean> => {
  try {
    // Get current user's following list
    const { data: currentUserData, error: currentUserError } = await supabase
      .from('users')
      .select('following')
      .eq('id', currentUserId)
      .single();
    
    if (currentUserError) throw currentUserError;
    
    // Get target user's followers list
    const { data: targetUserData, error: targetUserError } = await supabase
      .from('users')
      .select('followers')
      .eq('id', targetUserId)
      .single();
    
    if (targetUserError) throw targetUserError;
    
    const currentFollowing = currentUserData.following || [];
    const targetFollowers = targetUserData.followers || [];
    
    // Check if already following
    const isFollowing = currentFollowing.includes(targetUserId);
    
    if (isFollowing) {
      // Unfollow: Remove targetUserId from currentUser's following
      const updatedFollowing = currentFollowing.filter(id => id !== targetUserId);
      
      // Remove currentUserId from targetUser's followers
      const updatedFollowers = targetFollowers.filter(id => id !== currentUserId);
      
      // Update current user
      const { error: updateCurrentError } = await supabase
        .from('users')
        .update({ 
          following: updatedFollowing,
          following_count: updatedFollowing.length 
        })
        .eq('id', currentUserId);
      
      if (updateCurrentError) throw updateCurrentError;
      
      // Update target user
      const { error: updateTargetError } = await supabase
        .from('users')
        .update({ 
          followers: updatedFollowers,
          follower_count: updatedFollowers.length 
        })
        .eq('id', targetUserId);
      
      if (updateTargetError) throw updateTargetError;
      
      return false; // Now not following
    } else {
      // Follow: Add targetUserId to currentUser's following
      const updatedFollowing = [...currentFollowing, targetUserId];
      
      // Add currentUserId to targetUser's followers
      const updatedFollowers = [...targetFollowers, currentUserId];
      
      // Update current user
      const { error: updateCurrentError } = await supabase
        .from('users')
        .update({ 
          following: updatedFollowing,
          following_count: updatedFollowing.length 
        })
        .eq('id', currentUserId);
      
      if (updateCurrentError) throw updateCurrentError;
      
      // Update target user
      const { error: updateTargetError } = await supabase
        .from('users')
        .update({ 
          followers: updatedFollowers,
          follower_count: updatedFollowers.length 
        })
        .eq('id', targetUserId);
      
      if (updateTargetError) throw updateTargetError;
      
      return true; // Now following
    }
  } catch (error) {
    console.error("Error updating follow status:", error);
    throw error;
  }
};

// Update user profile data
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

// Search users
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

export const followUser = async (followerId: string, followingId: string) => {
  try {
    const result = await toggleFollowUser(followerId, followingId);
    return { followed: result };
  } catch (error) {
    console.error("Error following user:", error);
    throw error;
  }
};

export const unfollowUser = async (followerId: string, followingId: string) => {
  try {
    const result = await toggleFollowUser(followerId, followingId);
    return { followed: result };
  } catch (error) {
    console.error("Error unfollowing user:", error);
    throw error;
  }
};
