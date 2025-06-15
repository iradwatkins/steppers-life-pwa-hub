export interface LeaderboardEntry {
  rank: number;
  agentId: string;
  agentName: string;
  agentPhoto?: string;
  organizerId: string;
  metrics: AgentMetrics;
  badges: Achievement[];
  streak: PerformanceStreak;
  tier: string;
  points: number;
  previousRank?: number;
  trendDirection: 'up' | 'down' | 'stable';
}

export interface AgentMetrics {
  totalSales: number;
  totalRevenue: number;
  totalCommissions: number;
  conversionRate: number;
  averageOrderValue: number;
  customerSatisfaction: number;
  socialEngagement: number;
  referralCount: number;
  eventsSold: number;
  activeDays: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'sales' | 'social' | 'customer' | 'streak' | 'special';
  earnedDate: Date;
  value?: number;
  isRare: boolean;
}

export interface PerformanceStreak {
  type: 'daily_sales' | 'weekly_goals' | 'customer_satisfaction' | 'social_posts';
  currentStreak: number;
  longestStreak: number;
  startDate: Date;
  isActive: boolean;
}

export interface LeaderboardConfig {
  organizerId: string;
  period: LeaderboardPeriod;
  metrics: MetricWeight[];
  categories: LeaderboardCategory[];
  rewards: LeaderboardReward[];
  updateFrequency: 'real_time' | 'hourly' | 'daily' | 'weekly';
  showRankings: boolean;
  anonymizeAgents: boolean;
  minActivityThreshold: number;
}

export type LeaderboardPeriod = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'all_time';

export interface MetricWeight {
  metric: keyof AgentMetrics;
  weight: number;
  displayName: string;
  format: 'number' | 'currency' | 'percentage';
}

export interface LeaderboardCategory {
  id: string;
  name: string;
  description: string;
  criteria: CategoryCriteria;
  rewards: string[];
  isActive: boolean;
}

export interface CategoryCriteria {
  primaryMetric: keyof AgentMetrics;
  minimumValue?: number;
  agentFilters?: AgentFilter[];
}

export interface AgentFilter {
  type: 'tier' | 'experience' | 'territory' | 'specialization';
  value: string;
}

export interface LeaderboardReward {
  id: string;
  title: string;
  description: string;
  type: 'monetary' | 'recognition' | 'privilege' | 'physical';
  value: number | string;
  criteria: RewardCriteria;
  isActive: boolean;
}

export interface RewardCriteria {
  position: number | 'top_10' | 'top_25' | 'all';
  category?: string;
  period: LeaderboardPeriod;
  minimumParticipants?: number;
}

export interface Competition {
  id: string;
  organizerId: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  participants: string[];
  goals: CompetitionGoal[];
  prizes: CompetitionPrize[];
  rules: string[];
  currentLeaders: LeaderboardEntry[];
}

export interface CompetitionGoal {
  type: 'sales_volume' | 'revenue_target' | 'conversion_rate' | 'social_engagement';
  target: number;
  unit: string;
  weight: number;
}

export interface CompetitionPrize {
  position: number;
  title: string;
  description: string;
  value: number | string;
  type: 'cash' | 'commission_boost' | 'recognition' | 'prize';
}

export interface SocialFeatures {
  agentId: string;
  profileVisibility: 'public' | 'team_only' | 'private';
  achievements: Achievement[];
  posts: SocialPost[];
  following: string[];
  followers: string[];
  kudosReceived: Kudos[];
  kudosGiven: Kudos[];
}

export interface SocialPost {
  id: string;
  agentId: string;
  content: string;
  images?: string[];
  type: 'success_story' | 'tip' | 'motivation' | 'celebration';
  timestamp: Date;
  likes: string[];
  comments: Comment[];
  tags: string[];
}

export interface Kudos {
  id: string;
  fromAgentId: string;
  toAgentId: string;
  message: string;
  type: 'great_sale' | 'helpful_tip' | 'team_spirit' | 'customer_service';
  timestamp: Date;
  isPublic: boolean;
}

export interface Comment {
  id: string;
  agentId: string;
  content: string;
  timestamp: Date;
  replies: Comment[];
}

class SalesLeaderboardService {
  private leaderboards: Map<string, LeaderboardEntry[]> = new Map();
  private configs: Map<string, LeaderboardConfig> = new Map();
  private competitions: Map<string, Competition> = new Map();
  private achievements: Map<string, Achievement[]> = new Map();
  private socialFeatures: Map<string, SocialFeatures> = new Map();
  private streaks: Map<string, PerformanceStreak[]> = new Map();

  async getLeaderboard(
    organizerId: string, 
    period: LeaderboardPeriod = 'monthly',
    category?: string,
    limit = 50
  ): Promise<LeaderboardEntry[]> {
    const key = `${organizerId}-${period}-${category || 'all'}`;
    
    if (!this.leaderboards.has(key)) {
      this.leaderboards.set(key, await this.generateLeaderboard(organizerId, period, category));
    }

    return this.leaderboards.get(key)!.slice(0, limit);
  }

  async getAgentRank(
    agentId: string, 
    organizerId: string, 
    period: LeaderboardPeriod = 'monthly'
  ): Promise<{
    rank: number;
    totalParticipants: number;
    percentile: number;
    entry: LeaderboardEntry;
  }> {
    const leaderboard = await this.getLeaderboard(organizerId, period);
    const entry = leaderboard.find(e => e.agentId === agentId);
    
    if (!entry) {
      throw new Error(`Agent ${agentId} not found in leaderboard`);
    }

    const percentile = (1 - (entry.rank - 1) / leaderboard.length) * 100;

    return {
      rank: entry.rank,
      totalParticipants: leaderboard.length,
      percentile: Math.round(percentile),
      entry
    };
  }

  async updateAgentMetrics(agentId: string, metrics: Partial<AgentMetrics>): Promise<void> {
    // Update metrics and recalculate leaderboards
    // In real implementation, this would update the database and trigger leaderboard refresh
    
    await this.checkForAchievements(agentId, metrics);
    await this.updateStreaks(agentId, metrics);
    
    // Invalidate relevant leaderboard caches
    this.invalidateLeaderboards(agentId);
  }

  async createCompetition(competitionData: Omit<Competition, 'id' | 'currentLeaders'>): Promise<Competition> {
    const competition: Competition = {
      ...competitionData,
      id: `comp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      currentLeaders: []
    };

    this.competitions.set(competition.id, competition);
    return competition;
  }

  async joinCompetition(competitionId: string, agentId: string): Promise<void> {
    const competition = this.competitions.get(competitionId);
    if (!competition) {
      throw new Error(`Competition ${competitionId} not found`);
    }

    if (competition.status !== 'active' && competition.status !== 'upcoming') {
      throw new Error('Competition is not open for registration');
    }

    if (!competition.participants.includes(agentId)) {
      competition.participants.push(agentId);
    }
  }

  async getActiveCompetitions(organizerId: string): Promise<Competition[]> {
    return Array.from(this.competitions.values())
      .filter(comp => comp.organizerId === organizerId && comp.status === 'active');
  }

  async getAgentAchievements(agentId: string): Promise<Achievement[]> {
    return this.achievements.get(agentId) || [];
  }

  async getAgentStreaks(agentId: string): Promise<PerformanceStreak[]> {
    return this.streaks.get(agentId) || [];
  }

  async createSocialPost(agentId: string, postData: Omit<SocialPost, 'id' | 'timestamp' | 'likes' | 'comments'>): Promise<SocialPost> {
    const post: SocialPost = {
      ...postData,
      id: `post-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      likes: [],
      comments: []
    };

    const social = this.socialFeatures.get(agentId) || this.createEmptySocialFeatures(agentId);
    social.posts.unshift(post);
    this.socialFeatures.set(agentId, social);

    return post;
  }

  async giveKudos(fromAgentId: string, toAgentId: string, kudosData: Omit<Kudos, 'id' | 'fromAgentId' | 'toAgentId' | 'timestamp'>): Promise<Kudos> {
    const kudos: Kudos = {
      ...kudosData,
      id: `kudos-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      fromAgentId,
      toAgentId,
      timestamp: new Date()
    };

    // Add to recipient's received kudos
    const recipientSocial = this.socialFeatures.get(toAgentId) || this.createEmptySocialFeatures(toAgentId);
    recipientSocial.kudosReceived.unshift(kudos);
    this.socialFeatures.set(toAgentId, recipientSocial);

    // Add to sender's given kudos
    const senderSocial = this.socialFeatures.get(fromAgentId) || this.createEmptySocialFeatures(fromAgentId);
    senderSocial.kudosGiven.unshift(kudos);
    this.socialFeatures.set(fromAgentId, senderSocial);

    return kudos;
  }

  async getTeamFeed(organizerId: string, limit = 20): Promise<Array<SocialPost | Kudos | Achievement>> {
    const feed: Array<SocialPost | Kudos | Achievement> = [];

    // Collect posts, kudos, and achievements from all agents
    for (const [agentId, social] of this.socialFeatures.entries()) {
      // Add recent posts
      social.posts.forEach(post => {
        if (post.timestamp > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) {
          feed.push(post);
        }
      });

      // Add recent kudos
      social.kudosReceived.forEach(kudos => {
        if (kudos.timestamp > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) && kudos.isPublic) {
          feed.push(kudos);
        }
      });
    }

    // Add recent achievements
    for (const [agentId, achievements] of this.achievements.entries()) {
      achievements.forEach(achievement => {
        if (achievement.earnedDate > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) {
          feed.push(achievement);
        }
      });
    }

    // Sort by timestamp and return limited results
    return feed
      .sort((a, b) => {
        const timeA = 'timestamp' in a ? a.timestamp : a.earnedDate;
        const timeB = 'timestamp' in b ? b.timestamp : b.earnedDate;
        return timeB.getTime() - timeA.getTime();
      })
      .slice(0, limit);
  }

  async exportLeaderboard(
    organizerId: string, 
    period: LeaderboardPeriod, 
    format: 'csv' | 'pdf' | 'excel'
  ): Promise<Blob> {
    const leaderboard = await this.getLeaderboard(organizerId, period);
    
    switch (format) {
      case 'csv':
        return this.generateCSVExport(leaderboard);
      case 'pdf':
        return this.generatePDFExport(leaderboard);
      case 'excel':
        return this.generateExcelExport(leaderboard);
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  private async generateLeaderboard(
    organizerId: string, 
    period: LeaderboardPeriod,
    category?: string
  ): Promise<LeaderboardEntry[]> {
    // Mock leaderboard generation
    const mockEntries: LeaderboardEntry[] = [
      {
        rank: 1,
        agentId: 'agent-1',
        agentName: 'Sarah Johnson',
        agentPhoto: 'https://example.com/sarah.jpg',
        organizerId,
        metrics: {
          totalSales: 45,
          totalRevenue: 12500,
          totalCommissions: 1875,
          conversionRate: 28.5,
          averageOrderValue: 278,
          customerSatisfaction: 4.8,
          socialEngagement: 156,
          referralCount: 8,
          eventsSold: 12,
          activeDays: 28
        },
        badges: await this.getAgentAchievements('agent-1'),
        streak: {
          type: 'daily_sales',
          currentStreak: 12,
          longestStreak: 15,
          startDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
          isActive: true
        },
        tier: 'gold',
        points: 2850,
        previousRank: 2,
        trendDirection: 'up'
      },
      {
        rank: 2,
        agentId: 'agent-2',
        agentName: 'Michael Chen',
        agentPhoto: 'https://example.com/michael.jpg',
        organizerId,
        metrics: {
          totalSales: 38,
          totalRevenue: 11200,
          totalCommissions: 1680,
          conversionRate: 24.2,
          averageOrderValue: 295,
          customerSatisfaction: 4.6,
          socialEngagement: 134,
          referralCount: 6,
          eventsSold: 10,
          activeDays: 26
        },
        badges: await this.getAgentAchievements('agent-2'),
        streak: {
          type: 'weekly_goals',
          currentStreak: 4,
          longestStreak: 8,
          startDate: new Date(Date.now() - 4 * 7 * 24 * 60 * 60 * 1000),
          isActive: true
        },
        tier: 'silver',
        points: 2420,
        previousRank: 1,
        trendDirection: 'down'
      }
    ];

    return mockEntries;
  }

  private async checkForAchievements(agentId: string, metrics: Partial<AgentMetrics>): Promise<void> {
    const currentAchievements = this.achievements.get(agentId) || [];
    const newAchievements: Achievement[] = [];

    // Check for various achievement conditions
    if (metrics.totalSales && metrics.totalSales >= 100 && !currentAchievements.find(a => a.id === 'century_seller')) {
      newAchievements.push({
        id: 'century_seller',
        title: 'Century Seller',
        description: 'Sold 100 tickets!',
        icon: '🎯',
        category: 'sales',
        earnedDate: new Date(),
        value: metrics.totalSales,
        isRare: false
      });
    }

    if (metrics.conversionRate && metrics.conversionRate >= 30 && !currentAchievements.find(a => a.id === 'conversion_master')) {
      newAchievements.push({
        id: 'conversion_master',
        title: 'Conversion Master',
        description: 'Achieved 30%+ conversion rate',
        icon: '⚡',
        category: 'sales',
        earnedDate: new Date(),
        value: metrics.conversionRate,
        isRare: true
      });
    }

    if (newAchievements.length > 0) {
      const allAchievements = [...currentAchievements, ...newAchievements];
      this.achievements.set(agentId, allAchievements);
    }
  }

  private async updateStreaks(agentId: string, metrics: Partial<AgentMetrics>): Promise<void> {
    const currentStreaks = this.streaks.get(agentId) || [];
    
    // Update daily sales streak
    const salesStreak = currentStreaks.find(s => s.type === 'daily_sales') || {
      type: 'daily_sales' as const,
      currentStreak: 0,
      longestStreak: 0,
      startDate: new Date(),
      isActive: false
    };

    if (metrics.totalSales && metrics.totalSales > 0) {
      if (salesStreak.isActive) {
        salesStreak.currentStreak++;
      } else {
        salesStreak.currentStreak = 1;
        salesStreak.startDate = new Date();
        salesStreak.isActive = true;
      }
      
      if (salesStreak.currentStreak > salesStreak.longestStreak) {
        salesStreak.longestStreak = salesStreak.currentStreak;
      }
    }

    // Update streaks array
    const updatedStreaks = currentStreaks.filter(s => s.type !== 'daily_sales');
    updatedStreaks.push(salesStreak);
    this.streaks.set(agentId, updatedStreaks);
  }

  private invalidateLeaderboards(agentId: string): void {
    // In real implementation, this would clear relevant cache entries
    // For now, just clear all cached leaderboards
    this.leaderboards.clear();
  }

  private createEmptySocialFeatures(agentId: string): SocialFeatures {
    return {
      agentId,
      profileVisibility: 'team_only',
      achievements: [],
      posts: [],
      following: [],
      followers: [],
      kudosReceived: [],
      kudosGiven: []
    };
  }

  private generateCSVExport(leaderboard: LeaderboardEntry[]): Blob {
    const headers = ['Rank', 'Agent Name', 'Total Sales', 'Revenue', 'Commissions', 'Conversion Rate'];
    const rows = leaderboard.map(entry => [
      entry.rank,
      entry.agentName,
      entry.metrics.totalSales,
      entry.metrics.totalRevenue,
      entry.metrics.totalCommissions,
      entry.metrics.conversionRate
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    return new Blob([csvContent], { type: 'text/csv' });
  }

  private generatePDFExport(leaderboard: LeaderboardEntry[]): Blob {
    // Mock PDF generation
    const pdfContent = `Leaderboard Report\n${leaderboard.length} agents`;
    return new Blob([pdfContent], { type: 'application/pdf' });
  }

  private generateExcelExport(leaderboard: LeaderboardEntry[]): Blob {
    // Mock Excel generation
    const excelContent = `Leaderboard Data\n${leaderboard.length} entries`;
    return new Blob([excelContent], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  }
}

export const salesLeaderboardService = new SalesLeaderboardService(); 