import { SimpleEventEmitter } from './eventEmitter';

// Event Statistics Interface
export interface EventStatistics {
  eventId: string;
  eventName: string;
  eventDate: string;
  eventStartTime: string;
  eventEndTime: string;
  venue: string;
  
  // Core Metrics
  totalCapacity: number;
  ticketsSold: number;
  currentCheckins: number;
  currentAttendance: number;
  availableSpots: number;
  waitlistCount: number;
  
  // Percentages
  salesPercentage: number;
  checkinPercentage: number;
  capacityUtilization: number;
  
  // Revenue Metrics
  totalRevenue: number;
  averageTicketPrice: number;
  revenuePotential: number;
  
  // Time-based Metrics
  timeUntilEvent: number; // milliseconds
  isLive: boolean;
  isCompleted: boolean;
  checkinGateOpen: boolean;
  
  // Check-in Patterns
  peakArrivalTime?: string;
  currentArrivalRate: number; // per hour
  checkinVelocity: number; // per minute
  
  // Ticket Type Breakdown
  ticketTypeBreakdown: TicketTypeStats[];
  
  // Status Indicators
  statusColor: 'green' | 'yellow' | 'red';
  statusMessage: string;
  lastUpdated: string;
}

export interface TicketTypeStats {
  type: string;
  totalSold: number;
  checkedIn: number;
  checkinRate: number;
  revenue: number;
  averagePrice: number;
}

export interface HourlyPattern {
  hour: string;
  checkins: number;
  cumulative: number;
  arrivalRate: number;
}

export interface StatisticsAlert {
  id: string;
  eventId: string;
  type: 'capacity' | 'checkin_rate' | 'technical' | 'milestone';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  timestamp: string;
  acknowledged: boolean;
}

export interface MultiEventOverview {
  totalEvents: number;
  liveEvents: number;
  upcomingEvents: number;
  completedEvents: number;
  totalAttendees: number;
  totalRevenue: number;
  averageCapacityUtilization: number;
  events: EventStatistics[];
}

// Statistics Service Class
class PWAStatisticsService {
  private eventEmitter = new SimpleEventEmitter();
  private isOnline = navigator.onLine;
  private syncInProgress = false;
  private refreshInterval: NodeJS.Timeout | null = null;
  private readonly REFRESH_INTERVAL = 30000; // 30 seconds
  
  constructor() {
    this.setupNetworkListeners();
    this.startAutoRefresh();
  }

  private setupNetworkListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncOfflineData();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  private startAutoRefresh(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    
    this.refreshInterval = setInterval(() => {
      if (this.isOnline) {
        this.refreshAllStatistics();
      }
    }, this.REFRESH_INTERVAL);
  }

  private async refreshAllStatistics(): Promise<void> {
    try {
      // Emit refresh event for all active statistics
      this.eventEmitter.emit('statistics-refresh', {
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error refreshing statistics:', error);
    }
  }

  // Get comprehensive event statistics
  async getEventStatistics(eventId: string): Promise<EventStatistics> {
    try {
      const now = new Date();
      const mockEventDate = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours from now
      
      // Mock real-time statistics - in production, this would come from API
      const statistics: EventStatistics = {
        eventId,
        eventName: 'Step Into Salsa Night',
        eventDate: mockEventDate.toISOString().split('T')[0],
        eventStartTime: '19:00',
        eventEndTime: '23:00',
        venue: 'Downtown Dance Studio',
        
        totalCapacity: 150,
        ticketsSold: 127,
        currentCheckins: 89,
        currentAttendance: 89,
        availableSpots: 23,
        waitlistCount: 8,
        
        salesPercentage: 84.7,
        checkinPercentage: 70.1,
        capacityUtilization: 59.3,
        
        totalRevenue: 2540,
        averageTicketPrice: 20,
        revenuePotential: 3000,
        
        timeUntilEvent: mockEventDate.getTime() - now.getTime(),
        isLive: false,
        isCompleted: false,
        checkinGateOpen: true,
        
        currentArrivalRate: 12,
        checkinVelocity: 3.2,
        
        ticketTypeBreakdown: [
          {
            type: 'General Admission',
            totalSold: 87,
            checkedIn: 62,
            checkinRate: 71.3,
            revenue: 1740,
            averagePrice: 20
          },
          {
            type: 'VIP',
            totalSold: 25,
            checkedIn: 18,
            checkinRate: 72.0,
            revenue: 625,
            averagePrice: 25
          },
          {
            type: 'Student',
            totalSold: 15,
            checkedIn: 9,
            checkinRate: 60.0,
            revenue: 175,
            averagePrice: 12
          }
        ],
        
        statusColor: this.determineStatusColor(84.7, 70.1),
        statusMessage: this.generateStatusMessage(84.7, 70.1, false),
        lastUpdated: now.toISOString()
      };

      // Cache for offline access
      await this.cacheStatistics(eventId, statistics);
      
      return statistics;
    } catch (error) {
      console.error('Error fetching event statistics:', error);
      
      // Try to get cached data
      const cached = await this.getCachedStatistics(eventId);
      if (cached) {
        return cached;
      }
      
      throw error;
    }
  }

  // Get hourly check-in patterns
  async getHourlyPatterns(eventId: string): Promise<HourlyPattern[]> {
    // Mock hourly patterns - in production from API
    const patterns: HourlyPattern[] = [
      { hour: '18:00', checkins: 5, cumulative: 5, arrivalRate: 5 },
      { hour: '18:30', checkins: 12, cumulative: 17, arrivalRate: 24 },
      { hour: '19:00', checkins: 18, cumulative: 35, arrivalRate: 36 },
      { hour: '19:30', checkins: 24, cumulative: 59, arrivalRate: 48 },
      { hour: '20:00', checkins: 20, cumulative: 79, arrivalRate: 40 },
      { hour: '20:30', checkins: 10, cumulative: 89, arrivalRate: 20 }
    ];
    
    return patterns;
  }

  // Get multi-event overview
  async getMultiEventOverview(organizerId: string): Promise<MultiEventOverview> {
    try {
      // Mock multi-event data - in production from API
      const overview: MultiEventOverview = {
        totalEvents: 5,
        liveEvents: 1,
        upcomingEvents: 3,
        completedEvents: 1,
        totalAttendees: 423,
        totalRevenue: 8460,
        averageCapacityUtilization: 78.5,
        events: []
      };

      // Get individual event statistics
      const eventIds = ['event-1', 'event-2', 'event-3'];
      for (const eventId of eventIds) {
        const stats = await this.getEventStatistics(eventId);
        overview.events.push(stats);
      }

      return overview;
    } catch (error) {
      console.error('Error fetching multi-event overview:', error);
      throw error;
    }
  }

  // Get real-time alerts
  async getStatisticsAlerts(eventId: string): Promise<StatisticsAlert[]> {
    const alerts: StatisticsAlert[] = [
      {
        id: 'alert-1',
        eventId,
        type: 'capacity',
        severity: 'warning',
        title: 'Approaching Capacity',
        message: 'Event is 85% sold. Consider opening waitlist.',
        timestamp: new Date().toISOString(),
        acknowledged: false
      },
      {
        id: 'alert-2',
        eventId,
        type: 'checkin_rate',
        severity: 'info',
        title: 'High Check-in Rate',
        message: 'Current check-in rate is above average for this time.',
        timestamp: new Date().toISOString(),
        acknowledged: false
      }
    ];

    return alerts;
  }

  // Acknowledge alert
  async acknowledgeAlert(alertId: string): Promise<void> {
    try {
      // In production, send to API
      console.log('Acknowledging alert:', alertId);
      
      this.eventEmitter.emit('alert-acknowledged', { alertId });
    } catch (error) {
      console.error('Error acknowledging alert:', error);
      throw error;
    }
  }

  // Private helper methods
  private determineStatusColor(salesPercentage: number, checkinPercentage: number): 'green' | 'yellow' | 'red' {
    if (salesPercentage > 90 || checkinPercentage < 50) return 'red';
    if (salesPercentage > 75 || checkinPercentage < 65) return 'yellow';
    return 'green';
  }

  private generateStatusMessage(salesPercentage: number, checkinPercentage: number, isLive: boolean): string {
    if (!isLive) {
      return `${salesPercentage.toFixed(1)}% sold, ${checkinPercentage.toFixed(1)}% checked in`;
    }
    
    if (checkinPercentage < 50) {
      return 'Low check-in rate - check entry process';
    }
    
    if (salesPercentage > 90) {
      return 'Near capacity - monitor for overcrowding';
    }
    
    return 'Event running smoothly';
  }

  private async cacheStatistics(eventId: string, statistics: EventStatistics): Promise<void> {
    try {
      const data = {
        statistics,
        timestamp: new Date().toISOString()
      };
      
      localStorage.setItem(`pwa_statistics_${eventId}`, JSON.stringify(data));
    } catch (error) {
      console.error('Error caching statistics:', error);
    }
  }

  private async getCachedStatistics(eventId: string): Promise<EventStatistics | null> {
    try {
      const cached = localStorage.getItem(`pwa_statistics_${eventId}`);
      if (!cached) return null;
      
      const data = JSON.parse(cached);
      return data.statistics;
    } catch (error) {
      console.error('Error getting cached statistics:', error);
      return null;
    }
  }

  private async syncOfflineData(): Promise<void> {
    if (this.syncInProgress) return;
    
    this.syncInProgress = true;
    
    try {
      // Sync any offline changes when coming back online
      console.log('Syncing offline statistics data...');
      
      this.eventEmitter.emit('sync-completed', {
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error syncing offline data:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  // Event subscription methods
  onStatisticsUpdate(callback: (data: any) => void): () => void {
    this.eventEmitter.on('statistics-refresh', callback);
    return () => this.eventEmitter.off('statistics-refresh', callback);
  }

  onAlertReceived(callback: (alert: StatisticsAlert) => void): () => void {
    this.eventEmitter.on('alert-received', callback);
    return () => this.eventEmitter.off('alert-received', callback);
  }

  onSyncCompleted(callback: (data: any) => void): () => void {
    this.eventEmitter.on('sync-completed', callback);
    return () => this.eventEmitter.off('sync-completed', callback);
  }

  // Cleanup
  destroy(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    this.eventEmitter.removeAllListeners();
  }
}

// Export singleton instance
export const pwaStatisticsService = new PWAStatisticsService(); 