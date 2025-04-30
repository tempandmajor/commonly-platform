
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
import AuthDialog from '../auth/AuthDialog';
import { Menu, X, ChevronDown } from 'lucide-react';
import NotificationsPopover from '../notifications/NotificationsPopover';
import { SearchBox } from '../search/SearchBox';
import { LocationSelector } from '../search/LocationSelector';

const Navbar = () => {
  const { currentUser, userData, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-white shadow">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="font-bold text-xl">Commonly</Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <Link to="/events" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
              Events
            </Link>
            <Link to="/venues" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
              Venues
            </Link>
            <Link to="/catering" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
              Catering
            </Link>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium flex items-center">
                  More <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to="/podcasts" className="w-full">Podcasts</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/store" className="w-full">Marketplace</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/content/about" className="w-full">About Us</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/content/help" className="w-full">Help Center</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Search and Location - Desktop */}
          <div className="hidden md:flex md:items-center md:flex-1 md:justify-center space-x-2 mx-4">
            <SearchBox />
            <LocationSelector />
          </div>

          <div className="hidden md:flex md:items-center md:space-x-2">
            {currentUser ? (
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
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => setIsAuthDialogOpen(true)}
                >
                  Log in
                </Button>
                <Button
                  onClick={() => setIsAuthDialogOpen(true)}
                >
                  Sign up
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center">
            {currentUser && (
              <>
                <Link to="/messages" className="mr-2">
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
                
                <div className="mr-2">
                  <NotificationsPopover />
                </div>
              </>
            )}
            <Button variant="ghost" onClick={toggleMenu}>
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white shadow-lg">
          {/* Search and Location - Mobile */}
          <div className="p-4 space-y-3">
            <SearchBox />
            <LocationSelector />
          </div>
          
          <div className="pt-2 pb-3 space-y-1">
            <Link
              to="/events"
              className="block px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
              onClick={toggleMenu}
            >
              Events
            </Link>
            <Link
              to="/venues"
              className="block px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
              onClick={toggleMenu}
            >
              Venues
            </Link>
            <Link
              to="/catering"
              className="block px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
              onClick={toggleMenu}
            >
              Catering
            </Link>
            <Link
              to="/podcasts"
              className="block px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
              onClick={toggleMenu}
            >
              Podcasts
            </Link>
            <Link
              to="/store"
              className="block px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
              onClick={toggleMenu}
            >
              Marketplace
            </Link>
          </div>

          {currentUser ? (
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
                  onClick={toggleMenu}
                >
                  Profile
                </Link>
                <Link
                  to="/wallet"
                  className="block px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
                  onClick={toggleMenu}
                >
                  Wallet
                </Link>
                <Link
                  to="/create-event"
                  className="block px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
                  onClick={toggleMenu}
                >
                  Create Event
                </Link>
                <Link
                  to="/settings"
                  className="block px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
                  onClick={toggleMenu}
                >
                  Settings
                </Link>
                <Link
                  to="/notification-settings"
                  className="block px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
                  onClick={toggleMenu}
                >
                  Notification Settings
                </Link>
                <button
                  className="block w-full text-left px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
                  onClick={() => {
                    handleLogout();
                    toggleMenu();
                  }}
                >
                  Log out
                </button>
              </div>
            </div>
          ) : (
            <div className="pt-4 pb-3 border-t border-gray-200 px-4 flex flex-col space-y-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsAuthDialogOpen(true);
                  toggleMenu();
                }}
              >
                Log in
              </Button>
              <Button
                onClick={() => {
                  setIsAuthDialogOpen(true);
                  toggleMenu();
                }}
              >
                Sign up
              </Button>
            </div>
          )}
        </div>
      )}

      <AuthDialog
        isOpen={isAuthDialogOpen}
        onClose={() => setIsAuthDialogOpen(false)}
      />
    </nav>
  );
};

export default Navbar;
