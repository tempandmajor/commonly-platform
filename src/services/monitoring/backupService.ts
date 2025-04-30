
// Mock backup service implementation

interface BackupItem {
  id: string;
  type: 'automatic' | 'manual';
  size_mb: number;
  created_at: string;
  status: 'completed' | 'in_progress' | 'failed';
}

// Mock data
const mockBackups: BackupItem[] = [
  {
    id: '1',
    type: 'automatic',
    size_mb: 156.4,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    status: 'completed'
  },
  {
    id: '2',
    type: 'manual',
    size_mb: 158.7,
    created_at: new Date(Date.now() - 172800000).toISOString(),
    status: 'completed'
  },
  {
    id: '3',
    type: 'automatic',
    size_mb: 155.2,
    created_at: new Date(Date.now() - 259200000).toISOString(),
    status: 'completed'
  }
];

export const backupService = {
  /**
   * Get the history of database backups
   */
  getBackupHistory: async (): Promise<BackupItem[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    return mockBackups;
  },

  /**
   * Trigger a manual database backup
   */
  triggerManualBackup: async (userId: string): Promise<BackupItem> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newBackup: BackupItem = {
      id: `manual-${Date.now()}`,
      type: 'manual',
      size_mb: Math.round(150 + Math.random() * 20) / 10,
      created_at: new Date().toISOString(),
      status: 'completed'
    };
    
    mockBackups.unshift(newBackup);
    
    return newBackup;
  }
};
