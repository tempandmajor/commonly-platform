
import React from 'react';
import { Sheet, SheetTrigger } from '@/components/ui/sheet';
import UserSearchBar from '@/components/admin/users/UserSearchBar';
import UsersTable from '@/components/admin/users/UsersTable';
import UserDetailsSheet from '@/components/admin/users/UserDetailsSheet';
import LoadMoreButton from '@/components/admin/users/LoadMoreButton';
import { useUsers } from '@/hooks/useUsers';

const Users: React.FC = () => {
  const { 
    users,
    loading,
    loadingMore,
    lastVisible,
    searchQuery,
    selectedUser,
    setSearchQuery,
    handleSearch,
    loadMoreUsers,
    toggleAdminStatus,
    setSelectedUser
  } = useUsers();

  return (
    <div className="space-y-6">
      <UserSearchBar 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleSearch={handleSearch}
      />

      <UsersTable 
        loading={loading}
        users={users}
        toggleAdminStatus={toggleAdminStatus}
        setSelectedUser={setSelectedUser}
      />

      {!loading && users.length > 0 && (
        <LoadMoreButton 
          loadMoreUsers={loadMoreUsers}
          lastVisible={lastVisible}
          loadingMore={loadingMore}
        />
      )}

      <Sheet open={selectedUser !== null} onOpenChange={(open) => {
        if (!open) {
          setSelectedUser(null);
        }
      }}>
        <SheetTrigger asChild>
          <div></div>
        </SheetTrigger>
        <UserDetailsSheet 
          user={selectedUser} 
          toggleAdminStatus={toggleAdminStatus}
          onClose={() => setSelectedUser(null)}
        />
      </Sheet>
    </div>
  );
};

export default Users;
