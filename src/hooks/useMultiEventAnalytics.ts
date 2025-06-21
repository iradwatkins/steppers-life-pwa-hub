import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { 
  MultiEventAnalyticsService,
  MultiEventMetrics,
  EventComparison,
  TrendAnalysis,
  VenuePerformance,
  AudienceInsights,
  PredictiveInsights
} from '@/services/multiEventAnalyticsService';
import { toast } from 'sonner';

export interface FilterOptions {
  dateRange?: {
    start: string;
    end: string;
  };
  eventStatus?: 'all' | 'upcoming' | 'past' | 'live';
  venueId?: string;
  minRevenue?: number;
  maxRevenue?: number;
}

export interface UseMultiEventAnalyticsReturn {
  metrics: MultiEventMetrics | null;
  comparisons: EventComparison[];
  trends: TrendAnalysis[];
  venuePerformance: VenuePerformance[];
  audienceInsights: AudienceInsights | null;
  predictiveInsights: PredictiveInsights | null;
  loading: boolean;
  error: string | null;
  filters: FilterOptions;
  setFilters: (filters: FilterOptions) => void;
  refreshData: () => Promise<void>;
  exportData: (format: 'csv' | 'json' | 'excel') => Promise<void>;
  trendPeriod: 'month' | 'quarter' | 'year';
  setTrendPeriod: (period: 'month' | 'quarter' | 'year') => void;
  comparisonLimit: number;
  setComparisonLimit: (limit: number) => void;
  lastRefresh: Date | null;
}

export const useMultiEventAnalytics = (): UseMultiEventAnalyticsReturn => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<MultiEventMetrics | null>(null);
  const [comparisons, setComparisons] = useState<EventComparison[]>([]);
  const [trends, setTrends] = useState<TrendAnalysis[]>([]);
  const [venuePerformance, setVenuePerformance] = useState<VenuePerformance[]>([]);
  const [audienceInsights, setAudienceInsights] = useState<AudienceInsights | null>(null);
  const [predictiveInsights, setPredictiveInsights] = useState<PredictiveInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [trendPeriod, setTrendPeriod] = useState<'month' | 'quarter' | 'year'>('month');
  const [comparisonLimit, setComparisonLimit] = useState(10);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      const [
        metricsData,
        comparisonsData,
        trendsData,
        venueData,
        audienceData,
        predictiveData
      ] = await Promise.allSettled([
        MultiEventAnalyticsService.getMultiEventMetrics(user.id, filters.dateRange),
        MultiEventAnalyticsService.getEventComparisons(user.id, comparisonLimit),
        MultiEventAnalyticsService.getTrendAnalysis(user.id, trendPeriod),
        MultiEventAnalyticsService.getVenuePerformance(user.id),
        MultiEventAnalyticsService.getAudienceInsights(user.id),
        MultiEventAnalyticsService.getPredictiveInsights(user.id)
      ]);

      // Set successful results
      if (metricsData.status === 'fulfilled') {
        setMetrics(metricsData.value);
      }
      if (comparisonsData.status === 'fulfilled') {
        setComparisons(comparisonsData.value);
      }
      if (trendsData.status === 'fulfilled') {
        setTrends(trendsData.value);
      }
      if (venueData.status === 'fulfilled') {
        setVenuePerformance(venueData.value);
      }
      if (audienceData.status === 'fulfilled') {
        setAudienceInsights(audienceData.value);
      }
      if (predictiveData.status === 'fulfilled') {
        setPredictiveInsights(predictiveData.value);
      }

      // Check for any errors
      const failedRequests = [metricsData, comparisonsData, trendsData, venueData, audienceData, predictiveData]
        .filter(result => result.status === 'rejected');
      
      if (failedRequests.length > 0) {
        console.warn('Some analytics data failed to load:', failedRequests);
      }

      setLastRefresh(new Date());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch analytics data';
      setError(errorMessage);
      toast.error('Failed to load analytics data', {
        description: errorMessage
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id, filters, trendPeriod, comparisonLimit]);

  const refreshData = useCallback(async () => {
    await fetchData();
    toast.success('Analytics data refreshed');
  }, [fetchData]);

  const exportData = useCallback(async (format: 'csv' | 'json' | 'excel') => {
    if (!user?.id) return;

    try {
      const exportedData = await MultiEventAnalyticsService.exportMultiEventData(user.id, format);
      
      // Create download
      const mimeType = format === 'json' ? 'application/json' : 'text/csv';
      const blob = new Blob([exportedData], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `multi-event-analytics.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`Analytics data exported as ${format.toUpperCase()}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to export data';
      toast.error('Export failed', {
        description: errorMessage
      });
    }
  }, [user?.id]);

  // Computed values
  const filteredComparisons = comparisons.filter(comparison => {
    if (filters.minRevenue && comparison.revenue < filters.minRevenue) return false;
    if (filters.maxRevenue && comparison.revenue > filters.maxRevenue) return false;
    if (filters.venueId && !comparison.eventName.includes(filters.venueId)) return false;
    if (filters.dateRange) {
      const eventDate = new Date(comparison.date);
      const startDate = new Date(filters.dateRange.start);
      const endDate = new Date(filters.dateRange.end);
      if (eventDate < startDate || eventDate > endDate) return false;
    }
    return true;
  });

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Refetch when trend period or comparison limit changes
  useEffect(() => {
    if (metrics) { // Only refetch if we already have data
      fetchData();
    }
  }, [trendPeriod, comparisonLimit]);

  return {
    metrics,
    comparisons: filteredComparisons,
    trends,
    venuePerformance,
    audienceInsights,
    predictiveInsights,
    loading,
    error,
    filters,
    setFilters,
    refreshData,
    exportData,
    trendPeriod,
    setTrendPeriod,
    comparisonLimit,
    setComparisonLimit,
    lastRefresh
  };
};