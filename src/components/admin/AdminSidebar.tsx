
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  CalendarDays, 
  Building, 
  Utensils, 
  Share2, 
  FileText,
  DollarSign,
  Settings,
  LogOut,
  Music,
  BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

const AdminSidebar: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await auth.signOut();
      toast({
        title: "Logged out successfully"
      });
      navigate('/admin/login');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Logout failed",
        description: "An error occurred while logging out"
      });
    }
  };

  const navItems = [
    { to: '/admin/dashboard', icon: <LayoutDashboard className="h-5 w-5" />, label: 'Dashboard' },
    { to: '/admin/users', icon: <Users className="h-5 w-5" />, label: 'Users' },
    { to: '/admin/events', icon: <CalendarDays className="h-5 w-5" />, label: 'Events' },
    { to: '/admin/venues', icon: <Building className="h-5 w-5" />, label: 'Venues' },
    { to: '/admin/catering', icon: <Utensils className="h-5 w-5" />, label: 'Catering' },
    { to: '/admin/campaigns', icon: <Share2 className="h-5 w-5" />, label: 'Referrals' },
    { to: '/admin/content', icon: <FileText className="h-5 w-5" />, label: 'Content' },
    { to: '/admin/ventures', icon: <BookOpen className="h-5 w-5" />, label: 'Ventures' },
    { to: '/admin/credits', icon: <DollarSign className="h-5 w-5" />, label: 'Credits' },
    { to: '/admin/settings', icon: <Settings className="h-5 w-5" />, label: 'Settings' },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-bold">Commonly Admin</h2>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink 
                to={item.to}
                className={({ isActive }) => 
                  `flex items-center px-3 py-2 rounded-md transition-colors ${
                    isActive 
                      ? 'bg-gray-100 text-gray-900' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`
                }
              >
                {item.icon}
                <span className="ml-3">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        <Button 
          variant="outline" 
          className="w-full flex items-center justify-center"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
};

export default AdminSidebar;
