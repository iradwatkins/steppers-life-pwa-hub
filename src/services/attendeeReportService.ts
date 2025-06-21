import { supabase } from '@/integrations/supabase/client';

export interface AttendeeInfo {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  ticketType: string;
  purchaseDate: string;
  checkInStatus: 'not_checked_in' | 'checked_in' | 'no_show';
  checkInTime?: string;
  ticketId: string;
  totalPaid: number;
  paymentMethod: string;
  specialRequests?: string;
  vipStatus: boolean;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  dietaryRestrictions?: string[];
  notes?: string;
  referralSource?: string;
  groupBooking?: string;
}

export interface AttendeeAnalytics {
  totalAttendees: number;
  checkedInCount: number;
  noShowCount: number;
  checkInRate: number;
  averageTicketPrice: number;
  totalRevenue: number;
  vipCount: number;
  registrationTimeline: {
    date: string;
    registrations: number;
    revenue: number;
  }[];
  ticketTypeDistribution: {
    type: string;
    count: number;
    percentage: number;
    revenue: number;
  }[];
  geographicBreakdown: {
    location: string;
    count: number;
    percentage: number;
  }[];
  paymentMethodBreakdown: {
    method: string;
    count: number;
    percentage: number;
    totalAmount: number;
  }[];
}

export interface FilterOptions {
  ticketType?: string;
  checkInStatus?: 'all' | 'checked_in' | 'not_checked_in' | 'no_show';
  vipStatus?: boolean;
  purchaseDateRange?: {
    start: string;
    end: string;
  };
  searchTerm?: string;
  paymentMethod?: string;
  hasSpecialRequests?: boolean;
}

export interface BulkOperation {
  type: 'check_in' | 'add_note' | 'update_vip' | 'send_notification' | 'export';
  attendeeIds: string[];
  data?: any;
}

export class AttendeeReportService {
  static async getEventAttendees(eventId: string, filters?: FilterOptions): Promise<AttendeeInfo[]> {
    try {
      // Build query with joins
      let query = supabase
        .from('ticket_purchases')
        .select(`
          *,
          profiles(*),
          ticket_types(*),
          event_check_ins(*)
        `)
        .eq('event_id', eventId);

      // Apply filters
      if (filters?.ticketType) {
        query = query.eq('ticket_types.name', filters.ticketType);
      }

      if (filters?.purchaseDateRange) {
        query = query
          .gte('created_at', filters.purchaseDateRange.start)
          .lte('created_at', filters.purchaseDateRange.end);
      }

      if (filters?.paymentMethod) {
        query = query.eq('payment_method', filters.paymentMethod);
      }

      const { data: purchases, error } = await query;
      if (error) throw error;

      // Transform data to AttendeeInfo format
      const attendees: AttendeeInfo[] = (purchases || []).map(purchase => {
        const profile = purchase.profiles;
        const ticketType = purchase.ticket_types;
        const checkIn = purchase.event_check_ins?.[0];

        let checkInStatus: 'not_checked_in' | 'checked_in' | 'no_show' = 'not_checked_in';
        if (checkIn) {
          checkInStatus = 'checked_in';
        } else {
          const eventDate = new Date(); // In real app, get from event
          const now = new Date();
          if (now > eventDate) {
            checkInStatus = 'no_show';
          }
        }

        return {
          id: purchase.id,
          firstName: profile?.first_name || '',
          lastName: profile?.last_name || '',
          email: profile?.email || '',
          phone: profile?.phone || '',
          ticketType: ticketType?.name || 'General',
          purchaseDate: purchase.created_at,
          checkInStatus,
          checkInTime: checkIn?.checked_in_at,
          ticketId: purchase.id,
          totalPaid: purchase.total_amount || 0,
          paymentMethod: purchase.payment_method || 'online',
          specialRequests: purchase.special_requests,
          vipStatus: ticketType?.name?.toLowerCase().includes('vip') || false,
          notes: purchase.notes,
          referralSource: purchase.referral_source,
          groupBooking: purchase.group_booking_id
        };
      });

      // Apply additional filters
      let filteredAttendees = attendees;

      if (filters?.checkInStatus && filters.checkInStatus !== 'all') {
        filteredAttendees = filteredAttendees.filter(a => a.checkInStatus === filters.checkInStatus);
      }

      if (filters?.vipStatus !== undefined) {
        filteredAttendees = filteredAttendees.filter(a => a.vipStatus === filters.vipStatus);
      }

      if (filters?.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        filteredAttendees = filteredAttendees.filter(a =>
          a.firstName.toLowerCase().includes(term) ||
          a.lastName.toLowerCase().includes(term) ||
          a.email.toLowerCase().includes(term) ||
          a.phone?.includes(term) ||
          a.ticketId.includes(term)
        );
      }

      if (filters?.hasSpecialRequests) {
        filteredAttendees = filteredAttendees.filter(a => a.specialRequests);
      }

      return filteredAttendees;
    } catch (error) {
      console.error('Error fetching attendees:', error);
      throw error;
    }
  }

  static async getAttendeeAnalytics(eventId: string): Promise<AttendeeAnalytics> {
    try {
      const attendees = await this.getEventAttendees(eventId);

      const checkedInCount = attendees.filter(a => a.checkInStatus === 'checked_in').length;
      const noShowCount = attendees.filter(a => a.checkInStatus === 'no_show').length;
      const totalRevenue = attendees.reduce((sum, a) => sum + a.totalPaid, 0);
      const vipCount = attendees.filter(a => a.vipStatus).length;

      // Registration timeline
      const timelineMap = new Map<string, { registrations: number; revenue: number }>();
      attendees.forEach(attendee => {
        const date = new Date(attendee.purchaseDate).toISOString().split('T')[0];
        if (!timelineMap.has(date)) {
          timelineMap.set(date, { registrations: 0, revenue: 0 });
        }
        const entry = timelineMap.get(date)!;
        entry.registrations += 1;
        entry.revenue += attendee.totalPaid;
      });

      const registrationTimeline = Array.from(timelineMap.entries())
        .map(([date, data]) => ({ date, ...data }))
        .sort((a, b) => a.date.localeCompare(b.date));

      // Ticket type distribution
      const ticketTypeMap = new Map<string, { count: number; revenue: number }>();
      attendees.forEach(attendee => {
        if (!ticketTypeMap.has(attendee.ticketType)) {
          ticketTypeMap.set(attendee.ticketType, { count: 0, revenue: 0 });
        }
        const entry = ticketTypeMap.get(attendee.ticketType)!;
        entry.count += 1;
        entry.revenue += attendee.totalPaid;
      });

      const ticketTypeDistribution = Array.from(ticketTypeMap.entries()).map(([type, data]) => ({
        type,
        count: data.count,
        percentage: (data.count / attendees.length) * 100,
        revenue: data.revenue
      }));

      // Geographic breakdown (mock data)
      const geographicBreakdown = [
        { location: 'Chicago, IL', count: Math.floor(attendees.length * 0.6), percentage: 60 },
        { location: 'Milwaukee, WI', count: Math.floor(attendees.length * 0.2), percentage: 20 },
        { location: 'Indianapolis, IN', count: Math.floor(attendees.length * 0.1), percentage: 10 },
        { location: 'Other', count: Math.floor(attendees.length * 0.1), percentage: 10 }
      ];

      // Payment method breakdown
      const paymentMethodMap = new Map<string, { count: number; totalAmount: number }>();
      attendees.forEach(attendee => {
        if (!paymentMethodMap.has(attendee.paymentMethod)) {
          paymentMethodMap.set(attendee.paymentMethod, { count: 0, totalAmount: 0 });
        }
        const entry = paymentMethodMap.get(attendee.paymentMethod)!;
        entry.count += 1;
        entry.totalAmount += attendee.totalPaid;
      });

      const paymentMethodBreakdown = Array.from(paymentMethodMap.entries()).map(([method, data]) => ({
        method,
        count: data.count,
        percentage: (data.count / attendees.length) * 100,
        totalAmount: data.totalAmount
      }));

      return {
        totalAttendees: attendees.length,
        checkedInCount,
        noShowCount,
        checkInRate: attendees.length > 0 ? (checkedInCount / attendees.length) * 100 : 0,
        averageTicketPrice: attendees.length > 0 ? totalRevenue / attendees.length : 0,
        totalRevenue,
        vipCount,
        registrationTimeline,
        ticketTypeDistribution,
        geographicBreakdown,
        paymentMethodBreakdown
      };
    } catch (error) {
      console.error('Error fetching attendee analytics:', error);
      throw error;
    }
  }

  static async getAttendeeDetails(attendeeId: string): Promise<AttendeeInfo | null> {
    try {
      const { data: purchase, error } = await supabase
        .from('ticket_purchases')
        .select(`
          *,
          profiles(*),
          ticket_types(*),
          event_check_ins(*)
        `)
        .eq('id', attendeeId)
        .single();

      if (error) throw error;
      if (!purchase) return null;

      const profile = purchase.profiles;
      const ticketType = purchase.ticket_types;
      const checkIn = purchase.event_check_ins?.[0];

      let checkInStatus: 'not_checked_in' | 'checked_in' | 'no_show' = 'not_checked_in';
      if (checkIn) {
        checkInStatus = 'checked_in';
      }

      return {
        id: purchase.id,
        firstName: profile?.first_name || '',
        lastName: profile?.last_name || '',
        email: profile?.email || '',
        phone: profile?.phone || '',
        ticketType: ticketType?.name || 'General',
        purchaseDate: purchase.created_at,
        checkInStatus,
        checkInTime: checkIn?.checked_in_at,
        ticketId: purchase.id,
        totalPaid: purchase.total_amount || 0,
        paymentMethod: purchase.payment_method || 'online',
        specialRequests: purchase.special_requests,
        vipStatus: ticketType?.name?.toLowerCase().includes('vip') || false,
        notes: purchase.notes,
        referralSource: purchase.referral_source,
        groupBooking: purchase.group_booking_id
      };
    } catch (error) {
      console.error('Error fetching attendee details:', error);
      throw error;
    }
  }

  static async executeBulkOperation(operation: BulkOperation): Promise<void> {
    try {
      switch (operation.type) {
        case 'check_in':
          await this.bulkCheckIn(operation.attendeeIds);
          break;
        case 'add_note':
          await this.bulkAddNote(operation.attendeeIds, operation.data.note);
          break;
        case 'update_vip':
          await this.bulkUpdateVipStatus(operation.attendeeIds, operation.data.vipStatus);
          break;
        case 'send_notification':
          await this.bulkSendNotification(operation.attendeeIds, operation.data);
          break;
        default:
          throw new Error('Unsupported bulk operation');
      }
    } catch (error) {
      console.error('Error executing bulk operation:', error);
      throw error;
    }
  }

  private static async bulkCheckIn(attendeeIds: string[]): Promise<void> {
    const checkInPromises = attendeeIds.map(id =>
      supabase.from('event_check_ins').insert({
        ticket_purchase_id: id,
        checked_in_at: new Date().toISOString(),
        check_in_method: 'manual'
      })
    );

    await Promise.all(checkInPromises);
  }

  private static async bulkAddNote(attendeeIds: string[], note: string): Promise<void> {
    const updatePromises = attendeeIds.map(id =>
      supabase
        .from('ticket_purchases')
        .update({ notes: note })
        .eq('id', id)
    );

    await Promise.all(updatePromises);
  }

  private static async bulkUpdateVipStatus(attendeeIds: string[], vipStatus: boolean): Promise<void> {
    // This would typically update a separate VIP status field
    console.log('Bulk VIP status update not implemented in current schema');
  }

  private static async bulkSendNotification(attendeeIds: string[], notificationData: any): Promise<void> {
    // Integration with notification system would go here
    console.log('Bulk notification sending not implemented');
  }

  static async exportAttendeeData(
    eventId: string, 
    format: 'csv' | 'excel' | 'pdf',
    filters?: FilterOptions,
    fields?: string[]
  ): Promise<string> {
    try {
      const attendees = await this.getEventAttendees(eventId, filters);
      
      switch (format) {
        case 'csv':
          return this.exportToCSV(attendees, fields);
        case 'excel':
          return 'Excel export not implemented yet';
        case 'pdf':
          return 'PDF export not implemented yet';
        default:
          throw new Error('Unsupported export format');
      }
    } catch (error) {
      console.error('Error exporting attendee data:', error);
      throw error;
    }
  }

  private static exportToCSV(attendees: AttendeeInfo[], fields?: string[]): string {
    const defaultFields = [
      'firstName', 'lastName', 'email', 'phone', 'ticketType', 
      'purchaseDate', 'checkInStatus', 'totalPaid', 'paymentMethod'
    ];
    
    const exportFields = fields || defaultFields;
    
    const headers = exportFields.map(field => {
      switch (field) {
        case 'firstName': return 'First Name';
        case 'lastName': return 'Last Name';
        case 'email': return 'Email';
        case 'phone': return 'Phone';
        case 'ticketType': return 'Ticket Type';
        case 'purchaseDate': return 'Purchase Date';
        case 'checkInStatus': return 'Check-in Status';
        case 'checkInTime': return 'Check-in Time';
        case 'totalPaid': return 'Amount Paid';
        case 'paymentMethod': return 'Payment Method';
        case 'specialRequests': return 'Special Requests';
        case 'vipStatus': return 'VIP Status';
        case 'notes': return 'Notes';
        default: return field;
      }
    });

    const rows = [
      headers,
      ...attendees.map(attendee => 
        exportFields.map(field => {
          const value = attendee[field as keyof AttendeeInfo];
          if (value === null || value === undefined) return '';
          if (typeof value === 'boolean') return value ? 'Yes' : 'No';
          if (typeof value === 'number') return value.toString();
          if (field === 'purchaseDate' || field === 'checkInTime') {
            return value ? new Date(value as string).toLocaleString() : '';
          }
          return String(value);
        })
      )
    ];

    return rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  }

  static async updateAttendeeNotes(attendeeId: string, notes: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('ticket_purchases')
        .update({ notes })
        .eq('id', attendeeId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating attendee notes:', error);
      throw error;
    }
  }

  static async checkInAttendee(attendeeId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('event_check_ins')
        .insert({
          ticket_purchase_id: attendeeId,
          checked_in_at: new Date().toISOString(),
          check_in_method: 'manual'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error checking in attendee:', error);
      throw error;
    }
  }
}