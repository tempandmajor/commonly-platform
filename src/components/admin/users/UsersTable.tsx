
import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Loader2 } from 'lucide-react';
import { UserData } from '@/types/auth';
import UserRow from './UserRow';

interface UsersTableProps {
  loading: boolean;
  users: UserData[];
  toggleAdminStatus: (user: UserData) => Promise<void>;
  setSelectedUser: (user: UserData | null) => void;
}

const UsersTable: React.FC<UsersTableProps> = ({ 
  loading, 
  users, 
  toggleAdminStatus, 
  setSelectedUser 
}) => {
  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-10">
                <div className="flex justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                </div>
              </TableCell>
            </TableRow>
          ) : users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-10">
                No users found
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <UserRow 
                key={user.uid}
                user={user}
                toggleAdminStatus={toggleAdminStatus}
                setSelectedUser={setSelectedUser}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default UsersTable;
