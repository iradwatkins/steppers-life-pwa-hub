import React, { useState, useEffect } from 'react';
import { useDashboardVersioning } from './useDashboardVersioning';
import { DashboardVersion, VersionComparison, ExportConfig, ExportJob } from './dashboardVersioningService';

interface DashboardVersionManagerProps {
  dashboardId: string;
  onVersionChange?: (version: DashboardVersion) => void;
}

const DashboardVersionManager: React.FC<DashboardVersionManagerProps> = ({
  dashboardId,
  onVersionChange
}) => {
  const {
    versions,
    currentVersion,
    backups,
    exportJobs,
    loadingVersions,
    loadingExports,
    versionsError,
    exportsError,
    createVersion,
    rollbackToVersion,
    compareVersions,
    createBackup,
    createExport,
    cleanupExpiredBackups,
    cleanupExpiredExports
  } = useDashboardVersioning({ dashboardId });

  const [activeTab, setActiveTab] = useState<'versions' | 'backups' | 'exports'>('versions');
  const [showCreateVersion, setShowCreateVersion] = useState<boolean>(false);
  const [showExportDialog, setShowExportDialog] = useState<boolean>(false);
  const [showCompareDialog, setShowCompareDialog] = useState<boolean>(false);
  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);
  const [comparison, setComparison] = useState<VersionComparison | null>(null);
  const [newVersionData, setNewVersionData] = useState({
    name: '',
    description: '',
    commitMessage: '',
    tags: ''
  });
  const [exportConfig, setExportConfig] = useState<ExportConfig>({
    format: 'json' as const,
    includeData: true,
    includeVersionHistory: false,
    includeSharing: false,
    compressionLevel: 'medium' as const
  });

  // Handle version change callback
  useEffect(() => {
    if (currentVersion && onVersionChange) {
      onVersionChange(currentVersion);
    }
  }, [currentVersion, onVersionChange]);

  const handleCreateVersion = async () => {
    try {
      const tags = newVersionData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      await createVersion({
        name: newVersionData.name,
        description: newVersionData.description,
        commitMessage: newVersionData.commitMessage,
        tags
      });
      setShowCreateVersion(false);
      setNewVersionData({ name: '', description: '', commitMessage: '', tags: '' });
    } catch (error) {
      alert(`Failed to create version: ${error}`);
    }
  };

  const handleRollback = async (versionId: string) => {
    if (!confirm('Are you sure you want to rollback to this version? This will create a new version based on the selected one.')) {
      return;
    }
    
    try {
      await rollbackToVersion(versionId);
      alert('Successfully rolled back to selected version');
    } catch (error) {
      alert(`Failed to rollback: ${error}`);
    }
  };

  const handleCompareVersions = async () => {
    if (selectedVersions.length !== 2) {
      alert('Please select exactly 2 versions to compare');
      return;
    }

    try {
      const result = await compareVersions(selectedVersions[0], selectedVersions[1]);
      setComparison(result);
      setShowCompareDialog(true);
    } catch (error) {
      alert(`Failed to compare versions: ${error}`);
    }
  };

  const handleExport = async () => {
    try {
      await createExport(exportConfig);
      setShowExportDialog(false);
      alert('Export started! Check the exports tab for progress.');
    } catch (error) {
      alert(`Failed to start export: ${error}`);
    }
  };

  const handleBackup = async (versionId: string) => {
    try {
      await createBackup(versionId, 'manual');
      alert('Backup created successfully');
    } catch (error) {
      alert(`Failed to create backup: ${error}`);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatFileSize = (sizeKB: number) => {
    if (sizeKB < 1024) return `${sizeKB.toFixed(1)} KB`;
    return `${(sizeKB / 1024).toFixed(1)} MB`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'processing': return 'text-blue-600 bg-blue-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const renderVersionsTab = () => (
    <div className="versions-tab">
      <div className="tab-header">
        <div className="header-info">
          <h3>Version History</h3>
          <p>Manage dashboard versions and rollback changes</p>
        </div>
        <div className="header-actions">
          <button 
            onClick={() => setShowCreateVersion(true)}
            className="btn-primary"
          >
            Create Version
          </button>
          <button 
            onClick={handleCompareVersions}
            className="btn-secondary"
            disabled={selectedVersions.length !== 2}
          >
            Compare Selected
          </button>
        </div>
      </div>

      {versionsError && (
        <div className="error-message">
          Error: {versionsError}
        </div>
      )}

      {loadingVersions ? (
        <div className="loading">Loading versions...</div>
      ) : (
        <div className="versions-list">
          {versions.map(version => (
            <div key={version.id} className={`version-card ${version.isActive ? 'active' : ''}`}>
              <div className="version-header">
                <div className="version-select">
                  <input
                    type="checkbox"
                    checked={selectedVersions.includes(version.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedVersions([...selectedVersions, version.id]);
                      } else {
                        setSelectedVersions(selectedVersions.filter(id => id !== version.id));
                      }
                    }}
                  />
                </div>
                <div className="version-info">
                  <div className="version-title">
                    <h4>{version.name}</h4>
                    <span className="version-number">v{version.version}</span>
                    {version.isActive && <span className="active-badge">CURRENT</span>}
                  </div>
                  <p className="version-description">{version.description}</p>
                  {version.commitMessage && (
                    <p className="commit-message">"{version.commitMessage}"</p>
                  )}
                </div>
                <div className="version-meta">
                  <div className="meta-item">
                    <span className="meta-label">Created</span>
                    <span className="meta-value">{formatDate(version.createdAt)}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Size</span>
                    <span className="meta-value">{formatFileSize(version.size)}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">By</span>
                    <span className="meta-value">{version.createdBy}</span>
                  </div>
                </div>
              </div>

              <div className="version-changes">
                <h5>Changes:</h5>
                <ul>
                  {version.changes.map((change, index) => (
                    <li key={index}>{change}</li>
                  ))}
                </ul>
              </div>

              <div className="version-tags">
                {version.tags.map(tag => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
              </div>

              <div className="version-actions">
                {!version.isActive && (
                  <button 
                    onClick={() => handleRollback(version.id)}
                    className="btn-secondary"
                  >
                    Rollback
                  </button>
                )}
                <button 
                  onClick={() => handleBackup(version.id)}
                  className="btn-secondary"
                >
                  Backup
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderBackupsTab = () => (
    <div className="backups-tab">
      <div className="tab-header">
        <div className="header-info">
          <h3>Backups</h3>
          <p>View and manage dashboard backups</p>
        </div>
        <div className="header-actions">
          <button 
            onClick={() => cleanupExpiredBackups()}
            className="btn-secondary"
          >
            Cleanup Expired
          </button>
        </div>
      </div>

      <div className="backups-list">
        {backups.map(backup => (
          <div key={backup.id} className="backup-card">
            <div className="backup-info">
              <h4>Backup #{backup.id.slice(-6)}</h4>
              <p>Version: {versions.find(v => v.id === backup.versionId)?.name || 'Unknown'}</p>
              <div className="backup-meta">
                <span className="backup-type">{backup.backupType}</span>
                <span className="backup-date">{formatDate(backup.createdAt)}</span>
                <span className="backup-size">{formatFileSize(backup.size)}</span>
                <span className="backup-retention">{backup.retentionDays}d retention</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderExportsTab = () => (
    <div className="exports-tab">
      <div className="tab-header">
        <div className="header-info">
          <h3>Exports</h3>
          <p>Export dashboard in various formats</p>
        </div>
        <div className="header-actions">
          <button 
            onClick={() => setShowExportDialog(true)}
            className="btn-primary"
          >
            New Export
          </button>
          <button 
            onClick={() => cleanupExpiredExports()}
            className="btn-secondary"
          >
            Cleanup Expired
          </button>
        </div>
      </div>

      {exportsError && (
        <div className="error-message">
          Error: {exportsError}
        </div>
      )}

      <div className="exports-list">
        {exportJobs.map(job => (
          <div key={job.id} className="export-card">
            <div className="export-info">
              <h4>Export #{job.id.slice(-6)}</h4>
              <p>Format: {job.config.format.toUpperCase()}</p>
              <div className="export-meta">
                <span className={`export-status ${getStatusColor(job.status)}`}>
                  {job.status}
                </span>
                <span className="export-date">{formatDate(job.createdAt)}</span>
                {job.fileSize && (
                  <span className="export-size">{formatFileSize(job.fileSize)}</span>
                )}
              </div>
            </div>

            {job.status === 'processing' && (
              <div className="export-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${job.progress}%` }}
                  />
                </div>
                <span className="progress-text">{job.progress}%</span>
              </div>
            )}

            {job.status === 'completed' && job.downloadUrl && (
              <div className="export-actions">
                <a 
                  href={job.downloadUrl} 
                  download 
                  className="btn-primary"
                >
                  Download
                </a>
              </div>
            )}

            {job.status === 'failed' && job.errorMessage && (
              <div className="export-error">
                Error: {job.errorMessage}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="dashboard-version-manager">
      <div className="manager-tabs">
        <button 
          className={`tab ${activeTab === 'versions' ? 'active' : ''}`}
          onClick={() => setActiveTab('versions')}
        >
          Versions ({versions.length})
        </button>
        <button 
          className={`tab ${activeTab === 'backups' ? 'active' : ''}`}
          onClick={() => setActiveTab('backups')}
        >
          Backups ({backups.length})
        </button>
        <button 
          className={`tab ${activeTab === 'exports' ? 'active' : ''}`}
          onClick={() => setActiveTab('exports')}
        >
          Exports ({exportJobs.length})
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'versions' && renderVersionsTab()}
        {activeTab === 'backups' && renderBackupsTab()}
        {activeTab === 'exports' && renderExportsTab()}
      </div>

      {/* Create Version Dialog */}
      {showCreateVersion && (
        <div className="dialog-overlay">
          <div className="dialog">
            <h3>Create New Version</h3>
            <div className="form-group">
              <label>Version Name</label>
              <input
                type="text"
                value={newVersionData.name}
                onChange={(e) => setNewVersionData({...newVersionData, name: e.target.value})}
                placeholder="e.g., Performance Improvements"
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={newVersionData.description}
                onChange={(e) => setNewVersionData({...newVersionData, description: e.target.value})}
                placeholder="Describe the changes in this version"
                rows={3}
              />
            </div>
            <div className="form-group">
              <label>Commit Message</label>
              <input
                type="text"
                value={newVersionData.commitMessage}
                onChange={(e) => setNewVersionData({...newVersionData, commitMessage: e.target.value})}
                placeholder="Brief commit message"
              />
            </div>
            <div className="form-group">
              <label>Tags (comma-separated)</label>
              <input
                type="text"
                value={newVersionData.tags}
                onChange={(e) => setNewVersionData({...newVersionData, tags: e.target.value})}
                placeholder="e.g., optimization, bugfix, feature"
              />
            </div>
            <div className="dialog-actions">
              <button onClick={() => setShowCreateVersion(false)}>Cancel</button>
              <button 
                onClick={handleCreateVersion}
                className="btn-primary"
                disabled={!newVersionData.name}
              >
                Create Version
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Dialog */}
      {showExportDialog && (
        <div className="dialog-overlay">
          <div className="dialog">
            <h3>Export Dashboard</h3>
            <div className="form-group">
              <label>Format</label>
              <select
                value={exportConfig.format}
                onChange={(e) => setExportConfig({...exportConfig, format: e.target.value as ExportConfig['format']})}
              >
                <option value="json">JSON</option>
                <option value="pdf">PDF</option>
                <option value="png">PNG Image</option>
                <option value="html">HTML</option>
                <option value="csv">CSV Data</option>
              </select>
            </div>
            <div className="form-group">
              <label>Options</label>
              <div className="checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={exportConfig.includeData}
                    onChange={(e) => setExportConfig({...exportConfig, includeData: e.target.checked})}
                  />
                  Include Data
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={exportConfig.includeVersionHistory}
                    onChange={(e) => setExportConfig({...exportConfig, includeVersionHistory: e.target.checked})}
                  />
                  Include Version History
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={exportConfig.includeSharing}
                    onChange={(e) => setExportConfig({...exportConfig, includeSharing: e.target.checked})}
                  />
                  Include Sharing Settings
                </label>
              </div>
            </div>
            <div className="form-group">
              <label>Compression</label>
              <select
                value={exportConfig.compressionLevel}
                onChange={(e) => setExportConfig({...exportConfig, compressionLevel: e.target.value as ExportConfig['compressionLevel']})}
              >
                <option value="none">None</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="dialog-actions">
              <button onClick={() => setShowExportDialog(false)}>Cancel</button>
              <button 
                onClick={handleExport}
                className="btn-primary"
              >
                Start Export
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Compare Versions Dialog */}
      {showCompareDialog && comparison && (
        <div className="dialog-overlay">
          <div className="dialog large">
            <h3>Version Comparison</h3>
            <div className="comparison-summary">
              <h4>Summary</h4>
              <div className="summary-stats">
                <div className="stat">
                  <span className="stat-value">{comparison.summary.widgetsAdded}</span>
                  <span className="stat-label">Widgets Added</span>
                </div>
                <div className="stat">
                  <span className="stat-value">{comparison.summary.widgetsRemoved}</span>
                  <span className="stat-label">Widgets Removed</span>
                </div>
                <div className="stat">
                  <span className="stat-value">{comparison.summary.widgetsModified}</span>
                  <span className="stat-label">Widgets Modified</span>
                </div>
                <div className="stat">
                  <span className="stat-value">{comparison.summary.layoutChanges}</span>
                  <span className="stat-label">Layout Changes</span>
                </div>
              </div>
            </div>
            <div className="comparison-changes">
              <h4>Detailed Changes</h4>
              <div className="changes-list">
                {comparison.changes.map((change, index) => (
                  <div key={index} className={`change-item ${change.type}`}>
                    <span className="change-type">{change.type}</span>
                    <span className="change-description">{change.description}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="dialog-actions">
              <button onClick={() => setShowCompareDialog(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .dashboard-version-manager {
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .manager-tabs {
          display: flex;
          border-bottom: 1px solid #e0e0e0;
        }

        .tab {
          flex: 1;
          padding: 12px 16px;
          border: none;
          background: #f5f5f5;
          cursor: pointer;
          font-weight: 500;
          color: #666;
          transition: all 0.2s;
        }

        .tab.active {
          background: white;
          color: #333;
          border-bottom: 2px solid #4CAF50;
        }

        .tab:hover:not(.active) {
          background: #e0e0e0;
        }

        .tab-content {
          padding: 24px;
        }

        .tab-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
        }

        .header-info h3 {
          margin: 0 0 4px 0;
          color: #333;
          font-size: 18px;
        }

        .header-info p {
          margin: 0;
          color: #666;
          font-size: 14px;
        }

        .header-actions {
          display: flex;
          gap: 8px;
        }

        .btn-primary {
          padding: 8px 16px;
          background: #4CAF50;
          color: white;
          border: none;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s;
        }

        .btn-primary:hover:not(:disabled) {
          background: #45a049;
        }

        .btn-primary:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .btn-secondary {
          padding: 8px 16px;
          background: #f5f5f5;
          color: #666;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s;
        }

        .btn-secondary:hover:not(:disabled) {
          background: #e0e0e0;
        }

        .btn-secondary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .error-message {
          background: #fee;
          color: #c33;
          padding: 12px;
          border-radius: 6px;
          margin-bottom: 16px;
        }

        .loading {
          text-align: center;
          padding: 48px;
          color: #666;
        }

        .versions-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .version-card {
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 16px;
          transition: border-color 0.2s;
        }

        .version-card.active {
          border-color: #4CAF50;
          background: #f9fff9;
        }

        .version-header {
          display: flex;
          gap: 16px;
          margin-bottom: 12px;
        }

        .version-select {
          flex-shrink: 0;
          padding-top: 2px;
        }

        .version-info {
          flex: 1;
        }

        .version-title {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 4px;
        }

        .version-title h4 {
          margin: 0;
          color: #333;
          font-size: 16px;
        }

        .version-number {
          background: #e0e0e0;
          color: #666;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }

        .active-badge {
          background: #4CAF50;
          color: white;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 600;
        }

        .version-description {
          margin: 0 0 4px 0;
          color: #666;
          font-size: 14px;
        }

        .commit-message {
          margin: 0;
          color: #888;
          font-size: 13px;
          font-style: italic;
        }

        .version-meta {
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          gap: 4px;
          text-align: right;
        }

        .meta-item {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .meta-label {
          font-size: 11px;
          color: #999;
          text-transform: uppercase;
        }

        .meta-value {
          font-size: 13px;
          color: #666;
          font-weight: 500;
        }

        .version-changes {
          margin: 12px 0;
        }

        .version-changes h5 {
          margin: 0 0 8px 0;
          color: #333;
          font-size: 14px;
        }

        .version-changes ul {
          margin: 0;
          padding-left: 20px;
        }

        .version-changes li {
          color: #666;
          font-size: 13px;
          margin-bottom: 2px;
        }

        .version-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin: 12px 0;
        }

        .tag {
          background: #f0f0f0;
          color: #666;
          padding: 2px 6px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 500;
        }

        .version-actions {
          display: flex;
          gap: 8px;
          margin-top: 12px;
        }

        .backups-list, .exports-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .backup-card, .export-card {
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 16px;
        }

        .backup-info h4, .export-info h4 {
          margin: 0 0 4px 0;
          color: #333;
          font-size: 16px;
        }

        .backup-meta, .export-meta {
          display: flex;
          gap: 16px;
          margin-top: 8px;
        }

        .backup-meta span, .export-meta span {
          font-size: 12px;
          color: #666;
          font-weight: 500;
        }

        .export-status {
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .export-progress {
          margin-top: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .progress-bar {
          flex: 1;
          height: 8px;
          background: #e0e0e0;
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: #4CAF50;
          transition: width 0.3s ease;
        }

        .progress-text {
          font-size: 12px;
          color: #666;
          font-weight: 500;
        }

        .export-actions {
          margin-top: 12px;
        }

        .export-error {
          margin-top: 8px;
          color: #c33;
          font-size: 13px;
        }

        .dialog-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .dialog {
          background: white;
          padding: 24px;
          border-radius: 12px;
          width: 500px;
          max-width: 90vw;
          max-height: 80vh;
          overflow-y: auto;
        }

        .dialog.large {
          width: 800px;
        }

        .dialog h3 {
          margin: 0 0 20px 0;
          color: #333;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-group label {
          display: block;
          margin-bottom: 6px;
          font-weight: 500;
          color: #555;
        }

        .form-group input, .form-group textarea, .form-group select {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
          box-sizing: border-box;
        }

        .checkbox-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .checkbox-group label {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 0;
        }

        .checkbox-group input[type="checkbox"] {
          width: auto;
          margin: 0;
        }

        .dialog-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 24px;
        }

        .comparison-summary {
          margin-bottom: 24px;
        }

        .summary-stats {
          display: flex;
          gap: 16px;
          margin-top: 12px;
        }

        .stat {
          text-align: center;
          padding: 12px;
          background: #f5f5f5;
          border-radius: 8px;
          flex: 1;
        }

        .stat-value {
          display: block;
          font-size: 24px;
          font-weight: 600;
          color: #333;
        }

        .stat-label {
          display: block;
          font-size: 12px;
          color: #666;
          margin-top: 4px;
        }

        .changes-list {
          max-height: 300px;
          overflow-y: auto;
        }

        .change-item {
          display: flex;
          gap: 12px;
          padding: 8px 12px;
          border-left: 3px solid #e0e0e0;
          margin-bottom: 8px;
        }

        .change-item.added {
          border-left-color: #4CAF50;
          background: #f9fff9;
        }

        .change-item.removed {
          border-left-color: #f44336;
          background: #fff9f9;
        }

        .change-item.modified {
          border-left-color: #ff9800;
          background: #fffbf0;
        }

        .change-type {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          color: #666;
          min-width: 60px;
        }

        .change-description {
          font-size: 13px;
          color: #333;
        }

        @media (max-width: 768px) {
          .tab-header {
            flex-direction: column;
            gap: 16px;
          }

          .header-actions {
            align-self: flex-start;
          }

          .version-header {
            flex-direction: column;
            gap: 12px;
          }

          .version-meta {
            flex-direction: row;
            gap: 16px;
            text-align: left;
          }

          .summary-stats {
            flex-direction: column;
            gap: 8px;
          }

          .dialog {
            width: 95vw;
            padding: 16px;
          }
        }
      `}</style>
    </div>
  );
};

export default DashboardVersionManager; 