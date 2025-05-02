
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, AlertTriangle, XCircle, RefreshCw, Database, Server, Cloud } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ServiceStatus {
  name: string;
  status: 'healthy' | 'warning' | 'error';
  latency: number;
  uptime: number;
  lastChecked: Date;
  message?: string;
}

const ServiceMonitor: React.FC = () => {
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock function to check service status
  const checkServices = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // In a real implementation, this would make API calls to various health check endpoints
      // For demo purposes, we'll simulate API responses
      
      // Mock database check with Supabase
      let dbStatus: 'healthy' | 'warning' | 'error' = 'error';
      let dbLatency = 0;
      
      try {
        const startTime = performance.now();
        // Try a simple query to check database connectivity
        const { data, error } = await supabase
          .from('users')
          .select('count(*)', { count: 'exact', head: true });
        
        dbLatency = performance.now() - startTime;
        
        if (error) {
          dbStatus = 'error';
        } else {
          dbStatus = dbLatency > 500 ? 'warning' : 'healthy';
        }
      } catch (e) {
        dbStatus = 'error';
      }
      
      // Generate mock data for services
      const mockServices: ServiceStatus[] = [
        {
          name: 'Database',
          status: dbStatus,
          latency: dbLatency,
          uptime: 99.95,
          lastChecked: new Date(),
          message: dbStatus === 'error' ? 'Connection failed' : undefined
        },
        {
          name: 'API Server',
          status: Math.random() > 0.1 ? 'healthy' : 'warning',
          latency: 120 + Math.random() * 200,
          uptime: 99.7,
          lastChecked: new Date()
        },
        {
          name: 'Authentication Service',
          status: Math.random() > 0.05 ? 'healthy' : 'error',
          latency: 80 + Math.random() * 100,
          uptime: 99.99,
          lastChecked: new Date()
        },
        {
          name: 'Storage Service',
          status: Math.random() > 0.2 ? 'healthy' : 'warning',
          latency: 200 + Math.random() * 300,
          uptime: 99.5,
          lastChecked: new Date()
        },
        {
          name: 'Search Engine',
          status: Math.random() > 0.15 ? 'healthy' : Math.random() > 0.5 ? 'warning' : 'error',
          latency: 150 + Math.random() * 250,
          uptime: 98.9,
          lastChecked: new Date(),
          message: Math.random() > 0.7 ? 'High CPU utilization' : undefined
        }
      ];
      
      setServices(mockServices);
    } catch (err) {
      setError('Failed to fetch service status');
      console.error('Error checking services:', err);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    checkServices();
    
    // Set up polling every 30 seconds
    const intervalId = setInterval(checkServices, 30000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  const getStatusIcon = (status: 'healthy' | 'warning' | 'error') => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };
  
  const getStatusBadge = (status: 'healthy' | 'warning' | 'error') => {
    switch (status) {
      case 'healthy':
        return <Badge className="bg-green-500">Healthy</Badge>;
      case 'warning':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-500">Warning</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
    }
  };
  
  const getServiceIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case 'database':
        return <Database className="h-5 w-5" />;
      case 'api server':
        return <Server className="h-5 w-5" />;
      case 'storage service':
        return <Cloud className="h-5 w-5" />;
      default:
        return <Server className="h-5 w-5" />;
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">System Monitoring</h1>
          <p className="text-muted-foreground">
            Monitor the health and performance of system services
          </p>
        </div>
        <Button onClick={checkServices} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {services.map(service => (
          <Card key={service.name} className={
            service.status === 'error' 
              ? 'border-red-500/50' 
              : service.status === 'warning' 
                ? 'border-yellow-500/50' 
                : ''
          }>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="flex items-center space-x-2">
                {getServiceIcon(service.name)}
                <CardTitle className="text-lg">{service.name}</CardTitle>
              </div>
              {getStatusBadge(service.status)}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status:</span>
                <div className="flex items-center">
                  {getStatusIcon(service.status)}
                  <span className="ml-1">
                    {service.status === 'healthy' ? 'Operational' : service.status === 'warning' ? 'Degraded' : 'Down'}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Latency:</span>
                <span>{service.latency.toFixed(0)}ms</span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Uptime:</span>
                  <span>{service.uptime.toFixed(2)}%</span>
                </div>
                <Progress value={service.uptime} className="h-2" />
              </div>
              
              {service.message && (
                <div className="bg-muted p-2 rounded text-sm mt-2">
                  {service.message}
                </div>
              )}
              
              <div className="text-xs text-muted-foreground">
                Last checked: {service.lastChecked.toLocaleTimeString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ServiceMonitor;
