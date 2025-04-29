
import { useState, useEffect } from 'react';
import { UserData } from '@/types/auth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useUsers = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [lastVisibleState, setLastVisibleState] = useState<any | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const { toast } = useToast();

  const fetchUsers = async (searchValue = '') => {
    setLoading(true);
    try {
      let query = supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      const formattedUsers: UserData[] = data.map(user => ({
        uid: user.id,
        email: user.email || '',
        displayName: user.display_name || '',
        photoURL: user.photo_url || null,
        isAdmin: user.is_admin || false,
        createdAt: user.created_at,
        // Add other fields as needed
      }));
      
      setUsers(formattedUsers);
      setLastVisibleState(data.length === 20 ? data[data.length - 1].created_at : null);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load users"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMoreUsers = async () => {
    if (!lastVisibleState) return;
    
    setLoadingMore(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })
        .lt('created_at', lastVisibleState)
        .limit(20);
      
      if (error) throw error;
      
      const formattedUsers: UserData[] = data.map(user => ({
        uid: user.id,
        email: user.email || '',
        displayName: user.display_name || '',
        photoURL: user.photo_url || null,
        isAdmin: user.is_admin || false,
        createdAt: user.created_at,
        // Add other fields as needed
      }));
      
      setUsers(prev => [...prev, ...formattedUsers]);
      setLastVisibleState(data.length === 20 ? data[data.length - 1].created_at : null);
    } catch (error) {
      console.error("Error loading more users:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load more users"
      });
    } finally {
      setLoadingMore(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .or(`email.ilike.%${searchQuery}%,display_name.ilike.%${searchQuery}%`)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      
      const formattedUsers: UserData[] = data.map(user => ({
        uid: user.id,
        email: user.email || '',
        displayName: user.display_name || '',
        photoURL: user.photo_url || null,
        isAdmin: user.is_admin || false,
        createdAt: user.created_at,
        // Add other fields as needed
      }));
      
      setUsers(formattedUsers);
      setLastVisibleState(data.length === 20 ? data[data.length - 1].created_at : null);
    } catch (error) {
      console.error("Error searching users:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to search users"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleAdminStatus = async (user: UserData) => {
    try {
      if (!user.uid) {
        throw new Error("User ID is missing");
      }
      
      const { error } = await supabase
        .from('users')
        .update({ is_admin: !user.isAdmin })
        .eq('id', user.uid);
      
      if (error) throw error;
      
      setUsers(prev => 
        prev.map(u => 
          u.uid === user.uid ? { ...u, isAdmin: !user.isAdmin } : u
        )
      );
      
      toast({
        title: "Success",
        description: `Admin status ${!user.isAdmin ? "granted to" : "revoked from"} ${user.displayName || user.email}`
      });
      
    } catch (error) {
      console.error("Error toggling admin status:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update admin status"
      });
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    loadingMore,
    lastVisible: lastVisibleState,
    searchQuery,
    selectedUser,
    setSearchQuery,
    handleSearch,
    loadMoreUsers,
    toggleAdminStatus,
    setSelectedUser
  };
};
