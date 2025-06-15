import { useState, useEffect, useCallback, useRef } from 'react';
import { eventPerformanceService, EventPerformanceData, ComparisonData } from '../services/eventPerformanceService';
import { toast } from '../hooks/use-toast';

interface UseEventPerformanceOptions {
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
  enableRealTimeUpdates?: boolean;
}

export const useEventPerformance = (
  eventId: string,
  options: UseEventPerformanceOptions = {}
) => {
  const {
    autoRefresh = true,
    refreshInterval = 30000, // 30 seconds
    enableRealTimeUpdates = true
  } = options;

  const [data, setData] = useState<EventPerformanceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  const fetchPerformanceData = useCallback(async (showLoading = false) => {
    if (!eventId) return;

    try {
      if (showLoading) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }
      setError(null);

      const performanceData = await eventPerformanceService.getEventPerformance(eventId);
      
      if (mountedRef.current) {
        setData(performanceData);
        setLastUpdated(new Date());
      }
    } catch (err) {
      if (mountedRef.current) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch performance data';
        setError(errorMessage);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, [eventId]);

  const refreshData = useCallback(() => {
    fetchPerformanceData(false);
  }, [fetchPerformanceData]);

  const exportData = useCallback(async (format: 'pdf' | 'csv' | 'json') => {
    if (!eventId) return;

    try {
      const blob = await eventPerformanceService.exportPerformanceData(eventId, format);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `event-performance-${eventId}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: `Performance data exported as ${format.toUpperCase()}`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Export failed';
      toast({
        title: "Export Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [eventId]);

  // Initial data fetch
  useEffect(() => {
    mountedRef.current = true;
    fetchPerformanceData(true);

    return () => {
      mountedRef.current = false;
    };
  }, [fetchPerformanceData]);

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh || !enableRealTimeUpdates) return;

    intervalRef.current = setInterval(() => {
      if (mountedRef.current && !isLoading) {
        refreshData();
      }
    }, refreshInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRefresh, enableRealTimeUpdates, refreshInterval, refreshData, isLoading]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      mountedRef.current = false;
    };
  }, []);

  return {
    data,
    isLoading,
    error,
    isRefreshing,
    lastUpdated,
    refreshData,
    exportData,
    // Computed values for easy access
    overview: data?.overview || null,
    ticketSales: data?.ticketSales || null,
    revenue: data?.revenue || null,
    attendees: data?.attendees || null,
    salesTrends: data?.salesTrends || [],
    salesChannels: data?.salesChannels || [],
    geographic: data?.geographic || null,
    timeAnalytics: data?.timeAnalytics || null,
    comparisons: data?.comparisons || null,
  };
};

export const useMultiEventComparison = (eventIds: string[]) => {
  const [data, setData] = useState<ComparisonData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComparison = useCallback(async () => {
    if (!eventIds.length) return;

    try {
      setIsLoading(true);
      setError(null);

      const comparisonData = await eventPerformanceService.getMultiEventComparison(eventIds);
      setData(comparisonData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch comparison data';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [eventIds]);

  useEffect(() => {
    fetchComparison();
  }, [fetchComparison]);

  return {
    data,
    isLoading,
    error,
    refreshComparison: fetchComparison,
  };
};

// Hook for managing performance dashboard state
export const usePerformanceDashboard = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState<'24h' | '7d' | '30d' | '90d'>('30d');
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['tickets', 'revenue', 'checkins']);
  const [viewMode, setViewMode] = useState<'overview' | 'detailed'>('overview');
  const [chartType, setChartType] = useState<'line' | 'bar' | 'area'>('line');
  const [compareMode, setCompareMode] = useState(false);
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);

  const toggleMetric = useCallback((metric: string) => {
    setSelectedMetrics(prev => 
      prev.includes(metric) 
        ? prev.filter(m => m !== metric)
        : [...prev, metric]
    );
  }, []);

  const toggleEventForComparison = useCallback((eventId: string) => {
    setSelectedEvents(prev => 
      prev.includes(eventId)
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    );
  }, []);

  const resetDashboard = useCallback(() => {
    setSelectedTimeRange('30d');
    setSelectedMetrics(['tickets', 'revenue', 'checkins']);
    setViewMode('overview');
    setChartType('line');
    setCompareMode(false);
    setSelectedEvents([]);
  }, []);

  return {
    selectedTimeRange,
    setSelectedTimeRange,
    selectedMetrics,
    setSelectedMetrics,
    toggleMetric,
    viewMode,
    setViewMode,
    chartType,
    setChartType,
    compareMode,
    setCompareMode,
    selectedEvents,
    setSelectedEvents,
    toggleEventForComparison,
    resetDashboard,
  };
}; 