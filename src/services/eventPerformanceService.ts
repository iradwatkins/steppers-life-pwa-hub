import { supabase } from '@/integrations/supabase/client';

export interface TicketSalesData {
  ticketType: string;
  sold: number;
  capacity: number;
  revenue: number;
  averagePrice: number;
}

export interface AttendeeEngagement {
  totalRegistered: number;
  checkedIn: number;
  checkInRate: number;
  noShows: number;
  lastHourCheckIns: number;
}

export interface SalesTrend {
  date: string;
  sales: number;
  revenue: number;
  cumulativeSales: number;
  cumulativeRevenue: number;
}

export interface GeographicData {
  city: string;
  state: string;
  country: string;
  attendeeCount: number;
  percentage: number;
}

export interface EventPerformanceMetrics {
  eventId: string;
  eventName: string;
  eventDate: string;
  totalCapacity: number;
  totalSold: number;
  totalRevenue: number;
  averageTicketPrice: number;
  checkInRate: number;
  ticketSales: TicketSalesData[];
  attendeeEngagement: AttendeeEngagement;
  salesTrends: SalesTrend[];
  geographicData: GeographicData[];
  salesChannels: {
    online: number;
    cash: number;
    promotional: number;
  };
  lastUpdated: string;
}

export interface PerformanceBenchmark {
  metric: string;
  current: number;
  historical: number;
  industry: number;
  performance: 'above' | 'below' | 'average';
}

export class EventPerformanceService {
  static async getEventPerformance(eventId: string): Promise<EventPerformanceMetrics> {
    try {
      // Get event details
      const { data: event, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (eventError) throw eventError;

      // Get ticket sales data
      const { data: tickets, error: ticketsError } = await supabase
        .from('ticket_purchases')
        .select(`
          *,
          ticket_types(*)
        `)
        .eq('event_id', eventId);

      if (ticketsError) throw ticketsError;

      // Get check-in data
      const { data: checkIns, error: checkInsError } = await supabase
        .from('event_check_ins')
        .select('*')
        .eq('event_id', eventId);

      if (checkInsError) throw checkInsError;

      // Process ticket sales by type
      const ticketSalesMap = new Map<string, TicketSalesData>();
      let totalRevenue = 0;
      let totalSold = 0;

      tickets?.forEach(ticket => {
        const typeName = ticket.ticket_types?.name || 'General';
        const price = ticket.total_amount || 0;
        
        if (!ticketSalesMap.has(typeName)) {
          ticketSalesMap.set(typeName, {
            ticketType: typeName,
            sold: 0,
            capacity: ticket.ticket_types?.quantity || 0,
            revenue: 0,
            averagePrice: 0
          });
        }

        const current = ticketSalesMap.get(typeName)!;
        current.sold += ticket.quantity || 1;
        current.revenue += price;
        current.averagePrice = current.revenue / current.sold;
        
        totalRevenue += price;
        totalSold += ticket.quantity || 1;
      });

      // Process attendee engagement
      const checkedInCount = checkIns?.length || 0;
      const attendeeEngagement: AttendeeEngagement = {
        totalRegistered: totalSold,
        checkedIn: checkedInCount,
        checkInRate: totalSold > 0 ? (checkedInCount / totalSold) * 100 : 0,
        noShows: totalSold - checkedInCount,
        lastHourCheckIns: checkIns?.filter(ci => 
          new Date(ci.checked_in_at).getTime() > Date.now() - 3600000
        ).length || 0
      };

      // Generate sales trends (mock data for now)
      const salesTrends: SalesTrend[] = this.generateSalesTrends(tickets || []);

      // Generate geographic data (mock data)
      const geographicData: GeographicData[] = this.generateGeographicData(tickets || []);

      return {
        eventId,
        eventName: event.title,
        eventDate: event.start_date,
        totalCapacity: event.capacity || 0,
        totalSold,
        totalRevenue,
        averageTicketPrice: totalSold > 0 ? totalRevenue / totalSold : 0,
        checkInRate: attendeeEngagement.checkInRate,
        ticketSales: Array.from(ticketSalesMap.values()),
        attendeeEngagement,
        salesTrends,
        geographicData,
        salesChannels: {
          online: Math.floor(totalSold * 0.8),
          cash: Math.floor(totalSold * 0.15),
          promotional: Math.floor(totalSold * 0.05)
        },
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching event performance:', error);
      throw error;
    }
  }

  static async getPerformanceBenchmarks(eventId: string): Promise<PerformanceBenchmark[]> {
    // Mock benchmark data - in production, this would compare against historical data
    return [
      {
        metric: 'Check-in Rate',
        current: 85,
        historical: 78,
        industry: 82,
        performance: 'above'
      },
      {
        metric: 'Revenue per Attendee',
        current: 45,
        historical: 42,
        industry: 40,
        performance: 'above'
      },
      {
        metric: 'Sales Velocity',
        current: 72,
        historical: 75,
        industry: 70,
        performance: 'below'
      }
    ];
  }

  private static generateSalesTrends(tickets: any[]): SalesTrend[] {
    const trendsMap = new Map<string, { sales: number; revenue: number }>();
    
    tickets.forEach(ticket => {
      const date = new Date(ticket.created_at).toISOString().split('T')[0];
      if (!trendsMap.has(date)) {
        trendsMap.set(date, { sales: 0, revenue: 0 });
      }
      const trend = trendsMap.get(date)!;
      trend.sales += ticket.quantity || 1;
      trend.revenue += ticket.total_amount || 0;
    });

    let cumulativeSales = 0;
    let cumulativeRevenue = 0;

    return Array.from(trendsMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => {
        cumulativeSales += data.sales;
        cumulativeRevenue += data.revenue;
        return {
          date,
          sales: data.sales,
          revenue: data.revenue,
          cumulativeSales,
          cumulativeRevenue
        };
      });
  }

  private static generateGeographicData(tickets: any[]): GeographicData[] {
    // Mock geographic data - in production, this would be based on user locations
    const mockData = [
      { city: 'Chicago', state: 'IL', country: 'US', attendeeCount: 0, percentage: 0 },
      { city: 'Milwaukee', state: 'WI', country: 'US', attendeeCount: 0, percentage: 0 },
      { city: 'Indianapolis', state: 'IN', country: 'US', attendeeCount: 0, percentage: 0 },
      { city: 'Detroit', state: 'MI', country: 'US', attendeeCount: 0, percentage: 0 }
    ];

    const totalTickets = tickets.length;
    if (totalTickets === 0) return mockData;

    // Distribute tickets across cities (mock distribution)
    mockData[0].attendeeCount = Math.floor(totalTickets * 0.6);
    mockData[1].attendeeCount = Math.floor(totalTickets * 0.2);
    mockData[2].attendeeCount = Math.floor(totalTickets * 0.15);
    mockData[3].attendeeCount = totalTickets - mockData[0].attendeeCount - mockData[1].attendeeCount - mockData[2].attendeeCount;

    mockData.forEach(item => {
      item.percentage = (item.attendeeCount / totalTickets) * 100;
    });

    return mockData.filter(item => item.attendeeCount > 0);
  }

  static async exportPerformanceData(eventId: string, format: 'csv' | 'json' | 'pdf'): Promise<string> {
    const data = await this.getEventPerformance(eventId);
    
    switch (format) {
      case 'csv':
        return this.exportToCSV(data);
      case 'json':
        return JSON.stringify(data, null, 2);
      case 'pdf':
        // PDF export would require additional library
        return 'PDF export not implemented yet';
      default:
        throw new Error('Unsupported format');
    }
  }

  private static exportToCSV(data: EventPerformanceMetrics): string {
    const rows = [
      ['Metric', 'Value'],
      ['Event Name', data.eventName],
      ['Total Capacity', data.totalCapacity.toString()],
      ['Total Sold', data.totalSold.toString()],
      ['Total Revenue', `$${data.totalRevenue.toFixed(2)}`],
      ['Average Ticket Price', `$${data.averageTicketPrice.toFixed(2)}`],
      ['Check-in Rate', `${data.checkInRate.toFixed(1)}%`],
      [''],
      ['Ticket Sales by Type'],
      ['Type', 'Sold', 'Revenue', 'Avg Price'],
      ...data.ticketSales.map(ts => [
        ts.ticketType,
        ts.sold.toString(),
        `$${ts.revenue.toFixed(2)}`,
        `$${ts.averagePrice.toFixed(2)}`
      ])
    ];

    return rows.map(row => row.join(',')).join('\n');
  }
}