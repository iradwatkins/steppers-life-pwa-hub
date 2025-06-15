import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import {
  automatedReportsService,
  ReportTemplate,
  ScheduledReport,
  AlertRule,
  ReportExecution,
  ReportArchive,
  ReportPerformanceMetrics,
  CalendarIntegration
} from '../services/automatedReportsService';

interface AutomatedReportsState {
  // Templates
  templates: ReportTemplate[];
  selectedTemplate: ReportTemplate | null;
  
  // Scheduled Reports
  scheduledReports: ScheduledReport[];
  selectedReport: ScheduledReport | null;
  
  // Executions
  executions: ReportExecution[];
  runningExecutions: ReportExecution[];
  
  // Alerts
  alerts: AlertRule[];
  triggeredAlerts: AlertRule[];
  
  // Archives
  archives: ReportArchive[];
  
  // Performance Metrics
  systemMetrics: {
    totalReports: number;
    activeReports: number;
    executionsToday: number;
    successRate: number;
    averageGenerationTime: number;
    storageUsed: number;
  } | null;
  reportMetrics: Record<string, ReportPerformanceMetrics>;
  
  // Calendar Integration
  calendarIntegrations: Record<string, CalendarIntegration>;
  
  // UI State
  loading: boolean;
  error: string | null;
  templatesLoading: boolean;
  reportsLoading: boolean;
  executionsLoading: boolean;
  alertsLoading: boolean;
  archivesLoading: boolean;
  exportLoading: boolean;
  
  // Filters and Search
  filters: {
    templateCategory: string;
    reportStatus: string;
    executionStatus: string;
    alertStatus: string;
    dateRange: {
      start: string;
      end: string;
    };
  };
  searchTerm: string;
  
  // Real-time Updates
  lastRefresh: string | null;
  autoRefresh: boolean;
  refreshInterval: number; // minutes
}

interface UseAutomatedReportsReturn {
  // State
  state: AutomatedReportsState;
  
  // Template Management
  createTemplate: (template: Omit<ReportTemplate, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTemplate: (templateId: string, updates: Partial<ReportTemplate>) => Promise<void>;
  deleteTemplate: (templateId: string) => Promise<void>;
  selectTemplate: (template: ReportTemplate | null) => void;
  getTemplate: (templateId: string) => Promise<ReportTemplate | null>;
  duplicateTemplate: (templateId: string, newName: string) => Promise<void>;
  
  // Scheduled Report Management
  createScheduledReport: (report: Omit<ScheduledReport, 'id' | 'createdAt' | 'nextRun'>) => Promise<void>;
  updateScheduledReport: (reportId: string, updates: Partial<ScheduledReport>) => Promise<void>;
  deleteScheduledReport: (reportId: string) => Promise<void>;
  selectReport: (report: ScheduledReport | null) => void;
  pauseReport: (reportId: string) => Promise<void>;
  resumeReport: (reportId: string) => Promise<void>;
  
  // Report Execution
  executeReport: (reportId: string, manual?: boolean) => Promise<void>;
  cancelExecution: (executionId: string) => Promise<void>;
  getReportExecutions: (reportId: string) => Promise<void>;
  retryExecution: (executionId: string) => Promise<void>;
  
  // Alert Management
  createAlert: (alert: Omit<AlertRule, 'id' | 'createdAt' | 'triggerCount'>) => Promise<void>;
  updateAlert: (alertId: string, updates: Partial<AlertRule>) => Promise<void>;
  deleteAlert: (alertId: string) => Promise<void>;
  enableAlert: (alertId: string) => Promise<void>;
  disableAlert: (alertId: string) => Promise<void>;
  checkAlerts: () => Promise<void>;
  acknowledgeAlert: (alertId: string) => Promise<void>;
  
  // Archive Management
  downloadArchive: (archiveId: string) => Promise<void>;
  deleteArchive: (archiveId: string) => Promise<void>;
  getArchivesByReport: (reportId: string) => ReportArchive[];
  
  // Calendar Integration
  createCalendarIntegration: (integration: CalendarIntegration) => Promise<void>;
  syncCalendar: (reportId: string) => Promise<void>;
  
  // Export Functions
  exportReportData: (reportId: string, format: 'CSV' | 'Excel' | 'JSON') => Promise<void>;
  exportTemplates: (format: 'JSON' | 'CSV') => Promise<void>;
  exportScheduledReports: (format: 'JSON' | 'CSV') => Promise<void>;
  
  // Performance Monitoring
  getReportPerformanceMetrics: (reportId: string) => Promise<void>;
  refreshSystemMetrics: () => Promise<void>;
  
  // Filters and Search
  updateFilters: (filters: Partial<AutomatedReportsState['filters']>) => void;
  updateSearchTerm: (term: string) => void;
  resetFilters: () => void;
  
  // Data Refresh
  refreshData: () => Promise<void>;
  toggleAutoRefresh: () => void;
  setRefreshInterval: (minutes: number) => void;
  
  // Computed Values
  filteredTemplates: ReportTemplate[];
  filteredReports: ScheduledReport[];
  filteredExecutions: ReportExecution[];
  filteredAlerts: AlertRule[];
  filteredArchives: ReportArchive[];
  
  // Statistics
  executionStats: {
    total: number;
    completed: number;
    failed: number;
    running: number;
    successRate: number;
  };
  alertStats: {
    total: number;
    active: number;
    triggered: number;
    critical: number;
  };
  
  // Utilities
  getTemplateById: (templateId: string) => ReportTemplate | null;
  getReportById: (reportId: string) => ScheduledReport | null;
  getExecutionById: (executionId: string) => ReportExecution | null;
  getAlertById: (alertId: string) => AlertRule | null;
  isReportActive: (reportId: string) => boolean;
  hasRunningExecutions: boolean;
  nextScheduledRun: ScheduledReport | null;
}

const DEFAULT_FILTERS: AutomatedReportsState['filters'] = {
  templateCategory: '',
  reportStatus: '',
  executionStatus: '',
  alertStatus: '',
  dateRange: {
    start: '',
    end: ''
  }
};

export const useAutomatedReports = (): UseAutomatedReportsReturn => {
  const [state, setState] = useState<AutomatedReportsState>({
    templates: [],
    selectedTemplate: null,
    scheduledReports: [],
    selectedReport: null,
    executions: [],
    runningExecutions: [],
    alerts: [],
    triggeredAlerts: [],
    archives: [],
    systemMetrics: null,
    reportMetrics: {},
    calendarIntegrations: {},
    
    loading: false,
    error: null,
    templatesLoading: false,
    reportsLoading: false,
    executionsLoading: false,
    alertsLoading: false,
    archivesLoading: false,
    exportLoading: false,
    
    filters: DEFAULT_FILTERS,
    searchTerm: '',
    
    lastRefresh: null,
    autoRefresh: false,
    refreshInterval: 5
  });

  // Helper function to update state
  const updateState = useCallback((updates: Partial<AutomatedReportsState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Helper function to handle errors
  const handleError = useCallback((error: any, operation: string) => {
    console.error(`Error in ${operation}:`, error);
    const errorMessage = error?.message || `Failed to ${operation}`;
    updateState({ error: errorMessage, loading: false });
    toast.error(errorMessage);
  }, [updateState]);

  // Template Management
  const createTemplate = useCallback(async (template: Omit<ReportTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
    updateState({ templatesLoading: true, error: null });
    
    try {
      const newTemplate = await automatedReportsService.createTemplate(template);
      updateState({
        templates: [...state.templates, newTemplate],
        templatesLoading: false
      });
      toast.success('Template created successfully');
    } catch (error) {
      updateState({ templatesLoading: false });
      handleError(error, 'create template');
    }
  }, [state.templates, updateState, handleError]);

  const updateTemplate = useCallback(async (templateId: string, updates: Partial<ReportTemplate>) => {
    updateState({ templatesLoading: true, error: null });
    
    try {
      const updatedTemplate = await automatedReportsService.updateTemplate(templateId, updates);
      updateState({
        templates: state.templates.map(t => t.id === templateId ? updatedTemplate : t),
        selectedTemplate: state.selectedTemplate?.id === templateId ? updatedTemplate : state.selectedTemplate,
        templatesLoading: false
      });
      toast.success('Template updated successfully');
    } catch (error) {
      updateState({ templatesLoading: false });
      handleError(error, 'update template');
    }
  }, [state.templates, state.selectedTemplate, updateState, handleError]);

  const deleteTemplate = useCallback(async (templateId: string) => {
    updateState({ templatesLoading: true, error: null });
    
    try {
      await automatedReportsService.deleteTemplate(templateId);
      updateState({
        templates: state.templates.filter(t => t.id !== templateId),
        selectedTemplate: state.selectedTemplate?.id === templateId ? null : state.selectedTemplate,
        templatesLoading: false
      });
      toast.success('Template deleted successfully');
    } catch (error) {
      updateState({ templatesLoading: false });
      handleError(error, 'delete template');
    }
  }, [state.templates, state.selectedTemplate, updateState, handleError]);

  const selectTemplate = useCallback((template: ReportTemplate | null) => {
    updateState({ selectedTemplate: template });
  }, [updateState]);

  const getTemplate = useCallback(async (templateId: string): Promise<ReportTemplate | null> => {
    try {
      const template = await automatedReportsService.getTemplate(templateId);
      return template;
    } catch (error) {
      handleError(error, 'get template');
      return null;
    }
  }, [handleError]);

  const duplicateTemplate = useCallback(async (templateId: string, newName: string) => {
    const original = state.templates.find(t => t.id === templateId);
    if (!original) {
      toast.error('Template not found');
      return;
    }

    const duplicate = {
      ...original,
      name: newName,
      description: `Copy of ${original.description}`
    };

    // Remove the id and timestamps to create a new template
    const { id, createdAt, updatedAt, ...templateData } = duplicate;
    await createTemplate(templateData);
  }, [state.templates, createTemplate]);

  // Scheduled Report Management
  const createScheduledReport = useCallback(async (report: Omit<ScheduledReport, 'id' | 'createdAt' | 'nextRun'>) => {
    updateState({ reportsLoading: true, error: null });
    
    try {
      const newReport = await automatedReportsService.createScheduledReport(report);
      updateState({
        scheduledReports: [...state.scheduledReports, newReport],
        reportsLoading: false
      });
      toast.success('Scheduled report created successfully');
    } catch (error) {
      updateState({ reportsLoading: false });
      handleError(error, 'create scheduled report');
    }
  }, [state.scheduledReports, updateState, handleError]);

  const updateScheduledReport = useCallback(async (reportId: string, updates: Partial<ScheduledReport>) => {
    updateState({ reportsLoading: true, error: null });
    
    try {
      const updatedReport = await automatedReportsService.updateScheduledReport(reportId, updates);
      updateState({
        scheduledReports: state.scheduledReports.map(r => r.id === reportId ? updatedReport : r),
        selectedReport: state.selectedReport?.id === reportId ? updatedReport : state.selectedReport,
        reportsLoading: false
      });
      toast.success('Scheduled report updated successfully');
    } catch (error) {
      updateState({ reportsLoading: false });
      handleError(error, 'update scheduled report');
    }
  }, [state.scheduledReports, state.selectedReport, updateState, handleError]);

  const deleteScheduledReport = useCallback(async (reportId: string) => {
    updateState({ reportsLoading: true, error: null });
    
    try {
      await automatedReportsService.deleteScheduledReport(reportId);
      updateState({
        scheduledReports: state.scheduledReports.filter(r => r.id !== reportId),
        selectedReport: state.selectedReport?.id === reportId ? null : state.selectedReport,
        reportsLoading: false
      });
      toast.success('Scheduled report deleted successfully');
    } catch (error) {
      updateState({ reportsLoading: false });
      handleError(error, 'delete scheduled report');
    }
  }, [state.scheduledReports, state.selectedReport, updateState, handleError]);

  const selectReport = useCallback((report: ScheduledReport | null) => {
    updateState({ selectedReport: report });
  }, [updateState]);

  const pauseReport = useCallback(async (reportId: string) => {
    await updateScheduledReport(reportId, { 
      schedule: { 
        ...state.scheduledReports.find(r => r.id === reportId)!.schedule, 
        enabled: false 
      },
      status: 'paused'
    });
    toast.success('Report paused successfully');
  }, [updateScheduledReport, state.scheduledReports]);

  const resumeReport = useCallback(async (reportId: string) => {
    await updateScheduledReport(reportId, { 
      schedule: { 
        ...state.scheduledReports.find(r => r.id === reportId)!.schedule, 
        enabled: true 
      },
      status: 'active'
    });
    toast.success('Report resumed successfully');
  }, [updateScheduledReport, state.scheduledReports]);

  // Report Execution
  const executeReport = useCallback(async (reportId: string, manual = false) => {
    updateState({ executionsLoading: true, error: null });
    
    try {
      const execution = await automatedReportsService.executeReport(reportId, manual);
      updateState({
        executions: [execution, ...state.executions],
        runningExecutions: [...state.runningExecutions, execution],
        executionsLoading: false
      });
      toast.success(manual ? 'Manual report execution started' : 'Report execution started');
    } catch (error) {
      updateState({ executionsLoading: false });
      handleError(error, 'execute report');
    }
  }, [state.executions, state.runningExecutions, updateState, handleError]);

  const cancelExecution = useCallback(async (executionId: string) => {
    try {
      await automatedReportsService.cancelExecution(executionId);
      updateState({
        executions: state.executions.map(e => 
          e.id === executionId ? { ...e, status: 'cancelled' as const } : e
        ),
        runningExecutions: state.runningExecutions.filter(e => e.id !== executionId)
      });
      toast.success('Execution cancelled successfully');
    } catch (error) {
      handleError(error, 'cancel execution');
    }
  }, [state.executions, state.runningExecutions, updateState, handleError]);

  const getReportExecutions = useCallback(async (reportId: string) => {
    updateState({ executionsLoading: true, error: null });
    
    try {
      const executions = await automatedReportsService.getReportExecutions(reportId);
      updateState({
        executions: executions,
        runningExecutions: executions.filter(e => e.status === 'running'),
        executionsLoading: false
      });
    } catch (error) {
      updateState({ executionsLoading: false });
      handleError(error, 'get report executions');
    }
  }, [updateState, handleError]);

  const retryExecution = useCallback(async (executionId: string) => {
    const execution = state.executions.find(e => e.id === executionId);
    if (execution) {
      await executeReport(execution.reportId, true);
    }
  }, [state.executions, executeReport]);

  // Alert Management
  const createAlert = useCallback(async (alert: Omit<AlertRule, 'id' | 'createdAt' | 'triggerCount'>) => {
    updateState({ alertsLoading: true, error: null });
    
    try {
      const newAlert = await automatedReportsService.createAlert(alert);
      updateState({
        alerts: [...state.alerts, newAlert],
        alertsLoading: false
      });
      toast.success('Alert created successfully');
    } catch (error) {
      updateState({ alertsLoading: false });
      handleError(error, 'create alert');
    }
  }, [state.alerts, updateState, handleError]);

  const updateAlert = useCallback(async (alertId: string, updates: Partial<AlertRule>) => {
    updateState({ alertsLoading: true, error: null });
    
    try {
      const updatedAlert = await automatedReportsService.updateAlert(alertId, updates);
      updateState({
        alerts: state.alerts.map(a => a.id === alertId ? updatedAlert : a),
        alertsLoading: false
      });
      toast.success('Alert updated successfully');
    } catch (error) {
      updateState({ alertsLoading: false });
      handleError(error, 'update alert');
    }
  }, [state.alerts, updateState, handleError]);

  const deleteAlert = useCallback(async (alertId: string) => {
    updateState({ alertsLoading: true, error: null });
    
    try {
      await automatedReportsService.deleteAlert(alertId);
      updateState({
        alerts: state.alerts.filter(a => a.id !== alertId),
        alertsLoading: false
      });
      toast.success('Alert deleted successfully');
    } catch (error) {
      updateState({ alertsLoading: false });
      handleError(error, 'delete alert');
    }
  }, [state.alerts, updateState, handleError]);

  const enableAlert = useCallback(async (alertId: string) => {
    await updateAlert(alertId, { enabled: true });
  }, [updateAlert]);

  const disableAlert = useCallback(async (alertId: string) => {
    await updateAlert(alertId, { enabled: false });
  }, [updateAlert]);

  const checkAlerts = useCallback(async () => {
    try {
      const { triggeredAlerts, notifications } = await automatedReportsService.checkAlerts();
      updateState({ triggeredAlerts });
      
      // Show notifications for triggered alerts
      notifications.forEach(notification => {
        toast.error(notification.message, {
          duration: notification.urgency === 'critical' ? 10000 : 5000
        });
      });
    } catch (error) {
      handleError(error, 'check alerts');
    }
  }, [updateState, handleError]);

  const acknowledgeAlert = useCallback(async (alertId: string) => {
    updateState({
      triggeredAlerts: state.triggeredAlerts.filter(a => a.id !== alertId)
    });
    toast.success('Alert acknowledged');
  }, [state.triggeredAlerts, updateState]);

  // Archive Management
  const downloadArchive = useCallback(async (archiveId: string) => {
    updateState({ exportLoading: true });
    
    try {
      const blob = await automatedReportsService.downloadArchive(archiveId);
      const archive = state.archives.find(a => a.id === archiveId);
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = archive?.fileName || `archive_${archiveId}`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      updateState({ exportLoading: false });
      toast.success('Archive downloaded successfully');
    } catch (error) {
      updateState({ exportLoading: false });
      handleError(error, 'download archive');
    }
  }, [state.archives, updateState, handleError]);

  const deleteArchive = useCallback(async (archiveId: string) => {
    try {
      await automatedReportsService.deleteArchive(archiveId);
      updateState({
        archives: state.archives.filter(a => a.id !== archiveId)
      });
      toast.success('Archive deleted successfully');
    } catch (error) {
      handleError(error, 'delete archive');
    }
  }, [state.archives, updateState, handleError]);

  const getArchivesByReport = useCallback((reportId: string): ReportArchive[] => {
    return state.archives.filter(archive => archive.reportId === reportId);
  }, [state.archives]);

  // Calendar Integration
  const createCalendarIntegration = useCallback(async (integration: CalendarIntegration) => {
    try {
      await automatedReportsService.createCalendarIntegration(integration);
      updateState({
        calendarIntegrations: {
          ...state.calendarIntegrations,
          [integration.reportId]: integration
        }
      });
      toast.success('Calendar integration created successfully');
    } catch (error) {
      handleError(error, 'create calendar integration');
    }
  }, [state.calendarIntegrations, updateState, handleError]);

  const syncCalendar = useCallback(async (reportId: string) => {
    try {
      await automatedReportsService.syncCalendar(reportId);
      toast.success('Calendar synchronized successfully');
    } catch (error) {
      handleError(error, 'sync calendar');
    }
  }, [handleError]);

  // Export Functions
  const exportReportData = useCallback(async (reportId: string, format: 'CSV' | 'Excel' | 'JSON') => {
    updateState({ exportLoading: true });
    
    try {
      const blob = await automatedReportsService.exportReportData(reportId, format);
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `report_${reportId}.${format.toLowerCase()}`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      updateState({ exportLoading: false });
      toast.success(`Report data exported as ${format}`);
    } catch (error) {
      updateState({ exportLoading: false });
      handleError(error, 'export report data');
    }
  }, [updateState, handleError]);

  const exportTemplates = useCallback(async (format: 'JSON' | 'CSV') => {
    updateState({ exportLoading: true });
    
    try {
      const data = format === 'JSON' 
        ? JSON.stringify(state.templates, null, 2)
        : 'Name,Category,Format,Created\n' + state.templates.map(t => 
            `"${t.name}","${t.category}","${t.format}","${t.createdAt}"`
          ).join('\n');
      
      const blob = new Blob([data], { 
        type: format === 'JSON' ? 'application/json' : 'text/csv' 
      });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `templates.${format.toLowerCase()}`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      updateState({ exportLoading: false });
      toast.success(`Templates exported as ${format}`);
    } catch (error) {
      updateState({ exportLoading: false });
      handleError(error, 'export templates');
    }
  }, [state.templates, updateState, handleError]);

  const exportScheduledReports = useCallback(async (format: 'JSON' | 'CSV') => {
    updateState({ exportLoading: true });
    
    try {
      const data = format === 'JSON' 
        ? JSON.stringify(state.scheduledReports, null, 2)
        : 'Name,Status,Frequency,Next Run\n' + state.scheduledReports.map(r => 
            `"${r.name}","${r.status}","${r.schedule.frequency}","${r.nextRun}"`
          ).join('\n');
      
      const blob = new Blob([data], { 
        type: format === 'JSON' ? 'application/json' : 'text/csv' 
      });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `scheduled_reports.${format.toLowerCase()}`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      updateState({ exportLoading: false });
      toast.success(`Scheduled reports exported as ${format}`);
    } catch (error) {
      updateState({ exportLoading: false });
      handleError(error, 'export scheduled reports');
    }
  }, [state.scheduledReports, updateState, handleError]);

  // Performance Monitoring
  const getReportPerformanceMetrics = useCallback(async (reportId: string) => {
    try {
      const metrics = await automatedReportsService.getReportPerformanceMetrics(reportId);
      updateState({
        reportMetrics: {
          ...state.reportMetrics,
          [reportId]: metrics
        }
      });
    } catch (error) {
      handleError(error, 'get report performance metrics');
    }
  }, [state.reportMetrics, updateState, handleError]);

  const refreshSystemMetrics = useCallback(async () => {
    try {
      const metrics = await automatedReportsService.getSystemPerformanceMetrics();
      updateState({ systemMetrics: metrics });
    } catch (error) {
      handleError(error, 'refresh system metrics');
    }
  }, [updateState, handleError]);

  // Filters and Search
  const updateFilters = useCallback((filters: Partial<AutomatedReportsState['filters']>) => {
    updateState({
      filters: { ...state.filters, ...filters }
    });
  }, [state.filters, updateState]);

  const updateSearchTerm = useCallback((term: string) => {
    updateState({ searchTerm: term });
  }, [updateState]);

  const resetFilters = useCallback(() => {
    updateState({ 
      filters: DEFAULT_FILTERS,
      searchTerm: ''
    });
  }, [updateState]);

  // Data Refresh
  const refreshData = useCallback(async () => {
    updateState({ loading: true, error: null });
    
    try {
      const [templates, reports, archives, alerts] = await Promise.all([
        automatedReportsService.getTemplates('current_user'),
        automatedReportsService.getScheduledReports('current_user'),
        automatedReportsService.getReportArchives(),
        automatedReportsService.getAlerts('current_user')
      ]);
      
      updateState({
        templates,
        scheduledReports: reports,
        archives,
        alerts,
        loading: false,
        lastRefresh: new Date().toISOString()
      });
      
      // Refresh system metrics
      await refreshSystemMetrics();
      
      toast.success('Data refreshed successfully');
    } catch (error) {
      updateState({ loading: false });
      handleError(error, 'refresh data');
    }
  }, [updateState, handleError, refreshSystemMetrics]);

  const toggleAutoRefresh = useCallback(() => {
    updateState({ autoRefresh: !state.autoRefresh });
  }, [state.autoRefresh, updateState]);

  const setRefreshInterval = useCallback((minutes: number) => {
    updateState({ refreshInterval: minutes });
  }, [updateState]);

  // Computed Values
  const filteredTemplates = useMemo(() => {
    let filtered = state.templates;
    
    if (state.filters.templateCategory) {
      filtered = filtered.filter(t => t.category === state.filters.templateCategory);
    }
    
    if (state.searchTerm) {
      const term = state.searchTerm.toLowerCase();
      filtered = filtered.filter(t => 
        t.name.toLowerCase().includes(term) ||
        t.description.toLowerCase().includes(term)
      );
    }
    
    return filtered;
  }, [state.templates, state.filters.templateCategory, state.searchTerm]);

  const filteredReports = useMemo(() => {
    let filtered = state.scheduledReports;
    
    if (state.filters.reportStatus) {
      filtered = filtered.filter(r => r.status === state.filters.reportStatus);
    }
    
    if (state.searchTerm) {
      const term = state.searchTerm.toLowerCase();
      filtered = filtered.filter(r => 
        r.name.toLowerCase().includes(term)
      );
    }
    
    return filtered;
  }, [state.scheduledReports, state.filters.reportStatus, state.searchTerm]);

  const filteredExecutions = useMemo(() => {
    let filtered = state.executions;
    
    if (state.filters.executionStatus) {
      filtered = filtered.filter(e => e.status === state.filters.executionStatus);
    }
    
    if (state.filters.dateRange.start && state.filters.dateRange.end) {
      filtered = filtered.filter(e => {
        const executionDate = new Date(e.startTime);
        const startDate = new Date(state.filters.dateRange.start);
        const endDate = new Date(state.filters.dateRange.end);
        return executionDate >= startDate && executionDate <= endDate;
      });
    }
    
    return filtered;
  }, [state.executions, state.filters]);

  const filteredAlerts = useMemo(() => {
    let filtered = state.alerts;
    
    if (state.filters.alertStatus) {
      if (state.filters.alertStatus === 'active') {
        filtered = filtered.filter(a => a.enabled);
      } else if (state.filters.alertStatus === 'inactive') {
        filtered = filtered.filter(a => !a.enabled);
      }
    }
    
    if (state.searchTerm) {
      const term = state.searchTerm.toLowerCase();
      filtered = filtered.filter(a => 
        a.name.toLowerCase().includes(term) ||
        a.description.toLowerCase().includes(term)
      );
    }
    
    return filtered;
  }, [state.alerts, state.filters.alertStatus, state.searchTerm]);

  const filteredArchives = useMemo(() => {
    let filtered = state.archives;
    
    if (state.filters.dateRange.start && state.filters.dateRange.end) {
      filtered = filtered.filter(a => {
        const archiveDate = new Date(a.generatedAt);
        const startDate = new Date(state.filters.dateRange.start);
        const endDate = new Date(state.filters.dateRange.end);
        return archiveDate >= startDate && archiveDate <= endDate;
      });
    }
    
    if (state.searchTerm) {
      const term = state.searchTerm.toLowerCase();
      filtered = filtered.filter(a => 
        a.fileName.toLowerCase().includes(term)
      );
    }
    
    return filtered;
  }, [state.archives, state.filters.dateRange, state.searchTerm]);

  // Statistics
  const executionStats = useMemo(() => {
    const total = state.executions.length;
    const completed = state.executions.filter(e => e.status === 'completed').length;
    const failed = state.executions.filter(e => e.status === 'failed').length;
    const running = state.executions.filter(e => e.status === 'running').length;
    const successRate = total > 0 ? (completed / total) * 100 : 0;
    
    return { total, completed, failed, running, successRate };
  }, [state.executions]);

  const alertStats = useMemo(() => {
    const total = state.alerts.length;
    const active = state.alerts.filter(a => a.enabled).length;
    const triggered = state.triggeredAlerts.length;
    const critical = state.alerts.filter(a => a.notification.urgency === 'critical').length;
    
    return { total, active, triggered, critical };
  }, [state.alerts, state.triggeredAlerts]);

  // Utilities
  const getTemplateById = useCallback((templateId: string): ReportTemplate | null => {
    return state.templates.find(t => t.id === templateId) || null;
  }, [state.templates]);

  const getReportById = useCallback((reportId: string): ScheduledReport | null => {
    return state.scheduledReports.find(r => r.id === reportId) || null;
  }, [state.scheduledReports]);

  const getExecutionById = useCallback((executionId: string): ReportExecution | null => {
    return state.executions.find(e => e.id === executionId) || null;
  }, [state.executions]);

  const getAlertById = useCallback((alertId: string): AlertRule | null => {
    return state.alerts.find(a => a.id === alertId) || null;
  }, [state.alerts]);

  const isReportActive = useCallback((reportId: string): boolean => {
    const report = getReportById(reportId);
    return report?.status === 'active' && report?.schedule?.enabled === true;
  }, [getReportById]);

  const hasRunningExecutions = useMemo(() => {
    return state.runningExecutions.length > 0;
  }, [state.runningExecutions]);

  const nextScheduledRun = useMemo(() => {
    const activeReports = state.scheduledReports.filter(r => r.status === 'active' && r.schedule.enabled);
    if (activeReports.length === 0) return null;
    
    const sorted = activeReports.sort((a, b) => 
      new Date(a.nextRun).getTime() - new Date(b.nextRun).getTime()
    );
    
    return sorted[0];
  }, [state.scheduledReports]);

  // Auto-refresh effect
  useEffect(() => {
    if (!state.autoRefresh) return;
    
    const interval = setInterval(() => {
      refreshData();
    }, state.refreshInterval * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [state.autoRefresh, state.refreshInterval, refreshData]);

  // Initial data load
  useEffect(() => {
    refreshData();
  }, []);

  // Check alerts periodically
  useEffect(() => {
    const interval = setInterval(() => {
      checkAlerts();
    }, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, [checkAlerts]);

  return {
    // State
    state,
    
    // Template Management
    createTemplate,
    updateTemplate,
    deleteTemplate,
    selectTemplate,
    getTemplate,
    duplicateTemplate,
    
    // Scheduled Report Management
    createScheduledReport,
    updateScheduledReport,
    deleteScheduledReport,
    selectReport,
    pauseReport,
    resumeReport,
    
    // Report Execution
    executeReport,
    cancelExecution,
    getReportExecutions,
    retryExecution,
    
    // Alert Management
    createAlert,
    updateAlert,
    deleteAlert,
    enableAlert,
    disableAlert,
    checkAlerts,
    acknowledgeAlert,
    
    // Archive Management
    downloadArchive,
    deleteArchive,
    getArchivesByReport,
    
    // Calendar Integration
    createCalendarIntegration,
    syncCalendar,
    
    // Export Functions
    exportReportData,
    exportTemplates,
    exportScheduledReports,
    
    // Performance Monitoring
    getReportPerformanceMetrics,
    refreshSystemMetrics,
    
    // Filters and Search
    updateFilters,
    updateSearchTerm,
    resetFilters,
    
    // Data Refresh
    refreshData,
    toggleAutoRefresh,
    setRefreshInterval,
    
    // Computed Values
    filteredTemplates,
    filteredReports,
    filteredExecutions,
    filteredAlerts,
    filteredArchives,
    
    // Statistics
    executionStats,
    alertStats,
    
    // Utilities
    getTemplateById,
    getReportById,
    getExecutionById,
    getAlertById,
    isReportActive,
    hasRunningExecutions,
    nextScheduledRun
  };
}; 