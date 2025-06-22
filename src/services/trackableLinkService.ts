// Trackable Links Service - Epic F.003
// Vanity URLs, sales attribution, and performance tracking

export interface TrackableLink {
  id: string;
  agent_id: string;
  event_id: string;
  link_code: string;
  vanity_url?: string;
  full_url: string;
  title: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  expires_at?: string;
  click_count: number;
  conversion_count: number;
  revenue_generated: number;
  last_clicked?: string;
}

export interface LinkAnalytics {
  link_id: string;
  total_clicks: number;
  unique_clicks: number;
  conversions: number;
  conversion_rate: number;
  revenue_generated: number;
  average_order_value: number;
  clicks_by_day: DailyClickData[];
  top_referrers: ReferrerData[];
  geographic_data: GeographicData[];
  device_breakdown: DeviceData[];
}

export interface DailyClickData {
  date: string;
  clicks: number;
  conversions: number;
  revenue: number;
}

export interface ReferrerData {
  referrer: string;
  clicks: number;
  conversions: number;
  percentage: number;
}

export interface GeographicData {
  country: string;
  region: string;
  clicks: number;
  conversions: number;
}

export interface DeviceData {
  device_type: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  clicks: number;
  conversions: number;
  percentage: number;
}

export interface VanityUrlRequest {
  agent_id: string;
  event_id: string;
  desired_url: string;
  backup_options: string[];
}

export interface LinkPerformance {
  link_id: string;
  performance_score: number;
  ranking: number;
  trends: {
    clicks_trend: 'up' | 'down' | 'stable';
    conversion_trend: 'up' | 'down' | 'stable';
    revenue_trend: 'up' | 'down' | 'stable';
  };
  recommendations: string[];
}

export interface ClickEvent {
  id: string;
  link_id: string;
  clicked_at: string;
  ip_address: string;
  user_agent: string;
  referrer?: string;
  country?: string;
  region?: string;
  device_type: string;
  browser: string;
  converted: boolean;
  conversion_value?: number;
  session_id: string;
}

class TrackableLinkService {
  private baseUrl = 'https://stepperslife.com/go/';

  // Generate new trackable link
  async generateTrackableLink(
    agentId: string, 
    eventId: string, 
    options: {
      title: string;
      description?: string;
      vanityUrl?: string;
      expiresAt?: string;
    }
  ): Promise<TrackableLink> {
    try {
      const linkCode = this.generateLinkCode();
      const vanityUrl = options.vanityUrl || linkCode;
      
      // Check if vanity URL is available
      const isAvailable = await this.checkVanityUrlAvailability(vanityUrl);
      if (!isAvailable && options.vanityUrl) {
        throw new Error('Vanity URL is not available');
      }

      const link: TrackableLink = {
        id: `link_${Date.now()}`,
        agent_id: agentId,
        event_id: eventId,
        link_code: linkCode,
        vanity_url: vanityUrl,
        full_url: `${this.baseUrl}${vanityUrl}`,
        title: options.title,
        description: options.description,
        is_active: true,
        created_at: new Date().toISOString(),
        expires_at: options.expiresAt,
        click_count: 0,
        conversion_count: 0,
        revenue_generated: 0
      };

      console.log('Generated trackable link:', link);
      return link;
    } catch (error) {
      console.error('Error generating trackable link:', error);
      throw error;
    }
  }

  // Get trackable links for agent
  async getAgentLinks(agentId: string): Promise<TrackableLink[]> {
    try {
      // Generate mock data
      const mockLinks: TrackableLink[] = [
        {
          id: 'link_001',
          agent_id: agentId,
          event_id: 'event_001',
          link_code: 'ABC123',
          vanity_url: 'summer-dance-sarah',
          full_url: `${this.baseUrl}summer-dance-sarah`,
          title: 'Summer Dance Workshop - Special Discount',
          description: 'Exclusive 20% off for my followers!',
          is_active: true,
          created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          expires_at: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000).toISOString(),
          click_count: 127,
          conversion_count: 23,
          revenue_generated: 1380.50,
          last_clicked: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'link_002',
          agent_id: agentId,
          event_id: 'event_002',
          link_code: 'XYZ789',
          vanity_url: 'salsa-night-promo',
          full_url: `${this.baseUrl}salsa-night-promo`,
          title: 'Salsa Night Fiesta - Early Bird',
          description: 'Get your tickets before they sell out!',
          is_active: true,
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          click_count: 89,
          conversion_count: 15,
          revenue_generated: 675.00,
          last_clicked: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'link_003',
          agent_id: agentId,
          event_id: 'event_003',
          link_code: 'DEF456',
          vanity_url: 'bachata-basics',
          full_url: `${this.baseUrl}bachata-basics`,
          title: 'Bachata Basics Class',
          description: 'Perfect for beginners!',
          is_active: false,
          created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          expires_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          click_count: 45,
          conversion_count: 8,
          revenue_generated: 320.00,
          last_clicked: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString()
        }
      ];

      return mockLinks;
    } catch (error) {
      console.error('Error fetching agent links:', error);
      throw error;
    }
  }

  // Get link analytics
  async getLinkAnalytics(linkId: string, dateRange?: { start: string; end: string }): Promise<LinkAnalytics> {
    try {
      // Generate mock analytics data
      const dailyData: DailyClickData[] = [];
      for (let i = 29; i >= 0; i--) {
        const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        const clicks = Math.floor(Math.random() * 15) + 1;
        const conversions = Math.floor(clicks * (0.1 + Math.random() * 0.2));
        
        dailyData.push({
          date: date.toISOString().split('T')[0],
          clicks,
          conversions,
          revenue: conversions * (30 + Math.random() * 40)
        });
      }

      const totalClicks = dailyData.reduce((sum, day) => sum + day.clicks, 0);
      const totalConversions = dailyData.reduce((sum, day) => sum + day.conversions, 0);
      const totalRevenue = dailyData.reduce((sum, day) => sum + day.revenue, 0);

      return {
        link_id: linkId,
        total_clicks: totalClicks,
        unique_clicks: Math.floor(totalClicks * 0.85),
        conversions: totalConversions,
        conversion_rate: (totalConversions / totalClicks) * 100,
        revenue_generated: Math.round(totalRevenue * 100) / 100,
        average_order_value: Math.round((totalRevenue / totalConversions) * 100) / 100,
        clicks_by_day: dailyData,
        top_referrers: [
          { referrer: 'Instagram', clicks: Math.floor(totalClicks * 0.4), conversions: Math.floor(totalConversions * 0.45), percentage: 40 },
          { referrer: 'Facebook', clicks: Math.floor(totalClicks * 0.3), conversions: Math.floor(totalConversions * 0.25), percentage: 30 },
          { referrer: 'Direct', clicks: Math.floor(totalClicks * 0.2), conversions: Math.floor(totalConversions * 0.2), percentage: 20 },
          { referrer: 'WhatsApp', clicks: Math.floor(totalClicks * 0.1), conversions: Math.floor(totalConversions * 0.1), percentage: 10 }
        ],
        geographic_data: [
          { country: 'United States', region: 'California', clicks: Math.floor(totalClicks * 0.6), conversions: Math.floor(totalConversions * 0.6) },
          { country: 'United States', region: 'New York', clicks: Math.floor(totalClicks * 0.2), conversions: Math.floor(totalConversions * 0.2) },
          { country: 'United States', region: 'Texas', clicks: Math.floor(totalClicks * 0.15), conversions: Math.floor(totalConversions * 0.15) },
          { country: 'Canada', region: 'Ontario', clicks: Math.floor(totalClicks * 0.05), conversions: Math.floor(totalConversions * 0.05) }
        ],
        device_breakdown: [
          { device_type: 'mobile', browser: 'Safari', clicks: Math.floor(totalClicks * 0.6), conversions: Math.floor(totalConversions * 0.6), percentage: 60 },
          { device_type: 'desktop', browser: 'Chrome', clicks: Math.floor(totalClicks * 0.3), conversions: Math.floor(totalConversions * 0.3), percentage: 30 },
          { device_type: 'tablet', browser: 'Safari', clicks: Math.floor(totalClicks * 0.1), conversions: Math.floor(totalConversions * 0.1), percentage: 10 }
        ]
      };
    } catch (error) {
      console.error('Error fetching link analytics:', error);
      throw error;
    }
  }

  // Check vanity URL availability
  async checkVanityUrlAvailability(vanityUrl: string): Promise<boolean> {
    try {
      // Mock availability check
      const reservedUrls = ['admin', 'api', 'www', 'help', 'support', 'sales', 'marketing'];
      const taken = reservedUrls.includes(vanityUrl.toLowerCase()) || Math.random() > 0.8;
      
      return !taken;
    } catch (error) {
      console.error('Error checking vanity URL availability:', error);
      return false;
    }
  }

  // Request vanity URL
  async requestVanityUrl(request: VanityUrlRequest): Promise<{ approved: boolean; assignedUrl: string; reason?: string }> {
    try {
      const primaryAvailable = await this.checkVanityUrlAvailability(request.desired_url);
      
      if (primaryAvailable) {
        return {
          approved: true,
          assignedUrl: request.desired_url
        };
      }

      // Try backup options
      for (const backup of request.backup_options) {
        const available = await this.checkVanityUrlAvailability(backup);
        if (available) {
          return {
            approved: true,
            assignedUrl: backup
          };
        }
      }

      // Generate alternative
      const alternative = `${request.desired_url}-${Math.floor(Math.random() * 1000)}`;
      return {
        approved: true,
        assignedUrl: alternative,
        reason: 'Original URL not available, assigned alternative'
      };
    } catch (error) {
      console.error('Error requesting vanity URL:', error);
      throw error;
    }
  }

  // Track click event
  async trackClick(linkCode: string, clickData: Omit<ClickEvent, 'id' | 'link_id' | 'clicked_at'>): Promise<ClickEvent> {
    try {
      const clickEvent: ClickEvent = {
        id: `click_${Date.now()}`,
        link_id: `link_${linkCode}`,
        clicked_at: new Date().toISOString(),
        ...clickData
      };

      console.log('Tracking click event:', clickEvent);
      
      // Update link statistics (mock)
      await this.updateLinkStats(clickEvent.link_id, {
        click_count: 1,
        conversion_count: clickEvent.converted ? 1 : 0,
        revenue_generated: clickEvent.conversion_value || 0
      });

      return clickEvent;
    } catch (error) {
      console.error('Error tracking click:', error);
      throw error;
    }
  }

  // Record conversion
  async recordConversion(linkId: string, conversionData: {
    sale_amount: number;
    sale_id: string;
    customer_id: string;
    session_id: string;
  }): Promise<void> {
    try {
      console.log('Recording conversion:', { linkId, ...conversionData });
      
      // Update link statistics
      await this.updateLinkStats(linkId, {
        conversion_count: 1,
        revenue_generated: conversionData.sale_amount
      });
    } catch (error) {
      console.error('Error recording conversion:', error);
      throw error;
    }
  }

  // Get link performance insights
  async getLinkPerformance(linkId: string): Promise<LinkPerformance> {
    try {
      const analytics = await this.getLinkAnalytics(linkId);
      
      // Calculate performance score (mock algorithm)
      const conversionWeight = 0.4;
      const clickWeight = 0.3;
      const revenueWeight = 0.3;
      
      const normalizedConversion = Math.min(analytics.conversion_rate / 20, 1); // 20% = perfect
      const normalizedClicks = Math.min(analytics.total_clicks / 100, 1); // 100 clicks = perfect
      const normalizedRevenue = Math.min(analytics.revenue_generated / 1000, 1); // $1000 = perfect
      
      const performanceScore = (
        normalizedConversion * conversionWeight +
        normalizedClicks * clickWeight +
        normalizedRevenue * revenueWeight
      ) * 100;

      return {
        link_id: linkId,
        performance_score: Math.round(performanceScore),
        ranking: Math.floor(Math.random() * 10) + 1, // Mock ranking
        trends: {
          clicks_trend: Math.random() > 0.5 ? 'up' : Math.random() > 0.5 ? 'down' : 'stable',
          conversion_trend: Math.random() > 0.6 ? 'up' : Math.random() > 0.5 ? 'down' : 'stable',
          revenue_trend: Math.random() > 0.6 ? 'up' : Math.random() > 0.5 ? 'down' : 'stable'
        },
        recommendations: this.generateRecommendations(analytics)
      };
    } catch (error) {
      console.error('Error getting link performance:', error);
      throw error;
    }
  }

  // Update link details
  async updateLink(linkId: string, updates: Partial<Pick<TrackableLink, 'title' | 'description' | 'is_active' | 'expires_at'>>): Promise<TrackableLink> {
    try {
      const links = await this.getAgentLinks('agent_001'); // Mock agent ID
      const existingLink = links.find(l => l.id === linkId);
      
      if (!existingLink) {
        throw new Error('Link not found');
      }

      const updatedLink: TrackableLink = {
        ...existingLink,
        ...updates
      };

      console.log('Updating link:', updatedLink);
      return updatedLink;
    } catch (error) {
      console.error('Error updating link:', error);
      throw error;
    }
  }

  // Deactivate link
  async deactivateLink(linkId: string): Promise<void> {
    try {
      await this.updateLink(linkId, { is_active: false });
      console.log('Deactivated link:', linkId);
    } catch (error) {
      console.error('Error deactivating link:', error);
      throw error;
    }
  }

  // Export link analytics
  async exportLinkData(agentId: string, format: 'csv' | 'excel' | 'pdf'): Promise<void> {
    try {
      const links = await this.getAgentLinks(agentId);
      
      if (format === 'csv') {
        const csvContent = this.generateLinksCSV(links);
        this.downloadFile(csvContent, `trackable-links-${agentId}.csv`, 'text/csv');
      } else {
        console.log(`Generating ${format} export for trackable links`);
      }
    } catch (error) {
      console.error('Error exporting link data:', error);
      throw error;
    }
  }

  // Private helper methods
  private generateLinkCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private async updateLinkStats(linkId: string, deltas: {
    click_count?: number;
    conversion_count?: number;
    revenue_generated?: number;
  }): Promise<void> {
    // Mock implementation
    console.log('Updating link stats:', { linkId, deltas });
  }

  private generateRecommendations(analytics: LinkAnalytics): string[] {
    const recommendations: string[] = [];
    
    if (analytics.conversion_rate < 10) {
      recommendations.push('Consider improving your call-to-action text');
    }
    
    if (analytics.total_clicks < 50) {
      recommendations.push('Increase social media promotion frequency');
    }
    
    const mobilePercentage = analytics.device_breakdown.find(d => d.device_type === 'mobile')?.percentage || 0;
    if (mobilePercentage > 70) {
      recommendations.push('Optimize landing page for mobile users');
    }
    
    if (analytics.average_order_value < 50) {
      recommendations.push('Consider promoting higher-tier ticket options');
    }

    return recommendations.length > 0 ? recommendations : ['Great performance! Keep up the good work.'];
  }

  private generateLinksCSV(links: TrackableLink[]): string {
    const headers = ['Title', 'Vanity URL', 'Clicks', 'Conversions', 'Revenue', 'Conversion Rate', 'Status', 'Created'];
    const rows = links.map(link => [
      link.title,
      link.vanity_url || link.link_code,
      link.click_count.toString(),
      link.conversion_count.toString(),
      `$${link.revenue_generated.toFixed(2)}`,
      link.click_count > 0 ? `${((link.conversion_count / link.click_count) * 100).toFixed(1)}%` : '0%',
      link.is_active ? 'Active' : 'Inactive',
      new Date(link.created_at).toLocaleDateString()
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

export const trackableLinkService = new TrackableLinkService();
export default trackableLinkService;