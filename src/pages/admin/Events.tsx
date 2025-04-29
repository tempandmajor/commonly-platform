
import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminProtectedRoute from '@/components/auth/AdminProtectedRoute';

const Events = () => {
  return (
    <AdminProtectedRoute>
      <AdminLayout />
    </AdminProtectedRoute>
  );
};

export default Events;
