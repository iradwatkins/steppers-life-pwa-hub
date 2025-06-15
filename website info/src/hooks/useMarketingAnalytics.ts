import { useState, useEffect, useCallback } from 'react';
import { marketingAnalyticsService, MarketingAnalyticsData, MarketingChannel } from '../services/marketingAnalyticsService';
import { toast } from 'react-hot-toast';

export const useMarketingAnalytics = (eventId: string) => {
  const [analyticsData, setAnalyticsData] = useState<MarketingAnalyticsData | null>(null);
  const [channels, setChannels] = useState<MarketingChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [isAutoRefresh, setIsAutoRefresh] = useState(false);

  const fetchAnalytics = useCallback(async () => {
    if (!eventId) return;

    try {
      setError(null);
      const data = await marketingAnalyticsService.getMarketingAnalytics(eventId);
      setAnalyticsData(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load marketing analytics';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [eventId]);

  const fetchChannels = useCallback(async () => {
    try {
      const channelData = await marketingAnalyticsService.getChannels();
      setChannels(channelData);
      
      // Set default selected channels to active ones
      const activeChannels = channelData.filter(c => c.isActive).map(c => c.id);
      setSelectedChannels(activeChannels);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load marketing channels';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  }, []);

  const refreshAnalytics = useCallback(async () => {
    setRefreshing(true);
    await fetchAnalytics();
    toast.success('Analytics data refreshed');
  }, [fetchAnalytics]);

  const updateChannelStatus = useCallback(async (channelId: string, isActive: boolean) => {
    try {
      await marketingAnalyticsService.updateChannelStatus(channelId, isActive);
      
      // Update local state
      setChannels(prev => prev.map(channel => 
        channel.id === channelId 
          ? { ...channel, isActive }
          : channel
      ));

      // Update selected channels
      if (isActive) {
        setSelectedChannels(prev => [...prev, channelId]);
      } else {
        setSelectedChannels(prev => prev.filter(id => id !== channelId));
      }

      toast.success(`Channel ${isActive ? 'activated' : 'deactivated'}`);
      
      // Refresh analytics to reflect changes
      await refreshAnalytics();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update channel status';
      toast.error(errorMessage);
    }
  }, [refreshAnalytics]);

  const syncChannel = useCallback(async (channelId: string) => {
    try {
      await marketingAnalyticsService.syncChannel(channelId);
      
      // Update local state
      setChannels(prev => prev.map(channel => 
        channel.id === channelId 
          ? { ...channel, lastSync: new Date(), integrationStatus: 'connected' as const }
          : channel
      ));

      toast.success('Channel synced successfully');
      
      // Refresh analytics to get latest data
      await refreshAnalytics();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sync channel';
      toast.error(errorMessage);
    }
  }, [refreshAnalytics]);

  const exportAnalytics = useCallback(async (
    format: 'csv' | 'excel' | 'pdf' | 'json',
    sections: string[]
  ) => {
    if (!eventId) return;

    try {
      setExporting(true);
      const { url, filename } = await marketingAnalyticsService.exportAnalytics(eventId, format, sections);
      
      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Analytics exported as ${format.toUpperCase()}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to export analytics';
      toast.error(errorMessage);
    } finally {
      setExporting(false);
    }
  }, [eventId]);

  const toggleChannelSelection = useCallback((channelId: string) => {
    setSelectedChannels(prev => 
      prev.includes(channelId)
        ? prev.filter(id => id !== channelId)
        : [...prev, channelId]
    );
  }, []);

  const selectAllChannels = useCallback(() => {
    const activeChannelIds = channels.filter(c => c.isActive).map(c => c.id);
    setSelectedChannels(activeChannelIds);
  }, [channels]);

  const clearChannelSelection = useCallback(() => {
    setSelectedChannels([]);
  }, []);

  // Filter analytics data based on selected timeframe and channels
  const filteredAnalyticsData = analyticsData ? {
    ...analyticsData,
    campaignPerformance: analyticsData.campaignPerformance.filter(campaign => {
      // Filter by selected channels
      const channelMatch = selectedChannels.length === 0 || selectedChannels.includes(campaign.channel.id);
      
      // Filter by timeframe
      const now = new Date();
      const campaignDate = new Date(campaign.startDate);
      let timeframeMatch = true;

      switch (selectedTimeframe) {
        case '7d':
          timeframeMatch = (now.getTime() - campaignDate.getTime()) <= (7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          timeframeMatch = (now.getTime() - campaignDate.getTime()) <= (30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          timeframeMatch = (now.getTime() - campaignDate.getTime()) <= (90 * 24 * 60 * 60 * 1000);
          break;
        default:
          timeframeMatch = true;
      }

      return channelMatch && timeframeMatch;
    }),
    timeSeriesData: analyticsData.timeSeriesData.filter(dataPoint => {
      const now = new Date();
      const dataDate = new Date(dataPoint.date);
      
      switch (selectedTimeframe) {
        case '7d':
          return (now.getTime() - dataDate.getTime()) <= (7 * 24 * 60 * 60 * 1000);
        case '30d':
          return (now.getTime() - dataDate.getTime()) <= (30 * 24 * 60 * 60 * 1000);
        case '90d':
          return (now.getTime() - dataDate.getTime()) <= (90 * 24 * 60 * 60 * 1000);
        default:
          return true;
      }
    })
  } : null;

  // Calculate filtered overview metrics
  const filteredOverview = filteredAnalyticsData ? {
    ...filteredAnalyticsData.overview,
    totalSpend: filteredAnalyticsData.campaignPerformance.reduce((sum, campaign) => sum + campaign.spent, 0),
    totalRevenue: filteredAnalyticsData.campaignPerformance.reduce((sum, campaign) => sum + campaign.revenue, 0),
    totalConversions: filteredAnalyticsData.campaignPerformance.reduce((sum, campaign) => sum + campaign.conversions, 0),
    totalCampaigns: filteredAnalyticsData.campaignPerformance.length
  } : null;

  if (filteredOverview && filteredOverview.totalSpend > 0) {
    filteredOverview.overallROI = Math.round(((filteredOverview.totalRevenue - filteredOverview.totalSpend) / filteredOverview.totalSpend) * 100);
    filteredOverview.averageCostPerAcquisition = filteredOverview.totalConversions > 0 
      ? Math.round((filteredOverview.totalSpend / filteredOverview.totalConversions) * 100) / 100 
      : 0;
  }

  // Auto-refresh functionality
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isAutoRefresh && !loading) {
      interval = setInterval(() => {
        refreshAnalytics();
      }, 5 * 60 * 1000); // Refresh every 5 minutes
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isAutoRefresh, loading, refreshAnalytics]);

  // Initial data fetch
  useEffect(() => {
    fetchChannels();
  }, [fetchChannels]);

  useEffect(() => {
    if (eventId) {
      fetchAnalytics();
    }
  }, [eventId, fetchAnalytics]);

  // Utility functions for calculations
  const getChannelPerformance = useCallback((channelId: string) => {
    if (!filteredAnalyticsData) return null;

    const campaigns = filteredAnalyticsData.campaignPerformance.filter(
      campaign => campaign.channel.id === channelId
    );

    if (campaigns.length === 0) return null;

    const totalSpend = campaigns.reduce((sum, campaign) => sum + campaign.spent, 0);
    const totalRevenue = campaigns.reduce((sum, campaign) => sum + campaign.revenue, 0);
    const totalConversions = campaigns.reduce((sum, campaign) => sum + campaign.conversions, 0);
    const totalClicks = campaigns.reduce((sum, campaign) => sum + campaign.clicks, 0);
    const totalImpressions = campaigns.reduce((sum, campaign) => sum + campaign.impressions, 0);

    return {
      campaigns: campaigns.length,
      spend: totalSpend,
      revenue: totalRevenue,
      conversions: totalConversions,
      clicks: totalClicks,
      impressions: totalImpressions,
      roi: totalSpend > 0 ? Math.round(((totalRevenue - totalSpend) / totalSpend) * 100) : 0,
      ctr: totalImpressions > 0 ? Math.round((totalClicks / totalImpressions) * 10000) / 100 : 0,
      conversionRate: totalClicks > 0 ? Math.round((totalConversions / totalClicks) * 10000) / 100 : 0,
      cpa: totalConversions > 0 ? Math.round((totalSpend / totalConversions) * 100) / 100 : 0
    };
  }, [filteredAnalyticsData]);

  const getTopPerformingCampaigns = useCallback((limit: number = 5) => {
    if (!filteredAnalyticsData) return [];

    return filteredAnalyticsData.campaignPerformance
      .sort((a, b) => b.roi - a.roi)
      .slice(0, limit);
  }, [filteredAnalyticsData]);

  const getTrendData = useCallback((metric: 'impressions' | 'clicks' | 'conversions' | 'spend' | 'revenue' | 'roi') => {
    if (!filteredAnalyticsData) return [];

    return filteredAnalyticsData.timeSeriesData.map(dataPoint => ({
      date: dataPoint.date,
      value: dataPoint[metric]
    }));
  }, [filteredAnalyticsData]);

  const getConversionFunnelData = useCallback(() => {
    if (!filteredAnalyticsData) return null;

    return filteredAnalyticsData.conversionFunnel;
  }, [filteredAnalyticsData]);

  return {
    // Data
    analyticsData: filteredAnalyticsData,
    overview: filteredOverview,
    channels,
    selectedChannels,
    selectedTimeframe,

    // Loading states
    loading,
    refreshing,
    exporting,
    error,
    isAutoRefresh,

    // Actions
    refreshAnalytics,
    updateChannelStatus,
    syncChannel,
    exportAnalytics,
    setSelectedTimeframe,
    toggleChannelSelection,
    selectAllChannels,
    clearChannelSelection,
    setIsAutoRefresh,

    // Utility functions
    getChannelPerformance,
    getTopPerformingCampaigns,
    getTrendData,
    getConversionFunnelData
  };
}; 