import { openDB, IDBPDatabase } from 'idb';

export interface AttendeeInfo {
  id: string;
  name: string;
  email: string;
  phone?: string;
  ticketId: string;
  eventId: string;
  ticketType: string;
  isVIP: boolean;
  specialNotes?: string;
  purchaseDate: string;
  status: 'valid' | 'used' | 'expired' | 'invalid';
}

export interface CheckinRecord {
  id: string;
  attendeeId: string;
  eventId: string;
  timestamp: string;
  staffId: string;
  method: 'qr' | 'manual' | 'override';
  synced: boolean;
}

export interface EventStats {
  eventId: string;
  eventName: string;
  totalCapacity: number;
  checkedIn: number;
  arrivalRate: number;
  peakHour?: string;
  vipCount: number;
}

export interface ScanResult {
  success: boolean;
  attendee?: AttendeeInfo;
  error?: string;
  action?: 'checkin' | 'already_checked_in' | 'invalid_ticket';
}

class PWACheckinService {
  private db: IDBPDatabase | null = null;
  private currentStaffId: string = 'staff-001'; // Would come from auth

  async initDB() {
    if (this.db) return this.db;

    this.db = await openDB('PWACheckinDB', 1, {
      upgrade(db) {
        // Store for attendee data
        if (!db.objectStoreNames.contains('attendees')) {
          const attendeeStore = db.createObjectStore('attendees', { keyPath: 'id' });
          attendeeStore.createIndex('email', 'email');
          attendeeStore.createIndex('phone', 'phone');
          attendeeStore.createIndex('eventId', 'eventId');
          attendeeStore.createIndex('ticketId', 'ticketId');
        }

        // Store for checkin records
        if (!db.objectStoreNames.contains('checkins')) {
          const checkinStore = db.createObjectStore('checkins', { keyPath: 'id' });
          checkinStore.createIndex('eventId', 'eventId');
          checkinStore.createIndex('synced', 'synced');
          checkinStore.createIndex('timestamp', 'timestamp');
        }

        // Store for events
        if (!db.objectStoreNames.contains('events')) {
          db.createObjectStore('events', { keyPath: 'eventId' });
        }
      },
    });

    return this.db;
  }

  // Load event attendees for offline use
  async loadEventAttendees(eventId: string): Promise<void> {
    await this.initDB();
    
    // Mock attendee data - in real app, would fetch from API
    const mockAttendees: AttendeeInfo[] = [
      {
        id: 'attendee-001',
        name: 'John Smith',
        email: 'john@example.com',
        phone: '+1-555-0123',
        ticketId: 'TKT-001',
        eventId,
        ticketType: 'General Admission',
        isVIP: false,
        purchaseDate: '2024-12-01',
        status: 'valid'
      },
      {
        id: 'attendee-002',
        name: 'Sarah Johnson',
        email: 'sarah@example.com',
        phone: '+1-555-0124',
        ticketId: 'TKT-002',
        eventId,
        ticketType: 'VIP',
        isVIP: true,
        specialNotes: 'Requires wheelchair access',
        purchaseDate: '2024-12-02',
        status: 'valid'
      },
      {
        id: 'attendee-003',
        name: 'Mike Davis',
        email: 'mike@example.com',
        ticketId: 'TKT-003',
        eventId,
        ticketType: 'General Admission',
        isVIP: false,
        purchaseDate: '2024-12-03',
        status: 'valid'
      }
    ];

    // Store attendees in IndexedDB
    const tx = this.db!.transaction('attendees', 'readwrite');
    for (const attendee of mockAttendees) {
      await tx.store.put(attendee);
    }
    await tx.done;
  }

  // Scan QR code and validate ticket
  async scanQRCode(qrData: string): Promise<ScanResult> {
    await this.initDB();

    try {
      // Parse QR code data - assuming format: ticketId:eventId
      const [ticketId, eventId] = qrData.split(':');
      
      if (!ticketId || !eventId) {
        return { success: false, error: 'Invalid QR code format' };
      }

      // Find attendee by ticket ID
      const attendee = await this.db!.getFromIndex('attendees', 'ticketId', ticketId);
      
      if (!attendee) {
        return { success: false, error: 'Ticket not found', action: 'invalid_ticket' };
      }

      if (attendee.eventId !== eventId) {
        return { success: false, error: 'Ticket not valid for this event', action: 'invalid_ticket' };
      }

      if (attendee.status === 'expired') {
        return { success: false, error: 'Ticket has expired', action: 'invalid_ticket' };
      }

      if (attendee.status === 'invalid') {
        return { success: false, error: 'Invalid ticket', action: 'invalid_ticket' };
      }

      // Check if already checked in
      const existingCheckin = await this.getCheckinByAttendee(attendee.id);
      if (existingCheckin) {
        return { 
          success: false, 
          attendee, 
          error: `Already checked in at ${new Date(existingCheckin.timestamp).toLocaleTimeString()}`,
          action: 'already_checked_in'
        };
      }

      // Perform check-in
      await this.performCheckin(attendee, 'qr');
      
      return { success: true, attendee, action: 'checkin' };
    } catch (error) {
      console.error('QR scan error:', error);
      return { success: false, error: 'Failed to process QR code' };
    }
  }

  // Manual attendee lookup
  async searchAttendees(query: string, eventId: string): Promise<AttendeeInfo[]> {
    await this.initDB();

    const tx = this.db!.transaction('attendees', 'readonly');
    const attendees = await tx.store.index('eventId').getAll(eventId);
    
    const searchTerm = query.toLowerCase();
    return attendees.filter(attendee => 
      attendee.name.toLowerCase().includes(searchTerm) ||
      attendee.email.toLowerCase().includes(searchTerm) ||
      (attendee.phone && attendee.phone.includes(searchTerm))
    );
  }

  // Perform check-in
  async performCheckin(attendee: AttendeeInfo, method: 'qr' | 'manual' | 'override'): Promise<void> {
    await this.initDB();

    const checkinRecord: CheckinRecord = {
      id: `checkin-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      attendeeId: attendee.id,
      eventId: attendee.eventId,
      timestamp: new Date().toISOString(),
      staffId: this.currentStaffId,
      method,
      synced: false
    };

    // Store check-in record
    await this.db!.put('checkins', checkinRecord);

    // Update attendee status
    const updatedAttendee = { ...attendee, status: 'used' as const };
    await this.db!.put('attendees', updatedAttendee);

    // Attempt to sync if online
    if (navigator.onLine) {
      this.syncCheckin(checkinRecord).catch(console.error);
    }
  }

  // Get check-in record for attendee
  async getCheckinByAttendee(attendeeId: string): Promise<CheckinRecord | null> {
    await this.initDB();

    const tx = this.db!.transaction('checkins', 'readonly');
    const checkins = await tx.store.getAll();
    
    return checkins.find(checkin => checkin.attendeeId === attendeeId) || null;
  }

  // Get event statistics
  async getEventStats(eventId: string): Promise<EventStats> {
    await this.initDB();

    const tx = this.db!.transaction(['attendees', 'checkins'], 'readonly');
    
    // Get all attendees for event
    const attendees = await tx.objectStore('attendees').index('eventId').getAll(eventId);
    
    // Get all check-ins for event
    const checkins = await tx.objectStore('checkins').index('eventId').getAll(eventId);

    // Calculate arrival rate (checkins in last hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentCheckins = checkins.filter(checkin => 
      new Date(checkin.timestamp) > oneHourAgo
    );

    const vipCount = attendees.filter(a => a.isVIP).length;

    return {
      eventId,
      eventName: 'Chicago Stepping Workshop', // Mock data
      totalCapacity: attendees.length,
      checkedIn: checkins.length,
      arrivalRate: recentCheckins.length,
      vipCount
    };
  }

  // Sync check-in with server
  private async syncCheckin(checkin: CheckinRecord): Promise<void> {
    try {
      // Mock API call - in real app, would POST to server
      console.log('Syncing check-in:', checkin);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Mark as synced
      const updatedCheckin = { ...checkin, synced: true };
      await this.db!.put('checkins', updatedCheckin);
    } catch (error) {
      console.error('Failed to sync check-in:', error);
    }
  }

  // Sync all pending check-ins
  async syncPendingCheckins(): Promise<void> {
    await this.initDB();

    const tx = this.db!.transaction('checkins', 'readonly');
    const unsyncedCheckins = await tx.store.index('synced').getAll(false);

    for (const checkin of unsyncedCheckins) {
      await this.syncCheckin(checkin);
    }
  }

  // Emergency override check-in
  async emergencyCheckin(attendeeId: string, reason: string): Promise<void> {
    await this.initDB();

    const attendee = await this.db!.get('attendees', attendeeId);
    if (!attendee) {
      throw new Error('Attendee not found');
    }

    console.log(`Emergency check-in: ${reason}`);
    await this.performCheckin(attendee, 'override');
  }

  // Get attendees by event
  async getEventAttendees(eventId: string): Promise<AttendeeInfo[]> {
    await this.initDB();
    return await this.db!.getAllFromIndex('attendees', 'eventId', eventId);
  }

  // Clear event data (for switching events)
  async clearEventData(eventId: string): Promise<void> {
    await this.initDB();

    const tx = this.db!.transaction(['attendees', 'checkins'], 'readwrite');
    
    // Remove attendees for this event
    const attendees = await tx.objectStore('attendees').index('eventId').getAll(eventId);
    for (const attendee of attendees) {
      await tx.objectStore('attendees').delete(attendee.id);
    }

    // Remove check-ins for this event
    const checkins = await tx.objectStore('checkins').index('eventId').getAll(eventId);
    for (const checkin of checkins) {
      await tx.objectStore('checkins').delete(checkin.id);
    }

    await tx.done;
  }
}

export const pwaCheckinService = new PWACheckinService();