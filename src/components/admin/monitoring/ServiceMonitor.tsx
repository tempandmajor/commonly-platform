
import React from 'react';
import { Activity, Database, Server, Cloud, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ServiceMonitor: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MonitoringCard 
          title="API Server"
          status="operational"
          icon={<Server />}
          metric="99.9%"
          description="Uptime in last 30 days"
        />
        <MonitoringCard 
          title="Database"
          status="operational"
          icon={<Database />}
          metric="127ms"
          description="Avg. response time"
        />
        <MonitoringCard 
          title="Storage"
          status="operational"
          icon={<Cloud />}
          metric="3.2TB"
          description="Current usage"
        />
        <MonitoringCard 
          title="Background Jobs"
          status="issues"
          icon={<Activity />}
          metric="98.5%"
          description="Success rate"
        />
      </div>
      
      <ServiceMetricsChart />
      
      <RecentIncidents />
    </div>
  );
};

interface MonitoringCardProps {
  title: string;
  status: 'operational' | 'issues' | 'down';
  icon: React.ReactNode;
  metric: string;
  description: string;
}

const MonitoringCard: React.FC<MonitoringCardProps> = ({ title, status, icon, metric, description }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="flex items-center">
          {status === 'operational' ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : status === 'issues' ? (
            <AlertCircle className="h-4 w-4 text-amber-500" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-500" />
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{metric}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
};

const ServiceMetricsChart = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>System Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] flex items-center justify-center">
          <p className="text-muted-foreground">Interactive chart will be displayed here</p>
        </div>
      </CardContent>
    </Card>
  );
};

const RecentIncidents = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Incidents</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="border-l-4 border-amber-500 pl-4">
            <h3 className="font-medium">Background Job Processing Delays</h3>
            <p className="text-sm text-muted-foreground">May 1, 2025 - Some jobs are taking longer than expected to process.</p>
          </div>
          <div className="border-l-4 border-green-500 pl-4">
            <h3 className="font-medium">Database Maintenance Completed</h3>
            <p className="text-sm text-muted-foreground">April 28, 2025 - Scheduled maintenance completed successfully.</p>
          </div>
          <div className="border-l-4 border-green-500 pl-4">
            <h3 className="font-medium">API Rate Limiting Issues Resolved</h3>
            <p className="text-sm text-muted-foreground">April 25, 2025 - Fixed configuration issues causing false rate limit errors.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceMonitor;
