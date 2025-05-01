
import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminProtectedRoute from '@/components/auth/AdminProtectedRoute';
import TechnicalDocs from '@/components/admin/documentation/TechnicalDocs';

const Documentation = () => {
  return (
    <AdminProtectedRoute>
      <AdminLayout>
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">Documentation</h1>
          <TechnicalDocs />
        </div>
      </AdminLayout>
    </AdminProtectedRoute>
  );
};

export default Documentation;
