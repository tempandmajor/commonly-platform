import { supabase } from "@/integrations/supabase/client";
import { UserData } from "@/types/auth";

export const getUserProfile = async (userId: string): Promise<UserData | null> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    
    return data as UserData;
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
    const { data, error } = await supabase
      .rpc('get_user_followers', { user_id_param: userId });
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error("Error fetching user followers:", error);
    return [];
  }
};

export const getUserFollowing = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .rpc('get_user_following', { user_id_param: userId });
    
    if (error) throw error;
    
    return data || [];
  }
  catch (error) {
    console.error("Error fetching user following:", error);
    return [];
  }
};

export const followUser = async (followerId: string, followingId: string) => {
  try {
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
          created_at: new Date()
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
    const { error } = await supabase
      .from('users')
      .update(profileData)
      .eq('id', userId);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

export const searchUsers = async (query: string) => {
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
    }));
  } catch (error) {
    console.error("Error searching users:", error);
    throw error;
  }
};

export const isUserPro = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('is_pro')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    
    return !!data?.is_pro;
  } catch (error) {
    console.error("Error checking user pro status:", error);
    return false;
  }
};
