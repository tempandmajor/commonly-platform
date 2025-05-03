
import React from 'react';
import { Link } from 'react-router-dom';

const AdminSidebar = () => {
  return (
    <aside className="w-64 bg-gray-800 text-white p-4">
      <div className="mb-6">
        <h2 className="text-lg font-bold">Admin Panel</h2>
      </div>
      <nav className="space-y-2">
        <Link to="/admin/dashboard" className="block px-4 py-2 rounded hover:bg-gray-700">
          Dashboard
        </Link>
        <Link to="/admin/users" className="block px-4 py-2 rounded hover:bg-gray-700">
          User Management
        </Link>
        <Link to="/admin/content" className="block px-4 py-2 rounded hover:bg-gray-700">
          Content Management
        </Link>
        <Link to="/admin/monitoring" className="block px-4 py-2 rounded hover:bg-gray-700">
          System Monitoring
        </Link>
        <Link to="/admin/documentation" className="block px-4 py-2 rounded hover:bg-gray-700">
          Documentation
        </Link>
      </nav>
    </aside>
  );
};

export default AdminSidebar;
