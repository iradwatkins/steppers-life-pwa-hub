export interface TrackableLink {
  id: string;
  agentId: string;
  eventId: string;
  organizerId: string;
  linkCode: string;
  vanityUrl?: string;
  baseUrl: string;
  fullUrl: string;
  title: string;
  description?: string;
  isActive: boolean;
  expiresAt?: Date;
  createdDate: Date;
  lastModified: Date;
  metadata: LinkMetadata;
}

export interface LinkMetadata {
  source: 'manual' | 'auto_generated' | 'campaign' | 'social_media';
  campaign?: string;
  medium?: string;
  content?: string;
  term?: string;
  customParams: Record<string, string>;
}

export interface LinkClick {
  id: string;
  linkId: string;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  referrer?: string;
  location?: GeoLocation;
  sessionId: string;
  converted: boolean;
  conversionValue?: number;
  conversionDate?: Date;
}

export interface GeoLocation {
  country: string;
  region: string;
  city: string;
  latitude?: number;
  longitude?: number;
}

export interface LinkAnalytics {
  linkId: string;
  totalClicks: number;
  uniqueClicks: number;
  conversions: number;
  conversionRate: number;
  totalRevenue: number;
  averageOrderValue: number;
  topReferrers: ReferrerData[];
  clicksByHour: HourlyData[];
  clicksByLocation: LocationData[];
  recentClicks: LinkClick[];
  timeSeriesData: TimeSeriesData[];
}

export interface ReferrerData {
  source: string;
  clicks: number;
  conversions: number;
  revenue: number;
}

export interface HourlyData {
  hour: number;
  clicks: number;
  conversions: number;
}

export interface LocationData {
  location: string;
  clicks: number;
  conversions: number;
  revenue: number;
}

export interface TimeSeriesData {
  date: Date;
  clicks: number;
  conversions: number;
  revenue: number;
}

export interface LinkGenerationRequest {
  agentId: string;
  eventId: string;
  organizerId: string;
  vanityUrl?: string;
  title: string;
  description?: string;
  expiresAt?: Date;
  metadata: Partial<LinkMetadata>;
}

export interface BulkLinkRequest {
  agentIds: string[];
  eventIds: string[];
  organizerId: string;
  nameTemplate: string; // e.g., "{agent}-{event}-{date}"
  metadata: Partial<LinkMetadata>;
}

export interface VanityUrlCheck {
  available: boolean;
  suggestions: string[];
  conflicts?: string[];
}

class TrackableLinkService {
  private links: Map<string, TrackableLink> = new Map();
  private clicks: Map<string, LinkClick[]> = new Map();
  private analytics: Map<string, LinkAnalytics> = new Map();
  private vanityUrls: Set<string> = new Set();

  async generateTrackableLink(request: LinkGenerationRequest): Promise<TrackableLink> {
    // Validate vanity URL if provided
    if (request.vanityUrl) {
      const vanityCheck = await this.checkVanityUrlAvailability(request.vanityUrl);
      if (!vanityCheck.available) {
        throw new Error(`Vanity URL "${request.vanityUrl}" is not available`);
      }
    }

    const linkCode = this.generateLinkCode(request.agentId, request.eventId);
    const vanityUrl = request.vanityUrl || this.generateDefaultVanity(request.agentId, request.eventId);
    
    const link: TrackableLink = {
      id: `link-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      agentId: request.agentId,
      eventId: request.eventId,
      organizerId: request.organizerId,
      linkCode,
      vanityUrl,
      baseUrl: this.getBaseUrl(),
      fullUrl: this.buildFullUrl(linkCode, vanityUrl),
      title: request.title,
      description: request.description,
      isActive: true,
      expiresAt: request.expiresAt,
      createdDate: new Date(),
      lastModified: new Date(),
      metadata: {
        source: 'manual',
        customParams: {},
        ...request.metadata
      }
    };

    this.links.set(link.id, link);
    if (vanityUrl) {
      this.vanityUrls.add(vanityUrl);
    }

    // Initialize analytics
    this.analytics.set(link.id, this.createEmptyAnalytics(link.id));
    this.clicks.set(link.id, []);

    return link;
  }

  async generateBulkLinks(request: BulkLinkRequest): Promise<TrackableLink[]> {
    const links: TrackableLink[] = [];

    for (const agentId of request.agentIds) {
      for (const eventId of request.eventIds) {
        const title = this.formatTemplate(request.nameTemplate, { agentId, eventId });
        
        const linkRequest: LinkGenerationRequest = {
          agentId,
          eventId,
          organizerId: request.organizerId,
          title,
          metadata: request.metadata
        };

        try {
          const link = await this.generateTrackableLink(linkRequest);
          links.push(link);
        } catch (error) {
          console.error(`Failed to generate link for agent ${agentId}, event ${eventId}:`, error);
        }
      }
    }

    return links;
  }

  async checkVanityUrlAvailability(vanityUrl: string): Promise<VanityUrlCheck> {
    const normalizedUrl = this.normalizeVanityUrl(vanityUrl);
    const available = !this.vanityUrls.has(normalizedUrl);

    const suggestions = available ? [] : this.generateVanityUrlSuggestions(normalizedUrl);

    return {
      available,
      suggestions,
      conflicts: available ? undefined : [normalizedUrl]
    };
  }

  async updateTrackableLink(
    linkId: string, 
    updates: Partial<Omit<TrackableLink, 'id' | 'createdDate'>>
  ): Promise<TrackableLink> {
    const existingLink = this.links.get(linkId);
    if (!existingLink) {
      throw new Error(`Link with ID ${linkId} not found`);
    }

    // Handle vanity URL change
    if (updates.vanityUrl && updates.vanityUrl !== existingLink.vanityUrl) {
      const vanityCheck = await this.checkVanityUrlAvailability(updates.vanityUrl);
      if (!vanityCheck.available) {
        throw new Error(`Vanity URL "${updates.vanityUrl}" is not available`);
      }
      
      if (existingLink.vanityUrl) {
        this.vanityUrls.delete(existingLink.vanityUrl);
      }
      this.vanityUrls.add(updates.vanityUrl);
    }

    const updatedLink: TrackableLink = {
      ...existingLink,
      ...updates,
      lastModified: new Date(),
      fullUrl: updates.vanityUrl 
        ? this.buildFullUrl(existingLink.linkCode, updates.vanityUrl)
        : existingLink.fullUrl
    };

    this.links.set(linkId, updatedLink);
    return updatedLink;
  }

  async trackClick(linkCode: string, clickData: Partial<LinkClick>): Promise<LinkClick> {
    const link = this.getLinkByCode(linkCode);
    if (!link) {
      throw new Error(`Link with code ${linkCode} not found`);
    }

    if (!link.isActive) {
      throw new Error(`Link ${linkCode} is inactive`);
    }

    if (link.expiresAt && new Date() > link.expiresAt) {
      throw new Error(`Link ${linkCode} has expired`);
    }

    const click: LinkClick = {
      id: `click-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      linkId: link.id,
      timestamp: new Date(),
      ipAddress: clickData.ipAddress || 'unknown',
      userAgent: clickData.userAgent || 'unknown',
      referrer: clickData.referrer,
      location: clickData.location,
      sessionId: clickData.sessionId || this.generateSessionId(),
      converted: false,
      conversionValue: 0
    };

    const clicks = this.clicks.get(link.id) || [];
    clicks.push(click);
    this.clicks.set(link.id, clicks);

    // Update analytics
    await this.updateAnalytics(link.id);

    return click;
  }

  async recordConversion(
    linkCode: string, 
    sessionId: string, 
    conversionValue: number
  ): Promise<void> {
    const link = this.getLinkByCode(linkCode);
    if (!link) {
      throw new Error(`Link with code ${linkCode} not found`);
    }

    const clicks = this.clicks.get(link.id) || [];
    const click = clicks.find(c => c.sessionId === sessionId && !c.converted);
    
    if (click) {
      click.converted = true;
      click.conversionValue = conversionValue;
      click.conversionDate = new Date();
      
      // Update analytics
      await this.updateAnalytics(link.id);
    }
  }

  async getLinkAnalytics(linkId: string): Promise<LinkAnalytics> {
    const analytics = this.analytics.get(linkId);
    if (!analytics) {
      throw new Error(`Analytics for link ${linkId} not found`);
    }

    // Refresh analytics
    await this.updateAnalytics(linkId);
    return this.analytics.get(linkId)!;
  }

  async getAgentLinks(agentId: string): Promise<TrackableLink[]> {
    return Array.from(this.links.values()).filter(link => link.agentId === agentId);
  }

  async getEventLinks(eventId: string): Promise<TrackableLink[]> {
    return Array.from(this.links.values()).filter(link => link.eventId === eventId);
  }

  async deactivateLink(linkId: string): Promise<void> {
    const link = this.links.get(linkId);
    if (link) {
      link.isActive = false;
      link.lastModified = new Date();
      this.links.set(linkId, link);
    }
  }

  async deleteLink(linkId: string): Promise<void> {
    const link = this.links.get(linkId);
    if (link?.vanityUrl) {
      this.vanityUrls.delete(link.vanityUrl);
    }
    
    this.links.delete(linkId);
    this.clicks.delete(linkId);
    this.analytics.delete(linkId);
  }

  async getAgentPerformance(agentId: string, dateRange?: { start: Date; end: Date }): Promise<{
    totalClicks: number;
    totalConversions: number;
    totalRevenue: number;
    conversionRate: number;
    topPerformingLinks: Array<{ linkId: string; title: string; clicks: number; conversions: number; revenue: number }>;
  }> {
    const agentLinks = await this.getAgentLinks(agentId);
    let totalClicks = 0;
    let totalConversions = 0;
    let totalRevenue = 0;
    const linkPerformance: Array<{ linkId: string; title: string; clicks: number; conversions: number; revenue: number }> = [];

    for (const link of agentLinks) {
      const analytics = await this.getLinkAnalytics(link.id);
      
      // Apply date range filter if provided
      let clicks = analytics.totalClicks;
      let conversions = analytics.conversions;
      let revenue = analytics.totalRevenue;

      if (dateRange) {
        const filteredClicks = (this.clicks.get(link.id) || []).filter(
          click => click.timestamp >= dateRange.start && click.timestamp <= dateRange.end
        );
        clicks = filteredClicks.length;
        conversions = filteredClicks.filter(click => click.converted).length;
        revenue = filteredClicks.reduce((sum, click) => sum + (click.conversionValue || 0), 0);
      }

      totalClicks += clicks;
      totalConversions += conversions;
      totalRevenue += revenue;

      linkPerformance.push({
        linkId: link.id,
        title: link.title,
        clicks,
        conversions,
        revenue
      });
    }

    return {
      totalClicks,
      totalConversions,
      totalRevenue,
      conversionRate: totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0,
      topPerformingLinks: linkPerformance
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10)
    };
  }

  private generateLinkCode(agentId: string, eventId: string): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    const agentHash = agentId.slice(-3);
    const eventHash = eventId.slice(-3);
    return `${agentHash}${eventHash}${timestamp}${random}`.toLowerCase();
  }

  private generateDefaultVanity(agentId: string, eventId: string): string {
    const agentName = agentId.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const eventName = eventId.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    return `${agentName}-${eventName}`;
  }

  private normalizeVanityUrl(vanityUrl: string): string {
    return vanityUrl.toLowerCase().replace(/[^a-z0-9-]/g, '');
  }

  private generateVanityUrlSuggestions(baseUrl: string): string[] {
    const suggestions: string[] = [];
    for (let i = 1; i <= 5; i++) {
      suggestions.push(`${baseUrl}${i}`);
      suggestions.push(`${baseUrl}-${i}`);
    }
    return suggestions.filter(url => !this.vanityUrls.has(url));
  }

  private getBaseUrl(): string {
    return 'https://stepperslife.com/e';
  }

  private buildFullUrl(linkCode: string, vanityUrl?: string): string {
    const baseUrl = this.getBaseUrl();
    if (vanityUrl) {
      return `${baseUrl}/${vanityUrl}?ref=${linkCode}`;
    }
    return `${baseUrl}/${linkCode}`;
  }

  private getLinkByCode(linkCode: string): TrackableLink | undefined {
    return Array.from(this.links.values()).find(link => link.linkCode === linkCode);
  }

  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private formatTemplate(template: string, variables: Record<string, string>): string {
    let formatted = template;
    Object.entries(variables).forEach(([key, value]) => {
      formatted = formatted.replace(new RegExp(`{${key}}`, 'g'), value);
    });
    formatted = formatted.replace('{date}', new Date().toISOString().split('T')[0]);
    return formatted;
  }

  private createEmptyAnalytics(linkId: string): LinkAnalytics {
    return {
      linkId,
      totalClicks: 0,
      uniqueClicks: 0,
      conversions: 0,
      conversionRate: 0,
      totalRevenue: 0,
      averageOrderValue: 0,
      topReferrers: [],
      clicksByHour: Array.from({ length: 24 }, (_, hour) => ({ hour, clicks: 0, conversions: 0 })),
      clicksByLocation: [],
      recentClicks: [],
      timeSeriesData: []
    };
  }

  private async updateAnalytics(linkId: string): Promise<void> {
    const clicks = this.clicks.get(linkId) || [];
    const conversions = clicks.filter(click => click.converted);
    const uniqueSessions = new Set(clicks.map(click => click.sessionId));

    const analytics: LinkAnalytics = {
      linkId,
      totalClicks: clicks.length,
      uniqueClicks: uniqueSessions.size,
      conversions: conversions.length,
      conversionRate: clicks.length > 0 ? (conversions.length / clicks.length) * 100 : 0,
      totalRevenue: conversions.reduce((sum, click) => sum + (click.conversionValue || 0), 0),
      averageOrderValue: conversions.length > 0 
        ? conversions.reduce((sum, click) => sum + (click.conversionValue || 0), 0) / conversions.length 
        : 0,
      topReferrers: this.calculateTopReferrers(clicks),
      clicksByHour: this.calculateHourlyDistribution(clicks),
      clicksByLocation: this.calculateLocationDistribution(clicks),
      recentClicks: clicks.slice(-10).reverse(),
      timeSeriesData: this.calculateTimeSeriesData(clicks)
    };

    this.analytics.set(linkId, analytics);
  }

  private calculateTopReferrers(clicks: LinkClick[]): ReferrerData[] {
    const referrerMap = new Map<string, { clicks: number; conversions: number; revenue: number }>();

    clicks.forEach(click => {
      const referrer = click.referrer || 'Direct';
      const existing = referrerMap.get(referrer) || { clicks: 0, conversions: 0, revenue: 0 };
      
      existing.clicks++;
      if (click.converted) {
        existing.conversions++;
        existing.revenue += click.conversionValue || 0;
      }
      
      referrerMap.set(referrer, existing);
    });

    return Array.from(referrerMap.entries())
      .map(([source, data]) => ({ source, ...data }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 10);
  }

  private calculateHourlyDistribution(clicks: LinkClick[]): HourlyData[] {
    const hourlyData = Array.from({ length: 24 }, (_, hour) => ({ hour, clicks: 0, conversions: 0 }));

    clicks.forEach(click => {
      const hour = click.timestamp.getHours();
      hourlyData[hour].clicks++;
      if (click.converted) {
        hourlyData[hour].conversions++;
      }
    });

    return hourlyData;
  }

  private calculateLocationDistribution(clicks: LinkClick[]): LocationData[] {
    const locationMap = new Map<string, { clicks: number; conversions: number; revenue: number }>();

    clicks.forEach(click => {
      if (click.location) {
        const location = `${click.location.city}, ${click.location.country}`;
        const existing = locationMap.get(location) || { clicks: 0, conversions: 0, revenue: 0 };
        
        existing.clicks++;
        if (click.converted) {
          existing.conversions++;
          existing.revenue += click.conversionValue || 0;
        }
        
        locationMap.set(location, existing);
      }
    });

    return Array.from(locationMap.entries())
      .map(([location, data]) => ({ location, ...data }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 10);
  }

  private calculateTimeSeriesData(clicks: LinkClick[]): TimeSeriesData[] {
    const dailyMap = new Map<string, { clicks: number; conversions: number; revenue: number }>();

    clicks.forEach(click => {
      const date = click.timestamp.toISOString().split('T')[0];
      const existing = dailyMap.get(date) || { clicks: 0, conversions: 0, revenue: 0 };
      
      existing.clicks++;
      if (click.converted) {
        existing.conversions++;
        existing.revenue += click.conversionValue || 0;
      }
      
      dailyMap.set(date, existing);
    });

    return Array.from(dailyMap.entries())
      .map(([dateStr, data]) => ({ date: new Date(dateStr), ...data }))
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(-30); // Last 30 days
  }
}

export const trackableLinkService = new TrackableLinkService(); 