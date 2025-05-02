
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const TechnicalDocs: React.FC = () => {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="api">
        <TabsList>
          <TabsTrigger value="api">API Reference</TabsTrigger>
          <TabsTrigger value="database">Database Schema</TabsTrigger>
          <TabsTrigger value="deployment">Deployment Guide</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>
        
        <TabsContent value="api" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>REST API Documentation</CardTitle>
              <CardDescription>Complete reference for the application's RESTful API endpoints</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Authentication</h3>
                <p className="text-sm text-muted-foreground">
                  All API requests require authentication using JWT tokens. Include the token in the 
                  Authorization header as a Bearer token.
                </p>
                <pre className="bg-muted p-4 rounded-md overflow-x-auto">
                  <code>Authorization: Bearer YOUR_TOKEN_HERE</code>
                </pre>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">User Endpoints</h3>
                <div className="border rounded-md">
                  <div className="p-4 border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">GET</span>
                        <code>/api/users</code>
                      </div>
                      <span className="text-sm text-muted-foreground">Get all users</span>
                    </div>
                  </div>
                  <div className="p-4 border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">GET</span>
                        <code>/api/users/{'{id}'}</code>
                      </div>
                      <span className="text-sm text-muted-foreground">Get user by ID</span>
                    </div>
                  </div>
                  <div className="p-4 border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">POST</span>
                        <code>/api/users</code>
                      </div>
                      <span className="text-sm text-muted-foreground">Create user</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded">PUT</span>
                        <code>/api/users/{'{id}'}</code>
                      </div>
                      <span className="text-sm text-muted-foreground">Update user</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="database" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Database Schema</CardTitle>
              <CardDescription>Overview of the database structure and relationships</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                This application uses Supabase with PostgreSQL as the main database. The schema 
                consists of the following primary tables:
              </p>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Users Table</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-200 rounded-md">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Column</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        <tr>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">id</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">UUID</td>
                          <td className="px-4 py-2 text-sm">Primary key</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">email</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">TEXT</td>
                          <td className="px-4 py-2 text-sm">User's email address</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">display_name</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">TEXT</td>
                          <td className="px-4 py-2 text-sm">User's display name</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">created_at</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">TIMESTAMP</td>
                          <td className="px-4 py-2 text-sm">When the user was created</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Events Table</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-200 rounded-md">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Column</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        <tr>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">id</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">UUID</td>
                          <td className="px-4 py-2 text-sm">Primary key</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">title</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">TEXT</td>
                          <td className="px-4 py-2 text-sm">Event title</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">description</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">TEXT</td>
                          <td className="px-4 py-2 text-sm">Event description</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">created_by</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">UUID</td>
                          <td className="px-4 py-2 text-sm">Foreign key to users table</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="deployment" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Deployment Guide</CardTitle>
              <CardDescription>Instructions for deploying the application to production</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Prerequisites</h3>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>Node.js v18+ and npm</li>
                    <li>Supabase account</li>
                    <li>Vercel account (recommended)</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Deployment Steps</h3>
                  <ol className="list-decimal pl-5 space-y-2 text-sm">
                    <li className="space-y-1">
                      <p className="font-medium">Set up Supabase project</p>
                      <p className="text-muted-foreground">Create a new Supabase project and run the migrations</p>
                    </li>
                    <li className="space-y-1">
                      <p className="font-medium">Configure environment variables</p>
                      <p className="text-muted-foreground">Copy the .env.example file to .env and update the values</p>
                    </li>
                    <li className="space-y-1">
                      <p className="font-medium">Build the application</p>
                      <pre className="bg-muted p-2 rounded-md"><code>npm run build</code></pre>
                    </li>
                    <li className="space-y-1">
                      <p className="font-medium">Deploy to Vercel</p>
                      <p className="text-muted-foreground">Connect your GitHub repository to Vercel and deploy</p>
                    </li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="integrations" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Integrations</CardTitle>
              <CardDescription>Third-party services integrated with the application</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Authentication</h3>
                  <p className="text-sm text-muted-foreground">
                    Authentication is handled through Supabase Auth, which provides email/password,
                    magic link, and social login options.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Payment Processing</h3>
                  <p className="text-sm text-muted-foreground">
                    Payment processing is handled through Stripe. The integration allows for 
                    one-time payments, subscriptions, and marketplace transactions with 
                    connected accounts.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Real-time Communication</h3>
                  <p className="text-sm text-muted-foreground">
                    Real-time features such as chat and notifications are powered by Supabase 
                    Realtime, which uses PostgreSQL's LISTEN/NOTIFY functionality.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">File Storage</h3>
                  <p className="text-sm text-muted-foreground">
                    Files are stored in Supabase Storage, which provides a secure and scalable 
                    solution for user uploads.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TechnicalDocs;
