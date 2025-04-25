
import { User } from "firebase/auth";

export interface UserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  recentLogin: boolean;
  createdAt?: any;
  stripeConnectId?: string;
}

export interface AuthContextType {
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
