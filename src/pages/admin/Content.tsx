
import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminProtectedRoute from '@/components/auth/AdminProtectedRoute';

const Content = () => {
  return (
    <AdminProtectedRoute>
      <AdminLayout />
    </AdminProtectedRoute>
  );
};

export default Content;
