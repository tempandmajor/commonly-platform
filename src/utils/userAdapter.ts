
import { User } from "@supabase/supabase-js";

/**
 * Adapts Supabase User object to include Firebase-like properties
 * This helps maintain compatibility with code that expects Firebase auth user properties
 */
export const adaptUser = (supabaseUser: User | null): (User & { uid: string, photoURL?: string | null, displayName?: string | null }) | null => {
  if (!supabaseUser) return null;
  
  return {
    ...supabaseUser,
    uid: supabaseUser.id,
    photoURL: supabaseUser.user_metadata?.avatar_url || null,
    displayName: supabaseUser.user_metadata?.full_name || null,
  };
};
