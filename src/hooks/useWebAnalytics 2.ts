import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  webAnalyticsService,
  type AnalyticsMetrics,
  type AnalyticsFilters,
  type RealTimeData,
  type TrafficSource,
  type ConversionFunnel,
  type UserJourney
} from '@/services/webAnalyticsService';
import { useToast } from '@/hooks/use-toast';

interface WebAnalyticsState {
  // Data
  overview: AnalyticsMetrics | null;
  pageAnalytics: Array<{
    page: string;
    title: string;
    pageViews: number;
    uniquePageViews: number;
    avgTimeOnPage: number;
    bounceRate: number;
    exitRate: number;
    entrances: number;
  }>;
  trafficSources: TrafficSource[];
  deviceAnalytics: Array<{
    deviceType: string;
    browser: string;
    os: string;
    sessions: number;
    users: number;
    pageViews: number;
    bounceRate: number;
    conversionRate: number;
  }>;
  geographicAnalytics: Array<{
    country: string;
    region: string;
    city: string;
    sessions: number;
    users: number;
    pageViews: number;
    bounceRate: number;
    conversionRate: number;
    revenue: number;
  }>;
  conversionFunnels: ConversionFunnel[];
  userJourneys: UserJourney[];
  realTimeData: RealTimeData | null;

  // State
  loading: boolean;
  error: string | null;
  filters: AnalyticsFilters;
  autoRefresh: boolean;
  refreshInterval: number;

  // Computed values
  topPages: Array<{ page: string; views: number; }>;
  topSources: Array<{ source: string; sessions: number; }>;
  topCountries: Array<{ country: string; users: number; }>;
  conversionRate: number;
  bounceRate: number;
  avgSessionDuration: number;
}

interface WebAnalyticsActions {
  // Data fetching
  refreshData: () => Promise<void>;
  updateFilters: (newFilters: Partial<AnalyticsFilters>) => void;
  resetFilters: () => void;
  
  // Real-time controls
  toggleAutoRefresh: () => void;
  setRefreshInterval: (interval: number) => void;
  
  // Export functionality
  exportData: (format: 'csv' | 'json' | 'excel') => Promise<void>;
  
  // Utility methods
  getTimeRangeLabel: () => string;
  formatMetric: (value: number, type: 'number' | 'percentage' | 'duration' | 'currency') => string;
  getDateRangePresets: () => Array<{ label: string; value: { start: Date; end: Date } }>;
}

const defaultFilters: AnalyticsFilters = {
  dateRange: {
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
    end: new Date()
  }
};

export function useWebAnalytics(): WebAnalyticsState & WebAnalyticsActions {
  const { toast } = useToast();
  
  // State
  const [state, setState] = useState<Omit<WebAnalyticsState, 'topPages' | 'topSources' | 'topCountries' | 'conversionRate' | 'bounceRate' | 'avgSessionDuration'>>({
    overview: null,
    pageAnalytics: [],
    trafficSources: [],
    deviceAnalytics: [],
    geographicAnalytics: [],
    conversionFunnels: [],
    userJourneys: [],
    realTimeData: null,
    loading: false,
    error: null,
    filters: defaultFilters,
    autoRefresh: false,
    refreshInterval: 30000 // 30 seconds
  });

  // Computed values
  const computedValues = useMemo(() => {
    const topPages = state.pageAnalytics
      .slice(0, 5)
      .map(p => ({ page: p.page, views: p.pageViews }));

    const topSources = state.trafficSources
      .slice(0, 5)
      .map(s => ({ source: s.source, sessions: s.sessions }));

    const topCountries = state.geographicAnalytics
      .slice(0, 5)
      .map(g => ({ country: g.country, users: g.users }));

    const conversionRate = state.overview?.conversionRate || 0;
    const bounceRate = state.overview?.bounceRate || 0;
    const avgSessionDuration = state.overview?.avgSessionDuration || 0;

    return {
      topPages,
      topSources,
      topCountries,
      conversionRate,
      bounceRate,
      avgSessionDuration
    };
  }, [state.pageAnalytics, state.trafficSources, state.geographicAnalytics, state.overview]);

  // Fetch all analytics data
  const refreshData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const [
        overview,
        pageAnalytics,
        trafficSources,
        deviceAnalytics,
        geographicAnalytics,
        conversionFunnels,
        userJourneys,
        realTimeData
      ] = await Promise.all([
        webAnalyticsService.getAnalyticsOverview(state.filters),
        webAnalyticsService.getPageAnalytics(state.filters),
        webAnalyticsService.getTrafficSources(state.filters),
        webAnalyticsService.getDeviceAnalytics(state.filters),
        webAnalyticsService.getGeographicAnalytics(state.filters),
        webAnalyticsService.getConversionFunnels(state.filters),
        webAnalyticsService.getUserJourneys(state.filters),
        webAnalyticsService.getRealTimeData()
      ]);

      setState(prev => ({
        ...prev,
        overview,
        pageAnalytics,
        trafficSources,
        deviceAnalytics,
        geographicAnalytics,
        conversionFunnels,
        userJourneys,
        realTimeData,
        loading: false
      }));

    } catch (error) {
      console.error('Error fetching analytics data:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch analytics data'
      }));
      
      toast({
        title: "Error",
        description: "Failed to fetch analytics data",
        variant: "destructive"
      });
    }
  }, [state.filters, toast]);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<AnalyticsFilters>) => {
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, ...newFilters }
    }));
  }, []);

  // Reset filters to defaults
  const resetFilters = useCallback(() => {
    setState(prev => ({
      ...prev,
      filters: defaultFilters
    }));
  }, []);

  // Toggle auto-refresh
  const toggleAutoRefresh = useCallback(() => {
    setState(prev => ({
      ...prev,
      autoRefresh: !prev.autoRefresh
    }));
  }, []);

  // Set refresh interval
  const setRefreshInterval = useCallback((interval: number) => {
    setState(prev => ({
      ...prev,
      refreshInterval: interval
    }));
  }, []);

  // Export data
  const exportData = useCallback(async (format: 'csv' | 'json' | 'excel') => {
    try {
      const blob = await webAnalyticsService.exportAnalyticsData(state.filters, format);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Export Complete",
        description: `Analytics data exported as ${format.toUpperCase()}`
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export analytics data",
        variant: "destructive"
      });
    }
  }, [state.filters, toast]);

  // Get time range label
  const getTimeRangeLabel = useCallback(() => {
    const { start, end } = state.filters.dateRange;
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 7) return 'Last 7 days';
    if (diffDays === 30) return 'Last 30 days';
    if (diffDays === 90) return 'Last 3 months';
    
    return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
  }, [state.filters.dateRange]);

  // Format metrics for display
  const formatMetric = useCallback((value: number, type: 'number' | 'percentage' | 'duration' | 'currency') => {
    switch (type) {
      case 'number':
        return new Intl.NumberFormat().format(Math.round(value));
      case 'percentage':
        return `${(value * 100).toFixed(1)}%`;
      case 'duration':
        if (value < 60) return `${Math.round(value)}s`;
        if (value < 3600) return `${Math.round(value / 60)}m ${Math.round(value % 60)}s`;
        return `${Math.round(value / 3600)}h ${Math.round((value % 3600) / 60)}m`;
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(value);
      default:
        return value.toString();
    }
  }, []);

  // Get date range presets
  const getDateRangePresets = useCallback(() => {
    const now = new Date();
    return [
      {
        label: 'Today',
        value: {
          start: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
          end: now
        }
      },
      {
        label: 'Yesterday',
        value: {
          start: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1),
          end: new Date(now.getFullYear(), now.getMonth(), now.getDate())
        }
      },
      {
        label: 'Last 7 days',
        value: {
          start: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
          end: now
        }
      },
      {
        label: 'Last 30 days',
        value: {
          start: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
          end: now
        }
      },
      {
        label: 'Last 3 months',
        value: {
          start: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
          end: now
        }
      },
      {
        label: 'This year',
        value: {
          start: new Date(now.getFullYear(), 0, 1),
          end: now
        }
      }
    ];
  }, []);

  // Auto-refresh effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (state.autoRefresh) {
      interval = setInterval(refreshData, state.refreshInterval);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [state.autoRefresh, state.refreshInterval, refreshData]);

  // Real-time data subscription
  useEffect(() => {
    const unsubscribe = webAnalyticsService.onRealTimeUpdate((realTimeData) => {
      setState(prev => ({ ...prev, realTimeData }));
    });

    return unsubscribe;
  }, []);

  // Initial data fetch and filter change effect
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  return {
    // State
    ...state,
    ...computedValues,
    
    // Actions
    refreshData,
    updateFilters,
    resetFilters,
    toggleAutoRefresh,
    setRefreshInterval,
    exportData,
    getTimeRangeLabel,
    formatMetric,
    getDateRangePresets
  };
}

export type { WebAnalyticsState, WebAnalyticsActions };