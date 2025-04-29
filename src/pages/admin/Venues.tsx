
import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminProtectedRoute from '@/components/auth/AdminProtectedRoute';

const Venues = () => {
  return (
    <AdminProtectedRoute>
      <AdminLayout />
    </AdminProtectedRoute>
  );
};

export default Venues;
