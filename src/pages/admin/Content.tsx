
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import ContentListTable from '@/components/admin/content/ContentListTable';
import ContentEditor from '@/components/admin/content/ContentEditor';

const Content = () => {
  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<ContentListTable />} />
        <Route path="/new" element={<ContentEditor />} />
        <Route path="/edit/:pageId" element={<ContentEditor />} />
        <Route path="*" element={<Navigate to="/admin/content" replace />} />
      </Routes>
    </AdminLayout>
  );
};

export default Content;
