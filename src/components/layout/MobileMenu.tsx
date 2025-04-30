
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
    <div className="md:hidden bg-white shadow-lg border-t border-gray-200 fixed left-0 right-0 top-20 bottom-0 z-40 overflow-y-auto">
      {/* Search and Location - Mobile */}
      <div className="p-6 space-y-4">
        <div className="border border-gray-300 rounded-full overflow-hidden shadow-sm">
          <SearchBox />
        </div>
        <div className="border border-gray-300 rounded-full overflow-hidden shadow-sm">
          <LocationSelector />
        </div>
      </div>
      
      <div className="pt-2 pb-3 space-y-1 border-t border-gray-200">
        {['Events', 'Venues', 'Catering', 'Podcasts', 'Marketplace'].map((item) => (
          <Link
            key={item}
            to={`/${item.toLowerCase()}`}
            className="block px-6 py-3 text-base font-medium text-black hover:bg-gray-50"
            onClick={onCloseMenu}
          >
            {item}
          </Link>
        ))}
      </div>

      <div className="pt-4 pb-3 border-t border-gray-200 px-6">
        <div className="text-lg font-semibold mb-2">More</div>
        <div className="space-y-1">
          <Link
            to="/content/about"
            className="block py-2 text-base text-gray-600 hover:text-black"
            onClick={onCloseMenu}
          >
            About Us
          </Link>
          <Link
            to="/content/help"
            className="block py-2 text-base text-gray-600 hover:text-black"
            onClick={onCloseMenu}
          >
            Help Center
          </Link>
        </div>
      </div>

      {currentUser ? (
        <UserMenu 
          onOpenAuthDialog={onOpenAuthDialog} 
          isMobile={true} 
          onCloseMenu={onCloseMenu}
        />
      ) : (
        <div className="pt-4 pb-6 border-t border-gray-200 px-6 flex flex-col space-y-3 mt-4">
          <UserMenu onOpenAuthDialog={onOpenAuthDialog} />
        </div>
      )}
    </div>
  );
};

export default MobileMenu;
