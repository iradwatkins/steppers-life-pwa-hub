// React Hook for Commission Configuration - Epic F.003
import { useState, useEffect, useCallback } from 'react';
import { commissionConfigService } from '@/services/commissionConfigService';
import type {
  CommissionConfig,
  CommissionTier,
  AgentCommissionOverride,
  PayoutSettings,
  TierProgression
} from '@/services/commissionConfigService';

interface UseCommissionConfigResult {
  // Data
  config: CommissionConfig | null;
  tiers: CommissionTier[];
  payoutSettings: PayoutSettings | null;
  
  // Loading states
  loading: boolean;
  saving: boolean;
  
  // Error state
  error: string | null;
  
  // Actions
  refreshConfig: () => Promise<void>;
  updateConfig: (updates: Partial<CommissionConfig>) => Promise<CommissionConfig>;
  createTier: (tierData: Omit<CommissionTier, 'id'>) => Promise<CommissionTier>;
  updateTier: (tierId: string, updates: Partial<CommissionTier>) => Promise<CommissionTier>;
  deleteTier: (tierId: string) => Promise<void>;
  updatePayoutSettings: (updates: Partial<PayoutSettings>) => Promise<PayoutSettings>;
  calculateCommission: (agentId: string, saleAmount: number, eventId?: string) => Promise<{
    baseRate: number;
    tierRate: number;
    overrideRate?: number;
    finalRate: number;
    commissionAmount: number;
    bonusAmount?: number;
  }>;
  exportConfig: (format: 'csv' | 'excel' | 'pdf') => Promise<void>;
  
  // Agent-specific functions
  getAgentOverrides: (agentId: string) => Promise<AgentCommissionOverride[]>;
  createAgentOverride: (overrideData: Omit<AgentCommissionOverride, 'id' | 'created_at'>) => Promise<AgentCommissionOverride>;
  getTierProgression: (agentId: string) => Promise<TierProgression>;
  processTierPromotion: (agentId: string, newTierId: string) => Promise<TierProgression>;
}

export const useCommissionConfig = (organizerId: string): UseCommissionConfigResult => {
  // State
  const [config, setConfig] = useState<CommissionConfig | null>(null);
  const [tiers, setTiers] = useState<CommissionTier[]>([]);
  const [payoutSettings, setPayoutSettings] = useState<PayoutSettings | null>(null);
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Error state
  const [error, setError] = useState<string | null>(null);

  // Fetch commission configuration
  const fetchConfig = useCallback(async () => {
    try {
      setError(null);
      const configData = await commissionConfigService.getCommissionConfig(organizerId);
      setConfig(configData);
      
      const tiersData = await commissionConfigService.getCommissionTiers(configData.id);
      setTiers(tiersData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch commission config');
    }
  }, [organizerId]);

  // Fetch payout settings
  const fetchPayoutSettings = useCallback(async () => {
    try {
      const settings = await commissionConfigService.getPayoutSettings(organizerId);
      setPayoutSettings(settings);
    } catch (err) {
      console.error('Failed to fetch payout settings:', err);
    }
  }, [organizerId]);

  // Refresh all configuration data
  const refreshConfig = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchConfig(),
        fetchPayoutSettings()
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh config');
    } finally {
      setLoading(false);
    }
  }, [fetchConfig, fetchPayoutSettings]);

  // Update commission configuration
  const updateConfig = useCallback(async (updates: Partial<CommissionConfig>) => {
    if (!config) throw new Error('No config to update');
    
    try {
      setSaving(true);
      setError(null);
      
      const updatedConfig = await commissionConfigService.updateCommissionConfig(config.id, updates);
      setConfig(updatedConfig);
      
      return updatedConfig;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update config';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setSaving(false);
    }
  }, [config]);

  // Create new commission tier
  const createTier = useCallback(async (tierData: Omit<CommissionTier, 'id'>) => {
    try {
      setSaving(true);
      setError(null);
      
      const newTier = await commissionConfigService.createCommissionTier(tierData);
      setTiers(prev => [...prev, newTier].sort((a, b) => a.min_sales_volume - b.min_sales_volume));
      
      return newTier;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create tier';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setSaving(false);
    }
  }, []);

  // Update commission tier
  const updateTier = useCallback(async (tierId: string, updates: Partial<CommissionTier>) => {
    try {
      setSaving(true);
      setError(null);
      
      const updatedTier = await commissionConfigService.updateCommissionTier(tierId, updates);
      setTiers(prev => prev.map(tier => 
        tier.id === tierId ? updatedTier : tier
      ).sort((a, b) => a.min_sales_volume - b.min_sales_volume));
      
      return updatedTier;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update tier';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setSaving(false);
    }
  }, []);

  // Delete commission tier
  const deleteTier = useCallback(async (tierId: string) => {
    try {
      setSaving(true);
      setError(null);
      
      // In a real implementation, this would call the service
      console.log('Deleting tier:', tierId);
      setTiers(prev => prev.filter(tier => tier.id !== tierId));
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to delete tier';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setSaving(false);
    }
  }, []);

  // Update payout settings
  const updatePayoutSettings = useCallback(async (updates: Partial<PayoutSettings>) => {
    if (!payoutSettings) throw new Error('No payout settings to update');
    
    try {
      setSaving(true);
      setError(null);
      
      const updatedSettings = await commissionConfigService.updatePayoutSettings(payoutSettings.id, updates);
      setPayoutSettings(updatedSettings);
      
      return updatedSettings;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update payout settings';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setSaving(false);
    }
  }, [payoutSettings]);

  // Calculate commission for a sale
  const calculateCommission = useCallback(async (agentId: string, saleAmount: number, eventId?: string) => {
    try {
      return await commissionConfigService.calculateCommission(agentId, saleAmount, eventId);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to calculate commission';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }, []);

  // Export configuration data
  const exportConfig = useCallback(async (format: 'csv' | 'excel' | 'pdf') => {
    try {
      await commissionConfigService.exportCommissionData(organizerId, format);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to export config';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }, [organizerId]);

  // Get agent commission overrides
  const getAgentOverrides = useCallback(async (agentId: string) => {
    try {
      return await commissionConfigService.getAgentOverrides(agentId);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch agent overrides';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }, []);

  // Create agent commission override
  const createAgentOverride = useCallback(async (overrideData: Omit<AgentCommissionOverride, 'id' | 'created_at'>) => {
    try {
      setSaving(true);
      setError(null);
      
      const override = await commissionConfigService.createAgentOverride(overrideData);
      
      return override;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create agent override';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setSaving(false);
    }
  }, []);

  // Get tier progression for agent
  const getTierProgression = useCallback(async (agentId: string) => {
    try {
      return await commissionConfigService.getTierProgression(agentId);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch tier progression';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }, []);

  // Process tier promotion
  const processTierPromotion = useCallback(async (agentId: string, newTierId: string) => {
    try {
      setSaving(true);
      setError(null);
      
      const progression = await commissionConfigService.processTierPromotion(agentId, newTierId);
      
      return progression;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to process tier promotion';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setSaving(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    if (organizerId) {
      refreshConfig();
    }
  }, [organizerId, refreshConfig]);

  return {
    // Data
    config,
    tiers,
    payoutSettings,
    
    // Loading states
    loading,
    saving,
    
    // Error state
    error,
    
    // Actions
    refreshConfig,
    updateConfig,
    createTier,
    updateTier,
    deleteTier,
    updatePayoutSettings,
    calculateCommission,
    exportConfig,
    
    // Agent-specific functions
    getAgentOverrides,
    createAgentOverride,
    getTierProgression,
    processTierPromotion
  };
};