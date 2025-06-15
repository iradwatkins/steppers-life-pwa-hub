import { useState, useEffect, useCallback } from 'react';
import { 
  multiEventAnalyticsService, 
  MultiEventMetrics, 
  EventPerformance, 
  EventComparison,
  TrendAnalysis,
  AudienceOverlap,
  PredictiveInsights
} from '../services/multiEventAnalyticsService';
import { toast } from '@/components/ui/sonner';

export interface MultiEventFilters {
  dateRange: {
    start: string;
    end: string;
  };
  eventTypes: string[];
  venues: string[];
  categories: string[];
  minRevenue?: number;
  maxRevenue?: number;
  minAttendance?: number;
  maxAttendance?: number;
}

export interface DashboardWidget {
  id: string;
  type: 'overview' | 'comparison' | 'trends' | 'audience' | 'insights';
  title: string;
  position: { x: number; y: number; };
  size: { width: number; height: number; };
  visible: boolean;
}

interface UseMultiEventAnalyticsState {
  // Data
  metrics: MultiEventMetrics | null;
  trends: TrendAnalysis | null;
  audienceOverlap: AudienceOverlap | null;
  insights: PredictiveInsights | null;
  eventPerformances: EventPerformance[];
  
  // Comparison
  comparison: EventComparison | null;
  selectedEvents: string[];
  
  // Dashboard customization
  widgets: DashboardWidget[];
  dashboardLayout: string;
  
  // UI state
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  
  // Filters
  filters: MultiEventFilters;
  
  // Export
  exportInProgress: boolean;
}

interface UseMultiEventAnalyticsActions {
  // Data loading
  loadAnalytics: (organizerId: string) => Promise<void>;
  refreshData: () => Promise<void>;
  
  // Event comparison
  compareEvents: (eventId1: string, eventId2: string) => void;
  clearComparison: () => void;
  selectEvent: (eventId: string) => void;
  deselectEvent: (eventId: string) => void;
  
  // Filtering
  updateFilters: (newFilters: Partial<MultiEventFilters>) => void;
  resetFilters: () => void;
  applyFilters: () => void;
  
  // Dashboard customization
  updateWidget: (widgetId: string, updates: Partial<DashboardWidget>) => void;
  toggleWidget: (widgetId: string) => void;
  resetLayout: () => void;
  saveDashboardLayout: (layout: string) => void;
  
  // Export
  exportReport: (format: 'csv' | 'excel' | 'pdf') => Promise<void>;
  
  // Utility
  getEventById: (eventId: string) => EventPerformance | undefined;
  getTopPerformingEvents: (limit?: number) => EventPerformance[];
  getRecommendations: (type?: string) => PredictiveInsights['recommendations'];
}

type UseMultiEventAnalyticsReturn = UseMultiEventAnalyticsState & UseMultiEventAnalyticsActions;

const defaultFilters: MultiEventFilters = {
  dateRange: {
    start: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 year ago
    end: new Date().toISOString().split('T')[0] // today
  },
  eventTypes: [],
  venues: [],
  categories: []
};

const defaultWidgets: DashboardWidget[] = [
  {
    id: 'overview',
    type: 'overview',
    title: 'Portfolio Overview',
    position: { x: 0, y: 0 },
    size: { width: 12, height: 4 },
    visible: true
  },
  {
    id: 'comparison',
    type: 'comparison',
    title: 'Event Comparison',
    position: { x: 0, y: 4 },
    size: { width: 6, height: 4 },
    visible: true
  },
  {
    id: 'trends',
    type: 'trends',
    title: 'Trend Analysis',
    position: { x: 6, y: 4 },
    size: { width: 6, height: 4 },
    visible: true
  },
  {
    id: 'audience',
    type: 'audience',
    title: 'Audience Insights',
    position: { x: 0, y: 8 },
    size: { width: 8, height: 3 },
    visible: true
  },
  {
    id: 'insights',
    type: 'insights',
    title: 'Predictive Insights',
    position: { x: 8, y: 8 },
    size: { width: 4, height: 3 },
    visible: true
  }
];

export function useMultiEventAnalytics(organizerId?: string): UseMultiEventAnalyticsReturn {
  // State
  const [state, setState] = useState<UseMultiEventAnalyticsState>({
    // Data
    metrics: null,
    trends: null,
    audienceOverlap: null,
    insights: null,
    eventPerformances: [],
    
    // Comparison
    comparison: null,
    selectedEvents: [],
    
    // Dashboard customization
    widgets: defaultWidgets,
    dashboardLayout: 'default',
    
    // UI state
    loading: false,
    error: null,
    lastUpdated: null,
    
    // Filters
    filters: defaultFilters,
    
    // Export
    exportInProgress: false
  });

  // Load analytics data
  const loadAnalytics = useCallback(async (orgId: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      await multiEventAnalyticsService.loadEventData(orgId);
      
      const [metrics, trends, audienceOverlap, insights] = await Promise.all([
        multiEventAnalyticsService.getMultiEventMetrics(),
        multiEventAnalyticsService.getTrendAnalysis(),
        multiEventAnalyticsService.getAudienceOverlap(),
        multiEventAnalyticsService.getPredictiveInsights()
      ]);

      setState(prev => ({
        ...prev,
        metrics,
        trends,
        audienceOverlap,
        insights,
        eventPerformances: metrics.topPerformingEvents,
        loading: false,
        lastUpdated: new Date()
      }));

      toast.success('Analytics data loaded successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load analytics data';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      toast.error(errorMessage);
    }
  }, []);

  // Refresh data
  const refreshData = useCallback(async () => {
    if (organizerId) {
      await loadAnalytics(organizerId);
    }
  }, [organizerId, loadAnalytics]);

  // Event comparison
  const compareEvents = useCallback((eventId1: string, eventId2: string) => {
    try {
      const comparison = multiEventAnalyticsService.compareEvents(eventId1, eventId2);
      setState(prev => ({ 
        ...prev, 
        comparison,
        selectedEvents: [eventId1, eventId2]
      }));
      toast.success('Event comparison updated');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to compare events';
      toast.error(errorMessage);
    }
  }, []);

  const clearComparison = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      comparison: null, 
      selectedEvents: [] 
    }));
  }, []);

  const selectEvent = useCallback((eventId: string) => {
    setState(prev => {
      const newSelected = [...prev.selectedEvents];
      if (!newSelected.includes(eventId)) {
        newSelected.push(eventId);
        if (newSelected.length > 2) {
          newSelected.shift(); // Keep only 2 events for comparison
        }
      }
      return { ...prev, selectedEvents: newSelected };
    });
  }, []);

  const deselectEvent = useCallback((eventId: string) => {
    setState(prev => ({
      ...prev,
      selectedEvents: prev.selectedEvents.filter(id => id !== eventId)
    }));
  }, []);

  // Filtering
  const updateFilters = useCallback((newFilters: Partial<MultiEventFilters>) => {
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, ...newFilters }
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setState(prev => ({
      ...prev,
      filters: defaultFilters
    }));
  }, []);

  const applyFilters = useCallback(() => {
    // In a real implementation, this would re-fetch filtered data
    toast.success('Filters applied');
  }, []);

  // Dashboard customization
  const updateWidget = useCallback((widgetId: string, updates: Partial<DashboardWidget>) => {
    setState(prev => ({
      ...prev,
      widgets: prev.widgets.map(widget =>
        widget.id === widgetId ? { ...widget, ...updates } : widget
      )
    }));
  }, []);

  const toggleWidget = useCallback((widgetId: string) => {
    setState(prev => ({
      ...prev,
      widgets: prev.widgets.map(widget =>
        widget.id === widgetId ? { ...widget, visible: !widget.visible } : widget
      )
    }));
  }, []);

  const resetLayout = useCallback(() => {
    setState(prev => ({
      ...prev,
      widgets: defaultWidgets,
      dashboardLayout: 'default'
    }));
  }, []);

  const saveDashboardLayout = useCallback((layout: string) => {
    setState(prev => ({ ...prev, dashboardLayout: layout }));
    // In a real implementation, this would save to backend/localStorage
    toast.success('Dashboard layout saved');
  }, []);

  // Export
  const exportReport = useCallback(async (format: 'csv' | 'excel' | 'pdf') => {
    setState(prev => ({ ...prev, exportInProgress: true }));
    
    try {
      const blob = await multiEventAnalyticsService.exportMultiEventReport(format);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `multi-event-analytics.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setState(prev => ({ ...prev, exportInProgress: false }));
      toast.success(`Report exported as ${format.toUpperCase()}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Export failed';
      setState(prev => ({ ...prev, exportInProgress: false }));
      toast.error(errorMessage);
    }
  }, []);

  // Utility functions
  const getEventById = useCallback((eventId: string): EventPerformance | undefined => {
    return state.eventPerformances.find(event => event.eventId === eventId);
  }, [state.eventPerformances]);

  const getTopPerformingEvents = useCallback((limit = 5): EventPerformance[] => {
    return state.eventPerformances.slice(0, limit);
  }, [state.eventPerformances]);

  const getRecommendations = useCallback((type?: string) => {
    if (!state.insights) return [];
    
    if (type) {
      return state.insights.recommendations.filter(rec => rec.type === type);
    }
    
    return state.insights.recommendations;
  }, [state.insights]);

  // Auto-load data when organizerId changes
  useEffect(() => {
    if (organizerId) {
      loadAnalytics(organizerId);
    }
  }, [organizerId, loadAnalytics]);

  // Auto-compare when exactly 2 events are selected
  useEffect(() => {
    if (state.selectedEvents.length === 2) {
      compareEvents(state.selectedEvents[0], state.selectedEvents[1]);
    } else {
      setState(prev => ({ ...prev, comparison: null }));
    }
  }, [state.selectedEvents, compareEvents]);

  return {
    // State
    ...state,
    
    // Actions
    loadAnalytics,
    refreshData,
    compareEvents,
    clearComparison,
    selectEvent,
    deselectEvent,
    updateFilters,
    resetFilters,
    applyFilters,
    updateWidget,
    toggleWidget,
    resetLayout,
    saveDashboardLayout,
    exportReport,
    getEventById,
    getTopPerformingEvents,
    getRecommendations
  };
} 