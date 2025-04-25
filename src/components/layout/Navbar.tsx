
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Plus, Settings } from 'lucide-react';
import { 
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';

const Navbar = () => {
  const { currentUser, logout } = useAuth();

  return (
    <header className="bg-white shadow">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center">
              <img 
                src="/lovable-uploads/13680d9d-b642-446a-9311-a7707d98a527.png" 
                alt="Commonly" 
                className="h-8"
              />
            </Link>
            
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <Link to="/events" className={navigationMenuTriggerStyle()}>
                    Events
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link to="/about" className={navigationMenuTriggerStyle()}>
                    About
                  </Link>
                </NavigationMenuItem>
                {currentUser && (
                  <NavigationMenuItem>
                    <Link to="/dashboard" className={navigationMenuTriggerStyle()}>
                      Dashboard
                    </Link>
                  </NavigationMenuItem>
                )}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          <div className="flex items-center space-x-4">
            {currentUser ? (
              <>
                <Link to="/create-event">
                  <Button>
                    <Plus className="mr-1 h-4 w-4" />
                    Create Event
                  </Button>
                </Link>
                <Link to="/settings">
                  <Button variant="outline">
                    <Settings className="mr-1 h-4 w-4" />
                    Settings
                  </Button>
                </Link>
                <Button variant="outline" onClick={logout}>
                  Sign Out
                </Button>
              </>
            ) : (
              <Button onClick={() => window.location.href = '/login'}>
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
