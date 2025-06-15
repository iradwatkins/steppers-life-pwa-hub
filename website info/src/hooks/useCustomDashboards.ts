import { useState, useEffect, useCallback } from 'react';
import {
  DashboardConfig,
  WidgetConfig,
  CustomMetric,
  DataSource,
  DashboardOperationResult,
  WidgetLayout,
} from '../services/custom-dashboard/customDashboardTypes';
import * as CustomDashboardService from '../services/custom-dashboard/customDashboardService';

export interface UseCustomDashboardsReturn {
  dashboards: DashboardConfig[];
  currentDashboard: DashboardConfig | null;
  isLoading: boolean;
  error: Error | null;
  // Dashboard operations
  fetchDashboards: (ownerId: string) => Promise<void>;
  fetchDashboardById: (id: string) => Promise<void>;
  createDashboard: (config: Omit<DashboardConfig, 'id' | 'createdAt' | 'updatedAt' | 'version'>) => Promise<DashboardOperationResult>;
  updateDashboard: (id: string, updates: Partial<Omit<DashboardConfig, 'id' | 'ownerId' | 'createdAt'>>) => Promise<DashboardOperationResult>;
  deleteDashboard: (id: string) => Promise<DashboardOperationResult>;
  selectDashboard: (dashboard: DashboardConfig | null) => void;
  // Widget operations
  addWidget: (widgetConfig: Omit<WidgetConfig, 'id'>, layoutItem: Omit<WidgetLayout, 'i'>) => Promise<void>;
  updateWidget: (widgetId: string, updates: Partial<WidgetConfig>, layoutUpdates?: Partial<WidgetLayout>) => Promise<void>;
  removeWidget: (widgetId: string) => Promise<void>;
  // Widget Data
  getWidgetData: (widgetId: string) => Promise<any>; // Add type for widget data later
  // Data Sources & Custom Metrics (Simplified for now, might need separate hooks later)
  dataSources: DataSource[];
  customMetrics: CustomMetric[];
  fetchDataSources: () => Promise<void>;
  createDataSource: (dataSource: Omit<DataSource, 'id'>) => Promise<DataSource | null>;
  fetchCustomMetrics: () => Promise<void>;
  createCustomMetric: (metric: Omit<CustomMetric, 'id'>) => Promise<CustomMetric | null>;
}

const useCustomDashboards = (ownerId?: string): UseCustomDashboardsReturn => {
  const [dashboards, setDashboards] = useState<DashboardConfig[]>([]);
  const [currentDashboard, setCurrentDashboard] = useState<DashboardConfig | null>(null);
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [customMetrics, setCustomMetrics] = useState<CustomMetric[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const handleAsync = async <T>(asyncFn: () => Promise<T>, onSuccess?: (data: T) => void) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await asyncFn();
      if (onSuccess) onSuccess(result);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      // Consider more robust error handling/logging
      throw err; // Re-throw to allow caller to handle if needed
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDashboards = useCallback(async (id: string) => {
    await handleAsync(() => CustomDashboardService.getDashboards(id), setDashboards);
  }, []);

  useEffect(() => {
    if (ownerId) {
      fetchDashboards(ownerId);
    }
  }, [ownerId, fetchDashboards]);

  const fetchDashboardById = useCallback(async (id: string) => {
    await handleAsync(() => CustomDashboardService.getDashboardById(id), (data) => {
      setCurrentDashboard(data || null);
    });
  }, []);

  const selectDashboard = (dashboard: DashboardConfig | null) => {
    setCurrentDashboard(dashboard);
  };

  const createDashboard = async (config: Omit<DashboardConfig, 'id' | 'createdAt' | 'updatedAt' | 'version'>) => {
    return handleAsync(() => CustomDashboardService.createDashboard(config), (result) => {
      if (result.success && result.dashboard && ownerId) {
         fetchDashboards(ownerId); // Refresh list
        setCurrentDashboard(result.dashboard); 
      }
    });
  };

  const updateDashboard = async (id: string, updates: Partial<Omit<DashboardConfig, 'id' | 'ownerId' | 'createdAt'>>) => {
    return handleAsync(() => CustomDashboardService.updateDashboard(id, updates), (result) => {
      if (result.success && result.dashboard) {
        setDashboards(prev => prev.map(d => d.id === id ? result.dashboard! : d));
        if (currentDashboard?.id === id) {
          setCurrentDashboard(result.dashboard);
        }
      }
    });
  };

  const deleteDashboard = async (id: string) => {
    return handleAsync(() => CustomDashboardService.deleteDashboard(id), (result) => {
      if (result.success) {
        setDashboards(prev => prev.filter(d => d.id !== id));
        if (currentDashboard?.id === id) {
          setCurrentDashboard(null);
        }
      }
    });
  };

  // Widget operations
  const addWidget = async (widgetConfig: Omit<WidgetConfig, 'id'>, layoutItem: Omit<WidgetLayout, 'i'>) => {
    if (!currentDashboard) {
      setError(new Error('No dashboard selected to add widget to'));
      return;
    }
    await handleAsync(() => CustomDashboardService.addWidgetToDashboard(currentDashboard.id, widgetConfig, layoutItem),
      (result) => {
        if (result.success && result.dashboard) {
          setCurrentDashboard(result.dashboard);
          // Update dashboards list if needed (e.g. if it contains full objects)
          setDashboards(prev => prev.map(d => d.id === result.dashboard!.id ? result.dashboard! : d));
        }
      }
    );
  };

  const updateWidget = async (widgetId: string, updates: Partial<WidgetConfig>, layoutUpdates?: Partial<WidgetLayout>) => {
    if (!currentDashboard) {
      setError(new Error('No dashboard selected to update widget in'));
      return;
    }
    await handleAsync(() => CustomDashboardService.updateWidgetInDashboard(currentDashboard.id, widgetId, updates, layoutUpdates),
      (result) => {
        if (result.success && result.dashboard) {
          setCurrentDashboard(result.dashboard);
          setDashboards(prev => prev.map(d => d.id === result.dashboard!.id ? result.dashboard! : d));
        }
      }
    );
  };

  const removeWidget = async (widgetId: string) => {
    if (!currentDashboard) {
      setError(new Error('No dashboard selected to remove widget from'));
      return;
    }
    await handleAsync(() => CustomDashboardService.removeWidgetFromDashboard(currentDashboard.id, widgetId),
      (result) => {
        if (result.success && result.dashboard) {
          setCurrentDashboard(result.dashboard);
          setDashboards(prev => prev.map(d => d.id === result.dashboard!.id ? result.dashboard! : d));
        }
      }
    );
  };

  const getWidgetData = async (widgetId: string) => {
    if (!currentDashboard) {
      setError(new Error('No dashboard selected to get widget data from'));
      return null;
    }
    // setIsLoading for widget data specifically? Or rely on global isLoading?
    // For now, using global isLoading via handleAsync.
    return handleAsync(() => CustomDashboardService.getWidgetData(currentDashboard.id, widgetId));
  };

  // Data Sources & Custom Metrics
  const fetchDataSources = useCallback(async () => {
    await handleAsync(CustomDashboardService.getDataSources, setDataSources);
  }, []);

  const createDataSource = async (dataSource: Omit<DataSource, 'id'>) => {
    return handleAsync(() => CustomDashboardService.createDataSource(dataSource), (newDataSource) => {
      if (newDataSource) setDataSources(prev => [...prev, newDataSource]);
    });
  };

  const fetchCustomMetrics = useCallback(async () => {
    await handleAsync(CustomDashboardService.getCustomMetrics, setCustomMetrics);
  }, []);

  const createCustomMetric = async (metric: Omit<CustomMetric, 'id'>) => {
    return handleAsync(() => CustomDashboardService.createCustomMetric(metric), (newMetric) => {
      if (newMetric) setCustomMetrics(prev => [...prev, newMetric]);
    });
  };

  // Initial fetch for global/static lists like data sources and custom metrics
  useEffect(() => {
    fetchDataSources();
    fetchCustomMetrics();
  }, [fetchDataSources, fetchCustomMetrics]);

  return {
    dashboards,
    currentDashboard,
    isLoading,
    error,
    fetchDashboards,
    fetchDashboardById,
    createDashboard,
    updateDashboard,
    deleteDashboard,
    selectDashboard,
    addWidget,
    updateWidget,
    removeWidget,
    getWidgetData,
    dataSources,
    customMetrics,
    fetchDataSources,
    createDataSource,
    fetchCustomMetrics,
    createCustomMetric,
  };
};

export default useCustomDashboards; 