
import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import TechnicalDocs from '@/components/admin/documentation/TechnicalDocs';

const Documentation: React.FC = () => {
  return (
    <AdminLayout>
      <TechnicalDocs />
    </AdminLayout>
  );
};

export default Documentation;
