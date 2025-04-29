
import { 
  DocumentData
} from 'firebase/firestore';
import { UserData } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';

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

// Event management
export const getAdminEvents = async (lastVisible = null, limitCount = 20) => {
  try {
    let query = supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limitCount);
    
    if (lastVisible) {
      // For pagination, similar approach as getUsers
      const offset = lastVisible * limitCount;
      query = query.range(offset, offset + limitCount - 1);
    }
    
    const { data: events, error } = await query;
    
    if (error) throw error;
    
    // Using the last index as the lastVisible value for pagination
    const lastVisibleIndex = lastVisible ? lastVisible + 1 : 1;
    return { events, lastVisible: events.length === limitCount ? lastVisibleIndex : null };
  } catch (error) {
    console.error("Error fetching events:", error);
    throw error;
  }
};

// Venue management
export const getAdminVenues = async (lastVisible = null, limitCount = 20) => {
  try {
    let query = supabase
      .from('venues')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limitCount);
    
    if (lastVisible) {
      // For pagination
      const offset = lastVisible * limitCount;
      query = query.range(offset, offset + limitCount - 1);
    }
    
    const { data: venues, error } = await query;
    
    if (error) throw error;
    
    // Using the last index as the lastVisible value for pagination
    const lastVisibleIndex = lastVisible ? lastVisible + 1 : 1;
    return { venues, lastVisible: venues.length === limitCount ? lastVisibleIndex : null };
  } catch (error) {
    console.error("Error fetching venues:", error);
    throw error;
  }
};

export const updateVenueVerification = async (venueId: string, isVerified: boolean) => {
  try {
    const { error } = await supabase
      .from('venues')
      .update({ 
        is_verified: isVerified,
        updated_at: new Date().toISOString()
      })
      .eq('id', venueId);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error updating venue verification:", error);
    throw error;
  }
};

// Platform credits
export const distributeCredits = async (userId: string, amount: number, description: string) => {
  try {
    // Add transaction
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        amount,
        type: 'credit',
        status: 'completed',
        description,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    
    if (transactionError) throw transactionError;
    
    // Get user data
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('wallet')
      .eq('id', userId)
      .single();
    
    if (userError) throw userError;
    
    // Update user's wallet
    const wallet = userData.wallet || {};
    const { error: updateError } = await supabase
      .from('users')
      .update({
        wallet: {
          ...wallet,
          platform_credits: (wallet.platform_credits || 0) + amount,
          updated_at: new Date().toISOString(),
        }
      })
      .eq('id', userId);
    
    if (updateError) throw updateError;
    
    return true;
  } catch (error) {
    console.error("Error distributing credits:", error);
    throw error;
  }
};

export const createCreditsCampaign = async (campaignData: any) => {
  try {
    const { data, error } = await supabase
      .from('credits_campaigns')
      .insert({
        ...campaignData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        active: true,
      })
      .select('id')
      .single();
    
    if (error) throw error;
    return data.id;
  } catch (error) {
    console.error("Error creating credits campaign:", error);
    throw error;
  }
};

// Analytics dashboard
export const getDashboardMetrics = async () => {
  try {
    // Get users count
    const { count: totalUsers, error: usersError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });
    
    if (usersError) throw usersError;
    
    // Get active events count (future events)
    const now = new Date().toISOString();
    const { count: activeEvents, error: activeEventsError } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .gte('date', now)
      .eq('published', true);
    
    if (activeEventsError) throw activeEventsError;
    
    // Get past events count
    const { count: pastEvents, error: pastEventsError } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .lt('date', now)
      .eq('published', true);
    
    if (pastEventsError) throw pastEventsError;
    
    // Get venues count
    const { count: venues, error: venuesError } = await supabase
      .from('venues')
      .select('*', { count: 'exact', head: true });
    
    if (venuesError) throw venuesError;
    
    return {
      totalUsers,
      activeEvents,
      pastEvents,
      venues,
    };
  } catch (error) {
    console.error("Error fetching dashboard metrics:", error);
    throw error;
  }
};

// Content management
export const updateContentPage = async (pageId: string, content: any) => {
  try {
    const { error } = await supabase
      .from('content')
      .upsert({
        id: pageId,
        ...content,
        updated_at: new Date().toISOString()
      });
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error updating content:", error);
    throw error;
  }
};

// Ventures content
export const addArtistProfile = async (profile: any) => {
  try {
    const { data, error } = await supabase
      .from('artists')
      .insert({
        ...profile,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('id')
      .single();
    
    if (error) throw error;
    return data.id;
  } catch (error) {
    console.error("Error adding artist profile:", error);
    throw error;
  }
};

export const uploadArtistImage = async (artistId: string, file: File) => {
  try {
    const fileExt = file.name.split('.').pop();
    const filePath = `artists/${artistId}/${Math.random().toString(36).substring(2)}.${fileExt}`;
    
    const { error: uploadError } = await supabase
      .storage
      .from('artists')
      .upload(filePath, file);
    
    if (uploadError) throw uploadError;
    
    // Get public URL
    const { data: urlData } = supabase
      .storage
      .from('artists')
      .getPublicUrl(filePath);
    
    const downloadURL = urlData.publicUrl;
    
    // Update artist with image URL
    const { error: updateError } = await supabase
      .from('artists')
      .update({
        image_url: downloadURL,
        updated_at: new Date().toISOString()
      })
      .eq('id', artistId);
    
    if (updateError) throw updateError;
    
    return downloadURL;
  } catch (error) {
    console.error("Error uploading artist image:", error);
    throw error;
  }
};
