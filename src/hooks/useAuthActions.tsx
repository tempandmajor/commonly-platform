import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { UserData } from "@/types/auth";
import { adaptUser, AdaptedUser } from "@/utils/userAdapter";

export const useAuthActions = (
  currentUser: AdaptedUser | null,
  userData: UserData | null,
  setUserData: React.Dispatch<React.SetStateAction<UserData | null>>
) => {
  const [loadingAction, setLoadingAction] = useState(false);

  const login = async (email: string, password: string) => {
    setLoadingAction(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error(error.message);
      }
      
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      toast({
        title: "Authentication Failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoadingAction(false);
    }
  };

  const signup = async (email: string, password: string, displayName?: string) => {
    setLoadingAction(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: displayName,
          },
        },
      });

      if (error) {
        throw new Error(error.message);
      }
      
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      toast({
        title: "Signup Failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoadingAction(false);
    }
  };

  const logout = async () => {
    setLoadingAction(true);
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      toast({
        title: "Logout Failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoadingAction(false);
    }
  };

  const googleSignIn = async () => {
    setLoadingAction(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      });
  
      if (error) {
        throw new Error(error.message);
      }
  
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      toast({
        title: "Google Sign-In Failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoadingAction(false);
    }
  };

  const resetPassword = async (email: string) => {
    setLoadingAction(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (error) {
        throw new Error(error.message);
      }
      toast({
        title: "Password Reset Email Sent",
        description: "Check your email to reset your password.",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      toast({
        title: "Password Reset Failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoadingAction(false);
    }
  };

  const updateUserProfile = async (data: Partial<UserData>) => {
    setLoadingAction(true);
    if (!currentUser) throw new Error("No authenticated user");
    
    try {
      const updates: { [key: string]: any } = {};
      
      if (data.displayName !== undefined) {
        updates.display_name = data.displayName;
      }
      if (data.photoURL !== undefined) {
        updates.photo_url = data.photoURL;
      }
      if (data.bio !== undefined) {
        updates.bio = data.bio;
      }
      if (data.isPrivate !== undefined) {
        updates.is_private = data.isPrivate;
      }
      
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', currentUser.uid);
      
      if (error) {
        throw error;
      }
      
      // Update user data locally
      setUserData((prevUserData) => {
        if (!prevUserData) return null;
        
        return {
          ...prevUserData,
          ...data,
        };
      });
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Profile Update Failed",
        description: "Failed to update your profile.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoadingAction(false);
    }
  };

  const resetWalkthrough = async () => {
    setLoadingAction(true);
    if (!currentUser) throw new Error("No authenticated user");
    
    try {
      const { error } = await supabase
        .from('users')
        .update({ walkthrough_completed: false })
        .eq('id', currentUser.uid);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Walkthrough Reset",
        description: "The app walkthrough has been reset.",
      });
    } catch (error) {
      console.error("Error resetting walkthrough:", error);
      toast({
        title: "Walkthrough Reset Failed",
        description: "Failed to reset the app walkthrough.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoadingAction(false);
    }
  };

  const uploadProfileImage = async (file: File): Promise<string> => {
    setLoadingAction(true);
    if (!currentUser) throw new Error("No authenticated user");
    
    try {
      const timestamp = new Date().getTime();
      const filePath = `avatars/${currentUser.uid}/${timestamp}-${file.name}`;
      
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) {
        throw error;
      }
      
      const publicURL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${data.path}`;
      
      // Update user profile with the new avatar URL
      await updateUserProfile({ photoURL: publicURL });
      
      toast({
        title: "Profile Image Updated",
        description: "Your profile image has been updated successfully.",
      });
      
      return publicURL;
    } catch (error) {
      console.error("Error uploading profile image:", error);
      toast({
        title: "Profile Image Upload Failed",
        description: "Failed to upload your profile image.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoadingAction(false);
    }
  };

  const activateMerchantStore = async () => {
    setLoadingAction(true);
    if (!currentUser) throw new Error("No authenticated user");
    
    try {
      // Check if the user already has a merchant store
      if (userData?.isMerchant) {
        toast({
          title: "Already a Merchant",
          description: "You are already a merchant.",
        });
        return;
      }
      
      // Create a new merchant store
      const { data: storeData, error: storeError } = await supabase
        .from('merchant_stores')
        .insert([{ owner_id: currentUser.uid }])
        .select()
        .single();
      
      if (storeError) {
        throw storeError;
      }
      
      // Update user to be a merchant and link the store
      const { error: userError } = await supabase
        .from('users')
        .update({ 
          is_merchant: true,
          merchant_store_id: storeData.id
        })
        .eq('id', currentUser.uid);
      
      if (userError) {
        throw userError;
      }
      
      // Update local user data
      setUserData((prevUserData) => {
        if (!prevUserData) return null;
        
        return {
          ...prevUserData,
          isMerchant: true,
          merchantStoreId: storeData.id,
        };
      });
      
      toast({
        title: "Merchant Account Activated",
        description: "Your merchant account has been activated.",
      });
    } catch (error) {
      console.error("Error activating merchant store:", error);
      toast({
        title: "Merchant Account Activation Failed",
        description: "Failed to activate your merchant account.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoadingAction(false);
    }
  };

  return {
    loadingAction,
    login,
    signup,
    logout,
    googleSignIn,
    resetPassword,
    updateUserProfile,
    resetWalkthrough,
    uploadProfileImage,
    activateMerchantStore
  };
};
