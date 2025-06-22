// Commission Configuration Service - Epic F.003
// Advanced commission system with tier-based rates and trackable links

export interface CommissionConfig {
  id: string;
  organizer_id: string;
  name: string;
  description: string;
  default_rate: number;
  tier_system_enabled: boolean;
  individual_overrides_enabled: boolean;
  created_at: string;
  updated_at: string;
  status: 'active' | 'inactive';
}

export interface CommissionTier {
  id: string;
  config_id: string;
  name: string;
  min_sales_volume: number;
  max_sales_volume?: number;
  commission_rate: number;
  bonus_percentage?: number;
  requirements: string[];
  benefits: string[];
  color: string;
}

export interface AgentCommissionOverride {
  id: string;
  agent_id: string;
  event_id?: string;
  override_rate: number;
  reason: string;
  start_date: string;
  end_date?: string;
  created_by: string;
  created_at: string;
}

export interface PayoutSettings {
  id: string;
  organizer_id: string;
  frequency: 'weekly' | 'biweekly' | 'monthly';
  minimum_payout: number;
  payment_methods: PaymentMethod[];
  auto_payout_enabled: boolean;
  hold_period_days: number;
  tax_withholding_enabled: boolean;
  tax_rate?: number;
}

export interface PaymentMethod {
  id: string;
  type: 'bank_transfer' | 'paypal' | 'check' | 'digital_wallet';
  name: string;
  details: Record<string, any>;
  is_default: boolean;
  enabled: boolean;
}

export interface TierProgression {
  agent_id: string;
  current_tier_id: string;
  next_tier_id?: string;
  current_sales_volume: number;
  progress_to_next: number;
  estimated_promotion_date?: string;
  tier_history: TierHistoryEntry[];
}

export interface TierHistoryEntry {
  tier_id: string;
  tier_name: string;
  promoted_at: string;
  sales_volume_at_promotion: number;
  duration_days: number;
}

class CommissionConfigService {
  // Get commission configuration for organizer
  async getCommissionConfig(organizerId: string): Promise<CommissionConfig> {
    try {
      return {
        id: 'config_001',
        organizer_id: organizerId,
        name: 'Standard Commission Plan',
        description: 'Tier-based commission system with performance bonuses',
        default_rate: 6.0,
        tier_system_enabled: true,
        individual_overrides_enabled: true,
        created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active'
      };
    } catch (error) {
      console.error('Error fetching commission config:', error);
      throw error;
    }
  }

  // Get commission tiers
  async getCommissionTiers(configId: string): Promise<CommissionTier[]> {
    try {
      return [
        {
          id: 'tier_001',
          config_id: configId,
          name: 'Bronze Agent',
          min_sales_volume: 0,
          max_sales_volume: 2500,
          commission_rate: 5.0,
          requirements: ['Complete onboarding', 'First 5 sales'],
          benefits: ['Basic commission rate', 'Monthly reports'],
          color: '#CD7F32'
        },
        {
          id: 'tier_002',
          config_id: configId,
          name: 'Silver Agent',
          min_sales_volume: 2500,
          max_sales_volume: 7500,
          commission_rate: 6.5,
          bonus_percentage: 0.5,
          requirements: ['$2,500+ monthly sales', '85%+ conversion rate'],
          benefits: ['Higher commission', 'Priority support', 'Marketing materials'],
          color: '#C0C0C0'
        },
        {
          id: 'tier_003',
          config_id: configId,
          name: 'Gold Agent',
          min_sales_volume: 7500,
          max_sales_volume: 15000,
          commission_rate: 8.0,
          bonus_percentage: 1.0,
          requirements: ['$7,500+ monthly sales', '90%+ conversion rate', 'Team leadership'],
          benefits: ['Premium commission', 'Exclusive events', 'Advanced analytics'],
          color: '#FFD700'
        },
        {
          id: 'tier_004',
          config_id: configId,
          name: 'Platinum Agent',
          min_sales_volume: 15000,
          commission_rate: 10.0,
          bonus_percentage: 2.0,
          requirements: ['$15,000+ monthly sales', '95%+ conversion rate', 'Mentor others'],
          benefits: ['Maximum commission', 'VIP treatment', 'Revenue sharing'],
          color: '#E5E4E2'
        }
      ];
    } catch (error) {
      console.error('Error fetching commission tiers:', error);
      throw error;
    }
  }

  // Update commission configuration
  async updateCommissionConfig(configId: string, updates: Partial<CommissionConfig>): Promise<CommissionConfig> {
    try {
      const existingConfig = await this.getCommissionConfig(updates.organizer_id || 'default');
      
      const updatedConfig: CommissionConfig = {
        ...existingConfig,
        ...updates,
        updated_at: new Date().toISOString()
      };

      console.log('Updating commission config:', updatedConfig);
      return updatedConfig;
    } catch (error) {
      console.error('Error updating commission config:', error);
      throw error;
    }
  }

  // Create new commission tier
  async createCommissionTier(tierData: Omit<CommissionTier, 'id'>): Promise<CommissionTier> {
    try {
      const newTier: CommissionTier = {
        id: `tier_${Date.now()}`,
        ...tierData
      };

      console.log('Creating commission tier:', newTier);
      return newTier;
    } catch (error) {
      console.error('Error creating commission tier:', error);
      throw error;
    }
  }

  // Update commission tier
  async updateCommissionTier(tierId: string, updates: Partial<CommissionTier>): Promise<CommissionTier> {
    try {
      const tiers = await this.getCommissionTiers('config_001');
      const existingTier = tiers.find(t => t.id === tierId);
      
      if (!existingTier) {
        throw new Error('Tier not found');
      }

      const updatedTier: CommissionTier = {
        ...existingTier,
        ...updates
      };

      console.log('Updating commission tier:', updatedTier);
      return updatedTier;
    } catch (error) {
      console.error('Error updating commission tier:', error);
      throw error;
    }
  }

  // Get agent commission overrides
  async getAgentOverrides(agentId: string): Promise<AgentCommissionOverride[]> {
    try {
      return [
        {
          id: 'override_001',
          agent_id: agentId,
          event_id: 'event_001',
          override_rate: 8.5,
          reason: 'Special event performance bonus',
          start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          end_date: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000).toISOString(),
          created_by: 'organizer_001',
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
    } catch (error) {
      console.error('Error fetching agent overrides:', error);
      throw error;
    }
  }

  // Create agent commission override
  async createAgentOverride(overrideData: Omit<AgentCommissionOverride, 'id' | 'created_at'>): Promise<AgentCommissionOverride> {
    try {
      const newOverride: AgentCommissionOverride = {
        id: `override_${Date.now()}`,
        created_at: new Date().toISOString(),
        ...overrideData
      };

      console.log('Creating agent override:', newOverride);
      return newOverride;
    } catch (error) {
      console.error('Error creating agent override:', error);
      throw error;
    }
  }

  // Get payout settings
  async getPayoutSettings(organizerId: string): Promise<PayoutSettings> {
    try {
      return {
        id: 'payout_001',
        organizer_id: organizerId,
        frequency: 'biweekly',
        minimum_payout: 50.00,
        payment_methods: [
          {
            id: 'pm_001',
            type: 'bank_transfer',
            name: 'Business Bank Account',
            details: { bank_name: 'Chase Bank', account_type: 'checking' },
            is_default: true,
            enabled: true
          },
          {
            id: 'pm_002',
            type: 'paypal',
            name: 'PayPal Business',
            details: { email: 'business@example.com' },
            is_default: false,
            enabled: true
          }
        ],
        auto_payout_enabled: true,
        hold_period_days: 7,
        tax_withholding_enabled: false
      };
    } catch (error) {
      console.error('Error fetching payout settings:', error);
      throw error;
    }
  }

  // Update payout settings
  async updatePayoutSettings(settingsId: string, updates: Partial<PayoutSettings>): Promise<PayoutSettings> {
    try {
      const existingSettings = await this.getPayoutSettings(updates.organizer_id || 'default');
      
      const updatedSettings: PayoutSettings = {
        ...existingSettings,
        ...updates
      };

      console.log('Updating payout settings:', updatedSettings);
      return updatedSettings;
    } catch (error) {
      console.error('Error updating payout settings:', error);
      throw error;
    }
  }

  // Get tier progression for agent
  async getTierProgression(agentId: string): Promise<TierProgression> {
    try {
      const currentSalesVolume = 4200; // Mock current sales
      const currentTier = 'tier_002'; // Silver tier
      const nextTier = 'tier_003'; // Gold tier
      const nextTierThreshold = 7500;
      
      return {
        agent_id: agentId,
        current_tier_id: currentTier,
        next_tier_id: nextTier,
        current_sales_volume: currentSalesVolume,
        progress_to_next: (currentSalesVolume / nextTierThreshold) * 100,
        estimated_promotion_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
        tier_history: [
          {
            tier_id: 'tier_001',
            tier_name: 'Bronze Agent',
            promoted_at: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
            sales_volume_at_promotion: 0,
            duration_days: 60
          },
          {
            tier_id: 'tier_002',
            tier_name: 'Silver Agent',
            promoted_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
            sales_volume_at_promotion: 2500,
            duration_days: 60
          }
        ]
      };
    } catch (error) {
      console.error('Error fetching tier progression:', error);
      throw error;
    }
  }

  // Calculate commission for sale
  async calculateCommission(agentId: string, saleAmount: number, eventId?: string): Promise<{
    baseRate: number;
    tierRate: number;
    overrideRate?: number;
    finalRate: number;
    commissionAmount: number;
    bonusAmount?: number;
  }> {
    try {
      const config = await this.getCommissionConfig('org_001');
      const tiers = await this.getCommissionTiers(config.id);
      const progression = await this.getTierProgression(agentId);
      const overrides = await this.getAgentOverrides(agentId);
      
      // Find current tier
      const currentTier = tiers.find(t => t.id === progression.current_tier_id);
      const tierRate = currentTier?.commission_rate || config.default_rate;
      
      // Check for overrides
      const activeOverride = overrides.find(o => 
        (!o.event_id || o.event_id === eventId) &&
        new Date(o.start_date) <= new Date() &&
        (!o.end_date || new Date(o.end_date) >= new Date())
      );
      
      const finalRate = activeOverride?.override_rate || tierRate;
      const commissionAmount = (saleAmount * finalRate) / 100;
      const bonusAmount = currentTier?.bonus_percentage ? 
        (saleAmount * currentTier.bonus_percentage) / 100 : undefined;
      
      return {
        baseRate: config.default_rate,
        tierRate,
        overrideRate: activeOverride?.override_rate,
        finalRate,
        commissionAmount: Math.round(commissionAmount * 100) / 100,
        bonusAmount: bonusAmount ? Math.round(bonusAmount * 100) / 100 : undefined
      };
    } catch (error) {
      console.error('Error calculating commission:', error);
      throw error;
    }
  }

  // Process tier promotion
  async processTierPromotion(agentId: string, newTierId: string): Promise<TierProgression> {
    try {
      const progression = await this.getTierProgression(agentId);
      const tiers = await this.getCommissionTiers('config_001');
      const newTier = tiers.find(t => t.id === newTierId);
      
      if (!newTier) {
        throw new Error('Invalid tier ID');
      }

      // Add current tier to history
      const currentTier = tiers.find(t => t.id === progression.current_tier_id);
      if (currentTier) {
        const currentHistoryEntry = progression.tier_history.find(h => h.tier_id === progression.current_tier_id);
        const promotionDate = currentHistoryEntry?.promoted_at || new Date().toISOString();
        const durationDays = Math.floor((Date.now() - new Date(promotionDate).getTime()) / (1000 * 60 * 60 * 24));
        
        progression.tier_history.push({
          tier_id: progression.current_tier_id,
          tier_name: currentTier.name,
          promoted_at: promotionDate,
          sales_volume_at_promotion: progression.current_sales_volume,
          duration_days: durationDays
        });
      }

      // Update progression
      progression.current_tier_id = newTierId;
      const nextTierIndex = tiers.findIndex(t => t.id === newTierId) + 1;
      progression.next_tier_id = nextTierIndex < tiers.length ? tiers[nextTierIndex].id : undefined;
      
      if (progression.next_tier_id) {
        const nextTier = tiers[nextTierIndex];
        progression.progress_to_next = (progression.current_sales_volume / nextTier.min_sales_volume) * 100;
      }

      console.log('Processing tier promotion:', progression);
      return progression;
    } catch (error) {
      console.error('Error processing tier promotion:', error);
      throw error;
    }
  }

  // Export commission data
  async exportCommissionData(organizerId: string, format: 'csv' | 'excel' | 'pdf'): Promise<void> {
    try {
      const config = await this.getCommissionConfig(organizerId);
      const tiers = await this.getCommissionTiers(config.id);
      
      if (format === 'csv') {
        const csvContent = this.generateCommissionCSV(config, tiers);
        this.downloadFile(csvContent, `commission-config-${organizerId}.csv`, 'text/csv');
      } else {
        console.log(`Generating ${format} export for commission config`);
      }
    } catch (error) {
      console.error('Error exporting commission data:', error);
      throw error;
    }
  }

  private generateCommissionCSV(config: CommissionConfig, tiers: CommissionTier[]): string {
    const headers = ['Tier Name', 'Min Sales Volume', 'Max Sales Volume', 'Commission Rate', 'Bonus Rate'];
    const rows = tiers.map(tier => [
      tier.name,
      tier.min_sales_volume.toString(),
      tier.max_sales_volume?.toString() || 'Unlimited',
      `${tier.commission_rate}%`,
      tier.bonus_percentage ? `${tier.bonus_percentage}%` : 'None'
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  private downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export const commissionConfigService = new CommissionConfigService();
export default commissionConfigService;