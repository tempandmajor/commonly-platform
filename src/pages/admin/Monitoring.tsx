
import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import ServiceMonitor from '@/components/admin/monitoring/ServiceMonitor';

const Monitoring = () => {
  return (
    <AdminLayout>
      <ServiceMonitor />
    </AdminLayout>
  );
};

export default Monitoring;
