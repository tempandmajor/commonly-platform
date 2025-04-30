
import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const NavLinks = () => {
  return (
    <>
      <Link to="/events" className="text-black hover:text-gray-600 px-3 py-2 rounded-md text-sm font-medium">
        Events
      </Link>
      <Link to="/venues" className="text-black hover:text-gray-600 px-3 py-2 rounded-md text-sm font-medium">
        Venues
      </Link>
      <Link to="/catering" className="text-black hover:text-gray-600 px-3 py-2 rounded-md text-sm font-medium">
        Catering
      </Link>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="text-black hover:text-gray-600 px-3 py-2 rounded-md text-sm font-medium flex items-center">
            More <ChevronDown className="ml-1 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-lg border-gray-200">
          <DropdownMenuItem asChild className="hover:bg-gray-100 rounded-md">
            <Link to="/podcasts" className="w-full">Podcasts</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="hover:bg-gray-100 rounded-md">
            <Link to="/store" className="w-full">Marketplace</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild className="hover:bg-gray-100 rounded-md">
            <Link to="/content/about" className="w-full">About Us</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="hover:bg-gray-100 rounded-md">
            <Link to="/content/help" className="w-full">Help Center</Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default NavLinks;
