
import React from 'react';

const TechnicalDocs: React.FC = () => {
  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">Technical Documentation</h1>
      
      <nav className="mb-8">
        <ul className="flex space-x-4 border-b">
          <li className="pb-2 border-b-2 border-primary font-medium">Overview</li>
          <li className="pb-2 text-gray-500">API</li>
          <li className="pb-2 text-gray-500">Database</li>
          <li className="pb-2 text-gray-500">Authentication</li>
        </ul>
      </nav>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">System Architecture</h2>
        <p className="text-gray-700 mb-4">
          Our application is built using React for the frontend and Supabase for backend services including 
          database, authentication, storage, and serverless functions.
        </p>
        <div className="p-4 bg-gray-100 rounded-lg">
          <pre className="text-sm overflow-auto">
            {`
Frontend (React)
  ↓ ↑
API Layer (Supabase Client)
  ↓ ↑
Backend Services:
  - PostgreSQL Database
  - Auth Service
  - Storage Service
  - Serverless Functions
            `}
          </pre>
        </div>
      </section>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Key Technologies</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Frontend:</strong> React, TypeScript, TailwindCSS</li>
          <li><strong>Backend:</strong> Supabase (PostgreSQL, Auth, Storage, Edge Functions)</li>
          <li><strong>State Management:</strong> React Context, TanStack Query</li>
          <li><strong>UI Components:</strong> Shadcn UI</li>
        </ul>
      </section>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Development Workflow</h2>
        <ol className="list-decimal pl-5 space-y-2">
          <li>Create feature branch from main</li>
          <li>Implement and test locally</li>
          <li>Submit PR for review</li>
          <li>Deploy to staging for testing</li>
          <li>Merge to main and deploy to production</li>
        </ol>
      </section>
    </div>
  );
};

export default TechnicalDocs;
