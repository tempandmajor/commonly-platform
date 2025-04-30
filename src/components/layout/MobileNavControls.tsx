
import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import NotificationsPopover from '../notifications/NotificationsPopover';

interface MobileNavControlsProps {
  isMenuOpen: boolean;
  toggleMenu: () => void;
}

const MobileNavControls = ({ isMenuOpen, toggleMenu }: MobileNavControlsProps) => {
  const { currentUser } = useAuth();

  return (
    <div className="flex md:hidden items-center">
      {currentUser && (
        <>
          <Link to="/messages" className="mr-2">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100">
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
      <Button 
        variant="ghost" 
        onClick={toggleMenu} 
        className="rounded-full border border-gray-300 p-2 hover:shadow-md"
      >
        {isMenuOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <Menu className="h-5 w-5" />
        )}
      </Button>
    </div>
  );
};

export default MobileNavControls;
