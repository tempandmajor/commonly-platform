
import React from 'react';

const TechnicalDocs: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Technical Documentation</h1>
        <p className="text-muted-foreground mt-2">
          System architecture and API documentation for developers and administrators.
        </p>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-medium mb-4">API Reference</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Comprehensive documentation for all backend APIs and endpoints.
        </p>
        <div className="border rounded-md p-4 bg-gray-50">
          <pre className="text-xs overflow-x-auto">
            <code>
              {`
GET /api/users - List all users
GET /api/users/:id - Get user details
POST /api/users - Create a new user
PUT /api/users/:id - Update user details
DELETE /api/users/:id - Delete user

GET /api/podcasts - List all podcasts
GET /api/podcasts/:id - Get podcast details
POST /api/podcasts - Create a new podcast
PUT /api/podcasts/:id - Update podcast details
DELETE /api/podcasts/:id - Delete podcast
              `}
            </code>
          </pre>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-medium mb-4">Database Schema</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Database tables, relationships, and structure.
        </p>
        <div className="border rounded-md p-4">
          <ul className="space-y-2 text-sm">
            <li><strong>users</strong> - User accounts and profiles</li>
            <li><strong>podcasts</strong> - Podcast episodes and metadata</li>
            <li><strong>podcast_categories</strong> - Categorization for podcasts</li>
            <li><strong>podcast_comments</strong> - User comments on podcasts</li>
            <li><strong>events</strong> - Live and scheduled events</li>
            <li><strong>venues</strong> - Physical locations for events</li>
            <li><strong>merchant_stores</strong> - User-created stores</li>
            <li><strong>products</strong> - Items sold in merchant stores</li>
            <li><strong>transactions</strong> - Financial transaction records</li>
          </ul>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-medium mb-4">Integration Guide</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Information on integrating with third-party services.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border rounded-md p-4">
            <h3 className="font-medium mb-2">Authentication</h3>
            <p className="text-sm text-muted-foreground">
              Supabase Auth for user management and JWT-based authentication.
            </p>
          </div>
          <div className="border rounded-md p-4">
            <h3 className="font-medium mb-2">Storage</h3>
            <p className="text-sm text-muted-foreground">
              Supabase Storage for media files and user uploads.
            </p>
          </div>
          <div className="border rounded-md p-4">
            <h3 className="font-medium mb-2">Payments</h3>
            <p className="text-sm text-muted-foreground">
              Stripe integration for processing payments and subscriptions.
            </p>
          </div>
          <div className="border rounded-md p-4">
            <h3 className="font-medium mb-2">Media Streaming</h3>
            <p className="text-sm text-muted-foreground">
              Agora for live video streaming and real-time communications.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechnicalDocs;
