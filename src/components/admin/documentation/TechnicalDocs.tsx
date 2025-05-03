
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const TechnicalDocs = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Technical Documentation</h1>
      <p className="text-muted-foreground">
        Access technical documentation for system administrators and developers.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>API Documentation</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Complete documentation of our API endpoints, authentication methods, and data models.
            </p>
            <a href="#" className="text-blue-600 hover:underline">
              View API Docs
            </a>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Database Schema</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Database schema documentation including tables, relationships, and query optimizations.
            </p>
            <a href="#" className="text-blue-600 hover:underline">
              View Schema Docs
            </a>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Admin Panel Guide</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Step-by-step guide for using the admin panel features and capabilities.
            </p>
            <a href="#" className="text-blue-600 hover:underline">
              View Admin Guide
            </a>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>System Architecture</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Overview of system architecture, component interactions, and deployment infrastructure.
            </p>
            <a href="#" className="text-blue-600 hover:underline">
              View Architecture Docs
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TechnicalDocs;
