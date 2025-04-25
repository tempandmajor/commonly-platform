import React, { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
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

interface UserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  recentLogin: boolean;
  createdAt?: any;
}

interface AuthContextType {
  currentUser: User | null;
  userData: UserData | null;
  signup: (email: string, password: string, displayName: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  googleSignIn: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (data: Partial<UserData>) => Promise<void>;
  uploadProfileImage: (file: File) => Promise<string>;
  resetWalkthrough: () => Promise<void>;
  loading: boolean;
}

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
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            setUserData(userDoc.data() as UserData);
          } else {
            // Create user document if it doesn't exist
            const newUserData: UserData = {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL,
              recentLogin: true,
              createdAt: serverTimestamp(),
            };
            
            await setDoc(userDocRef, newUserData);
            setUserData(newUserData);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signup = async (email: string, password: string, displayName: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with displayName
      await updateProfile(result.user, { displayName });
      
      // Create user document
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
      
      // Check if this is a new user
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        // New user, create document
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
        // Existing user
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

  const uploadProfileImage = async (file: File): Promise<string> => {
    if (!currentUser) throw new Error("No authenticated user");
    
    try {
      const storageRef = ref(storage, `profile_images/${currentUser.uid}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      
      // Update user profile
      await updateProfile(currentUser, { photoURL: downloadURL });
      
      // Update Firestore
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

  const updateUserProfile = async (data: Partial<UserData>) => {
    if (!currentUser) throw new Error("No authenticated user");
    
    try {
      const userDocRef = doc(db, "users", currentUser.uid);
      
      // Update displayName in Firebase Auth if provided
      if (data.displayName) {
        await updateProfile(currentUser, { displayName: data.displayName });
      }
      
      // Update Firestore
      await updateDoc(userDocRef, data);
      
      // Update local state
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

  const resetWalkthrough = async () => {
    if (!currentUser || !userData) throw new Error("No authenticated user");
    
    try {
      const userDocRef = doc(db, "users", currentUser.uid);
      await updateDoc(userDocRef, { recentLogin: true });
      
      // Update local state
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

  const value = {
    currentUser,
    userData,
    signup,
    login,
    logout,
    googleSignIn,
    resetPassword,
    updateUserProfile,
    uploadProfileImage,
    resetWalkthrough,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
