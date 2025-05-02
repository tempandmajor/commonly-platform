
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const TechnicalDocs = () => {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="api" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="api">API</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="frontend">Frontend</TabsTrigger>
          <TabsTrigger value="deployment">Deployment</TabsTrigger>
        </TabsList>
        
        <TabsContent value="api" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>API Documentation</CardTitle>
              <CardDescription>
                Overview of available API endpoints and authentication
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <section>
                <h3 className="text-lg font-medium">Authentication</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  All API requests require authentication using JWT tokens. Tokens are obtained through the authentication endpoints.
                </p>
                <pre className="mt-2 p-2 bg-muted rounded-md">
                  <code>
                    {`POST /auth/login
POST /auth/register
POST /auth/refresh-token`}
                  </code>
                </pre>
              </section>
              
              <section>
                <h3 className="text-lg font-medium">User Endpoints</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Endpoints for user profile management
                </p>
                <pre className="mt-2 p-2 bg-muted rounded-md">
                  <code>
                    {`GET /users/profile
PUT /users/profile
GET /users/{id}
GET /users/search`}
                  </code>
                </pre>
              </section>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="database" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Database Schema</CardTitle>
              <CardDescription>
                Overview of database tables and relationships
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-muted">
                      <th className="border p-2 text-left">Table Name</th>
                      <th className="border p-2 text-left">Description</th>
                      <th className="border p-2 text-left">Key Relationships</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border p-2">users</td>
                      <td className="border p-2">User accounts and profiles</td>
                      <td className="border p-2">Referenced by many tables</td>
                    </tr>
                    <tr>
                      <td className="border p-2">events</td>
                      <td className="border p-2">Event details and metadata</td>
                      <td className="border p-2">created_by → users.id</td>
                    </tr>
                    <tr>
                      <td className="border p-2">podcasts</td>
                      <td className="border p-2">Podcast episodes</td>
                      <td className="border p-2">user_id → users.id</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="frontend" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Frontend Architecture</CardTitle>
              <CardDescription>
                Technical details about the frontend application
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <section>
                  <h3 className="text-lg font-medium">Tech Stack</h3>
                  <ul className="list-disc pl-5 mt-2">
                    <li>React 18 with Hooks</li>
                    <li>TypeScript for type safety</li>
                    <li>Tailwind CSS for styling</li>
                    <li>React Router for navigation</li>
                    <li>TanStack Query for data fetching and caching</li>
                    <li>Supabase for backend integration</li>
                  </ul>
                </section>
                
                <section>
                  <h3 className="text-lg font-medium">Component Structure</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Components are organized using a feature-based approach with shared UI components.
                  </p>
                  <pre className="mt-2 p-2 bg-muted rounded-md">
                    <code>
                      {`src/
  ├── components/       # Shared components
  ├── pages/           # Page components
  ├── hooks/           # Custom React hooks
  ├── contexts/        # React context providers
  ├── services/        # API and service functions
  ├── types/           # TypeScript type definitions
  └── utils/           # Utility functions`}
                    </code>
                  </pre>
                </section>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="deployment" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Deployment Guide</CardTitle>
              <CardDescription>
                Instructions for deploying the application
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <section>
                  <h3 className="text-lg font-medium">Environment Setup</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Required environment variables:
                  </p>
                  <pre className="mt-2 p-2 bg-muted rounded-md">
                    <code>
                      {`VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_BASE_URL=your_api_base_url`}
                    </code>
                  </pre>
                </section>
                
                <section>
                  <h3 className="text-lg font-medium">Build Process</h3>
                  <ol className="list-decimal pl-5 mt-2">
                    <li>Run <code>npm install</code> to install dependencies</li>
                    <li>Run <code>npm run build</code> to create production build</li>
                    <li>Deploy the contents of the <code>dist</code> folder</li>
                  </ol>
                </section>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TechnicalDocs;
