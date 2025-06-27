import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

export interface AnalyticsEvent {
  id: string;
  event_type: string;
  user_id?: string;
  session_id: string;
  properties: Record<string, any>;
  timestamp: string;
  page_url: string;
  referrer?: string;
  user_agent: string;
  ip_address?: string;
}

export interface UserBehaviorAnalytics {
  user_id: string;
  session_count: number;
  total_time_spent: number; // minutes
  pages_visited: number;
  events_viewed: number;
  tickets_purchased: number;
  social_shares: number;
  last_active: string;
  acquisition_source?: string;
  device_type: 'desktop' | 'mobile' | 'tablet';
  conversion_funnel_stage: 'visitor' | 'browser' | 'interested' | 'customer' | 'advocate';
}

export interface EventPerformanceMetrics {
  event_id: string;
  total_views: number;
  unique_visitors: number;
  ticket_conversion_rate: number;
  social_shares: number;
  average_time_on_page: number;
  bounce_rate: number;
  mobile_vs_desktop_ratio: number;
  peak_interest_times: Array<{ hour: number; views: number }>;
  geographic_distribution: Array<{ location: string; views: number }>;
  referral_sources: Array<{ source: string; visits: number }>;
}

export interface PlatformAnalytics {
  total_users: number;
  active_users_today: number;
  active_users_this_week: number;
  active_users_this_month: number;
  total_events_created: number;
  total_tickets_sold: number;
  total_revenue: number;
  average_order_value: number;
  user_retention_rate: number;
  popular_event_categories: Array<{ category: string; count: number }>;
  geographic_user_distribution: Array<{ country: string; users: number }>;
  device_usage_stats: Array<{ device: string; percentage: number }>;
}

export class AdvancedAnalyticsService {
  private static sessionId: string;
  
  static {
    // Generate session ID on service initialization
    this.sessionId = this.generateSessionId();
  }

  // Track custom events
  static async trackEvent(eventType: string, properties: Record<string, any> = {}, userId?: string): Promise<void> {
    try {
      const eventData: Omit<AnalyticsEvent, 'id'> = {
        event_type: eventType,
        user_id: userId,
        session_id: this.sessionId,
        properties,
        timestamp: new Date().toISOString(),
        page_url: window.location.href,
        referrer: document.referrer,
        user_agent: navigator.userAgent,
        ip_address: await this.getUserIP()
      };

      const { error } = await supabase
        .from('analytics_events')
        .insert(eventData);

      if (error) {
        console.error('❌ Error tracking analytics event:', error);
      } else {
        console.log('📊 Analytics event tracked:', eventType, properties);
      }

      // Also send to external analytics if configured
      await this.sendToExternalAnalytics(eventType, properties, userId);

    } catch (error) {
      console.error('❌ Error in trackEvent:', error);
    }
  }

  // Track page views
  static async trackPageView(pagePath: string, userId?: string, additionalData?: Record<string, any>): Promise<void> {
    await this.trackEvent('page_view', {
      page_path: pagePath,
      page_title: document.title,
      ...additionalData
    }, userId);
  }

  // Track user interactions
  static async trackUserInteraction(interaction: string, elementId?: string, additionalData?: Record<string, any>, userId?: string): Promise<void> {
    await this.trackEvent('user_interaction', {
      interaction_type: interaction,
      element_id: elementId,
      ...additionalData
    }, userId);
  }

  // Track conversion events
  static async trackConversion(conversionType: string, value?: number, currency?: string, userId?: string): Promise<void> {
    await this.trackEvent('conversion', {
      conversion_type: conversionType,
      value,
      currency: currency || 'USD'
    }, userId);
  }

  // Get user behavior analytics
  static async getUserBehaviorAnalytics(userId: string): Promise<UserBehaviorAnalytics> {
    try {
      // Get session data
      const { data: sessions, error: sessionsError } = await supabase
        .from('analytics_events')
        .select('session_id, timestamp')
        .eq('user_id', userId)
        .order('timestamp', { ascending: true });

      if (sessionsError) {
        throw sessionsError;
      }

      // Calculate session count
      const uniqueSessions = new Set(sessions?.map(s => s.session_id)).size;

      // Get page views
      const { data: pageViews, error: pageViewsError } = await supabase
        .from('analytics_events')
        .select('properties')
        .eq('user_id', userId)
        .eq('event_type', 'page_view');

      // Get event views
      const { data: eventViews, error: eventViewsError } = await supabase
        .from('analytics_events')
        .select('properties')
        .eq('user_id', userId)
        .eq('event_type', 'event_view');

      // Get ticket purchases
      const { data: purchases, error: purchasesError } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'completed');

      // Get social shares
      const { data: shares, error: sharesError } = await supabase
        .from('social_shares')
        .select('*')
        .eq('user_id', userId);

      // Calculate time spent (simplified)
      const totalTimeSpent = sessions ? this.calculateTotalTimeSpent(sessions) : 0;

      // Determine device type
      const deviceType = this.getDeviceType(navigator.userAgent);

      // Determine conversion stage
      const conversionStage = this.determineConversionStage(
        pageViews?.length || 0,
        eventViews?.length || 0,
        purchases?.length || 0,
        shares?.length || 0
      );

      return {
        user_id: userId,
        session_count: uniqueSessions,
        total_time_spent: totalTimeSpent,
        pages_visited: pageViews?.length || 0,
        events_viewed: eventViews?.length || 0,
        tickets_purchased: purchases?.length || 0,
        social_shares: shares?.length || 0,
        last_active: sessions?.[sessions.length - 1]?.timestamp || new Date().toISOString(),
        device_type: deviceType,
        conversion_funnel_stage: conversionStage
      };

    } catch (error) {
      console.error('❌ Error getting user behavior analytics:', error);
      throw error;
    }
  }

  // Get event performance metrics
  static async getEventPerformanceMetrics(eventId: string): Promise<EventPerformanceMetrics> {
    try {
      // Get all analytics events for this event
      const { data: eventAnalytics, error } = await supabase
        .from('analytics_events')
        .select('*')
        .eq('properties->>event_id', eventId)
        .order('timestamp', { ascending: true });

      if (error) {
        throw error;
      }

      // Calculate metrics
      const totalViews = eventAnalytics?.filter(e => e.event_type === 'event_view').length || 0;
      const uniqueVisitors = new Set(eventAnalytics?.map(e => e.user_id).filter(Boolean)).size;

      // Get ticket sales for conversion rate
      const { data: tickets, error: ticketsError } = await supabase
        .from('orders')
        .select('*')
        .eq('event_id', eventId)
        .eq('status', 'completed');

      const ticketsSold = tickets?.length || 0;
      const conversionRate = totalViews > 0 ? (ticketsSold / totalViews) * 100 : 0;

      // Get social shares
      const { data: shares, error: sharesError } = await supabase
        .from('social_shares')
        .select('*')
        .eq('event_id', eventId);

      const socialShares = shares?.length || 0;

      // Calculate time-based metrics
      const { averageTimeOnPage, bounceRate, peakTimes } = this.calculateTimeMetrics(eventAnalytics || []);

      // Calculate device ratio
      const mobileCount = eventAnalytics?.filter(e => this.getDeviceType(e.user_agent) === 'mobile').length || 0;
      const desktopCount = eventAnalytics?.filter(e => this.getDeviceType(e.user_agent) === 'desktop').length || 0;
      const mobileVsDesktopRatio = desktopCount > 0 ? mobileCount / desktopCount : 0;

      return {
        event_id: eventId,
        total_views: totalViews,
        unique_visitors: uniqueVisitors,
        ticket_conversion_rate: conversionRate,
        social_shares: socialShares,
        average_time_on_page: averageTimeOnPage,
        bounce_rate: bounceRate,
        mobile_vs_desktop_ratio: mobileVsDesktopRatio,
        peak_interest_times: peakTimes,
        geographic_distribution: [], // Would need IP geolocation
        referral_sources: this.calculateReferralSources(eventAnalytics || [])
      };

    } catch (error) {
      console.error('❌ Error getting event performance metrics:', error);
      throw error;
    }
  }

  // Get platform-wide analytics
  static async getPlatformAnalytics(): Promise<PlatformAnalytics> {
    try {
      // Get user counts
      const { count: totalUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      // Get active users
      const today = new Date();
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      const { count: activeToday } = await supabase
        .from('analytics_events')
        .select('user_id', { count: 'exact', head: true })
        .gte('timestamp', today.toISOString().split('T')[0]);

      const { count: activeThisWeek } = await supabase
        .from('analytics_events')
        .select('user_id', { count: 'exact', head: true })
        .gte('timestamp', weekAgo.toISOString());

      const { count: activeThisMonth } = await supabase
        .from('analytics_events')
        .select('user_id', { count: 'exact', head: true })
        .gte('timestamp', monthAgo.toISOString());

      // Get event counts
      const { count: totalEvents } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true });

      // Get ticket sales and revenue
      const { data: completedOrders, error: ordersError } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('status', 'completed');

      const totalTickets = completedOrders?.length || 0;
      const totalRevenue = completedOrders?.reduce((sum, order) => sum + order.total_amount, 0) || 0;
      const averageOrderValue = totalTickets > 0 ? totalRevenue / totalTickets : 0;

      // Get popular categories
      const { data: events, error: eventsError } = await supabase
        .from('events')
        .select('category');

      const categoryStats = events?.reduce((acc: Record<string, number>, event) => {
        const category = event.category || 'Other';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {}) || {};

      const popularCategories = Object.entries(categoryStats)
        .map(([category, count]) => ({ category, count: count as number }))
        .sort((a, b) => b.count - a.count);

      return {
        total_users: totalUsers || 0,
        active_users_today: activeToday || 0,
        active_users_this_week: activeThisWeek || 0,
        active_users_this_month: activeThisMonth || 0,
        total_events_created: totalEvents || 0,
        total_tickets_sold: totalTickets,
        total_revenue: totalRevenue,
        average_order_value: averageOrderValue,
        user_retention_rate: 0, // Would need cohort analysis
        popular_event_categories: popularCategories,
        geographic_user_distribution: [], // Would need IP geolocation
        device_usage_stats: [] // Would analyze user agents
      };

    } catch (error) {
      console.error('❌ Error getting platform analytics:', error);
      throw error;
    }
  }

  // Export analytics data
  static async exportAnalyticsData(
    startDate: string,
    endDate: string,
    eventTypes?: string[],
    format: 'csv' | 'json' = 'json'
  ): Promise<Blob> {
    try {
      let query = supabase
        .from('analytics_events')
        .select('*')
        .gte('timestamp', startDate)
        .lte('timestamp', endDate)
        .order('timestamp', { ascending: true });

      if (eventTypes && eventTypes.length > 0) {
        query = query.in('event_type', eventTypes);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      let content: string;
      let mimeType: string;

      if (format === 'csv') {
        content = this.convertToCSV(data || []);
        mimeType = 'text/csv';
      } else {
        content = JSON.stringify(data, null, 2);
        mimeType = 'application/json';
      }

      return new Blob([content], { type: mimeType });

    } catch (error) {
      console.error('❌ Error exporting analytics data:', error);
      throw error;
    }
  }

  // Private helper methods
  private static generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private static async getUserIP(): Promise<string | undefined> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.warn('⚠️ Could not get user IP:', error);
      return undefined;
    }
  }

  private static async sendToExternalAnalytics(eventType: string, properties: Record<string, any>, userId?: string): Promise<void> {
    try {
      // Google Analytics
      if (typeof gtag !== 'undefined') {
        gtag('event', eventType, {
          custom_parameter: JSON.stringify(properties),
          user_id: userId
        });
      }

      // Mixpanel
      if (typeof mixpanel !== 'undefined') {
        mixpanel.track(eventType, {
          ...properties,
          user_id: userId
        });
      }

      // Custom webhook
      if (process.env.REACT_APP_ANALYTICS_WEBHOOK_URL) {
        fetch(process.env.REACT_APP_ANALYTICS_WEBHOOK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            event_type: eventType,
            properties,
            user_id: userId,
            timestamp: new Date().toISOString()
          })
        }).catch(err => console.warn('⚠️ Analytics webhook failed:', err));
      }

    } catch (error) {
      console.warn('⚠️ External analytics tracking failed:', error);
    }
  }

  private static getDeviceType(userAgent: string): 'desktop' | 'mobile' | 'tablet' {
    if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
      return 'tablet';
    }
    if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) {
      return 'mobile';
    }
    return 'desktop';
  }

  private static determineConversionStage(
    pageViews: number,
    eventViews: number,
    purchases: number,
    shares: number
  ): UserBehaviorAnalytics['conversion_funnel_stage'] {
    if (shares > 0) return 'advocate';
    if (purchases > 0) return 'customer';
    if (eventViews > 0) return 'interested';
    if (pageViews > 3) return 'browser';
    return 'visitor';
  }

  private static calculateTotalTimeSpent(sessions: Array<{ session_id: string; timestamp: string }>): number {
    // Simplified calculation - in production, would track session duration more accurately
    const sessionGroups = sessions.reduce((acc: Record<string, string[]>, session) => {
      if (!acc[session.session_id]) {
        acc[session.session_id] = [];
      }
      acc[session.session_id].push(session.timestamp);
      return acc;
    }, {});

    let totalMinutes = 0;
    Object.values(sessionGroups).forEach(timestamps => {
      if (timestamps.length > 1) {
        const start = new Date(timestamps[0]);
        const end = new Date(timestamps[timestamps.length - 1]);
        const duration = (end.getTime() - start.getTime()) / (1000 * 60); // minutes
        totalMinutes += Math.min(duration, 120); // Cap at 2 hours per session
      }
    });

    return totalMinutes;
  }

  private static calculateTimeMetrics(events: AnalyticsEvent[]): {
    averageTimeOnPage: number;
    bounceRate: number;
    peakTimes: Array<{ hour: number; views: number }>;
  } {
    // Simplified implementation
    const averageTimeOnPage = 2.5; // Would calculate from actual session data
    const bounceRate = 35; // Would calculate from single-page sessions
    
    // Calculate peak times
    const hourCounts = events.reduce((acc: Record<number, number>, event) => {
      const hour = new Date(event.timestamp).getHours();
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {});

    const peakTimes = Object.entries(hourCounts)
      .map(([hour, views]) => ({ hour: parseInt(hour), views: views as number }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);

    return {
      averageTimeOnPage,
      bounceRate,
      peakTimes
    };
  }

  private static calculateReferralSources(events: AnalyticsEvent[]): Array<{ source: string; visits: number }> {
    const sourceCounts = events.reduce((acc: Record<string, number>, event) => {
      const referrer = event.referrer || 'Direct';
      let source = 'Direct';
      
      if (referrer.includes('google')) source = 'Google';
      else if (referrer.includes('facebook')) source = 'Facebook';
      else if (referrer.includes('instagram')) source = 'Instagram';
      else if (referrer.includes('twitter')) source = 'Twitter';
      else if (referrer !== 'Direct') source = 'Other';
      
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(sourceCounts)
      .map(([source, visits]) => ({ source, visits: visits as number }))
      .sort((a, b) => b.visits - a.visits);
  }

  private static convertToCSV(data: any[]): string {
    if (!data.length) return '';

    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          if (typeof value === 'object') {
            return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
          }
          return `"${String(value).replace(/"/g, '""')}"`;
        }).join(',')
      )
    ];

    return csvRows.join('\n');
  }
}