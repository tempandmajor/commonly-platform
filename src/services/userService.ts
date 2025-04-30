
import { supabase } from "@/integrations/supabase/client";
import { UserData } from "@/types/auth";

/**
 * Get user data by ID
 */
export const getUserById = async (userId: string): Promise<UserData> => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();
    
    if (error) throw error;
    
    if (!data) throw new Error("User not found");
    
    return {
      uid: data.id,
      email: data.email,
      displayName: data.display_name,
      photoURL: data.photo_url,
      isAdmin: data.is_admin || false,
      isPro: data.is_pro || false,
      isMerchant: data.is_merchant || false,
      merchantStoreId: data.merchant_store_id,
      followers: data.followers,
      following: data.following,
      followerCount: data.follower_count,
      followingCount: data.following_count,
      isPrivate: data.is_private,
      hasTwoFactorEnabled: data.has_two_factor_enabled,
      bio: data.bio,
      recentLogin: data.recent_login,
      createdAt: data.created_at,
    };
  } catch (error) {
    console.error("Error getting user by ID:", error);
    throw error;
  }
};

/**
 * Get user data by multiple IDs
 */
export const getUsersByIds = async (userIds: string[]): Promise<UserData[]> => {
  if (!userIds.length) return [];
  
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .in("id", userIds);
    
    if (error) throw error;
    
    return data.map(user => ({
      uid: user.id,
      email: user.email,
      displayName: user.display_name,
      photoURL: user.photo_url,
      isAdmin: user.is_admin || false,
      isPro: user.is_pro || false,
      isMerchant: user.is_merchant || false,
      merchantStoreId: user.merchant_store_id,
      followers: user.followers,
      following: user.following,
      followerCount: user.follower_count,
      followingCount: user.following_count,
      isPrivate: user.is_private,
      hasTwoFactorEnabled: user.has_two_factor_enabled,
      bio: user.bio,
      recentLogin: user.recent_login,
      createdAt: user.created_at,
    }));
  } catch (error) {
    console.error("Error getting users by IDs:", error);
    throw error;
  }
};

/**
 * Search users by name or email
 */
export const searchUsers = async (query: string): Promise<UserData[]> => {
  if (!query || query.length < 2) return [];
  
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .or(`display_name.ilike.%${query}%,email.ilike.%${query}%`)
      .limit(10);
    
    if (error) throw error;
    
    return data.map(user => ({
      uid: user.id,
      email: user.email,
      displayName: user.display_name,
      photoURL: user.photo_url,
      isAdmin: user.is_admin || false,
      isPro: user.is_pro || false,
      isMerchant: user.is_merchant || false,
      merchantStoreId: user.merchant_store_id,
      followers: user.followers,
      following: user.following,
      followerCount: user.follower_count,
      followingCount: user.following_count,
      isPrivate: user.is_private,
      hasTwoFactorEnabled: user.has_two_factor_enabled,
      bio: user.bio,
      recentLogin: user.recent_login,
      createdAt: user.created_at,
    }));
  } catch (error) {
    console.error("Error searching users:", error);
    throw error;
  }
};

/**
 * Follow a user
 */
export const followUser = async (currentUserId: string, targetUserId: string): Promise<void> => {
  try {
    // Get current user data
    const { data: currentUserData, error: currentUserError } = await supabase
      .from("users")
      .select("following, following_count")
      .eq("id", currentUserId)
      .single();
    
    if (currentUserError) throw currentUserError;
    
    // Get target user data
    const { data: targetUserData, error: targetUserError } = await supabase
      .from("users")
      .select("followers, follower_count")
      .eq("id", targetUserId)
      .single();
    
    if (targetUserError) throw targetUserError;
    
    // Update following for current user
    const currentUserFollowing = [...(currentUserData.following || [])];
    if (!currentUserFollowing.includes(targetUserId)) {
      currentUserFollowing.push(targetUserId);
      
      const { error: updateError } = await supabase
        .from("users")
        .update({
          following: currentUserFollowing,
          following_count: (currentUserData.following_count || 0) + 1
        })
        .eq("id", currentUserId);
      
      if (updateError) throw updateError;
    }
    
    // Update followers for target user
    const targetUserFollowers = [...(targetUserData.followers || [])];
    if (!targetUserFollowers.includes(currentUserId)) {
      targetUserFollowers.push(currentUserId);
      
      const { error: updateError } = await supabase
        .from("users")
        .update({
          followers: targetUserFollowers,
          follower_count: (targetUserData.follower_count || 0) + 1
        })
        .eq("id", targetUserId);
      
      if (updateError) throw updateError;
    }
  } catch (error) {
    console.error("Error following user:", error);
    throw error;
  }
};

/**
 * Unfollow a user
 */
export const unfollowUser = async (currentUserId: string, targetUserId: string): Promise<void> => {
  try {
    // Get current user data
    const { data: currentUserData, error: currentUserError } = await supabase
      .from("users")
      .select("following, following_count")
      .eq("id", currentUserId)
      .single();
    
    if (currentUserError) throw currentUserError;
    
    // Get target user data
    const { data: targetUserData, error: targetUserError } = await supabase
      .from("users")
      .select("followers, follower_count")
      .eq("id", targetUserId)
      .single();
    
    if (targetUserError) throw targetUserError;
    
    // Update following for current user
    const currentUserFollowing = [...(currentUserData.following || [])];
    const followingIndex = currentUserFollowing.indexOf(targetUserId);
    if (followingIndex !== -1) {
      currentUserFollowing.splice(followingIndex, 1);
      
      const { error: updateError } = await supabase
        .from("users")
        .update({
          following: currentUserFollowing,
          following_count: Math.max((currentUserData.following_count || 0) - 1, 0)
        })
        .eq("id", currentUserId);
      
      if (updateError) throw updateError;
    }
    
    // Update followers for target user
    const targetUserFollowers = [...(targetUserData.followers || [])];
    const followerIndex = targetUserFollowers.indexOf(currentUserId);
    if (followerIndex !== -1) {
      targetUserFollowers.splice(followerIndex, 1);
      
      const { error: updateError } = await supabase
        .from("users")
        .update({
          followers: targetUserFollowers,
          follower_count: Math.max((targetUserData.follower_count || 0) - 1, 0)
        })
        .eq("id", targetUserId);
      
      if (updateError) throw updateError;
    }
  } catch (error) {
    console.error("Error unfollowing user:", error);
    throw error;
  }
};
