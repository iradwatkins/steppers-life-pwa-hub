/**
 * Advertising Hook - Epic O.001: Advertising System
 * 
 * React hook for managing advertising state and operations with automatic
 * loading states, error handling, and real-time updates.
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  advertisingService,
  AdZone,
  DirectAd,
  AdPlacementRequest,
  AdSenseConfig,
  AdPerformanceMetrics,
  RevenueReport,
  AdSystemSettings
} from '@/services/advertisingService';
import { useToast } from '@/components/ui/use-toast';

export interface UseAdvertisingOptions {
  autoFetch?: boolean;
  userId?: string;
}

export interface UseAdvertisingReturn {
  // State
  adZones: AdZone[];
  directAds: DirectAd[];
  userAds: DirectAd[];
  adSenseConfig: AdSenseConfig | null;
  systemSettings: AdSystemSettings | null;
  revenueReport: RevenueReport | null;
  loading: boolean;
  error: string | null;
  total: number;

  // Actions
  fetchAdZones: () => Promise<void>;
  createAdZone: (zoneData: Omit<AdZone, 'id' | 'created_at' | 'updated_at'>) => Promise<AdZone | null>;
  updateAdZone: (id: string, zoneData: Partial<AdZone>) => Promise<AdZone | null>;
  deleteAdZone: (id: string) => Promise<boolean>;

  // Direct Ad Management
  fetchDirectAds: (filters?: any) => Promise<void>;
  fetchUserAds: (userId: string) => Promise<void>;
  submitAdPlacement: (placementData: AdPlacementRequest) => Promise<DirectAd | null>;
  approveAd: (adId: string, approvedBy: string) => Promise<DirectAd | null>;
  rejectAd: (adId: string, reason: string, rejectedBy: string) => Promise<DirectAd | null>;
  pauseAd: (adId: string) => Promise<DirectAd | null>;
  resumeAd: (adId: string) => Promise<DirectAd | null>;

  // AdSense Management
  fetchAdSenseConfig: () => Promise<void>;
  updateAdSenseConfig: (config: Partial<AdSenseConfig>) => Promise<AdSenseConfig | null>;
  enableAdSense: () => Promise<AdSenseConfig | null>;
  disableAdSense: () => Promise<AdSenseConfig | null>;

  // Analytics
  getAdPerformance: (adId: string, period?: 'daily' | 'weekly' | 'monthly') => Promise<AdPerformanceMetrics | null>;
  trackAdImpression: (adId: string, metadata?: any) => Promise<void>;
  trackAdClick: (adId: string, metadata?: any) => Promise<void>;

  // Reporting
  fetchRevenueReport: (dateRange: { start_date: string; end_date: string }) => Promise<void>;

  // Settings
  fetchSystemSettings: () => Promise<void>;
  updateSystemSettings: (settings: Partial<AdSystemSettings>) => Promise<AdSystemSettings | null>;

  // Utilities
  calculateAdPrice: (zone: AdZone, durationDays: number) => number;
  validateCreativeFile: (file: File, zone: AdZone) => { valid: boolean; errors: string[] };
  refreshData: () => Promise<void>;
  clearError: () => void;
}

export const useAdvertising = (options: UseAdvertisingOptions = {}): UseAdvertisingReturn => {
  const { autoFetch = true, userId } = options;
  const { toast } = useToast();

  // State
  const [adZones, setAdZones] = useState<AdZone[]>([]);
  const [directAds, setDirectAds] = useState<DirectAd[]>([]);
  const [userAds, setUserAds] = useState<DirectAd[]>([]);
  const [adSenseConfig, setAdSenseConfig] = useState<AdSenseConfig | null>(null);
  const [systemSettings, setSystemSettings] = useState<AdSystemSettings | null>(null);
  const [revenueReport, setRevenueReport] = useState<RevenueReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      refreshData();
    }
  }, [autoFetch]);

  // Error and success handlers
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleError = useCallback((error: any, operation: string) => {
    console.error(`Advertising ${operation} error:`, error);
    const message = error.message || `Failed to ${operation}`;
    setError(message);
    toast({
      title: "Error",
      description: message,
      variant: "destructive",
    });
  }, [toast]);

  const handleSuccess = useCallback((message: string) => {
    clearError();
    toast({
      title: "Success",
      description: message,
    });
  }, [clearError, toast]);

  // Ad Zone Management
  const fetchAdZones = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const zones = await advertisingService.getAdZones();
      setAdZones(zones);
    } catch (error) {
      handleError(error, 'fetch ad zones');
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const createAdZone = useCallback(async (zoneData: Omit<AdZone, 'id' | 'created_at' | 'updated_at'>): Promise<AdZone | null> => {
    setLoading(true);
    setError(null);
    try {
      const newZone = await advertisingService.createAdZone(zoneData);
      setAdZones(current => [...current, newZone]);
      handleSuccess('Ad zone created successfully');
      return newZone;
    } catch (error) {
      handleError(error, 'create ad zone');
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleError, handleSuccess]);

  const updateAdZone = useCallback(async (id: string, zoneData: Partial<AdZone>): Promise<AdZone | null> => {
    setLoading(true);
    setError(null);
    try {
      const updatedZone = await advertisingService.updateAdZone(id, zoneData);
      setAdZones(current => 
        current.map(zone => zone.id === id ? updatedZone : zone)
      );
      handleSuccess('Ad zone updated successfully');
      return updatedZone;
    } catch (error) {
      handleError(error, 'update ad zone');
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleError, handleSuccess]);

  const deleteAdZone = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await advertisingService.deleteAdZone(id);
      setAdZones(current => current.filter(zone => zone.id !== id));
      handleSuccess('Ad zone deleted successfully');
      return true;
    } catch (error) {
      handleError(error, 'delete ad zone');
      return false;
    } finally {
      setLoading(false);
    }
  }, [handleError, handleSuccess]);

  // Direct Ad Management
  const fetchDirectAds = useCallback(async (filters?: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await advertisingService.getDirectAds(filters);
      setDirectAds(response?.ads || []);
      setTotal(response?.total || 0);
    } catch (error) {
      handleError(error, 'fetch direct ads');
      setDirectAds([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const fetchUserAds = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const ads = await advertisingService.getUserAds(userId);
      setUserAds(ads);
    } catch (error) {
      handleError(error, 'fetch user ads');
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const submitAdPlacement = useCallback(async (placementData: AdPlacementRequest): Promise<DirectAd | null> => {
    setLoading(true);
    setError(null);
    try {
      const newAd = await advertisingService.submitAdPlacement(placementData);
      setDirectAds(current => [newAd, ...current]);
      setUserAds(current => [newAd, ...current]);
      handleSuccess('Ad placement submitted successfully');
      return newAd;
    } catch (error) {
      handleError(error, 'submit ad placement');
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleError, handleSuccess]);

  const approveAd = useCallback(async (adId: string, approvedBy: string): Promise<DirectAd | null> => {
    setLoading(true);
    setError(null);
    try {
      const approvedAd = await advertisingService.approveAd(adId, approvedBy);
      setDirectAds(current => 
        current.map(ad => ad.id === adId ? approvedAd : ad)
      );
      handleSuccess('Ad approved successfully');
      return approvedAd;
    } catch (error) {
      handleError(error, 'approve ad');
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleError, handleSuccess]);

  const rejectAd = useCallback(async (adId: string, reason: string, rejectedBy: string): Promise<DirectAd | null> => {
    setLoading(true);
    setError(null);
    try {
      const rejectedAd = await advertisingService.rejectAd(adId, reason, rejectedBy);
      setDirectAds(current => 
        current.map(ad => ad.id === adId ? rejectedAd : ad)
      );
      handleSuccess('Ad rejected');
      return rejectedAd;
    } catch (error) {
      handleError(error, 'reject ad');
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleError, handleSuccess]);

  const pauseAd = useCallback(async (adId: string): Promise<DirectAd | null> => {
    setLoading(true);
    setError(null);
    try {
      const pausedAd = await advertisingService.pauseAd(adId);
      setDirectAds(current => 
        current.map(ad => ad.id === adId ? pausedAd : ad)
      );
      handleSuccess('Ad paused');
      return pausedAd;
    } catch (error) {
      handleError(error, 'pause ad');
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleError, handleSuccess]);

  const resumeAd = useCallback(async (adId: string): Promise<DirectAd | null> => {
    setLoading(true);
    setError(null);
    try {
      const resumedAd = await advertisingService.resumeAd(adId);
      setDirectAds(current => 
        current.map(ad => ad.id === adId ? resumedAd : ad)
      );
      handleSuccess('Ad resumed');
      return resumedAd;
    } catch (error) {
      handleError(error, 'resume ad');
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleError, handleSuccess]);

  // AdSense Management
  const fetchAdSenseConfig = useCallback(async () => {
    try {
      const config = await advertisingService.getAdSenseConfig();
      setAdSenseConfig(config);
    } catch (error) {
      handleError(error, 'fetch AdSense config');
    }
  }, [handleError]);

  const updateAdSenseConfig = useCallback(async (config: Partial<AdSenseConfig>): Promise<AdSenseConfig | null> => {
    setLoading(true);
    setError(null);
    try {
      const updatedConfig = await advertisingService.updateAdSenseConfig(config);
      setAdSenseConfig(updatedConfig);
      handleSuccess('AdSense configuration updated');
      return updatedConfig;
    } catch (error) {
      handleError(error, 'update AdSense config');
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleError, handleSuccess]);

  const enableAdSense = useCallback(async (): Promise<AdSenseConfig | null> => {
    setLoading(true);
    setError(null);
    try {
      const config = await advertisingService.enableAdSense();
      setAdSenseConfig(config);
      handleSuccess('AdSense enabled');
      return config;
    } catch (error) {
      handleError(error, 'enable AdSense');
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleError, handleSuccess]);

  const disableAdSense = useCallback(async (): Promise<AdSenseConfig | null> => {
    setLoading(true);
    setError(null);
    try {
      const config = await advertisingService.disableAdSense();
      setAdSenseConfig(config);
      handleSuccess('AdSense disabled');
      return config;
    } catch (error) {
      handleError(error, 'disable AdSense');
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleError, handleSuccess]);

  // Analytics
  const getAdPerformance = useCallback(async (adId: string, period: 'daily' | 'weekly' | 'monthly' = 'weekly'): Promise<AdPerformanceMetrics | null> => {
    try {
      const performance = await advertisingService.getAdPerformance(adId, period);
      return performance;
    } catch (error) {
      handleError(error, 'fetch ad performance');
      return null;
    }
  }, [handleError]);

  const trackAdImpression = useCallback(async (adId: string, metadata?: any) => {
    try {
      await advertisingService.trackAdImpression(adId, metadata);
    } catch (error) {
      console.error('Error tracking ad impression:', error);
      // Don't show error to user for analytics
    }
  }, []);

  const trackAdClick = useCallback(async (adId: string, metadata?: any) => {
    try {
      await advertisingService.trackAdClick(adId, metadata);
    } catch (error) {
      console.error('Error tracking ad click:', error);
      // Don't show error to user for analytics
    }
  }, []);

  // Reporting
  const fetchRevenueReport = useCallback(async (dateRange: { start_date: string; end_date: string }) => {
    setLoading(true);
    setError(null);
    try {
      const report = await advertisingService.getRevenueReport(dateRange);
      setRevenueReport(report);
    } catch (error) {
      handleError(error, 'fetch revenue report');
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // Settings
  const fetchSystemSettings = useCallback(async () => {
    try {
      const settings = await advertisingService.getSystemSettings();
      setSystemSettings(settings);
    } catch (error) {
      handleError(error, 'fetch system settings');
    }
  }, [handleError]);

  const updateSystemSettings = useCallback(async (settings: Partial<AdSystemSettings>): Promise<AdSystemSettings | null> => {
    setLoading(true);
    setError(null);
    try {
      const updatedSettings = await advertisingService.updateSystemSettings(settings);
      setSystemSettings(updatedSettings);
      handleSuccess('System settings updated');
      return updatedSettings;
    } catch (error) {
      handleError(error, 'update system settings');
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleError, handleSuccess]);

  // Utilities
  const calculateAdPrice = useCallback((zone: AdZone, durationDays: number) => {
    return advertisingService.calculateAdPrice(zone, durationDays);
  }, []);

  const validateCreativeFile = useCallback((file: File, zone: AdZone) => {
    return advertisingService.validateCreativeFile(file, zone);
  }, []);

  const refreshData = useCallback(async () => {
    await Promise.all([
      fetchAdZones(),
      fetchDirectAds(),
      fetchAdSenseConfig(),
      fetchSystemSettings(),
      userId ? fetchUserAds(userId) : Promise.resolve()
    ]);
  }, [fetchAdZones, fetchDirectAds, fetchAdSenseConfig, fetchSystemSettings, fetchUserAds, userId]);

  return {
    // State
    adZones,
    directAds,
    userAds,
    adSenseConfig,
    systemSettings,
    revenueReport,
    loading,
    error,
    total,

    // Actions
    fetchAdZones,
    createAdZone,
    updateAdZone,
    deleteAdZone,

    // Direct Ad Management
    fetchDirectAds,
    fetchUserAds,
    submitAdPlacement,
    approveAd,
    rejectAd,
    pauseAd,
    resumeAd,

    // AdSense Management
    fetchAdSenseConfig,
    updateAdSenseConfig,
    enableAdSense,
    disableAdSense,

    // Analytics
    getAdPerformance,
    trackAdImpression,
    trackAdClick,

    // Reporting
    fetchRevenueReport,

    // Settings
    fetchSystemSettings,
    updateSystemSettings,

    // Utilities
    calculateAdPrice,
    validateCreativeFile,
    refreshData,
    clearError
  };
};