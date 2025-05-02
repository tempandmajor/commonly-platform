
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, AlertCircle, AlertTriangle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface ServiceStatus {
  name: string;
  status: 'healthy' | 'warning' | 'error' | 'pending';
  latency?: number;
  lastChecked: string;
  message?: string;
}

const ServiceMonitor: React.FC = () => {
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchServiceStatus = async () => {
    setLoading(true);
    try {
      // In a real app, we'd fetch this from an API endpoint
      // For now, we'll simulate the response
      
      // Check Supabase connection as an example
      const start = Date.now();
      const { data, error } = await supabase.from('health_checks').select('*').limit(1);
      const end = Date.now();
      const latency = end - start;
      
      const mockServices: ServiceStatus[] = [
        {
          name: 'Database',
          status: error ? 'error' : 'healthy',
          latency: latency,
          lastChecked: new Date().toISOString(),
          message: error ? error.message : undefined
        },
        {
          name: 'Authentication Service',
          status: 'healthy',
          latency: 35,
          lastChecked: new Date().toISOString()
        },
        {
          name: 'Storage Service',
          status: 'healthy',
          latency: 48,
          lastChecked: new Date().toISOString()
        },
        {
          name: 'Functions',
          status: 'warning',
          latency: 220,
          lastChecked: new Date().toISOString(),
          message: 'Higher than normal latency'
        },
      ];
      
      setServices(mockServices);
    } catch (error) {
      console.error('Error fetching service status:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServiceStatus();
    
    // Refresh status every 60 seconds
    const interval = setInterval(fetchServiceStatus, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'pending':
      default:
        return <Clock className="h-5 w-5 text-blue-500" />;
    }
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Service Status</h2>
        <Button 
          variant="outline" 
          onClick={fetchServiceStatus}
          disabled={loading}
        >
          Refresh
        </Button>
      </div>
      
      {loading ? (
        <div className="flex justify-center p-8">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((service) => (
            <Card key={service.name} className={service.status === 'error' ? 'border-red-300' : ''}>
              <CardHeader className="pb-2">
                <div className="flex justify-between">
                  <div>
                    <CardTitle className="text-lg">{service.name}</CardTitle>
                    <CardDescription>Last checked: {formatTime(service.lastChecked)}</CardDescription>
                  </div>
                  <div className="flex items-center">
                    {getStatusIcon(service.status)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Status:</span>
                    <span className={
                      service.status === 'healthy' ? 'text-green-600' :
                      service.status === 'warning' ? 'text-amber-600' :
                      service.status === 'error' ? 'text-red-600' : 'text-blue-600'
                    }>
                      {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                    </span>
                  </div>
                  
                  {service.latency !== undefined && (
                    <div className="flex justify-between text-sm">
                      <span>Latency:</span>
                      <span className={service.latency > 100 ? 'text-amber-600' : ''}>
                        {service.latency} ms
                      </span>
                    </div>
                  )}
                  
                  {service.message && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      {service.message}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">System Metrics</CardTitle>
          <CardDescription>Overall system health and performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Database CPU</span>
                <span className="text-sm text-muted-foreground">18%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full">
                <div className="h-2 bg-green-500 rounded-full" style={{ width: '18%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Memory Usage</span>
                <span className="text-sm text-muted-foreground">42%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full">
                <div className="h-2 bg-green-500 rounded-full" style={{ width: '42%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Storage</span>
                <span className="text-sm text-muted-foreground">73%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full">
                <div className="h-2 bg-amber-500 rounded-full" style={{ width: '73%' }}></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ServiceMonitor;
