
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthContextType, UserData, UserSession } from "@/types/auth";
import { useAuthActions } from "@/hooks/useAuthActions";
import { User } from "@supabase/supabase-js";
import { toast } from "@/hooks/use-toast";
import { adaptUser } from "@/utils/userAdapter";

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const authActions = useAuthActions(currentUser, userData, setUserData);

  // Follow a user
  const followUser = async (userId: string) => {
    if (!currentUser || !userData) throw new Error("No authenticated user");
    
    try {
      const currentUserId = currentUser.id;
      
      // Get current following list
      const { data: currentUserData, error: fetchError } = await supabase
        .from('users')
        .select('following, following_count')
        .eq('id', currentUserId)
        .single();
      
      if (fetchError) throw fetchError;
      
      // Add target user to current user's following list
      const following = [...(currentUserData.following || []), userId];
      const followingCount = (currentUserData.following_count || 0) + 1;
      
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          following, 
          following_count: followingCount
        })
        .eq('id', currentUserId);
      
      if (updateError) throw updateError;
      
      // Get target user's follower list
      const { data: targetUserData, error: targetFetchError } = await supabase
        .from('users')
        .select('followers, follower_count')
        .eq('id', userId)
        .single();
      
      if (targetFetchError) throw targetFetchError;
      
      // Add current user to target user's followers list
      const followers = [...(targetUserData.followers || []), currentUserId];
      const followerCount = (targetUserData.follower_count || 0) + 1;
      
      const { error: targetUpdateError } = await supabase
        .from('users')
        .update({ 
          followers, 
          follower_count: followerCount
        })
        .eq('id', userId);
      
      if (targetUpdateError) throw targetUpdateError;
      
      // Update local user data
      if (userData && Array.isArray(userData.following)) {
        setUserData({
          ...userData,
          following: [...userData.following, userId],
          followingCount: (userData.followingCount || 0) + 1
        });
      }
      
    } catch (error) {
      console.error("Error following user:", error);
      throw error;
    }
  };

  // Unfollow a user
  const unfollowUser = async (userId: string) => {
    if (!currentUser) return;
    
    try {
      // Remove from following array
      const updatedFollowing = userData?.following ? 
        userData.following.filter(id => id !== userId) : 
        [];
      
      // Update in Supabase
      const { error } = await supabase
        .from('users')
        .update({
          following: updatedFollowing,
          following_count: updatedFollowing.length
        })
        .eq('id', currentUser.id);
      
      if (error) throw error;
      
      // Update local state
      if (userData && Array.isArray(userData.following)) {
        setUserData({
          ...userData,
          following: updatedFollowing,
          followingCount: updatedFollowing.length
        });
      }
      
      // Also update the target user's followers count
      try {
        // Direct update since the RPC function is not available
        const { data: targetUser } = await supabase
          .from('users')
          .select('followers, follower_count')
          .eq('id', userId)
          .single();
          
        if (targetUser) {
          const updatedFollowers = targetUser.followers.filter((id: string) => id !== currentUser.id);
          await supabase
            .from('users')
            .update({
              followers: updatedFollowers,
              follower_count: updatedFollowers.length
            })
            .eq('id', userId);
        }
      } catch (error) {
        console.error('Error updating target user:', error);
      }
      
      toast({
        title: "Success",
        description: "You have unfollowed this user",
      });
    } catch (error) {
      console.error('Error unfollowing user:', error);
      toast({
        title: "Error",
        description: "Failed to unfollow user",
        variant: "destructive",
      });
    }
  };

  // Check if following a user
  const isFollowing = (userId: string): boolean => {
    if (!userData || !userData.following) return false;
    return userData.following.includes(userId);
  };

  // Two-factor authentication
  const enableTwoFactorAuth = async () => {
    if (!currentUser) throw new Error("No authenticated user");
    
    try {
      const { error } = await supabase
        .from('users')
        .update({ has_two_factor_enabled: true })
        .eq('id', currentUser.id);
      
      if (error) throw error;
      
      if (userData) {
        setUserData({
          ...userData,
          hasTwoFactorEnabled: true
        });
      }
    } catch (error) {
      console.error("Error enabling 2FA:", error);
      throw error;
    }
  };

  const disableTwoFactorAuth = async () => {
    if (!currentUser) throw new Error("No authenticated user");
    
    try {
      const { error } = await supabase
        .from('users')
        .update({ has_two_factor_enabled: false })
        .eq('id', currentUser.id);
      
      if (error) throw error;
      
      if (userData) {
        setUserData({
          ...userData,
          hasTwoFactorEnabled: false
        });
      }
    } catch (error) {
      console.error("Error disabling 2FA:", error);
      throw error;
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const adaptedUser = adaptUser(session?.user ?? null);
        setCurrentUser(adaptedUser);
        
        if (session?.user) {
          try {
            const { data: userProfileData, error } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .single();
            
            if (error && error.code !== 'PGRST116') { // Not found error
              console.error("Error fetching user data:", error);
              throw error;
            }
            
            if (userProfileData) {
              setUserData({
                uid: userProfileData.id,
                email: userProfileData.email,
                displayName: userProfileData.display_name,
                photoURL: userProfileData.photo_url,
                isAdmin: userProfileData.is_admin,
                isPro: userProfileData.is_pro,
                isMerchant: userProfileData.is_merchant,
                merchantStoreId: userProfileData.merchant_store_id,
                followers: userProfileData.followers || [],
                following: userProfileData.following || [],
                followerCount: userProfileData.follower_count || 0,
                followingCount: userProfileData.following_count || 0,
                isPrivate: userProfileData.is_private,
                hasTwoFactorEnabled: userProfileData.has_two_factor_enabled,
                bio: userProfileData.bio,
                recentLogin: userProfileData.recent_login,
                createdAt: userProfileData.created_at,
              });
            } else {
              // User doesn't exist in the 'users' table yet, create a record
              const newUserData = {
                id: session.user.id,
                email: session.user.email,
                display_name: session.user.user_metadata?.full_name || null,
                photo_url: session.user.user_metadata?.avatar_url || null,
                recent_login: true,
                followers: [],
                following: [],
                follower_count: 0,
                following_count: 0,
                is_private: false,
                has_two_factor_enabled: false
              };
              
              const { error: insertError } = await supabase
                .from('users')
                .insert(newUserData);
              
              if (insertError) {
                console.error("Error creating user record:", insertError);
                throw insertError;
              }
              
              setUserData({
                uid: session.user.id,
                email: session.user.email,
                displayName: newUserData.display_name,
                photoURL: newUserData.photo_url,
                followers: [],
                following: [],
                followerCount: 0,
                followingCount: 0,
                isPrivate: false,
                hasTwoFactorEnabled: false,
                recentLogin: true,
                createdAt: new Date().toISOString(),
              });
            }
          } catch (error) {
            console.error("Error in auth state change:", error);
          }
        } else {
          setUserData(null);
        }
        
        setLoading(false);
      }
    );

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      const adaptedUser = adaptUser(session?.user ?? null);
      setCurrentUser(adaptedUser);
      
      if (!session) {
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Create compatibility methods to match the required interface
  const signIn = authActions.login;
  const signUp = authActions.signup;
  const signOut = authActions.logout;
  const resetPassword = authActions.resetPassword;
  const updateProfile = authActions.updateUserProfile;
  const deleteAccount = async () => {
    if (!currentUser) throw new Error("No authenticated user");
    
    try {
      const { error } = await supabase.auth.admin.deleteUser(currentUser.id);
      if (error) throw error;
    } catch (error) {
      console.error("Error deleting account:", error);
      throw error;
    }
  };

  const value: AuthContextType = {
    currentUser,
    userData,
    loading,
    // Compatibility methods
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
    deleteAccount,
    followUser,
    unfollowUser,
    isFollowing,
    enableTwoFactorAuth,
    disableTwoFactorAuth,
    // Direct access to authActions
    ...authActions,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
