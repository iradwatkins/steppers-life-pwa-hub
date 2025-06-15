import { CheckinRecord, AttendeeInfo, TicketInfo, checkinService } from './checkinService';
import CryptoJS from 'crypto-js';

// Extended attendee info for PWA display
export interface PWAAttendeeInfo extends AttendeeInfo {
  ticketInfo: TicketInfo;
  checkinRecord?: CheckinRecord;
  isCheckedIn: boolean;
  checkinTime?: Date;
  checkinMethod?: 'qr_scan' | 'manual' | 'self_service';
  staffId?: string;
  notes?: string;
  isVIP: boolean;
  specialRequests?: string[];
  tags?: string[];
  purchaseId: string;
  purchaseDate: Date;
  groupSize?: number;
  isGroupLeader?: boolean;
}

// Search and filter options
export interface AttendeeFilterOptions {
  search?: string;
  checkinStatus?: 'all' | 'checked_in' | 'not_checked_in';
  ticketType?: string;
  isVIP?: boolean;
  purchaseDateRange?: { start: Date; end: Date };
  specialRequests?: boolean;
  tags?: string[];
}

// Bulk operation types
export interface BulkOperation {
  type: 'checkin' | 'export' | 'notify' | 'tag' | 'note';
  attendeeIds: string[];
  data?: any;
}

// Attendee list metadata
export interface AttendeeListMetadata {
  eventId: string;
  totalAttendees: number;
  checkedInCount: number;
  vipCount: number;
  capacityUtilization: number;
  lastUpdated: Date;
  offlineMode: boolean;
  syncStatus: 'synced' | 'pending_sync' | 'sync_failed';
}

// Export formats
export type ExportFormat = 'csv' | 'json' | 'pdf';

class PWAAttendeeService {
  private encryptionKey = 'steppers-life-pwa-attendees';
  private cachePrefix = 'pwa-attendees-';
  private attendeeCache = new Map<string, PWAAttendeeInfo[]>();
  private metadataCache = new Map<string, AttendeeListMetadata>();
  private offlineQueue: any[] = [];
  private isOnline = navigator.onLine;
  private eventListeners: ((data: any) => void)[] = [];

  constructor() {
    // Set up online/offline detection
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncOfflineData();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // Auto-sync every 30 seconds when online
    setInterval(() => {
      if (this.isOnline) {
        this.syncOfflineData();
      }
    }, 30000);

    // Listen to checkin service updates
    checkinService.addEventListener((event) => {
      this.handleCheckinUpdate(event);
    });
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

  // Get attendees for an event with filtering
  async getAttendees(
    eventId: string, 
    filters?: AttendeeFilterOptions
  ): Promise<{ attendees: PWAAttendeeInfo[]; metadata: AttendeeListMetadata }> {
    try {
      // Try to get from cache first
      let attendees = this.attendeeCache.get(eventId);
      let metadata = this.metadataCache.get(eventId);

      // If not in memory, try offline cache
      if (!attendees) {
        const cachedData = await this.getFromOfflineCache(eventId);
        if (cachedData) {
          attendees = cachedData.attendees;
          metadata = cachedData.metadata;
          // Store in memory for faster access
          this.attendeeCache.set(eventId, attendees);
          this.metadataCache.set(eventId, metadata);
        }
      }

      // If still no data, generate mock data (in real app, fetch from API)
      if (!attendees) {
        const mockData = this.generateMockAttendees(eventId);
        attendees = mockData.attendees;
        metadata = mockData.metadata;
        
        // Cache the data
        this.attendeeCache.set(eventId, attendees);
        this.metadataCache.set(eventId, metadata);
        await this.saveToOfflineCache(eventId, attendees, metadata);
      }

      // Apply filters
      const filteredAttendees = this.applyFilters(attendees, filters);

      // Update metadata with filtered counts
      const filteredMetadata: AttendeeListMetadata = {
        ...metadata,
        totalAttendees: filteredAttendees.length,
        checkedInCount: filteredAttendees.filter(a => a.isCheckedIn).length,
        vipCount: filteredAttendees.filter(a => a.isVIP).length,
        capacityUtilization: (filteredAttendees.filter(a => a.isCheckedIn).length / filteredAttendees.length) * 100,
        lastUpdated: new Date(),
        offlineMode: !this.isOnline
      };

      return { attendees: filteredAttendees, metadata: filteredMetadata };
    } catch (error) {
      console.error('Error getting attendees:', error);
      throw error;
    }
  }

  // Get single attendee details
  async getAttendeeDetails(eventId: string, attendeeId: string): Promise<PWAAttendeeInfo | null> {
    try {
      const { attendees } = await this.getAttendees(eventId);
      return attendees.find(a => a.attendeeId === attendeeId) || null;
    } catch (error) {
      console.error('Error getting attendee details:', error);
      return null;
    }
  }

  // Search attendees by various criteria
  async searchAttendees(eventId: string, query: string): Promise<PWAAttendeeInfo[]> {
    try {
      const { attendees } = await this.getAttendees(eventId);
      const searchTerm = query.toLowerCase().trim();

      if (!searchTerm) return attendees;

      return attendees.filter(attendee => {
        return (
          attendee.firstName.toLowerCase().includes(searchTerm) ||
          attendee.lastName.toLowerCase().includes(searchTerm) ||
          attendee.email.toLowerCase().includes(searchTerm) ||
          (attendee.phone && attendee.phone.includes(searchTerm)) ||
          attendee.ticketInfo.ticketId.toLowerCase().includes(searchTerm) ||
          attendee.ticketInfo.ticketType.toLowerCase().includes(searchTerm) ||
          (attendee.tags && attendee.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
        );
      });
    } catch (error) {
      console.error('Error searching attendees:', error);
      return [];
    }
  }

  // Manual check-in for attendee
  async checkInAttendee(
    eventId: string, 
    attendeeId: string, 
    staffId: string, 
    notes?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const attendee = await this.getAttendeeDetails(eventId, attendeeId);
      if (!attendee) {
        return { success: false, error: 'Attendee not found' };
      }

      if (attendee.isCheckedIn) {
        return { success: false, error: 'Attendee already checked in' };
      }

      // Use checkin service for actual check-in
      const checkinResult = await checkinService.processCheckin(
        attendee.ticketInfo.ticketId,
        eventId,
        'manual',
        staffId,
        notes
      );

      // Update local cache
      attendee.isCheckedIn = true;
      attendee.checkinTime = checkinResult.checkinTime;
      attendee.checkinMethod = checkinResult.checkinMethod;
      attendee.staffId = checkinResult.staffId;
      attendee.notes = checkinResult.notes;
      attendee.checkinRecord = checkinResult;

      // Update cache
      const cachedAttendees = this.attendeeCache.get(eventId);
      if (cachedAttendees) {
        const index = cachedAttendees.findIndex(a => a.attendeeId === attendeeId);
        if (index !== -1) {
          cachedAttendees[index] = attendee;
          this.attendeeCache.set(eventId, cachedAttendees);
          await this.saveToOfflineCache(eventId, cachedAttendees, this.metadataCache.get(eventId)!);
        }
      }

      // Notify listeners
      this.notifyListeners('attendee_checked_in', { eventId, attendee });

      return { success: true };
    } catch (error) {
      console.error('Error checking in attendee:', error);
      return { success: false, error: `Check-in failed: ${error}` };
    }
  }

  // Bulk operations on attendees
  async performBulkOperation(
    eventId: string, 
    operation: BulkOperation
  ): Promise<{ success: boolean; results: any[]; errors: string[] }> {
    try {
      const results: any[] = [];
      const errors: string[] = [];

      for (const attendeeId of operation.attendeeIds) {
        try {
          switch (operation.type) {
            case 'checkin':
              const checkinResult = await this.checkInAttendee(
                eventId, 
                attendeeId, 
                operation.data?.staffId || 'bulk_operation',
                operation.data?.notes || 'Bulk check-in operation'
              );
              results.push({ attendeeId, result: checkinResult });
              if (!checkinResult.success) {
                errors.push(`${attendeeId}: ${checkinResult.error}`);
              }
              break;

            case 'tag':
              // Add tags to attendee
              const attendee = await this.getAttendeeDetails(eventId, attendeeId);
              if (attendee) {
                attendee.tags = [...(attendee.tags || []), ...(operation.data?.tags || [])];
                results.push({ attendeeId, result: 'Tags added' });
              } else {
                errors.push(`${attendeeId}: Attendee not found`);
              }
              break;

            case 'note':
              // Add note to attendee
              const noteAttendee = await this.getAttendeeDetails(eventId, attendeeId);
              if (noteAttendee) {
                noteAttendee.notes = operation.data?.note || '';
                results.push({ attendeeId, result: 'Note added' });
              } else {
                errors.push(`${attendeeId}: Attendee not found`);
              }
              break;

            default:
              errors.push(`${attendeeId}: Unknown operation type`);
          }
        } catch (error) {
          errors.push(`${attendeeId}: ${error}`);
        }
      }

      return {
        success: errors.length === 0,
        results,
        errors
      };
    } catch (error) {
      console.error('Error performing bulk operation:', error);
      return {
        success: false,
        results: [],
        errors: [`Bulk operation failed: ${error}`]
      };
    }
  }

  // Export attendee list in various formats
  async exportAttendeeList(
    eventId: string, 
    format: ExportFormat, 
    filters?: AttendeeFilterOptions
  ): Promise<{ success: boolean; data?: string; filename?: string; error?: string }> {
    try {
      const { attendees, metadata } = await this.getAttendees(eventId, filters);

      switch (format) {
        case 'csv':
          const csvData = this.generateCSV(attendees);
          return {
            success: true,
            data: csvData,
            filename: `attendees_${eventId}_${new Date().toISOString().split('T')[0]}.csv`
          };

        case 'json':
          const jsonData = JSON.stringify({ attendees, metadata }, null, 2);
          return {
            success: true,
            data: jsonData,
            filename: `attendees_${eventId}_${new Date().toISOString().split('T')[0]}.json`
          };

        case 'pdf':
          // In a real app, you would generate PDF here
          return {
            success: true,
            data: 'PDF generation not implemented in demo',
            filename: `attendees_${eventId}_${new Date().toISOString().split('T')[0]}.pdf`
          };

        default:
          return { success: false, error: 'Unsupported export format' };
      }
    } catch (error) {
      console.error('Error exporting attendee list:', error);
      return { success: false, error: `Export failed: ${error}` };
    }
  }

  // Apply filters to attendee list
  private applyFilters(
    attendees: PWAAttendeeInfo[], 
    filters?: AttendeeFilterOptions
  ): PWAAttendeeInfo[] {
    if (!filters) return attendees;

    let filtered = [...attendees];

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(attendee => {
        return (
          attendee.firstName.toLowerCase().includes(searchTerm) ||
          attendee.lastName.toLowerCase().includes(searchTerm) ||
          attendee.email.toLowerCase().includes(searchTerm) ||
          (attendee.phone && attendee.phone.includes(searchTerm)) ||
          attendee.ticketInfo.ticketId.toLowerCase().includes(searchTerm)
        );
      });
    }

    // Check-in status filter
    if (filters.checkinStatus && filters.checkinStatus !== 'all') {
      filtered = filtered.filter(attendee => {
        return filters.checkinStatus === 'checked_in' ? attendee.isCheckedIn : !attendee.isCheckedIn;
      });
    }

    // Ticket type filter
    if (filters.ticketType) {
      filtered = filtered.filter(attendee => 
        attendee.ticketInfo.ticketType === filters.ticketType
      );
    }

    // VIP filter
    if (filters.isVIP !== undefined) {
      filtered = filtered.filter(attendee => attendee.isVIP === filters.isVIP);
    }

    // Purchase date range filter
    if (filters.purchaseDateRange) {
      filtered = filtered.filter(attendee => {
        const purchaseDate = attendee.purchaseDate;
        return purchaseDate >= filters.purchaseDateRange!.start && 
               purchaseDate <= filters.purchaseDateRange!.end;
      });
    }

    // Special requests filter
    if (filters.specialRequests) {
      filtered = filtered.filter(attendee => 
        attendee.specialRequests && attendee.specialRequests.length > 0
      );
    }

    // Tags filter
    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter(attendee => 
        attendee.tags && filters.tags!.some(tag => attendee.tags!.includes(tag))
      );
    }

    return filtered;
  }

  // Generate CSV data
  private generateCSV(attendees: PWAAttendeeInfo[]): string {
    const headers = [
      'Attendee ID',
      'First Name',
      'Last Name',
      'Email',
      'Phone',
      'Ticket Type',
      'Ticket ID',
      'Is VIP',
      'Check-in Status',
      'Check-in Time',
      'Check-in Method',
      'Purchase Date',
      'Special Requests',
      'Tags',
      'Notes'
    ];

    const rows = attendees.map(attendee => [
      attendee.attendeeId,
      attendee.firstName,
      attendee.lastName,
      attendee.email,
      attendee.phone || '',
      attendee.ticketInfo.ticketType,
      attendee.ticketInfo.ticketId,
      attendee.isVIP ? 'Yes' : 'No',
      attendee.isCheckedIn ? 'Checked In' : 'Not Checked In',
      attendee.checkinTime ? attendee.checkinTime.toISOString() : '',
      attendee.checkinMethod || '',
      attendee.purchaseDate.toISOString(),
      (attendee.specialRequests || []).join('; '),
      (attendee.tags || []).join('; '),
      attendee.notes || ''
    ]);

    return [headers, ...rows].map(row => 
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n');
  }

  // Handle check-in service updates
  private handleCheckinUpdate(event: any) {
    if (event.type === 'checkin_completed') {
      const { eventId, checkinRecord } = event.data;
      const attendees = this.attendeeCache.get(eventId);
      
      if (attendees) {
        const attendee = attendees.find(a => a.ticketInfo.ticketId === checkinRecord.ticketId);
        if (attendee) {
          attendee.isCheckedIn = true;
          attendee.checkinTime = checkinRecord.checkinTime;
          attendee.checkinMethod = checkinRecord.checkinMethod;
          attendee.staffId = checkinRecord.staffId;
          attendee.notes = checkinRecord.notes;
          attendee.checkinRecord = checkinRecord;
          
          this.attendeeCache.set(eventId, attendees);
          this.notifyListeners('attendee_updated', { eventId, attendee });
        }
      }
    }
  }

  // Generate mock attendee data
  private generateMockAttendees(eventId: string): { attendees: PWAAttendeeInfo[]; metadata: AttendeeListMetadata } {
    const attendees: PWAAttendeeInfo[] = [];
    const totalCount = 150;
    const checkedInCount = Math.floor(totalCount * 0.6); // 60% checked in

    const ticketTypes = ['General Admission', 'VIP', 'Early Bird', 'Group', 'Comp'];
    const names = [
      ['John', 'Smith'], ['Sarah', 'Johnson'], ['Mike', 'Williams'], ['Emily', 'Brown'],
      ['David', 'Jones'], ['Lisa', 'Garcia'], ['Chris', 'Miller'], ['Ashley', 'Davis'],
      ['Matthew', 'Rodriguez'], ['Jessica', 'Martinez'], ['Daniel', 'Hernandez'], ['Amanda', 'Lopez'],
      ['James', 'Gonzalez'], ['Michelle', 'Wilson'], ['Robert', 'Anderson'], ['Stephanie', 'Thomas']
    ];

    for (let i = 0; i < totalCount; i++) {
      const [firstName, lastName] = names[i % names.length];
      const ticketType = ticketTypes[Math.floor(Math.random() * ticketTypes.length)];
      const isVIP = ticketType === 'VIP';
      const isCheckedIn = i < checkedInCount;
      const purchaseDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);

      const attendee: PWAAttendeeInfo = {
        attendeeId: `attendee_${i + 1}`,
        firstName: `${firstName}${i > 15 ? ` ${Math.floor(i/16) + 1}` : ''}`,
        lastName,
        email: `${firstName.toLowerCase()}${i > 15 ? Math.floor(i/16) + 1 : ''}.${lastName.toLowerCase()}@example.com`,
        phone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
        ticketInfo: {
          ticketId: `ticket_${eventId}_${i + 1}`,
          eventId,
          ticketType,
          purchaseDate,
          qrCode: `qr_${eventId}_${i + 1}`,
          isTransferable: true,
          price: isVIP ? 150 : 75,
          currency: 'USD',
          validFrom: new Date(Date.now() - 24 * 60 * 60 * 1000),
          validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000),
          seatNumber: isVIP ? `VIP-${i + 1}` : undefined,
          section: isVIP ? 'VIP Section' : 'General'
        },
        isCheckedIn,
        checkinTime: isCheckedIn ? new Date(Date.now() - Math.random() * 4 * 60 * 60 * 1000) : undefined,
        checkinMethod: isCheckedIn ? (Math.random() > 0.5 ? 'qr_scan' : 'manual') : undefined,
        isVIP,
        specialRequests: Math.random() > 0.8 ? ['Wheelchair access', 'Dietary restrictions'] : undefined,
        tags: Math.random() > 0.7 ? ['First-time attendee', 'Newsletter subscriber'] : undefined,
        purchaseId: `purchase_${i + 1}`,
        purchaseDate,
        groupSize: Math.random() > 0.8 ? Math.floor(Math.random() * 4) + 2 : 1,
        isGroupLeader: Math.random() > 0.9,
        accessibilityNeeds: Math.random() > 0.9 ? ['Wheelchair access'] : undefined,
        dietaryRestrictions: Math.random() > 0.8 ? ['Vegetarian', 'Gluten-free'] : undefined,
        emergencyContact: {
          name: `Emergency Contact ${i + 1}`,
          phone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`
        }
      };

      attendees.push(attendee);
    }

    const metadata: AttendeeListMetadata = {
      eventId,
      totalAttendees: totalCount,
      checkedInCount,
      vipCount: attendees.filter(a => a.isVIP).length,
      capacityUtilization: (checkedInCount / totalCount) * 100,
      lastUpdated: new Date(),
      offlineMode: !this.isOnline,
      syncStatus: 'synced'
    };

    return { attendees, metadata };
  }

  // Offline cache management
  private async saveToOfflineCache(
    eventId: string, 
    attendees: PWAAttendeeInfo[], 
    metadata: AttendeeListMetadata
  ): Promise<void> {
    try {
      const cacheData = { attendees, metadata };
      const encrypted = this.encrypt(cacheData);
      localStorage.setItem(`${this.cachePrefix}${eventId}`, encrypted);

      // Also store in IndexedDB for better offline support
      if ('indexedDB' in window) {
        await this.storeInIndexedDB(`attendees-${eventId}`, cacheData);
      }
    } catch (error) {
      console.error('Failed to save to offline cache:', error);
    }
  }

  private async getFromOfflineCache(eventId: string): Promise<{ attendees: PWAAttendeeInfo[]; metadata: AttendeeListMetadata } | null> {
    try {
      // Try localStorage first
      const cached = localStorage.getItem(`${this.cachePrefix}${eventId}`);
      if (cached) {
        return this.decrypt(cached);
      }

      // Try IndexedDB if localStorage fails
      if ('indexedDB' in window) {
        return await this.getFromIndexedDB(`attendees-${eventId}`);
      }

      return null;
    } catch (error) {
      console.error('Failed to get from offline cache:', error);
      return null;
    }
  }

  // Sync offline data when connection is restored
  private async syncOfflineData(): Promise<void> {
    try {
      if (this.offlineQueue.length > 0) {
        // Process offline queue
        for (const operation of this.offlineQueue) {
          // In a real app, sync with server
          console.log('Syncing offline operation:', operation);
        }
        this.offlineQueue = [];
      }

      // Update sync status for all cached events
      this.metadataCache.forEach((metadata, eventId) => {
        metadata.syncStatus = 'synced';
        metadata.offlineMode = false;
        metadata.lastUpdated = new Date();
      });

      this.notifyListeners('sync_completed', { timestamp: new Date() });
    } catch (error) {
      console.error('Failed to sync offline data:', error);
    }
  }

  // Encryption/decryption utilities
  private encrypt(data: any): string {
    return CryptoJS.AES.encrypt(JSON.stringify(data), this.encryptionKey).toString();
  }

  private decrypt(encryptedData: string): any {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, this.encryptionKey);
      const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
      return JSON.parse(decryptedData);
    } catch (error) {
      console.error('Failed to decrypt data:', error);
      return null;
    }
  }

  // IndexedDB utilities
  private async storeInIndexedDB(key: string, data: any): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('SteppersLifePWA', 1);
      
      request.onerror = () => reject(request.error);
      
      request.onsuccess = () => {
        const db = request.result;
        try {
          const transaction = db.transaction(['attendees'], 'readwrite');
          const store = transaction.objectStore('attendees');
          store.put({ key, data, timestamp: Date.now() });
          
          transaction.oncomplete = () => resolve();
          transaction.onerror = () => reject(transaction.error);
        } catch (error) {
          reject(error);
        }
      };
      
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('attendees')) {
          db.createObjectStore('attendees', { keyPath: 'key' });
        }
      };
    });
  }

  private async getFromIndexedDB(key: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('SteppersLifePWA', 1);
      
      request.onerror = () => reject(request.error);
      
      request.onsuccess = () => {
        const db = request.result;
        try {
          const transaction = db.transaction(['attendees'], 'readonly');
          const store = transaction.objectStore('attendees');
          const getRequest = store.get(key);
          
          getRequest.onsuccess = () => {
            resolve(getRequest.result?.data || null);
          };
          getRequest.onerror = () => reject(getRequest.error);
        } catch (error) {
          reject(error);
        }
      };
    });
  }
}

export const pwaAttendeeService = new PWAAttendeeService(); 