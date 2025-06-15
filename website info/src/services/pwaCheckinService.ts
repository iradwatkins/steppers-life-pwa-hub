import { toast } from '@/components/ui/sonner';
import { checkinService } from './checkinService';

// Types for PWA check-in system
export interface PWATicketData {
  ticketId: string;
  eventId: string;
  attendeeId: string;
  attendeeName: string;
  attendeeEmail: string;
  attendeePhone?: string;
  ticketType: string;
  seatInfo?: string;
  specialNotes?: string;
  isVIP: boolean;
  purchaseDate: string;
  validationCode: string;
}

export interface PWACheckinResult {
  success: boolean;
  message: string;
  ticket?: PWATicketData;
  error?: string;
  isAlreadyCheckedIn?: boolean;
  isDuplicate?: boolean;
  timestamp?: string;
}

export interface PWAOfflineCheckin {
  id: string;
  ticketId: string;
  eventId: string;
  attendeeData: PWATicketData;
  checkinTime: string;
  staffMemberId: string;
  syncStatus: 'pending' | 'synced' | 'error';
  retryCount: number;
}

export interface PWAEventStats {
  eventId: string;
  totalCapacity: number;
  checkedInCount: number;
  arrivedInLastHour: number;
  vipCount: number;
  lastUpdate: string;
}

class PWACheckinService {
  private offlineQueue: PWAOfflineCheckin[] = [];
  private eventStats: Map<string, PWAEventStats> = new Map();
  private dbName = 'pwa-checkin-db';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;

  // Initialize IndexedDB for offline functionality
  async initializeDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = () => {
        const db = request.result;
        
        if (!db.objectStoreNames.contains('offlineCheckins')) {
          const checkinStore = db.createObjectStore('offlineCheckins', { keyPath: 'id' });
          checkinStore.createIndex('eventId', 'eventId', { unique: false });
          checkinStore.createIndex('syncStatus', 'syncStatus', { unique: false });
        }

        if (!db.objectStoreNames.contains('eventStats')) {
          db.createObjectStore('eventStats', { keyPath: 'eventId' });
        }

        if (!db.objectStoreNames.contains('ticketCache')) {
          const ticketStore = db.createObjectStore('ticketCache', { keyPath: 'ticketId' });
          ticketStore.createIndex('eventId', 'eventId', { unique: false });
        }
      };
    });
  }

  // Validate QR code and get ticket data
  async validateQRCode(qrData: string, eventId: string): Promise<PWACheckinResult> {
    try {
      // Parse QR code data (could be JSON or encoded string)
      let ticketData: PWATicketData;
      
      try {
        ticketData = JSON.parse(qrData);
      } catch {
        // If not JSON, treat as ticket ID
        ticketData = await this.fetchTicketByCode(qrData, eventId);
      }

      // Validate ticket belongs to this event
      if (ticketData.eventId !== eventId) {
        return {
          success: false,
          message: 'Ticket is not valid for this event',
          error: 'WRONG_EVENT'
        };
      }

      // Check if already checked in
      const existingCheckin = await checkinService.getCheckinStatus(ticketData.ticketId);
      if (existingCheckin?.isCheckedIn) {
        return {
          success: false,
          message: `Already checked in at ${existingCheckin.checkinTime}`,
          ticket: ticketData,
          isAlreadyCheckedIn: true,
          error: 'ALREADY_CHECKED_IN'
        };
      }

      // Validate ticket authenticity
      const isValid = await this.validateTicketAuthenticity(ticketData);
      if (!isValid) {
        return {
          success: false,
          message: 'Invalid or fraudulent ticket',
          error: 'INVALID_TICKET'
        };
      }

      return {
        success: true,
        message: 'Ticket validated successfully',
        ticket: ticketData,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('QR validation error:', error);
      return {
        success: false,
        message: 'Failed to validate QR code',
        error: 'VALIDATION_ERROR'
      };
    }
  }

  // Perform check-in (online or offline)
  async performCheckin(ticketData: PWATicketData, staffMemberId: string, isOnline: boolean = true): Promise<PWACheckinResult> {
    const checkinTime = new Date().toISOString();

    if (isOnline) {
      try {
        // Try online check-in first
        const result = await checkinService.checkinAttendee(ticketData.ticketId, {
          method: 'qr_scan',
          staffMemberId,
          timestamp: checkinTime,
          location: 'entrance'
        });

        if (result.success) {
          // Update local stats
          this.updateEventStats(ticketData.eventId, ticketData.isVIP);
          
          // Play success sound and haptic feedback
          this.triggerSuccessFeedback();

          return {
            success: true,
            message: `${ticketData.attendeeName} checked in successfully`,
            ticket: ticketData,
            timestamp: checkinTime
          };
        } else {
          throw new Error(result.error || 'Check-in failed');
        }
      } catch (error) {
        console.warn('Online check-in failed, falling back to offline:', error);
        // Fall back to offline mode
        return this.performOfflineCheckin(ticketData, staffMemberId, checkinTime);
      }
    } else {
      return this.performOfflineCheckin(ticketData, staffMemberId, checkinTime);
    }
  }

  // Offline check-in with queue
  private async performOfflineCheckin(ticketData: PWATicketData, staffMemberId: string, checkinTime: string): Promise<PWACheckinResult> {
    const offlineCheckin: PWAOfflineCheckin = {
      id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ticketId: ticketData.ticketId,
      eventId: ticketData.eventId,
      attendeeData: ticketData,
      checkinTime,
      staffMemberId,
      syncStatus: 'pending',
      retryCount: 0
    };

    // Add to offline queue
    this.offlineQueue.push(offlineCheckin);
    
    // Store in IndexedDB
    await this.storeOfflineCheckin(offlineCheckin);
    
    // Update local stats
    this.updateEventStats(ticketData.eventId, ticketData.isVIP);
    
    // Trigger feedback
    this.triggerSuccessFeedback();

    toast.info('Checked in offline - will sync when online');

    return {
      success: true,
      message: `${ticketData.attendeeName} checked in offline`,
      ticket: ticketData,
      timestamp: checkinTime
    };
  }

  // Manual attendee lookup
  async searchAttendees(query: string, eventId: string): Promise<PWATicketData[]> {
    try {
      // This would integrate with the existing attendee data
      // For now, using mock data similar to the existing system
      const mockAttendees: PWATicketData[] = [
        {
          ticketId: 'TKT-001',
          eventId,
          attendeeId: 'ATT-001',
          attendeeName: 'John Smith',
          attendeeEmail: 'john@example.com',
          attendeePhone: '(555) 123-4567',
          ticketType: 'General Admission',
          isVIP: false,
          purchaseDate: '2024-12-15T10:00:00Z',
          validationCode: 'ABC123',
          specialNotes: 'Wheelchair accessible seating requested'
        },
        {
          ticketId: 'TKT-002',
          eventId,
          attendeeId: 'ATT-002',
          attendeeName: 'Maria Garcia',
          attendeeEmail: 'maria@example.com',
          attendeePhone: '(555) 987-6543',
          ticketType: 'VIP',
          isVIP: true,
          purchaseDate: '2024-12-14T15:30:00Z',
          validationCode: 'VIP789',
          specialNotes: 'VIP meet and greet access'
        }
      ];

      // Fuzzy search implementation
      const searchTerm = query.toLowerCase();
      return mockAttendees.filter(attendee => 
        attendee.attendeeName.toLowerCase().includes(searchTerm) ||
        attendee.attendeeEmail.toLowerCase().includes(searchTerm) ||
        (attendee.attendeePhone && attendee.attendeePhone.includes(searchTerm)) ||
        attendee.ticketId.toLowerCase().includes(searchTerm)
      );
    } catch (error) {
      console.error('Search error:', error);
      return [];
    }
  }

  // Get real-time event statistics
  async getEventStats(eventId: string): Promise<PWAEventStats> {
    const cached = this.eventStats.get(eventId);
    if (cached && Date.now() - new Date(cached.lastUpdate).getTime() < 30000) { // 30 second cache
      return cached;
    }

    try {
      // Fetch real-time stats from the existing checkin service
      const stats = await checkinService.getEventStats(eventId);
      
      const eventStats: PWAEventStats = {
        eventId,
        totalCapacity: stats.totalCapacity || 200,
        checkedInCount: stats.checkedInCount || 0,
        arrivedInLastHour: stats.recentArrivals || 0,
        vipCount: stats.vipCheckins || 0,
        lastUpdate: new Date().toISOString()
      };

      this.eventStats.set(eventId, eventStats);
      return eventStats;
    } catch (error) {
      console.error('Failed to fetch event stats:', error);
      return cached || {
        eventId,
        totalCapacity: 200,
        checkedInCount: 0,
        arrivedInLastHour: 0,
        vipCount: 0,
        lastUpdate: new Date().toISOString()
      };
    }
  }

  // Sync offline check-ins when back online
  async syncOfflineCheckins(): Promise<void> {
    const pendingCheckins = this.offlineQueue.filter(c => c.syncStatus === 'pending');
    
    if (pendingCheckins.length === 0) return;

    toast.info(`Syncing ${pendingCheckins.length} offline check-ins...`);

    let successCount = 0;
    let errorCount = 0;

    for (const checkin of pendingCheckins) {
      try {
        const result = await checkinService.checkinAttendee(checkin.ticketId, {
          method: 'qr_scan',
          staffMemberId: checkin.staffMemberId,
          timestamp: checkin.checkinTime,
          location: 'entrance'
        });

        if (result.success) {
          checkin.syncStatus = 'synced';
          successCount++;
        } else {
          checkin.syncStatus = 'error';
          checkin.retryCount++;
          errorCount++;
        }
      } catch (error) {
        console.error('Sync error for checkin:', checkin.id, error);
        checkin.syncStatus = 'error';
        checkin.retryCount++;
        errorCount++;
      }

      // Update in IndexedDB
      await this.storeOfflineCheckin(checkin);
    }

    // Update the offline queue
    this.offlineQueue = this.offlineQueue.filter(c => c.syncStatus !== 'synced');

    if (successCount > 0) {
      toast.success(`Synced ${successCount} check-ins successfully`);
    }
    if (errorCount > 0) {
      toast.error(`Failed to sync ${errorCount} check-ins`);
    }
  }

  // Emergency manual override
  async emergencyCheckin(attendeeName: string, reason: string, staffMemberId: string, eventId: string): Promise<PWACheckinResult> {
    const emergencyTicket: PWATicketData = {
      ticketId: `EMRG_${Date.now()}`,
      eventId,
      attendeeId: `EMRG_${Date.now()}`,
      attendeeName,
      attendeeEmail: 'emergency@stepperslife.com',
      ticketType: 'Emergency Entry',
      isVIP: false,
      purchaseDate: new Date().toISOString(),
      validationCode: 'EMERGENCY',
      specialNotes: `Emergency entry: ${reason}`
    };

    // Log emergency entry
    console.warn('Emergency check-in performed:', {
      attendeeName,
      reason,
      staffMemberId,
      timestamp: new Date().toISOString()
    });

    return this.performCheckin(emergencyTicket, staffMemberId, navigator.onLine);
  }

  // Helper methods
  private async fetchTicketByCode(code: string, eventId: string): Promise<PWATicketData> {
    // This would fetch from API or cache
    // For now, returning mock data
    return {
      ticketId: code,
      eventId,
      attendeeId: 'ATT-QR',
      attendeeName: 'QR Attendee',
      attendeeEmail: 'qr@example.com',
      ticketType: 'General Admission',
      isVIP: false,
      purchaseDate: '2024-12-15T10:00:00Z',
      validationCode: code
    };
  }

  private async validateTicketAuthenticity(ticket: PWATicketData): Promise<boolean> {
    // Implement ticket validation logic
    // Check signature, expiry, etc.
    return ticket.validationCode && ticket.ticketId && ticket.eventId ? true : false;
  }

  private updateEventStats(eventId: string, isVIP: boolean): void {
    const current = this.eventStats.get(eventId);
    if (current) {
      current.checkedInCount++;
      current.arrivedInLastHour++;
      if (isVIP) current.vipCount++;
      current.lastUpdate = new Date().toISOString();
      this.eventStats.set(eventId, current);
    }
  }

  private triggerSuccessFeedback(): void {
    // Haptic feedback for mobile devices
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100]);
    }

    // Play success sound (if audio is enabled)
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMaAz2S0fPf'); // Short success beep
      audio.volume = 0.3;
      audio.play().catch(() => {}); // Ignore errors
    } catch {
      // Ignore audio errors
    }
  }

  private async storeOfflineCheckin(checkin: PWAOfflineCheckin): Promise<void> {
    if (!this.db) await this.initializeDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineCheckins'], 'readwrite');
      const store = transaction.objectStore('offlineCheckins');
      const request = store.put(checkin);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Get offline checkin queue status
  getOfflineQueueStatus(): { pending: number; errors: number } {
    const pending = this.offlineQueue.filter(c => c.syncStatus === 'pending').length;
    const errors = this.offlineQueue.filter(c => c.syncStatus === 'error').length;
    return { pending, errors };
  }
}

export const pwaCheckinService = new PWACheckinService(); 