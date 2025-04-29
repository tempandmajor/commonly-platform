
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { UserData } from "@/types/auth";

export const useAuthActions = (
  currentUser: User | null,
  userData: UserData | null,
  setUserData: (userData: UserData | null) => void
) => {
  const { toast } = useToast();

  const signup = async (email: string, password: string, displayName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: displayName
          }
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "Account created successfully",
        description: `Welcome to Commonly, ${displayName}!`,
      });
    } catch (error: any) {
      const errorMessage = error.message || "Failed to create account";
      toast({
        variant: "destructive",
        title: "Signup failed",
        description: errorMessage,
      });
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      if (currentUser) {
        const { error: updateError } = await supabase
          .from('users')
          .update({ recent_login: true })
          .eq('id', currentUser.id);
        
        if (updateError) console.error("Error updating recent login:", updateError);
      }
      
      toast({
        title: "Login successful",
        description: "Welcome back to Commonly!",
      });
    } catch (error: any) {
      const errorMessage = error.message || "Failed to log in";
      toast({
        variant: "destructive",
        title: "Login failed",
        description: errorMessage,
      });
      throw error;
    }
  };

  const googleSignIn = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      });
      
      if (error) throw error;
      
      toast({
        title: "Login successful",
        description: "Welcome to Commonly!",
      });
    } catch (error: any) {
      const errorMessage = error.message || "Failed to sign in with Google";
      toast({
        variant: "destructive",
        title: "Google Sign-in failed",
        description: errorMessage,
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
    } catch (error: any) {
      const errorMessage = error.message || "Failed to log out";
      toast({
        variant: "destructive",
        title: "Logout failed",
        description: errorMessage,
      });
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      
      if (error) throw error;
      
      toast({
        title: "Password reset email sent",
        description: "Check your inbox for further instructions",
      });
    } catch (error: any) {
      const errorMessage = error.message || "Failed to send password reset email";
      toast({
        variant: "destructive",
        title: "Reset password failed",
        description: errorMessage,
      });
      throw error;
    }
  };

  const updateUserProfile = async (data: Partial<UserData>) => {
    if (!currentUser) throw new Error("No authenticated user");
    
    try {
      const updateData: any = {};
      
      if (data.displayName) {
        updateData.display_name = data.displayName;
        
        // Update auth metadata
        await supabase.auth.updateUser({
          data: { full_name: data.displayName }
        });
      }
      
      if (data.photoURL) updateData.photo_url = data.photoURL;
      if (data.bio !== undefined) updateData.bio = data.bio;
      if (data.isPrivate !== undefined) updateData.is_private = data.isPrivate;
      
      const { error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', currentUser.id);
      
      if (error) throw error;
      
      if (userData) {
        setUserData({ ...userData, ...data });
      }
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
    } catch (error: any) {
      const errorMessage = error.message || "Failed to update profile";
      toast({
        variant: "destructive",
        title: "Update failed",
        description: errorMessage,
      });
      throw error;
    }
  };

  const uploadProfileImage = async (file: File): Promise<string> => {
    if (!currentUser) throw new Error("No authenticated user");
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${currentUser.id}-${Date.now()}.${fileExt}`;
      const filePath = `profiles/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const downloadURL = data.publicUrl;
      
      // Update user profile
      await updateUserProfile({ photoURL: downloadURL });
      
      // Update auth metadata
      await supabase.auth.updateUser({
        data: { avatar_url: downloadURL }
      });
      
      toast({
        title: "Profile image updated",
        description: "Your profile image has been updated successfully",
      });
      
      return downloadURL;
    } catch (error: any) {
      const errorMessage = error.message || "Failed to upload profile image";
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: errorMessage,
      });
      throw error;
    }
  };

  const resetWalkthrough = async () => {
    if (!currentUser || !userData) throw new Error("No authenticated user");
    
    try {
      const { error } = await supabase
        .from('users')
        .update({ recent_login: true })
        .eq('id', currentUser.id);
      
      if (error) throw error;
      
      setUserData({ 
        ...userData, 
        recentLogin: true 
      });
      
      toast({
        title: "Walkthrough reset",
        description: "The app walkthrough will show the next time you visit",
      });
    } catch (error: any) {
      const errorMessage = error.message || "Failed to reset walkthrough";
      toast({
        variant: "destructive",
        title: "Reset failed",
        description: errorMessage,
      });
      throw error;
    }
  };

  // Add merchant store activation functionality
  const activateMerchantStore = async () => {
    if (!currentUser || !userData) throw new Error("No authenticated user");

    // Check if user already has a merchant store
    if (userData.isMerchant) {
      toast({
        title: "Store already exists",
        description: "You already have a merchant store",
      });
      return;
    }

    // Check eligibility (1000+ followers)
    if (!userData.followerCount || userData.followerCount < 1000) {
      toast({
        variant: "destructive",
        title: "Not eligible",
        description: "You need at least 1,000 followers to create a merchant store",
      });
      return;
    }

    try {
      const storeName = `${userData.displayName || "User"}'s Store`;
      const storeDescription = `Official store by ${userData.displayName || "User"}`;
      
      // Create a store_id instead of using a merchant_stores table
      const storeId = `store_${currentUser.id}`;
      
      // Update user record with merchant status
      const { error: userError } = await supabase
        .from('users')
        .update({
          is_merchant: true,
          merchant_store_id: storeId
        })
        .eq('id', currentUser.id);
      
      if (userError) throw userError;

      // Update user data
      setUserData({
        ...userData,
        isMerchant: true,
        merchantStoreId: storeId
      });

      toast({
        title: "Store created",
        description: "Your merchant store has been created successfully!",
      });
    } catch (error: any) {
      const errorMessage = error.message || "Failed to create merchant store";
      toast({
        variant: "destructive",
        title: "Store creation failed",
        description: errorMessage,
      });
      throw error;
    }
  };

  return {
    signup,
    login,
    logout,
    googleSignIn,
    resetPassword,
    updateUserProfile,
    uploadProfileImage,
    resetWalkthrough,
    activateMerchantStore,
  };
};
