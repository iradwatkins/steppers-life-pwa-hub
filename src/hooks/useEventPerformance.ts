import { useState, useEffect, useCallback } from 'react';
import { EventPerformanceService, EventPerformanceMetrics, PerformanceBenchmark } from '@/services/eventPerformanceService';
import { toast } from 'sonner';

export interface UseEventPerformanceReturn {
  data: EventPerformanceMetrics | null;
  benchmarks: PerformanceBenchmark[];
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  exportData: (format: 'csv' | 'json' | 'pdf') => Promise<void>;
  autoRefresh: boolean;
  setAutoRefresh: (enabled: boolean) => void;
  lastRefresh: Date | null;
}

export const useEventPerformance = (eventId: string): UseEventPerformanceReturn => {
  const [data, setData] = useState<EventPerformanceMetrics | null>(null);
  const [benchmarks, setBenchmarks] = useState<PerformanceBenchmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    if (!eventId) return;

    try {
      setLoading(true);
      setError(null);

      const [performanceData, benchmarkData] = await Promise.all([
        EventPerformanceService.getEventPerformance(eventId),
        EventPerformanceService.getPerformanceBenchmarks(eventId)
      ]);

      setData(performanceData);
      setBenchmarks(benchmarkData);
      setLastRefresh(new Date());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch event performance data';
      setError(errorMessage);
      toast.error('Failed to load performance data', {
        description: errorMessage
      });
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  const refreshData = useCallback(async () => {
    await fetchData();
    toast.success('Performance data refreshed');
  }, [fetchData]);

  const exportData = useCallback(async (format: 'csv' | 'json' | 'pdf') => {
    if (!eventId) return;

    try {
      const exportedData = await EventPerformanceService.exportPerformanceData(eventId, format);
      
      // Create download
      const blob = new Blob([exportedData], { 
        type: format === 'json' ? 'application/json' : 'text/csv' 
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `event-performance-${eventId}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`Performance data exported as ${format.toUpperCase()}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to export data';
      toast.error('Export failed', {
        description: errorMessage
      });
    }
  }, [eventId]);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchData();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, fetchData]);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    benchmarks,
    loading,
    error,
    refreshData,
    exportData,
    autoRefresh,
    setAutoRefresh,
    lastRefresh
  };
};