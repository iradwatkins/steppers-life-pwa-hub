import { openDB, IDBPDatabase } from 'idb';
import CryptoJS from 'crypto-js';

export interface PWAAttendeeInfo {
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
  checkedIn: boolean;
  checkinTimestamp?: string;
  checkinMethod?: 'qr' | 'manual' | 'override';
  staffId?: string;
  emergencyContact?: string;
  specialRequirements?: string;
  totalPaid: number;
  compTicket: boolean;
}

export interface AttendeeFilters {
  searchTerm?: string;
  checkinStatus?: 'all' | 'checked-in' | 'not-checked-in';
  ticketType?: string;
  isVIP?: boolean;
  purchaseDateRange?: {
    start: string;
    end: string;
  };
}

export interface AttendeeSortOptions {
  field: 'name' | 'checkinTimestamp' | 'purchaseDate' | 'ticketType';
  direction: 'asc' | 'desc';
}

export interface BulkOperation {
  type: 'checkin' | 'export' | 'notify';
  attendeeIds: string[];
  notes?: string;
}

export interface AttendeeExport {
  format: 'csv' | 'json';
  fields: string[];
  attendees: PWAAttendeeInfo[];
}

class PWAAttendeeService {
  private db: IDBPDatabase | null = null;
  private encryptionKey = 'pwa-attendee-key-2024';
  private lastSyncTime: Date | null = null;

  async initDB() {
    if (this.db) return this.db;

    this.db = await openDB('PWAAttendeeDB', 2, {
      upgrade(db) {
        // Attendees store
        if (!db.objectStoreNames.contains('attendees')) {
          const attendeeStore = db.createObjectStore('attendees', { keyPath: 'id' });
          attendeeStore.createIndex('eventId', 'eventId');
          attendeeStore.createIndex('email', 'email');
          attendeeStore.createIndex('checkedIn', 'checkedIn');
          attendeeStore.createIndex('ticketType', 'ticketType');
        }

        // Sync queue for offline operations
        if (!db.objectStoreNames.contains('syncQueue')) {
          db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
        }

        // Settings store
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      },
    });

    return this.db;
  }

  private encrypt(data: string): string {
    return CryptoJS.AES.encrypt(data, this.encryptionKey).toString();
  }

  private decrypt(encryptedData: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedData, this.encryptionKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  async getAllAttendees(eventId: string): Promise<PWAAttendeeInfo[]> {
    await this.initDB();
    const tx = this.db!.transaction('attendees', 'readonly');
    const store = tx.objectStore('attendees');
    const index = store.index('eventId');
    
    return await index.getAll(eventId);
  }

  async searchAttendees(
    eventId: string, 
    searchTerm: string
  ): Promise<PWAAttendeeInfo[]> {
    const allAttendees = await this.getAllAttendees(eventId);
    const term = searchTerm.toLowerCase();
    
    return allAttendees.filter(attendee => 
      attendee.name.toLowerCase().includes(term) ||
      attendee.email.toLowerCase().includes(term) ||
      (attendee.phone && attendee.phone.includes(term)) ||
      attendee.ticketId.toLowerCase().includes(term)
    );
  }

  async filterAttendees(
    eventId: string,
    filters: AttendeeFilters
  ): Promise<PWAAttendeeInfo[]> {
    let attendees = await this.getAllAttendees(eventId);

    // Apply search filter
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      attendees = attendees.filter(attendee => 
        attendee.name.toLowerCase().includes(term) ||
        attendee.email.toLowerCase().includes(term) ||
        (attendee.phone && attendee.phone.includes(term)) ||
        attendee.ticketId.toLowerCase().includes(term)
      );
    }

    // Apply checkin status filter
    if (filters.checkinStatus && filters.checkinStatus !== 'all') {
      attendees = attendees.filter(attendee => {
        if (filters.checkinStatus === 'checked-in') return attendee.checkedIn;
        if (filters.checkinStatus === 'not-checked-in') return !attendee.checkedIn;
        return true;
      });
    }

    // Apply ticket type filter
    if (filters.ticketType) {
      attendees = attendees.filter(attendee => 
        attendee.ticketType === filters.ticketType
      );
    }

    // Apply VIP filter
    if (filters.isVIP !== undefined) {
      attendees = attendees.filter(attendee => 
        attendee.isVIP === filters.isVIP
      );
    }

    // Apply purchase date range filter
    if (filters.purchaseDateRange) {
      const startDate = new Date(filters.purchaseDateRange.start);
      const endDate = new Date(filters.purchaseDateRange.end);
      
      attendees = attendees.filter(attendee => {
        const purchaseDate = new Date(attendee.purchaseDate);
        return purchaseDate >= startDate && purchaseDate <= endDate;
      });
    }

    return attendees;
  }

  async sortAttendees(
    attendees: PWAAttendeeInfo[],
    sortOptions: AttendeeSortOptions
  ): Promise<PWAAttendeeInfo[]> {
    return [...attendees].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortOptions.field) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'checkinTimestamp':
          aValue = a.checkinTimestamp ? new Date(a.checkinTimestamp) : new Date(0);
          bValue = b.checkinTimestamp ? new Date(b.checkinTimestamp) : new Date(0);
          break;
        case 'purchaseDate':
          aValue = new Date(a.purchaseDate);
          bValue = new Date(b.purchaseDate);
          break;
        case 'ticketType':
          aValue = a.ticketType.toLowerCase();
          bValue = b.ticketType.toLowerCase();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOptions.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOptions.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  async getAttendeeById(attendeeId: string): Promise<PWAAttendeeInfo | null> {
    await this.initDB();
    const tx = this.db!.transaction('attendees', 'readonly');
    const store = tx.objectStore('attendees');
    
    return await store.get(attendeeId) || null;
  }

  async bulkCheckin(
    attendeeIds: string[],
    staffId: string,
    notes?: string
  ): Promise<{ success: string[]; failed: string[] }> {
    await this.initDB();
    const success: string[] = [];
    const failed: string[] = [];

    const tx = this.db!.transaction('attendees', 'readwrite');
    const store = tx.objectStore('attendees');

    for (const attendeeId of attendeeIds) {
      try {
        const attendee = await store.get(attendeeId);
        if (attendee && !attendee.checkedIn) {
          attendee.checkedIn = true;
          attendee.checkinTimestamp = new Date().toISOString();
          attendee.checkinMethod = 'manual';
          attendee.staffId = staffId;
          if (notes) {
            attendee.specialNotes = (attendee.specialNotes || '') + `\nBulk checkin: ${notes}`;
          }
          
          await store.put(attendee);
          success.push(attendeeId);
        } else {
          failed.push(attendeeId);
        }
      } catch (error) {
        failed.push(attendeeId);
      }
    }

    // Add to sync queue for online sync
    await this.addToSyncQueue({
      type: 'bulk_checkin',
      data: { attendeeIds: success, staffId, notes },
      timestamp: new Date().toISOString()
    });

    return { success, failed };
  }

  async exportAttendees(exportConfig: AttendeeExport): Promise<string> {
    const { format, fields, attendees } = exportConfig;

    if (format === 'csv') {
      const headers = fields.join(',');
      const rows = attendees.map(attendee => 
        fields.map(field => {
          const value = (attendee as any)[field];
          return typeof value === 'string' && value.includes(',') 
            ? `"${value}"` 
            : value || '';
        }).join(',')
      );
      
      return [headers, ...rows].join('\n');
    } else {
      // JSON format
      const exportData = attendees.map(attendee => {
        const filteredAttendee: any = {};
        fields.forEach(field => {
          filteredAttendee[field] = (attendee as any)[field];
        });
        return filteredAttendee;
      });
      
      return JSON.stringify(exportData, null, 2);
    }
  }

  async getEventStats(eventId: string): Promise<{
    total: number;
    checkedIn: number;
    notCheckedIn: number;
    vipCount: number;
    compTickets: number;
    revenueTotal: number;
    ticketTypes: Record<string, number>;
    checkinRate: number;
  }> {
    const attendees = await this.getAllAttendees(eventId);
    
    const stats = {
      total: attendees.length,
      checkedIn: attendees.filter(a => a.checkedIn).length,
      notCheckedIn: attendees.filter(a => !a.checkedIn).length,
      vipCount: attendees.filter(a => a.isVIP).length,
      compTickets: attendees.filter(a => a.compTicket).length,
      revenueTotal: attendees.reduce((sum, a) => sum + a.totalPaid, 0),
      ticketTypes: {} as Record<string, number>,
      checkinRate: 0
    };

    // Calculate ticket type breakdown
    attendees.forEach(attendee => {
      stats.ticketTypes[attendee.ticketType] = 
        (stats.ticketTypes[attendee.ticketType] || 0) + 1;
    });

    // Calculate checkin rate
    stats.checkinRate = stats.total > 0 
      ? Math.round((stats.checkedIn / stats.total) * 100) 
      : 0;

    return stats;
  }

  private async addToSyncQueue(operation: any) {
    await this.initDB();
    const tx = this.db!.transaction('syncQueue', 'readwrite');
    const store = tx.objectStore('syncQueue');
    
    await store.add({
      ...operation,
      encrypted: this.encrypt(JSON.stringify(operation))
    });
  }

  async syncWithServer(): Promise<boolean> {
    try {
      // In a real implementation, this would sync with the server
      // For now, we'll simulate successful sync
      await this.initDB();
      const tx = this.db!.transaction('syncQueue', 'readwrite');
      const store = tx.objectStore('syncQueue');
      
      // Clear sync queue after successful sync
      await store.clear();
      this.lastSyncTime = new Date();
      
      return true;
    } catch (error) {
      console.error('Sync failed:', error);
      return false;
    }
  }

  async isOnline(): Promise<boolean> {
    return navigator.onLine;
  }

  getLastSyncTime(): Date | null {
    return this.lastSyncTime;
  }

  // Mock data loader for development
  async loadMockAttendees(eventId: string): Promise<void> {
    await this.initDB();
    const tx = this.db!.transaction('attendees', 'readwrite');
    const store = tx.objectStore('attendees');

    const mockAttendees: PWAAttendeeInfo[] = [
      {
        id: 'att-001',
        name: 'John Smith',
        email: 'john.smith@email.com',
        phone: '+1-555-0101',
        ticketId: 'TKT-001',
        eventId,
        ticketType: 'General Admission',
        isVIP: false,
        purchaseDate: '2024-12-15T10:00:00Z',
        status: 'valid',
        checkedIn: true,
        checkinTimestamp: '2024-12-20T09:15:00Z',
        checkinMethod: 'qr',
        staffId: 'staff-001',
        totalPaid: 75.00,
        compTicket: false
      },
      {
        id: 'att-002',
        name: 'Sarah Johnson',
        email: 'sarah.j@email.com',
        ticketId: 'TKT-002',
        eventId,
        ticketType: 'VIP',
        isVIP: true,
        specialNotes: 'Wheelchair accessibility required',
        purchaseDate: '2024-12-10T14:30:00Z',
        status: 'valid',
        checkedIn: false,
        totalPaid: 150.00,
        compTicket: false,
        emergencyContact: 'Mike Johnson - 555-0102'
      },
      {
        id: 'att-003',
        name: 'Mike Davis',
        email: 'mike.davis@email.com',
        phone: '+1-555-0103',
        ticketId: 'TKT-003',
        eventId,
        ticketType: 'General Admission',
        isVIP: false,
        purchaseDate: '2024-12-18T16:45:00Z',
        status: 'valid',
        checkedIn: false,
        totalPaid: 75.00,
        compTicket: false
      },
      {
        id: 'att-004',
        name: 'Emily Wilson',
        email: 'emily.w@email.com',
        ticketId: 'TKT-004',
        eventId,
        ticketType: 'Comp',
        isVIP: false,
        specialNotes: 'Press credential',
        purchaseDate: '2024-12-12T11:20:00Z',
        status: 'valid',
        checkedIn: true,
        checkinTimestamp: '2024-12-20T08:45:00Z',
        checkinMethod: 'manual',
        staffId: 'staff-002',
        totalPaid: 0.00,
        compTicket: true
      }
    ];

    for (const attendee of mockAttendees) {
      await store.put(attendee);
    }
  }
}

export const pwaAttendeeService = new PWAAttendeeService();