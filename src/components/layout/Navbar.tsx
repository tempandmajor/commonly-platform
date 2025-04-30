
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
    <nav className="bg-white shadow">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="font-bold text-xl">Commonly</Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <NavLinks />
          </div>

          {/* Search and Location - Desktop */}
          <div className="hidden md:flex md:items-center md:flex-1 md:justify-center space-x-2 mx-4">
            <SearchBox />
            <LocationSelector />
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
