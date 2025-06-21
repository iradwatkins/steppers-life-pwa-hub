// Event Check-in Service
export interface AttendeeCheckinData {
  id: string;
  event_id: string;
  ticket_id: string;
  attendee_name: string;
  attendee_email: string;
  ticket_type: string;
  qr_code: string;
  check_in_time?: string;
  checked_in_by?: string;
  is_checked_in: boolean;
  special_requirements?: string;
  seat_assignment?: string;
}

export interface CheckinStats {
  total_attendees: number;
  checked_in: number;
  pending: number;
  no_show: number;
  check_in_rate: number;
}

export interface QRScanResult {
  success: boolean;
  attendee?: AttendeeCheckinData;
  error?: string;
  message: string;
}

class CheckinService {
  // Get all attendees for an event
  async getEventAttendees(eventId: string): Promise<AttendeeCheckinData[]> {
    try {
      // Mock data for development - replace with actual API call
      const mockAttendees: AttendeeCheckinData[] = [
        {
          id: 'att_001',
          event_id: eventId,
          ticket_id: 'tkt_001',
          attendee_name: 'Maria Rodriguez',
          attendee_email: 'maria@example.com',
          ticket_type: 'VIP Experience',
          qr_code: 'TICKET-001-SALSA-NIGHT',
          is_checked_in: true,
          check_in_time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          checked_in_by: 'staff_001',
          seat_assignment: 'VIP-A1'
        },
        {
          id: 'att_002',
          event_id: eventId,
          ticket_id: 'tkt_002',
          attendee_name: 'Carlos Mendez',
          attendee_email: 'carlos@example.com',
          ticket_type: 'General Admission',
          qr_code: 'TICKET-002-SALSA-NIGHT',
          is_checked_in: false,
          special_requirements: 'Wheelchair accessible'
        },
        {
          id: 'att_003',
          event_id: eventId,
          ticket_id: 'tkt_003',
          attendee_name: 'Sofia Chen',
          attendee_email: 'sofia@example.com',
          ticket_type: 'General Admission',
          qr_code: 'TICKET-003-SALSA-NIGHT',
          is_checked_in: true,
          check_in_time: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          checked_in_by: 'staff_002'
        },
        {
          id: 'att_004',
          event_id: eventId,
          ticket_id: 'tkt_004',
          attendee_name: 'Ahmed Hassan',
          attendee_email: 'ahmed@example.com',
          ticket_type: 'VIP Experience',
          qr_code: 'TICKET-004-SALSA-NIGHT',
          is_checked_in: false
        },
        {
          id: 'att_005',
          event_id: eventId,
          ticket_id: 'tkt_005',
          attendee_name: 'Jennifer Wu',
          attendee_email: 'jennifer@example.com',
          ticket_type: 'General Admission',
          qr_code: 'TICKET-005-SALSA-NIGHT',
          is_checked_in: true,
          check_in_time: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          checked_in_by: 'staff_001'
        }
      ];

      return mockAttendees;
    } catch (error) {
      console.error('Error fetching event attendees:', error);
      throw error;
    }
  }

  // Get check-in statistics for an event
  async getCheckinStats(eventId: string): Promise<CheckinStats> {
    try {
      const attendees = await this.getEventAttendees(eventId);
      
      const total_attendees = attendees.length;
      const checked_in = attendees.filter(a => a.is_checked_in).length;
      const pending = total_attendees - checked_in;
      const no_show = 0; // Would be calculated based on event end time
      const check_in_rate = total_attendees > 0 ? (checked_in / total_attendees) * 100 : 0;

      return {
        total_attendees,
        checked_in,
        pending,
        no_show,
        check_in_rate: Math.round(check_in_rate * 10) / 10
      };
    } catch (error) {
      console.error('Error fetching check-in stats:', error);
      throw error;
    }
  }

  // Scan QR code and validate ticket
  async scanQRCode(qrCode: string, eventId: string, staffId: string): Promise<QRScanResult> {
    try {
      // Mock validation - replace with actual API call
      const attendees = await this.getEventAttendees(eventId);
      const attendee = attendees.find(a => a.qr_code === qrCode);

      if (!attendee) {
        return {
          success: false,
          error: 'INVALID_TICKET',
          message: 'Ticket not found or invalid QR code'
        };
      }

      if (attendee.is_checked_in) {
        return {
          success: false,
          attendee,
          error: 'ALREADY_CHECKED_IN',
          message: `${attendee.attendee_name} is already checked in at ${new Date(attendee.check_in_time!).toLocaleTimeString()}`
        };
      }

      // Check-in the attendee
      const updatedAttendee = {
        ...attendee,
        is_checked_in: true,
        check_in_time: new Date().toISOString(),
        checked_in_by: staffId
      };

      return {
        success: true,
        attendee: updatedAttendee,
        message: `Welcome ${attendee.attendee_name}! Check-in successful.`
      };
    } catch (error) {
      console.error('Error scanning QR code:', error);
      return {
        success: false,
        error: 'SCAN_ERROR',
        message: 'Error processing QR code. Please try again.'
      };
    }
  }

  // Manual check-in by attendee lookup
  async checkInAttendee(attendeeId: string, staffId: string): Promise<QRScanResult> {
    try {
      // Mock implementation - replace with actual API call
      const eventId = 'current-event'; // Would be passed from context
      const attendees = await this.getEventAttendees(eventId);
      const attendee = attendees.find(a => a.id === attendeeId);

      if (!attendee) {
        return {
          success: false,
          error: 'ATTENDEE_NOT_FOUND',
          message: 'Attendee not found'
        };
      }

      if (attendee.is_checked_in) {
        return {
          success: false,
          attendee,
          error: 'ALREADY_CHECKED_IN',
          message: `${attendee.attendee_name} is already checked in`
        };
      }

      const updatedAttendee = {
        ...attendee,
        is_checked_in: true,
        check_in_time: new Date().toISOString(),
        checked_in_by: staffId
      };

      return {
        success: true,
        attendee: updatedAttendee,
        message: `${attendee.attendee_name} checked in successfully`
      };
    } catch (error) {
      console.error('Error checking in attendee:', error);
      return {
        success: false,
        error: 'CHECKIN_ERROR',
        message: 'Error checking in attendee. Please try again.'
      };
    }
  }

  // Undo check-in
  async undoCheckin(attendeeId: string, staffId: string): Promise<boolean> {
    try {
      // Mock implementation - replace with actual API call
      console.log(`Undoing check-in for attendee ${attendeeId} by staff ${staffId}`);
      return true;
    } catch (error) {
      console.error('Error undoing check-in:', error);
      return false;
    }
  }

  // Get check-in history
  async getCheckinHistory(eventId: string): Promise<any[]> {
    try {
      // Mock implementation - replace with actual API call
      const mockHistory = [
        {
          id: 'hist_001',
          attendee_name: 'Maria Rodriguez',
          action: 'CHECK_IN',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          staff_name: 'John Staff'
        },
        {
          id: 'hist_002',
          attendee_name: 'Sofia Chen',
          action: 'CHECK_IN',
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          staff_name: 'Jane Staff'
        },
        {
          id: 'hist_003',
          attendee_name: 'Jennifer Wu',
          action: 'CHECK_IN',
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          staff_name: 'John Staff'
        }
      ];

      return mockHistory;
    } catch (error) {
      console.error('Error fetching check-in history:', error);
      throw error;
    }
  }

  // Export attendee list
  async exportAttendeeList(eventId: string, format: 'csv' | 'pdf' = 'csv'): Promise<void> {
    try {
      const attendees = await this.getEventAttendees(eventId);
      
      if (format === 'csv') {
        const csvContent = this.generateCSV(attendees);
        this.downloadFile(csvContent, `attendees-${eventId}.csv`, 'text/csv');
      } else {
        // PDF export would require additional library
        console.log('PDF export not implemented yet');
      }
    } catch (error) {
      console.error('Error exporting attendee list:', error);
      throw error;
    }
  }

  private generateCSV(attendees: AttendeeCheckinData[]): string {
    const headers = ['Name', 'Email', 'Ticket Type', 'Checked In', 'Check-in Time', 'Seat Assignment'];
    const rows = attendees.map(a => [
      a.attendee_name,
      a.attendee_email,
      a.ticket_type,
      a.is_checked_in ? 'Yes' : 'No',
      a.check_in_time ? new Date(a.check_in_time).toLocaleString() : '',
      a.seat_assignment || ''
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  private downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export const checkinService = new CheckinService();
export default checkinService;