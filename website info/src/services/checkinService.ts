import { notificationService } from './notificationService';
import { inventoryService } from './inventoryService';

// Check-in status types
export type CheckinStatus = 
  | 'pending' 
  | 'checked_in' 
  | 'not_found' 
  | 'already_checked_in' 
  | 'expired' 
  | 'cancelled'
  | 'invalid';

// Ticket verification result
export interface TicketVerificationResult {
  isValid: boolean;
  status: CheckinStatus;
  ticketInfo?: TicketInfo;
  attendeeInfo?: AttendeeInfo;
  error?: string;
  timestamp?: Date;
}

// Core data structures
export interface TicketInfo {
  ticketId: string;
  eventId: string;
  ticketType: string;
  seatNumber?: string;
  section?: string;
  purchaseDate: Date;
  qrCode: string;
  isTransferable: boolean;
  price: number;
  currency: string;
  validFrom: Date;
  validUntil: Date;
}

export interface AttendeeInfo {
  attendeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  accessibilityNeeds?: string[];
  dietaryRestrictions?: string[];
  emergencyContact?: {
    name: string;
    phone: string;
  };
}

export interface CheckinRecord {
  id: string;
  ticketId: string;
  eventId: string;
  attendeeId: string;
  checkinTime: Date;
  checkinMethod: 'qr_scan' | 'manual' | 'self_service';
  checkinLocation: string;
  staffId?: string;
  notes?: string;
  isOfflineCheckin: boolean;
  syncStatus: 'synced' | 'pending_sync' | 'sync_failed';
  createdAt: Date;
  updatedAt: Date;
}

export interface EventAttendanceData {
  eventId: string;
  totalCapacity: number;
  ticketsSold: number;
  checkedInCount: number;
  checkinsThisHour: number;
  peakCheckinHour?: string;
  attendanceRate: number;
  lastUpdated: Date;
}

export interface CheckinAnalytics {
  eventId: string;
  totalCheckins: number;
  checkinsByHour: { hour: string; count: number }[];
  checkinsByMethod: Record<string, number>;
  peakArrivalTime: string;
  averageCheckinTime: number;
  demographicBreakdown: {
    ageGroups: Record<string, number>;
    genderDistribution: Record<string, number>;
    locationDistribution: Record<string, number>;
  };
  noShowCount: number;
  noShowRate: number;
}

export interface WaitlistEntry {
  id: string;
  eventId: string;
  attendeeId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  addedDate: Date;
  notificationsSent: number;
  lastNotified?: Date;
  position: number;
  isActive: boolean;
}

// Mock data store
class CheckinServiceImpl {
  private checkinRecords = new Map<string, CheckinRecord>();
  private offlineCheckins: CheckinRecord[] = [];
  private waitlists = new Map<string, WaitlistEntry[]>();
  private attendanceData = new Map<string, EventAttendanceData>();
  private eventListeners: ((data: any) => void)[] = [];
  private isOnline = navigator.onLine;

  constructor() {
    // Set up online/offline detection
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncOfflineCheckins();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // Auto-sync every 30 seconds when online
    setInterval(() => {
      if (this.isOnline) {
        this.syncOfflineCheckins();
      }
    }, 30000);
  }

  // Event listener management
  addEventListener(callback: (data: any) => void) {
    this.eventListeners.push(callback);
  }

  removeEventListener(callback: (data: any) => void) {
    const index = this.eventListeners.indexOf(callback);
    if (index > -1) {
      this.eventListeners.splice(index, 1);
    }
  }

  private notifyListeners(eventType: string, data: any) {
    this.eventListeners.forEach(callback => {
      callback({ type: eventType, data });
    });
  }

  // QR Code validation and ticket verification
  async verifyTicket(qrCode: string, eventId: string): Promise<TicketVerificationResult> {
    try {
      // Parse QR code to extract ticket information
      const ticketData = this.parseQRCode(qrCode);
      
      if (!ticketData) {
        return {
          isValid: false,
          status: 'invalid',
          error: 'Invalid QR code format',
          timestamp: new Date()
        };
      }

      // Check if ticket belongs to this event
      if (ticketData.eventId !== eventId) {
        return {
          isValid: false,
          status: 'invalid',
          error: 'Ticket is not for this event',
          timestamp: new Date()
        };
      }

      // Check if ticket is already checked in
      const existingCheckin = Array.from(this.checkinRecords.values())
        .find(record => record.ticketId === ticketData.ticketId);
      
      if (existingCheckin) {
        return {
          isValid: false,
          status: 'already_checked_in',
          error: 'Ticket has already been used for check-in',
          timestamp: new Date(),
          ticketInfo: ticketData.ticket,
          attendeeInfo: ticketData.attendee
        };
      }

      // Check if ticket is expired
      const now = new Date();
      if (now < ticketData.ticket.validFrom || now > ticketData.ticket.validUntil) {
        return {
          isValid: false,
          status: 'expired',
          error: 'Ticket is not valid for the current time',
          timestamp: new Date(),
          ticketInfo: ticketData.ticket,
          attendeeInfo: ticketData.attendee
        };
      }

      // All validations passed
      return {
        isValid: true,
        status: 'pending',
        ticketInfo: ticketData.ticket,
        attendeeInfo: ticketData.attendee,
        timestamp: new Date()
      };

    } catch (error) {
      return {
        isValid: false,
        status: 'invalid',
        error: 'Error verifying ticket: ' + (error as Error).message,
        timestamp: new Date()
      };
    }
  }

  // Process check-in after verification
  async processCheckin(
    ticketId: string,
    eventId: string,
    method: 'qr_scan' | 'manual' | 'self_service',
    staffId?: string,
    notes?: string
  ): Promise<CheckinRecord> {
    const checkinRecord: CheckinRecord = {
      id: `checkin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ticketId,
      eventId,
      attendeeId: `attendee_${ticketId}`, // Mock attendee ID
      checkinTime: new Date(),
      checkinMethod: method,
      checkinLocation: 'Main Entrance', // Mock location
      staffId,
      notes,
      isOfflineCheckin: !this.isOnline,
      syncStatus: this.isOnline ? 'synced' : 'pending_sync',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    if (this.isOnline) {
      // Store in main records
      this.checkinRecords.set(checkinRecord.id, checkinRecord);
      
      // Send welcome notification
      await this.sendWelcomeNotification(checkinRecord);
      
      // Update attendance data
      this.updateAttendanceData(eventId);
    } else {
      // Store for offline sync
      this.offlineCheckins.push(checkinRecord);
    }

    // Notify listeners
    this.notifyListeners('checkin_processed', checkinRecord);

    return checkinRecord;
  }

  // Manual check-in by name lookup
  async manualCheckinByName(
    firstName: string,
    lastName: string,
    eventId: string,
    staffId: string,
    notes?: string
  ): Promise<TicketVerificationResult & { checkinRecord?: CheckinRecord }> {
    try {
      // Mock lookup - in real implementation, this would query the ticket database
      const mockTicket = this.findTicketByName(firstName, lastName, eventId);
      
      if (!mockTicket) {
        return {
          isValid: false,
          status: 'not_found',
          error: 'No ticket found for this name',
          timestamp: new Date()
        };
      }

      // Check if already checked in
      const existingCheckin = Array.from(this.checkinRecords.values())
        .find(record => record.ticketId === mockTicket.ticket.ticketId);
      
      if (existingCheckin) {
        return {
          isValid: false,
          status: 'already_checked_in',
          error: 'Attendee has already checked in',
          timestamp: new Date(),
          ticketInfo: mockTicket.ticket,
          attendeeInfo: mockTicket.attendee
        };
      }

      // Process check-in
      const checkinRecord = await this.processCheckin(
        mockTicket.ticket.ticketId,
        eventId,
        'manual',
        staffId,
        notes
      );

      return {
        isValid: true,
        status: 'checked_in',
        ticketInfo: mockTicket.ticket,
        attendeeInfo: mockTicket.attendee,
        timestamp: new Date(),
        checkinRecord
      };

    } catch (error) {
      return {
        isValid: false,
        status: 'invalid',
        error: 'Error processing manual check-in: ' + (error as Error).message,
        timestamp: new Date()
      };
    }
  }

  // Get live attendance data
  async getAttendanceData(eventId: string): Promise<EventAttendanceData> {
    let data = this.attendanceData.get(eventId);
    
    if (!data) {
      // Initialize attendance data for new event
      const capacity = await inventoryService.getTotalCapacity(eventId);
      const sold = await inventoryService.getSoldTickets(eventId);
      
      data = {
        eventId,
        totalCapacity: capacity,
        ticketsSold: sold,
        checkedInCount: 0,
        checkinsThisHour: 0,
        attendanceRate: 0,
        lastUpdated: new Date()
      };
      
      this.attendanceData.set(eventId, data);
    }
    
    return { ...data };
  }

  // Get check-in analytics
  async getCheckinAnalytics(eventId: string, dateRange?: { start: Date; end: Date }): Promise<CheckinAnalytics> {
    const checkins = Array.from(this.checkinRecords.values())
      .filter(record => record.eventId === eventId);

    const filteredCheckins = dateRange 
      ? checkins.filter(record => 
          record.checkinTime >= dateRange.start && record.checkinTime <= dateRange.end
        )
      : checkins;

    // Calculate analytics
    const checkinsByHour = this.groupCheckinsByHour(filteredCheckins);
    const checkinsByMethod = this.groupCheckinsByMethod(filteredCheckins);
    const peakHour = this.findPeakCheckinHour(checkinsByHour);
    const averageTime = this.calculateAverageCheckinTime(filteredCheckins);
    
    const attendanceData = await this.getAttendanceData(eventId);
    const noShowCount = attendanceData.ticketsSold - filteredCheckins.length;

    return {
      eventId,
      totalCheckins: filteredCheckins.length,
      checkinsByHour,
      checkinsByMethod,
      peakArrivalTime: peakHour,
      averageCheckinTime: averageTime,
      demographicBreakdown: {
        ageGroups: { '18-25': 15, '26-35': 25, '36-45': 20, '46+': 10 }, // Mock data
        genderDistribution: { 'Male': 35, 'Female': 40, 'Other': 5 }, // Mock data
        locationDistribution: { 'Local': 50, 'Regional': 25, 'National': 5 } // Mock data
      },
      noShowCount,
      noShowRate: noShowCount / attendanceData.ticketsSold
    };
  }

  // Waitlist management
  async addToWaitlist(eventId: string, attendeeInfo: Partial<AttendeeInfo>): Promise<WaitlistEntry> {
    const waitlist = this.waitlists.get(eventId) || [];
    
    const entry: WaitlistEntry = {
      id: `waitlist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      eventId,
      attendeeId: attendeeInfo.attendeeId || `temp_${Date.now()}`,
      email: attendeeInfo.email!,
      firstName: attendeeInfo.firstName!,
      lastName: attendeeInfo.lastName!,
      phone: attendeeInfo.phone,
      addedDate: new Date(),
      notificationsSent: 0,
      position: waitlist.length + 1,
      isActive: true
    };

    waitlist.push(entry);
    this.waitlists.set(eventId, waitlist);

    // Send waitlist confirmation
    await notificationService.sendWaitlistConfirmation(entry);

    return entry;
  }

  async notifyWaitlistWhenAvailable(eventId: string): Promise<void> {
    const waitlist = this.waitlists.get(eventId) || [];
    const activeEntries = waitlist.filter(entry => entry.isActive);
    
    if (activeEntries.length === 0) return;

    // Check available capacity
    const capacity = await inventoryService.getAvailableCapacity(eventId);
    
    if (capacity > 0) {
      const toNotify = activeEntries.slice(0, capacity);
      
      for (const entry of toNotify) {
        await notificationService.sendWaitlistAvailableNotification(entry);
        entry.lastNotified = new Date();
        entry.notificationsSent++;
      }
    }
  }

  // Export attendance data
  async exportAttendanceCSV(eventId: string): Promise<string> {
    const checkins = Array.from(this.checkinRecords.values())
      .filter(record => record.eventId === eventId);

    const headers = [
      'Ticket ID',
      'Attendee Name',
      'Check-in Time',
      'Check-in Method',
      'Staff ID',
      'Notes'
    ].join(',');

    const rows = checkins.map(record => [
      record.ticketId,
      'Mock Attendee Name', // In real implementation, lookup attendee name
      record.checkinTime.toISOString(),
      record.checkinMethod,
      record.staffId || '',
      record.notes || ''
    ].join(','));

    return [headers, ...rows].join('\n');
  }

  // Offline sync
  private async syncOfflineCheckins(): Promise<void> {
    if (this.offlineCheckins.length === 0) return;

    try {
      for (const checkin of this.offlineCheckins) {
        // In real implementation, sync with backend
        checkin.syncStatus = 'synced';
        checkin.isOfflineCheckin = false;
        checkin.updatedAt = new Date();
        
        this.checkinRecords.set(checkin.id, checkin);
        
        // Send delayed welcome notification
        await this.sendWelcomeNotification(checkin);
        
        // Update attendance data
        this.updateAttendanceData(checkin.eventId);
      }

      // Clear offline queue
      this.offlineCheckins = [];
      
      // Notify listeners
      this.notifyListeners('offline_sync_completed', {
        syncedCount: this.offlineCheckins.length
      });

    } catch (error) {
      console.error('Failed to sync offline check-ins:', error);
      
      // Mark failed syncs
      this.offlineCheckins.forEach(checkin => {
        checkin.syncStatus = 'sync_failed';
      });
    }
  }

  // Helper methods
  private parseQRCode(qrCode: string): { ticket: TicketInfo; attendee: AttendeeInfo } | null {
    try {
      // Mock QR code parsing - in real implementation, this would decode the QR
      const data = JSON.parse(atob(qrCode));
      return data;
    } catch {
      // Fallback mock data for demo
      return {
        ticket: {
          ticketId: `ticket_${Date.now()}`,
          eventId: 'event_1',
          ticketType: 'General Admission',
          purchaseDate: new Date(),
          qrCode,
          isTransferable: true,
          price: 50,
          currency: 'USD',
          validFrom: new Date(Date.now() - 86400000), // 1 day ago
          validUntil: new Date(Date.now() + 86400000)  // 1 day from now
        },
        attendee: {
          attendeeId: `attendee_${Date.now()}`,
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com'
        }
      };
    }
  }

  private findTicketByName(firstName: string, lastName: string, eventId: string): { ticket: TicketInfo; attendee: AttendeeInfo } | null {
    // Mock implementation - in real system, query ticket database
    return {
      ticket: {
        ticketId: `ticket_manual_${Date.now()}`,
        eventId,
        ticketType: 'General Admission',
        purchaseDate: new Date(),
        qrCode: 'manual_checkin',
        isTransferable: true,
        price: 50,
        currency: 'USD',
        validFrom: new Date(Date.now() - 86400000),
        validUntil: new Date(Date.now() + 86400000)
      },
      attendee: {
        attendeeId: `attendee_manual_${Date.now()}`,
        firstName,
        lastName,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`
      }
    };
  }

  private async sendWelcomeNotification(checkinRecord: CheckinRecord): Promise<void> {
    try {
      await notificationService.sendCheckinWelcomeMessage({
        attendeeId: checkinRecord.attendeeId,
        eventId: checkinRecord.eventId,
        checkinTime: checkinRecord.checkinTime
      });
    } catch (error) {
      console.error('Failed to send welcome notification:', error);
    }
  }

  private updateAttendanceData(eventId: string): void {
    const data = this.attendanceData.get(eventId);
    if (!data) return;

    const checkins = Array.from(this.checkinRecords.values())
      .filter(record => record.eventId === eventId);

    const now = new Date();
    const hourAgo = new Date(now.getTime() - 3600000);
    const checkinsThisHour = checkins.filter(
      record => record.checkinTime > hourAgo
    ).length;

    data.checkedInCount = checkins.length;
    data.checkinsThisHour = checkinsThisHour;
    data.attendanceRate = data.ticketsSold > 0 ? data.checkedInCount / data.ticketsSold : 0;
    data.lastUpdated = new Date();

    this.attendanceData.set(eventId, data);
    this.notifyListeners('attendance_updated', data);
  }

  private groupCheckinsByHour(checkins: CheckinRecord[]): { hour: string; count: number }[] {
    const hourGroups: Record<string, number> = {};
    
    checkins.forEach(checkin => {
      const hour = checkin.checkinTime.getHours().toString().padStart(2, '0') + ':00';
      hourGroups[hour] = (hourGroups[hour] || 0) + 1;
    });

    return Object.entries(hourGroups).map(([hour, count]) => ({ hour, count }));
  }

  private groupCheckinsByMethod(checkins: CheckinRecord[]): Record<string, number> {
    const methodGroups: Record<string, number> = {};
    
    checkins.forEach(checkin => {
      methodGroups[checkin.checkinMethod] = (methodGroups[checkin.checkinMethod] || 0) + 1;
    });

    return methodGroups;
  }

  private findPeakCheckinHour(hourData: { hour: string; count: number }[]): string {
    return hourData.reduce((peak, current) => 
      current.count > peak.count ? current : peak, 
      { hour: '00:00', count: 0 }
    ).hour;
  }

  private calculateAverageCheckinTime(checkins: CheckinRecord[]): number {
    // Mock calculation - in real implementation, track processing time
    return 45; // seconds
  }
}

export const checkinService = new CheckinServiceImpl(); 