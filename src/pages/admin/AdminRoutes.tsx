
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Import admin pages
import Dashboard from './Dashboard';
import Users from './Users';
import Venues from './Venues';
import Events from './Events';
import Content from './Content';
import Credits from './Credits';
import Ventures from './Ventures';

// Admin ProtectedRoute component
import AdminProtectedRoute from '@/components/auth/AdminProtectedRoute';

const AdminRoutes = () => {
  return (
    <AdminProtectedRoute>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/users/*" element={<Users />} />
        <Route path="/venues/*" element={<Venues />} />
        <Route path="/events/*" element={<Events />} />
        <Route path="/content/*" element={<Content />} />
        <Route path="/credits/*" element={<Credits />} />
        <Route path="/ventures/*" element={<Ventures />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </AdminProtectedRoute>
  );
};

export default AdminRoutes;
