
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import NotificationsPopover from '../notifications/NotificationsPopover';

interface UserMenuProps {
  onOpenAuthDialog: () => void;
  isMobile?: boolean;
  onCloseMenu?: () => void;
}

const UserMenu = ({ onOpenAuthDialog, isMobile = false, onCloseMenu }: UserMenuProps) => {
  const { currentUser, userData, logout } = useAuth();
  
  const handleLogout = async () => {
    try {
      await logout();
      if (onCloseMenu) onCloseMenu();
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  if (!currentUser) {
    return (
      <>
        <Button
          variant="outline"
          onClick={onOpenAuthDialog}
        >
          Log in
        </Button>
        <Button
          onClick={onOpenAuthDialog}
        >
          Sign up
        </Button>
      </>
    );
  }

  if (isMobile) {
    return (
      <div className="pt-4 pb-3 border-t border-gray-200">
        <div className="flex items-center px-4">
          <div className="flex-shrink-0">
            <Avatar>
              <AvatarImage src={currentUser.photoURL || undefined} alt="Profile" />
              <AvatarFallback>
                {userData?.displayName?.charAt(0) || currentUser.email?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="ml-3">
            <div className="text-base font-medium">{userData?.displayName || currentUser.email}</div>
          </div>
        </div>
        <div className="mt-3 space-y-1">
          <Link
            to={`/profile/${currentUser.uid}`}
            className="block px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
            onClick={onCloseMenu}
          >
            Profile
          </Link>
          <Link
            to="/wallet"
            className="block px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
            onClick={onCloseMenu}
          >
            Wallet
          </Link>
          <Link
            to="/create-event"
            className="block px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
            onClick={onCloseMenu}
          >
            Create Event
          </Link>
          <Link
            to="/settings"
            className="block px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
            onClick={onCloseMenu}
          >
            Settings
          </Link>
          <Link
            to="/notification-settings"
            className="block px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
            onClick={onCloseMenu}
          >
            Notification Settings
          </Link>
          <button
            className="block w-full text-left px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
            onClick={handleLogout}
          >
            Log out
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Link to="/messages">
        <Button variant="ghost" size="icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
          >
            <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" />
          </svg>
          <span className="sr-only">Messages</span>
        </Button>
      </Link>
      
      <NotificationsPopover />
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10">
              <AvatarImage src={currentUser.photoURL || undefined} alt="Profile" />
              <AvatarFallback>
                {userData?.displayName?.charAt(0) || currentUser.email?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link to={`/profile/${currentUser.uid}`} className="w-full">Profile</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/wallet" className="w-full">Wallet</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/create-event" className="w-full">Create Event</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/settings" className="w-full">Settings</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/notification-settings" className="w-full">Notification Settings</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default UserMenu;
