
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const TechnicalDocs: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Technical Documentation</h1>
        <p className="text-muted-foreground">
          Reference documentation for developers and system administrators
        </p>
      </div>

      <Tabs defaultValue="api">
        <TabsList>
          <TabsTrigger value="api">API Reference</TabsTrigger>
          <TabsTrigger value="database">Database Schema</TabsTrigger>
          <TabsTrigger value="deployment">Deployment</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>
        
        <TabsContent value="api" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>REST API Endpoints</CardTitle>
              <CardDescription>Core API endpoint documentation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="font-medium">Authentication</h3>
              <div className="font-mono bg-muted p-4 rounded-md text-sm">
                <p>POST /api/auth/login</p>
                <p>POST /api/auth/register</p>
                <p>POST /api/auth/refresh</p>
                <p>POST /api/auth/logout</p>
              </div>
              
              <h3 className="font-medium mt-4">Users</h3>
              <div className="font-mono bg-muted p-4 rounded-md text-sm">
                <p>GET /api/users</p>
                <p>GET /api/users/:id</p>
                <p>PATCH /api/users/:id</p>
                <p>DELETE /api/users/:id</p>
              </div>
              
              <h3 className="font-medium mt-4">Events</h3>
              <div className="font-mono bg-muted p-4 rounded-md text-sm">
                <p>GET /api/events</p>
                <p>POST /api/events</p>
                <p>GET /api/events/:id</p>
                <p>PATCH /api/events/:id</p>
                <p>DELETE /api/events/:id</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Webhooks</CardTitle>
              <CardDescription>Integration webhooks documentation</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Available webhooks for third-party integrations
              </p>
              <div className="font-mono bg-muted p-4 rounded-md text-sm">
                <p>POST /webhooks/stripe</p>
                <p>POST /webhooks/supabase</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Database Schema</CardTitle>
              <CardDescription>Core database tables and relationships</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Primary database structure and entity relationships
              </p>
              <div className="overflow-auto">
                <pre className="bg-muted p-4 rounded-md text-xs">
{`-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  photo_url TEXT,
  bio TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events table
CREATE TABLE events (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  date TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY,
  chat_id UUID NOT NULL,
  sender_id UUID NOT NULL,
  recipient_id UUID NOT NULL,
  text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read BOOLEAN DEFAULT FALSE
);`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deployment" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Deployment Guide</CardTitle>
              <CardDescription>Instructions for deploying the application</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Step-by-step deployment instructions for different environments
              </p>
              <div className="space-y-2">
                <h3 className="font-medium">Prerequisites</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Node.js 18+</li>
                  <li>PostgreSQL 14+</li>
                  <li>Redis (optional)</li>
                </ul>
                
                <h3 className="font-medium mt-4">Production Deployment</h3>
                <div className="font-mono bg-muted p-4 rounded-md text-sm">
                  <p>npm install --production</p>
                  <p>npm run build</p>
                  <p>npm run start</p>
                </div>
                
                <h3 className="font-medium mt-4">Environment Variables</h3>
                <div className="font-mono bg-muted p-4 rounded-md text-sm">
                  <p>DATABASE_URL=postgres://user:password@host:port/db</p>
                  <p>JWT_SECRET=your-secret-key</p>
                  <p>STRIPE_SECRET_KEY=sk_test_...</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Monitoring Setup</CardTitle>
              <CardDescription>System monitoring configuration</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Monitoring tools and metrics collection setup
              </p>
              <div className="space-y-2">
                <h3 className="font-medium">Health Checks</h3>
                <div className="font-mono bg-muted p-4 rounded-md text-sm">
                  <p>GET /health</p>
                  <p>GET /health/db</p>
                  <p>GET /health/redis</p>
                </div>
                
                <h3 className="font-medium mt-4">Metrics</h3>
                <div className="font-mono bg-muted p-4 rounded-md text-sm">
                  <p>GET /metrics</p>
                </div>
                
                <h3 className="font-medium mt-4">Log Collection</h3>
                <p className="text-sm text-muted-foreground">
                  Application logs are sent to stdout/stderr in JSON format for collection by log aggregation tools.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TechnicalDocs;
