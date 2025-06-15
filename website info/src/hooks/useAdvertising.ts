import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { advertisingService } from '@/services/advertisingService';
import {
  AdZone,
  DirectUserAd,
  AdOrder,
  AdDisplaySettings,
  AdSenseConfig,
  AdAnalytics,
  AdRevenueReport,
  AdModeration,
  AdFormData,
  AdZoneFormData,
  AdStatus,
  OrderStatus,
  ModerationAction
} from '@/types/advertising';

export function useAdvertising() {
  // State for different data types
  const [adZones, setAdZones] = useState<AdZone[]>([]);
  const [directUserAds, setDirectUserAds] = useState<DirectUserAd[]>([]);
  const [adOrders, setAdOrders] = useState<AdOrder[]>([]);
  const [moderationReports, setModerationReports] = useState<AdModeration[]>([]);
  const [displaySettings, setDisplaySettings] = useState<AdDisplaySettings | null>(null);
  const [adSenseConfig, setAdSenseConfig] = useState<AdSenseConfig | null>(null);
  const [analytics, setAnalytics] = useState<AdAnalytics | null>(null);
  const [revenueReport, setRevenueReport] = useState<AdRevenueReport | null>(null);

  // Loading states
  const [loadingZones, setLoadingZones] = useState(false);
  const [loadingAds, setLoadingAds] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [loadingModeration, setLoadingModeration] = useState(false);

  // Error states
  const [error, setError] = useState<string | null>(null);

  // Clear error helper
  const clearError = useCallback(() => setError(null), []);

  // Ad Zones Management
  const fetchAdZones = useCallback(async () => {
    try {
      setLoadingZones(true);
      clearError();
      const zones = await advertisingService.getAdZones();
      setAdZones(zones);
    } catch (err) {
      const errorMsg = 'Failed to fetch ad zones';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoadingZones(false);
    }
  }, [clearError]);

  const createAdZone = useCallback(async (zoneData: AdZoneFormData) => {
    try {
      clearError();
      const newZone = await advertisingService.createAdZone(zoneData);
      setAdZones(prev => [...prev, newZone]);
      toast.success('Ad zone created successfully');
      return newZone;
    } catch (err) {
      const errorMsg = 'Failed to create ad zone';
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    }
  }, [clearError]);

  const updateAdZone = useCallback(async (id: string, zoneData: Partial<AdZoneFormData>) => {
    try {
      clearError();
      const updatedZone = await advertisingService.updateAdZone(id, zoneData);
      if (updatedZone) {
        setAdZones(prev => prev.map(zone => zone.id === id ? updatedZone : zone));
        toast.success('Ad zone updated successfully');
        return updatedZone;
      }
    } catch (err) {
      const errorMsg = 'Failed to update ad zone';
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    }
  }, [clearError]);

  const deleteAdZone = useCallback(async (id: string) => {
    try {
      clearError();
      const success = await advertisingService.deleteAdZone(id);
      if (success) {
        setAdZones(prev => prev.filter(zone => zone.id !== id));
        toast.success('Ad zone deleted successfully');
      }
      return success;
    } catch (err) {
      const errorMsg = 'Failed to delete ad zone';
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    }
  }, [clearError]);

  const toggleAdZoneStatus = useCallback(async (id: string) => {
    try {
      clearError();
      const updatedZone = await advertisingService.toggleAdZoneStatus(id);
      if (updatedZone) {
        setAdZones(prev => prev.map(zone => zone.id === id ? updatedZone : zone));
        toast.success(`Ad zone ${updatedZone.isActive ? 'activated' : 'deactivated'}`);
        return updatedZone;
      }
    } catch (err) {
      const errorMsg = 'Failed to toggle ad zone status';
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    }
  }, [clearError]);

  // Direct User Ads Management
  const fetchDirectUserAds = useCallback(async (filters?: {
    status?: AdStatus;
    advertiserId?: string;
    adZoneId?: string;
  }) => {
    try {
      setLoadingAds(true);
      clearError();
      const ads = await advertisingService.getDirectUserAds(filters);
      setDirectUserAds(ads);
    } catch (err) {
      const errorMsg = 'Failed to fetch direct user ads';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoadingAds(false);
    }
  }, [clearError]);

  const createDirectUserAd = useCallback(async (adData: AdFormData, advertiserId: string) => {
    try {
      clearError();
      const newAd = await advertisingService.createDirectUserAd(adData, advertiserId);
      setDirectUserAds(prev => [...prev, newAd]);
      toast.success('Ad created and submitted for approval');
      return newAd;
    } catch (err) {
      const errorMsg = 'Failed to create ad';
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    }
  }, [clearError]);

  const updateAdStatus = useCallback(async (id: string, status: AdStatus, adminNotes?: string) => {
    try {
      clearError();
      const updatedAd = await advertisingService.updateAdStatus(id, status, adminNotes);
      if (updatedAd) {
        setDirectUserAds(prev => prev.map(ad => ad.id === id ? updatedAd : ad));
        toast.success(`Ad ${status.replace('_', ' ').toLowerCase()}`);
        return updatedAd;
      }
    } catch (err) {
      const errorMsg = 'Failed to update ad status';
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    }
  }, [clearError]);

  // Ad Orders Management
  const fetchAdOrders = useCallback(async (filters?: {
    status?: OrderStatus;
    advertiserId?: string;
  }) => {
    try {
      setLoadingOrders(true);
      clearError();
      const orders = await advertisingService.getAdOrders(filters);
      setAdOrders(orders);
    } catch (err) {
      const errorMsg = 'Failed to fetch ad orders';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoadingOrders(false);
    }
  }, [clearError]);

  const createAdOrder = useCallback(async (orderData: Partial<AdOrder>) => {
    try {
      clearError();
      const newOrder = await advertisingService.createAdOrder(orderData);
      setAdOrders(prev => [...prev, newOrder]);
      toast.success('Ad order created successfully');
      return newOrder;
    } catch (err) {
      const errorMsg = 'Failed to create ad order';
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    }
  }, [clearError]);

  const updateOrderStatus = useCallback(async (id: string, status: OrderStatus) => {
    try {
      clearError();
      const updatedOrder = await advertisingService.updateOrderStatus(id, status);
      if (updatedOrder) {
        setAdOrders(prev => prev.map(order => order.id === id ? updatedOrder : order));
        toast.success(`Order ${status.replace('_', ' ').toLowerCase()}`);
        return updatedOrder;
      }
    } catch (err) {
      const errorMsg = 'Failed to update order status';
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    }
  }, [clearError]);

  // Display Settings Management
  const fetchDisplaySettings = useCallback(async () => {
    try {
      setLoadingSettings(true);
      clearError();
      const settings = await advertisingService.getDisplaySettings();
      setDisplaySettings(settings);
    } catch (err) {
      const errorMsg = 'Failed to fetch display settings';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoadingSettings(false);
    }
  }, [clearError]);

  const updateDisplaySettings = useCallback(async (settings: Partial<AdDisplaySettings>) => {
    try {
      clearError();
      const updatedSettings = await advertisingService.updateDisplaySettings(settings);
      setDisplaySettings(updatedSettings);
      toast.success('Display settings updated successfully');
      return updatedSettings;
    } catch (err) {
      const errorMsg = 'Failed to update display settings';
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    }
  }, [clearError]);

  // AdSense Configuration
  const fetchAdSenseConfig = useCallback(async () => {
    try {
      setLoadingSettings(true);
      clearError();
      const config = await advertisingService.getAdSenseConfig();
      setAdSenseConfig(config);
    } catch (err) {
      const errorMsg = 'Failed to fetch AdSense configuration';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoadingSettings(false);
    }
  }, [clearError]);

  const updateAdSenseConfig = useCallback(async (config: Partial<AdSenseConfig>) => {
    try {
      clearError();
      const updatedConfig = await advertisingService.updateAdSenseConfig(config);
      setAdSenseConfig(updatedConfig);
      toast.success('AdSense configuration updated successfully');
      return updatedConfig;
    } catch (err) {
      const errorMsg = 'Failed to update AdSense configuration';
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    }
  }, [clearError]);

  // Analytics and Reporting
  const fetchAnalytics = useCallback(async (dateRange?: { start: Date; end: Date }) => {
    try {
      setLoadingAnalytics(true);
      clearError();
      const analyticsData = await advertisingService.getAdAnalytics(dateRange);
      setAnalytics(analyticsData);
    } catch (err) {
      const errorMsg = 'Failed to fetch analytics';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoadingAnalytics(false);
    }
  }, [clearError]);

  const fetchRevenueReport = useCallback(async (dateRange: { start: Date; end: Date }) => {
    try {
      setLoadingAnalytics(true);
      clearError();
      const report = await advertisingService.getRevenueReport(dateRange);
      setRevenueReport(report);
    } catch (err) {
      const errorMsg = 'Failed to fetch revenue report';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoadingAnalytics(false);
    }
  }, [clearError]);

  // Moderation
  const fetchModerationReports = useCallback(async () => {
    try {
      setLoadingModeration(true);
      clearError();
      const reports = await advertisingService.getModerationReports();
      setModerationReports(reports);
    } catch (err) {
      const errorMsg = 'Failed to fetch moderation reports';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoadingModeration(false);
    }
  }, [clearError]);

  const createModerationReport = useCallback(async (
    report: Omit<AdModeration, 'id' | 'createdAt'>
  ) => {
    try {
      clearError();
      const newReport = await advertisingService.createModerationReport(report);
      setModerationReports(prev => [...prev, newReport]);
      toast.success('Moderation report submitted');
      return newReport;
    } catch (err) {
      const errorMsg = 'Failed to submit moderation report';
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    }
  }, [clearError]);

  const resolveModerationReport = useCallback(async (
    id: string,
    action: ModerationAction,
    reviewNotes?: string
  ) => {
    try {
      clearError();
      const resolvedReport = await advertisingService.resolveModerationReport(id, action, reviewNotes);
      if (resolvedReport) {
        setModerationReports(prev => prev.map(report => 
          report.id === id ? resolvedReport : report
        ));
        toast.success('Moderation report resolved');
        return resolvedReport;
      }
    } catch (err) {
      const errorMsg = 'Failed to resolve moderation report';
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    }
  }, [clearError]);

  // Auto-refresh functionality
  const refreshAllData = useCallback(async () => {
    await Promise.all([
      fetchAdZones(),
      fetchDirectUserAds(),
      fetchAdOrders(),
      fetchDisplaySettings(),
      fetchAdSenseConfig(),
      fetchModerationReports()
    ]);
  }, [
    fetchAdZones,
    fetchDirectUserAds,
    fetchAdOrders,
    fetchDisplaySettings,
    fetchAdSenseConfig,
    fetchModerationReports
  ]);

  // Initialize data on mount
  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  // Return all state and functions
  return {
    // Data
    adZones,
    directUserAds,
    adOrders,
    moderationReports,
    displaySettings,
    adSenseConfig,
    analytics,
    revenueReport,

    // Loading states
    loadingZones,
    loadingAds,
    loadingOrders,
    loadingSettings,
    loadingAnalytics,
    loadingModeration,

    // Error state
    error,
    clearError,

    // Ad Zones
    fetchAdZones,
    createAdZone,
    updateAdZone,
    deleteAdZone,
    toggleAdZoneStatus,

    // Direct User Ads
    fetchDirectUserAds,
    createDirectUserAd,
    updateAdStatus,

    // Ad Orders
    fetchAdOrders,
    createAdOrder,
    updateOrderStatus,

    // Settings
    fetchDisplaySettings,
    updateDisplaySettings,
    fetchAdSenseConfig,
    updateAdSenseConfig,

    // Analytics
    fetchAnalytics,
    fetchRevenueReport,

    // Moderation
    fetchModerationReports,
    createModerationReport,
    resolveModerationReport,

    // Utility
    refreshAllData
  };
} 