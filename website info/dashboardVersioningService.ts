import { WidgetConfig, DashboardLayout } from './src/services/custom-dashboard/customDashboardTypes';

// Dashboard Versioning Service
interface DashboardVersion {
  id: string;
  dashboardId: string;
  version: string;
  name: string;
  description: string;
  changes: string[];
  widgets: WidgetConfig[];
  layout: DashboardLayout;
  settings: Record<string, unknown>;
  createdBy: string;
  createdAt: string;
  isActive: boolean;
  tags: string[];
  size: number; // in KB
  commitMessage?: string;
  parentVersion?: string;
}

interface DashboardBackup {
  id: string;
  dashboardId: string;
  versionId: string;
  backupType: 'auto' | 'manual' | 'pre-rollback';
  createdAt: string;
  retentionDays: number;
  size: number;
  isCompressed: boolean;
}

interface ExportConfig {
  format: 'json' | 'pdf' | 'png' | 'html' | 'csv';
  includeData: boolean;
  includeVersionHistory: boolean;
  includeSharing: boolean;
  compressionLevel: 'none' | 'low' | 'medium' | 'high';
  watermark?: string;
  password?: string;
}

interface ExportJob {
  id: string;
  dashboardId: string;
  config: ExportConfig;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  downloadUrl?: string;
  errorMessage?: string;
  createdAt: string;
  expiresAt: string;
  fileSize?: number;
}

interface VersionComparison {
  dashboardId: string;
  fromVersion: string;
  toVersion: string;
  changes: {
    type: 'added' | 'removed' | 'modified';
    component: 'widget' | 'layout' | 'settings' | 'permissions';
    path: string;
    oldValue?: unknown;
    newValue?: unknown;
    description: string;
  }[];
  summary: {
    widgetsAdded: number;
    widgetsRemoved: number;
    widgetsModified: number;
    layoutChanges: number;
    settingChanges: number;
  };
}

class DashboardVersioningService {
  private versions: Map<string, DashboardVersion[]> = new Map();
  private backups: Map<string, DashboardBackup[]> = new Map();
  private exportJobs: Map<string, ExportJob> = new Map();

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // Mock version data for dashboard-1
    const dashboard1Versions: DashboardVersion[] = [
      {
        id: 'v1-1',
        dashboardId: 'dashboard-1',
        version: '1.0.0',
        name: 'Initial Release',
        description: 'First version of the dashboard',
        changes: ['Created initial dashboard', 'Added basic KPI widgets', 'Set up grid layout'],
        widgets: [
          { id: 'w1', type: 'kpi', title: 'Total Sales', position: { x: 0, y: 0, w: 4, h: 2 } },
          { id: 'w2', type: 'chart', title: 'Sales Trend', position: { x: 4, y: 0, w: 8, h: 4 } }
        ],
        layout: [
          { i: 'w1', x: 0, y: 0, w: 4, h: 2 },
          { i: 'w2', x: 4, y: 0, w: 8, h: 4 }
        ],
        settings: { theme: 'light', autoRefresh: 30 },
        createdBy: 'user-1',
        createdAt: '2024-12-01T10:00:00Z',
        isActive: false,
        tags: ['initial', 'basic'],
        size: 15.2,
        commitMessage: 'Initial dashboard creation'
      },
      {
        id: 'v1-2',
        dashboardId: 'dashboard-1',
        version: '1.1.0',
        name: 'Added Analytics',
        description: 'Enhanced with analytics widgets',
        changes: ['Added revenue chart', 'Modified layout', 'Updated refresh settings'],
        widgets: [
          { id: 'w1', type: 'kpi', title: 'Total Sales', position: { x: 0, y: 0, w: 4, h: 2 } },
          { id: 'w2', type: 'chart', title: 'Sales Trend', position: { x: 4, y: 0, w: 8, h: 4 } },
          { id: 'w3', type: 'chart', title: 'Revenue Analysis', position: { x: 0, y: 2, w: 6, h: 3 } }
        ],
        layout: [
          { i: 'w1', x: 0, y: 0, w: 4, h: 2 },
          { i: 'w2', x: 4, y: 0, w: 8, h: 4 },
          { i: 'w3', x: 0, y: 2, w: 6, h: 3 }
        ],
        settings: { theme: 'light', autoRefresh: 15 },
        createdBy: 'user-1',
        createdAt: '2024-12-05T14:30:00Z',
        isActive: false,
        tags: ['enhanced', 'analytics'],
        size: 22.8,
        commitMessage: 'Added revenue analytics and improved layout',
        parentVersion: 'v1-1'
      },
      {
        id: 'v1-3',
        dashboardId: 'dashboard-1',
        version: '1.2.0',
        name: 'Performance Optimization',
        description: 'Optimized for better performance',
        changes: ['Optimized widget rendering', 'Added caching', 'Updated theme', 'Fixed layout issues'],
        widgets: [
          { id: 'w1', type: 'kpi', title: 'Total Sales', position: { x: 0, y: 0, w: 4, h: 2 } },
          { id: 'w2', type: 'chart', title: 'Sales Trend', position: { x: 4, y: 0, w: 8, h: 4 } },
          { id: 'w3', type: 'chart', title: 'Revenue Analysis', position: { x: 0, y: 2, w: 6, h: 3 } },
          { id: 'w4', type: 'table', title: 'Top Events', position: { x: 6, y: 2, w: 6, h: 3 } }
        ],
        layout: [
          { i: 'w1', x: 0, y: 0, w: 4, h: 2 },
          { i: 'w2', x: 4, y: 0, w: 8, h: 4 },
          { i: 'w3', x: 0, y: 2, w: 6, h: 3 },
          { i: 'w4', x: 6, y: 2, w: 6, h: 3 }
        ],
        settings: { theme: 'dark', autoRefresh: 10, caching: true },
        createdBy: 'user-1',
        createdAt: '2024-12-15T09:15:00Z',
        isActive: true,
        tags: ['optimized', 'performance', 'current'],
        size: 31.5,
        commitMessage: 'Performance improvements and new table widget',
        parentVersion: 'v1-2'
      }
    ];

    this.versions.set('dashboard-1', dashboard1Versions);

    // Mock backup data
    const dashboard1Backups: DashboardBackup[] = [
      {
        id: 'backup-1',
        dashboardId: 'dashboard-1',
        versionId: 'v1-1',
        backupType: 'auto',
        createdAt: '2024-12-01T10:05:00Z',
        retentionDays: 30,
        size: 15.2,
        isCompressed: true
      },
      {
        id: 'backup-2',
        dashboardId: 'dashboard-1',
        versionId: 'v1-2',
        backupType: 'manual',
        createdAt: '2024-12-05T15:00:00Z',
        retentionDays: 90,
        size: 22.8,
        isCompressed: true
      }
    ];

    this.backups.set('dashboard-1', dashboard1Backups);
  }

  // Version Management
  async getVersionHistory(dashboardId: string): Promise<DashboardVersion[]> {
    return this.versions.get(dashboardId) || [];
  }

  async getVersion(dashboardId: string, versionId: string): Promise<DashboardVersion | null> {
    const versions = this.versions.get(dashboardId) || [];
    return versions.find(v => v.id === versionId) || null;
  }

  async createVersion(dashboardId: string, versionData: Partial<DashboardVersion>): Promise<DashboardVersion> {
    const versions = this.versions.get(dashboardId) || [];
    const lastVersion = versions[versions.length - 1];
    
    const newVersion: DashboardVersion = {
      id: `v${dashboardId}-${versions.length + 1}`,
      dashboardId,
      version: this.generateNextVersion(lastVersion?.version || '0.0.0'),
      name: versionData.name || 'Untitled Version',
      description: versionData.description || '',
      changes: versionData.changes || [],
      widgets: versionData.widgets || [],
      layout: versionData.layout || [],
      settings: versionData.settings || {},
      createdBy: versionData.createdBy || 'current-user',
      createdAt: new Date().toISOString(),
      isActive: false,
      tags: versionData.tags || [],
      size: this.calculateSize(versionData.widgets || [], versionData.layout || []),
      commitMessage: versionData.commitMessage,
      parentVersion: lastVersion?.id
    };

    // Deactivate previous version
    if (lastVersion) {
      lastVersion.isActive = false;
    }

    // Set new version as active
    newVersion.isActive = true;

    versions.push(newVersion);
    this.versions.set(dashboardId, versions);

    // Create auto backup
    await this.createBackup(dashboardId, newVersion.id, 'auto');

    return newVersion;
  }

  async rollbackToVersion(dashboardId: string, versionId: string): Promise<DashboardVersion> {
    const versions = this.versions.get(dashboardId) || [];
    const targetVersion = versions.find(v => v.id === versionId);
    
    if (!targetVersion) {
      throw new Error('Version not found');
    }

    // Create backup of current version before rollback
    const currentVersion = versions.find(v => v.isActive);
    if (currentVersion) {
      await this.createBackup(dashboardId, currentVersion.id, 'pre-rollback');
    }

    // Create new version based on target version
    const rollbackVersion = await this.createVersion(dashboardId, {
      ...targetVersion,
      name: `Rollback to ${targetVersion.version}`,
      description: `Rolled back to version ${targetVersion.version}`,
      commitMessage: `Rollback to version ${targetVersion.version}`,
      tags: [...targetVersion.tags, 'rollback']
    });

    return rollbackVersion;
  }

  // Version Comparison
  async compareVersions(dashboardId: string, fromVersionId: string, toVersionId: string): Promise<VersionComparison> {
    const fromVersion = await this.getVersion(dashboardId, fromVersionId);
    const toVersion = await this.getVersion(dashboardId, toVersionId);

    if (!fromVersion || !toVersion) {
      throw new Error('One or both versions not found');
    }

    const changes: VersionComparison['changes'] = [];
    
    // Compare widgets
    const fromWidgets = fromVersion.widgets;
    const toWidgets = toVersion.widgets;
    
    // Find added widgets
    toWidgets.forEach(widget => {
      if (!fromWidgets.find(w => w.id === widget.id)) {
        changes.push({
          type: 'added',
          component: 'widget',
          path: `widgets.${widget.id}`,
          newValue: widget,
          description: `Added widget: ${widget.title}`
        });
      }
    });

    // Find removed widgets
    fromWidgets.forEach(widget => {
      if (!toWidgets.find(w => w.id === widget.id)) {
        changes.push({
          type: 'removed',
          component: 'widget',
          path: `widgets.${widget.id}`,
          oldValue: widget,
          description: `Removed widget: ${widget.title}`
        });
      }
    });

    // Find modified widgets
    fromWidgets.forEach(fromWidget => {
      const toWidget = toWidgets.find(w => w.id === fromWidget.id);
      if (toWidget && JSON.stringify(fromWidget) !== JSON.stringify(toWidget)) {
        changes.push({
          type: 'modified',
          component: 'widget',
          path: `widgets.${fromWidget.id}`,
          oldValue: fromWidget,
          newValue: toWidget,
          description: `Modified widget: ${fromWidget.title}`
        });
      }
    });

    // Compare layout
    if (JSON.stringify(fromVersion.layout) !== JSON.stringify(toVersion.layout)) {
      changes.push({
        type: 'modified',
        component: 'layout',
        path: 'layout',
        oldValue: fromVersion.layout,
        newValue: toVersion.layout,
        description: 'Layout configuration changed'
      });
    }

    // Compare settings
    if (JSON.stringify(fromVersion.settings) !== JSON.stringify(toVersion.settings)) {
      changes.push({
        type: 'modified',
        component: 'settings',
        path: 'settings',
        oldValue: fromVersion.settings,
        newValue: toVersion.settings,
        description: 'Dashboard settings changed'
      });
    }

    const summary = {
      widgetsAdded: changes.filter(c => c.type === 'added' && c.component === 'widget').length,
      widgetsRemoved: changes.filter(c => c.type === 'removed' && c.component === 'widget').length,
      widgetsModified: changes.filter(c => c.type === 'modified' && c.component === 'widget').length,
      layoutChanges: changes.filter(c => c.component === 'layout').length,
      settingChanges: changes.filter(c => c.component === 'settings').length
    };

    return {
      dashboardId,
      fromVersion: fromVersionId,
      toVersion: toVersionId,
      changes,
      summary
    };
  }

  // Backup Management
  async createBackup(dashboardId: string, versionId: string, backupType: DashboardBackup['backupType']): Promise<DashboardBackup> {
    const version = await this.getVersion(dashboardId, versionId);
    if (!version) {
      throw new Error('Version not found');
    }

    const backup: DashboardBackup = {
      id: `backup-${Date.now()}`,
      dashboardId,
      versionId,
      backupType,
      createdAt: new Date().toISOString(),
      retentionDays: backupType === 'manual' ? 90 : 30,
      size: version.size,
      isCompressed: true
    };

    const backups = this.backups.get(dashboardId) || [];
    backups.push(backup);
    this.backups.set(dashboardId, backups);

    return backup;
  }

  async getBackups(dashboardId: string): Promise<DashboardBackup[]> {
    return this.backups.get(dashboardId) || [];
  }

  // Export Functionality
  async createExportJob(dashboardId: string, config: ExportConfig): Promise<ExportJob> {
    const job: ExportJob = {
      id: `export-${Date.now()}`,
      dashboardId,
      config,
      status: 'pending',
      progress: 0,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    };

    this.exportJobs.set(job.id, job);

    // Simulate export process
    this.processExportJob(job.id);

    return job;
  }

  private async processExportJob(jobId: string): Promise<void> {
    const job = this.exportJobs.get(jobId);
    if (!job) return;

    job.status = 'processing';
    
    // Simulate processing with progress updates
    const progressSteps = [10, 30, 50, 70, 85, 100];
    
    for (const step of progressSteps) {
      await new Promise(resolve => setTimeout(resolve, 500));
      job.progress = step;
      
      if (step === 100) {
        job.status = 'completed';
        job.downloadUrl = `/downloads/dashboard-${job.dashboardId}-${Date.now()}.${job.config.format}`;
        job.fileSize = this.calculateExportSize(job.config);
      }
    }
  }

  async getExportJob(jobId: string): Promise<ExportJob | null> {
    return this.exportJobs.get(jobId) || null;
  }

  async getExportHistory(dashboardId: string): Promise<ExportJob[]> {
    return Array.from(this.exportJobs.values()).filter(job => job.dashboardId === dashboardId);
  }

  // Helper Methods
  private generateNextVersion(currentVersion: string): string {
    const [major, minor, patch] = currentVersion.split('.').map(Number);
    return `${major}.${minor}.${patch + 1}`;
  }

  private calculateSize(widgets: WidgetConfig[], layout: DashboardLayout): number {
    // Rough calculation in KB
    const widgetSize = widgets.length * 2.5;
    const layoutSize = layout.length * 0.5;
    return Math.round((widgetSize + layoutSize) * 10) / 10;
  }

  private calculateExportSize(config: ExportConfig): number {
    // Rough calculation in KB based on format and options
    let baseSize = 50;
    
    if (config.includeData) baseSize *= 2;
    if (config.includeVersionHistory) baseSize *= 1.5;
    if (config.includeSharing) baseSize *= 1.2;
    
    const compressionFactor = {
      'none': 1,
      'low': 0.8,
      'medium': 0.6,
      'high': 0.4
    }[config.compressionLevel];

    return Math.round(baseSize * compressionFactor);
  }

  // Cleanup Methods
  async cleanupExpiredBackups(dashboardId: string): Promise<number> {
    const backups = this.backups.get(dashboardId) || [];
    const now = new Date();
    
    const validBackups = backups.filter(backup => {
      const expiryDate = new Date(backup.createdAt);
      expiryDate.setDate(expiryDate.getDate() + backup.retentionDays);
      return expiryDate > now;
    });

    const removedCount = backups.length - validBackups.length;
    this.backups.set(dashboardId, validBackups);
    
    return removedCount;
  }

  async cleanupExpiredExports(): Promise<number> {
    const now = new Date();
    const validJobs = Array.from(this.exportJobs.entries()).filter(([_, job]) => {
      return new Date(job.expiresAt) > now;
    });

    const removedCount = this.exportJobs.size - validJobs.length;
    
    this.exportJobs.clear();
    validJobs.forEach(([id, job]) => {
      this.exportJobs.set(id, job);
    });

    return removedCount;
  }
}

export const dashboardVersioningService = new DashboardVersioningService();
export type {
  DashboardVersion,
  DashboardBackup,
  ExportConfig,
  ExportJob,
  VersionComparison
}; 