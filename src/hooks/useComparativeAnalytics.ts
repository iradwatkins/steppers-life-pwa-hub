import { useState, useEffect, useCallback } from 'react';
import { 
  comparativeAnalyticsService, 
  EventMetrics, 
  BenchmarkData, 
  ComparisonInsight, 
  PerformanceScore,
  TrendAnalysis,
  SeasonalPattern,
  VenueComparison,
  TeamPerformanceMetrics
} from '@/services/comparativeAnalyticsService';

interface UseComparativeAnalyticsState {
  events: EventMetrics[];
  selectedEventIds: string[];
  comparisonData: {
    events: EventMetrics[];
    differences: Record<string, number>;
    insights: ComparisonInsight[];
  } | null;
  benchmarkData: BenchmarkData[];
  performanceScores: Record<string, PerformanceScore>;
  trendAnalysis: Record<string, TrendAnalysis>;
  seasonalPatterns: SeasonalPattern[];
  venueComparison: VenueComparison[];
  teamPerformance: TeamPerformanceMetrics[];
  loading: boolean;
  error: string | null;
  filters: {
    dateRange: { start: string; end: string } | null;
    eventTypes: string[];
    venues: string[];
    minRevenue: number;
    maxRevenue: number;
  };
  autoRefresh: boolean;
  refreshInterval: number;
}

interface UseComparativeAnalyticsReturn extends UseComparativeAnalyticsState {
  // Event Management
  loadEvents: () => Promise<void>;
  selectEvent: (eventId: string) => void;
  deselectEvent: (eventId: string) => void;
  clearSelection: () => void;
  
  // Comparison Operations
  compareSelectedEvents: () => Promise<void>;
  calculatePerformanceScore: (eventId: string, weights?: Record<string, number>) => Promise<void>;
  
  // Analytics Operations
  loadBenchmarkData: () => Promise<void>;
  loadTrendAnalysis: (metric: string, timeRange: string) => Promise<void>;
  loadSeasonalAnalysis: () => Promise<void>;
  loadVenueComparison: () => Promise<void>;
  loadTeamPerformance: () => Promise<void>;
  
  // Filtering and Search
  applyFilters: (newFilters: Partial<UseComparativeAnalyticsState['filters']>) => void;
  clearFilters: () => void;
  searchEvents: (query: string) => EventMetrics[];
  
  // Export and Reporting
  exportData: (format: 'csv' | 'excel' | 'pdf') => Promise<void>;
  generateReport: (includeForecasting?: boolean) => Promise<any>;
  
  // Utility Functions
  refresh: () => Promise<void>;
  setAutoRefresh: (enabled: boolean, interval?: number) => void;
  getFilteredEvents: () => EventMetrics[];
  getComparisonInsights: (type?: string) => ComparisonInsight[];
  
  // Computed Values
  totalEvents: number;
  averageRevenue: number;
  topPerformingEvent: EventMetrics | null;
  performanceTrend: 'up' | 'down' | 'stable';
}

export const useComparativeAnalytics = (): UseComparativeAnalyticsReturn => {
  const [state, setState] = useState<UseComparativeAnalyticsState>({
    events: [],
    selectedEventIds: [],
    comparisonData: null,
    benchmarkData: [],
    performanceScores: {},
    trendAnalysis: {},
    seasonalPatterns: [],
    venueComparison: [],
    teamPerformance: [],
    loading: false,
    error: null,
    filters: {
      dateRange: null,
      eventTypes: [],
      venues: [],
      minRevenue: 0,
      maxRevenue: Infinity
    },
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

  // Load events
  const loadEvents = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const events = await comparativeAnalyticsService.getEventMetrics();
      setState(prev => ({ ...prev, events, loading: false }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to load events',
        loading: false 
      }));
    }
  }, []);

  // Event selection management
  const selectEvent = useCallback((eventId: string) => {
    setState(prev => ({
      ...prev,
      selectedEventIds: prev.selectedEventIds.includes(eventId) 
        ? prev.selectedEventIds 
        : [...prev.selectedEventIds, eventId]
    }));
  }, []);

  const deselectEvent = useCallback((eventId: string) => {
    setState(prev => ({
      ...prev,
      selectedEventIds: prev.selectedEventIds.filter(id => id !== eventId)
    }));
  }, []);

  const clearSelection = useCallback(() => {
    setState(prev => ({ ...prev, selectedEventIds: [] }));
  }, []);

  // Compare selected events
  const compareSelectedEvents = useCallback(async () => {
    if (state.selectedEventIds.length < 2) {
      setState(prev => ({ ...prev, error: 'Please select at least 2 events to compare' }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const comparisonData = await comparativeAnalyticsService.compareEvents(state.selectedEventIds);
      setState(prev => ({ ...prev, comparisonData, loading: false }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to compare events',
        loading: false 
      }));
    }
  }, [state.selectedEventIds]);

  // Calculate performance score
  const calculatePerformanceScore = useCallback(async (eventId: string, weights?: Record<string, number>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const score = await comparativeAnalyticsService.calculatePerformanceScore(eventId, weights);
      setState(prev => ({ 
        ...prev, 
        performanceScores: { ...prev.performanceScores, [eventId]: score },
        loading: false 
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to calculate performance score',
        loading: false 
      }));
    }
  }, []);

  // Load benchmark data
  const loadBenchmarkData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const benchmarkData = await comparativeAnalyticsService.getBenchmarkData();
      setState(prev => ({ ...prev, benchmarkData, loading: false }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to load benchmark data',
        loading: false 
      }));
    }
  }, []);

  // Load trend analysis
  const loadTrendAnalysis = useCallback(async (metric: string, timeRange: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const trend = await comparativeAnalyticsService.getTrendAnalysis(metric, timeRange);
      setState(prev => ({ 
        ...prev, 
        trendAnalysis: { ...prev.trendAnalysis, [metric]: trend },
        loading: false 
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to load trend analysis',
        loading: false 
      }));
    }
  }, []);

  // Load seasonal analysis
  const loadSeasonalAnalysis = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const seasonalPatterns = await comparativeAnalyticsService.getSeasonalAnalysis();
      setState(prev => ({ ...prev, seasonalPatterns, loading: false }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to load seasonal analysis',
        loading: false 
      }));
    }
  }, []);

  // Load venue comparison
  const loadVenueComparison = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const venueComparison = await comparativeAnalyticsService.getVenueComparison();
      setState(prev => ({ ...prev, venueComparison, loading: false }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to load venue comparison',
        loading: false 
      }));
    }
  }, []);

  // Load team performance
  const loadTeamPerformance = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const teamPerformance = await comparativeAnalyticsService.getTeamPerformanceAnalysis();
      setState(prev => ({ ...prev, teamPerformance, loading: false }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to load team performance',
        loading: false 
      }));
    }
  }, []);

  // Apply filters
  const applyFilters = useCallback((newFilters: Partial<UseComparativeAnalyticsState['filters']>) => {
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, ...newFilters }
    }));
  }, []);

  // Clear filters
  const clearFilters = useCallback(() => {
    setState(prev => ({
      ...prev,
      filters: {
        dateRange: null,
        eventTypes: [],
        venues: [],
        minRevenue: 0,
        maxRevenue: Infinity
      }
    }));
  }, []);

  // Search events
  const searchEvents = useCallback((query: string): EventMetrics[] => {
    const lowercaseQuery = query.toLowerCase();
    return state.events.filter(event =>
      event.eventName.toLowerCase().includes(lowercaseQuery) ||
      event.venue.toLowerCase().includes(lowercaseQuery) ||
      event.eventType.toLowerCase().includes(lowercaseQuery)
    );
  }, [state.events]);

  // Export data
  const exportData = useCallback(async (format: 'csv' | 'excel' | 'pdf') => {
    if (state.selectedEventIds.length === 0) {
      setState(prev => ({ ...prev, error: 'Please select events to export' }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const exportResult = await comparativeAnalyticsService.exportComparisonData(format, state.selectedEventIds);
      
      // Create and trigger download
      const blob = new Blob([JSON.stringify(exportResult.data)], { type: exportResult.mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = exportResult.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setState(prev => ({ ...prev, loading: false }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to export data',
        loading: false 
      }));
    }
  }, [state.selectedEventIds]);

  // Generate report
  const generateReport = useCallback(async (includeForecasting: boolean = false) => {
    if (state.selectedEventIds.length === 0) {
      setState(prev => ({ ...prev, error: 'Please select events to generate report' }));
      return null;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const report = await comparativeAnalyticsService.generateComparisonReport(state.selectedEventIds, includeForecasting);
      setState(prev => ({ ...prev, loading: false }));
      return report;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to generate report',
        loading: false 
      }));
      return null;
    }
  }, [state.selectedEventIds]);

  // Refresh all data
  const refresh = useCallback(async () => {
    await Promise.all([
      loadEvents(),
      loadBenchmarkData(),
      loadSeasonalAnalysis(),
      loadVenueComparison(),
      loadTeamPerformance()
    ]);
  }, [loadEvents, loadBenchmarkData, loadSeasonalAnalysis, loadVenueComparison, loadTeamPerformance]);

  // Set auto refresh
  const setAutoRefresh = useCallback((enabled: boolean, interval: number = 30000) => {
    setState(prev => ({ 
      ...prev, 
      autoRefresh: enabled, 
      refreshInterval: interval 
    }));
  }, []);

  // Get filtered events
  const getFilteredEvents = useCallback((): EventMetrics[] => {
    return state.events.filter(event => {
      const { dateRange, eventTypes, venues, minRevenue, maxRevenue } = state.filters;
      
      if (dateRange) {
        const eventDate = new Date(event.date);
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        if (eventDate < startDate || eventDate > endDate) return false;
      }
      
      if (eventTypes.length > 0 && !eventTypes.includes(event.eventType)) return false;
      if (venues.length > 0 && !venues.includes(event.venue)) return false;
      if (event.totalRevenue < minRevenue || event.totalRevenue > maxRevenue) return false;
      
      return true;
    });
  }, [state.events, state.filters]);

  // Get comparison insights
  const getComparisonInsights = useCallback((type?: string): ComparisonInsight[] => {
    if (!state.comparisonData) return [];
    
    if (type) {
      return state.comparisonData.insights.filter(insight => insight.type === type);
    }
    
    return state.comparisonData.insights;
  }, [state.comparisonData]);

  // Computed values
  const totalEvents = state.events.length;
  const averageRevenue = state.events.length > 0 
    ? state.events.reduce((sum, event) => sum + event.totalRevenue, 0) / state.events.length 
    : 0;
  const topPerformingEvent = state.events.length > 0 
    ? state.events.reduce((top, event) => event.totalRevenue > top.totalRevenue ? event : top) 
    : null;
  const performanceTrend = 'up' as const; // Simplified for demo

  // Load initial data
  useEffect(() => {
    loadEvents();
    loadBenchmarkData();
  }, [loadEvents, loadBenchmarkData]);

  return {
    ...state,
    loadEvents,
    selectEvent,
    deselectEvent,
    clearSelection,
    compareSelectedEvents,
    calculatePerformanceScore,
    loadBenchmarkData,
    loadTrendAnalysis,
    loadSeasonalAnalysis,
    loadVenueComparison,
    loadTeamPerformance,
    applyFilters,
    clearFilters,
    searchEvents,
    exportData,
    generateReport,
    refresh,
    setAutoRefresh,
    getFilteredEvents,
    getComparisonInsights,
    totalEvents,
    averageRevenue,
    topPerformingEvent,
    performanceTrend
  };
};