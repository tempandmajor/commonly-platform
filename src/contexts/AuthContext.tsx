
import React, { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp, updateDoc, arrayUnion, arrayRemove, collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { AuthContextType, UserData } from "@/types/auth";
import { useAuthActions } from "@/hooks/useAuthActions";

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
      // Add target user to current user's following list
      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, {
        following: arrayUnion(userId),
        followingCount: (userData.followingCount || 0) + 1
      });
      
      // Add current user to target user's followers list
      const targetUserRef = doc(db, "users", userId);
      const targetUserDoc = await getDoc(targetUserRef);
      
      if (targetUserDoc.exists()) {
        const targetUserData = targetUserDoc.data() as UserData;
        await updateDoc(targetUserRef, {
          followers: arrayUnion(currentUser.uid),
          followerCount: (targetUserData.followerCount || 0) + 1
        });
      }
      
      // Update local user data
      setUserData({
        ...userData,
        following: [...(userData.following || []), userId],
        followingCount: (userData.followingCount || 0) + 1
      });
      
    } catch (error) {
      console.error("Error following user:", error);
      throw error;
    }
  };

  // Unfollow a user
  const unfollowUser = async (userId: string) => {
    if (!currentUser || !userData) throw new Error("No authenticated user");
    
    try {
      // Remove target user from current user's following list
      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, {
        following: arrayRemove(userId),
        followingCount: Math.max((userData.followingCount || 0) - 1, 0)
      });
      
      // Remove current user from target user's followers list
      const targetUserRef = doc(db, "users", userId);
      const targetUserDoc = await getDoc(targetUserRef);
      
      if (targetUserDoc.exists()) {
        const targetUserData = targetUserDoc.data() as UserData;
        await updateDoc(targetUserRef, {
          followers: arrayRemove(currentUser.uid),
          followerCount: Math.max((targetUserData.followerCount || 0) - 1, 0)
        });
      }
      
      // Update local user data
      setUserData({
        ...userData,
        following: (userData.following || []).filter(id => id !== userId),
        followingCount: Math.max((userData.followingCount || 0) - 1, 0)
      });
      
    } catch (error) {
      console.error("Error unfollowing user:", error);
      throw error;
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
      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, {
        hasTwoFactorEnabled: true
      });
      
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
      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, {
        hasTwoFactorEnabled: false
      });
      
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
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const data = userDoc.data() as UserData;
            setUserData({
              ...data,
              followers: data.followers || [],
              following: data.following || [],
              followerCount: data.followerCount || 0,
              followingCount: data.followingCount || 0
            });
          } else {
            const newUserData: UserData = {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL,
              recentLogin: true,
              createdAt: serverTimestamp(),
              followers: [],
              following: [],
              followerCount: 0,
              followingCount: 0,
              isPrivate: false,
              hasTwoFactorEnabled: false
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

  const value: AuthContextType = {
    currentUser,
    userData,
    loading,
    followUser,
    unfollowUser,
    isFollowing,
    enableTwoFactorAuth,
    disableTwoFactorAuth,
    ...authActions,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
