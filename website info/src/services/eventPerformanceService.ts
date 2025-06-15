import { Event, TicketPurchase, CheckinRecord } from '../types';

export interface EventPerformanceData {
  eventId: string;
  overview: EventOverview;
  ticketSales: TicketSalesMetrics;
  revenue: RevenueAnalytics;
  attendees: AttendeeMetrics;
  salesTrends: SalesTrendData[];
  salesChannels: SalesChannelBreakdown[];
  geographic: GeographicData;
  timeAnalytics: TimeAnalytics;
  comparisons: ComparisonData;
  lastUpdated: Date;
}

export interface EventOverview {
  eventName: string;
  eventDate: Date;
  venue: string;
  totalCapacity: number;
  ticketsSold: number;
  revenue: number;
  checkedIn: number;
  salesVelocity: number;
  performanceScore: number;
  status: 'planning' | 'selling' | 'ongoing' | 'completed';
}

export interface TicketSalesMetrics {
  totalSold: number;
  totalCapacity: number;
  salesRate: number;
  byType: {
    ticketType: string;
    sold: number;
    capacity: number;
    price: number;
    revenue: number;
  }[];
  recentSales: {
    count: number;
    period: string;
  };
}

export interface RevenueAnalytics {
  grossRevenue: number;
  netRevenue: number;
  fees: number;
  refunds: number;
  commissions: number;
  projectedRevenue: number;
  revenueByType: {
    ticketType: string;
    revenue: number;
    percentage: number;
  }[];
}

export interface AttendeeMetrics {
  totalAttendees: number;
  checkedIn: number;
  checkinRate: number;
  noShows: number;
  demographics: {
    ageGroups: { range: string; count: number; percentage: number }[];
    genderDistribution: { gender: string; count: number; percentage: number }[];
    returningCustomers: number;
    newCustomers: number;
  };
  satisfaction: {
    averageRating: number;
    totalReviews: number;
    ratingDistribution: { stars: number; count: number }[];
  };
}

export interface SalesTrendData {
  date: Date;
  ticketsSold: number;
  revenue: number;
  cumulativeTickets: number;
  cumulativeRevenue: number;
}

export interface SalesChannelBreakdown {
  channel: 'online' | 'cash' | 'agent' | 'comp';
  ticketsSold: number;
  revenue: number;
  percentage: number;
  averageOrderValue: number;
}

export interface GeographicData {
  topCities: { city: string; count: number; percentage: number }[];
  topStates: { state: string; count: number; percentage: number }[];
  distanceAnalysis: {
    local: number; // < 25 miles
    regional: number; // 25-100 miles
    distant: number; // > 100 miles
  };
}

export interface TimeAnalytics {
  peakSalesPeriods: { period: string; sales: number }[];
  checkinPatterns: { time: string; checkins: number }[];
  salesByDayOfWeek: { day: string; sales: number }[];
  salesByHour: { hour: number; sales: number }[];
}

export interface ComparisonData {
  previousEvents: {
    eventName: string;
    ticketsSold: number;
    revenue: number;
    checkinRate: number;
    satisfaction: number;
  }[];
  industryBenchmarks: {
    averageAttendance: number;
    averageRevenue: number;
    averageCheckinRate: number;
    averageSatisfaction: number;
  };
  performanceVsPrevious: {
    ticketSales: number; // percentage change
    revenue: number;
    checkinRate: number;
    satisfaction: number;
  };
}

class EventPerformanceService {
  private performanceData: Map<string, EventPerformanceData> = new Map();

  async getEventPerformance(eventId: string): Promise<EventPerformanceData> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));

    if (this.performanceData.has(eventId)) {
      const data = this.performanceData.get(eventId)!;
      // Update with real-time data
      return this.updateRealTimeData(data);
    }

    // Generate mock data for demo
    const performanceData = this.generateMockPerformanceData(eventId);
    this.performanceData.set(eventId, performanceData);
    return performanceData;
  }

  async getMultiEventComparison(eventIds: string[]): Promise<ComparisonData> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const events = await Promise.all(
      eventIds.map(id => this.getEventPerformance(id))
    );

    return {
      previousEvents: events.map(event => ({
        eventName: event.overview.eventName,
        ticketsSold: event.overview.ticketsSold,
        revenue: event.overview.revenue,
        checkinRate: event.attendees.checkinRate,
        satisfaction: event.attendees.satisfaction.averageRating
      })),
      industryBenchmarks: {
        averageAttendance: 75,
        averageRevenue: 15000,
        averageCheckinRate: 85,
        averageSatisfaction: 4.2
      },
      performanceVsPrevious: {
        ticketSales: 15.5,
        revenue: 22.3,
        checkinRate: -2.1,
        satisfaction: 8.7
      }
    };
  }

  async exportPerformanceData(
    eventId: string, 
    format: 'pdf' | 'csv' | 'json'
  ): Promise<Blob> {
    const data = await this.getEventPerformance(eventId);
    
    switch (format) {
      case 'csv':
        return this.exportAsCSV(data);
      case 'json':
        return new Blob([JSON.stringify(data, null, 2)], { 
          type: 'application/json' 
        });
      case 'pdf':
        return this.exportAsPDF(data);
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  private updateRealTimeData(data: EventPerformanceData): EventPerformanceData {
    // Simulate real-time updates
    const now = new Date();
    const minutesSinceUpdate = Math.floor(
      (now.getTime() - data.lastUpdated.getTime()) / (1000 * 60)
    );

    if (minutesSinceUpdate > 0) {
      // Add some random sales activity
      const newSales = Math.floor(Math.random() * 3);
      data.overview.ticketsSold += newSales;
      data.overview.revenue += newSales * 50;
      data.ticketSales.totalSold += newSales;
      
      // Update sales trends
      const latestTrend = data.salesTrends[data.salesTrends.length - 1];
      if (latestTrend) {
        latestTrend.ticketsSold += newSales;
        latestTrend.revenue += newSales * 50;
        latestTrend.cumulativeTickets = data.overview.ticketsSold;
        latestTrend.cumulativeRevenue = data.overview.revenue;
      }

      data.lastUpdated = now;
    }

    return data;
  }

  private generateMockPerformanceData(eventId: string): EventPerformanceData {
    const eventNames = [
      'Advanced Salsa Workshop',
      'Bachata Social Night',
      'Kizomba Masterclass',
      'Latin Dance Festival',
      'Merengue Beginners Class'
    ];

    const eventName = eventNames[Math.floor(Math.random() * eventNames.length)];
    const capacity = 100 + Math.floor(Math.random() * 200);
    const ticketsSold = Math.floor(capacity * (0.6 + Math.random() * 0.3));
    const avgPrice = 25 + Math.random() * 25;
    const revenue = ticketsSold * avgPrice;
    const checkedIn = Math.floor(ticketsSold * (0.8 + Math.random() * 0.15));

    return {
      eventId,
      overview: {
        eventName,
        eventDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000),
        venue: 'Dance Studio Miami',
        totalCapacity: capacity,
        ticketsSold,
        revenue,
        checkedIn,
        salesVelocity: Math.random() * 10,
        performanceScore: 75 + Math.random() * 20,
        status: Math.random() > 0.5 ? 'selling' : 'completed'
      },
      ticketSales: this.generateTicketSalesMetrics(capacity, ticketsSold),
      revenue: this.generateRevenueAnalytics(revenue),
      attendees: this.generateAttendeeMetrics(ticketsSold, checkedIn),
      salesTrends: this.generateSalesTrends(ticketsSold, revenue),
      salesChannels: this.generateSalesChannels(ticketsSold, revenue),
      geographic: this.generateGeographicData(),
      timeAnalytics: this.generateTimeAnalytics(),
      comparisons: {
        previousEvents: [],
        industryBenchmarks: {
          averageAttendance: 75,
          averageRevenue: 15000,
          averageCheckinRate: 85,
          averageSatisfaction: 4.2
        },
        performanceVsPrevious: {
          ticketSales: 15.5,
          revenue: 22.3,
          checkinRate: -2.1,
          satisfaction: 8.7
        }
      },
      lastUpdated: new Date()
    };
  }

  private generateTicketSalesMetrics(capacity: number, sold: number): TicketSalesMetrics {
    const types = [
      { name: 'General Admission', percentage: 0.6 },
      { name: 'VIP', percentage: 0.2 },
      { name: 'Student', percentage: 0.2 }
    ];

    return {
      totalSold: sold,
      totalCapacity: capacity,
      salesRate: (sold / capacity) * 100,
      byType: types.map(type => {
        const typeSold = Math.floor(sold * type.percentage);
        const typeCapacity = Math.floor(capacity * type.percentage);
        const price = type.name === 'VIP' ? 50 : type.name === 'Student' ? 15 : 25;
        return {
          ticketType: type.name,
          sold: typeSold,
          capacity: typeCapacity,
          price,
          revenue: typeSold * price
        };
      }),
      recentSales: {
        count: Math.floor(Math.random() * 20),
        period: 'last 24 hours'
      }
    };
  }

  private generateRevenueAnalytics(grossRevenue: number): RevenueAnalytics {
    const fees = grossRevenue * 0.05;
    const refunds = grossRevenue * 0.02;
    const commissions = grossRevenue * 0.03;

    return {
      grossRevenue,
      netRevenue: grossRevenue - fees - refunds - commissions,
      fees,
      refunds,
      commissions,
      projectedRevenue: grossRevenue * 1.15,
      revenueByType: [
        { ticketType: 'General Admission', revenue: grossRevenue * 0.6, percentage: 60 },
        { ticketType: 'VIP', revenue: grossRevenue * 0.3, percentage: 30 },
        { ticketType: 'Student', revenue: grossRevenue * 0.1, percentage: 10 }
      ]
    };
  }

  private generateAttendeeMetrics(totalAttendees: number, checkedIn: number): AttendeeMetrics {
    return {
      totalAttendees,
      checkedIn,
      checkinRate: (checkedIn / totalAttendees) * 100,
      noShows: totalAttendees - checkedIn,
      demographics: {
        ageGroups: [
          { range: '18-25', count: Math.floor(totalAttendees * 0.3), percentage: 30 },
          { range: '26-35', count: Math.floor(totalAttendees * 0.4), percentage: 40 },
          { range: '36-45', count: Math.floor(totalAttendees * 0.2), percentage: 20 },
          { range: '46+', count: Math.floor(totalAttendees * 0.1), percentage: 10 }
        ],
        genderDistribution: [
          { gender: 'Female', count: Math.floor(totalAttendees * 0.6), percentage: 60 },
          { gender: 'Male', count: Math.floor(totalAttendees * 0.35), percentage: 35 },
          { gender: 'Other', count: Math.floor(totalAttendees * 0.05), percentage: 5 }
        ],
        returningCustomers: Math.floor(totalAttendees * 0.4),
        newCustomers: Math.floor(totalAttendees * 0.6)
      },
      satisfaction: {
        averageRating: 4.2 + Math.random() * 0.6,
        totalReviews: Math.floor(checkedIn * 0.3),
        ratingDistribution: [
          { stars: 5, count: Math.floor(checkedIn * 0.15) },
          { stars: 4, count: Math.floor(checkedIn * 0.12) },
          { stars: 3, count: Math.floor(checkedIn * 0.03) },
          { stars: 2, count: Math.floor(checkedIn * 0.005) },
          { stars: 1, count: Math.floor(checkedIn * 0.005) }
        ]
      }
    };
  }

  private generateSalesTrends(totalSold: number, totalRevenue: number): SalesTrendData[] {
    const trends: SalesTrendData[] = [];
    const days = 30;
    let cumulativeTickets = 0;
    let cumulativeRevenue = 0;

    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const dailySales = Math.floor((totalSold / days) * (0.5 + Math.random()));
      const dailyRevenue = Math.floor((totalRevenue / days) * (0.5 + Math.random()));
      
      cumulativeTickets += dailySales;
      cumulativeRevenue += dailyRevenue;

      trends.push({
        date,
        ticketsSold: dailySales,
        revenue: dailyRevenue,
        cumulativeTickets,
        cumulativeRevenue
      });
    }

    return trends;
  }

  private generateSalesChannels(totalSold: number, totalRevenue: number): SalesChannelBreakdown[] {
    return [
      {
        channel: 'online',
        ticketsSold: Math.floor(totalSold * 0.7),
        revenue: Math.floor(totalRevenue * 0.7),
        percentage: 70,
        averageOrderValue: 35
      },
      {
        channel: 'cash',
        ticketsSold: Math.floor(totalSold * 0.2),
        revenue: Math.floor(totalRevenue * 0.2),
        percentage: 20,
        averageOrderValue: 25
      },
      {
        channel: 'agent',
        ticketsSold: Math.floor(totalSold * 0.08),
        revenue: Math.floor(totalRevenue * 0.08),
        percentage: 8,
        averageOrderValue: 30
      },
      {
        channel: 'comp',
        ticketsSold: Math.floor(totalSold * 0.02),
        revenue: 0,
        percentage: 2,
        averageOrderValue: 0
      }
    ];
  }

  private generateGeographicData(): GeographicData {
    return {
      topCities: [
        { city: 'Miami', count: 45, percentage: 45 },
        { city: 'Fort Lauderdale', count: 20, percentage: 20 },
        { city: 'Hialeah', count: 15, percentage: 15 },
        { city: 'Coral Gables', count: 12, percentage: 12 },
        { city: 'Homestead', count: 8, percentage: 8 }
      ],
      topStates: [
        { state: 'Florida', count: 85, percentage: 85 },
        { state: 'Georgia', count: 8, percentage: 8 },
        { state: 'North Carolina', count: 4, percentage: 4 },
        { state: 'New York', count: 3, percentage: 3 }
      ],
      distanceAnalysis: {
        local: 70,
        regional: 25,
        distant: 5
      }
    };
  }

  private generateTimeAnalytics(): TimeAnalytics {
    return {
      peakSalesPeriods: [
        { period: 'Monday 6-8 PM', sales: 25 },
        { period: 'Wednesday 7-9 PM', sales: 30 },
        { period: 'Saturday 2-4 PM', sales: 45 },
        { period: 'Sunday 12-2 PM', sales: 20 }
      ],
      checkinPatterns: [
        { time: '6:00 PM', checkins: 15 },
        { time: '6:30 PM', checkins: 35 },
        { time: '7:00 PM', checkins: 25 },
        { time: '7:30 PM', checkins: 15 },
        { time: '8:00 PM', checkins: 10 }
      ],
      salesByDayOfWeek: [
        { day: 'Monday', sales: 20 },
        { day: 'Tuesday', sales: 15 },
        { day: 'Wednesday', sales: 25 },
        { day: 'Thursday', sales: 18 },
        { day: 'Friday', sales: 30 },
        { day: 'Saturday', sales: 40 },
        { day: 'Sunday', sales: 22 }
      ],
      salesByHour: Array.from({ length: 24 }, (_, hour) => ({
        hour,
        sales: hour >= 6 && hour <= 22 ? Math.floor(Math.random() * 20) : Math.floor(Math.random() * 5)
      }))
    };
  }

  private exportAsCSV(data: EventPerformanceData): Blob {
    const csvContent = [
      'Event Performance Report',
      `Event: ${data.overview.eventName}`,
      `Date: ${data.overview.eventDate.toLocaleDateString()}`,
      '',
      'Overview',
      'Metric,Value',
      `Total Capacity,${data.overview.totalCapacity}`,
      `Tickets Sold,${data.overview.ticketsSold}`,
      `Revenue,$${data.overview.revenue.toFixed(2)}`,
      `Check-in Rate,${data.attendees.checkinRate.toFixed(1)}%`,
      '',
      'Ticket Sales by Type',
      'Type,Sold,Capacity,Price,Revenue',
      ...data.ticketSales.byType.map(t => 
        `${t.ticketType},${t.sold},${t.capacity},$${t.price},$${t.revenue.toFixed(2)}`
      ),
      '',
      'Sales Channels',
      'Channel,Tickets,Revenue,Percentage',
      ...data.salesChannels.map(c => 
        `${c.channel},${c.ticketsSold},$${c.revenue.toFixed(2)},${c.percentage}%`
      )
    ].join('\n');

    return new Blob([csvContent], { type: 'text/csv' });
  }

  private exportAsPDF(data: EventPerformanceData): Blob {
    // Mock PDF generation - in real implementation, use a library like jsPDF
    const pdfContent = `Event Performance Report - ${data.overview.eventName}`;
    return new Blob([pdfContent], { type: 'application/pdf' });
  }
}

export const eventPerformanceService = new EventPerformanceService(); 