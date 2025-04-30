// Simple logger service

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  message: string;
  data?: any;
}

class Logger {
  private logs: LogEntry[] = [];
  
  /**
   * Log a debug message
   */
  debug(message: string, data?: any): void {
    this.log('debug', message, data);
  }
  
  /**
   * Log an info message
   */
  info(message: string, data?: any): void {
    this.log('info', message, data);
  }
  
  /**
   * Log a warning message
   */
  warn(message: string, data?: any): void {
    this.log('warn', message, data);
  }
  
  /**
   * Log an error message
   */
  error(message: string, error?: Error | any): void {
    this.log('error', message, error);
    console.error(message, error);
  }
  
  /**
   * Internal logging method
   */
  private log(level: LogLevel, message: string, data?: any): void {
    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      data
    };
    
    this.logs.push(entry);
    
    // Log to console
    switch (level) {
      case 'debug':
        console.debug(message, data);
        break;
      case 'info':
        console.info(message, data);
        break;
      case 'warn':
        console.warn(message, data);
        break;
    }
    
    // Keep logs limited to last 100 entries
    if (this.logs.length > 100) {
      this.logs.shift();
    }
  }
  
  /**
   * Get recent logs
   */
  getRecentLogs(limit: number = 20): LogEntry[] {
    return this.logs.slice(-Math.min(limit, this.logs.length));
  }
}

export const logger = new Logger();
