
import React from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import ServiceMonitor from "@/components/admin/monitoring/ServiceMonitor";

const Monitoring: React.FC = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Service Monitoring</h1>
        <p className="text-muted-foreground">
          Monitor the status and performance of platform services.
        </p>
        <ServiceMonitor />
      </div>
    </AdminLayout>
  );
};

export default Monitoring;
