
import { supabase } from '@/integrations/supabase/client';
import { UserData } from '@/types/auth';

// User management
export const getUsers = async (lastVisible = null, limitCount = 20) => {
  try {
    let query = supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limitCount);
    
    if (lastVisible) {
      // For pagination, Supabase uses ranges rather than cursor-based pagination
      const offset = lastVisible * limitCount;
      query = query.range(offset, offset + limitCount - 1);
    }
    
    const { data: usersData, error } = await query;
    
    if (error) throw error;
    
    const users = usersData.map(data => ({
      uid: data.id,
      email: data.email || null,
      displayName: data.display_name || null,
      photoURL: data.photo_url || null,
      recentLogin: data.recent_login || false,
      createdAt: data.created_at,
      stripeConnectId: data.stripe_connect_id,
      followers: data.followers,
      following: data.following,
      followerCount: data.follower_count,
      followingCount: data.following_count,
      isPrivate: data.is_private,
      hasTwoFactorEnabled: data.has_two_factor_enabled,
      bio: data.bio,
      isMerchant: data.is_merchant,
      merchantStoreId: data.merchant_store_id,
      isPro: data.is_pro,
      isPodcaster: data.is_podcaster,
      podcastChannelName: data.podcast_channel_name,
      featuredPodcasts: data.featured_podcasts,
      isAdmin: data.is_admin
    }) as UserData);
    
    // Using the last index as the lastVisible value for pagination
    const lastVisibleIndex = lastVisible ? lastVisible + 1 : 1;
    return { users, lastVisible: users.length === limitCount ? lastVisibleIndex : null };
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

export const searchUsers = async (searchTerm: string, limitCount = 20) => {
  try {
    const { data: usersData, error } = await supabase
      .from('users')
      .select('*')
      .ilike('display_name', `%${searchTerm}%`)
      .limit(limitCount);
    
    if (error) throw error;
    
    return usersData.map(data => ({
      uid: data.id,
      email: data.email || null,
      displayName: data.display_name || null,
      photoURL: data.photo_url || null,
      recentLogin: data.recent_login || false,
      createdAt: data.created_at,
      stripeConnectId: data.stripe_connect_id,
      followers: data.followers,
      following: data.following,
      followerCount: data.follower_count,
      followingCount: data.following_count,
      isPrivate: data.is_private,
      hasTwoFactorEnabled: data.has_two_factor_enabled,
      bio: data.bio,
      isMerchant: data.is_merchant,
      merchantStoreId: data.merchant_store_id,
      isPro: data.is_pro,
      isPodcaster: data.is_podcaster,
      podcastChannelName: data.podcast_channel_name,
      featuredPodcasts: data.featured_podcasts,
      isAdmin: data.is_admin
    }) as UserData);
  } catch (error) {
    console.error("Error searching users:", error);
    throw error;
  }
};

export const updateUser = async (userId: string, data: Partial<UserData>) => {
  try {
    // Convert camelCase keys to snake_case for Supabase
    const supabaseData: Record<string, any> = {};
    Object.entries(data).forEach(([key, value]) => {
      // Convert camelCase to snake_case
      const snakeCaseKey = key.replace(/([A-Z])/g, "_$1").toLowerCase();
      supabaseData[snakeCaseKey] = value;
    });
    
    // Add updated_at timestamp
    supabaseData.updated_at = new Date().toISOString();
    
    const { error } = await supabase
      .from('users')
      .update(supabaseData)
      .eq('id', userId);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};

export const setAdminStatus = async (userId: string, isAdmin: boolean) => {
  try {
    const { error } = await supabase
      .from('users')
      .update({ 
        is_admin: isAdmin,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error setting admin status:", error);
    throw error;
  }
};
