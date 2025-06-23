// Comparative Analytics Service - E.007 Implementation
// Provides comprehensive event comparison, benchmarking, and performance analysis

export interface EventMetrics {
  eventId: string;
  eventName: string;
  totalRevenue: number;
  totalTicketsSold: number;
  totalAttendees: number;
  averageTicketPrice: number;
  checkInRate: number;
  conversionRate: number;
  marketingSpend: number;
  profitMargin: number;
  customerSatisfaction: number;
  repeatCustomerRate: number;
  socialMediaEngagement: number;
  date: string;
  venue: string;
  eventType: string;
  capacity: number;
}

export interface BenchmarkData {
  metric: string;
  userValue: number;
  industryAverage: number;
  percentile: number;
  bestInClass: number;
  worstInClass: number;
  trend: 'up' | 'down' | 'stable';
}

export interface ComparisonInsight {
  id: string;
  type: 'opportunity' | 'warning' | 'success' | 'info';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
  recommendation?: string;
}

export interface PerformanceScore {
  overall: number;
  revenue: number;
  attendance: number;
  efficiency: number;
  satisfaction: number;
  growth: number;
  breakdown: {
    category: string;
    score: number;
    weight: number;
    contribution: number;
  }[];
}

export interface TrendAnalysis {
  metric: string;
  timeSeriesData: { date: string; value: number }[];
  trend: 'increasing' | 'decreasing' | 'stable' | 'volatile';
  growthRate: number;
  volatility: number;
  seasonality: boolean;
  forecast: { date: string; predicted: number; confidence: number }[];
}

export interface SeasonalPattern {
  period: string;
  averagePerformance: number;
  peakMonths: string[];
  lowMonths: string[];
  recommendations: string[];
}

export interface VenueComparison {
  venue: string;
  averageRevenue: number;
  averageAttendance: number;
  costEfficiency: number;
  customerSatisfaction: number;
  bookingFrequency: number;
  roi: number;
}

export interface TeamPerformanceMetrics {
  staffConfiguration: string;
  averageRevenue: number;
  customerSatisfaction: number;
  operationalEfficiency: number;
  costPerEvent: number;
  incidentRate: number;
  recommendations: string[];
}

class ComparativeAnalyticsService {
  private mockEvents: EventMetrics[] = [
    {
      eventId: '1',
      eventName: 'Summer Fitness Bootcamp',
      totalRevenue: 15000,
      totalTicketsSold: 150,
      totalAttendees: 142,
      averageTicketPrice: 100,
      checkInRate: 94.7,
      conversionRate: 12.5,
      marketingSpend: 2000,
      profitMargin: 65,
      customerSatisfaction: 4.7,
      repeatCustomerRate: 35,
      socialMediaEngagement: 850,
      date: '2024-06-15',
      venue: 'Central Park Pavilion',
      eventType: 'Fitness',
      capacity: 200
    },
    {
      eventId: '2',
      eventName: 'Winter Wellness Workshop',
      totalRevenue: 8500,
      totalTicketsSold: 85,
      totalAttendees: 80,
      averageTicketPrice: 100,
      checkInRate: 94.1,
      conversionRate: 8.3,
      marketingSpend: 1200,
      profitMargin: 72,
      customerSatisfaction: 4.5,
      repeatCustomerRate: 28,
      socialMediaEngagement: 420,
      date: '2024-01-20',
      venue: 'Downtown Studio',
      eventType: 'Wellness',
      capacity: 100
    },
    {
      eventId: '3',
      eventName: 'Spring Dance Marathon',
      totalRevenue: 22000,
      totalTicketsSold: 220,
      totalAttendees: 208,
      averageTicketPrice: 100,
      checkInRate: 94.5,
      conversionRate: 15.2,
      marketingSpend: 3500,
      profitMargin: 58,
      customerSatisfaction: 4.8,
      repeatCustomerRate: 45,
      socialMediaEngagement: 1250,
      date: '2024-03-25',
      venue: 'Grand Ballroom',
      eventType: 'Dance',
      capacity: 300
    }
  ];

  private industryBenchmarks: BenchmarkData[] = [
    {
      metric: 'Revenue per Event',
      userValue: 15167,
      industryAverage: 12500,
      percentile: 75,
      bestInClass: 25000,
      worstInClass: 5000,
      trend: 'up'
    },
    {
      metric: 'Check-in Rate',
      userValue: 94.4,
      industryAverage: 89.2,
      percentile: 82,
      bestInClass: 98.5,
      worstInClass: 75.0,
      trend: 'stable'
    },
    {
      metric: 'Customer Satisfaction',
      userValue: 4.67,
      industryAverage: 4.2,
      percentile: 88,
      bestInClass: 4.9,
      worstInClass: 3.5,
      trend: 'up'
    },
    {
      metric: 'Profit Margin',
      userValue: 65,
      industryAverage: 55,
      percentile: 79,
      bestInClass: 85,
      worstInClass: 25,
      trend: 'stable'
    }
  ];

  async getEventMetrics(eventIds?: string[]): Promise<EventMetrics[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (eventIds) {
      return this.mockEvents.filter(event => eventIds.includes(event.eventId));
    }
    return this.mockEvents;
  }

  async compareEvents(eventIds: string[]): Promise<{
    events: EventMetrics[];
    differences: Record<string, number>;
    insights: ComparisonInsight[];
  }> {
    const events = await this.getEventMetrics(eventIds);
    
    if (events.length < 2) {
      throw new Error('At least 2 events required for comparison');
    }

    // Calculate differences between first two events
    const [event1, event2] = events;
    const differences = {
      revenue: ((event1.totalRevenue - event2.totalRevenue) / event2.totalRevenue) * 100,
      attendance: ((event1.totalAttendees - event2.totalAttendees) / event2.totalAttendees) * 100,
      checkInRate: event1.checkInRate - event2.checkInRate,
      satisfaction: event1.customerSatisfaction - event2.customerSatisfaction,
      profitMargin: event1.profitMargin - event2.profitMargin
    };

    const insights: ComparisonInsight[] = [
      {
        id: '1',
        type: differences.revenue > 10 ? 'success' : differences.revenue < -10 ? 'warning' : 'info',
        title: 'Revenue Performance',
        description: `${event1.eventName} generated ${Math.abs(differences.revenue).toFixed(1)}% ${differences.revenue > 0 ? 'more' : 'less'} revenue than ${event2.eventName}`,
        impact: Math.abs(differences.revenue) > 20 ? 'high' : Math.abs(differences.revenue) > 10 ? 'medium' : 'low',
        actionable: true,
        recommendation: differences.revenue < 0 ? 'Analyze pricing strategy and marketing effectiveness' : 'Replicate successful strategies'
      },
      {
        id: '2',
        type: differences.satisfaction > 0.2 ? 'success' : differences.satisfaction < -0.2 ? 'warning' : 'info',
        title: 'Customer Satisfaction',
        description: `Customer satisfaction difference: ${differences.satisfaction > 0 ? '+' : ''}${differences.satisfaction.toFixed(2)} points`,
        impact: Math.abs(differences.satisfaction) > 0.3 ? 'high' : 'medium',
        actionable: true,
        recommendation: differences.satisfaction < 0 ? 'Review feedback and improve event experience' : 'Maintain current service quality'
      }
    ];

    return { events, differences, insights };
  }

  async getBenchmarkData(): Promise<BenchmarkData[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.industryBenchmarks;
  }

  async calculatePerformanceScore(eventId: string, weights?: Record<string, number>): Promise<PerformanceScore> {
    const defaultWeights = {
      revenue: 0.25,
      attendance: 0.20,
      efficiency: 0.15,
      satisfaction: 0.25,
      growth: 0.15
    };

    const scoreWeights = { ...defaultWeights, ...weights };
    const event = this.mockEvents.find(e => e.eventId === eventId);
    
    if (!event) {
      throw new Error('Event not found');
    }

    // Calculate individual scores (0-100)
    const revenueScore = Math.min(100, (event.totalRevenue / 30000) * 100);
    const attendanceScore = Math.min(100, (event.checkInRate / 100) * 100);
    const efficiencyScore = Math.min(100, (event.profitMargin / 80) * 100);
    const satisfactionScore = (event.customerSatisfaction / 5) * 100;
    const growthScore = Math.min(100, (event.repeatCustomerRate / 50) * 100);

    const breakdown = [
      { category: 'Revenue', score: revenueScore, weight: scoreWeights.revenue, contribution: revenueScore * scoreWeights.revenue },
      { category: 'Attendance', score: attendanceScore, weight: scoreWeights.attendance, contribution: attendanceScore * scoreWeights.attendance },
      { category: 'Efficiency', score: efficiencyScore, weight: scoreWeights.efficiency, contribution: efficiencyScore * scoreWeights.efficiency },
      { category: 'Satisfaction', score: satisfactionScore, weight: scoreWeights.satisfaction, contribution: satisfactionScore * scoreWeights.satisfaction },
      { category: 'Growth', score: growthScore, weight: scoreWeights.growth, contribution: growthScore * scoreWeights.growth }
    ];

    const overall = breakdown.reduce((sum, item) => sum + item.contribution, 0);

    return {
      overall,
      revenue: revenueScore,
      attendance: attendanceScore,
      efficiency: efficiencyScore,
      satisfaction: satisfactionScore,
      growth: growthScore,
      breakdown
    };
  }

  async getTrendAnalysis(metric: string, timeRange: string): Promise<TrendAnalysis> {
    await new Promise(resolve => setTimeout(resolve, 400));

    // Generate mock time series data
    const timeSeriesData = Array.from({ length: 12 }, (_, i) => ({
      date: new Date(2024, i, 1).toISOString().split('T')[0],
      value: Math.floor(Math.random() * 5000) + 10000 + (i * 500)
    }));

    const forecast = Array.from({ length: 3 }, (_, i) => ({
      date: new Date(2024, 12 + i, 1).toISOString().split('T')[0],
      predicted: timeSeriesData[timeSeriesData.length - 1].value + (i + 1) * 600,
      confidence: 0.85 - (i * 0.1)
    }));

    return {
      metric,
      timeSeriesData,
      trend: 'increasing',
      growthRate: 12.5,
      volatility: 8.3,
      seasonality: true,
      forecast
    };
  }

  async getSeasonalAnalysis(): Promise<SeasonalPattern[]> {
    await new Promise(resolve => setTimeout(resolve, 300));

    return [
      {
        period: 'Spring (Mar-May)',
        averagePerformance: 18500,
        peakMonths: ['March', 'April'],
        lowMonths: ['May'],
        recommendations: ['Focus on outdoor events', 'Leverage spring fitness trends']
      },
      {
        period: 'Summer (Jun-Aug)',
        averagePerformance: 16200,
        peakMonths: ['June', 'July'],
        lowMonths: ['August'],
        recommendations: ['Increase capacity for peak months', 'Plan vacation-proof events']
      },
      {
        period: 'Fall (Sep-Nov)',
        averagePerformance: 14800,
        peakMonths: ['September'],
        lowMonths: ['November'],
        recommendations: ['Back-to-routine marketing', 'Holiday season prep']
      },
      {
        period: 'Winter (Dec-Feb)',
        averagePerformance: 11200,
        peakMonths: ['January'],
        lowMonths: ['December', 'February'],
        recommendations: ['New Year motivation campaigns', 'Indoor venue focus']
      }
    ];
  }

  async getVenueComparison(): Promise<VenueComparison[]> {
    await new Promise(resolve => setTimeout(resolve, 400));

    return [
      {
        venue: 'Central Park Pavilion',
        averageRevenue: 15000,
        averageAttendance: 142,
        costEfficiency: 87,
        customerSatisfaction: 4.7,
        bookingFrequency: 8,
        roi: 650
      },
      {
        venue: 'Downtown Studio',
        averageRevenue: 8500,
        averageAttendance: 80,
        costEfficiency: 92,
        customerSatisfaction: 4.5,
        bookingFrequency: 12,
        roi: 580
      },
      {
        venue: 'Grand Ballroom',
        averageRevenue: 22000,
        averageAttendance: 208,
        costEfficiency: 78,
        customerSatisfaction: 4.8,
        bookingFrequency: 6,
        roi: 720
      }
    ];
  }

  async getTeamPerformanceAnalysis(): Promise<TeamPerformanceMetrics[]> {
    await new Promise(resolve => setTimeout(resolve, 350));

    return [
      {
        staffConfiguration: 'Full Service Team (5 staff)',
        averageRevenue: 18500,
        customerSatisfaction: 4.8,
        operationalEfficiency: 92,
        costPerEvent: 2500,
        incidentRate: 2,
        recommendations: ['Optimal for large events', 'Consider for premium experiences']
      },
      {
        staffConfiguration: 'Core Team (3 staff)',
        averageRevenue: 13200,
        customerSatisfaction: 4.5,
        operationalEfficiency: 88,
        costPerEvent: 1800,
        incidentRate: 5,
        recommendations: ['Best for medium events', 'Good cost-efficiency balance']
      },
      {
        staffConfiguration: 'Minimal Team (2 staff)',
        averageRevenue: 8900,
        customerSatisfaction: 4.2,
        operationalEfficiency: 82,
        costPerEvent: 1200,
        incidentRate: 8,
        recommendations: ['Suitable for small events', 'Monitor quality closely']
      }
    ];
  }

  async generateComparisonReport(eventIds: string[], includeForecasting: boolean = false): Promise<{
    summary: Record<string, any>;
    detailed: Record<string, any>;
    recommendations: string[];
  }> {
    const comparison = await this.compareEvents(eventIds);
    const benchmarks = await this.getBenchmarkData();
    
    const summary = {
      eventsCompared: comparison.events.length,
      topPerformer: comparison.events.reduce((top, event) => 
        event.totalRevenue > top.totalRevenue ? event : top
      ),
      keyInsights: comparison.insights.filter(i => i.impact === 'high').length,
      benchmarkPosition: 'Above Average'
    };

    const detailed = {
      events: comparison.events,
      differences: comparison.differences,
      benchmarks,
      insights: comparison.insights
    };

    const recommendations = [
      'Focus marketing spend on high-conversion events',
      'Replicate successful venue strategies',
      'Improve check-in processes for better attendance rates',
      'Leverage seasonal trends for optimal scheduling'
    ];

    return { summary, detailed, recommendations };
  }

  async exportComparisonData(format: 'csv' | 'excel' | 'pdf', eventIds: string[]): Promise<{
    data: any;
    filename: string;
    mimeType: string;
  }> {
    const comparison = await this.compareEvents(eventIds);
    
    const filename = `event-comparison-${new Date().toISOString().split('T')[0]}.${format}`;
    
    switch (format) {
      case 'csv':
        const csvData = comparison.events.map(event => ({
          'Event Name': event.eventName,
          'Revenue': event.totalRevenue,
          'Tickets Sold': event.totalTicketsSold,
          'Attendees': event.totalAttendees,
          'Check-in Rate': event.checkInRate,
          'Satisfaction': event.customerSatisfaction,
          'Profit Margin': event.profitMargin
        }));
        return {
          data: csvData,
          filename,
          mimeType: 'text/csv'
        };
        
      case 'excel':
        return {
          data: comparison,
          filename,
          mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        };
        
      case 'pdf':
        return {
          data: {
            title: 'Event Comparison Report',
            generatedAt: new Date().toISOString(),
            ...comparison
          },
          filename,
          mimeType: 'application/pdf'
        };
        
      default:
        throw new Error('Unsupported export format');
    }
  }
}

export const comparativeAnalyticsService = new ComparativeAnalyticsService();