export interface CommissionRate {
  id: string;
  name: string;
  type: 'default' | 'individual' | 'tier_based' | 'event_specific';
  baseRate: number;
  agentId?: string;
  eventId?: string;
  isActive: boolean;
  createdDate: Date;
  lastModified: Date;
  conditions?: CommissionCondition[];
}

export interface CommissionCondition {
  type: 'sales_volume' | 'revenue_threshold' | 'event_type' | 'customer_tier' | 'time_period';
  operator: 'greater_than' | 'less_than' | 'equals' | 'between';
  value: number | string;
  secondaryValue?: number;
  adjustment: number; // Percentage adjustment to base rate
}

export interface CommissionTier {
  id: string;
  name: string;
  description: string;
  minSalesVolume: number;
  minRevenue: number;
  commissionRate: number;
  bonusPercentage: number;
  requirements: TierRequirement[];
  benefits: string[];
  isActive: boolean;
}

export interface TierRequirement {
  type: 'monthly_sales' | 'quarterly_revenue' | 'customer_satisfaction' | 'retention_rate';
  threshold: number;
  unit: string;
}

export interface AgentCommissionProfile {
  agentId: string;
  currentTier: string;
  customRates: CommissionRate[];
  tierHistory: TierHistoryEntry[];
  performanceMetrics: TierPerformanceMetrics;
  nextTierProgress: number;
  estimatedNextTierDate?: Date;
}

export interface TierHistoryEntry {
  tierId: string;
  tierName: string;
  startDate: Date;
  endDate?: Date;
  achievementReason: string;
  metricsAtTime: TierPerformanceMetrics;
}

export interface TierPerformanceMetrics {
  monthlySales: number;
  quarterlyRevenue: number;
  customerSatisfaction: number;
  retentionRate: number;
  conversionRate: number;
  averageOrderValue: number;
}

export interface CommissionConfiguration {
  organizerId: string;
  defaultRates: {
    standardRate: number;
    vipRate: number;
    bulkRate: number;
    earlyBirdRate: number;
  };
  tiers: CommissionTier[];
  globalRules: CommissionRule[];
  payoutSettings: PayoutConfiguration;
  lastUpdated: Date;
}

export interface CommissionRule {
  id: string;
  name: string;
  description: string;
  priority: number;
  conditions: CommissionCondition[];
  action: 'increase_rate' | 'decrease_rate' | 'set_fixed_rate' | 'add_bonus';
  value: number;
  isActive: boolean;
}

export interface PayoutConfiguration {
  schedule: 'weekly' | 'biweekly' | 'monthly' | 'quarterly';
  minimumAmount: number;
  paymentMethods: string[];
  processingDay: number; // Day of week/month
  autoApproval: boolean;
  approvalThreshold: number;
}

class CommissionConfigService {
  private configurations: Map<string, CommissionConfiguration> = new Map();
  private agentProfiles: Map<string, AgentCommissionProfile> = new Map();

  async getCommissionConfiguration(organizerId: string): Promise<CommissionConfiguration> {
    if (!this.configurations.has(organizerId)) {
      this.configurations.set(organizerId, this.generateMockConfiguration(organizerId));
    }
    return this.configurations.get(organizerId)!;
  }

  async updateCommissionConfiguration(
    organizerId: string, 
    updates: Partial<CommissionConfiguration>
  ): Promise<CommissionConfiguration> {
    const existing = await this.getCommissionConfiguration(organizerId);
    const updated = {
      ...existing,
      ...updates,
      lastUpdated: new Date()
    };
    this.configurations.set(organizerId, updated);
    return updated;
  }

  async getAgentCommissionProfile(agentId: string): Promise<AgentCommissionProfile> {
    if (!this.agentProfiles.has(agentId)) {
      this.agentProfiles.set(agentId, this.generateMockAgentProfile(agentId));
    }
    return this.agentProfiles.get(agentId)!;
  }

  async updateAgentTier(agentId: string, newTierId: string, reason: string): Promise<void> {
    const profile = await this.getAgentCommissionProfile(agentId);
    const oldTier = profile.currentTier;
    
    // Add to history
    if (oldTier) {
      const historyEntry: TierHistoryEntry = {
        tierId: oldTier,
        tierName: this.getTierName(oldTier),
        startDate: this.getLastTierStartDate(profile),
        endDate: new Date(),
        achievementReason: reason,
        metricsAtTime: { ...profile.performanceMetrics }
      };
      profile.tierHistory.push(historyEntry);
    }

    profile.currentTier = newTierId;
    profile.nextTierProgress = this.calculateNextTierProgress(profile);
    this.agentProfiles.set(agentId, profile);
  }

  async calculateCommissionRate(
    agentId: string, 
    organizerId: string, 
    eventId: string, 
    saleAmount: number
  ): Promise<number> {
    const config = await this.getCommissionConfiguration(organizerId);
    const agentProfile = await this.getAgentCommissionProfile(agentId);

    // Start with default rate
    let baseRate = config.defaultRates.standardRate;

    // Apply tier-based rate if applicable
    const tier = config.tiers.find(t => t.id === agentProfile.currentTier);
    if (tier) {
      baseRate = tier.commissionRate;
    }

    // Apply individual agent overrides
    const agentOverride = agentProfile.customRates.find(
      r => r.isActive && (r.eventId === eventId || !r.eventId)
    );
    if (agentOverride) {
      baseRate = agentOverride.baseRate;
    }

    // Apply global rules
    for (const rule of config.globalRules.filter(r => r.isActive)) {
      if (this.evaluateRuleConditions(rule.conditions, { agentId, eventId, saleAmount, agentProfile })) {
        baseRate = this.applyRuleAction(baseRate, rule);
      }
    }

    // Apply tier bonus
    if (tier?.bonusPercentage) {
      baseRate += (baseRate * tier.bonusPercentage / 100);
    }

    return Math.max(0, Math.min(100, baseRate)); // Clamp between 0-100%
  }

  async createCommissionRate(
    organizerId: string,
    rateData: Omit<CommissionRate, 'id' | 'createdDate' | 'lastModified'>
  ): Promise<CommissionRate> {
    const config = await this.getCommissionConfiguration(organizerId);
    const newRate: CommissionRate = {
      ...rateData,
      id: `rate-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdDate: new Date(),
      lastModified: new Date()
    };

    // Update configuration (in real app, this would be persisted)
    await this.updateCommissionConfiguration(organizerId, config);
    
    return newRate;
  }

  async updateCommissionRate(
    organizerId: string,
    rateId: string,
    updates: Partial<CommissionRate>
  ): Promise<CommissionRate> {
    const config = await this.getCommissionConfiguration(organizerId);
    // In real implementation, find and update the rate
    // For now, return mock updated rate
    return {
      ...updates,
      id: rateId,
      lastModified: new Date()
    } as CommissionRate;
  }

  async getAvailableTiers(organizerId: string): Promise<CommissionTier[]> {
    const config = await this.getCommissionConfiguration(organizerId);
    return config.tiers.filter(t => t.isActive);
  }

  async createCommissionTier(
    organizerId: string,
    tierData: Omit<CommissionTier, 'id'>
  ): Promise<CommissionTier> {
    const config = await this.getCommissionConfiguration(organizerId);
    const newTier: CommissionTier = {
      ...tierData,
      id: `tier-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };

    config.tiers.push(newTier);
    await this.updateCommissionConfiguration(organizerId, config);
    
    return newTier;
  }

  async evaluateAgentForTierPromotion(agentId: string): Promise<{
    eligible: boolean;
    targetTier?: CommissionTier;
    missingRequirements?: string[];
    currentProgress?: Record<string, number>;
  }> {
    const profile = await this.getAgentCommissionProfile(agentId);
    // In real implementation, this would check against actual requirements
    return {
      eligible: profile.performanceMetrics.monthlySales > 10000,
      targetTier: undefined, // Would return next available tier
      missingRequirements: [],
      currentProgress: {}
    };
  }

  private generateMockConfiguration(organizerId: string): CommissionConfiguration {
    return {
      organizerId,
      defaultRates: {
        standardRate: 10,
        vipRate: 15,
        bulkRate: 8,
        earlyBirdRate: 12
      },
      tiers: [
        {
          id: 'bronze',
          name: 'Bronze Agent',
          description: 'Entry level sales agent',
          minSalesVolume: 0,
          minRevenue: 0,
          commissionRate: 10,
          bonusPercentage: 0,
          requirements: [
            { type: 'monthly_sales', threshold: 5, unit: 'tickets' }
          ],
          benefits: ['Basic commission rate', 'Monthly payouts'],
          isActive: true
        },
        {
          id: 'silver',
          name: 'Silver Agent',
          description: 'Experienced sales agent',
          minSalesVolume: 50,
          minRevenue: 5000,
          commissionRate: 12,
          bonusPercentage: 5,
          requirements: [
            { type: 'monthly_sales', threshold: 20, unit: 'tickets' },
            { type: 'quarterly_revenue', threshold: 15000, unit: 'dollars' }
          ],
          benefits: ['Enhanced commission rate', 'Performance bonus', 'Priority support'],
          isActive: true
        },
        {
          id: 'gold',
          name: 'Gold Agent',
          description: 'Top-performing sales agent',
          minSalesVolume: 100,
          minRevenue: 15000,
          commissionRate: 15,
          bonusPercentage: 10,
          requirements: [
            { type: 'monthly_sales', threshold: 40, unit: 'tickets' },
            { type: 'quarterly_revenue', threshold: 45000, unit: 'dollars' },
            { type: 'customer_satisfaction', threshold: 4.5, unit: 'rating' }
          ],
          benefits: ['Premium commission rate', 'Higher bonus', 'Exclusive events', 'Marketing support'],
          isActive: true
        }
      ],
      globalRules: [
        {
          id: 'bulk-bonus',
          name: 'Bulk Sale Bonus',
          description: 'Extra commission for sales over 10 tickets',
          priority: 1,
          conditions: [
            {
              type: 'sales_volume',
              operator: 'greater_than',
              value: 10,
              adjustment: 2
            }
          ],
          action: 'increase_rate',
          value: 2,
          isActive: true
        }
      ],
      payoutSettings: {
        schedule: 'monthly',
        minimumAmount: 50,
        paymentMethods: ['bank_transfer', 'paypal'],
        processingDay: 1,
        autoApproval: false,
        approvalThreshold: 1000
      },
      lastUpdated: new Date()
    };
  }

  private generateMockAgentProfile(agentId: string): AgentCommissionProfile {
    return {
      agentId,
      currentTier: 'silver',
      customRates: [],
      tierHistory: [
        {
          tierId: 'bronze',
          tierName: 'Bronze Agent',
          startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          achievementReason: 'Initial tier assignment',
          metricsAtTime: {
            monthlySales: 15,
            quarterlyRevenue: 3000,
            customerSatisfaction: 4.2,
            retentionRate: 85,
            conversionRate: 15,
            averageOrderValue: 150
          }
        }
      ],
      performanceMetrics: {
        monthlySales: 25,
        quarterlyRevenue: 8500,
        customerSatisfaction: 4.6,
        retentionRate: 92,
        conversionRate: 18,
        averageOrderValue: 180
      },
      nextTierProgress: 68,
      estimatedNextTierDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000)
    };
  }

  private getTierName(tierId: string): string {
    const tierNames: Record<string, string> = {
      'bronze': 'Bronze Agent',
      'silver': 'Silver Agent',
      'gold': 'Gold Agent'
    };
    return tierNames[tierId] || 'Unknown Tier';
  }

  private getLastTierStartDate(profile: AgentCommissionProfile): Date {
    const lastEntry = profile.tierHistory[profile.tierHistory.length - 1];
    return lastEntry?.endDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  }

  private calculateNextTierProgress(profile: AgentCommissionProfile): number {
    // Mock calculation - in real app, would calculate based on actual tier requirements
    return Math.floor(Math.random() * 100);
  }

  private evaluateRuleConditions(
    conditions: CommissionCondition[], 
    context: { agentId: string; eventId: string; saleAmount: number; agentProfile: AgentCommissionProfile }
  ): boolean {
    return conditions.every(condition => {
      switch (condition.type) {
        case 'sales_volume':
          return this.compareValues(context.agentProfile.performanceMetrics.monthlySales, condition);
        case 'revenue_threshold':
          return this.compareValues(context.saleAmount, condition);
        default:
          return true;
      }
    });
  }

  private compareValues(value: number, condition: CommissionCondition): boolean {
    const threshold = typeof condition.value === 'number' ? condition.value : parseFloat(condition.value);
    
    switch (condition.operator) {
      case 'greater_than':
        return value > threshold;
      case 'less_than':
        return value < threshold;
      case 'equals':
        return value === threshold;
      case 'between':
        return condition.secondaryValue 
          ? value >= threshold && value <= condition.secondaryValue
          : false;
      default:
        return false;
    }
  }

  private applyRuleAction(baseRate: number, rule: CommissionRule): number {
    switch (rule.action) {
      case 'increase_rate':
        return baseRate + rule.value;
      case 'decrease_rate':
        return baseRate - rule.value;
      case 'set_fixed_rate':
        return rule.value;
      case 'add_bonus':
        return baseRate + (baseRate * rule.value / 100);
      default:
        return baseRate;
    }
  }
}

export const commissionConfigService = new CommissionConfigService(); 