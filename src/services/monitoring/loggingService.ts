
import { supabase } from "@/integrations/supabase/client";

// Log levels
export enum LogLevel {
  DEBUG = "debug",
  INFO = "info",
  WARN = "warn",
  ERROR = "error"
}

// Log entry structure
export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  userId?: string;
  context?: Record<string, any>;
  stackTrace?: string;
}

/**
 * Structured logging service for application monitoring
 */
export class LoggingService {
  private static instance: LoggingService;
  private tableName = "application_logs";
  private consoleEnabled = true;
  private databaseEnabled = true;
  
  private constructor() {
    // Ensure the logs table exists when initialized
    this.initializeLogTable();
  }
  
  /**
   * Get singleton instance
   */
  public static getInstance(): LoggingService {
    if (!LoggingService.instance) {
      LoggingService.instance = new LoggingService();
    }
    return LoggingService.instance;
  }
  
  /**
   * Initialize log table in Supabase if needed
   */
  private async initializeLogTable(): Promise<void> {
    try {
      // Check if table exists by attempting to select from it
      const { error } = await supabase.from(this.tableName).select('id').limit(1);
      
      // If table doesn't exist, logs will be stored only in console until admin creates the table
      if (error) {
        console.warn(`Log table '${this.tableName}' may not exist. Only logging to console.`);
        this.databaseEnabled = false;
      }
    } catch (error) {
      console.error("Error initializing log table:", error);
      this.databaseEnabled = false;
    }
  }
  
  /**
   * Log a debug message
   */
  public debug(message: string, context?: Record<string, any>, userId?: string): void {
    this.log(LogLevel.DEBUG, message, context, userId);
  }
  
  /**
   * Log an info message
   */
  public info(message: string, context?: Record<string, any>, userId?: string): void {
    this.log(LogLevel.INFO, message, context, userId);
  }
  
  /**
   * Log a warning message
   */
  public warn(message: string, context?: Record<string, any>, userId?: string): void {
    this.log(LogLevel.WARN, message, context, userId);
  }
  
  /**
   * Log an error message
   */
  public error(message: string, error?: Error, context?: Record<string, any>, userId?: string): void {
    const stackTrace = error?.stack;
    const errorContext = error ? { ...context, errorMessage: error.message } : context;
    
    this.log(LogLevel.ERROR, message, errorContext, userId, stackTrace);
  }
  
  /**
   * Central logging method
   */
  private log(
    level: LogLevel, 
    message: string, 
    context?: Record<string, any>, 
    userId?: string,
    stackTrace?: string
  ): void {
    const timestamp = new Date().toISOString();
    const logEntry: LogEntry = {
      level,
      message,
      timestamp,
      userId,
      context,
      stackTrace
    };
    
    // Always log to console
    if (this.consoleEnabled) {
      this.logToConsole(logEntry);
    }
    
    // Log to database if enabled
    if (this.databaseEnabled) {
      this.logToDatabase(logEntry).catch(error => {
        console.error("Failed to log to database:", error);
      });
    }
  }
  
  /**
   * Log to browser console
   */
  private logToConsole(logEntry: LogEntry): void {
    const { level, message, context, stackTrace } = logEntry;
    
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(`[DEBUG] ${message}`, context || '');
        break;
      case LogLevel.INFO:
        console.info(`[INFO] ${message}`, context || '');
        break;
      case LogLevel.WARN:
        console.warn(`[WARN] ${message}`, context || '');
        break;
      case LogLevel.ERROR:
        console.error(`[ERROR] ${message}`, context || '', stackTrace || '');
        break;
    }
  }
  
  /**
   * Log to Supabase database
   */
  private async logToDatabase(logEntry: LogEntry): Promise<void> {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .insert({
          level: logEntry.level,
          message: logEntry.message,
          timestamp: logEntry.timestamp,
          user_id: logEntry.userId,
          context: logEntry.context,
          stack_trace: logEntry.stackTrace
        });
        
      if (error) {
        console.error("Error logging to database:", error);
      }
    } catch (error) {
      console.error("Exception logging to database:", error);
    }
  }
}

// Export singleton instance
export const logger = LoggingService.getInstance();
