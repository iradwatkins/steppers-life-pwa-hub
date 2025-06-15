import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import {
  customerAnalyticsService,
  CustomerDemographics,
  BehavioralData,
  CustomerLifetimeValue,
  ChurnAnalysis,
  EventPreferences,
  PurchasePattern,
  CustomerFeedback,
  CustomerSegment,
  SegmentationAnalytics,
  PersonalizationRecommendation
} from '@/services/customerAnalyticsService';

interface UseCustomerAnalyticsState {
  // Data states
  demographics: CustomerDemographics[];
  behavioralData: BehavioralData[];
  clvData: CustomerLifetimeValue[];
  churnAnalysis: ChurnAnalysis[];
  eventPreferences: EventPreferences[];
  purchasePatterns: PurchasePattern[];
  customerFeedback: CustomerFeedback[];
  segments: CustomerSegment[];
  segmentationAnalytics: SegmentationAnalytics | null;
  
  // UI states
  loading: boolean;
  error: string | null;
  selectedSegment: CustomerSegment | null;
  selectedCustomerId: string | null;
  activeTab: string;
  
  // Filter states
  demographicFilters: {
    ageGroups: string[];
    locations: string[];
    incomelevels: string[];
    interests: string[];
  };
  behaviorFilters: {
    valueSegments: string[];
    churnRisks: string[];
    engagementLevels: string[];
  };
}

interface UseCustomerAnalyticsOptions {
  eventId: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function useCustomerAnalytics({ eventId, autoRefresh = false, refreshInterval = 30000 }: UseCustomerAnalyticsOptions) {
  const [state, setState] = useState<UseCustomerAnalyticsState>({
    demographics: [],
    behavioralData: [],
    clvData: [],
    churnAnalysis: [],
    eventPreferences: [],
    purchasePatterns: [],
    customerFeedback: [],
    segments: [],
    segmentationAnalytics: null,
    loading: false,
    error: null,
    selectedSegment: null,
    selectedCustomerId: null,
    activeTab: 'overview',
    demographicFilters: {
      ageGroups: [],
      locations: [],
      incomelevels: [],
      interests: []
    },
    behaviorFilters: {
      valueSegments: [],
      churnRisks: [],
      engagementLevels: []
    }
  });

  // Load all customer analytics data
  const loadAllData = useCallback(async () => {
    if (!eventId) return;
    
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const [
        demographics,
        behavioralData,
        clvData,
        churnAnalysis,
        eventPreferences,
        purchasePatterns,
        customerFeedback,
        segments,
        segmentationAnalytics
      ] = await Promise.all([
        customerAnalyticsService.getCustomerDemographics(eventId),
        customerAnalyticsService.getBehavioralSegmentation(eventId),
        customerAnalyticsService.getCustomerLifetimeValues(eventId),
        customerAnalyticsService.getChurnAnalysis(eventId),
        customerAnalyticsService.getEventPreferences(eventId),
        customerAnalyticsService.getPurchasePatterns(eventId),
        customerAnalyticsService.getCustomerFeedback(eventId),
        customerAnalyticsService.getCustomerSegments(eventId),
        customerAnalyticsService.getSegmentationAnalytics(eventId)
      ]);

      setState(prev => ({
        ...prev,
        demographics,
        behavioralData,
        clvData,
        churnAnalysis,
        eventPreferences,
        purchasePatterns,
        customerFeedback,
        segments,
        segmentationAnalytics,
        loading: false
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load customer analytics';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    }
  }, [eventId]);

  // Load specific data sections
  const loadDemographics = useCallback(async () => {
    if (!eventId) return;
    
    try {
      const demographics = await customerAnalyticsService.getCustomerDemographics(eventId);
      setState(prev => ({ ...prev, demographics }));
    } catch (error) {
      const errorMessage = 'Failed to load demographics data';
      setState(prev => ({ ...prev, error: errorMessage }));
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    }
  }, [eventId]);

  const loadBehavioralData = useCallback(async () => {
    if (!eventId) return;
    
    try {
      const behavioralData = await customerAnalyticsService.getBehavioralSegmentation(eventId);
      setState(prev => ({ ...prev, behavioralData }));
    } catch (error) {
      const errorMessage = 'Failed to load behavioral data';
      setState(prev => ({ ...prev, error: errorMessage }));
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    }
  }, [eventId]);

  const loadCLVData = useCallback(async () => {
    if (!eventId) return;
    
    try {
      const clvData = await customerAnalyticsService.getCustomerLifetimeValues(eventId);
      setState(prev => ({ ...prev, clvData }));
    } catch (error) {
      const errorMessage = 'Failed to load CLV data';
      setState(prev => ({ ...prev, error: errorMessage }));
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    }
  }, [eventId]);

  const loadChurnAnalysis = useCallback(async () => {
    if (!eventId) return;
    
    try {
      const churnAnalysis = await customerAnalyticsService.getChurnAnalysis(eventId);
      setState(prev => ({ ...prev, churnAnalysis }));
    } catch (error) {
      const errorMessage = 'Failed to load churn analysis';
      setState(prev => ({ ...prev, error: errorMessage }));
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    }
  }, [eventId]);

  const loadSegments = useCallback(async () => {
    if (!eventId) return;
    
    try {
      const segments = await customerAnalyticsService.getCustomerSegments(eventId);
      setState(prev => ({ ...prev, segments }));
    } catch (error) {
      const errorMessage = 'Failed to load segments';
      setState(prev => ({ ...prev, error: errorMessage }));
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    }
  }, [eventId]);

  // Segment management
  const createSegment = useCallback(async (
    name: string,
    description: string,
    criteria: CustomerSegment['criteria']
  ) => {
    if (!eventId) return null;
    
    try {
      setState(prev => ({ ...prev, loading: true }));
      const newSegment = await customerAnalyticsService.createCustomSegment(eventId, name, description, criteria);
      setState(prev => ({
        ...prev,
        segments: [...prev.segments, newSegment],
        loading: false
      }));
      
      toast({
        title: 'Success',
        description: 'Customer segment created successfully'
      });
      
      return newSegment;
    } catch (error) {
      const errorMessage = 'Failed to create segment';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
      return null;
    }
  }, [eventId]);

  const updateSegment = useCallback(async (segmentId: string, updates: Partial<CustomerSegment>) => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      const updatedSegment = await customerAnalyticsService.updateSegment(segmentId, updates);
      setState(prev => ({
        ...prev,
        segments: prev.segments.map(s => s.id === segmentId ? updatedSegment : s),
        selectedSegment: prev.selectedSegment?.id === segmentId ? updatedSegment : prev.selectedSegment,
        loading: false
      }));
      
      toast({
        title: 'Success',
        description: 'Segment updated successfully'
      });
      
      return updatedSegment;
    } catch (error) {
      const errorMessage = 'Failed to update segment';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
      return null;
    }
  }, []);

  const deleteSegment = useCallback(async (segmentId: string) => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      await customerAnalyticsService.deleteSegment(segmentId);
      setState(prev => ({
        ...prev,
        segments: prev.segments.filter(s => s.id !== segmentId),
        selectedSegment: prev.selectedSegment?.id === segmentId ? null : prev.selectedSegment,
        loading: false
      }));
      
      toast({
        title: 'Success',
        description: 'Segment deleted successfully'
      });
    } catch (error) {
      const errorMessage = 'Failed to delete segment';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    }
  }, []);

  const exportSegment = useCallback(async (segmentId: string, format: 'csv' | 'excel' | 'json') => {
    try {
      const exportUrl = await customerAnalyticsService.exportSegment(segmentId, format);
      
      // Create download link
      const link = document.createElement('a');
      link.href = exportUrl;
      link.download = `segment_${segmentId}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: 'Success',
        description: `Segment exported as ${format.toUpperCase()}`
      });
    } catch (error) {
      const errorMessage = 'Failed to export segment';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    }
  }, []);

  // Personalization recommendations
  const getPersonalizationRecommendations = useCallback(async (customerId: string): Promise<PersonalizationRecommendation | null> => {
    try {
      const recommendations = await customerAnalyticsService.getPersonalizationRecommendations(customerId);
      return recommendations;
    } catch (error) {
      const errorMessage = 'Failed to load personalization recommendations';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
      return null;
    }
  }, []);

  // Filtering functions
  const applyDemographicFilters = useCallback((filters: Partial<UseCustomerAnalyticsState['demographicFilters']>) => {
    setState(prev => ({
      ...prev,
      demographicFilters: { ...prev.demographicFilters, ...filters }
    }));
  }, []);

  const applyBehaviorFilters = useCallback((filters: Partial<UseCustomerAnalyticsState['behaviorFilters']>) => {
    setState(prev => ({
      ...prev,
      behaviorFilters: { ...prev.behaviorFilters, ...filters }
    }));
  }, []);

  const clearAllFilters = useCallback(() => {
    setState(prev => ({
      ...prev,
      demographicFilters: {
        ageGroups: [],
        locations: [],
        incomelevels: [],
        interests: []
      },
      behaviorFilters: {
        valueSegments: [],
        churnRisks: [],
        engagementLevels: []
      }
    }));
  }, []);

  // Get filtered data
  const getFilteredDemographics = useCallback(() => {
    let filtered = state.demographics;
    
    if (state.demographicFilters.ageGroups.length > 0) {
      filtered = filtered.filter(d => state.demographicFilters.ageGroups.includes(d.ageGroup));
    }
    
    if (state.demographicFilters.locations.length > 0) {
      filtered = filtered.filter(d => state.demographicFilters.locations.includes(d.location.city));
    }
    
    if (state.demographicFilters.incomelevels.length > 0) {
      filtered = filtered.filter(d => state.demographicFilters.incomelevels.includes(d.incomeLevel));
    }
    
    if (state.demographicFilters.interests.length > 0) {
      filtered = filtered.filter(d => 
        d.interests.some(interest => state.demographicFilters.interests.includes(interest))
      );
    }
    
    return filtered;
  }, [state.demographics, state.demographicFilters]);

  const getFilteredCLVData = useCallback(() => {
    let filtered = state.clvData;
    
    if (state.behaviorFilters.valueSegments.length > 0) {
      filtered = filtered.filter(clv => state.behaviorFilters.valueSegments.includes(clv.valueSegment));
    }
    
    return filtered;
  }, [state.clvData, state.behaviorFilters]);

  const getFilteredChurnAnalysis = useCallback(() => {
    let filtered = state.churnAnalysis;
    
    if (state.behaviorFilters.churnRisks.length > 0) {
      filtered = filtered.filter(churn => state.behaviorFilters.churnRisks.includes(churn.churnRisk));
    }
    
    return filtered;
  }, [state.churnAnalysis, state.behaviorFilters]);

  // Analytics helpers
  const getSegmentMetrics = useCallback(() => {
    return {
      totalCustomers: state.demographics.length,
      highValueCustomers: state.clvData.filter(clv => clv.valueSegment === 'High Value').length,
      atRiskCustomers: state.churnAnalysis.filter(churn => churn.churnRisk === 'High' || churn.churnRisk === 'Critical').length,
      averageCLV: state.clvData.reduce((sum, clv) => sum + clv.totalLifetimeValue, 0) / state.clvData.length || 0,
      topSegmentsByRevenue: state.segmentationAnalytics?.topSegments.slice(0, 3) || []
    };
  }, [state.demographics, state.clvData, state.churnAnalysis, state.segmentationAnalytics]);

  // UI state management
  const setActiveTab = useCallback((tab: string) => {
    setState(prev => ({ ...prev, activeTab: tab }));
  }, []);

  const setSelectedSegment = useCallback((segment: CustomerSegment | null) => {
    setState(prev => ({ ...prev, selectedSegment: segment }));
  }, []);

  const setSelectedCustomerId = useCallback((customerId: string | null) => {
    setState(prev => ({ ...prev, selectedCustomerId: customerId }));
  }, []);

  // Auto-refresh setup
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (autoRefresh && refreshInterval > 0) {
      interval = setInterval(() => {
        loadAllData();
      }, refreshInterval);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [autoRefresh, refreshInterval, loadAllData]);

  // Initial data load
  useEffect(() => {
    if (eventId) {
      loadAllData();
    }
  }, [eventId, loadAllData]);

  return {
    // Data
    demographics: getFilteredDemographics(),
    behavioralData: state.behavioralData,
    clvData: getFilteredCLVData(),
    churnAnalysis: getFilteredChurnAnalysis(),
    eventPreferences: state.eventPreferences,
    purchasePatterns: state.purchasePatterns,
    customerFeedback: state.customerFeedback,
    segments: state.segments,
    segmentationAnalytics: state.segmentationAnalytics,
    
    // UI state
    loading: state.loading,
    error: state.error,
    selectedSegment: state.selectedSegment,
    selectedCustomerId: state.selectedCustomerId,
    activeTab: state.activeTab,
    
    // Filters
    demographicFilters: state.demographicFilters,
    behaviorFilters: state.behaviorFilters,
    
    // Actions
    loadAllData,
    loadDemographics,
    loadBehavioralData,
    loadCLVData,
    loadChurnAnalysis,
    loadSegments,
    
    // Segment management
    createSegment,
    updateSegment,
    deleteSegment,
    exportSegment,
    
    // Personalization
    getPersonalizationRecommendations,
    
    // Filtering
    applyDemographicFilters,
    applyBehaviorFilters,
    clearAllFilters,
    
    // Helpers
    getSegmentMetrics,
    
    // UI state setters
    setActiveTab,
    setSelectedSegment,
    setSelectedCustomerId
  };
} 