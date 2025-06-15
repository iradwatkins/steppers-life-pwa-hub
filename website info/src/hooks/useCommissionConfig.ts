import { useState, useEffect } from 'react';
import { 
  commissionConfigService, 
  CommissionConfiguration, 
  CommissionRate, 
  CommissionTier, 
  AgentCommissionProfile 
} from '../services/commissionConfigService';

export interface UseCommissionConfigReturn {
  config: CommissionConfiguration | null;
  agentProfile: AgentCommissionProfile | null;
  availableTiers: CommissionTier[];
  isLoading: boolean;
  error: string | null;
  
  // Configuration management
  updateConfiguration: (updates: Partial<CommissionConfiguration>) => Promise<boolean>;
  createCommissionRate: (rateData: Omit<CommissionRate, 'id' | 'createdDate' | 'lastModified'>) => Promise<CommissionRate | null>;
  updateCommissionRate: (rateId: string, updates: Partial<CommissionRate>) => Promise<CommissionRate | null>;
  createCommissionTier: (tierData: Omit<CommissionTier, 'id'>) => Promise<CommissionTier | null>;
  
  // Agent tier management
  updateAgentTier: (agentId: string, newTierId: string, reason: string) => Promise<boolean>;
  calculateCommissionRate: (agentId: string, eventId: string, saleAmount: number) => Promise<number>;
  evaluateAgentForPromotion: (agentId: string) => Promise<any>;
  
  // Refresh functions
  refreshConfig: () => Promise<void>;
  refreshAgentProfile: () => Promise<void>;
}

export const useCommissionConfig = (organizerId?: string, agentId?: string): UseCommissionConfigReturn => {
  const [config, setConfig] = useState<CommissionConfiguration | null>(null);
  const [agentProfile, setAgentProfile] = useState<AgentCommissionProfile | null>(null);
  const [availableTiers, setAvailableTiers] = useState<CommissionTier[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load configuration
  const loadConfiguration = async () => {
    if (!organizerId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const configData = await commissionConfigService.getCommissionConfiguration(organizerId);
      setConfig(configData);
      
      const tiersData = await commissionConfigService.getAvailableTiers(organizerId);
      setAvailableTiers(tiersData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load commission configuration');
    } finally {
      setIsLoading(false);
    }
  };

  // Load agent profile
  const loadAgentProfile = async () => {
    if (!agentId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const profileData = await commissionConfigService.getAgentCommissionProfile(agentId);
      setAgentProfile(profileData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load agent commission profile');
    } finally {
      setIsLoading(false);
    }
  };

  // Update configuration
  const updateConfiguration = async (updates: Partial<CommissionConfiguration>): Promise<boolean> => {
    if (!organizerId) return false;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const updatedConfig = await commissionConfigService.updateCommissionConfiguration(organizerId, updates);
      setConfig(updatedConfig);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update commission configuration');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Create commission rate
  const createCommissionRate = async (
    rateData: Omit<CommissionRate, 'id' | 'createdDate' | 'lastModified'>
  ): Promise<CommissionRate | null> => {
    if (!organizerId) return null;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const newRate = await commissionConfigService.createCommissionRate(organizerId, rateData);
      
      // Refresh configuration to get updated data
      await loadConfiguration();
      
      return newRate;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create commission rate');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Update commission rate
  const updateCommissionRate = async (
    rateId: string, 
    updates: Partial<CommissionRate>
  ): Promise<CommissionRate | null> => {
    if (!organizerId) return null;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const updatedRate = await commissionConfigService.updateCommissionRate(organizerId, rateId, updates);
      
      // Refresh configuration to get updated data
      await loadConfiguration();
      
      return updatedRate;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update commission rate');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Create commission tier
  const createCommissionTier = async (
    tierData: Omit<CommissionTier, 'id'>
  ): Promise<CommissionTier | null> => {
    if (!organizerId) return null;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const newTier = await commissionConfigService.createCommissionTier(organizerId, tierData);
      
      // Refresh data
      await loadConfiguration();
      
      return newTier;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create commission tier');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Update agent tier
  const updateAgentTier = async (agentId: string, newTierId: string, reason: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      await commissionConfigService.updateAgentTier(agentId, newTierId, reason);
      
      // Refresh agent profile if it's the current agent
      if (agentId === agentProfile?.agentId) {
        await loadAgentProfile();
      }
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update agent tier');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate commission rate
  const calculateCommissionRate = async (
    agentId: string, 
    eventId: string, 
    saleAmount: number
  ): Promise<number> => {
    if (!organizerId) return 0;
    
    try {
      return await commissionConfigService.calculateCommissionRate(agentId, organizerId, eventId, saleAmount);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to calculate commission rate');
      return 0;
    }
  };

  // Evaluate agent for tier promotion
  const evaluateAgentForPromotion = async (agentId: string) => {
    try {
      return await commissionConfigService.evaluateAgentForTierPromotion(agentId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to evaluate agent for promotion');
      return null;
    }
  };

  // Refresh functions
  const refreshConfig = async () => {
    await loadConfiguration();
  };

  const refreshAgentProfile = async () => {
    await loadAgentProfile();
  };

  // Load data on mount and when dependencies change
  useEffect(() => {
    loadConfiguration();
  }, [organizerId]);

  useEffect(() => {
    loadAgentProfile();
  }, [agentId]);

  return {
    config,
    agentProfile,
    availableTiers,
    isLoading,
    error,
    updateConfiguration,
    createCommissionRate,
    updateCommissionRate,
    createCommissionTier,
    updateAgentTier,
    calculateCommissionRate,
    evaluateAgentForPromotion,
    refreshConfig,
    refreshAgentProfile
  };
}; 