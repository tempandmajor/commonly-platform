
import React from 'react';
import { Link } from 'react-router-dom';
import { SearchBox } from '../search/SearchBox';
import { LocationSelector } from '../search/LocationSelector';
import { useAuth } from '@/contexts/AuthContext';
import UserMenu from './UserMenu';

interface MobileMenuProps {
  isOpen: boolean;
  onCloseMenu: () => void;
  onOpenAuthDialog: () => void;
}

const MobileMenu = ({ isOpen, onCloseMenu, onOpenAuthDialog }: MobileMenuProps) => {
  const { currentUser } = useAuth();

  if (!isOpen) return null;

  return (
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
          onClick={onCloseMenu}
        >
          Events
        </Link>
        <Link
          to="/venues"
          className="block px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
          onClick={onCloseMenu}
        >
          Venues
        </Link>
        <Link
          to="/catering"
          className="block px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
          onClick={onCloseMenu}
        >
          Catering
        </Link>
        <Link
          to="/podcasts"
          className="block px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
          onClick={onCloseMenu}
        >
          Podcasts
        </Link>
        <Link
          to="/store"
          className="block px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
          onClick={onCloseMenu}
        >
          Marketplace
        </Link>
      </div>

      {currentUser ? (
        <UserMenu 
          onOpenAuthDialog={onOpenAuthDialog} 
          isMobile={true} 
          onCloseMenu={onCloseMenu}
        />
      ) : (
        <div className="pt-4 pb-3 border-t border-gray-200 px-4 flex flex-col space-y-2">
          <UserMenu onOpenAuthDialog={onOpenAuthDialog} />
        </div>
      )}
    </div>
  );
};

export default MobileMenu;
