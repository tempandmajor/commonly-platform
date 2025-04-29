import { supabase } from '@/integrations/supabase/client';
import { UserData } from '@/types/auth';

// Get users with pagination
export const getUsers = async (
  lastVisible = null,
  limit = 20
): Promise<{ users: UserData[], lastVisible: any }> => {
  try {
    let query = supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (lastVisible) {
      query = query.lt('created_at', lastVisible);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    const users: UserData[] = data.map(user => ({
      uid: user.id,
      email: user.email || '',
      displayName: user.display_name || '',
      photoURL: user.photo_url || null,
      isAdmin: user.is_admin || false,
      isPro: user.is_pro || false,
      isMerchant: user.is_merchant || false,
      createdAt: user.created_at,
      // Map any other fields needed
    }));
    
    const lastVisibleItem = data.length === limit ? data[data.length - 1].created_at : null;
    
    return { users, lastVisible: lastVisibleItem };
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

// Search users
export const searchUsers = async (query: string, limit = 20): Promise<UserData[]> => {
  try {
    if (!query.trim()) {
      const { users } = await getUsers(null, limit);
      return users;
    }
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .or(`email.ilike.%${query}%,display_name.ilike.%${query}%`)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    
    return data.map(user => ({
      uid: user.id,
      email: user.email || '',
      displayName: user.display_name || '',
      photoURL: user.photo_url || null,
      isAdmin: user.is_admin || false,
      isPro: user.is_pro || false,
      isMerchant: user.is_merchant || false,
      createdAt: user.created_at,
      // Map any other fields needed
    }));
  } catch (error) {
    console.error("Error searching users:", error);
    throw error;
  }
};

// Update user
export const updateUser = async (
  userId: string,
  data: Partial<{
    display_name: string,
    photo_url: string,
    bio: string,
    is_private: boolean,
    has_two_factor_enabled: boolean,
    // Add any other fields that can be updated
  }>
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('users')
      .update(data)
      .eq('id', userId);
    
    if (error) throw error;
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};

// Set admin status
export const setAdminStatus = async (userId: string, isAdmin: boolean): Promise<void> => {
  try {
    const { error } = await supabase
      .from('users')
      .update({ is_admin: isAdmin })
      .eq('id', userId);
    
    if (error) throw error;
  } catch (error) {
    console.error("Error setting admin status:", error);
    throw error;
  }
};
