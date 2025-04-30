
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, Clock, RefreshCcw, ArrowRight } from "lucide-react";
import { checkMigrationStatus, decommissionFirebase, updateDocumentation } from "@/services/migrationCleanup";
import { useToast } from "@/hooks/use-toast";

const MigrationStatus = () => {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [decommissioning, setDecommissioning] = useState(false);
  const { toast } = useToast();

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const migrationStatus = await checkMigrationStatus();
      setStatus(migrationStatus);
    } catch (error) {
      console.error("Error fetching migration status:", error);
      toast({
        title: "Error",
        description: "Failed to fetch migration status",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleDecommission = async () => {
    try {
      setDecommissioning(true);
      await decommissionFirebase();
      await updateDocumentation();
      
      toast({
        title: "Success",
        description: "Firebase services have been decommissioned",
        variant: "default",
      });
      
      // Refresh status
      await fetchStatus();
    } catch (error) {
      console.error("Error during decommissioning:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to decommission Firebase services",
        variant: "destructive",
      });
    } finally {
      setDecommissioning(false);
    }
  };

  const getStatusIcon = (featureStatus: string) => {
    switch (featureStatus) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
    }
  };

  const getProgress = () => {
    if (!status) return 0;
    
    const features = Object.values(status);
    const completed = features.filter(f => f.status === "completed").length;
    return (completed / features.length) * 100;
  };

  const isComplete = status && Object.values(status).every(f => f.status === "completed");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Firebase to Supabase Migration</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchStatus}
          disabled={loading}
        >
          <RefreshCcw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Migration Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={getProgress()} className="h-2" />
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {status && Object.entries(status).map(([key, value]: [string, any]) => (
                <div 
                  key={key} 
                  className="flex items-center justify-between p-4 border rounded-md"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(value.status)}
                    <div>
                      <p className="font-medium capitalize">{key}</p>
                      <p className="text-sm text-muted-foreground">
                        {value.count} items migrated
                      </p>
                    </div>
                  </div>
                  <span className="capitalize text-sm font-medium">
                    {value.status}
                  </span>
                </div>
              ))}
            </div>
            
            <div className="flex justify-end mt-6">
              <Button
                onClick={handleDecommission}
                disabled={!isComplete || decommissioning}
                className={!isComplete ? "opacity-50 cursor-not-allowed" : ""}
              >
                {decommissioning ? (
                  <>
                    <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />
                    Decommissioning...
                  </>
                ) : (
                  <>
                    Decommission Firebase
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MigrationStatus;
