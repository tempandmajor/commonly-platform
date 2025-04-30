
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
    </>
  );
};

export default NavLinks;
