
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminLogin from '@/pages/AdminLogin';
import Dashboard from '@/pages/admin/Dashboard';
import Users from '@/pages/admin/Users';
import Credits from '@/pages/admin/Credits';
import Ventures from '@/pages/admin/Ventures';

// Placeholder components for other admin pages
const Events = () => <div>Events Management</div>;
const Venues = () => <div>Venues Management</div>;
const Catering = () => <div>Catering Management</div>;
const Campaigns = () => <div>Referral Campaigns</div>;
const Content = () => <div>Content Management</div>;
const Settings = () => <div>Admin Settings</div>;

const AdminRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="login" element={<AdminLogin />} />
      <Route path="/" element={<AdminLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="users" element={<Users />} />
        <Route path="events" element={<Events />} />
        <Route path="venues" element={<Venues />} />
        <Route path="catering" element={<Catering />} />
        <Route path="campaigns" element={<Campaigns />} />
        <Route path="content" element={<Content />} />
        <Route path="ventures" element={<Ventures />} />
        <Route path="credits" element={<Credits />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;
