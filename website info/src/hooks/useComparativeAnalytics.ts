import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import {
  comparativeAnalyticsService,
  EventComparisonMetrics,
  TimePeriodComparison,
  IndustryBenchmark,
  PerformanceScore,
  SuccessFactorAnalysis,
  VenuePerformanceAnalysis,
  MarketPositioning,
  SeasonalAnalysis,
  PredictiveModeling,
  MarketPositioningData,
  SeasonalTrendData,
  VenuePerformanceData,
  PricingAnalyticsData,
  MarketingChannelPerformanceData
} from '../services/comparativeAnalyticsService';

interface ComparisonState {
  selectedEvents: string[];
  comparisonData: EventComparisonMetrics[];
  timePeriodComparison: TimePeriodComparison | null;
  industryBenchmarks: Record<string, IndustryBenchmark>;
  performanceScores: Record<string, PerformanceScore>;
  successFactors: SuccessFactorAnalysis | null;
  venueAnalysis: Record<string, VenuePerformanceAnalysis>;
  marketPositioning: Record<string, MarketPositioningData>;
  seasonalAnalysis: Record<string, SeasonalTrendData>;
  predictiveModels: Record<string, PredictiveModeling>;
  pricingAnalytics: Record<string, PricingAnalyticsData>;
  marketingChannelPerformance: Record<string, MarketingChannelPerformanceData[]>;
  
  // UI State
  loading: boolean;
  error: string | null;
  exportLoading: boolean;
  refreshing: boolean;
  
  // Filter State
  filters: {
    category: string;
    region: string;
    eventSizeRange: 'small' | 'medium' | 'large' | 'enterprise';
    dateRange: {
      start: string;
      end: string;
    };
    comparisonType: 'YoY' | 'QoQ' | 'MoM' | 'Custom';
  };
  
  // Cache Management
  lastRefresh: string | null;
  cacheExpiry: number; // minutes
}

interface UseComparativeAnalyticsReturn {
  // State
  state: ComparisonState;
  
  // Event Comparison
  compareEvents: (eventIds: string[]) => Promise<void>;
  addEventToComparison: (eventId: string) => void;
  removeEventFromComparison: (eventId: string) => void;
  clearComparison: () => void;
  
  // Time Period Analysis
  getTimePeriodComparison: (
    eventIds: string[],
    comparisonType: 'YoY' | 'QoQ' | 'MoM' | 'Custom',
    startDate?: string,
    endDate?: string
  ) => Promise<void>;
  
  // Industry Benchmarking
  fetchIndustryBenchmarks: (
    category: string,
    region: string,
    eventSizeRange: 'small' | 'medium' | 'large' | 'enterprise'
  ) => Promise<void>;
  
  // Performance Analysis
  calculatePerformanceScores: (eventIds: string[]) => Promise<void>;
  analyzeSuccessFactors: (eventIds: string[]) => Promise<void>;
  
  // Venue & Market Analysis
  analyzeVenuePerformance: (venueId: string) => Promise<void>;
  analyzeMarketPositioning: (eventId: string) => Promise<void>;
  fetchSeasonalTrendData: () => Promise<void>;
  fetchVenueComparisonData: (venueId?: string) => Promise<void>;
  fetchMarketPositioningData: (eventId: string) => Promise<void>;
  
  // Pricing & Marketing Analytics
  fetchPricingAnalytics: (eventId: string) => Promise<void>;
  fetchMarketingChannelPerformance: (eventId: string) => Promise<void>;
  
  // Seasonal & Predictive Analysis
  fetchSeasonalAnalysis: (eventCategory: string) => Promise<void>;
  generatePredictiveModeling: (eventId: string) => Promise<void>;
  
  // Data Export
  exportComparisonData: (
    data: any,
    format: 'CSV' | 'Excel' | 'PDF' | 'JSON',
    filename?: string
  ) => Promise<void>;
  
  // Filters & Configuration
  updateFilters: (filters: Partial<ComparisonState['filters']>) => void;
  resetFilters: () => void;
  
  // Cache Management
  refreshData: () => Promise<void>;
  clearCache: () => void;
  
  // Computed Values
  comparisonSummary: {
    eventCount: number;
    totalRevenue: number;
    averageRating: number;
    averageSellThroughRate: number;
    bestPerformer: EventComparisonMetrics | null;
    worstPerformer: EventComparisonMetrics | null;
  };
  
  // Utilities
  getPerformanceScoreForEvent: (eventId: string) => PerformanceScore | null;
  getBenchmarkForCategory: (category: string) => IndustryBenchmark | null;
  isEventSelected: (eventId: string) => boolean;
  canExport: boolean;
}

const DEFAULT_FILTERS: ComparisonState['filters'] = {
  category: '',
  region: '',
  eventSizeRange: 'medium',
  dateRange: {
    start: '',
    end: ''
  },
  comparisonType: 'YoY'
};

const CACHE_EXPIRY_MINUTES = 15;

export const useComparativeAnalytics = (): UseComparativeAnalyticsReturn => {
  const [state, setState] = useState<ComparisonState>({
    selectedEvents: [],
    comparisonData: [],
    timePeriodComparison: null,
    industryBenchmarks: {},
    performanceScores: {},
    successFactors: null,
    venueAnalysis: {},
    marketPositioning: {},
    seasonalAnalysis: {},
    predictiveModels: {},
    pricingAnalytics: {},
    marketingChannelPerformance: {},
    
    loading: false,
    error: null,
    exportLoading: false,
    refreshing: false,
    
    filters: DEFAULT_FILTERS,
    
    lastRefresh: null,
    cacheExpiry: CACHE_EXPIRY_MINUTES
  });

  // Helper function to update state
  const updateState = useCallback((updates: Partial<ComparisonState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Helper function to handle errors
  const handleError = useCallback((error: any, operation: string) => {
    console.error(`Error in ${operation}:`, error);
    const errorMessage = error?.message || `Failed to ${operation}`;
    updateState({ error: errorMessage, loading: false });
    toast.error(errorMessage);
  }, [updateState]);

  // Event Comparison Functions
  const compareEvents = useCallback(async (eventIds: string[]) => {
    if (eventIds.length === 0) {
      toast.error('Please select at least one event to compare');
      return;
    }

    updateState({ loading: true, error: null });
    
    try {
      const comparisonData = await comparativeAnalyticsService.compareEvents(eventIds);
      
      updateState({
        selectedEvents: eventIds,
        comparisonData,
        loading: false,
        lastRefresh: new Date().toISOString()
      });
      
      toast.success(`Successfully compared ${eventIds.length} events`);
    } catch (error) {
      handleError(error, 'compare events');
    }
  }, [updateState, handleError]);

  const addEventToComparison = useCallback((eventId: string) => {
    setState(prev => {
      if (prev.selectedEvents.includes(eventId)) {
        toast.warning('Event already selected for comparison');
        return prev;
      }
      
      if (prev.selectedEvents.length >= 10) {
        toast.error('Maximum 10 events can be compared at once');
        return prev;
      }
      
      const newSelectedEvents = [...prev.selectedEvents, eventId];
      toast.success('Event added to comparison');
      
      // Auto-fetch comparison if we have events
      if (newSelectedEvents.length > 1) {
        compareEvents(newSelectedEvents);
      }
      
      return {
        ...prev,
        selectedEvents: newSelectedEvents
      };
    });
  }, [compareEvents]);

  const removeEventFromComparison = useCallback((eventId: string) => {
    setState(prev => {
      const newSelectedEvents = prev.selectedEvents.filter(id => id !== eventId);
      const newComparisonData = prev.comparisonData.filter(event => event.eventId !== eventId);
      
      toast.success('Event removed from comparison');
      
      return {
        ...prev,
        selectedEvents: newSelectedEvents,
        comparisonData: newComparisonData
      };
    });
  }, []);

  const clearComparison = useCallback(() => {
    updateState({
      selectedEvents: [],
      comparisonData: [],
      timePeriodComparison: null,
      performanceScores: {},
      successFactors: null,
      marketPositioning: {},
      seasonalAnalysis: {},
      venueAnalysis: {},
      pricingAnalytics: {},
      marketingChannelPerformance: {},
    });
    toast.success('Comparison cleared');
  }, [updateState]);

  // Time Period Analysis
  const getTimePeriodComparison = useCallback(async (
    eventIds: string[],
    comparisonType: 'YoY' | 'QoQ' | 'MoM' | 'Custom',
    startDate?: string,
    endDate?: string
  ) => {
    updateState({ loading: true, error: null });
    
    try {
      const timePeriodComparison = await comparativeAnalyticsService.getTimePeriodComparison(
        eventIds,
        comparisonType,
        startDate,
        endDate
      );
      
      updateState({
        timePeriodComparison,
        loading: false,
        filters: { ...state.filters, comparisonType }
      });
      
      toast.success('Time period comparison generated');
    } catch (error) {
      handleError(error, 'generate time period comparison');
    }
  }, [updateState, handleError, state.filters]);

  // Industry Benchmarking
  const fetchIndustryBenchmarks = useCallback(async (
    category: string,
    region: string,
    eventSizeRange: 'small' | 'medium' | 'large' | 'enterprise'
  ) => {
    updateState({ loading: true, error: null });
    
    try {
      const benchmark = await comparativeAnalyticsService.getIndustryBenchmarks(
        category,
        region,
        eventSizeRange
      );
      
      const benchmarkKey = `${category}_${region}_${eventSizeRange}`;
      
      updateState({
        industryBenchmarks: {
          ...state.industryBenchmarks,
          [benchmarkKey]: benchmark
        },
        loading: false,
        filters: { ...state.filters, category, region, eventSizeRange }
      });
      
      toast.success('Industry benchmarks loaded');
    } catch (error) {
      handleError(error, 'fetch industry benchmarks');
    }
  }, [updateState, handleError, state.industryBenchmarks, state.filters]);

  // Performance Analysis
  const calculatePerformanceScores = useCallback(async (eventIds: string[]) => {
    updateState({ loading: true, error: null });
    
    try {
      const scores: Record<string, PerformanceScore> = {};
      
      // Calculate scores for each event
      for (const eventId of eventIds) {
        const eventMetrics = state.comparisonData.find(e => e.eventId === eventId);
        if (eventMetrics) {
          const score = await comparativeAnalyticsService.calculatePerformanceScore(eventMetrics);
          scores[eventId] = score;
        }
      }
      
      updateState({
        performanceScores: { ...state.performanceScores, ...scores },
        loading: false
      });
      
      toast.success(`Performance scores calculated for ${eventIds.length} events`);
    } catch (error) {
      handleError(error, 'calculate performance scores');
    }
  }, [updateState, handleError, state.comparisonData, state.performanceScores]);

  const analyzeSuccessFactors = useCallback(async (eventIds: string[]) => {
    updateState({ loading: true, error: null });
    
    try {
      const eventMetrics = state.comparisonData.filter(e => eventIds.includes(e.eventId));
      const successFactors = await comparativeAnalyticsService.analyzeSuccessFactors(eventMetrics);
      
      updateState({
        successFactors,
        loading: false
      });
      
      toast.success('Success factors analysis completed');
    } catch (error) {
      handleError(error, 'analyze success factors');
    }
  }, [updateState, handleError, state.comparisonData]);

  // Venue & Market Analysis
  const analyzeVenuePerformance = useCallback(async (venueId: string) => {
    updateState({ loading: true, error: null });
    
    try {
      const venueAnalysis = await comparativeAnalyticsService.analyzeVenuePerformance(venueId);
      
      updateState({
        venueAnalysis: {
          ...state.venueAnalysis,
          [venueId]: venueAnalysis
        },
        loading: false
      });
      
      toast.success('Venue performance analysis completed');
    } catch (error) {
      handleError(error, 'analyze venue performance');
    }
  }, [updateState, handleError, state.venueAnalysis]);

  const analyzeMarketPositioning = useCallback(async (eventId: string) => {
    updateState({ loading: true, error: null });
    
    try {
      const marketPositioning = await comparativeAnalyticsService.analyzeMarketPositioning(eventId);
      
      updateState({
        marketPositioning: {
          ...state.marketPositioning,
          [eventId]: marketPositioning
        },
        loading: false
      });
      
      toast.success('Market positioning analysis completed');
    } catch (error) {
      handleError(error, 'analyze market positioning');
    }
  }, [updateState, handleError, state.marketPositioning]);

  // Seasonal & Predictive Analysis
  const fetchSeasonalAnalysis = useCallback(async (eventCategory: string) => {
    updateState({ loading: true, error: null });
    
    try {
      const seasonalAnalysis = await comparativeAnalyticsService.analyzeSeasonalTrends(eventCategory);
      
      updateState({
        seasonalAnalysis: {
          ...state.seasonalAnalysis,
          [eventCategory]: seasonalAnalysis
        },
        loading: false
      });
      
      toast.success('Seasonal analysis completed');
    } catch (error) {
      handleError(error, 'fetch seasonal analysis');
    }
  }, [updateState, handleError, state.seasonalAnalysis]);

  const generatePredictiveModeling = useCallback(async (eventId: string) => {
    updateState({ loading: true, error: null });
    
    try {
      const predictiveModel = await comparativeAnalyticsService.generatePredictiveModeling(eventId);
      
      updateState({
        predictiveModels: {
          ...state.predictiveModels,
          [eventId]: predictiveModel
        },
        loading: false
      });
      
      toast.success('Predictive modeling completed');
    } catch (error) {
      handleError(error, 'generate predictive modeling');
    }
  }, [updateState, handleError, state.predictiveModels]);

  // Data Export
  const exportComparisonData = useCallback(async (
    data: any,
    format: 'CSV' | 'Excel' | 'PDF' | 'JSON',
    filename?: string
  ) => {
    updateState({ exportLoading: true });
    
    try {
      const blob = await comparativeAnalyticsService.exportComparisonData(data, format);
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const timestamp = new Date().toISOString().split('T')[0];
      const defaultFilename = `comparative-analytics-${timestamp}`;
      link.download = filename || `${defaultFilename}.${format.toLowerCase()}`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      updateState({ exportLoading: false });
      toast.success(`Data exported as ${format}`);
    } catch (error) {
      updateState({ exportLoading: false });
      handleError(error, 'export data');
    }
  }, [updateState, handleError]);

  // Filters & Configuration
  const updateFilters = useCallback((newFilters: Partial<ComparisonState['filters']>) => {
    updateState({
      filters: { ...state.filters, ...newFilters }
    });
  }, [updateState, state.filters]);

  const resetFilters = useCallback(() => {
    updateState({ filters: DEFAULT_FILTERS });
    toast.success('Filters reset to default');
  }, [updateState]);

  // Cache Management
  const refreshData = useCallback(async () => {
    updateState({ refreshing: true });
    
    try {
      // Refresh comparison data if events are selected
      if (state.selectedEvents.length > 0) {
        await compareEvents(state.selectedEvents);
      }
      
      // Refresh performance scores
      if (Object.keys(state.performanceScores).length > 0) {
        await calculatePerformanceScores(state.selectedEvents);
      }
      
      updateState({
        refreshing: false,
        lastRefresh: new Date().toISOString()
      });
      
      toast.success('Data refreshed successfully');
    } catch (error) {
      updateState({ refreshing: false });
      handleError(error, 'refresh data');
    }
  }, [updateState, state.selectedEvents, state.performanceScores, compareEvents, calculatePerformanceScores]);

  const clearCache = useCallback(() => {
    updateState({
      comparisonData: [],
      timePeriodComparison: null,
      industryBenchmarks: {},
      performanceScores: {},
      successFactors: null,
      venueAnalysis: {},
      marketPositioning: {},
      seasonalAnalysis: {},
      predictiveModels: {},
      pricingAnalytics: {},
      marketingChannelPerformance: {},
      lastRefresh: null
    });
    toast.success('Cache cleared');
  }, [updateState]);

  // Computed Values
  const comparisonSummary = useMemo(() => {
    const { comparisonData } = state;
    
    if (comparisonData.length === 0) {
      return {
        eventCount: 0,
        totalRevenue: 0,
        averageRating: 0,
        averageSellThroughRate: 0,
        bestPerformer: null,
        worstPerformer: null
      };
    }
    
    const totalRevenue = comparisonData.reduce((sum, event) => sum + event.totalRevenue, 0);
    const averageRating = comparisonData.reduce((sum, event) => sum + event.averageRating, 0) / comparisonData.length;
    const averageSellThroughRate = comparisonData.reduce((sum, event) => sum + event.sellThroughRate, 0) / comparisonData.length;
    
    // Find best and worst performers based on total revenue
    const sortedByRevenue = [...comparisonData].sort((a, b) => b.totalRevenue - a.totalRevenue);
    const bestPerformer = sortedByRevenue[0] || null;
    const worstPerformer = sortedByRevenue[sortedByRevenue.length - 1] || null;
    
    return {
      eventCount: comparisonData.length,
      totalRevenue,
      averageRating,
      averageSellThroughRate,
      bestPerformer,
      worstPerformer
    };
  }, [state.comparisonData]);

  // Utility Functions
  const getPerformanceScoreForEvent = useCallback((eventId: string): PerformanceScore | null => {
    return state.performanceScores[eventId] || null;
  }, [state.performanceScores]);

  const getBenchmarkForCategory = useCallback((category: string): IndustryBenchmark | null => {
    const key = Object.keys(state.industryBenchmarks).find(k => k.startsWith(category));
    return key ? state.industryBenchmarks[key] : null;
  }, [state.industryBenchmarks]);

  const isEventSelected = useCallback((eventId: string): boolean => {
    return state.selectedEvents.includes(eventId);
  }, [state.selectedEvents]);

  const canExport = useMemo(() => {
    return state.comparisonData.length > 0 && !state.exportLoading;
  }, [state.comparisonData.length, state.exportLoading]);

  // Auto-refresh data when cache expires
  useEffect(() => {
    if (!state.lastRefresh) return;
    
    const refreshInterval = setInterval(() => {
      const now = new Date();
      const lastRefresh = new Date(state.lastRefresh!);
      const minutesSinceRefresh = (now.getTime() - lastRefresh.getTime()) / (1000 * 60);
      
      if (minutesSinceRefresh >= state.cacheExpiry) {
        refreshData();
      }
    }, 60000); // Check every minute
    
    return () => clearInterval(refreshInterval);
  }, [state.lastRefresh, state.cacheExpiry, refreshData]);

  return {
    // State
    state,
    
    // Event Comparison
    compareEvents,
    addEventToComparison,
    removeEventFromComparison,
    clearComparison,
    
    // Time Period Analysis
    getTimePeriodComparison,
    
    // Industry Benchmarking
    fetchIndustryBenchmarks,
    
    // Performance Analysis
    calculatePerformanceScores,
    analyzeSuccessFactors,
    
    // Venue & Market Analysis
    analyzeVenuePerformance,
    analyzeMarketPositioning,
    
    // Seasonal & Predictive Analysis
    fetchSeasonalAnalysis,
    generatePredictiveModeling,
    
    // Data Export
    exportComparisonData,
    
    // Filters & Configuration
    updateFilters,
    resetFilters,
    
    // Cache Management
    refreshData,
    clearCache,
    
    // Computed Values
    comparisonSummary,
    
    // Utilities
    getPerformanceScoreForEvent,
    getBenchmarkForCategory,
    isEventSelected,
    canExport
  };
}; 