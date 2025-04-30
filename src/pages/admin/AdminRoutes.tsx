
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { Layout, Users, LayoutDashboard, CalendarDays, Building2, FilePenLine, CreditCard, Activity, FileText } from 'lucide-react';

import AdminLogin from '../AdminLogin';
import AdminProtectedRoute from '@/components/auth/AdminProtectedRoute';
import Dashboard from './Dashboard';
import Users from './Users';
import Events from './Events';
import Venues from './Venues';
import Content from './Content';
import Credits from './Credits';
import Ventures from './Ventures';
import Monitoring from './Monitoring';
import Documentation from './Documentation';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Events', href: '/admin/events', icon: CalendarDays },
  { name: 'Venues', href: '/admin/venues', icon: Building2 },
  { name: 'Content', href: '/admin/content', icon: FilePenLine },
  { name: 'Credits', href: '/admin/credits', icon: CreditCard },
  { name: 'Ventures', href: '/admin/ventures', icon: Layout },
  { name: 'Monitoring', href: '/admin/monitoring', icon: Activity },
  { name: 'Documentation', href: '/admin/documentation', icon: FileText }
];

/**
 * Admin routes setup with protected routes
 */
const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<AdminLogin />} />
      
      <Route path="/" element={<AdminProtectedRoute><Dashboard /></AdminProtectedRoute>} />
      <Route path="/users" element={<AdminProtectedRoute><Users /></AdminProtectedRoute>} />
      <Route path="/events" element={<AdminProtectedRoute><Events /></AdminProtectedRoute>} />
      <Route path="/venues" element={<AdminProtectedRoute><Venues /></AdminProtectedRoute>} />
      <Route path="/content" element={<AdminProtectedRoute><Content /></AdminProtectedRoute>} />
      <Route path="/credits" element={<AdminProtectedRoute><Credits /></AdminProtectedRoute>} />
      <Route path="/ventures" element={<AdminProtectedRoute><Ventures /></AdminProtectedRoute>} />
      <Route path="/monitoring" element={<AdminProtectedRoute><Monitoring /></AdminProtectedRoute>} />
      <Route path="/documentation" element={<AdminProtectedRoute><Documentation /></AdminProtectedRoute>} />
    </Routes>
  );
};

export { navigation };
export default AdminRoutes;
