import { useState, useEffect, useCallback } from 'react';
import { 
  CustomDashboard, 
  DashboardWidget, 
  DashboardTemplate, 
  WidgetType, 
  DataSource, 
  CustomMetric,
  DashboardAnalytics,
  ExportOptions,
  customDashboardService 
} from '../services/customDashboardService';
import { toast } from 'sonner';

interface UseCustomDashboardReturn {
  // Dashboard state
  dashboards: CustomDashboard[];
  currentDashboard: CustomDashboard | null;
  templates: DashboardTemplate[];
  widgetTypes: WidgetType[];
  dataSources: DataSource[];
  customMetrics: CustomMetric[];
  analytics: DashboardAnalytics | null;
  
  // Loading states
  isLoading: boolean;
  isSaving: boolean;
  isExporting: boolean;
  error: string | null;
  
  // Dashboard operations
  createDashboard: (dashboard: Omit<CustomDashboard, 'id' | 'created' | 'lastModified' | 'lastAccessed' | 'accessCount' | 'version'>) => Promise<CustomDashboard | null>;
  loadDashboard: (id: string) => Promise<void>;
  updateDashboard: (id: string, updates: Partial<CustomDashboard>) => Promise<void>;
  deleteDashboard: (id: string) => Promise<void>;
  duplicateDashboard: (id: string, newName: string) => Promise<void>;
  
  // Widget operations
  addWidget: (widget: Omit<DashboardWidget, 'id' | 'created' | 'lastModified'>) => Promise<void>;
  updateWidget: (widgetId: string, updates: Partial<DashboardWidget>) => Promise<void>;
  removeWidget: (widgetId: string) => Promise<void>;
  moveWidget: (widgetId: string, newPosition: { x: number; y: number; width: number; height: number }) => Promise<void>;
  
  // Template operations
  loadTemplates: (category?: string) => Promise<void>;
  createFromTemplate: (templateId: string, name: string, eventIds?: string[]) => Promise<void>;
  
  // Utility functions
  exportDashboard: (options: ExportOptions) => Promise<void>;
  loadAnalytics: (dashboardId: string) => Promise<void>;
  restoreVersion: (version: number) => Promise<void>;
  refreshData: () => Promise<void>;
  
  // State setters
  setCurrentDashboard: (dashboard: CustomDashboard | null) => void;
  clearError: () => void;
}

export const useCustomDashboard = (organizerId: string): UseCustomDashboardReturn => {
  // Core state
  const [dashboards, setDashboards] = useState<CustomDashboard[]>([]);
  const [currentDashboard, setCurrentDashboard] = useState<CustomDashboard | null>(null);
  const [templates, setTemplates] = useState<DashboardTemplate[]>([]);
  const [widgetTypes, setWidgetTypes] = useState<WidgetType[]>([]);
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [customMetrics, setCustomMetrics] = useState<CustomMetric[]>([]);
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize data on mount
  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      try {
        // Load all initial data
        const [dashboardsData, templatesData, widgetTypesData, dataSourcesData, metricsData] = await Promise.all([
          customDashboardService.getDashboardsByOrganizer(organizerId),
          customDashboardService.getTemplates(),
          Promise.resolve(customDashboardService.getWidgetTypes()),
          Promise.resolve(customDashboardService.getDataSources()),
          customDashboardService.getCustomMetrics(organizerId)
        ]);

        setDashboards(dashboardsData);
        setTemplates(templatesData);
        setWidgetTypes(widgetTypesData);
        setDataSources(dataSourcesData);
        setCustomMetrics(metricsData);
      } catch (err) {
        setError('Failed to load dashboard data');
        toast.error('Failed to load dashboard data');
        console.error('Dashboard initialization error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (organizerId) {
      initialize();
    }
  }, [organizerId]);

  // Dashboard operations
  const createDashboard = useCallback(async (
    dashboardData: Omit<CustomDashboard, 'id' | 'created' | 'lastModified' | 'lastAccessed' | 'accessCount' | 'version'>
  ): Promise<CustomDashboard | null> => {
    setIsSaving(true);
    try {
      const newDashboard = await customDashboardService.createDashboard({
        ...dashboardData,
        organizerId
      });
      
      setDashboards(prev => [newDashboard, ...prev]);
      setCurrentDashboard(newDashboard);
      
      toast.success('Dashboard created successfully');
      return newDashboard;
    } catch (err) {
      setError('Failed to create dashboard');
      toast.error('Failed to create dashboard');
      console.error('Create dashboard error:', err);
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [organizerId]);

  const loadDashboard = useCallback(async (id: string): Promise<void> => {
    setIsLoading(true);
    try {
      const dashboard = await customDashboardService.getDashboard(id);
      if (dashboard) {
        setCurrentDashboard(dashboard);
        
        // Update in list if it exists
        setDashboards(prev => 
          prev.map(d => d.id === id ? dashboard : d)
        );
      } else {
        setError('Dashboard not found');
        toast.error('Dashboard not found');
      }
    } catch (err) {
      setError('Failed to load dashboard');
      toast.error('Failed to load dashboard');
      console.error('Load dashboard error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateDashboard = useCallback(async (id: string, updates: Partial<CustomDashboard>): Promise<void> => {
    setIsSaving(true);
    try {
      const updatedDashboard = await customDashboardService.updateDashboard(id, updates);
      if (updatedDashboard) {
        setCurrentDashboard(updatedDashboard);
        setDashboards(prev => 
          prev.map(d => d.id === id ? updatedDashboard : d)
        );
        toast.success('Dashboard updated successfully');
      } else {
        throw new Error('Dashboard not found');
      }
    } catch (err) {
      setError('Failed to update dashboard');
      toast.error('Failed to update dashboard');
      console.error('Update dashboard error:', err);
    } finally {
      setIsSaving(false);
    }
  }, []);

  const deleteDashboard = useCallback(async (id: string): Promise<void> => {
    setIsSaving(true);
    try {
      const success = await customDashboardService.deleteDashboard(id);
      if (success) {
        setDashboards(prev => prev.filter(d => d.id !== id));
        if (currentDashboard?.id === id) {
          setCurrentDashboard(null);
        }
        toast.success('Dashboard deleted successfully');
      } else {
        throw new Error('Failed to delete dashboard');
      }
    } catch (err) {
      setError('Failed to delete dashboard');
      toast.error('Failed to delete dashboard');
      console.error('Delete dashboard error:', err);
    } finally {
      setIsSaving(false);
    }
  }, [currentDashboard?.id]);

  const duplicateDashboard = useCallback(async (id: string, newName: string): Promise<void> => {
    setIsSaving(true);
    try {
      const duplicate = await customDashboardService.duplicateDashboard(id, newName);
      if (duplicate) {
        setDashboards(prev => [duplicate, ...prev]);
        setCurrentDashboard(duplicate);
        toast.success('Dashboard duplicated successfully');
      } else {
        throw new Error('Failed to duplicate dashboard');
      }
    } catch (err) {
      setError('Failed to duplicate dashboard');
      toast.error('Failed to duplicate dashboard');
      console.error('Duplicate dashboard error:', err);
    } finally {
      setIsSaving(false);
    }
  }, []);

  // Widget operations
  const addWidget = useCallback(async (
    widget: Omit<DashboardWidget, 'id' | 'created' | 'lastModified'>
  ): Promise<void> => {
    if (!currentDashboard) {
      setError('No dashboard selected');
      return;
    }

    setIsSaving(true);
    try {
      const newWidget = await customDashboardService.addWidget(currentDashboard.id, {
        ...widget,
        createdBy: organizerId
      });
      
      if (newWidget) {
        const updatedDashboard = {
          ...currentDashboard,
          widgets: [...currentDashboard.widgets, newWidget],
          lastModified: new Date()
        };
        
        setCurrentDashboard(updatedDashboard);
        setDashboards(prev => 
          prev.map(d => d.id === currentDashboard.id ? updatedDashboard : d)
        );
        
        toast.success('Widget added successfully');
      } else {
        throw new Error('Failed to add widget');
      }
    } catch (err) {
      setError('Failed to add widget');
      toast.error('Failed to add widget');
      console.error('Add widget error:', err);
    } finally {
      setIsSaving(false);
    }
  }, [currentDashboard, organizerId]);

  const updateWidget = useCallback(async (widgetId: string, updates: Partial<DashboardWidget>): Promise<void> => {
    if (!currentDashboard) {
      setError('No dashboard selected');
      return;
    }

    setIsSaving(true);
    try {
      const updatedWidget = await customDashboardService.updateWidget(currentDashboard.id, widgetId, updates);
      if (updatedWidget) {
        const updatedDashboard = {
          ...currentDashboard,
          widgets: currentDashboard.widgets.map(w => w.id === widgetId ? updatedWidget : w),
          lastModified: new Date()
        };
        
        setCurrentDashboard(updatedDashboard);
        setDashboards(prev => 
          prev.map(d => d.id === currentDashboard.id ? updatedDashboard : d)
        );
        
        toast.success('Widget updated successfully');
      } else {
        throw new Error('Widget not found');
      }
    } catch (err) {
      setError('Failed to update widget');
      toast.error('Failed to update widget');
      console.error('Update widget error:', err);
    } finally {
      setIsSaving(false);
    }
  }, [currentDashboard]);

  const removeWidget = useCallback(async (widgetId: string): Promise<void> => {
    if (!currentDashboard) {
      setError('No dashboard selected');
      return;
    }

    setIsSaving(true);
    try {
      const success = await customDashboardService.removeWidget(currentDashboard.id, widgetId);
      if (success) {
        const updatedDashboard = {
          ...currentDashboard,
          widgets: currentDashboard.widgets.filter(w => w.id !== widgetId),
          lastModified: new Date()
        };
        
        setCurrentDashboard(updatedDashboard);
        setDashboards(prev => 
          prev.map(d => d.id === currentDashboard.id ? updatedDashboard : d)
        );
        
        toast.success('Widget removed successfully');
      } else {
        throw new Error('Failed to remove widget');
      }
    } catch (err) {
      setError('Failed to remove widget');
      toast.error('Failed to remove widget');
      console.error('Remove widget error:', err);
    } finally {
      setIsSaving(false);
    }
  }, [currentDashboard]);

  const moveWidget = useCallback(async (
    widgetId: string, 
    newPosition: { x: number; y: number; width: number; height: number }
  ): Promise<void> => {
    if (!currentDashboard) return;

    await updateWidget(widgetId, { position: newPosition });
  }, [currentDashboard, updateWidget]);

  // Template operations
  const loadTemplates = useCallback(async (category?: string): Promise<void> => {
    setIsLoading(true);
    try {
      const templatesData = await customDashboardService.getTemplates(category);
      setTemplates(templatesData);
    } catch (err) {
      setError('Failed to load templates');
      toast.error('Failed to load templates');
      console.error('Load templates error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createFromTemplate = useCallback(async (
    templateId: string, 
    name: string, 
    eventIds: string[] = []
  ): Promise<void> => {
    setIsSaving(true);
    try {
      const newDashboard = await customDashboardService.createDashboardFromTemplate(
        templateId, 
        organizerId, 
        name, 
        eventIds
      );
      
      if (newDashboard) {
        setDashboards(prev => [newDashboard, ...prev]);
        setCurrentDashboard(newDashboard);
        toast.success('Dashboard created from template successfully');
      } else {
        throw new Error('Template not found');
      }
    } catch (err) {
      setError('Failed to create dashboard from template');
      toast.error('Failed to create dashboard from template');
      console.error('Create from template error:', err);
    } finally {
      setIsSaving(false);
    }
  }, [organizerId]);

  // Utility functions
  const exportDashboard = useCallback(async (options: ExportOptions): Promise<void> => {
    if (!currentDashboard) {
      setError('No dashboard selected');
      return;
    }

    setIsExporting(true);
    try {
      const blob = await customDashboardService.exportDashboard(currentDashboard.id, options);
      if (blob) {
        // Create download link
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${currentDashboard.name}.${options.format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        toast.success('Dashboard exported successfully');
      } else {
        throw new Error('Export failed');
      }
    } catch (err) {
      setError('Failed to export dashboard');
      toast.error('Failed to export dashboard');
      console.error('Export dashboard error:', err);
    } finally {
      setIsExporting(false);
    }
  }, [currentDashboard]);

  const loadAnalytics = useCallback(async (dashboardId: string): Promise<void> => {
    setIsLoading(true);
    try {
      const analyticsData = await customDashboardService.getDashboardAnalytics(dashboardId);
      setAnalytics(analyticsData);
    } catch (err) {
      setError('Failed to load analytics');
      toast.error('Failed to load analytics');
      console.error('Load analytics error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const restoreVersion = useCallback(async (version: number): Promise<void> => {
    if (!currentDashboard) {
      setError('No dashboard selected');
      return;
    }

    setIsSaving(true);
    try {
      const restoredDashboard = await customDashboardService.restoreDashboardVersion(
        currentDashboard.id, 
        version
      );
      
      if (restoredDashboard) {
        setCurrentDashboard(restoredDashboard);
        setDashboards(prev => 
          prev.map(d => d.id === currentDashboard.id ? restoredDashboard : d)
        );
        toast.success('Dashboard version restored successfully');
      } else {
        throw new Error('Version not found');
      }
    } catch (err) {
      setError('Failed to restore version');
      toast.error('Failed to restore version');
      console.error('Restore version error:', err);
    } finally {
      setIsSaving(false);
    }
  }, [currentDashboard]);

  const refreshData = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      const refreshedDashboards = await customDashboardService.getDashboardsByOrganizer(organizerId);
      setDashboards(refreshedDashboards);
      
      if (currentDashboard) {
        const refreshedCurrent = refreshedDashboards.find(d => d.id === currentDashboard.id);
        if (refreshedCurrent) {
          setCurrentDashboard(refreshedCurrent);
        }
      }
      
      toast.success('Data refreshed successfully');
    } catch (err) {
      setError('Failed to refresh data');
      toast.error('Failed to refresh data');
      console.error('Refresh data error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [organizerId, currentDashboard]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    dashboards,
    currentDashboard,
    templates,
    widgetTypes,
    dataSources,
    customMetrics,
    analytics,
    
    // Loading states
    isLoading,
    isSaving,
    isExporting,
    error,
    
    // Dashboard operations
    createDashboard,
    loadDashboard,
    updateDashboard,
    deleteDashboard,
    duplicateDashboard,
    
    // Widget operations
    addWidget,
    updateWidget,
    removeWidget,
    moveWidget,
    
    // Template operations
    loadTemplates,
    createFromTemplate,
    
    // Utility functions
    exportDashboard,
    loadAnalytics,
    restoreVersion,
    refreshData,
    
    // State setters
    setCurrentDashboard,
    clearError
  };
}; 