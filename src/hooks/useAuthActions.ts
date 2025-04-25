
import { User } from "firebase/auth";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db, storage, googleProvider } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { UserData } from "@/types/auth";
import { createMerchantStore } from "@/services/merchantService";

export const useAuthActions = (
  currentUser: User | null,
  userData: UserData | null,
  setUserData: (userData: UserData | null) => void
) => {
  const { toast } = useToast();

  const signup = async (email: string, password: string, displayName: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(result.user, { displayName });
      
      const newUserData: UserData = {
        uid: result.user.uid,
        email: result.user.email,
        displayName,
        photoURL: null,
        recentLogin: true,
        createdAt: serverTimestamp(),
      };
      
      await setDoc(doc(db, "users", result.user.uid), newUserData);
      
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
      await signInWithEmailAndPassword(auth, email, password);
      
      if (currentUser) {
        const userDocRef = doc(db, "users", currentUser.uid);
        await updateDoc(userDocRef, { recentLogin: true });
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
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        const newUserData: UserData = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          recentLogin: true,
          createdAt: serverTimestamp(),
        };
        
        await setDoc(userDocRef, newUserData);
        toast({
          title: "Account created successfully",
          description: `Welcome to Commonly, ${user.displayName}!`,
        });
      } else {
        await updateDoc(userDocRef, { recentLogin: true });
        toast({
          title: "Login successful",
          description: "Welcome back to Commonly!",
        });
      }
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
      await signOut(auth);
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
      await sendPasswordResetEmail(auth, email);
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
      const userDocRef = doc(db, "users", currentUser.uid);
      
      if (data.displayName) {
        await updateProfile(currentUser, { displayName: data.displayName });
      }
      
      await updateDoc(userDocRef, data);
      
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
      const storageRef = ref(storage, `profile_images/${currentUser.uid}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      
      await updateProfile(currentUser, { photoURL: downloadURL });
      
      if (userData) {
        const userDocRef = doc(db, "users", currentUser.uid);
        await updateDoc(userDocRef, { photoURL: downloadURL });
        setUserData({ ...userData, photoURL: downloadURL });
      }
      
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
      const userDocRef = doc(db, "users", currentUser.uid);
      await updateDoc(userDocRef, { recentLogin: true });
      
      setUserData({ ...userData, recentLogin: true });
      
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

      // Create the merchant store
      const storeId = await createMerchantStore(currentUser.uid, {
        name: storeName,
        description: `Official store by ${userData.displayName || "User"}`,
      });

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
