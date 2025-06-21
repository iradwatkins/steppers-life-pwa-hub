import { supabase } from '@/integrations/supabase/client';
import { EventPerformanceMetrics, EventPerformanceService } from './eventPerformanceService';

export interface MultiEventMetrics {
  totalEvents: number;
  totalRevenue: number;
  totalAttendees: number;
  averageCapacityUtilization: number;
  averageCheckInRate: number;
  totalCapacity: number;
  revenueGrowth: number;
  attendeeGrowth: number;
}

export interface EventComparison {
  eventId: string;
  eventName: string;
  date: string;
  revenue: number;
  attendees: number;
  capacity: number;
  checkInRate: number;
  utilizationRate: number;
  performance: 'excellent' | 'good' | 'average' | 'poor';
}

export interface TrendAnalysis {
  period: string;
  revenue: number;
  attendees: number;
  events: number;
  averageRevenue: number;
  growthRate: number;
}

export interface VenuePerformance {
  venueId: string;
  venueName: string;
  eventsCount: number;
  totalRevenue: number;
  averageAttendance: number;
  averageCapacityUtilization: number;
  rating: number;
}

export interface AudienceInsights {
  repeatAttendees: number;
  newAttendees: number;
  loyaltyRate: number;
  crossEventAttendance: number;
  audienceGrowth: number;
  engagementScore: number;
}

export interface PredictiveInsights {
  optimalPricing: {
    ticketType: string;
    recommendedPrice: number;
    currentPrice: number;
    potentialIncrease: number;
  }[];
  bestTimeSlots: {
    dayOfWeek: string;
    timeSlot: string;
    successRate: number;
  }[];
  venueRecommendations: {
    venueId: string;
    venueName: string;
    score: number;
    reasons: string[];
  }[];
  marketingChannelEffectiveness: {
    channel: string;
    conversionRate: number;
    costPerAcquisition: number;
    roi: number;
  }[];
}

export class MultiEventAnalyticsService {
  static async getOrganizerEvents(organizerId: string): Promise<any[]> {
    const { data: events, error } = await supabase
      .from('events')
      .select('*')
      .eq('organizer_id', organizerId)
      .order('start_time', { ascending: false });

    if (error) throw error;
    return events || [];
  }

  static async getMultiEventMetrics(organizerId: string, dateRange?: { start: string; end: string }): Promise<MultiEventMetrics> {
    try {
      const events = await this.getOrganizerEvents(organizerId);
      
      if (events.length === 0) {
        return {
          totalEvents: 0,
          totalRevenue: 0,
          totalAttendees: 0,
          averageCapacityUtilization: 0,
          averageCheckInRate: 0,
          totalCapacity: 0,
          revenueGrowth: 0,
          attendeeGrowth: 0
        };
      }

      // Get performance data for each event
      const performancePromises = events.map(event => 
        EventPerformanceService.getEventPerformance(event.id).catch(() => null)
      );
      const performanceData = (await Promise.all(performancePromises)).filter(Boolean) as EventPerformanceMetrics[];

      const totalRevenue = performanceData.reduce((sum, event) => sum + event.totalRevenue, 0);
      const totalAttendees = performanceData.reduce((sum, event) => sum + event.totalSold, 0);
      const totalCapacity = performanceData.reduce((sum, event) => sum + event.totalCapacity, 0);
      const averageCapacityUtilization = totalCapacity > 0 ? (totalAttendees / totalCapacity) * 100 : 0;
      const averageCheckInRate = performanceData.length > 0 
        ? performanceData.reduce((sum, event) => sum + event.checkInRate, 0) / performanceData.length 
        : 0;

      // Calculate growth rates (mock calculation)
      const revenueGrowth = Math.random() * 20 - 10; // -10% to +10%
      const attendeeGrowth = Math.random() * 25 - 5; // -5% to +20%

      return {
        totalEvents: events.length,
        totalRevenue,
        totalAttendees,
        averageCapacityUtilization,
        averageCheckInRate,
        totalCapacity,
        revenueGrowth,
        attendeeGrowth
      };
    } catch (error) {
      console.error('Error fetching multi-event metrics:', error);
      throw error;
    }
  }

  static async getEventComparisons(organizerId: string, limit: number = 10): Promise<EventComparison[]> {
    try {
      const events = await this.getOrganizerEvents(organizerId);
      const comparisons: EventComparison[] = [];

      for (const event of events.slice(0, limit)) {
        try {
          const performance = await EventPerformanceService.getEventPerformance(event.id);
          const utilizationRate = event.capacity > 0 ? (performance.totalSold / event.capacity) * 100 : 0;
          
          let performanceRating: 'excellent' | 'good' | 'average' | 'poor';
          if (utilizationRate >= 90 && performance.checkInRate >= 85) performanceRating = 'excellent';
          else if (utilizationRate >= 75 && performance.checkInRate >= 75) performanceRating = 'good';
          else if (utilizationRate >= 50 && performance.checkInRate >= 60) performanceRating = 'average';
          else performanceRating = 'poor';

          comparisons.push({
            eventId: event.id,
            eventName: event.title,
            date: event.start_time,
            revenue: performance.totalRevenue,
            attendees: performance.totalSold,
            capacity: event.capacity || 0,
            checkInRate: performance.checkInRate,
            utilizationRate,
            performance: performanceRating
          });
        } catch {
          // Skip events with missing data
        }
      }

      return comparisons.sort((a, b) => b.revenue - a.revenue);
    } catch (error) {
      console.error('Error fetching event comparisons:', error);
      throw error;
    }
  }

  static async getTrendAnalysis(organizerId: string, period: 'month' | 'quarter' | 'year' = 'month'): Promise<TrendAnalysis[]> {
    try {
      const events = await this.getOrganizerEvents(organizerId);
      const trendsMap = new Map<string, { revenue: number; attendees: number; events: number }>();
      
      for (const event of events) {
        try {
          const performance = await EventPerformanceService.getEventPerformance(event.id);
          const date = new Date(event.start_time);
          
          let periodKey: string;
          if (period === 'month') {
            periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          } else if (period === 'quarter') {
            const quarter = Math.floor(date.getMonth() / 3) + 1;
            periodKey = `${date.getFullYear()}-Q${quarter}`;
          } else {
            periodKey = date.getFullYear().toString();
          }

          if (!trendsMap.has(periodKey)) {
            trendsMap.set(periodKey, { revenue: 0, attendees: 0, events: 0 });
          }

          const trend = trendsMap.get(periodKey)!;
          trend.revenue += performance.totalRevenue;
          trend.attendees += performance.totalSold;
          trend.events += 1;
        } catch {
          // Skip events with missing data
        }
      }

      const trends = Array.from(trendsMap.entries()).map(([period, data]) => ({
        period,
        revenue: data.revenue,
        attendees: data.attendees,
        events: data.events,
        averageRevenue: data.events > 0 ? data.revenue / data.events : 0,
        growthRate: 0 // Will be calculated below
      })).sort((a, b) => a.period.localeCompare(b.period));

      // Calculate growth rates
      for (let i = 1; i < trends.length; i++) {
        const previous = trends[i - 1];
        const current = trends[i];
        if (previous.revenue > 0) {
          current.growthRate = ((current.revenue - previous.revenue) / previous.revenue) * 100;
        }
      }

      return trends;
    } catch (error) {
      console.error('Error fetching trend analysis:', error);
      throw error;
    }
  }

  static async getVenuePerformance(organizerId: string): Promise<VenuePerformance[]> {
    try {
      const { data: events, error } = await supabase
        .from('events')
        .select(`
          *,
          venues(*)
        `)
        .eq('organizer_id', organizerId);

      if (error) throw error;

      const venueMap = new Map<string, {
        venue: any;
        events: any[];
        totalRevenue: number;
        totalAttendees: number;
        eventsCount: number;
      }>();

      for (const event of events || []) {
        if (!event.venues) continue;

        const venueId = event.venue_id;
        if (!venueMap.has(venueId)) {
          venueMap.set(venueId, {
            venue: event.venues,
            events: [],
            totalRevenue: 0,
            totalAttendees: 0,
            eventsCount: 0
          });
        }

        const venueData = venueMap.get(venueId)!;
        venueData.events.push(event);
        venueData.eventsCount += 1;

        try {
          const performance = await EventPerformanceService.getEventPerformance(event.id);
          venueData.totalRevenue += performance.totalRevenue;
          venueData.totalAttendees += performance.totalSold;
        } catch {
          // Skip events with missing performance data
        }
      }

      return Array.from(venueMap.entries()).map(([venueId, data]) => ({
        venueId,
        venueName: data.venue.name,
        eventsCount: data.eventsCount,
        totalRevenue: data.totalRevenue,
        averageAttendance: data.eventsCount > 0 ? data.totalAttendees / data.eventsCount : 0,
        averageCapacityUtilization: 75 + Math.random() * 20, // Mock calculation
        rating: 3.5 + Math.random() * 1.5 // Mock rating
      })).sort((a, b) => b.totalRevenue - a.totalRevenue);
    } catch (error) {
      console.error('Error fetching venue performance:', error);
      throw error;
    }
  }

  static async getAudienceInsights(organizerId: string): Promise<AudienceInsights> {
    try {
      const events = await this.getOrganizerEvents(organizerId);
      
      // Mock audience insights - in production, this would analyze actual attendee data
      const totalAttendees = events.length * 50; // Rough estimate
      
      return {
        repeatAttendees: Math.floor(totalAttendees * 0.3),
        newAttendees: Math.floor(totalAttendees * 0.7),
        loyaltyRate: 30 + Math.random() * 40, // 30-70%
        crossEventAttendance: 15 + Math.random() * 20, // 15-35%
        audienceGrowth: Math.random() * 30 - 5, // -5% to +25%
        engagementScore: 60 + Math.random() * 30 // 60-90
      };
    } catch (error) {
      console.error('Error fetching audience insights:', error);
      throw error;
    }
  }

  static async getPredictiveInsights(organizerId: string): Promise<PredictiveInsights> {
    try {
      // Mock predictive insights - in production, this would use ML models
      return {
        optimalPricing: [
          {
            ticketType: 'VIP',
            recommendedPrice: 75,
            currentPrice: 65,
            potentialIncrease: 15.4
          },
          {
            ticketType: 'General Admission',
            recommendedPrice: 35,
            currentPrice: 30,
            potentialIncrease: 16.7
          }
        ],
        bestTimeSlots: [
          {
            dayOfWeek: 'Saturday',
            timeSlot: '8:00 PM',
            successRate: 92
          },
          {
            dayOfWeek: 'Friday',
            timeSlot: '9:00 PM',
            successRate: 87
          },
          {
            dayOfWeek: 'Sunday',
            timeSlot: '6:00 PM',
            successRate: 76
          }
        ],
        venueRecommendations: [
          {
            venueId: 'venue-1',
            venueName: 'Chicago Stepping Center',
            score: 95,
            reasons: ['High attendance rates', 'Great customer feedback', 'Optimal location']
          },
          {
            venueId: 'venue-2',
            venueName: 'Downtown Dance Hall',
            score: 88,
            reasons: ['Central location', 'Good parking', 'Modern facilities']
          }
        ],
        marketingChannelEffectiveness: [
          {
            channel: 'Facebook',
            conversionRate: 8.5,
            costPerAcquisition: 12.50,
            roi: 280
          },
          {
            channel: 'Instagram',
            conversionRate: 12.2,
            costPerAcquisition: 15.00,
            roi: 320
          },
          {
            channel: 'Email',
            conversionRate: 15.8,
            costPerAcquisition: 5.25,
            roi: 450
          }
        ]
      };
    } catch (error) {
      console.error('Error fetching predictive insights:', error);
      throw error;
    }
  }

  static async exportMultiEventData(organizerId: string, format: 'csv' | 'json' | 'excel'): Promise<string> {
    try {
      const [metrics, comparisons, trends] = await Promise.all([
        this.getMultiEventMetrics(organizerId),
        this.getEventComparisons(organizerId),
        this.getTrendAnalysis(organizerId)
      ]);

      const exportData = {
        summary: metrics,
        eventComparisons: comparisons,
        trends: trends,
        exportedAt: new Date().toISOString()
      };

      switch (format) {
        case 'json':
          return JSON.stringify(exportData, null, 2);
        case 'csv':
          return this.convertToCSV(exportData);
        case 'excel':
          // Excel export would require additional library
          return 'Excel export not implemented yet';
        default:
          throw new Error('Unsupported format');
      }
    } catch (error) {
      console.error('Error exporting multi-event data:', error);
      throw error;
    }
  }

  private static convertToCSV(data: any): string {
    const rows = [
      ['Multi-Event Analytics Summary'],
      [''],
      ['Metric', 'Value'],
      ['Total Events', data.summary.totalEvents.toString()],
      ['Total Revenue', `$${data.summary.totalRevenue.toFixed(2)}`],
      ['Total Attendees', data.summary.totalAttendees.toString()],
      ['Avg Capacity Utilization', `${data.summary.averageCapacityUtilization.toFixed(1)}%`],
      ['Avg Check-in Rate', `${data.summary.averageCheckInRate.toFixed(1)}%`],
      [''],
      ['Event Comparisons'],
      ['Event Name', 'Date', 'Revenue', 'Attendees', 'Capacity', 'Check-in Rate', 'Performance'],
      ...data.eventComparisons.map((event: EventComparison) => [
        event.eventName,
        event.date,
        `$${event.revenue.toFixed(2)}`,
        event.attendees.toString(),
        event.capacity.toString(),
        `${event.checkInRate.toFixed(1)}%`,
        event.performance
      ])
    ];

    return rows.map(row => row.join(',')).join('\n');
  }
}