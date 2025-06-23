import { useState, useEffect, useCallback } from 'react';
import { 
  automatedReportsService,
  ReportTemplate,
  ScheduledReport,
  AlertRule,
  ReportExecution,
  ReportArchive,
  CalendarIntegration,
  ReportPerformanceMetrics,
  ReportRecipient
} from '@/services/automatedReportsService';

interface UseAutomatedReportsState {
  templates: ReportTemplate[];
  scheduledReports: ScheduledReport[];
  alertRules: AlertRule[];
  executions: ReportExecution[];
  archives: ReportArchive[];
  calendarIntegrations: CalendarIntegration[];
  performanceMetrics: ReportPerformanceMetrics | null;
  loading: boolean;
  error: string | null;
  filters: {
    templateCategory: string;
    reportStatus: string;
    dateRange: { start: string; end: string } | null;
    format: string;
  };
  searchQuery: string;
  autoRefresh: boolean;
  refreshInterval: number;
}

interface UseAutomatedReportsReturn extends UseAutomatedReportsState {
  // Template Management
  loadTemplates: () => Promise<void>;
  createTemplate: (template: Omit<ReportTemplate, 'id' | 'createdAt' | 'updatedAt'>) => Promise<ReportTemplate>;
  updateTemplate: (id: string, updates: Partial<ReportTemplate>) => Promise<ReportTemplate>;
  deleteTemplate: (id: string) => Promise<void>;
  getTemplate: (id: string) => ReportTemplate | null;
  validateTemplate: (template: Partial<ReportTemplate>) => Promise<{ isValid: boolean; errors: string[]; warnings: string[] }>;
  
  // Scheduled Reports Management
  loadScheduledReports: () => Promise<void>;
  createScheduledReport: (report: Omit<ScheduledReport, 'id' | 'createdAt' | 'updatedAt' | 'nextRun'>) => Promise<ScheduledReport>;
  updateScheduledReport: (id: string, updates: Partial<ScheduledReport>) => Promise<ScheduledReport>;
  deleteScheduledReport: (id: string) => Promise<void>;
  toggleScheduledReport: (id: string) => Promise<void>;
  
  // Alert Rules Management
  loadAlertRules: () => Promise<void>;
  createAlertRule: (rule: Omit<AlertRule, 'id'>) => Promise<AlertRule>;
  updateAlertRule: (id: string, updates: Partial<AlertRule>) => Promise<AlertRule>;
  deleteAlertRule: (id: string) => Promise<void>;
  testAlert: (ruleId: string) => Promise<{ success: boolean; message: string }>;
  
  // Report Execution Management
  loadExecutions: () => Promise<void>;
  generateReport: (templateId: string, format?: 'pdf' | 'excel' | 'csv' | 'html') => Promise<ReportExecution>;
  getExecutionsByReport: (reportId: string) => ReportExecution[];
  
  // Archive Management
  loadArchives: () => Promise<void>;
  downloadArchive: (archiveId: string) => Promise<{ url: string; filename: string }>;
  deleteArchive: (archiveId: string) => Promise<void>;
  bulkDeleteArchives: (archiveIds: string[]) => Promise<{ deleted: number; failed: string[] }>;
  
  // Calendar Integration
  loadCalendarIntegrations: () => Promise<void>;
  connectCalendar: (type: 'google' | 'outlook' | 'ical') => Promise<CalendarIntegration>;
  
  // Performance Metrics
  loadPerformanceMetrics: () => Promise<void>;
  
  // Export and Reporting
  exportReport: (reportId: string, format: 'csv' | 'excel' | 'pdf') => Promise<void>;
  
  // Filtering and Search
  applyFilters: (newFilters: Partial<UseAutomatedReportsState['filters']>) => void;
  clearFilters: () => void;
  setSearchQuery: (query: string) => void;
  getFilteredTemplates: () => ReportTemplate[];
  getFilteredScheduledReports: () => ScheduledReport[];
  getFilteredArchives: () => ReportArchive[];
  
  // Utility Functions
  refresh: () => Promise<void>;
  setAutoRefresh: (enabled: boolean, interval?: number) => void;
  
  // Statistics and Computed Values
  getActiveSchedulesCount: () => number;
  getRecentExecutions: (limit?: number) => ReportExecution[];
  getTotalStorageUsed: () => number;
  getUpcomingReports: (days?: number) => ScheduledReport[];
}

export const useAutomatedReports = (): UseAutomatedReportsReturn => {
  const [state, setState] = useState<UseAutomatedReportsState>({
    templates: [],
    scheduledReports: [],
    alertRules: [],
    executions: [],
    archives: [],
    calendarIntegrations: [],
    performanceMetrics: null,
    loading: false,
    error: null,
    filters: {
      templateCategory: '',
      reportStatus: '',
      dateRange: null,
      format: ''
    },
    searchQuery: '',
    autoRefresh: false,
    refreshInterval: 30000
  });

  // Auto-refresh effect
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    if (state.autoRefresh) {
      intervalId = setInterval(() => {
        refresh();
      }, state.refreshInterval);
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [state.autoRefresh, state.refreshInterval]);

  // Template Management
  const loadTemplates = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const templates = await automatedReportsService.getTemplates();
      setState(prev => ({ ...prev, templates, loading: false }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to load templates',
        loading: false 
      }));
    }
  }, []);

  const createTemplate = useCallback(async (template: Omit<ReportTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const newTemplate = await automatedReportsService.createTemplate(template);
      setState(prev => ({ 
        ...prev, 
        templates: [...prev.templates, newTemplate],
        loading: false 
      }));
      return newTemplate;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to create template',
        loading: false 
      }));
      throw error;
    }
  }, []);

  const updateTemplate = useCallback(async (id: string, updates: Partial<ReportTemplate>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const updatedTemplate = await automatedReportsService.updateTemplate(id, updates);
      setState(prev => ({ 
        ...prev, 
        templates: prev.templates.map(t => t.id === id ? updatedTemplate : t),
        loading: false 
      }));
      return updatedTemplate;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to update template',
        loading: false 
      }));
      throw error;
    }
  }, []);

  const deleteTemplate = useCallback(async (id: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      await automatedReportsService.deleteTemplate(id);
      setState(prev => ({ 
        ...prev, 
        templates: prev.templates.filter(t => t.id !== id),
        loading: false 
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to delete template',
        loading: false 
      }));
    }
  }, []);

  const getTemplate = useCallback((id: string): ReportTemplate | null => {
    return state.templates.find(t => t.id === id) || null;
  }, [state.templates]);

  const validateTemplate = useCallback(async (template: Partial<ReportTemplate>) => {
    return await automatedReportsService.validateTemplate(template);
  }, []);

  // Scheduled Reports Management
  const loadScheduledReports = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const scheduledReports = await automatedReportsService.getScheduledReports();
      setState(prev => ({ ...prev, scheduledReports, loading: false }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to load scheduled reports',
        loading: false 
      }));
    }
  }, []);

  const createScheduledReport = useCallback(async (report: Omit<ScheduledReport, 'id' | 'createdAt' | 'updatedAt' | 'nextRun'>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const newReport = await automatedReportsService.createScheduledReport(report);
      setState(prev => ({ 
        ...prev, 
        scheduledReports: [...prev.scheduledReports, newReport],
        loading: false 
      }));
      return newReport;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to create scheduled report',
        loading: false 
      }));
      throw error;
    }
  }, []);

  const updateScheduledReport = useCallback(async (id: string, updates: Partial<ScheduledReport>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const updatedReport = await automatedReportsService.updateScheduledReport(id, updates);
      setState(prev => ({ 
        ...prev, 
        scheduledReports: prev.scheduledReports.map(r => r.id === id ? updatedReport : r),
        loading: false 
      }));
      return updatedReport;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to update scheduled report',
        loading: false 
      }));
      throw error;
    }
  }, []);

  const deleteScheduledReport = useCallback(async (id: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      await automatedReportsService.deleteScheduledReport(id);
      setState(prev => ({ 
        ...prev, 
        scheduledReports: prev.scheduledReports.filter(r => r.id !== id),
        loading: false 
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to delete scheduled report',
        loading: false 
      }));
    }
  }, []);

  const toggleScheduledReport = useCallback(async (id: string) => {
    const report = state.scheduledReports.find(r => r.id === id);
    if (report) {
      await updateScheduledReport(id, { isActive: !report.isActive });
    }
  }, [state.scheduledReports, updateScheduledReport]);

  // Alert Rules Management
  const loadAlertRules = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const alertRules = await automatedReportsService.getAlertRules();
      setState(prev => ({ ...prev, alertRules, loading: false }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to load alert rules',
        loading: false 
      }));
    }
  }, []);

  const createAlertRule = useCallback(async (rule: Omit<AlertRule, 'id'>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const newRule = await automatedReportsService.createAlertRule(rule);
      setState(prev => ({ 
        ...prev, 
        alertRules: [...prev.alertRules, newRule],
        loading: false 
      }));
      return newRule;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to create alert rule',
        loading: false 
      }));
      throw error;
    }
  }, []);

  const updateAlertRule = useCallback(async (id: string, updates: Partial<AlertRule>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const updatedRule = await automatedReportsService.updateAlertRule(id, updates);
      setState(prev => ({ 
        ...prev, 
        alertRules: prev.alertRules.map(r => r.id === id ? updatedRule : r),
        loading: false 
      }));
      return updatedRule;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to update alert rule',
        loading: false 
      }));
      throw error;
    }
  }, []);

  const deleteAlertRule = useCallback(async (id: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      await automatedReportsService.deleteAlertRule(id);
      setState(prev => ({ 
        ...prev, 
        alertRules: prev.alertRules.filter(r => r.id !== id),
        loading: false 
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to delete alert rule',
        loading: false 
      }));
    }
  }, []);

  const testAlert = useCallback(async (ruleId: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await automatedReportsService.testAlert(ruleId);
      setState(prev => ({ ...prev, loading: false }));
      return result;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to test alert',
        loading: false 
      }));
      throw error;
    }
  }, []);

  // Report Execution Management
  const loadExecutions = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const executions = await automatedReportsService.getReportExecutions();
      setState(prev => ({ ...prev, executions, loading: false }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to load executions',
        loading: false 
      }));
    }
  }, []);

  const generateReport = useCallback(async (templateId: string, format: 'pdf' | 'excel' | 'csv' | 'html' = 'pdf') => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const execution = await automatedReportsService.generateReport(templateId, format);
      setState(prev => ({ 
        ...prev, 
        executions: [execution, ...prev.executions],
        loading: false 
      }));
      return execution;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to generate report',
        loading: false 
      }));
      throw error;
    }
  }, []);

  const getExecutionsByReport = useCallback((reportId: string): ReportExecution[] => {
    return state.executions.filter(e => e.reportId === reportId);
  }, [state.executions]);

  // Archive Management
  const loadArchives = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const archives = await automatedReportsService.getReportArchives(state.filters.dateRange ? {
        dateRange: state.filters.dateRange,
        format: state.filters.format || undefined
      } : undefined);
      setState(prev => ({ ...prev, archives, loading: false }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to load archives',
        loading: false 
      }));
    }
  }, [state.filters.dateRange, state.filters.format]);

  const downloadArchive = useCallback(async (archiveId: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await automatedReportsService.downloadArchive(archiveId);
      setState(prev => ({ ...prev, loading: false }));
      
      // Trigger download
      const link = document.createElement('a');
      link.href = result.url;
      link.download = result.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      return result;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to download archive',
        loading: false 
      }));
      throw error;
    }
  }, []);

  const deleteArchive = useCallback(async (archiveId: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      await automatedReportsService.deleteArchive(archiveId);
      setState(prev => ({ 
        ...prev, 
        archives: prev.archives.filter(a => a.id !== archiveId),
        loading: false 
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to delete archive',
        loading: false 
      }));
    }
  }, []);

  const bulkDeleteArchives = useCallback(async (archiveIds: string[]) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await automatedReportsService.bulkDeleteArchives(archiveIds);
      setState(prev => ({ 
        ...prev, 
        archives: prev.archives.filter(a => !archiveIds.includes(a.id)),
        loading: false 
      }));
      return result;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to delete archives',
        loading: false 
      }));
      throw error;
    }
  }, []);

  // Calendar Integration
  const loadCalendarIntegrations = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const integrations = await automatedReportsService.getCalendarIntegrations();
      setState(prev => ({ ...prev, calendarIntegrations: integrations, loading: false }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to load calendar integrations',
        loading: false 
      }));
    }
  }, []);

  const connectCalendar = useCallback(async (type: 'google' | 'outlook' | 'ical') => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const integration = await automatedReportsService.connectCalendar(type);
      setState(prev => ({ 
        ...prev, 
        calendarIntegrations: [...prev.calendarIntegrations, integration],
        loading: false 
      }));
      return integration;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to connect calendar',
        loading: false 
      }));
      throw error;
    }
  }, []);

  // Performance Metrics
  const loadPerformanceMetrics = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const metrics = await automatedReportsService.getPerformanceMetrics();
      setState(prev => ({ ...prev, performanceMetrics: metrics, loading: false }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to load performance metrics',
        loading: false 
      }));
    }
  }, []);

  // Export and Reporting
  const exportReport = useCallback(async (reportId: string, format: 'csv' | 'excel' | 'pdf') => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await automatedReportsService.exportReport(reportId, format);
      
      // Create and trigger download
      const blob = new Blob([JSON.stringify(result.data)], { type: result.mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = result.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setState(prev => ({ ...prev, loading: false }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to export report',
        loading: false 
      }));
    }
  }, []);

  // Filtering and Search
  const applyFilters = useCallback((newFilters: Partial<UseAutomatedReportsState['filters']>) => {
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, ...newFilters }
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setState(prev => ({
      ...prev,
      filters: {
        templateCategory: '',
        reportStatus: '',
        dateRange: null,
        format: ''
      }
    }));
  }, []);

  const setSearchQuery = useCallback((query: string) => {
    setState(prev => ({ ...prev, searchQuery: query }));
  }, []);

  const getFilteredTemplates = useCallback((): ReportTemplate[] => {
    let filtered = state.templates;
    
    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase();
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(query) ||
        template.description.toLowerCase().includes(query)
      );
    }
    
    if (state.filters.templateCategory) {
      filtered = filtered.filter(template => template.category === state.filters.templateCategory);
    }
    
    return filtered;
  }, [state.templates, state.searchQuery, state.filters.templateCategory]);

  const getFilteredScheduledReports = useCallback((): ScheduledReport[] => {
    let filtered = state.scheduledReports;
    
    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase();
      filtered = filtered.filter(report =>
        report.name.toLowerCase().includes(query) ||
        report.description.toLowerCase().includes(query)
      );
    }
    
    if (state.filters.reportStatus === 'active') {
      filtered = filtered.filter(report => report.isActive);
    } else if (state.filters.reportStatus === 'inactive') {
      filtered = filtered.filter(report => !report.isActive);
    }
    
    return filtered;
  }, [state.scheduledReports, state.searchQuery, state.filters.reportStatus]);

  const getFilteredArchives = useCallback((): ReportArchive[] => {
    let filtered = state.archives;
    
    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase();
      filtered = filtered.filter(archive =>
        archive.templateName.toLowerCase().includes(query) ||
        archive.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    if (state.filters.format) {
      filtered = filtered.filter(archive => archive.format === state.filters.format);
    }
    
    return filtered;
  }, [state.archives, state.searchQuery, state.filters.format]);

  // Utility Functions
  const refresh = useCallback(async () => {
    await Promise.all([
      loadTemplates(),
      loadScheduledReports(),
      loadAlertRules(),
      loadExecutions(),
      loadArchives(),
      loadPerformanceMetrics(),
      loadCalendarIntegrations()
    ]);
  }, [
    loadTemplates,
    loadScheduledReports,
    loadAlertRules,
    loadExecutions,
    loadArchives,
    loadPerformanceMetrics,
    loadCalendarIntegrations
  ]);

  const setAutoRefresh = useCallback((enabled: boolean, interval: number = 30000) => {
    setState(prev => ({ 
      ...prev, 
      autoRefresh: enabled, 
      refreshInterval: interval 
    }));
  }, []);

  // Statistics and Computed Values
  const getActiveSchedulesCount = useCallback(() => {
    return state.scheduledReports.filter(r => r.isActive).length;
  }, [state.scheduledReports]);

  const getRecentExecutions = useCallback((limit: number = 10): ReportExecution[] => {
    return state.executions
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
      .slice(0, limit);
  }, [state.executions]);

  const getTotalStorageUsed = useCallback(() => {
    return state.archives.reduce((total, archive) => total + archive.fileSize, 0);
  }, [state.archives]);

  const getUpcomingReports = useCallback((days: number = 7): ScheduledReport[] => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + days);
    
    return state.scheduledReports.filter(report => 
      report.isActive && new Date(report.nextRun) <= cutoffDate
    );
  }, [state.scheduledReports]);

  // Load initial data
  useEffect(() => {
    refresh();
  }, []);

  return {
    ...state,
    loadTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    getTemplate,
    validateTemplate,
    loadScheduledReports,
    createScheduledReport,
    updateScheduledReport,
    deleteScheduledReport,
    toggleScheduledReport,
    loadAlertRules,
    createAlertRule,
    updateAlertRule,
    deleteAlertRule,
    testAlert,
    loadExecutions,
    generateReport,
    getExecutionsByReport,
    loadArchives,
    downloadArchive,
    deleteArchive,
    bulkDeleteArchives,
    loadCalendarIntegrations,
    connectCalendar,
    loadPerformanceMetrics,
    exportReport,
    applyFilters,
    clearFilters,
    setSearchQuery,
    getFilteredTemplates,
    getFilteredScheduledReports,
    getFilteredArchives,
    refresh,
    setAutoRefresh,
    getActiveSchedulesCount,
    getRecentExecutions,
    getTotalStorageUsed,
    getUpcomingReports
  };
};