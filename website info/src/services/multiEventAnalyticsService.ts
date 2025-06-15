import { Event } from '../types/event';
import { Attendee } from '../types/attendee';
import { TicketPurchase } from '../types/ticket';

export interface MultiEventMetrics {
  totalEvents: number;
  totalRevenue: number;
  totalTicketsSold: number;
  totalAttendees: number;
  averageTicketPrice: number;
  averageAttendanceRate: number;
  topPerformingEvents: EventPerformance[];
  revenueByMonth: { month: string; revenue: number; }[];
  ticketTypeDistribution: { type: string; count: number; percentage: number; }[];
}

export interface EventPerformance {
  eventId: string;
  title: string;
  date: string;
  venue: string;
  category: string;
  ticketsSold: number;
  capacity: number;
  revenue: number;
  attendanceRate: number;
  checkinRate: number;
  averageTicketPrice: number;
  profitMargin: number;
}

export interface EventComparison {
  event1: EventPerformance;
  event2: EventPerformance;
  metrics: {
    revenueDifference: number;
    attendanceDifference: number;
    pricingDifference: number;
    performanceScore1: number;
    performanceScore2: number;
  };
}

export interface TrendAnalysis {
  revenueGrowth: number;
  attendanceGrowth: number;
  seasonalPatterns: {
    season: string;
    averageRevenue: number;
    averageAttendance: number;
    eventCount: number;
  }[];
  venuePerformance: {
    venue: string;
    eventCount: number;
    averageRevenue: number;
    averageAttendance: number;
    successRate: number;
  }[];
  optimalTiming: {
    dayOfWeek: string;
    timeOfDay: string;
    averagePerformance: number;
  }[];
}

export interface AudienceOverlap {
  totalUniqueAttendees: number;
  returningAttendees: number;
  retentionRate: number;
  crossEventAttendance: {
    attendeeId: string;
    eventCount: number;
    events: string[];
    totalSpent: number;
  }[];
  loyaltySegments: {
    segment: string;
    count: number;
    averageSpend: number;
    eventFrequency: number;
  }[];
}

export interface PredictiveInsights {
  recommendations: {
    type: 'pricing' | 'timing' | 'venue' | 'marketing';
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    confidence: number;
  }[];
  optimalParameters: {
    bestVenues: string[];
    optimalPricing: { min: number; max: number; optimal: number; };
    bestTimeSlots: string[];
    topCategories: string[];
  };
  forecasts: {
    nextEventRevenue: number;
    expectedAttendance: number;
    confidenceInterval: { min: number; max: number; };
  };
}

class MultiEventAnalyticsService {
  private events: Event[] = [];
  private attendees: Attendee[] = [];
  private purchases: TicketPurchase[] = [];

  // Load data from various sources
  async loadEventData(organizerId: string): Promise<void> {
    try {
      // In a real implementation, these would be API calls
      this.events = await this.fetchOrganizerEvents(organizerId);
      this.attendees = await this.fetchEventAttendees(organizerId);
      this.purchases = await this.fetchEventPurchases(organizerId);
    } catch (error) {
      console.error('Error loading multi-event data:', error);
      throw error;
    }
  }

  // Get aggregate metrics across all events
  getMultiEventMetrics(): MultiEventMetrics {
    const totalRevenue = this.purchases.reduce((sum, purchase) => sum + purchase.totalAmount, 0);
    const totalTicketsSold = this.purchases.reduce((sum, purchase) => sum + purchase.tickets.length, 0);
    const totalAttendees = new Set(this.purchases.map(p => p.buyerId)).size;
    
    const revenueByMonth = this.calculateMonthlyRevenue();
    const ticketTypeDistribution = this.calculateTicketTypeDistribution();
    const topPerformingEvents = this.getTopPerformingEvents(5);

    return {
      totalEvents: this.events.length,
      totalRevenue,
      totalTicketsSold,
      totalAttendees,
      averageTicketPrice: totalTicketsSold > 0 ? totalRevenue / totalTicketsSold : 0,
      averageAttendanceRate: this.calculateAverageAttendanceRate(),
      topPerformingEvents,
      revenueByMonth,
      ticketTypeDistribution
    };
  }

  // Compare two specific events
  compareEvents(eventId1: string, eventId2: string): EventComparison {
    const event1Performance = this.getEventPerformance(eventId1);
    const event2Performance = this.getEventPerformance(eventId2);

    const revenueDifference = event1Performance.revenue - event2Performance.revenue;
    const attendanceDifference = event1Performance.attendanceRate - event2Performance.attendanceRate;
    const pricingDifference = event1Performance.averageTicketPrice - event2Performance.averageTicketPrice;

    return {
      event1: event1Performance,
      event2: event2Performance,
      metrics: {
        revenueDifference,
        attendanceDifference,
        pricingDifference,
        performanceScore1: this.calculatePerformanceScore(event1Performance),
        performanceScore2: this.calculatePerformanceScore(event2Performance)
      }
    };
  }

  // Analyze trends across events
  getTrendAnalysis(): TrendAnalysis {
    return {
      revenueGrowth: this.calculateRevenueGrowth(),
      attendanceGrowth: this.calculateAttendanceGrowth(),
      seasonalPatterns: this.analyzeSeasonalPatterns(),
      venuePerformance: this.analyzeVenuePerformance(),
      optimalTiming: this.findOptimalTiming()
    };
  }

  // Analyze audience overlap and retention
  getAudienceOverlap(): AudienceOverlap {
    const attendeeEventMap = new Map<string, string[]>();
    const attendeeSpendMap = new Map<string, number>();

    this.purchases.forEach(purchase => {
      const eventList = attendeeEventMap.get(purchase.buyerId) || [];
      eventList.push(purchase.eventId);
      attendeeEventMap.set(purchase.buyerId, eventList);

      const currentSpend = attendeeSpendMap.get(purchase.buyerId) || 0;
      attendeeSpendMap.set(purchase.buyerId, currentSpend + purchase.totalAmount);
    });

    const totalUniqueAttendees = attendeeEventMap.size;
    const returningAttendees = Array.from(attendeeEventMap.values()).filter(events => events.length > 1).length;
    const retentionRate = totalUniqueAttendees > 0 ? (returningAttendees / totalUniqueAttendees) * 100 : 0;

    const crossEventAttendance = Array.from(attendeeEventMap.entries()).map(([attendeeId, events]) => ({
      attendeeId,
      eventCount: events.length,
      events,
      totalSpent: attendeeSpendMap.get(attendeeId) || 0
    }));

    return {
      totalUniqueAttendees,
      returningAttendees,
      retentionRate,
      crossEventAttendance,
      loyaltySegments: this.calculateLoyaltySegments(crossEventAttendance)
    };
  }

  // Generate predictive insights and recommendations
  getPredictiveInsights(): PredictiveInsights {
    const venueAnalysis = this.analyzeVenuePerformance();
    const seasonalAnalysis = this.analyzeSeasonalPatterns();
    const pricingAnalysis = this.analyzePricingEffectiveness();

    return {
      recommendations: this.generateRecommendations(venueAnalysis, seasonalAnalysis, pricingAnalysis),
      optimalParameters: {
        bestVenues: venueAnalysis.slice(0, 3).map(v => v.venue),
        optimalPricing: this.calculateOptimalPricing(),
        bestTimeSlots: this.findOptimalTiming().slice(0, 3).map(t => `${t.dayOfWeek} ${t.timeOfDay}`),
        topCategories: this.getTopCategories()
      },
      forecasts: this.generateForecasts()
    };
  }

  // Export data in various formats
  async exportMultiEventReport(format: 'csv' | 'excel' | 'pdf'): Promise<Blob> {
    const metrics = this.getMultiEventMetrics();
    const trends = this.getTrendAnalysis();
    const insights = this.getPredictiveInsights();

    switch (format) {
      case 'csv':
        return this.exportToCSV(metrics, trends);
      case 'excel':
        return this.exportToExcel(metrics, trends, insights);
      case 'pdf':
        return this.exportToPDF(metrics, trends, insights);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  // Private helper methods
  private async fetchOrganizerEvents(organizerId: string): Promise<Event[]> {
    // Mock data - in real implementation, this would be an API call
    return [
      {
        id: '1',
        title: 'Summer Dance Workshop',
        description: 'Intensive dance workshop',
        category: 'dance',
        date: '2024-07-15',
        time: '18:00',
        venue: 'Studio A',
        address: '123 Main St',
        capacity: 50,
        ticketsSold: 45,
        organizerId,
        status: 'published',
        images: [],
        tags: ['dance', 'workshop']
      },
      {
        id: '2',
        title: 'Autumn Stepping Intensive',
        description: 'Advanced stepping techniques',
        category: 'stepping',
        date: '2024-09-20',
        time: '19:00',
        venue: 'Dance Hall B',
        address: '456 Oak Ave',
        capacity: 80,
        ticketsSold: 75,
        organizerId,
        status: 'published',
        images: [],
        tags: ['stepping', 'intensive']
      }
    ];
  }

  private async fetchEventAttendees(organizerId: string): Promise<Attendee[]> {
    // Mock data
    return [];
  }

  private async fetchEventPurchases(organizerId: string): Promise<TicketPurchase[]> {
    // Mock data
    return [
      {
        id: '1',
        eventId: '1',
        buyerId: 'buyer1',
        tickets: [{ id: '1', type: 'general', price: 25 }],
        totalAmount: 25,
        purchaseDate: '2024-07-10',
        status: 'confirmed'
      },
      {
        id: '2',
        eventId: '2',
        buyerId: 'buyer2',
        tickets: [{ id: '2', type: 'vip', price: 45 }],
        totalAmount: 45,
        purchaseDate: '2024-09-15',
        status: 'confirmed'
      }
    ];
  }

  private getEventPerformance(eventId: string): EventPerformance {
    const event = this.events.find(e => e.id === eventId);
    if (!event) throw new Error(`Event ${eventId} not found`);

    const eventPurchases = this.purchases.filter(p => p.eventId === eventId);
    const revenue = eventPurchases.reduce((sum, p) => sum + p.totalAmount, 0);
    const ticketsSold = eventPurchases.reduce((sum, p) => sum + p.tickets.length, 0);

    return {
      eventId: event.id,
      title: event.title,
      date: event.date,
      venue: event.venue,
      category: event.category,
      ticketsSold,
      capacity: event.capacity,
      revenue,
      attendanceRate: event.capacity > 0 ? (ticketsSold / event.capacity) * 100 : 0,
      checkinRate: 85, // Mock data
      averageTicketPrice: ticketsSold > 0 ? revenue / ticketsSold : 0,
      profitMargin: 30 // Mock data
    };
  }

  private calculatePerformanceScore(performance: EventPerformance): number {
    // Weighted score based on multiple factors
    const attendanceWeight = 0.3;
    const revenueWeight = 0.4;
    const profitWeight = 0.3;

    const attendanceScore = performance.attendanceRate;
    const revenueScore = Math.min(performance.revenue / 1000, 100); // Normalize to 100
    const profitScore = performance.profitMargin;

    return (attendanceScore * attendanceWeight + revenueScore * revenueWeight + profitScore * profitWeight);
  }

  private calculateMonthlyRevenue(): { month: string; revenue: number; }[] {
    const monthlyData = new Map<string, number>();

    this.purchases.forEach(purchase => {
      const month = new Date(purchase.purchaseDate).toISOString().substring(0, 7);
      const current = monthlyData.get(month) || 0;
      monthlyData.set(month, current + purchase.totalAmount);
    });

    return Array.from(monthlyData.entries()).map(([month, revenue]) => ({ month, revenue }));
  }

  private calculateTicketTypeDistribution(): { type: string; count: number; percentage: number; }[] {
    const typeCount = new Map<string, number>();
    let totalTickets = 0;

    this.purchases.forEach(purchase => {
      purchase.tickets.forEach(ticket => {
        const current = typeCount.get(ticket.type) || 0;
        typeCount.set(ticket.type, current + 1);
        totalTickets++;
      });
    });

    return Array.from(typeCount.entries()).map(([type, count]) => ({
      type,
      count,
      percentage: totalTickets > 0 ? (count / totalTickets) * 100 : 0
    }));
  }

  private getTopPerformingEvents(limit: number): EventPerformance[] {
    return this.events
      .map(event => this.getEventPerformance(event.id))
      .sort((a, b) => this.calculatePerformanceScore(b) - this.calculatePerformanceScore(a))
      .slice(0, limit);
  }

  private calculateAverageAttendanceRate(): number {
    if (this.events.length === 0) return 0;
    
    const totalAttendanceRate = this.events.reduce((sum, event) => {
      const performance = this.getEventPerformance(event.id);
      return sum + performance.attendanceRate;
    }, 0);

    return totalAttendanceRate / this.events.length;
  }

  private calculateRevenueGrowth(): number {
    // Mock implementation - would calculate based on time periods
    return 15.5; // 15.5% growth
  }

  private calculateAttendanceGrowth(): number {
    // Mock implementation
    return 12.3; // 12.3% growth
  }

  private analyzeSeasonalPatterns(): TrendAnalysis['seasonalPatterns'] {
    // Mock implementation
    return [
      { season: 'Spring', averageRevenue: 1200, averageAttendance: 45, eventCount: 3 },
      { season: 'Summer', averageRevenue: 1500, averageAttendance: 55, eventCount: 4 },
      { season: 'Fall', averageRevenue: 1800, averageAttendance: 65, eventCount: 5 },
      { season: 'Winter', averageRevenue: 1000, averageAttendance: 35, eventCount: 2 }
    ];
  }

  private analyzeVenuePerformance(): TrendAnalysis['venuePerformance'] {
    // Mock implementation
    return [
      { venue: 'Studio A', eventCount: 5, averageRevenue: 1400, averageAttendance: 50, successRate: 95 },
      { venue: 'Dance Hall B', eventCount: 3, averageRevenue: 1600, averageAttendance: 60, successRate: 88 }
    ];
  }

  private findOptimalTiming(): TrendAnalysis['optimalTiming'] {
    // Mock implementation
    return [
      { dayOfWeek: 'Saturday', timeOfDay: 'Evening', averagePerformance: 85 },
      { dayOfWeek: 'Friday', timeOfDay: 'Evening', averagePerformance: 78 },
      { dayOfWeek: 'Sunday', timeOfDay: 'Afternoon', averagePerformance: 72 }
    ];
  }

  private calculateLoyaltySegments(crossEventAttendance: AudienceOverlap['crossEventAttendance']): AudienceOverlap['loyaltySegments'] {
    // Mock implementation
    return [
      { segment: 'VIP Loyalists', count: 15, averageSpend: 150, eventFrequency: 5.2 },
      { segment: 'Regular Attendees', count: 45, averageSpend: 75, eventFrequency: 2.8 },
      { segment: 'Occasional Visitors', count: 120, averageSpend: 35, eventFrequency: 1.2 }
    ];
  }

  private analyzePricingEffectiveness(): any {
    // Mock implementation
    return { optimalRange: { min: 20, max: 50 }, elasticity: 0.75 };
  }

  private generateRecommendations(venueAnalysis: any, seasonalAnalysis: any, pricingAnalysis: any): PredictiveInsights['recommendations'] {
    return [
      {
        type: 'venue',
        title: 'Focus on High-Performing Venues',
        description: 'Studio A shows 95% success rate. Consider booking more events there.',
        impact: 'high',
        confidence: 0.92
      },
      {
        type: 'timing',
        title: 'Optimize Event Scheduling',
        description: 'Saturday evenings show 15% higher attendance than other time slots.',
        impact: 'medium',
        confidence: 0.78
      },
      {
        type: 'pricing',
        title: 'Adjust Pricing Strategy',
        description: 'Optimal price range appears to be $25-$45 based on demand elasticity.',
        impact: 'high',
        confidence: 0.85
      }
    ];
  }

  private calculateOptimalPricing(): { min: number; max: number; optimal: number; } {
    return { min: 25, max: 45, optimal: 35 };
  }

  private getTopCategories(): string[] {
    return ['dance', 'stepping', 'workshop'];
  }

  private generateForecasts(): PredictiveInsights['forecasts'] {
    return {
      nextEventRevenue: 1650,
      expectedAttendance: 58,
      confidenceInterval: { min: 1400, max: 1900 }
    };
  }

  private exportToCSV(metrics: MultiEventMetrics, trends: TrendAnalysis): Blob {
    // Mock implementation
    const csvContent = 'Event,Revenue,Attendance\nMock Event,1000,50';
    return new Blob([csvContent], { type: 'text/csv' });
  }

  private exportToExcel(metrics: MultiEventMetrics, trends: TrendAnalysis, insights: PredictiveInsights): Blob {
    // Mock implementation
    return new Blob(['Mock Excel Data'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  }

  private exportToPDF(metrics: MultiEventMetrics, trends: TrendAnalysis, insights: PredictiveInsights): Blob {
    // Mock implementation
    return new Blob(['Mock PDF Data'], { type: 'application/pdf' });
  }
}

export const multiEventAnalyticsService = new MultiEventAnalyticsService(); 