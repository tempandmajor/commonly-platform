
import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminProtectedRoute from '@/components/auth/AdminProtectedRoute';
import ServiceMonitor from '@/components/admin/monitoring/ServiceMonitor';

const Monitoring = () => {
  return (
    <AdminProtectedRoute>
      <AdminLayout>
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">System Monitoring</h1>
          <ServiceMonitor />
        </div>
      </AdminLayout>
    </AdminProtectedRoute>
  );
};

export default Monitoring;
