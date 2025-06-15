import { useState, useEffect } from 'react';
import { 
  trackableLinkService, 
  TrackableLink, 
  LinkGenerationRequest, 
  LinkAnalytics,
  VanityUrlCheck
} from '../services/trackableLinkService';

export interface UseTrackableLinksReturn {
  agentLinks: TrackableLink[];
  eventLinks: TrackableLink[];
  selectedLink: TrackableLink | null;
  linkAnalytics: LinkAnalytics | null;
  agentPerformance: any;
  isLoading: boolean;
  error: string | null;
  
  // Link management
  generateLink: (request: LinkGenerationRequest) => Promise<TrackableLink | null>;
  generateBulkLinks: (request: any) => Promise<TrackableLink[]>;
  updateLink: (linkId: string, updates: Partial<TrackableLink>) => Promise<TrackableLink | null>;
  deactivateLink: (linkId: string) => Promise<boolean>;
  deleteLink: (linkId: string) => Promise<boolean>;
  
  // Vanity URL management
  checkVanityUrlAvailability: (vanityUrl: string) => Promise<VanityUrlCheck | null>;
  
  // Analytics
  getLinkAnalytics: (linkId: string) => Promise<LinkAnalytics | null>;
  getAgentPerformance: (dateRange?: { start: Date; end: Date }) => Promise<any>;
  
  // Click tracking
  trackClick: (linkCode: string, clickData: any) => Promise<boolean>;
  recordConversion: (linkCode: string, sessionId: string, conversionValue: number) => Promise<boolean>;
  
  // Selection and UI state
  selectLink: (link: TrackableLink | null) => void;
  
  // Refresh functions
  refreshAgentLinks: () => Promise<void>;
  refreshEventLinks: () => Promise<void>;
  refreshAnalytics: () => Promise<void>;
}

export const useTrackableLinks = (agentId?: string, eventId?: string): UseTrackableLinksReturn => {
  const [agentLinks, setAgentLinks] = useState<TrackableLink[]>([]);
  const [eventLinks, setEventLinks] = useState<TrackableLink[]>([]);
  const [selectedLink, setSelectedLink] = useState<TrackableLink | null>(null);
  const [linkAnalytics, setLinkAnalytics] = useState<LinkAnalytics | null>(null);
  const [agentPerformance, setAgentPerformance] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load agent links
  const loadAgentLinks = async () => {
    if (!agentId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const links = await trackableLinkService.getAgentLinks(agentId);
      setAgentLinks(links);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load agent links');
    } finally {
      setIsLoading(false);
    }
  };

  // Load event links
  const loadEventLinks = async () => {
    if (!eventId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const links = await trackableLinkService.getEventLinks(eventId);
      setEventLinks(links);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load event links');
    } finally {
      setIsLoading(false);
    }
  };

  // Load agent performance
  const loadAgentPerformance = async (dateRange?: { start: Date; end: Date }) => {
    if (!agentId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const performance = await trackableLinkService.getAgentPerformance(agentId, dateRange);
      setAgentPerformance(performance);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load agent performance');
    } finally {
      setIsLoading(false);
    }
  };

  // Generate trackable link
  const generateLink = async (request: LinkGenerationRequest): Promise<TrackableLink | null> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const newLink = await trackableLinkService.generateTrackableLink(request);
      
      // Refresh relevant link lists
      if (request.agentId === agentId) {
        await loadAgentLinks();
      }
      if (request.eventId === eventId) {
        await loadEventLinks();
      }
      
      return newLink;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate trackable link');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Generate bulk links
  const generateBulkLinks = async (request: any): Promise<TrackableLink[]> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const newLinks = await trackableLinkService.generateBulkLinks(request);
      
      // Refresh link lists
      await loadAgentLinks();
      await loadEventLinks();
      
      return newLinks;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate bulk links');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Update trackable link
  const updateLink = async (
    linkId: string, 
    updates: Partial<TrackableLink>
  ): Promise<TrackableLink | null> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const updatedLink = await trackableLinkService.updateTrackableLink(linkId, updates);
      
      // Update local state
      setAgentLinks(prev => prev.map(link => link.id === linkId ? updatedLink : link));
      setEventLinks(prev => prev.map(link => link.id === linkId ? updatedLink : link));
      
      if (selectedLink?.id === linkId) {
        setSelectedLink(updatedLink);
      }
      
      return updatedLink;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update trackable link');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Deactivate link
  const deactivateLink = async (linkId: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      await trackableLinkService.deactivateLink(linkId);
      
      // Refresh link lists
      await loadAgentLinks();
      await loadEventLinks();
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to deactivate link');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete link
  const deleteLink = async (linkId: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      await trackableLinkService.deleteLink(linkId);
      
      // Remove from local state
      setAgentLinks(prev => prev.filter(link => link.id !== linkId));
      setEventLinks(prev => prev.filter(link => link.id !== linkId));
      
      if (selectedLink?.id === linkId) {
        setSelectedLink(null);
        setLinkAnalytics(null);
      }
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete link');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Check vanity URL availability
  const checkVanityUrlAvailability = async (vanityUrl: string): Promise<VanityUrlCheck | null> => {
    try {
      return await trackableLinkService.checkVanityUrlAvailability(vanityUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check vanity URL availability');
      return null;
    }
  };

  // Get link analytics
  const getLinkAnalytics = async (linkId: string): Promise<LinkAnalytics | null> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const analytics = await trackableLinkService.getLinkAnalytics(linkId);
      
      if (selectedLink?.id === linkId) {
        setLinkAnalytics(analytics);
      }
      
      return analytics;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load link analytics');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Get agent performance
  const getAgentPerformance = async (dateRange?: { start: Date; end: Date }) => {
    return await loadAgentPerformance(dateRange);
  };

  // Track click
  const trackClick = async (linkCode: string, clickData: any): Promise<boolean> => {
    try {
      await trackableLinkService.trackClick(linkCode, clickData);
      
      // Refresh analytics if this is the selected link
      if (selectedLink?.linkCode === linkCode) {
        await getLinkAnalytics(selectedLink.id);
      }
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to track click');
      return false;
    }
  };

  // Record conversion
  const recordConversion = async (
    linkCode: string, 
    sessionId: string, 
    conversionValue: number
  ): Promise<boolean> => {
    try {
      await trackableLinkService.recordConversion(linkCode, sessionId, conversionValue);
      
      // Refresh analytics and performance
      if (selectedLink?.linkCode === linkCode) {
        await getLinkAnalytics(selectedLink.id);
      }
      if (agentId) {
        await loadAgentPerformance();
      }
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to record conversion');
      return false;
    }
  };

  // Select link
  const selectLink = (link: TrackableLink | null) => {
    setSelectedLink(link);
    setLinkAnalytics(null);
    
    // Load analytics for selected link
    if (link) {
      getLinkAnalytics(link.id);
    }
  };

  // Refresh functions
  const refreshAgentLinks = async () => {
    await loadAgentLinks();
  };

  const refreshEventLinks = async () => {
    await loadEventLinks();
  };

  const refreshAnalytics = async () => {
    if (selectedLink) {
      await getLinkAnalytics(selectedLink.id);
    }
    if (agentId) {
      await loadAgentPerformance();
    }
  };

  // Load data on mount and when dependencies change
  useEffect(() => {
    loadAgentLinks();
    if (agentId) {
      loadAgentPerformance();
    }
  }, [agentId]);

  useEffect(() => {
    loadEventLinks();
  }, [eventId]);

  return {
    agentLinks,
    eventLinks,
    selectedLink,
    linkAnalytics,
    agentPerformance,
    isLoading,
    error,
    generateLink,
    generateBulkLinks,
    updateLink,
    deactivateLink,
    deleteLink,
    checkVanityUrlAvailability,
    getLinkAnalytics,
    getAgentPerformance,
    trackClick,
    recordConversion,
    selectLink,
    refreshAgentLinks,
    refreshEventLinks,
    refreshAnalytics
  };
}; 