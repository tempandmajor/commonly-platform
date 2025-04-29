
import React from 'react';
import {
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';
import { UserData } from '@/types/auth';

interface UserDetailsSheetProps {
  user: UserData | null;
  toggleAdminStatus: (user: UserData) => Promise<void>;
  onClose: () => void;
}

const UserDetailsSheet: React.FC<UserDetailsSheetProps> = ({ user, toggleAdminStatus, onClose }) => {
  if (!user) return null;

  const formatDate = (dateValue: string | Date | undefined) => {
    if (!dateValue) return 'Unknown';
    
    try {
      if (typeof dateValue === 'string') {
        return new Date(dateValue).toLocaleString();
      }
      // Handle Firebase Timestamp objects if they exist
      if (typeof dateValue === 'object' && 'seconds' in dateValue) {
        // Use type assertion to tell TypeScript that dateValue.seconds is a number
        const seconds = (dateValue as any).seconds;
        return new Date(seconds * 1000).toLocaleString();
      }
      return dateValue.toLocaleString();
    } catch (error) {
      return 'Invalid date';
    }
  };

  return (
    <SheetContent>
      <SheetHeader>
        <SheetTitle>User Details</SheetTitle>
        <SheetDescription>
          View and manage user information
        </SheetDescription>
      </SheetHeader>
      <div className="py-4 space-y-6">
        <div className="flex flex-col items-center gap-4">
          <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
            {user.photoURL ? (
              <img 
                src={user.photoURL} 
                alt={user.displayName || 'User'} 
                className="h-full w-full object-cover"
              />
            ) : (
              <User className="h-12 w-12 text-gray-500" />
            )}
          </div>
          <h3 className="text-xl font-semibold">{user.displayName || 'Unnamed User'}</h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-500">Email</h4>
            <p>{user.email}</p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-500">User ID</h4>
            <p>{user.uid}</p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-500">Joined</h4>
            <p>{formatDate(user.createdAt)}</p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-500">Status</h4>
            <div className="flex flex-wrap gap-2 mt-1">
              {user.isAdmin && (
                <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded">
                  Admin
                </span>
              )}
              {user.isPro && (
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                  Pro
                </span>
              )}
              {user.isMerchant && (
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                  Merchant
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <Button 
            variant={user.isAdmin ? "destructive" : "default"}
            onClick={() => toggleAdminStatus(user)}
            className="w-full"
          >
            {user.isAdmin ? "Remove Admin Status" : "Make Admin"}
          </Button>
        </div>
      </div>
    </SheetContent>
  );
};

export default UserDetailsSheet;
