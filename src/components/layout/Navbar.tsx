
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { SearchBox } from '../search/SearchBox';
import { LocationSelector } from '../search/LocationSelector';
import AuthDialog from '../auth/AuthDialog';
import NavLinks from './NavLinks';
import UserMenu from './UserMenu';
import MobileMenu from './MobileMenu';
import MobileNavControls from './MobileNavControls';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleOpenAuthDialog = () => {
    setIsAuthDialogOpen(true);
  };

  const handleCloseMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-white border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="font-bold text-xl flex items-center space-x-2">
              <svg 
                className="w-8 h-8 text-black" 
                viewBox="0 0 24 24" 
                fill="currentColor"
              >
                <path d="M12 1.5C6.2 1.5 1.5 6.2 1.5 12S6.2 22.5 12 22.5 22.5 17.8 22.5 12 17.8 1.5 12 1.5zM12 17c-2.8 0-5-2.2-5-5s2.2-5 5-5 5 2.2 5 5-2.2 5-5 5z" />
              </svg>
              <span>Commonly</span>
            </Link>
          </div>
          
          {/* Search and Location - Desktop */}
          <div className="hidden md:flex md:items-center md:flex-1 md:justify-center space-x-2 mx-4">
            <div className="border border-gray-300 rounded-full shadow-sm hover:shadow-md transition-all px-4 py-2 flex items-center divide-x divide-gray-300">
              <SearchBox />
              <LocationSelector />
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <NavLinks />
          </div>

          <div className="hidden md:flex md:items-center md:space-x-2">
            <UserMenu onOpenAuthDialog={handleOpenAuthDialog} />
          </div>

          {/* Mobile menu button */}
          <MobileNavControls isMenuOpen={isMenuOpen} toggleMenu={toggleMenu} />
        </div>
      </div>

      {/* Mobile menu */}
      <MobileMenu 
        isOpen={isMenuOpen} 
        onCloseMenu={handleCloseMenu} 
        onOpenAuthDialog={handleOpenAuthDialog}
      />

      <AuthDialog
        isOpen={isAuthDialogOpen}
        onClose={() => setIsAuthDialogOpen(false)}
      />
    </nav>
  );
};

export default Navbar;
