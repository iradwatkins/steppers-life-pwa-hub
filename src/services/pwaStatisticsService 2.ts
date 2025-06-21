import { openDB, IDBPDatabase } from 'idb';
import { pwaAttendeeService, PWAAttendeeInfo } from './pwaAttendeeService';
import { pwaCheckinService } from './pwaCheckinService';

export interface EventStatistics {
  eventId: string;
  eventName: string;
  eventDate: string;
  eventStartTime: string;
  eventEndTime: string;
  capacity: number;
  ticketsSold: number;
  checkedIn: number;
  notCheckedIn: number;
  checkinRate: number;
  revenueTotal: number;
  averageTicketPrice: number;
  vipCount: number;
  compTickets: number;
  lastUpdated: string;
  gateStatus: 'closed' | 'open' | 'closing_soon';
  eventStatus: 'upcoming' | 'live' | 'completed';
}

export interface HourlyPattern {
  hour: string;
  checkins: number;
  arrivalRate: number;
  cumulativeCheckins: number;
}

export interface TicketTypeBreakdown {
  type: string;
  sold: number;
  checkedIn: number;
  revenue: number;
  percentage: number;
  averagePrice: number;
}

export interface StatisticsAlert {
  id: string;
  type: 'capacity' | 'arrival_rate' | 'gate_status' | 'revenue' | 'system';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: string;
  acknowledged: boolean;
  eventId: string;
  threshold?: number;
  currentValue?: number;
}

export interface CapacityMilestone {
  percentage: number;
  reached: boolean;
  timestamp?: string;
  description: string;
}

export interface ArrivalPrediction {
  predictedPeakHour: string;
  predictedPeakRate: number;
  confidenceLevel: number;
  nextHourPrediction: number;
}

export interface ComprehensiveEventStats extends EventStatistics {
  hourlyPatterns: HourlyPattern[];
  ticketTypeBreakdown: TicketTypeBreakdown[];
  activeAlerts: StatisticsAlert[];
  capacityMilestones: CapacityMilestone[];
  arrivalPredictions: ArrivalPrediction;
  timeUntilEvent: number; // minutes
  peakArrivalTime?: string;
  currentArrivalRate: number;
  syncStatus: 'synced' | 'syncing' | 'offline' | 'error';
}

class PWAStatisticsService {
  private db: IDBPDatabase | null = null;
  private refreshInterval: NodeJS.Timeout | null = null;
  private lastSyncTime: Date | null = null;
  private autoRefreshEnabled = true;
  private refreshIntervalMs = 30000; // 30 seconds
  private listeners: ((stats: ComprehensiveEventStats) => void)[] = [];

  async initDB() {
    if (this.db) return this.db;

    this.db = await openDB('PWAStatisticsDB', 1, {
      upgrade(db) {
        // Statistics cache store
        if (!db.objectStoreNames.contains('statistics')) {
          const statsStore = db.createObjectStore('statistics', { keyPath: 'eventId' });
          statsStore.createIndex('lastUpdated', 'lastUpdated');
          statsStore.createIndex('eventDate', 'eventDate');
        }

        // Hourly patterns store
        if (!db.objectStoreNames.contains('hourlyPatterns')) {
          const patternsStore = db.createObjectStore('hourlyPatterns', { keyPath: ['eventId', 'hour'] });
          patternsStore.createIndex('eventId', 'eventId');
        }

        // Alerts store
        if (!db.objectStoreNames.contains('alerts')) {
          const alertsStore = db.createObjectStore('alerts', { keyPath: 'id' });
          alertsStore.createIndex('eventId', 'eventId');
          alertsStore.createIndex('acknowledged', 'acknowledged');
          alertsStore.createIndex('severity', 'severity');
        }

        // Settings store
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      },
    });

    return this.db;
  }

  async getEventStatistics(eventId: string): Promise<ComprehensiveEventStats> {
    await this.initDB();

    try {
      // Get attendee statistics
      const attendeeStats = await pwaAttendeeService.getEventStats(eventId);
      const checkinStats = await pwaCheckinService.getEventStats(eventId);
      
      // Generate hourly patterns
      const hourlyPatterns = await this.generateHourlyPatterns(eventId);
      
      // Generate ticket type breakdown
      const ticketTypeBreakdown = await this.generateTicketTypeBreakdown(eventId);
      
      // Get active alerts
      const activeAlerts = await this.getActiveAlerts(eventId);
      
      // Calculate capacity milestones
      const capacityMilestones = this.calculateCapacityMilestones(attendeeStats.checkedIn, attendeeStats.total);
      
      // Generate arrival predictions
      const arrivalPredictions = this.generateArrivalPredictions(hourlyPatterns);
      
      // Mock event details (in real app, would come from event service)
      const eventDetails = await this.getEventDetails(eventId);
      
      const stats: ComprehensiveEventStats = {
        ...eventDetails,
        eventId,
        ticketsSold: attendeeStats.total,
        checkedIn: attendeeStats.checkedIn,
        notCheckedIn: attendeeStats.notCheckedIn,
        checkinRate: attendeeStats.checkinRate,
        revenueTotal: attendeeStats.revenueTotal,
        averageTicketPrice: attendeeStats.total > 0 ? attendeeStats.revenueTotal / attendeeStats.total : 0,
        vipCount: attendeeStats.vipCount,
        compTickets: attendeeStats.compTickets,
        lastUpdated: new Date().toISOString(),
        hourlyPatterns,
        ticketTypeBreakdown,
        activeAlerts,
        capacityMilestones,
        arrivalPredictions,
        timeUntilEvent: this.calculateTimeUntilEvent(eventDetails.eventDate, eventDetails.eventStartTime),
        currentArrivalRate: this.calculateCurrentArrivalRate(hourlyPatterns),
        syncStatus: navigator.onLine ? 'synced' : 'offline'
      };

      // Cache statistics
      await this.cacheStatistics(stats);
      
      // Check for threshold alerts
      await this.checkThresholdAlerts(stats);
      
      return stats;
    } catch (error) {
      console.error('Error getting event statistics:', error);
      
      // Try to return cached data
      const cachedStats = await this.getCachedStatistics(eventId);
      if (cachedStats) {
        return { ...cachedStats, syncStatus: 'error' };
      }
      
      throw error;
    }
  }

  private async getEventDetails(eventId: string): Promise<Partial<EventStatistics>> {
    // Mock event details - in real app, would fetch from event service
    return {
      eventName: 'Chicago Stepping Workshop',
      eventDate: '2024-12-20',
      eventStartTime: '19:00',
      eventEndTime: '22:00',
      capacity: 200,
      gateStatus: 'open',
      eventStatus: 'live'
    };
  }

  private async generateHourlyPatterns(eventId: string): Promise<HourlyPattern[]> {
    const attendees = await pwaAttendeeService.getAllAttendees(eventId);
    const checkedInAttendees = attendees.filter(a => a.checkedIn && a.checkinTimestamp);
    
    // Group check-ins by hour
    const hourlyData: Record<string, number> = {};
    const now = new Date();
    
    // Initialize last 24 hours
    for (let i = 23; i >= 0; i--) {
      const hour = new Date(now.getTime() - i * 60 * 60 * 1000);
      const hourKey = hour.toISOString().substring(0, 13) + ':00:00.000Z';
      hourlyData[hourKey] = 0;
    }
    
    // Count actual check-ins
    checkedInAttendees.forEach(attendee => {
      if (attendee.checkinTimestamp) {
        const checkinHour = new Date(attendee.checkinTimestamp);
        const hourKey = checkinHour.toISOString().substring(0, 13) + ':00:00.000Z';
        hourlyData[hourKey] = (hourlyData[hourKey] || 0) + 1;
      }
    });

    // Convert to HourlyPattern array
    const patterns: HourlyPattern[] = [];
    let cumulativeCheckins = 0;
    
    Object.entries(hourlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([hour, checkins]) => {
        cumulativeCheckins += checkins;
        patterns.push({
          hour,
          checkins,
          arrivalRate: checkins, // per hour
          cumulativeCheckins
        });
      });

    return patterns;
  }

  private async generateTicketTypeBreakdown(eventId: string): Promise<TicketTypeBreakdown[]> {
    const attendees = await pwaAttendeeService.getAllAttendees(eventId);
    const breakdown: Record<string, TicketTypeBreakdown> = {};
    
    attendees.forEach(attendee => {
      if (!breakdown[attendee.ticketType]) {
        breakdown[attendee.ticketType] = {
          type: attendee.ticketType,
          sold: 0,
          checkedIn: 0,
          revenue: 0,
          percentage: 0,
          averagePrice: 0
        };
      }
      
      const typeData = breakdown[attendee.ticketType];
      typeData.sold++;
      typeData.revenue += attendee.totalPaid;
      
      if (attendee.checkedIn) {
        typeData.checkedIn++;
      }
    });

    // Calculate percentages and averages
    const totalSold = attendees.length;
    const result = Object.values(breakdown).map(type => ({
      ...type,
      percentage: totalSold > 0 ? Math.round((type.sold / totalSold) * 100) : 0,
      averagePrice: type.sold > 0 ? type.revenue / type.sold : 0
    }));

    return result.sort((a, b) => b.sold - a.sold);
  }

  private calculateCapacityMilestones(checkedIn: number, capacity: number): CapacityMilestone[] {
    const milestones = [
      { percentage: 25, description: '25% Capacity' },
      { percentage: 50, description: '50% Capacity' },
      { percentage: 75, description: '75% Capacity' },
      { percentage: 90, description: '90% Capacity' },
      { percentage: 100, description: 'Sold Out' }
    ];

    const currentPercentage = capacity > 0 ? (checkedIn / capacity) * 100 : 0;
    
    return milestones.map(milestone => ({
      ...milestone,
      reached: currentPercentage >= milestone.percentage,
      timestamp: currentPercentage >= milestone.percentage ? new Date().toISOString() : undefined
    }));
  }

  private generateArrivalPredictions(hourlyPatterns: HourlyPattern[]): ArrivalPrediction {
    const recentPatterns = hourlyPatterns.slice(-6); // Last 6 hours
    const avgRate = recentPatterns.reduce((sum, p) => sum + p.arrivalRate, 0) / recentPatterns.length;
    
    // Find peak hour
    const peakHour = hourlyPatterns.reduce((peak, current) => 
      current.arrivalRate > peak.arrivalRate ? current : peak
    );

    return {
      predictedPeakHour: peakHour.hour,
      predictedPeakRate: peakHour.arrivalRate,
      confidenceLevel: Math.min(90, recentPatterns.length * 15), // Simple confidence calculation
      nextHourPrediction: Math.round(avgRate * 1.1) // 10% increase prediction
    };
  }

  private calculateTimeUntilEvent(eventDate: string, eventStartTime: string): number {
    const eventDateTime = new Date(`${eventDate}T${eventStartTime}`);
    const now = new Date();
    return Math.max(0, Math.floor((eventDateTime.getTime() - now.getTime()) / (1000 * 60)));
  }

  private calculateCurrentArrivalRate(hourlyPatterns: HourlyPattern[]): number {
    const lastHour = hourlyPatterns[hourlyPatterns.length - 1];
    return lastHour ? lastHour.arrivalRate : 0;
  }

  async getActiveAlerts(eventId: string): Promise<StatisticsAlert[]> {
    await this.initDB();
    const tx = this.db!.transaction('alerts', 'readonly');
    const store = tx.objectStore('alerts');
    const index = store.index('eventId');
    
    const allAlerts = await index.getAll(eventId);
    return allAlerts.filter(alert => !alert.acknowledged);
  }

  async acknowledgeAlert(alertId: string): Promise<void> {
    await this.initDB();
    const tx = this.db!.transaction('alerts', 'readwrite');
    const store = tx.objectStore('alerts');
    
    const alert = await store.get(alertId);
    if (alert) {
      alert.acknowledged = true;
      await store.put(alert);
    }
  }

  private async checkThresholdAlerts(stats: ComprehensiveEventStats): Promise<void> {
    const alerts: StatisticsAlert[] = [];
    
    // Capacity alerts
    if (stats.checkinRate >= 90) {
      alerts.push({
        id: `capacity-90-${Date.now()}`,
        type: 'capacity',
        severity: 'critical',
        message: `Event at 90% capacity (${stats.checkedIn}/${stats.capacity})`,
        timestamp: new Date().toISOString(),
        acknowledged: false,
        eventId: stats.eventId,
        threshold: 90,
        currentValue: stats.checkinRate
      });
    } else if (stats.checkinRate >= 75) {
      alerts.push({
        id: `capacity-75-${Date.now()}`,
        type: 'capacity',
        severity: 'warning',
        message: `Event at 75% capacity (${stats.checkedIn}/${stats.capacity})`,
        timestamp: new Date().toISOString(),
        acknowledged: false,
        eventId: stats.eventId,
        threshold: 75,
        currentValue: stats.checkinRate
      });
    }

    // Arrival rate alerts
    if (stats.currentArrivalRate > 50) {
      alerts.push({
        id: `arrival-rate-${Date.now()}`,
        type: 'arrival_rate',
        severity: 'warning',
        message: `High arrival rate: ${stats.currentArrivalRate} per hour`,
        timestamp: new Date().toISOString(),
        acknowledged: false,
        eventId: stats.eventId,
        threshold: 50,
        currentValue: stats.currentArrivalRate
      });
    }

    // Store new alerts
    for (const alert of alerts) {
      await this.storeAlert(alert);
    }
  }

  private async storeAlert(alert: StatisticsAlert): Promise<void> {
    await this.initDB();
    const tx = this.db!.transaction('alerts', 'readwrite');
    await tx.store.put(alert);
  }

  private async cacheStatistics(stats: ComprehensiveEventStats): Promise<void> {
    await this.initDB();
    const tx = this.db!.transaction('statistics', 'readwrite');
    await tx.store.put(stats);
  }

  private async getCachedStatistics(eventId: string): Promise<ComprehensiveEventStats | null> {
    await this.initDB();
    const tx = this.db!.transaction('statistics', 'readonly');
    return await tx.store.get(eventId) || null;
  }

  // Auto-refresh functionality
  startAutoRefresh(eventId: string): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }

    if (this.autoRefreshEnabled) {
      this.refreshInterval = setInterval(async () => {
        try {
          const stats = await this.getEventStatistics(eventId);
          this.notifyListeners(stats);
        } catch (error) {
          console.error('Auto-refresh failed:', error);
        }
      }, this.refreshIntervalMs);
    }
  }

  stopAutoRefresh(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  setRefreshInterval(intervalMs: number): void {
    this.refreshIntervalMs = intervalMs;
    // If auto-refresh is currently running, restart with new interval
    if (this.refreshInterval) {
      const currentEventId = this.getCurrentEventId();
      if (currentEventId) {
        this.stopAutoRefresh();
        this.startAutoRefresh(currentEventId);
      }
    }
  }

  enableAutoRefresh(): void {
    this.autoRefreshEnabled = true;
  }

  disableAutoRefresh(): void {
    this.autoRefreshEnabled = false;
    this.stopAutoRefresh();
  }

  // Listener management
  addListener(callback: (stats: ComprehensiveEventStats) => void): () => void {
    this.listeners.push(callback);
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners(stats: ComprehensiveEventStats): void {
    this.listeners.forEach(callback => {
      try {
        callback(stats);
      } catch (error) {
        console.error('Listener callback error:', error);
      }
    });
  }

  private getCurrentEventId(): string | null {
    // In a real app, this would track the current event
    return localStorage.getItem('currentEventId');
  }

  async isOnline(): Promise<boolean> {
    return navigator.onLine;
  }

  getLastSyncTime(): Date | null {
    return this.lastSyncTime;
  }

  // Settings management
  async getSettings(): Promise<{
    autoRefreshEnabled: boolean;
    refreshIntervalMs: number;
    alertsEnabled: boolean;
  }> {
    await this.initDB();
    const tx = this.db!.transaction('settings', 'readonly');
    const store = tx.objectStore('settings');
    
    const settings = {
      autoRefreshEnabled: await store.get('autoRefreshEnabled')?.value ?? true,
      refreshIntervalMs: await store.get('refreshIntervalMs')?.value ?? 30000,
      alertsEnabled: await store.get('alertsEnabled')?.value ?? true
    };

    return settings;
  }

  async updateSettings(settings: Partial<{
    autoRefreshEnabled: boolean;
    refreshIntervalMs: number;
    alertsEnabled: boolean;
  }>): Promise<void> {
    await this.initDB();
    const tx = this.db!.transaction('settings', 'readwrite');
    const store = tx.objectStore('settings');
    
    for (const [key, value] of Object.entries(settings)) {
      await store.put({ key, value });
    }

    // Apply settings immediately
    if (settings.autoRefreshEnabled !== undefined) {
      this.autoRefreshEnabled = settings.autoRefreshEnabled;
    }
    if (settings.refreshIntervalMs !== undefined) {
      this.setRefreshInterval(settings.refreshIntervalMs);
    }
  }
}

export const pwaStatisticsService = new PWAStatisticsService();