
import React from 'react';
import { 
  TableRow,
  TableCell
} from '@/components/ui/table';
import {
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Sheet,
  SheetTrigger,
} from '@/components/ui/sheet';
import { 
  AlertDialog,
  AlertDialogContent,
  AlertDialogTrigger,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Shield, User } from 'lucide-react';
import { UserData } from '@/types/auth';

interface UserRowProps {
  user: UserData;
  toggleAdminStatus: (user: UserData) => Promise<void>;
  setSelectedUser: (user: UserData | null) => void;
}

const UserRow: React.FC<UserRowProps> = ({ user, toggleAdminStatus, setSelectedUser }) => {
  return (
    <TableRow key={user.uid}>
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
            {user.photoURL ? (
              <img 
                src={user.photoURL} 
                alt={user.displayName || 'User'} 
                className="h-full w-full object-cover"
              />
            ) : (
              <User className="h-5 w-5 text-gray-500" />
            )}
          </div>
          <div>
            <div className="font-medium">{user.displayName || 'Unnamed User'}</div>
            <div className="text-xs text-gray-500">ID: {user.uid?.substring(0, 8)}...</div>
          </div>
        </div>
      </TableCell>
      <TableCell>{user.email}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          {user.isAdmin && (
            <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded flex items-center">
              <Shield className="h-3 w-3 mr-1" />
              Admin
            </span>
          )}
          {user.isPro && (
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
              Pro
            </span>
          )}
        </div>
      </TableCell>
      <TableCell>
        {user.createdAt ? 
          new Date(user.createdAt.seconds * 1000).toLocaleDateString() : 
          'Unknown'
        }
      </TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <Sheet>
              <SheetTrigger asChild>
                <DropdownMenuItem onSelect={(e) => {
                  e.preventDefault();
                  setSelectedUser(user);
                }}>
                  View details
                </DropdownMenuItem>
              </SheetTrigger>
            </Sheet>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem className="text-red-600" onSelect={(e) => e.preventDefault()}>
                  Ban user
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Ban User</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to ban {user.displayName || user.email}? This action 
                    will prevent them from accessing the platform and cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction className="bg-red-600 hover:bg-red-700">
                    Ban User
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};

export default UserRow;
