import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Eye, Database, Server, Lock, ShieldCheck, GitMerge, ArrowRightLeft } from "lucide-react";

const TechnicalDocs = () => {
  const [activeTab, setActiveTab] = useState("architecture");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Technical Documentation</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="architecture">Architecture</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="api">API Reference</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="architecture">
          <Card>
            <CardHeader>
              <CardTitle>System Architecture</CardTitle>
              <CardDescription>Overview of the application's architecture and components</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <section>
                <h3 className="text-lg font-medium mb-3">Architecture Overview</h3>
                <div className="border rounded-lg p-4">
                  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg text-center font-mono text-sm mb-4">
                    React SPA Frontend ↔ Supabase Backend
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    The application follows a modern architecture leveraging Supabase for backend services with 
                    a React single-page application frontend. This setup provides a responsive, realtime 
                    experience with minimal backend maintenance.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="border rounded-lg p-3">
                      <h4 className="font-medium mb-2">Frontend</h4>
                      <p className="text-sm text-muted-foreground">
                        Built with React, TypeScript, and shadcn/ui components.
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        <Badge variant="secondary">React</Badge>
                        <Badge variant="secondary">TypeScript</Badge>
                        <Badge variant="secondary">shadcn/ui</Badge>
                        <Badge variant="secondary">Tailwind CSS</Badge>
                      </div>
                    </div>
                    <div className="border rounded-lg p-3">
                      <h4 className="font-medium mb-2">Backend</h4>
                      <p className="text-sm text-muted-foreground">
                        Powered by Supabase services including authentication, database, storage, and edge functions.
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        <Badge variant="secondary">Supabase</Badge>
                        <Badge variant="secondary">PostgreSQL</Badge>
                        <Badge variant="secondary">Edge Functions</Badge>
                        <Badge variant="secondary">Storage</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-medium mb-3">Key Components</h3>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="authentication">
                    <AccordionTrigger className="text-base">
                      Authentication System
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-sm text-muted-foreground mb-2">
                        User authentication is handled by Supabase Auth with JWT-based session management.
                      </p>
                      <ul className="list-disc pl-5 text-sm text-muted-foreground">
                        <li>Email/password authentication</li>
                        <li>JWT token management</li>
                        <li>Role-based access control</li>
                        <li>Admin-specific authorization</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="database">
                    <AccordionTrigger className="text-base">
                      Database Structure
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-sm text-muted-foreground mb-2">
                        PostgreSQL database with Row Level Security (RLS) policies for data protection.
                      </p>
                      <ul className="list-disc pl-5 text-sm text-muted-foreground">
                        <li>User data and profiles</li>
                        <li>Content management</li>
                        <li>Podcasts and media</li>
                        <li>Events and venues</li>
                        <li>E-commerce transactions</li>
                        <li>Notification system</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="apis">
                    <AccordionTrigger className="text-base">
                      API Services
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-sm text-muted-foreground mb-2">
                        A combination of direct database access via Supabase client and custom edge functions.
                      </p>
                      <ul className="list-disc pl-5 text-sm text-muted-foreground">
                        <li>RESTful database operations</li>
                        <li>Real-time subscription APIs</li>
                        <li>Custom serverless edge functions</li>
                        <li>Third-party service integrations</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="realtime">
                    <AccordionTrigger className="text-base">
                      Real-time Features
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-sm text-muted-foreground mb-2">
                        Supabase Realtime enables live updates across the application.
                      </p>
                      <ul className="list-disc pl-5 text-sm text-muted-foreground">
                        <li>Chat messaging</li>
                        <li>Notifications</li>
                        <li>Live podcast streaming</li>
                        <li>User presence indicators</li>
                        <li>Collaborative features</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </section>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database">
          <Card>
            <CardHeader>
              <CardTitle>Database Documentation</CardTitle>
              <CardDescription>Database schema, relationships, and optimizations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center">
                <Database className="h-5 w-5 mr-2" />
                <h3 className="text-lg font-medium">Schema Documentation</h3>
              </div>
              
              <div className="space-y-4">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="user-tables">
                    <AccordionTrigger>
                      User & Authentication Tables
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        <div className="border rounded p-3">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium">users</h4>
                            <Badge>Core Table</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">
                            Extended user profile information linked to auth.users
                          </p>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div className="font-medium">id <span className="text-blue-500">UUID</span></div>
                            <div className="col-span-2">Primary key, references auth.users</div>
                            
                            <div className="font-medium">display_name <span className="text-blue-500">TEXT</span></div>
                            <div className="col-span-2">User's display name</div>
                            
                            <div className="font-medium">email <span className="text-blue-500">TEXT</span></div>
                            <div className="col-span-2">User's email address</div>
                            
                            <div className="font-medium">photo_url <span className="text-blue-500">TEXT</span></div>
                            <div className="col-span-2">Profile photo URL</div>
                            
                            <div className="font-medium">created_at <span className="text-blue-500">TIMESTAMP</span></div>
                            <div className="col-span-2">Creation timestamp</div>
                            
                            <div className="font-medium">is_admin <span className="text-blue-500">BOOLEAN</span></div>
                            <div className="col-span-2">Admin status flag</div>
                          </div>
                        </div>
                        
                        <div className="border rounded p-3">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium">wallets</h4>
                            <Badge>Related Table</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">
                            User wallet information for virtual credits and balance
                          </p>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div className="font-medium">user_id <span className="text-blue-500">UUID</span></div>
                            <div className="col-span-2">Primary key, references users.id</div>
                            
                            <div className="font-medium">platform_credits <span className="text-blue-500">NUMERIC</span></div>
                            <div className="col-span-2">Available platform credits</div>
                            
                            <div className="font-medium">available_balance <span className="text-blue-500">NUMERIC</span></div>
                            <div className="col-span-2">Available balance for payouts</div>
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="content-tables">
                    <AccordionTrigger>
                      Content & Media Tables
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        <div className="border rounded p-3">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium">podcasts</h4>
                            <Badge>Core Table</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">
                            Podcast content and metadata
                          </p>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div className="font-medium">id <span className="text-blue-500">UUID</span></div>
                            <div className="col-span-2">Primary key</div>
                            
                            <div className="font-medium">title <span className="text-blue-500">TEXT</span></div>
                            <div className="col-span-2">Podcast title</div>
                            
                            <div className="font-medium">description <span className="text-blue-500">TEXT</span></div>
                            <div className="col-span-2">Podcast description</div>
                            
                            <div className="font-medium">audio_url <span className="text-blue-500">TEXT</span></div>
                            <div className="col-span-2">URL to audio file</div>
                            
                            <div className="font-medium">user_id <span className="text-blue-500">UUID</span></div>
                            <div className="col-span-2">Creator reference to users.id</div>
                            
                            <div className="font-medium">created_at <span className="text-blue-500">TIMESTAMP</span></div>
                            <div className="col-span-2">Creation timestamp</div>
                          </div>
                        </div>
                        
                        <div className="border rounded p-3">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium">podcast_categories</h4>
                            <Badge>Lookup Table</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">
                            Categories for organizing podcasts
                          </p>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div className="font-medium">id <span className="text-blue-500">UUID</span></div>
                            <div className="col-span-2">Primary key</div>
                            
                            <div className="font-medium">name <span className="text-blue-500">TEXT</span></div>
                            <div className="col-span-2">Category name</div>
                            
                            <div className="font-medium">description <span className="text-blue-500">TEXT</span></div>
                            <div className="col-span-2">Category description</div>
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="event-tables">
                    <AccordionTrigger>
                      Events & Venues Tables
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        <div className="border rounded p-3">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium">events</h4>
                            <Badge>Core Table</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">
                            Event information and details
                          </p>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div className="font-medium">id <span className="text-blue-500">UUID</span></div>
                            <div className="col-span-2">Primary key</div>
                            
                            <div className="font-medium">title <span className="text-blue-500">TEXT</span></div>
                            <div className="col-span-2">Event title</div>
                            
                            <div className="font-medium">description <span className="text-blue-500">TEXT</span></div>
                            <div className="col-span-2">Event description</div>
                            
                            <div className="font-medium">date <span className="text-blue-500">TIMESTAMP</span></div>
                            <div className="col-span-2">Event date and time</div>
                            
                            <div className="font-medium">location <span className="text-blue-500">TEXT</span></div>
                            <div className="col-span-2">Event location description</div>
                            
                            <div className="font-medium">created_by <span className="text-blue-500">UUID</span></div>
                            <div className="col-span-2">Creator reference to users.id</div>
                          </div>
                        </div>
                        
                        <div className="border rounded p-3">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium">venues</h4>
                            <Badge>Related Table</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">
                            Venue information for events
                          </p>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div className="font-medium">id <span className="text-blue-500">UUID</span></div>
                            <div className="col-span-2">Primary key</div>
                            
                            <div className="font-medium">name <span className="text-blue-500">TEXT</span></div>
                            <div className="col-span-2">Venue name</div>
                            
                            <div className="font-medium">address <span className="text-blue-500">TEXT</span></div>
                            <div className="col-span-2">Venue address</div>
                            
                            <div className="font-medium">capacity <span className="text-blue-500">INTEGER</span></div>
                            <div className="col-span-2">Venue capacity</div>
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="commerce-tables">
                    <AccordionTrigger>
                      E-commerce Tables
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        <div className="border rounded p-3">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium">orders</h4>
                            <Badge>Core Table</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">
                            Order information and state
                          </p>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div className="font-medium">id <span className="text-blue-500">UUID</span></div>
                            <div className="col-span-2">Primary key</div>
                            
                            <div className="font-medium">user_id <span className="text-blue-500">UUID</span></div>
                            <div className="col-span-2">Customer reference to users.id</div>
                            
                            <div className="font-medium">merchant_id <span className="text-blue-500">UUID</span></div>
                            <div className="col-span-2">Merchant reference to users.id</div>
                            
                            <div className="font-medium">items <span className="text-blue-500">JSONB</span></div>
                            <div className="col-span-2">Order items data</div>
                            
                            <div className="font-medium">total_amount <span className="text-blue-500">NUMERIC</span></div>
                            <div className="col-span-2">Order total amount</div>
                            
                            <div className="font-medium">status <span className="text-blue-500">TEXT</span></div>
                            <div className="col-span-2">Order status</div>
                          </div>
                        </div>
                        
                        <div className="border rounded p-3">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium">products</h4>
                            <Badge>Related Table</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">
                            Product catalog information
                          </p>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div className="font-medium">id <span className="text-blue-500">UUID</span></div>
                            <div className="col-span-2">Primary key</div>
                            
                            <div className="font-medium">name <span className="text-blue-500">TEXT</span></div>
                            <div className="col-span-2">Product name</div>
                            
                            <div className="font-medium">price <span className="text-blue-500">NUMERIC</span></div>
                            <div className="col-span-2">Product price</div>
                            
                            <div className="font-medium">merchant_id <span className="text-blue-500">UUID</span></div>
                            <div className="col-span-2">Merchant reference to users.id</div>
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
              
              <div className="space-y-4 mt-6">
                <div className="flex items-center">
                  <Server className="h-5 w-5 mr-2" />
                  <h3 className="text-lg font-medium">Database Optimizations</h3>
                </div>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Indexes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm space-y-2">
                      <p className="text-muted-foreground">
                        The following indexes have been created to optimize query performance:
                      </p>
                      
                      <div className="font-mono text-xs bg-gray-50 dark:bg-gray-900 p-2 rounded-md overflow-auto">
                        <pre>{`-- Podcasts table indexes
CREATE INDEX idx_podcasts_published ON podcasts (published);
CREATE INDEX idx_podcasts_user_id ON podcasts (user_id);
CREATE INDEX idx_podcasts_category_id ON podcasts (category_id);
CREATE INDEX idx_podcasts_created_at ON podcasts (created_at);

-- Comments table index
CREATE INDEX idx_podcast_comments_podcast_id ON podcast_comments (podcast_id);

-- Notifications index
CREATE INDEX idx_notifications_user_id ON notifications (user_id);
CREATE INDEX idx_notifications_read ON notifications (user_id, read);

-- Orders table indexes
CREATE INDEX idx_orders_merchant_id ON orders (merchant_id);
CREATE INDEX idx_orders_user_id ON orders (user_id);
CREATE INDEX idx_orders_status ON orders (status);

-- Events geo index
CREATE INDEX idx_events_geo_location ON events USING GIST (geo_location);
CREATE INDEX idx_events_published ON events (published);

-- User follows indexes
CREATE INDEX idx_user_follows_follower_id ON user_follows (follower_id);
CREATE INDEX idx_user_follows_following_id ON user_follows (following_id);`}</pre>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Performance Considerations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm space-y-2">
                      <li className="flex items-start">
                        <span className="font-medium mr-2">•</span>
                        <span>
                          <span className="font-medium">Query Pagination:</span> All list queries implement 
                          cursor-based pagination to limit result sets and improve performance.
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="font-medium mr-2">•</span>
                        <span>
                          <span className="font-medium">Denormalized Data:</span> Frequently accessed data 
                          is denormalized where appropriate to reduce joins.
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="font-medium mr-2">•</span>
                        <span>
                          <span className="font-medium">JSONB for Flexible Data:</span> JSONB columns are used 
                          for schema flexibility while maintaining query performance.
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="font-medium mr-2">•</span>
                        <span>
                          <span className="font-medium">Materialized Views:</span> Heavy analytical queries 
                          leverage materialized views that refresh periodically.
                        </span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api">
          <Card>
            <CardHeader>
              <CardTitle>API Reference</CardTitle>
              <CardDescription>Edge functions and service endpoints</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center">
                <ArrowRightLeft className="h-5 w-5 mr-2" />
                <h3 className="text-lg font-medium">Edge Functions</h3>
              </div>
              
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">send-notification</CardTitle>
                      <Badge>Protected</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm space-y-2">
                      <p className="text-muted-foreground mb-2">
                        Sends notifications to users through various channels (in-app, email, etc.)
                      </p>
                      
                      <div className="font-medium">Endpoint</div>
                      <div className="font-mono text-xs bg-gray-50 dark:bg-gray-900 p-2 rounded-md mb-2">
                        POST /functions/v1/send-notification
                      </div>
                      
                      <div className="font-medium">Request Body</div>
                      <div className="font-mono text-xs bg-gray-50 dark:bg-gray-900 p-2 rounded-md mb-2">
                        <pre>{`{
  "userId": "string",
  "title": "string",
  "body": "string",
  "type": "system|message|event",
  "imageUrl": "string?",
  "actionUrl": "string?",
  "data": "object?"
}`}</pre>
                      </div>
                      
                      <div className="font-medium">Response</div>
                      <div className="font-mono text-xs bg-gray-50 dark:bg-gray-900 p-2 rounded-md">
                        <pre>{`{
  "id": "string",
  "success": true
}`}</pre>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">chat-server</CardTitle>
                      <Badge>Protected</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm space-y-2">
                      <p className="text-muted-foreground mb-2">
                        Handles chat operations beyond basic CRUD, like typing indicators and presence
                      </p>
                      
                      <div className="font-medium">Endpoint</div>
                      <div className="font-mono text-xs bg-gray-50 dark:bg-gray-900 p-2 rounded-md mb-2">
                        POST /functions/v1/chat-server
                      </div>
                      
                      <div className="font-medium">Request Body</div>
                      <div className="font-mono text-xs bg-gray-50 dark:bg-gray-900 p-2 rounded-md mb-2">
                        <pre>{`{
  "action": "typing|read|presence",
  "chatId": "string",
  "data": "object"
}`}</pre>
                      </div>
                      
                      <div className="font-medium">Response</div>
                      <div className="font-mono text-xs bg-gray-50 dark:bg-gray-900 p-2 rounded-md">
                        <pre>{`{
  "success": true,
  "data": "object?"
}`}</pre>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">health-check</CardTitle>
                      <Badge>Protected</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm space-y-2">
                      <p className="text-muted-foreground mb-2">
                        Verifies the health of Supabase services and functions
                      </p>
                      
                      <div className="font-medium">Endpoint</div>
                      <div className="font-mono text-xs bg-gray-50 dark:bg-gray-900 p-2 rounded-md mb-2">
                        POST /functions/v1/health-check
                      </div>
                      
                      <div className="font-medium">Request Body</div>
                      <div className="font-mono text-xs bg-gray-50 dark:bg-gray-900 p-2 rounded-md mb-2">
                        <pre>{`{
  "timestamp": "string"
}`}</pre>
                      </div>
                      
                      <div className="font-medium">Response</div>
                      <div className="font-mono text-xs bg-gray-50 dark:bg-gray-900 p-2 rounded-md">
                        <pre>{`{
  "status": "healthy|error",
  "timestamp": "string",
  "checks": {
    "database": "healthy|error",
    "auth": "healthy|error",
    "storage": "healthy|error"
  }
}`}</pre>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">migration-status</CardTitle>
                      <Badge>Protected</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm space-y-2">
                      <p className="text-muted-foreground mb-2">
                        Reports on the status of the migration from Firebase to Supabase
                      </p>
                      
                      <div className="font-medium">Endpoint</div>
                      <div className="font-mono text-xs bg-gray-50 dark:bg-gray-900 p-2 rounded-md mb-2">
                        POST /functions/v1/migration-status
                      </div>
                      
                      <div className="font-medium">Response</div>
                      <div className="font-mono text-xs bg-gray-50 dark:bg-gray-900 p-2 rounded-md">
                        <pre>{`{
  "users": {
    "status": "pending|in_progress|completed",
    "count": 0
  },
  "messages": {
    "status": "pending|in_progress|completed",
    "count": 0
  },
  "podcasts": {
    "status": "pending|in_progress|completed",
    "count": 0
  }
  // Other migration statuses
}`}</pre>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">trigger-backup</CardTitle>
                      <Badge>Protected</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm space-y-2">
                      <p className="text-muted-foreground mb-2">
                        Initiates a database backup operation
                      </p>
                      
                      <div className="font-medium">Endpoint</div>
                      <div className="font-mono text-xs bg-gray-50 dark:bg-gray-900 p-2 rounded-md mb-2">
                        POST /functions/v1/trigger-backup
                      </div>
                      
                      <div className="font-medium">Request Body</div>
                      <div className="font-mono text-xs bg-gray-50 dark:bg-gray-900 p-2 rounded-md mb-2">
                        <pre>{`{
  "backupType": "manual|scheduled",
  "triggeredBy": "string"
}`}</pre>
                      </div>
                      
                      <div className="font-medium">Response</div>
                      <div className="font-mono text-xs bg-gray-50 dark:bg-gray-900 p-2 rounded-md">
                        <pre>{`{
  "success": true,
  "message": "string",
  "backupId": "string"
}`}</pre>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Documentation</CardTitle>
              <CardDescription>Security measures and best practices</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center">
                <Lock className="h-5 w-5 mr-2" />
                <h3 className="text-lg font-medium">Authentication & Authorization</h3>
              </div>
              
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Authentication Flow</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      The application uses Supabase Authentication with JWT tokens for session management.
                    </p>
                    
                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg text-center font-mono text-xs mb-4">
                      Login Request → JWT Token Generation → Client Storage → Authenticated Requests
                    </div>
                    
                    <ul className="text-sm space-y-2">
                      <li className="flex items-start">
                        <span className="font-medium mr-2">1.</span>
                        <span>
                          <span className="font-medium">User Login:</span> Email/password credentials 
                          are securely transmitted to Supabase Auth.
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="font-medium mr-2">2.</span>
                        <span>
                          <span className="font-medium">JWT Generation:</span> Upon successful authentication,
                          a JWT token is generated with user claims.
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="font-medium mr-2">3.</span>
                        <span>
                          <span className="font-medium">Token Storage:</span> JWT is stored in local storage
                          and included in the Authorization header for API requests.
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="font-medium mr-2">4.</span>
                        <span>
                          <span className="font-medium">Session Management:</span> Tokens expire after 
                          a set period and can be refreshed using refresh tokens.
                        </span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Row Level Security Policies</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      PostgreSQL Row Level Security (RLS) policies control data access at the database level.
                    </p>
                    
                    <div className="space-y-3">
                      <div className="border rounded-lg p-3">
                        <div className="flex items-center mb-2">
                          <ShieldCheck className="h-4 w-4 mr-2 text-green-500" />
                          <h4 className="font-medium">User Data Protection</h4>
                        </div>
                        <div className="font-mono text-xs bg-gray-50 dark:bg-gray-900 p-2 rounded-md">
                          <pre>{`-- Users can only view their own private data
CREATE POLICY "Users can view own data" 
  ON users
  FOR SELECT 
  USING (auth.uid() = id);

-- Users can only update their own data
CREATE POLICY "Users can update own data" 
  ON users
  FOR UPDATE 
  USING (auth.uid() = id);`}</pre>
                        </div>
                      </div>
                      
                      <div className="border rounded-lg p-3">
                        <div className="flex items-center mb-2">
                          <ShieldCheck className="h-4 w-4 mr-2 text-green-500" />
                          <h4 className="font-medium">Content Access Control</h4>
                        </div>
                        <div className="font-mono text-xs bg-gray-50 dark:bg-gray-900 p-2 rounded-md">
                          <pre>{`-- Anyone can view published podcasts
CREATE POLICY "Public can view published podcasts" 
  ON podcasts
  FOR SELECT 
  USING (published = true);

-- Creators can view their own unpublished podcasts
CREATE POLICY "Creators view own podcasts" 
  ON podcasts
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Creators can update their own podcasts
CREATE POLICY "Creators update own podcasts" 
  ON podcasts
  FOR UPDATE 
  USING (auth.uid() = user_id);`}</pre>
                        </div>
                      </div>
                      
                      <div className="border rounded-lg p-3">
                        <div className="flex items-center mb-2">
                          <ShieldCheck className="h-4 w-4 mr-2 text-green-500" />
                          <h4 className="font-medium">E-commerce Security</h4>
                        </div>
                        <div className="font-mono text-xs bg-gray-50 dark:bg-gray-900 p-2 rounded-md">
                          <pre>{`-- Merchants can view their own orders
CREATE POLICY "Merchants view own orders" 
  ON orders
  FOR SELECT 
  USING (merchant_id = auth.uid());

-- Users can view their own orders
CREATE POLICY "Users view own orders" 
  ON orders
  FOR SELECT 
  USING (user_id = auth.uid());

-- Only authenticated users can create orders
CREATE POLICY "Users create orders" 
  ON orders
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);`}</pre>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="mt-6">
                <div className="flex items-center">
                  <Eye className="h-5 w-5 mr-2" />
                  <h3 className="text-lg font-medium">Security Best Practices</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Data Protection</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="text-sm space-y-2">
                        <li className="flex items-start">
                          <span className="font-medium mr-2">•</span>
                          <span>
                            <span className="font-medium">Sensitive Data Handling:</span> PII and 
                            sensitive information is stored securely with appropriate access controls.
                          </span>
                        </li>
                        <li className="flex items-start">
                          <span className="font-medium mr-2">•</span>
                          <span>
                            <span className="font-medium">Data Encryption:</span> Data is encrypted
                            at rest and in transit using industry-standard protocols.
                          </span>
                        </li>
                        <li className="flex items-start">
                          <span className="font-medium mr-2">•</span>
                          <span>
                            <span className="font-medium">Regular Backups:</span> Automated backups
                            ensure data resilience and disaster recovery capabilities.
                          </span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">API Security</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="text-sm space-y-2">
                        <li className="flex items-start">
                          <span className="font-medium mr-2">•</span>
                          <span>
                            <span className="font-medium">JWT Verification:</span> All edge functions
                            verify JWT tokens before processing requests.
                          </span>
                        </li>
                        <li className="flex items-start">
                          <span className="font-medium mr-2">•</span>
                          <span>
                            <span className="font-medium">Rate Limiting:</span> API endpoints are
                            protected against abuse with appropriate rate limiting.
                          </span>
                        </li>
                        <li className="flex items-start">
                          <span className="font-medium mr-2">•</span>
                          <span>
                            <span className="font-medium">Input Validation:</span> All user inputs
                            are validated and sanitized to prevent injection attacks.
                          </span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Frontend Security</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="text-sm space-y-2">
                        <li className="flex items-start">
                          <span className="font-medium mr-2">•</span>
                          <span>
                            <span className="font-medium">XSS Prevention:</span> React's architecture
                            and content sanitization protect against cross-site scripting.
                          </span>
                        </li>
                        <li className="flex items-start">
                          <span className="font-medium mr-2">•</span>
                          <span>
                            <span className="font-medium">CSRF Protection:</span> Tokens are included
                            in requests to prevent cross-site request forgery.
                          </span>
                        </li>
                        <li className="flex items-start">
                          <span className="font-medium mr-2">•</span>
                          <span>
                            <span className="font-medium">Secure Dependencies:</span> Regular security
                            audits of npm dependencies prevent vulnerability exploits.
                          </span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Administrative Controls</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="text-sm space-y-2">
                        <li className="flex items-start">
                          <span className="font-medium mr-2">•</span>
                          <span>
                            <span className="font-medium">Role-based Access:</span> Admin interfaces
                            have strict permissions based on user roles.
                          </span>
                        </li>
                        <li className="flex items-start">
                          <span className="font-medium mr-2">•</span>
                          <span>
                            <span className="font-medium">Audit Logging:</span> All administrative
                            actions are logged for security review and compliance.
                          </span>
                        </li>
                        <li className="flex items-start">
                          <span className="font-medium mr-2">•</span>
                          <span>
                            <span className="font-medium">Two-Factor Authentication:</span> Administrative
                            accounts require additional verification.
                          </span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
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
