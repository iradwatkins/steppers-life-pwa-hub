/**
 * Website & App Usage Analytics Service
 * Story E.005: Website & App Usage Analytics
 * 
 * Provides comprehensive web analytics including page views, user journeys,
 * traffic sources, device analytics, geographic distribution, and conversion tracking
 */

// Analytics Data Interfaces
export interface PageViewData {
  id: string;
  eventId: string;
  page: string;
  path: string;
  title: string;
  userId?: string;
  sessionId: string;
  timestamp: Date;
  timeOnPage: number;
  bounced: boolean;
  exitPage: boolean;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  device: DeviceInfo;
  location: LocationInfo;
}

export interface DeviceInfo {
  type: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  browserVersion: string;
  os: string;
  osVersion: string;
  screenResolution: string;
  viewportSize: string;
  userAgent: string;
}

export interface LocationInfo {
  country: string;
  region: string;
  city: string;
  timezone: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface UserJourney {
  sessionId: string;
  userId?: string;
  startTime: Date;
  endTime?: Date;
  pages: PageViewData[];
  totalDuration: number;
  pageCount: number;
  bounced: boolean;
  converted: boolean;
  conversionValue?: number;
  conversionType?: 'ticket_purchase' | 'registration' | 'newsletter_signup';
  entryPage: string;
  exitPage?: string;
  device: DeviceInfo;
  location: LocationInfo;
}

export interface TrafficSource {
  source: string;
  medium: string;
  campaign?: string;
  content?: string;
  term?: string;
  sessions: number;
  users: number;
  pageViews: number;
  bounceRate: number;
  avgSessionDuration: number;
  conversions: number;
  conversionRate: number;
  revenue: number;
}

export interface ConversionFunnel {
  name: string;
  steps: ConversionStep[];
  totalEntries: number;
  totalConversions: number;
  overallConversionRate: number;
  averageTimeToConvert: number;
  dropOffPoints: string[];
}

export interface ConversionStep {
  name: string;
  page: string;
  users: number;
  conversions: number;
  conversionRate: number;
  averageTimeOnStep: number;
  dropOffRate: number;
}

export interface AnalyticsMetrics {
  totalPageViews: number;
  uniquePageViews: number;
  sessions: number;
  users: number;
  bounceRate: number;
  avgSessionDuration: number;
  pagesPerSession: number;
  newUserRate: number;
  returningUserRate: number;
  conversionRate: number;
  goalCompletions: number;
  revenue: number;
}

export interface RealTimeData {
  activeUsers: number;
  pageViewsLast5Min: number;
  topPages: Array<{
    page: string;
    views: number;
    activeUsers: number;
  }>;
  topSources: Array<{
    source: string;
    users: number;
  }>;
  topCountries: Array<{
    country: string;
    users: number;
  }>;
  conversionEvents: Array<{
    type: string;
    count: number;
    timestamp: Date;
  }>;
}

export interface AnalyticsFilters {
  dateRange: {
    start: Date;
    end: Date;
  };
  eventIds?: string[];
  countries?: string[];
  devices?: string[];
  sources?: string[];
  pages?: string[];
  segments?: string[];
}

// Analytics Service Class
export class WebAnalyticsService {
  private static instance: WebAnalyticsService;
  private analyticsData: PageViewData[] = [];
  private journeys: UserJourney[] = [];
  private realTimeListeners: Set<(data: RealTimeData) => void> = new Set();

  private constructor() {
    this.initializeMockData();
    this.startRealTimeUpdates();
  }

  public static getInstance(): WebAnalyticsService {
    if (!WebAnalyticsService.instance) {
      WebAnalyticsService.instance = new WebAnalyticsService();
    }
    return WebAnalyticsService.instance;
  }

  private initializeMockData(): void {
    // Generate comprehensive mock analytics data
    const events = ['event_001', 'event_002', 'event_003', 'event_004'];
    const pages = [
      '/events', '/events/event_001', '/events/event_002', '/events/event_003',
      '/tickets/event_001', '/tickets/event_002', '/checkout', '/profile',
      '/', '/about', '/contact', '/classes'
    ];
    const sources = [
      { source: 'google', medium: 'organic' },
      { source: 'facebook', medium: 'social' },
      { source: 'instagram', medium: 'social' },
      { source: 'email', medium: 'email' },
      { source: 'direct', medium: 'none' },
      { source: 'twitter', medium: 'social' },
      { source: 'youtube', medium: 'social' },
      { source: 'linkedin', medium: 'social' }
    ];
    const devices = [
      { type: 'mobile' as const, browser: 'Chrome Mobile', os: 'iOS' },
      { type: 'desktop' as const, browser: 'Chrome', os: 'Windows' },
      { type: 'tablet' as const, browser: 'Safari', os: 'iPadOS' },
      { type: 'mobile' as const, browser: 'Safari Mobile', os: 'iOS' },
      { type: 'desktop' as const, browser: 'Firefox', os: 'macOS' }
    ];
    const locations = [
      { country: 'United States', region: 'California', city: 'San Francisco' },
      { country: 'United States', region: 'New York', city: 'New York' },
      { country: 'United Kingdom', region: 'England', city: 'London' },
      { country: 'Canada', region: 'Ontario', city: 'Toronto' },
      { country: 'Australia', region: 'NSW', city: 'Sydney' }
    ];

    // Generate page views for the last 30 days
    for (let i = 0; i < 5000; i++) {
      const timestamp = new Date();
      timestamp.setDate(timestamp.getDate() - Math.floor(Math.random() * 30));
      timestamp.setHours(Math.floor(Math.random() * 24));
      timestamp.setMinutes(Math.floor(Math.random() * 60));

      const page = pages[Math.floor(Math.random() * pages.length)];
      const source = sources[Math.floor(Math.random() * sources.length)];
      const device = devices[Math.floor(Math.random() * devices.length)];
      const location = locations[Math.floor(Math.random() * locations.length)];
      const sessionId = `session_${Math.random().toString(36).substr(2, 9)}`;

      this.analyticsData.push({
        id: `pv_${i}`,
        eventId: events[Math.floor(Math.random() * events.length)],
        page,
        path: page,
        title: this.getPageTitle(page),
        userId: Math.random() > 0.3 ? `user_${Math.floor(Math.random() * 1000)}` : undefined,
        sessionId,
        timestamp,
        timeOnPage: Math.floor(Math.random() * 300) + 30, // 30-330 seconds
        bounced: Math.random() > 0.6,
        exitPage: Math.random() > 0.7,
        referrer: Math.random() > 0.5 ? `https://${source.source}.com` : undefined,
        utmSource: source.source,
        utmMedium: source.medium,
        utmCampaign: Math.random() > 0.5 ? 'spring_events_2024' : undefined,
        device: {
          type: device.type,
          browser: device.browser,
          browserVersion: '120.0',
          os: device.os,
          osVersion: '17.0',
          screenResolution: device.type === 'mobile' ? '375x667' : '1920x1080',
          viewportSize: device.type === 'mobile' ? '375x667' : '1920x1080',
          userAgent: `Mozilla/5.0 (${device.os}) ${device.browser}`
        },
        location: {
          country: location.country,
          region: location.region,
          city: location.city,
          timezone: 'America/New_York',
          coordinates: {
            lat: 40.7128 + (Math.random() - 0.5) * 10,
            lng: -74.0060 + (Math.random() - 0.5) * 10
          }
        }
      });
    }

    // Generate user journeys
    this.generateUserJourneys();
  }

  private generateUserJourneys(): void {
    const sessionIds = [...new Set(this.analyticsData.map(pv => pv.sessionId))];
    
    for (const sessionId of sessionIds) {
      const sessionPages = this.analyticsData
        .filter(pv => pv.sessionId === sessionId)
        .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

      if (sessionPages.length === 0) continue;

      const startTime = sessionPages[0].timestamp;
      const endTime = sessionPages[sessionPages.length - 1].timestamp;
      const totalDuration = endTime.getTime() - startTime.getTime();
      const bounced = sessionPages.length === 1 && sessionPages[0].bounced;
      const converted = sessionPages.some(p => 
        p.page.includes('/checkout') || p.page.includes('/tickets')
      );

      this.journeys.push({
        sessionId,
        userId: sessionPages[0].userId,
        startTime,
        endTime,
        pages: sessionPages,
        totalDuration,
        pageCount: sessionPages.length,
        bounced,
        converted,
        conversionValue: converted ? Math.floor(Math.random() * 200) + 50 : undefined,
        conversionType: converted ? 'ticket_purchase' : undefined,
        entryPage: sessionPages[0].page,
        exitPage: sessionPages[sessionPages.length - 1].page,
        device: sessionPages[0].device,
        location: sessionPages[0].location
      });
    }
  }

  private getPageTitle(page: string): string {
    const titles: Record<string, string> = {
      '/': 'SteppersLife - Home',
      '/events': 'Events - SteppersLife',
      '/events/event_001': 'Salsa Night - Event Details',
      '/events/event_002': 'Bachata Workshop - Event Details',
      '/events/event_003': 'Dance Competition - Event Details',
      '/tickets/event_001': 'Salsa Night - Tickets',
      '/tickets/event_002': 'Bachata Workshop - Tickets',
      '/checkout': 'Checkout - SteppersLife',
      '/profile': 'My Profile - SteppersLife',
      '/about': 'About Us - SteppersLife',
      '/contact': 'Contact - SteppersLife',
      '/classes': 'Dance Classes - SteppersLife'
    };
    return titles[page] || 'SteppersLife';
  }

  private startRealTimeUpdates(): void {
    setInterval(() => {
      const realTimeData = this.generateRealTimeData();
      this.realTimeListeners.forEach(listener => {
        try {
          listener(realTimeData);
        } catch (error) {
          console.error('Error in real-time analytics listener:', error);
        }
      });
    }, 5000); // Update every 5 seconds
  }

  private generateRealTimeData(): RealTimeData {
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    
    const recentData = this.analyticsData.filter(pv => 
      pv.timestamp >= fiveMinutesAgo
    );

    return {
      activeUsers: Math.floor(Math.random() * 50) + 10,
      pageViewsLast5Min: recentData.length + Math.floor(Math.random() * 20),
      topPages: [
        { page: '/events', views: Math.floor(Math.random() * 15) + 5, activeUsers: Math.floor(Math.random() * 8) + 2 },
        { page: '/events/event_001', views: Math.floor(Math.random() * 12) + 3, activeUsers: Math.floor(Math.random() * 6) + 1 },
        { page: '/', views: Math.floor(Math.random() * 10) + 2, activeUsers: Math.floor(Math.random() * 5) + 1 }
      ],
      topSources: [
        { source: 'google', users: Math.floor(Math.random() * 20) + 5 },
        { source: 'facebook', users: Math.floor(Math.random() * 15) + 3 },
        { source: 'direct', users: Math.floor(Math.random() * 10) + 2 }
      ],
      topCountries: [
        { country: 'United States', users: Math.floor(Math.random() * 25) + 10 },
        { country: 'Canada', users: Math.floor(Math.random() * 8) + 3 },
        { country: 'United Kingdom', users: Math.floor(Math.random() * 6) + 2 }
      ],
      conversionEvents: [
        { type: 'ticket_purchase', count: Math.floor(Math.random() * 5), timestamp: new Date() },
        { type: 'registration', count: Math.floor(Math.random() * 3), timestamp: new Date() }
      ]
    };
  }

  // Public Methods
  public async getAnalyticsOverview(filters: AnalyticsFilters): Promise<AnalyticsMetrics> {
    const filteredData = this.applyFilters(this.analyticsData, filters);
    const filteredJourneys = this.applyJourneyFilters(this.journeys, filters);

    const totalPageViews = filteredData.length;
    const uniquePageViews = new Set(filteredData.map(pv => `${pv.userId}_${pv.page}`)).size;
    const sessions = new Set(filteredData.map(pv => pv.sessionId)).size;
    const users = new Set(filteredData.filter(pv => pv.userId).map(pv => pv.userId)).size;
    const bouncedSessions = filteredJourneys.filter(j => j.bounced).length;
    const bounceRate = sessions > 0 ? bouncedSessions / sessions : 0;
    const totalSessionDuration = filteredJourneys.reduce((sum, j) => sum + j.totalDuration, 0);
    const avgSessionDuration = sessions > 0 ? totalSessionDuration / sessions / 1000 : 0; // in seconds
    const pagesPerSession = sessions > 0 ? totalPageViews / sessions : 0;
    const conversions = filteredJourneys.filter(j => j.converted).length;
    const conversionRate = sessions > 0 ? conversions / sessions : 0;
    const revenue = filteredJourneys
      .filter(j => j.converted && j.conversionValue)
      .reduce((sum, j) => sum + (j.conversionValue || 0), 0);

    return {
      totalPageViews,
      uniquePageViews,
      sessions,
      users,
      bounceRate,
      avgSessionDuration,
      pagesPerSession,
      newUserRate: 0.65, // Mock value
      returningUserRate: 0.35, // Mock value
      conversionRate,
      goalCompletions: conversions,
      revenue
    };
  }

  public async getPageAnalytics(filters: AnalyticsFilters): Promise<Array<{
    page: string;
    title: string;
    pageViews: number;
    uniquePageViews: number;
    avgTimeOnPage: number;
    bounceRate: number;
    exitRate: number;
    entrances: number;
  }>> {
    const filteredData = this.applyFilters(this.analyticsData, filters);
    const pageGroups = this.groupBy(filteredData, 'page');

    return Object.entries(pageGroups).map(([page, views]) => {
      const uniquePageViews = new Set(views.map(v => v.userId || v.sessionId)).size;
      const avgTimeOnPage = views.reduce((sum, v) => sum + v.timeOnPage, 0) / views.length;
      const bounces = views.filter(v => v.bounced).length;
      const exits = views.filter(v => v.exitPage).length;
      const entrances = this.journeys.filter(j => j.entryPage === page).length;

      return {
        page,
        title: this.getPageTitle(page),
        pageViews: views.length,
        uniquePageViews,
        avgTimeOnPage,
        bounceRate: views.length > 0 ? bounces / views.length : 0,
        exitRate: views.length > 0 ? exits / views.length : 0,
        entrances
      };
    }).sort((a, b) => b.pageViews - a.pageViews);
  }

  public async getTrafficSources(filters: AnalyticsFilters): Promise<TrafficSource[]> {
    const filteredJourneys = this.applyJourneyFilters(this.journeys, filters);
    const sourceGroups = this.groupBy(
      filteredJourneys.map(j => j.pages[0]).filter(p => p.utmSource),
      'utmSource'
    );

    return Object.entries(sourceGroups).map(([source, pages]) => {
      const sessions = new Set(pages.map(p => p.sessionId)).size;
      const users = new Set(pages.filter(p => p.userId).map(p => p.userId)).size;
      const pageViews = pages.length;
      const journeys = filteredJourneys.filter(j => 
        j.pages.some(p => p.utmSource === source)
      );
      const bounces = journeys.filter(j => j.bounced).length;
      const conversions = journeys.filter(j => j.converted).length;
      const revenue = journeys
        .filter(j => j.converted && j.conversionValue)
        .reduce((sum, j) => sum + (j.conversionValue || 0), 0);
      const totalDuration = journeys.reduce((sum, j) => sum + j.totalDuration, 0);

      return {
        source,
        medium: pages[0]?.utmMedium || 'unknown',
        campaign: pages[0]?.utmCampaign,
        sessions,
        users,
        pageViews,
        bounceRate: sessions > 0 ? bounces / sessions : 0,
        avgSessionDuration: sessions > 0 ? totalDuration / sessions / 1000 : 0,
        conversions,
        conversionRate: sessions > 0 ? conversions / sessions : 0,
        revenue
      };
    }).sort((a, b) => b.sessions - a.sessions);
  }

  public async getDeviceAnalytics(filters: AnalyticsFilters): Promise<Array<{
    deviceType: string;
    browser: string;
    os: string;
    sessions: number;
    users: number;
    pageViews: number;
    bounceRate: number;
    conversionRate: number;
  }>> {
    const filteredJourneys = this.applyJourneyFilters(this.journeys, filters);
    const deviceGroups = this.groupBy(filteredJourneys, j => 
      `${j.device.type}_${j.device.browser}_${j.device.os}`
    );

    return Object.entries(deviceGroups).map(([key, journeys]) => {
      const device = journeys[0].device;
      const sessions = journeys.length;
      const users = new Set(journeys.filter(j => j.userId).map(j => j.userId)).size;
      const pageViews = journeys.reduce((sum, j) => sum + j.pageCount, 0);
      const bounces = journeys.filter(j => j.bounced).length;
      const conversions = journeys.filter(j => j.converted).length;

      return {
        deviceType: device.type,
        browser: device.browser,
        os: device.os,
        sessions,
        users,
        pageViews,
        bounceRate: sessions > 0 ? bounces / sessions : 0,
        conversionRate: sessions > 0 ? conversions / sessions : 0
      };
    }).sort((a, b) => b.sessions - a.sessions);
  }

  public async getGeographicAnalytics(filters: AnalyticsFilters): Promise<Array<{
    country: string;
    region: string;
    city: string;
    sessions: number;
    users: number;
    pageViews: number;
    bounceRate: number;
    conversionRate: number;
    revenue: number;
  }>> {
    const filteredJourneys = this.applyJourneyFilters(this.journeys, filters);
    const locationGroups = this.groupBy(filteredJourneys, j => 
      `${j.location.country}_${j.location.region}_${j.location.city}`
    );

    return Object.entries(locationGroups).map(([key, journeys]) => {
      const location = journeys[0].location;
      const sessions = journeys.length;
      const users = new Set(journeys.filter(j => j.userId).map(j => j.userId)).size;
      const pageViews = journeys.reduce((sum, j) => sum + j.pageCount, 0);
      const bounces = journeys.filter(j => j.bounced).length;
      const conversions = journeys.filter(j => j.converted).length;
      const revenue = journeys
        .filter(j => j.converted && j.conversionValue)
        .reduce((sum, j) => sum + (j.conversionValue || 0), 0);

      return {
        country: location.country,
        region: location.region,
        city: location.city,
        sessions,
        users,
        pageViews,
        bounceRate: sessions > 0 ? bounces / sessions : 0,
        conversionRate: sessions > 0 ? conversions / sessions : 0,
        revenue
      };
    }).sort((a, b) => b.sessions - a.sessions);
  }

  public async getConversionFunnels(filters: AnalyticsFilters): Promise<ConversionFunnel[]> {
    const funnelSteps = [
      { name: 'Event Page View', page: '/events' },
      { name: 'Event Details View', page: '/events/' },
      { name: 'Ticket Page View', page: '/tickets' },
      { name: 'Checkout Start', page: '/checkout' },
      { name: 'Purchase Complete', page: '/checkout/complete' }
    ];

    const filteredJourneys = this.applyJourneyFilters(this.journeys, filters);
    const totalEntries = filteredJourneys.filter(j => 
      j.pages.some(p => p.page.includes('/events'))
    ).length;

    const steps: ConversionStep[] = funnelSteps.map((step, index) => {
      const users = filteredJourneys.filter(j => 
        j.pages.some(p => 
          step.page === '/events/' ? 
            p.page.startsWith('/events/') && p.page !== '/events' :
            p.page.includes(step.page)
        )
      ).length;

      const conversions = index < funnelSteps.length - 1 ? 
        filteredJourneys.filter(j => {
          const hasThisStep = j.pages.some(p => 
            step.page === '/events/' ? 
              p.page.startsWith('/events/') && p.page !== '/events' :
              p.page.includes(step.page)
          );
          const hasNextStep = j.pages.some(p => 
            funnelSteps[index + 1].page === '/events/' ? 
              p.page.startsWith('/events/') && p.page !== '/events' :
              p.page.includes(funnelSteps[index + 1].page)
          );
          return hasThisStep && hasNextStep;
        }).length : users;

      const conversionRate = users > 0 ? conversions / users : 0;
      const prevUsers = index > 0 ? 
        filteredJourneys.filter(j => 
          j.pages.some(p => 
            funnelSteps[index - 1].page === '/events/' ? 
              p.page.startsWith('/events/') && p.page !== '/events' :
              p.page.includes(funnelSteps[index - 1].page)
          )
        ).length : totalEntries;
      const dropOffRate = prevUsers > 0 ? (prevUsers - users) / prevUsers : 0;

      return {
        name: step.name,
        page: step.page,
        users,
        conversions,
        conversionRate,
        averageTimeOnStep: 120, // Mock value in seconds
        dropOffRate
      };
    });

    const totalConversions = steps[steps.length - 1].users;
    const overallConversionRate = totalEntries > 0 ? totalConversions / totalEntries : 0;

    return [{
      name: 'Event Purchase Funnel',
      steps,
      totalEntries,
      totalConversions,
      overallConversionRate,
      averageTimeToConvert: 1800, // Mock value in seconds
      dropOffPoints: steps
        .filter(s => s.dropOffRate > 0.5)
        .map(s => s.name)
    }];
  }

  public async getUserJourneys(filters: AnalyticsFilters): Promise<UserJourney[]> {
    return this.applyJourneyFilters(this.journeys, filters)
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
      .slice(0, 100); // Return latest 100 journeys
  }

  public async getRealTimeData(): Promise<RealTimeData> {
    return this.generateRealTimeData();
  }

  public onRealTimeUpdate(callback: (data: RealTimeData) => void): () => void {
    this.realTimeListeners.add(callback);
    return () => this.realTimeListeners.delete(callback);
  }

  public async exportAnalyticsData(
    filters: AnalyticsFilters,
    format: 'csv' | 'json' | 'excel'
  ): Promise<Blob> {
    const overview = await this.getAnalyticsOverview(filters);
    const pageAnalytics = await this.getPageAnalytics(filters);
    const trafficSources = await this.getTrafficSources(filters);
    const deviceAnalytics = await this.getDeviceAnalytics(filters);
    const geographicAnalytics = await this.getGeographicAnalytics(filters);

    const exportData = {
      overview,
      pageAnalytics,
      trafficSources,
      deviceAnalytics,
      geographicAnalytics,
      exportDate: new Date().toISOString(),
      filters
    };

    if (format === 'json') {
      return new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
    }

    if (format === 'csv') {
      const csvContent = this.convertToCSV(exportData);
      return new Blob([csvContent], { type: 'text/csv' });
    }

    // Excel format would require a library like xlsx
    throw new Error('Excel export not yet implemented');
  }

  // Private helper methods
  private applyFilters(data: PageViewData[], filters: AnalyticsFilters): PageViewData[] {
    return data.filter(pv => {
      if (pv.timestamp < filters.dateRange.start || pv.timestamp > filters.dateRange.end) {
        return false;
      }
      if (filters.eventIds && !filters.eventIds.includes(pv.eventId)) {
        return false;
      }
      if (filters.countries && !filters.countries.includes(pv.location.country)) {
        return false;
      }
      if (filters.devices && !filters.devices.includes(pv.device.type)) {
        return false;
      }
      if (filters.sources && pv.utmSource && !filters.sources.includes(pv.utmSource)) {
        return false;
      }
      if (filters.pages && !filters.pages.some(page => pv.page.includes(page))) {
        return false;
      }
      return true;
    });
  }

  private applyJourneyFilters(data: UserJourney[], filters: AnalyticsFilters): UserJourney[] {
    return data.filter(journey => {
      if (journey.startTime < filters.dateRange.start || journey.startTime > filters.dateRange.end) {
        return false;
      }
      if (filters.eventIds && !journey.pages.some(p => filters.eventIds!.includes(p.eventId))) {
        return false;
      }
      if (filters.countries && !filters.countries.includes(journey.location.country)) {
        return false;
      }
      if (filters.devices && !filters.devices.includes(journey.device.type)) {
        return false;
      }
      return true;
    });
  }

  private groupBy<T>(array: T[], keyFn: (item: T) => string): Record<string, T[]> {
    return array.reduce((groups, item) => {
      const key = keyFn(item);
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
      return groups;
    }, {} as Record<string, T[]>);
  }

  private convertToCSV(data: any): string {
    // Simple CSV conversion - in a real implementation, this would be more sophisticated
    const headers = Object.keys(data.overview);
    const values = Object.values(data.overview);
    return `${headers.join(',')}\n${values.join(',')}`;
  }
}

// Export service instance
export const webAnalyticsService = WebAnalyticsService.getInstance();

// Export types for components
export type {
  AnalyticsMetrics,
  AnalyticsFilters,
  RealTimeData,
  TrafficSource,
  DeviceInfo,
  LocationInfo,
  ConversionFunnel,
  UserJourney
};