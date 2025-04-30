
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle, CheckCircle, BarChart3, RefreshCcw, LineChart, Database, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/services/monitoring/loggingService";
import { backupService } from "@/services/monitoring/backupService";
import { performanceMonitor } from "@/services/monitoring/performanceService";
import { useAuth } from "@/contexts/AuthContext";

interface ServiceStatus {
  name: string;
  status: 'operational' | 'degraded' | 'outage' | 'unknown';
  latency?: number;
  lastChecked: Date;
}

interface ServiceAlert {
  id: string;
  service: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: Date;
  acknowledged: boolean;
}

interface SlowQuery {
  query_id: string;
  operation: string;
  table: string;
  duration_ms: number;
  timestamp: string;
  error_message?: string;
}

interface BackupItem {
  id: string;
  type: 'automatic' | 'manual';
  size_mb: number;
  created_at: string;
  status: 'completed' | 'in_progress' | 'failed';
}

export default function ServiceMonitor() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [alerts, setAlerts] = useState<ServiceAlert[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [loadingAlerts, setLoadingAlerts] = useState(true);
  const [metrics, setMetrics] = useState<{slowQueries: SlowQuery[], systemMetrics: any[]} | null>(null);
  const [backups, setBackups] = useState<BackupItem[]>([]);
  const [loadingBackups, setLoadingBackups] = useState(false);
  const [triggeringBackup, setTriggeringBackup] = useState(false);
  
  const { toast } = useToast();
  const { currentUser } = useAuth();

  // Fetch service statuses
  const fetchServiceStatus = async () => {
    setLoadingServices(true);
    try {
      // Check auth service
      const authStart = performance.now();
      const { data: authData, error: authError } = await supabase.auth.getSession();
      const authLatency = performance.now() - authStart;
      
      // Check database service by querying a known table
      const dbStart = performance.now();
      const { data: dbData, error: dbError } = await supabase.from('users').select('id').limit(1);
      const dbLatency = performance.now() - dbStart;
      
      // Check storage service
      const storageStart = performance.now();
      const { data: storageData, error: storageError } = await supabase.storage.listBuckets();
      const storageLatency = performance.now() - storageStart;
      
      // Check functions service
      const functionsStart = performance.now();
      const { data: functionsData, error: functionsError } = await supabase.functions.invoke("health-check", {
        body: { timestamp: new Date().toISOString() }
      });
      const functionsLatency = performance.now() - functionsStart;
      
      const serviceStatuses: ServiceStatus[] = [
        {
          name: 'Authentication',
          status: authError ? 'degraded' : 'operational',
          latency: Math.round(authLatency),
          lastChecked: new Date()
        },
        {
          name: 'Database',
          status: dbError ? 'degraded' : 'operational',
          latency: Math.round(dbLatency),
          lastChecked: new Date()
        },
        {
          name: 'Storage',
          status: storageError ? 'degraded' : 'operational',
          latency: Math.round(storageLatency),
          lastChecked: new Date()
        },
        {
          name: 'Functions',
          status: functionsError ? 'degraded' : 'operational',
          latency: Math.round(functionsLatency),
          lastChecked: new Date()
        }
      ];
      
      setServices(serviceStatuses);
      
      // Log any issues
      const degradedServices = serviceStatuses.filter(s => s.status !== 'operational');
      if (degradedServices.length > 0) {
        logger.warn('Degraded services detected', { degradedServices });
      }
    } catch (error) {
      toast({
        title: "Service Check Failed",
        description: "Unable to check service status",
        variant: "destructive"
      });
      logger.error('Service check failed', error as Error);
    } finally {
      setLoadingServices(false);
    }
  };

  // Mock fetch alerts since we don't have a service_alerts table
  const fetchAlerts = async () => {
    setLoadingAlerts(true);
    try {
      // Mock data since we don't have a service_alerts table
      const mockAlerts: ServiceAlert[] = [
        {
          id: '1',
          service: 'Database',
          severity: 'info',
          message: 'Database performance optimizations applied',
          timestamp: new Date(Date.now() - 4000000),
          acknowledged: false
        },
        {
          id: '2',
          service: 'Storage',
          severity: 'warning',
          message: 'Storage usage approaching quota limit (85%)',
          timestamp: new Date(Date.now() - 7200000),
          acknowledged: false
        }
      ];
      
      setAlerts(mockAlerts);
    } catch (error) {
      toast({
        title: "Failed to Load Alerts",
        description: "Could not retrieve service alerts",
        variant: "destructive"
      });
      logger.error('Failed to load alerts', error as Error);
    } finally {
      setLoadingAlerts(false);
    }
  };

  // Mock fetch performance metrics
  const fetchMetrics = async () => {
    try {
      // Get slow queries - mock since we don't have the actual table
      const mockSlowQueries: SlowQuery[] = [
        {
          query_id: '1',
          operation: 'SELECT',
          table: 'users',
          duration_ms: 3245,
          timestamp: new Date(Date.now() - 3600000).toISOString()
        },
        {
          query_id: '2',
          operation: 'INSERT',
          table: 'events',
          duration_ms: 1872,
          timestamp: new Date(Date.now() - 7200000).toISOString()
        },
        {
          query_id: '3',
          operation: 'SELECT',
          table: 'transactions',
          duration_ms: 2954,
          timestamp: new Date(Date.now() - 10800000).toISOString(),
          error_message: 'Timeout exceeded'
        }
      ];
      
      // Mock system metrics
      const mockSystemMetrics = Array(24).fill(0).map((_, i) => ({
        timestamp: new Date(Date.now() - i * 3600000).toISOString(),
        cpu_usage: Math.random() * 30 + 10,
        memory_usage: Math.random() * 40 + 30,
        api_requests: Math.floor(Math.random() * 500 + 100)
      }));
      
      setMetrics({
        slowQueries: mockSlowQueries,
        systemMetrics: mockSystemMetrics
      });
    } catch (error) {
      toast({
        title: "Failed to Load Metrics",
        description: "Could not retrieve performance metrics",
        variant: "destructive"
      });
      logger.error('Failed to load metrics', error as Error);
    }
  };

  // Fetch backup history
  const fetchBackupHistory = async () => {
    setLoadingBackups(true);
    try {
      const backupHistory = await backupService.getBackupHistory();
      setBackups(backupHistory as BackupItem[]);
    } catch (error) {
      toast({
        title: "Failed to Load Backup History",
        description: "Could not retrieve backup information",
        variant: "destructive"
      });
      logger.error('Failed to load backup history', error as Error);
    } finally {
      setLoadingBackups(false);
    }
  };

  // Trigger manual backup
  const handleTriggerBackup = async () => {
    if (!currentUser?.id) return;
    
    setTriggeringBackup(true);
    try {
      await backupService.triggerManualBackup(currentUser.id);
      
      toast({
        title: "Backup Initiated",
        description: "Manual backup has been triggered",
        variant: "default"
      });
      
      // Refresh backup history
      await fetchBackupHistory();
    } catch (error) {
      toast({
        title: "Backup Failed",
        description: "Could not trigger manual backup",
        variant: "destructive"
      });
      logger.error('Failed to trigger backup', error as Error);
    } finally {
      setTriggeringBackup(false);
    }
  };

  // Acknowledge alert
  const acknowledgeAlert = async (alertId: string) => {
    try {
      // Since we're using mock data, just update the local state
      setAlerts(alerts.map(alert => 
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      ));
      
      toast({
        title: "Alert Acknowledged",
        description: "Service alert has been acknowledged",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Failed to Acknowledge Alert",
        description: "Could not update alert status",
        variant: "destructive"
      });
      logger.error('Failed to acknowledge alert', error as Error);
    }
  };

  // Initial data loading
  useEffect(() => {
    fetchServiceStatus();
    fetchAlerts();
    fetchMetrics();
    fetchBackupHistory();
    
    // Service status check interval
    const intervalId = setInterval(fetchServiceStatus, 60000); // Every minute
    
    return () => clearInterval(intervalId);
  }, []);

  // Status badge component
  const StatusBadge = ({ status }: { status: ServiceStatus['status'] }) => {
    switch (status) {
      case 'operational':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Operational</Badge>;
      case 'degraded':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Degraded</Badge>;
      case 'outage':
        return <Badge variant="outline" className="bg-red-100 text-red-800">Outage</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Service Monitoring</h1>
        <Button 
          variant="outline" 
          onClick={() => {
            fetchServiceStatus();
            fetchAlerts();
            fetchMetrics();
          }}
          disabled={loadingServices}
        >
          <RefreshCcw className={`h-4 w-4 mr-2 ${loadingServices ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="metrics">Performance</TabsTrigger>
          <TabsTrigger value="backups">Backups</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Service Status */}
            <Card>
              <CardHeader>
                <CardTitle>Service Status</CardTitle>
                <CardDescription>Current status of Supabase services</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingServices ? (
                  <div className="flex justify-center py-6">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {services.map(service => (
                      <div key={service.name} className="flex items-center justify-between border-b pb-2">
                        <div>
                          <p className="font-medium">{service.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {service.latency} ms
                          </p>
                        </div>
                        <StatusBadge status={service.status} />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Active Alerts */}
            <Card>
              <CardHeader>
                <CardTitle>Active Alerts</CardTitle>
                <CardDescription>Service disruptions and notifications</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingAlerts ? (
                  <div className="flex justify-center py-6">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : alerts.length > 0 ? (
                  <div className="space-y-4">
                    {alerts.filter(alert => !alert.acknowledged).map(alert => (
                      <div key={alert.id} className="rounded-lg border p-3">
                        <div className="flex justify-between">
                          <div className="flex items-center">
                            {alert.severity === 'critical' && (
                              <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
                            )}
                            {alert.severity === 'warning' && (
                              <AlertTriangle className="h-4 w-4 text-yellow-500 mr-2" />
                            )}
                            {alert.severity === 'info' && (
                              <CheckCircle className="h-4 w-4 text-blue-500 mr-2" />
                            )}
                            <span className="font-medium">{alert.service}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {alert.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="mt-1 text-sm">{alert.message}</p>
                        <div className="mt-2 flex justify-end">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => acknowledgeAlert(alert.id)}
                          >
                            Acknowledge
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    {alerts.filter(alert => !alert.acknowledged).length === 0 && (
                      <div className="flex flex-col items-center py-6 text-center text-muted-foreground">
                        <CheckCircle className="h-8 w-8 text-green-500 mb-2" />
                        <p>All systems operational</p>
                        <p className="text-sm">No active alerts</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-6 text-center text-muted-foreground">
                    <CheckCircle className="h-8 w-8 text-green-500 mb-2" />
                    <p>All systems operational</p>
                    <p className="text-sm">No alerts found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="metrics">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>Database and API performance analysis</CardDescription>
              </CardHeader>
              <CardContent>
                {!metrics ? (
                  <div className="flex justify-center py-6">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4 flex items-center">
                        <BarChart3 className="h-5 w-5 mr-2" /> Slowest Queries
                      </h3>
                      
                      {metrics.slowQueries.length > 0 ? (
                        <div className="space-y-3">
                          {metrics.slowQueries.map((query) => (
                            <div key={query.query_id} className="rounded-lg border p-3">
                              <div className="flex justify-between">
                                <span className="font-medium">{query.operation} on {query.table}</span>
                                <span className="text-sm font-medium text-amber-600">
                                  {query.duration_ms} ms
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(query.timestamp).toLocaleString()}
                              </p>
                              {query.error_message && (
                                <p className="text-sm text-red-500 mt-1">{query.error_message}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-center py-4">
                          No slow queries detected in the last 24 hours
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-4 flex items-center">
                        <LineChart className="h-5 w-5 mr-2" /> System Metrics
                      </h3>
                      
                      {metrics.systemMetrics.length > 0 ? (
                        <div className="h-[300px] border rounded-lg p-4">
                          {/* Placeholder for charts */}
                          <div className="flex items-center justify-center h-full text-muted-foreground">
                            <p>System metrics visualization</p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-center py-4">
                          No system metrics available
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="backups">
          <div className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle>Database Backups</CardTitle>
                  <CardDescription>Backup history and management</CardDescription>
                </div>
                <Button onClick={handleTriggerBackup} disabled={triggeringBackup}>
                  {triggeringBackup ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Backing up...
                    </>
                  ) : (
                    <>
                      <Database className="mr-2 h-4 w-4" />
                      Trigger Backup
                    </>
                  )}
                </Button>
              </CardHeader>
              <CardContent>
                {loadingBackups ? (
                  <div className="flex justify-center py-6">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : backups.length > 0 ? (
                  <div className="space-y-4">
                    {backups.map((backup) => (
                      <div key={backup.id} className="flex justify-between items-center border-b pb-2">
                        <div>
                          <div className="flex items-center">
                            {backup.type === 'automatic' ? (
                              <Clock className="h-4 w-4 mr-2 text-blue-500" />
                            ) : (
                              <Database className="h-4 w-4 mr-2 text-green-500" />
                            )}
                            <span className="font-medium capitalize">{backup.type} Backup</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {backup.size_mb} MB • {new Date(backup.created_at).toLocaleString()}
                          </p>
                        </div>
                        <Badge 
                          variant={backup.status === 'completed' ? 'outline' : 'secondary'}
                          className={backup.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
                        >
                          {backup.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-6 text-center text-muted-foreground">
                    <Database className="h-8 w-8 text-gray-400 mb-2" />
                    <p>No backup history available</p>
                    <p className="text-sm">Trigger a manual backup or configure automated backups</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Backup Configuration</CardTitle>
                <CardDescription>Configure automated backup schedule</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Automated backups are configured at the Supabase project level. 
                    For more advanced configuration options, please visit the Supabase dashboard.
                  </p>
                  
                  <div className="flex justify-end">
                    <Button variant="outline">
                      Open Supabase Dashboard
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
