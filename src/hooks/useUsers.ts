
import { useState, useEffect } from 'react';
import { UserData } from '@/types/auth';
import { getUsers, searchUsers, setAdminStatus } from '@/services/adminService';
import { useToast } from '@/hooks/use-toast';

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
      const { users, lastVisible } = await getUsers();
      setUsers(users);
      setLastVisibleState(lastVisible);
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
      const { users: newUsers, lastVisible: newLastVisible } = await getUsers(lastVisibleState, 20);
      setUsers(prev => [...prev, ...newUsers]);
      setLastVisibleState(newLastVisible);
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
      const searchResults = await searchUsers(searchQuery, 20);
      setUsers(searchResults);
      setLastVisibleState(null);
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
      
      await setAdminStatus(user.uid, !user.isAdmin);
      
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
