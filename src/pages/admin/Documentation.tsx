
import React from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import TechnicalDocs from "@/components/admin/documentation/TechnicalDocs";

const Documentation: React.FC = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Documentation</h1>
        <p className="text-muted-foreground">
          Technical documentation and guides for the platform.
        </p>
        <TechnicalDocs />
      </div>
    </AdminLayout>
  );
};

export default Documentation;
