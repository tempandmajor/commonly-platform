
// Mock performance monitoring service

interface SlowQuery {
  query_id: string;
  operation: string;
  table: string;
  duration_ms: number;
  timestamp: string;
  error_message?: string;
}

interface QueryPerformanceOptions {
  timespan: 'hour' | 'day' | 'week';
  limit?: number;
}

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
  },
  {
    query_id: '4',
    operation: 'SELECT',
    table: 'podcasts',
    duration_ms: 1578,
    timestamp: new Date(Date.now() - 14400000).toISOString()
  }
];

export const performanceMonitor = {
  /**
   * Get slow query metrics from the database
   */
  getQueryPerformanceMetrics: async (options: QueryPerformanceOptions): Promise<SlowQuery[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Filter based on timespan
    let milliseconds: number;
    switch (options.timespan) {
      case 'hour':
        milliseconds = 3600000;
        break;
      case 'week':
        milliseconds = 604800000;
        break;
      case 'day':
      default:
        milliseconds = 86400000;
    }
    
    const filteredQueries = mockSlowQueries.filter(query => 
      new Date(query.timestamp).getTime() > Date.now() - milliseconds
    );
    
    // Sort by duration (slowest first) and limit
    const sortedQueries = [...filteredQueries].sort((a, b) => b.duration_ms - a.duration_ms);
    
    return options.limit ? sortedQueries.slice(0, options.limit) : sortedQueries;
  }
};
