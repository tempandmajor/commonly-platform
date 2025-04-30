
import { supabase } from "@/integrations/supabase/client";
import { logger } from "./loggingService";

export interface QueryMetrics {
  queryId: string;
  operation: string;
  table: string;
  duration: number;
  timestamp: string;
  success: boolean;
  errorMessage?: string;
  params?: Record<string, any>;
}

/**
 * Service for monitoring and analyzing query performance
 */
export class PerformanceService {
  private static instance: PerformanceService;
  private metricsEnabled = true;
  private tableName = "query_metrics";
  private slowQueryThreshold = 500; // ms
  
  private constructor() {
    // Initialize monitoring
    this.initialize();
  }
  
  /**
   * Get singleton instance
   */
  public static getInstance(): PerformanceService {
    if (!PerformanceService.instance) {
      PerformanceService.instance = new PerformanceService();
    }
    return PerformanceService.instance;
  }
  
  /**
   * Initialize performance monitoring
   */
  private async initialize(): Promise<void> {
    try {
      // Check if table exists
      const { error } = await supabase.from(this.tableName).select('query_id').limit(1);
      
      if (error) {
        console.warn(`Metrics table '${this.tableName}' may not exist. Performance monitoring limited.`);
        this.metricsEnabled = false;
      }
      
      // Get configuration
      const { data } = await supabase.from("system_configuration")
        .select("value")
        .eq("key", "performance_monitoring")
        .single();
      
      if (data?.value) {
        this.metricsEnabled = data.value.enabled ?? true;
        this.slowQueryThreshold = data.value.slowQueryThreshold ?? 500;
      }
    } catch (error) {
      console.error("Error initializing performance monitoring:", error);
      this.metricsEnabled = false;
    }
  }
  
  /**
   * Track a database operation with timing
   */
  public async trackQuery<T>(
    operation: string,
    table: string,
    queryFn: () => Promise<T>,
    params?: Record<string, any>
  ): Promise<T> {
    const startTime = performance.now();
    const queryId = crypto.randomUUID();
    let success = false;
    let errorMessage: string | undefined;
    let result: T;
    
    try {
      // Execute the query
      result = await queryFn();
      success = true;
      return result;
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : String(error);
      throw error;
    } finally {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Log slow queries
      if (duration > this.slowQueryThreshold) {
        logger.warn(`Slow query detected: ${operation} on ${table} took ${Math.round(duration)}ms`, { 
          queryId,
          duration,
          table,
          operation
        });
      }
      
      // Record metrics if enabled
      if (this.metricsEnabled) {
        this.recordMetrics({
          queryId,
          operation,
          table,
          duration,
          timestamp: new Date().toISOString(),
          success,
          errorMessage,
          params
        }).catch(error => {
          console.error("Error recording query metrics:", error);
        });
      }
    }
  }
  
  /**
   * Record query metrics to database
   */
  private async recordMetrics(metrics: QueryMetrics): Promise<void> {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .insert({
          query_id: metrics.queryId,
          operation: metrics.operation,
          table: metrics.table,
          duration_ms: Math.round(metrics.duration),
          timestamp: metrics.timestamp,
          success: metrics.success,
          error_message: metrics.errorMessage,
          params: metrics.params
        });
      
      if (error) {
        console.error("Error recording metrics:", error);
      }
    } catch (error) {
      console.error("Exception recording metrics:", error);
    }
  }
  
  /**
   * Get performance metrics for analysis
   */
  public async getQueryPerformanceMetrics(options: {
    timespan: 'day' | 'week' | 'month',
    table?: string,
    limit?: number
  }): Promise<any[]> {
    try {
      let query = supabase.from(this.tableName).select("*");
      
      // Filter by table if specified
      if (options.table) {
        query = query.eq("table", options.table);
      }
      
      // Filter by timespan
      const now = new Date();
      let startDate: Date;
      
      switch (options.timespan) {
        case 'day':
          startDate = new Date(now.setDate(now.getDate() - 1));
          break;
        case 'week':
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'month':
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
      }
      
      query = query.gte("timestamp", startDate.toISOString());
      
      // Order by duration (slowest first)
      query = query.order("duration_ms", { ascending: false });
      
      // Limit results
      if (options.limit) {
        query = query.limit(options.limit);
      } else {
        query = query.limit(100);
      }
      
      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      return data || [];
    } catch (error) {
      logger.error("Error fetching performance metrics", error as Error);
      throw error;
    }
  }
}

// Export singleton instance
export const performanceMonitor = PerformanceService.getInstance();
