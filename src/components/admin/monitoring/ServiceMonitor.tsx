
import React, { useState, useEffect } from 'react';
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, XCircle, AlertTriangle, Clock } from "lucide-react";

interface ServiceStatus {
  name: string;
  status: 'operational' | 'degraded' | 'outage' | 'maintenance';
  uptime: number;
  lastIncident?: string;
  responseTime?: number;
}

const ServiceMonitor: React.FC = () => {
  const [services, setServices] = useState<ServiceStatus[]>([
    {
      name: 'Authentication',
      status: 'operational',
      uptime: 99.99,
      responseTime: 120
    },
    {
      name: 'Database',
      status: 'operational',
      uptime: 99.95,
      responseTime: 180
    },
    {
      name: 'Storage',
      status: 'operational',
      uptime: 99.98,
      responseTime: 150
    },
    {
      name: 'Functions',
      status: 'operational',
      uptime: 99.90,
      responseTime: 200
    },
    {
      name: 'Realtime Subscriptions',
      status: 'operational',
      uptime: 99.85,
      responseTime: 90
    }
  ]);

  const [loading, setLoading] = useState(false);

  const refreshStatus = () => {
    // In a real application, this would fetch real data
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'outage':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'maintenance':
        return <Clock className="h-5 w-5 text-blue-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'operational':
        return <Badge className="bg-green-500">Operational</Badge>;
      case 'degraded':
        return <Badge className="bg-yellow-500">Degraded</Badge>;
      case 'outage':
        return <Badge className="bg-red-500">Outage</Badge>;
      case 'maintenance':
        return <Badge className="bg-blue-500">Maintenance</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Service Monitoring</h1>
          <p className="text-muted-foreground">
            Monitor the status and performance of system services
          </p>
        </div>
        <button 
          onClick={refreshStatus}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh Status'}
        </button>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle>System Overview</CardTitle>
          <CardDescription>Current status of all services</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-muted/30 p-4 rounded-md text-center">
              <p className="text-sm text-muted-foreground">Uptime</p>
              <p className="text-2xl font-bold">99.95%</p>
            </div>
            <div className="bg-muted/30 p-4 rounded-md text-center">
              <p className="text-sm text-muted-foreground">Active Users</p>
              <p className="text-2xl font-bold">1,284</p>
            </div>
            <div className="bg-muted/30 p-4 rounded-md text-center">
              <p className="text-sm text-muted-foreground">CPU Usage</p>
              <p className="text-2xl font-bold">24%</p>
            </div>
            <div className="bg-muted/30 p-4 rounded-md text-center">
              <p className="text-sm text-muted-foreground">Memory</p>
              <p className="text-2xl font-bold">42%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="services">
        <TabsList className="mb-6">
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="services" className="space-y-6">
          {services.map((service) => (
            <Card key={service.name} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    {getStatusIcon(service.status)}
                    {service.name}
                  </CardTitle>
                  {getStatusBadge(service.status)}
                </div>
              </CardHeader>
              
              <CardContent className="pb-2">
                <div className="flex flex-col md:flex-row justify-between text-sm mb-2">
                  <div>
                    <span className="text-muted-foreground">Uptime: </span>
                    <span className="font-medium">{service.uptime}%</span>
                  </div>
                  {service.responseTime && (
                    <div>
                      <span className="text-muted-foreground">Response Time: </span>
                      <span className="font-medium">{service.responseTime} ms</span>
                    </div>
                  )}
                </div>
                <Progress value={service.uptime} className="h-2" />
              </CardContent>
              
              <CardFooter className="text-sm text-muted-foreground pt-2">
                {service.lastIncident ? (
                  <span>Last incident: {service.lastIncident}</span>
                ) : (
                  <span>No incidents in the last 30 days</span>
                )}
              </CardFooter>
            </Card>
          ))}
        </TabsContent>
        
        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>System resource utilization over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center border rounded-md">
                <p className="text-muted-foreground">Performance chart would render here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>System Logs</CardTitle>
              <CardDescription>Recent activity and error logs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-black text-green-400 p-4 rounded-md font-mono text-sm overflow-x-auto">
                <div className="whitespace-pre-wrap">
                  {`[2025-04-30 10:15:23] [INFO] Server started successfully
[2025-04-30 10:15:24] [INFO] Database connection established
[2025-04-30 10:15:25] [INFO] Cache service initialized
[2025-04-30 10:16:01] [INFO] User 8a7b6c5d authenticated successfully
[2025-04-30 10:16:05] [INFO] Media upload completed: podcast-123456.mp3
[2025-04-30 10:16:32] [WARN] High CPU usage detected: 78%
[2025-04-30 10:17:45] [INFO] Payment received: transaction_id=tx_98765
[2025-04-30 10:18:12] [ERROR] Failed to process webhook: timeout
[2025-04-30 10:19:01] [INFO] System resources normalized
[2025-04-30 10:20:15] [INFO] Scheduled backup completed successfully`}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ServiceMonitor;
