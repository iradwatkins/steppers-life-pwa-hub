import { CheckinRecord, AttendeeInfo, TicketInfo, checkinService } from './checkinService';
import { inventoryService } from './inventoryService';
import { emailCampaignService } from './emailCampaignService';
import { notificationService } from './notificationService';
import { Event, TicketType } from './eventService';

// Extended attendee info for organizer reports
export interface AttendeeReportInfo extends AttendeeInfo {
  attendeeId: string;
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
  refundStatus?: 'none' | 'requested' | 'approved' | 'completed';
  groupSize?: number;
  isGroupLeader?: boolean;
  totalSpent: number;
  discountsApplied?: string[];
  lastActivity: Date;
  communicationHistory: CommunicationRecord[];
  privacyConsent: boolean;
  dataRetentionExpiry?: Date;
}

// Communication history
export interface CommunicationRecord {
  id: string;
  type: 'email' | 'sms' | 'notification' | 'call';
  subject?: string;
  sentAt: Date;
  status: 'sent' | 'delivered' | 'opened' | 'clicked' | 'failed';
  staffId?: string;
}

// Advanced filtering options
export interface AttendeeFilterOptions {
  search?: string;
  checkinStatus?: 'all' | 'checked_in' | 'not_checked_in';
  ticketTypes?: string[];
  isVIP?: boolean;
  purchaseDateRange?: { start: Date; end: Date };
  refundStatus?: 'none' | 'requested' | 'approved' | 'completed';
  hasSpecialRequests?: boolean;
  tags?: string[];
  totalSpentRange?: { min: number; max: number };
  communicationStatus?: 'contacted' | 'not_contacted' | 'bounced';
  lastActivityRange?: { start: Date; end: Date };
}

// Bulk operations
export interface BulkOperation {
  type: 'checkin' | 'export' | 'email' | 'sms' | 'tag' | 'note' | 'vip_status' | 'privacy_update';
  attendeeIds: string[];
  data?: any;
  staffId: string;
  reason?: string;
}

// Analytics data
export interface AttendeeAnalytics {
  totalAttendees: number;
  checkedInCount: number;
  checkinRate: number;
  vipCount: number;
  refundRequests: number;
  averageTicketValue: number;
  registrationTimeline: { date: Date; count: number }[];
  ticketTypeDistribution: { type: string; count: number; percentage: number }[];
  geographicBreakdown: { location: string; count: number; percentage: number }[];
  communicationStats: { type: string; sent: number; opened: number; clicked: number }[];
  attendeeLifecycle: { stage: string; count: number }[];
  specialRequestsCount: number;
  groupBookingsCount: number;
}

// Export configuration
export interface ExportConfig {
  format: 'csv' | 'excel' | 'pdf';
  fields: string[];
  includePersonalData: boolean;
  includeCommunicationHistory: boolean;
  filterOptions?: AttendeeFilterOptions;
  customFields?: { [key: string]: string };
}

// Privacy audit log
export interface PrivacyAuditRecord {
  id: string;
  attendeeId: string;
  action: 'view' | 'export' | 'update' | 'delete' | 'communication';
  staffId: string;
  timestamp: Date;
  details: string;
  ipAddress?: string;
  justification?: string;
}

// Attendee Report Service - Comprehensive attendee information management
export interface AttendeeProfile {
  id: string;
  eventId: string;
  userId?: string;
  
  // Basic Information
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  
  // Registration Details
  ticketId: string;
  ticketType: TicketType;
  purchaseDate: Date;
  registrationDate: Date;
  orderNumber: string;
  
  // Status Information
  checkInStatus: 'not_checked_in' | 'checked_in' | 'no_show';
  checkInTime?: Date;
  vipStatus: boolean;
  
  // Additional Information
  specialRequests?: string;
  dietaryRestrictions?: string;
  accessibilityNeeds?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  
  // Custom Questions Responses
  customResponses?: Record<string, any>;
  
  // Organizer Notes
  organizerNotes?: string;
  tags?: string[];
  
  // Privacy and Compliance
  dataProcessingConsent: boolean;
  marketingConsent: boolean;
  lastAccessedAt?: Date;
  dataRetentionDate?: Date;
  
  // Analytics Data
  source?: string; // How they found the event
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  
  // Engagement
  emailOpens?: number;
  emailClicks?: number;
  lastEmailInteraction?: Date;
}

export interface AttendeeFilters {
  search?: string;
  ticketTypeIds?: string[];
  checkInStatus?: AttendeeProfile['checkInStatus'][];
  vipStatus?: boolean;
  purchaseDateRange?: {
    start: Date;
    end: Date;
  };
  tags?: string[];
  hasSpecialRequests?: boolean;
  source?: string[];
}

export interface AttendeeSort {
  field: 'firstName' | 'lastName' | 'email' | 'purchaseDate' | 'checkInTime' | 'ticketType';
  direction: 'asc' | 'desc';
}

export interface AttendeeActivity {
  id: string;
  attendeeId: string;
  type: 'registration' | 'check_in' | 'email_sent' | 'note_added' | 'tag_added' | 'status_change';
  description: string;
  timestamp: Date;
  performedBy?: string; // User ID of who performed the action
  metadata?: Record<string, any>;
}

class AttendeeReportService {
  private static instance: AttendeeReportService;
  private attendees: Map<string, AttendeeProfile[]> = new Map(); // eventId -> attendees
  private activities: Map<string, AttendeeActivity[]> = new Map(); // attendeeId -> activities
  private accessLog: Array<{ userId: string; action: string; timestamp: Date; attendeeId?: string }> = [];

  static getInstance(): AttendeeReportService {
    if (!AttendeeReportService.instance) {
      AttendeeReportService.instance = new AttendeeReportService();
    }
    return AttendeeReportService.instance;
  }

  // Initialize with mock data
  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // Mock attendees for different events
    const mockAttendees: AttendeeProfile[] = [
      {
        id: 'att_001',
        eventId: 'event_001',
        userId: 'user_123',
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@email.com',
        phone: '+1-555-0123',
        ticketId: 'tkt_001',
        ticketType: {
          id: 'early_bird',
          name: 'Early Bird',
          price: 25,
          currency: 'USD',
          description: 'Early bird pricing',
          quantity: 100,
          sold: 45,
          salesStartDate: new Date('2024-01-01'),
          salesEndDate: new Date('2024-12-31'),
          isActive: true
        },
        purchaseDate: new Date('2024-11-15'),
        registrationDate: new Date('2024-11-15'),
        orderNumber: 'ORD-2024-001',
        checkInStatus: 'checked_in',
        checkInTime: new Date('2024-12-20T19:30:00'),
        vipStatus: false,
        specialRequests: 'Vegetarian meal preference',
        dataProcessingConsent: true,
        marketingConsent: true,
        source: 'social_media',
        utmSource: 'facebook',
        utmMedium: 'social',
        utmCampaign: 'holiday_event',
        emailOpens: 3,
        emailClicks: 1,
        lastEmailInteraction: new Date('2024-12-18'),
        organizerNotes: 'Regular attendee, very engaged',
        tags: ['regular', 'engaged']
      },
      {
        id: 'att_002',
        eventId: 'event_001',
        firstName: 'Michael',
        lastName: 'Chen',
        email: 'michael.chen@email.com',
        phone: '+1-555-0124',
        ticketId: 'tkt_002',
        ticketType: {
          id: 'vip',
          name: 'VIP Access',
          price: 75,
          currency: 'USD',
          description: 'VIP access with perks',
          quantity: 25,
          sold: 18,
          salesStartDate: new Date('2024-01-01'),
          salesEndDate: new Date('2024-12-31'),
          isActive: true
        },
        purchaseDate: new Date('2024-11-20'),
        registrationDate: new Date('2024-11-20'),
        orderNumber: 'ORD-2024-002',
        checkInStatus: 'not_checked_in',
        vipStatus: true,
        emergencyContact: {
          name: 'Lisa Chen',
          phone: '+1-555-0125',
          relationship: 'Spouse'
        },
        dataProcessingConsent: true,
        marketingConsent: false,
        source: 'direct',
        emailOpens: 2,
        emailClicks: 0,
        lastEmailInteraction: new Date('2024-12-19'),
        organizerNotes: 'VIP member, premium experience expected',
        tags: ['vip', 'premium']
      },
      {
        id: 'att_003',
        eventId: 'event_001',
        firstName: 'Emma',
        lastName: 'Davis',
        email: 'emma.davis@email.com',
        phone: '+1-555-0126',
        ticketId: 'tkt_003',
        ticketType: {
          id: 'regular',
          name: 'Regular Admission',
          price: 35,
          currency: 'USD',
          description: 'Standard admission',
          quantity: 200,
          sold: 156,
          salesStartDate: new Date('2024-01-01'),
          salesEndDate: new Date('2024-12-31'),
          isActive: true
        },
        purchaseDate: new Date('2024-12-01'),
        registrationDate: new Date('2024-12-01'),
        orderNumber: 'ORD-2024-003',
        checkInStatus: 'no_show',
        vipStatus: false,
        accessibilityNeeds: 'Wheelchair accessible seating',
        dataProcessingConsent: true,
        marketingConsent: true,
        source: 'email_campaign',
        utmSource: 'email',
        utmMedium: 'email',
        utmCampaign: 'december_promo',
        emailOpens: 1,
        emailClicks: 1,
        lastEmailInteraction: new Date('2024-12-15'),
        tags: ['accessibility']
      },
      {
        id: 'att_004',
        eventId: 'event_001',
        firstName: 'James',
        lastName: 'Wilson',
        email: 'james.wilson@email.com',
        phone: '+1-555-0127',
        ticketId: 'tkt_004',
        ticketType: {
          id: 'early_bird',
          name: 'Early Bird',
          price: 25,
          currency: 'USD',
          description: 'Early bird pricing',
          quantity: 100,
          sold: 45,
          salesStartDate: new Date('2024-01-01'),
          salesEndDate: new Date('2024-12-31'),
          isActive: true
        },
        purchaseDate: new Date('2024-10-30'),
        registrationDate: new Date('2024-10-30'),
        orderNumber: 'ORD-2024-004',
        checkInStatus: 'checked_in',
        checkInTime: new Date('2024-12-20T19:15:00'),
        vipStatus: false,
        dietaryRestrictions: 'Gluten-free',
        dataProcessingConsent: true,
        marketingConsent: true,
        source: 'referral',
        emailOpens: 4,
        emailClicks: 2,
        lastEmailInteraction: new Date('2024-12-20'),
        organizerNotes: 'Early supporter, great feedback',
        tags: ['early_bird', 'feedback_provider']
      }
    ];

    this.attendees.set('event_001', mockAttendees);

    // Mock activities
    this.activities.set('att_001', [
      {
        id: 'act_001',
        attendeeId: 'att_001',
        type: 'registration',
        description: 'Registered for event with Early Bird ticket',
        timestamp: new Date('2024-11-15T10:30:00'),
        metadata: { ticketType: 'early_bird', amount: 25 }
      },
      {
        id: 'act_002',
        attendeeId: 'att_001',
        type: 'check_in',
        description: 'Checked in successfully',
        timestamp: new Date('2024-12-20T19:30:00'),
        performedBy: 'staff_001'
      }
    ]);
  }

  // Core attendee data operations
  async getEventAttendees(
    eventId: string,
    filters?: AttendeeFilters,
    sort?: AttendeeSort,
    page: number = 1,
    limit: number = 50
  ): Promise<{
    attendees: AttendeeProfile[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    this.logAccess('get_attendees', eventId);
    
    let attendees = this.attendees.get(eventId) || [];

    // Apply filters
    if (filters) {
      attendees = this.applyFilters(attendees, filters);
    }

    // Apply sorting
    if (sort) {
      attendees = this.applySorting(attendees, sort);
    }

    // Apply pagination
    const total = attendees.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const paginatedAttendees = attendees.slice(startIndex, startIndex + limit);

    return {
      attendees: paginatedAttendees,
      total,
      page,
      totalPages
    };
  }

  async getAttendeeProfile(attendeeId: string): Promise<AttendeeProfile | null> {
    this.logAccess('get_profile', undefined, attendeeId);
    
    for (const attendees of this.attendees.values()) {
      const attendee = attendees.find(a => a.id === attendeeId);
      if (attendee) {
        // Update last accessed timestamp
        attendee.lastAccessedAt = new Date();
        return attendee;
      }
    }
    return null;
  }

  async updateAttendeeProfile(attendeeId: string, updates: Partial<AttendeeProfile>): Promise<AttendeeProfile | null> {
    this.logAccess('update_profile', undefined, attendeeId);
    
    for (const attendees of this.attendees.values()) {
      const attendeeIndex = attendees.findIndex(a => a.id === attendeeId);
      if (attendeeIndex !== -1) {
        const attendee = attendees[attendeeIndex];
        const updatedAttendee = { ...attendee, ...updates };
        attendees[attendeeIndex] = updatedAttendee;
        
        // Log activity
        this.addActivity(attendeeId, {
          type: 'note_added',
          description: 'Profile updated',
          metadata: { updates: Object.keys(updates) }
        });
        
        return updatedAttendee;
      }
    }
    return null;
  }

  // Analytics and reporting
  async getAttendeeAnalytics(eventId: string): Promise<AttendeeAnalytics> {
    this.logAccess('get_analytics', eventId);
    
    const attendees = this.attendees.get(eventId) || [];
    
    const totalAttendees = attendees.length;
    const checkedInCount = attendees.filter(a => a.checkInStatus === 'checked_in').length;
    const noShowCount = attendees.filter(a => a.checkInStatus === 'no_show').length;
    const vipCount = attendees.filter(a => a.vipStatus).length;

    // Registration timeline
    const registrationByDay = this.generateRegistrationTimeline(attendees);
    
    // Ticket type distribution
    const ticketTypeDistribution = this.generateTicketTypeDistribution(attendees);
    
    // Source breakdown
    const sourceBreakdown = this.generateSourceBreakdown(attendees);
    
    // Email engagement
    const emailEngagement = this.calculateEmailEngagement(attendees);

    return {
      totalAttendees,
      checkedInCount,
      noShowCount,
      vipCount,
      registrationByDay,
      ticketTypeDistribution,
      sourceBreakdown,
      emailEngagement
    };
  }

  // Bulk operations
  async performBulkOperation(operation: BulkOperation): Promise<{ success: boolean; affectedCount: number; errors?: string[] }> {
    this.logAccess('bulk_operation');
    
    let affectedCount = 0;
    const errors: string[] = [];

    for (const attendeeId of operation.attendeeIds) {
      try {
        switch (operation.type) {
          case 'add_tag':
            await this.addTagToAttendee(attendeeId, operation.data.tag);
            break;
          case 'remove_tag':
            await this.removeTagFromAttendee(attendeeId, operation.data.tag);
            break;
          case 'add_note':
            await this.addNoteToAttendee(attendeeId, operation.data.note);
            break;
          case 'set_vip':
            await this.setVipStatus(attendeeId, true);
            break;
          case 'remove_vip':
            await this.setVipStatus(attendeeId, false);
            break;
          case 'send_email':
            // Would integrate with email service
            break;
        }
        affectedCount++;
      } catch (error) {
        errors.push(`Failed to process attendee ${attendeeId}: ${error}`);
      }
    }

    return {
      success: errors.length === 0,
      affectedCount,
      errors: errors.length > 0 ? errors : undefined
    };
  }

  // Export functionality
  async exportAttendees(eventId: string, options: ExportOptions): Promise<Blob> {
    this.logAccess('export_data', eventId);
    
    const { attendees } = await this.getEventAttendees(eventId, options.filters);
    
    switch (options.format) {
      case 'csv':
        return this.exportToCSV(attendees, options);
      case 'excel':
        return this.exportToExcel(attendees, options);
      case 'pdf':
        return this.exportToPDF(attendees, options);
      default:
        throw new Error('Unsupported export format');
    }
  }

  // Activity tracking
  async getAttendeeActivities(attendeeId: string): Promise<AttendeeActivity[]> {
    return this.activities.get(attendeeId) || [];
  }

  // Helper methods
  private applyFilters(attendees: AttendeeProfile[], filters: AttendeeFilters): AttendeeProfile[] {
    let filtered = attendees;

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(a => 
        a.firstName.toLowerCase().includes(searchTerm) ||
        a.lastName.toLowerCase().includes(searchTerm) ||
        a.email.toLowerCase().includes(searchTerm) ||
        a.phone?.includes(searchTerm) ||
        a.ticketId.toLowerCase().includes(searchTerm)
      );
    }

    if (filters.ticketTypeIds?.length) {
      filtered = filtered.filter(a => filters.ticketTypeIds!.includes(a.ticketType.id));
    }

    if (filters.checkInStatus?.length) {
      filtered = filtered.filter(a => filters.checkInStatus!.includes(a.checkInStatus));
    }

    if (filters.vipStatus !== undefined) {
      filtered = filtered.filter(a => a.vipStatus === filters.vipStatus);
    }

    if (filters.purchaseDateRange) {
      filtered = filtered.filter(a => 
        a.purchaseDate >= filters.purchaseDateRange!.start &&
        a.purchaseDate <= filters.purchaseDateRange!.end
      );
    }

    if (filters.tags?.length) {
      filtered = filtered.filter(a => 
        a.tags?.some(tag => filters.tags!.includes(tag))
      );
    }

    if (filters.hasSpecialRequests) {
      filtered = filtered.filter(a => !!a.specialRequests);
    }

    if (filters.source?.length) {
      filtered = filtered.filter(a => 
        a.source && filters.source!.includes(a.source)
      );
    }

    return filtered;
  }

  private applySorting(attendees: AttendeeProfile[], sort: AttendeeSort): AttendeeProfile[] {
    return [...attendees].sort((a, b) => {
      let aValue: any = a[sort.field];
      let bValue: any = b[sort.field];

      if (sort.field === 'ticketType') {
        aValue = a.ticketType.name;
        bValue = b.ticketType.name;
      }

      if (aValue < bValue) return sort.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sort.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  private generateRegistrationTimeline(attendees: AttendeeProfile[]) {
    const timeline = new Map<string, { count: number; revenue: number }>();
    
    attendees.forEach(attendee => {
      const date = attendee.registrationDate.toISOString().split('T')[0];
      const current = timeline.get(date) || { count: 0, revenue: 0 };
      timeline.set(date, {
        count: current.count + 1,
        revenue: current.revenue + attendee.ticketType.price
      });
    });

    return Array.from(timeline.entries()).map(([date, data]) => ({
      date,
      ...data
    })).sort((a, b) => a.date.localeCompare(b.date));
  }

  private generateTicketTypeDistribution(attendees: AttendeeProfile[]) {
    const distribution = new Map<string, { ticketType: TicketType; count: number }>();
    
    attendees.forEach(attendee => {
      const key = attendee.ticketType.id;
      const current = distribution.get(key) || { ticketType: attendee.ticketType, count: 0 };
      distribution.set(key, { ...current, count: current.count + 1 });
    });

    const total = attendees.length;
    return Array.from(distribution.values()).map(item => ({
      ...item,
      percentage: (item.count / total) * 100
    }));
  }

  private generateSourceBreakdown(attendees: AttendeeProfile[]) {
    const breakdown = new Map<string, number>();
    
    attendees.forEach(attendee => {
      const source = attendee.source || 'unknown';
      breakdown.set(source, (breakdown.get(source) || 0) + 1);
    });

    const total = attendees.length;
    return Array.from(breakdown.entries()).map(([source, count]) => ({
      source,
      count,
      percentage: (count / total) * 100
    })).sort((a, b) => b.count - a.count);
  }

  private calculateEmailEngagement(attendees: AttendeeProfile[]) {
    const totalOpens = attendees.reduce((sum, a) => sum + (a.emailOpens || 0), 0);
    const totalClicks = attendees.reduce((sum, a) => sum + (a.emailClicks || 0), 0);
    const attendeesWithEmails = attendees.filter(a => a.emailOpens !== undefined).length;

    return {
      averageOpens: attendeesWithEmails > 0 ? totalOpens / attendeesWithEmails : 0,
      averageClicks: attendeesWithEmails > 0 ? totalClicks / attendeesWithEmails : 0,
      openRate: attendeesWithEmails > 0 ? (attendees.filter(a => (a.emailOpens || 0) > 0).length / attendeesWithEmails) * 100 : 0,
      clickRate: attendeesWithEmails > 0 ? (attendees.filter(a => (a.emailClicks || 0) > 0).length / attendeesWithEmails) * 100 : 0
    };
  }

  private async addTagToAttendee(attendeeId: string, tag: string): Promise<void> {
    const attendee = await this.getAttendeeProfile(attendeeId);
    if (attendee) {
      const tags = attendee.tags || [];
      if (!tags.includes(tag)) {
        await this.updateAttendeeProfile(attendeeId, { tags: [...tags, tag] });
        this.addActivity(attendeeId, {
          type: 'tag_added',
          description: `Tag added: ${tag}`
        });
      }
    }
  }

  private async removeTagFromAttendee(attendeeId: string, tag: string): Promise<void> {
    const attendee = await this.getAttendeeProfile(attendeeId);
    if (attendee && attendee.tags) {
      const tags = attendee.tags.filter(t => t !== tag);
      await this.updateAttendeeProfile(attendeeId, { tags });
      this.addActivity(attendeeId, {
        type: 'tag_added',
        description: `Tag removed: ${tag}`
      });
    }
  }

  private async addNoteToAttendee(attendeeId: string, note: string): Promise<void> {
    const attendee = await this.getAttendeeProfile(attendeeId);
    if (attendee) {
      const existingNotes = attendee.organizerNotes || '';
      const newNotes = existingNotes ? `${existingNotes}\n\n${note}` : note;
      await this.updateAttendeeProfile(attendeeId, { organizerNotes: newNotes });
      this.addActivity(attendeeId, {
        type: 'note_added',
        description: 'Note added by organizer'
      });
    }
  }

  private async setVipStatus(attendeeId: string, vipStatus: boolean): Promise<void> {
    await this.updateAttendeeProfile(attendeeId, { vipStatus });
    this.addActivity(attendeeId, {
      type: 'status_change',
      description: `VIP status ${vipStatus ? 'enabled' : 'disabled'}`
    });
  }

  private addActivity(attendeeId: string, activity: Omit<AttendeeActivity, 'id' | 'attendeeId' | 'timestamp'>): void {
    const activities = this.activities.get(attendeeId) || [];
    const newActivity: AttendeeActivity = {
      id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      attendeeId,
      timestamp: new Date(),
      ...activity
    };
    
    activities.unshift(newActivity);
    this.activities.set(attendeeId, activities);
  }

  private logAccess(action: string, eventId?: string, attendeeId?: string): void {
    this.accessLog.push({
      userId: 'current_user', // Would get from auth context
      action,
      timestamp: new Date(),
      attendeeId
    });
  }

  private exportToCSV(attendees: AttendeeProfile[], options: ExportOptions): Blob {
    const headers = options.fields.map(field => field.toString());
    const rows = attendees.map(attendee => 
      options.fields.map(field => {
        const value = attendee[field];
        if (value instanceof Date) return value.toISOString();
        if (typeof value === 'object') return JSON.stringify(value);
        return value?.toString() || '';
      })
    );

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  }

  private exportToExcel(attendees: AttendeeProfile[], options: ExportOptions): Blob {
    // For now, return CSV format - would integrate with a library like xlsx for real Excel export
    return this.exportToCSV(attendees, options);
  }

  private exportToPDF(attendees: AttendeeProfile[], options: ExportOptions): Blob {
    // Mock PDF export - would integrate with a library like jsPDF
    const content = `Attendee Report\n\nTotal Attendees: ${attendees.length}\n\nGenerated: ${new Date().toLocaleString()}`;
    return new Blob([content], { type: 'application/pdf' });
  }
}

export const attendeeReportService = AttendeeReportService.getInstance();
export default AttendeeReportService; 