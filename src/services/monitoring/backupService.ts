
import { supabase } from "@/integrations/supabase/client";
import { logger } from "./loggingService";

/**
 * Service for managing database backups via Supabase edge functions
 */
export class BackupService {
  private static instance: BackupService;
  
  private constructor() {}
  
  /**
   * Get singleton instance
   */
  public static getInstance(): BackupService {
    if (!BackupService.instance) {
      BackupService.instance = new BackupService();
    }
    return BackupService.instance;
  }

  /**
   * Trigger a manual backup of the database
   * This actually calls a Supabase edge function that triggers the backup
   */
  public async triggerManualBackup(userId: string): Promise<boolean> {
    try {
      logger.info("Triggering manual database backup", { userId });
      
      const { data, error } = await supabase.functions.invoke("trigger-backup", {
        body: { 
          backupType: "manual",
          triggeredBy: userId
        }
      });
      
      if (error) {
        throw error;
      }
      
      logger.info("Manual backup successfully triggered", { 
        backupId: data?.backupId,
        userId 
      });
      
      return true;
    } catch (error) {
      logger.error("Failed to trigger manual backup", error as Error, { userId });
      throw error;
    }
  }

  /**
   * Get list of recent backups
   */
  public async getBackupHistory(): Promise<any[]> {
    try {
      logger.info("Fetching backup history");
      
      const { data, error } = await supabase.from("backup_history")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      
      if (error) {
        throw error;
      }
      
      return data || [];
    } catch (error) {
      logger.error("Failed to fetch backup history", error as Error);
      throw error;
    }
  }
  
  /**
   * Configure automated backup schedule
   * This only updates the schedule configuration in the database
   * The actual scheduling is done at the Supabase project level
   */
  public async configureAutomatedBackups(config: {
    frequency: "daily" | "weekly" | "monthly";
    retention: number;
    enabled: boolean;
  }): Promise<void> {
    try {
      logger.info("Configuring automated backups", { config });
      
      const { error } = await supabase.from("system_configuration")
        .upsert({
          key: "backup_schedule",
          value: config,
          updated_at: new Date().toISOString()
        }, { onConflict: "key" });
      
      if (error) {
        throw error;
      }
      
      logger.info("Automated backup configuration updated", { config });
    } catch (error) {
      logger.error("Failed to configure automated backups", error as Error);
      throw error;
    }
  }
}

// Export singleton instance
export const backupService = BackupService.getInstance();
