// React Hook for Trackable Links Management - Epic F.003
import { useState, useEffect, useCallback } from 'react';
import { trackableLinkService } from '@/services/trackableLinkService';
import type {
  TrackableLink,
  LinkAnalytics,
  VanityUrlRequest,
  LinkPerformance,
  ClickEvent
} from '@/services/trackableLinkService';

interface UseTrackableLinksResult {
  // Data
  links: TrackableLink[];
  selectedLinkAnalytics: LinkAnalytics | null;
  selectedLinkPerformance: LinkPerformance | null;
  
  // Loading states
  loading: boolean;
  loadingAnalytics: boolean;
  loadingPerformance: boolean;
  saving: boolean;
  
  // Error state
  error: string | null;
  
  // Actions
  refreshLinks: () => Promise<void>;
  generateLink: (agentId: string, eventId: string, options: {
    title: string;
    description?: string;
    vanityUrl?: string;
    expiresAt?: string;
  }) => Promise<TrackableLink>;
  updateLink: (linkId: string, updates: Partial<Pick<TrackableLink, 'title' | 'description' | 'is_active' | 'expires_at'>>) => Promise<TrackableLink>;
  deactivateLink: (linkId: string) => Promise<void>;
  
  // Analytics
  getLinkAnalytics: (linkId: string, dateRange?: { start: string; end: string }) => Promise<LinkAnalytics>;
  getLinkPerformance: (linkId: string) => Promise<LinkPerformance>;
  
  // Vanity URLs
  checkVanityUrlAvailability: (vanityUrl: string) => Promise<boolean>;
  requestVanityUrl: (request: VanityUrlRequest) => Promise<{ approved: boolean; assignedUrl: string; reason?: string }>;
  
  // Tracking
  trackClick: (linkCode: string, clickData: Omit<ClickEvent, 'id' | 'link_id' | 'clicked_at'>) => Promise<ClickEvent>;
  recordConversion: (linkId: string, conversionData: {
    sale_amount: number;
    sale_id: string;
    customer_id: string;
    session_id: string;
  }) => Promise<void>;
  
  // Export
  exportLinkData: (agentId: string, format: 'csv' | 'excel' | 'pdf') => Promise<void>;
  
  // Computed values
  totalClicks: number;
  totalConversions: number;
  totalRevenue: number;
  averageConversionRate: number;
  topPerformingLink: TrackableLink | null;
  activeLinksCount: number;
}

export const useTrackableLinks = (agentId: string): UseTrackableLinksResult => {
  // State
  const [links, setLinks] = useState<TrackableLink[]>([]);
  const [selectedLinkAnalytics, setSelectedLinkAnalytics] = useState<LinkAnalytics | null>(null);
  const [selectedLinkPerformance, setSelectedLinkPerformance] = useState<LinkPerformance | null>(null);
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [loadingPerformance, setLoadingPerformance] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Error state
  const [error, setError] = useState<string | null>(null);

  // Fetch agent links
  const fetchLinks = useCallback(async () => {
    try {
      setError(null);
      const agentLinks = await trackableLinkService.getAgentLinks(agentId);
      setLinks(agentLinks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch links');
    }
  }, [agentId]);

  // Refresh links data
  const refreshLinks = useCallback(async () => {
    setLoading(true);
    try {
      await fetchLinks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh links');
    } finally {
      setLoading(false);
    }
  }, [fetchLinks]);

  // Generate new trackable link
  const generateLink = useCallback(async (
    agentId: string,
    eventId: string,
    options: {
      title: string;
      description?: string;
      vanityUrl?: string;
      expiresAt?: string;
    }
  ) => {
    try {
      setSaving(true);
      setError(null);
      
      const newLink = await trackableLinkService.generateTrackableLink(agentId, eventId, options);
      setLinks(prev => [newLink, ...prev]);
      
      return newLink;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to generate link';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setSaving(false);
    }
  }, []);

  // Update link details
  const updateLink = useCallback(async (
    linkId: string,
    updates: Partial<Pick<TrackableLink, 'title' | 'description' | 'is_active' | 'expires_at'>>
  ) => {
    try {
      setSaving(true);
      setError(null);
      
      const updatedLink = await trackableLinkService.updateLink(linkId, updates);
      setLinks(prev => prev.map(link => 
        link.id === linkId ? updatedLink : link
      ));
      
      return updatedLink;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update link';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setSaving(false);
    }
  }, []);

  // Deactivate link
  const deactivateLink = useCallback(async (linkId: string) => {
    try {
      setSaving(true);
      setError(null);
      
      await trackableLinkService.deactivateLink(linkId);
      setLinks(prev => prev.map(link => 
        link.id === linkId ? { ...link, is_active: false } : link
      ));
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to deactivate link';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setSaving(false);
    }
  }, []);

  // Get link analytics
  const getLinkAnalytics = useCallback(async (linkId: string, dateRange?: { start: string; end: string }) => {
    try {
      setLoadingAnalytics(true);
      setError(null);
      
      const analytics = await trackableLinkService.getLinkAnalytics(linkId, dateRange);
      setSelectedLinkAnalytics(analytics);
      
      return analytics;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch analytics';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoadingAnalytics(false);
    }
  }, []);

  // Get link performance insights
  const getLinkPerformance = useCallback(async (linkId: string) => {
    try {
      setLoadingPerformance(true);
      setError(null);
      
      const performance = await trackableLinkService.getLinkPerformance(linkId);
      setSelectedLinkPerformance(performance);
      
      return performance;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch performance data';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoadingPerformance(false);
    }
  }, []);

  // Check vanity URL availability
  const checkVanityUrlAvailability = useCallback(async (vanityUrl: string) => {
    try {
      return await trackableLinkService.checkVanityUrlAvailability(vanityUrl);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to check URL availability';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }, []);

  // Request vanity URL
  const requestVanityUrl = useCallback(async (request: VanityUrlRequest) => {
    try {
      setSaving(true);
      setError(null);
      
      const result = await trackableLinkService.requestVanityUrl(request);
      
      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to request vanity URL';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setSaving(false);
    }
  }, []);

  // Track click event
  const trackClick = useCallback(async (linkCode: string, clickData: Omit<ClickEvent, 'id' | 'link_id' | 'clicked_at'>) => {
    try {
      const clickEvent = await trackableLinkService.trackClick(linkCode, clickData);
      
      // Update link stats locally
      setLinks(prev => prev.map(link => 
        link.link_code === linkCode 
          ? { 
              ...link, 
              click_count: link.click_count + 1,
              last_clicked: clickEvent.clicked_at,
              conversion_count: clickEvent.converted ? link.conversion_count + 1 : link.conversion_count
            }
          : link
      ));
      
      return clickEvent;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to track click';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }, []);

  // Record conversion
  const recordConversion = useCallback(async (linkId: string, conversionData: {
    sale_amount: number;
    sale_id: string;
    customer_id: string;
    session_id: string;
  }) => {
    try {
      await trackableLinkService.recordConversion(linkId, conversionData);
      
      // Update link stats locally
      setLinks(prev => prev.map(link => 
        link.id === linkId 
          ? { 
              ...link, 
              conversion_count: link.conversion_count + 1,
              revenue_generated: link.revenue_generated + conversionData.sale_amount
            }
          : link
      ));
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to record conversion';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }, []);

  // Export link data
  const exportLinkData = useCallback(async (agentId: string, format: 'csv' | 'excel' | 'pdf') => {
    try {
      await trackableLinkService.exportLinkData(agentId, format);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to export data';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }, []);

  // Computed values
  const totalClicks = links.reduce((sum, link) => sum + link.click_count, 0);
  const totalConversions = links.reduce((sum, link) => sum + link.conversion_count, 0);
  const totalRevenue = links.reduce((sum, link) => sum + link.revenue_generated, 0);
  const averageConversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
  const activeLinksCount = links.filter(link => link.is_active).length;
  
  const topPerformingLink = links.length > 0 
    ? links.reduce((top, link) => {
        const linkScore = link.conversion_count * link.revenue_generated;
        const topScore = top.conversion_count * top.revenue_generated;
        return linkScore > topScore ? link : top;
      })
    : null;

  // Initial load
  useEffect(() => {
    if (agentId) {
      refreshLinks();
    }
  }, [agentId, refreshLinks]);

  // Auto-refresh active links
  useEffect(() => {
    if (!agentId || activeLinksCount === 0) return;

    const interval = setInterval(() => {
      // Refresh links data every 2 minutes for active campaigns
      fetchLinks();
    }, 120000);

    return () => clearInterval(interval);
  }, [agentId, activeLinksCount, fetchLinks]);

  return {
    // Data
    links,
    selectedLinkAnalytics,
    selectedLinkPerformance,
    
    // Loading states
    loading,
    loadingAnalytics,
    loadingPerformance,
    saving,
    
    // Error state
    error,
    
    // Actions
    refreshLinks,
    generateLink,
    updateLink,
    deactivateLink,
    
    // Analytics
    getLinkAnalytics,
    getLinkPerformance,
    
    // Vanity URLs
    checkVanityUrlAvailability,
    requestVanityUrl,
    
    // Tracking
    trackClick,
    recordConversion,
    
    // Export
    exportLinkData,
    
    // Computed values
    totalClicks,
    totalConversions,
    totalRevenue,
    averageConversionRate,
    topPerformingLink,
    activeLinksCount
  };
};