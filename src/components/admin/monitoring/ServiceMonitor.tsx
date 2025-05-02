
import React from 'react';

const ServiceMonitor: React.FC = () => {
  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">Service Monitoring</h1>
      
      <div className="grid gap-6">
        <div className="p-6 border rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">API Status</h2>
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
            <span>Operational</span>
          </div>
        </div>
        
        <div className="p-6 border rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Database Status</h2>
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
            <span>Operational</span>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            <p>Connection pool: 5/20</p>
            <p>Average query time: 42ms</p>
          </div>
        </div>
        
        <div className="p-6 border rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Storage Service</h2>
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
            <span>Operational</span>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            <p>Storage usage: 12.4GB / 50GB</p>
          </div>
        </div>
        
        <div className="p-6 border rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Authentication Service</h2>
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
            <span>Operational</span>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            <p>Active sessions: 134</p>
            <p>Logins today: 56</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceMonitor;
