import { useState, useEffect, useCallback } from 'react';
import { 
  dashboardVersioningService, 
  DashboardVersion, 
  DashboardBackup, 
  ExportConfig, 
  ExportJob, 
  VersionComparison 
} from './dashboardVersioningService';

interface UseDashboardVersioningProps {
  dashboardId: string;
}

interface UseDashboardVersioningReturn {
  // Version Management
  versions: DashboardVersion[];
  currentVersion: DashboardVersion | null;
  loadingVersions: boolean;
  versionsError: string | null;
  
  // Backup Management
  backups: DashboardBackup[];
  loadingBackups: boolean;
  backupsError: string | null;
  
  // Export Management
  exportJobs: ExportJob[];
  loadingExports: boolean;
  exportsError: string | null;
  
  // Version Operations
  createVersion: (versionData: Partial<DashboardVersion>) => Promise<DashboardVersion>;
  rollbackToVersion: (versionId: string) => Promise<DashboardVersion>;
  compareVersions: (fromVersionId: string, toVersionId: string) => Promise<VersionComparison>;
  
  // Backup Operations
  createBackup: (versionId: string, backupType: DashboardBackup['backupType']) => Promise<DashboardBackup>;
  
  // Export Operations
  createExport: (config: ExportConfig) => Promise<ExportJob>;
  getExportStatus: (jobId: string) => Promise<ExportJob | null>;
  
  // Utility Functions
  refreshVersions: () => Promise<void>;
  refreshBackups: () => Promise<void>;
  refreshExports: () => Promise<void>;
  cleanupExpiredBackups: () => Promise<number>;
  cleanupExpiredExports: () => Promise<number>;
}

export const useDashboardVersioning = ({ dashboardId }: UseDashboardVersioningProps): UseDashboardVersioningReturn => {
  // Version State
  const [versions, setVersions] = useState<DashboardVersion[]>([]);
  const [loadingVersions, setLoadingVersions] = useState<boolean>(true);
  const [versionsError, setVersionsError] = useState<string | null>(null);
  
  // Backup State
  const [backups, setBackups] = useState<DashboardBackup[]>([]);
  const [loadingBackups, setLoadingBackups] = useState<boolean>(true);
  const [backupsError, setBackupsError] = useState<string | null>(null);
  
  // Export State
  const [exportJobs, setExportJobs] = useState<ExportJob[]>([]);
  const [loadingExports, setLoadingExports] = useState<boolean>(true);
  const [exportsError, setExportsError] = useState<string | null>(null);

  // Computed Values
  const currentVersion = versions.find(v => v.isActive) || null;

  // Load initial data
  useEffect(() => {
    if (dashboardId) {
      refreshVersions();
      refreshBackups();
      refreshExports();
    }
  }, [dashboardId]);

  // Auto-refresh export jobs that are processing
  useEffect(() => {
    const processingJobs = exportJobs.filter(job => job.status === 'processing');
    
    if (processingJobs.length > 0) {
      const interval = setInterval(() => {
        refreshExports();
      }, 2000); // Check every 2 seconds for updates
      
      return () => clearInterval(interval);
    }
  }, [exportJobs]);

  // Version Management Functions
  const refreshVersions = useCallback(async (): Promise<void> => {
    try {
      setLoadingVersions(true);
      setVersionsError(null);
      const versionHistory = await dashboardVersioningService.getVersionHistory(dashboardId);
      setVersions(versionHistory);
    } catch (error) {
      setVersionsError(error instanceof Error ? error.message : 'Failed to load versions');
    } finally {
      setLoadingVersions(false);
    }
  }, [dashboardId]);

  const createVersion = useCallback(async (versionData: Partial<DashboardVersion>): Promise<DashboardVersion> => {
    try {
      setVersionsError(null);
      const newVersion = await dashboardVersioningService.createVersion(dashboardId, versionData);
      await refreshVersions(); // Refresh to get updated list
      await refreshBackups(); // Refresh backups as auto-backup is created
      return newVersion;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create version';
      setVersionsError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [dashboardId, refreshVersions, refreshBackups]);

  const rollbackToVersion = useCallback(async (versionId: string): Promise<DashboardVersion> => {
    try {
      setVersionsError(null);
      const rollbackVersion = await dashboardVersioningService.rollbackToVersion(dashboardId, versionId);
      await refreshVersions();
      await refreshBackups(); // Refresh as pre-rollback backup is created
      return rollbackVersion;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to rollback version';
      setVersionsError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [dashboardId, refreshVersions, refreshBackups]);

  const compareVersions = useCallback(async (fromVersionId: string, toVersionId: string): Promise<VersionComparison> => {
    try {
      setVersionsError(null);
      return await dashboardVersioningService.compareVersions(dashboardId, fromVersionId, toVersionId);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to compare versions';
      setVersionsError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [dashboardId]);

  // Backup Management Functions
  const refreshBackups = useCallback(async (): Promise<void> => {
    try {
      setLoadingBackups(true);
      setBackupsError(null);
      const backupList = await dashboardVersioningService.getBackups(dashboardId);
      setBackups(backupList);
    } catch (error) {
      setBackupsError(error instanceof Error ? error.message : 'Failed to load backups');
    } finally {
      setLoadingBackups(false);
    }
  }, [dashboardId]);

  const createBackup = useCallback(async (versionId: string, backupType: DashboardBackup['backupType']): Promise<DashboardBackup> => {
    try {
      setBackupsError(null);
      const newBackup = await dashboardVersioningService.createBackup(dashboardId, versionId, backupType);
      await refreshBackups();
      return newBackup;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create backup';
      setBackupsError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [dashboardId, refreshBackups]);

  const cleanupExpiredBackups = useCallback(async (): Promise<number> => {
    try {
      setBackupsError(null);
      const removedCount = await dashboardVersioningService.cleanupExpiredBackups(dashboardId);
      await refreshBackups();
      return removedCount;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to cleanup backups';
      setBackupsError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [dashboardId, refreshBackups]);

  // Export Management Functions
  const refreshExports = useCallback(async (): Promise<void> => {
    try {
      setLoadingExports(true);
      setExportsError(null);
      const exportHistory = await dashboardVersioningService.getExportHistory(dashboardId);
      setExportJobs(exportHistory);
    } catch (error) {
      setExportsError(error instanceof Error ? error.message : 'Failed to load exports');
    } finally {
      setLoadingExports(false);
    }
  }, [dashboardId]);

  const createExport = useCallback(async (config: ExportConfig): Promise<ExportJob> => {
    try {
      setExportsError(null);
      const exportJob = await dashboardVersioningService.createExportJob(dashboardId, config);
      await refreshExports();
      return exportJob;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create export';
      setExportsError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [dashboardId, refreshExports]);

  const getExportStatus = useCallback(async (jobId: string): Promise<ExportJob | null> => {
    try {
      return await dashboardVersioningService.getExportJob(jobId);
    } catch (error) {
      setExportsError(error instanceof Error ? error.message : 'Failed to get export status');
      return null;
    }
  }, []);

  const cleanupExpiredExports = useCallback(async (): Promise<number> => {
    try {
      setExportsError(null);
      const removedCount = await dashboardVersioningService.cleanupExpiredExports();
      await refreshExports();
      return removedCount;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to cleanup exports';
      setExportsError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [refreshExports]);

  return {
    // Version Management
    versions,
    currentVersion,
    loadingVersions,
    versionsError,
    
    // Backup Management
    backups,
    loadingBackups,
    backupsError,
    
    // Export Management
    exportJobs,
    loadingExports,
    exportsError,
    
    // Version Operations
    createVersion,
    rollbackToVersion,
    compareVersions,
    
    // Backup Operations
    createBackup,
    
    // Export Operations
    createExport,
    getExportStatus,
    
    // Utility Functions
    refreshVersions,
    refreshBackups,
    refreshExports,
    cleanupExpiredBackups,
    cleanupExpiredExports
  };
}; 