import { supabase } from '@/lib/supabase';
import {
  EventRSVP,
  CreateRSVPRequest,
  UpdateRSVPRequest,
  RSVPStats,
  ServiceResponse,
  RSVPService,
  CapacityCheck,
  RSVPAnalytics
} from '@/types/rsvp';

class RSVPServiceImpl implements RSVPService {
  
  // Core RSVP operations
  async createRSVP(data: CreateRSVPRequest): Promise<ServiceResponse<EventRSVP>> {
    try {
      // First check if event allows RSVPs and has capacity
      const capacityCheck = await this.checkEventCapacity(data.event_id);
      if (!capacityCheck.success) {
        return capacityCheck;
      }
      
      const capacity = capacityCheck.data!;
      if (!capacity.has_capacity && !capacity.waitlist_available) {
        return {
          success: false,
          error: 'Event is full and waitlist is not available'
        };
      }
      
      // Determine status based on capacity
      const status = capacity.has_capacity ? 'confirmed' : 'waitlist';
      
      const { data: rsvp, error } = await supabase
        .from('event_rsvps')
        .insert({
          ...data,
          status,
          plus_one_count: data.plus_one_count || 0
        })
        .select(`
          *,
          event:events(*)
        `)
        .single();
      
      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          return {
            success: false,
            error: 'You have already RSVPed for this event'
          };
        }
        return {
          success: false,
          error: error.message
        };
      }
      
      // Send confirmation email (implement email service separately)
      await this.sendRSVPNotification(rsvp, status === 'confirmed' ? 'confirmation' : 'waitlist');
      
      return {
        success: true,
        data: rsvp
      };
      
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create RSVP'
      };
    }
  }
  
  async updateRSVP(id: string, data: UpdateRSVPRequest): Promise<ServiceResponse<EventRSVP>> {
    try {
      const { data: rsvp, error } = await supabase
        .from('event_rsvps')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select(`
          *,
          event:events(*)
        `)
        .single();
      
      if (error) {
        return {
          success: false,
          error: error.message
        };
      }
      
      return {
        success: true,
        data: rsvp
      };
      
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update RSVP'
      };
    }
  }
  
  async cancelRSVP(id: string): Promise<ServiceResponse<EventRSVP>> {
    try {
      const { data: rsvp, error } = await supabase
        .from('event_rsvps')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select(`
          *,
          event:events(*)
        `)
        .single();
      
      if (error) {
        return {
          success: false,
          error: error.message
        };
      }
      
      // Promote someone from waitlist if applicable
      await this.promoteFromWaitlist(rsvp.event_id);
      
      return {
        success: true,
        data: rsvp
      };
      
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to cancel RSVP'
      };
    }
  }
  
  async getRSVP(id: string): Promise<ServiceResponse<EventRSVP>> {
    try {
      const { data: rsvp, error } = await supabase
        .from('event_rsvps')
        .select(`
          *,
          event:events(*)
        `)
        .eq('id', id)
        .single();
      
      if (error) {
        return {
          success: false,
          error: error.message
        };
      }
      
      return {
        success: true,
        data: rsvp
      };
      
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get RSVP'
      };
    }
  }
  
  async getRSVPByToken(token: string): Promise<ServiceResponse<EventRSVP>> {
    try {
      const { data: rsvp, error } = await supabase
        .from('event_rsvps')
        .select(`
          *,
          event:events(*)
        `)
        .eq('verification_token', token)
        .single();
      
      if (error) {
        return {
          success: false,
          error: error.message
        };
      }
      
      return {
        success: true,
        data: rsvp
      };
      
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get RSVP'
      };
    }
  }
  
  // Event RSVP management
  async getEventRSVPs(eventId: string): Promise<ServiceResponse<EventRSVP[]>> {
    try {
      const { data: rsvps, error } = await supabase
        .from('event_rsvps')
        .select(`
          *,
          event:events(*)
        `)
        .eq('event_id', eventId)
        .order('created_at', { ascending: true });
      
      if (error) {
        return {
          success: false,
          error: error.message
        };
      }
      
      return {
        success: true,
        data: rsvps || []
      };
      
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get event RSVPs'
      };
    }
  }
  
  async getEventRSVPStats(eventId: string): Promise<ServiceResponse<RSVPStats>> {
    try {
      const { data: stats, error } = await supabase
        .rpc('get_rsvp_stats', { event_uuid: eventId });
      
      if (error) {
        // Fallback to manual calculation if RPC doesn't exist
        const rsvpsResponse = await this.getEventRSVPs(eventId);
        if (!rsvpsResponse.success) {
          return rsvpsResponse as ServiceResponse<RSVPStats>;
        }
        
        const rsvps = rsvpsResponse.data!;
        const confirmed_count = rsvps.filter(r => r.status === 'confirmed' || r.status === 'checked_in').length;
        const waitlist_count = rsvps.filter(r => r.status === 'waitlist').length;
        const cancelled_count = rsvps.filter(r => r.status === 'cancelled').length;
        const checked_in_count = rsvps.filter(r => r.status === 'checked_in').length;
        
        // Get event details for capacity
        const { data: event } = await supabase
          .from('events')
          .select('max_rsvps, allow_waitlist')
          .eq('id', eventId)
          .single();
        
        const capacity_remaining = event?.max_rsvps ? event.max_rsvps - confirmed_count : undefined;
        
        return {
          success: true,
          data: {
            confirmed_count,
            waitlist_count,
            cancelled_count,
            checked_in_count,
            total_count: rsvps.length,
            capacity_remaining,
            waitlist_enabled: event?.allow_waitlist || false
          }
        };
      }
      
      return {
        success: true,
        data: stats
      };
      
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get RSVP stats'
      };
    }
  }
  
  // Check-in operations
  async checkInRSVP(id: string): Promise<ServiceResponse<EventRSVP>> {
    try {
      const { data: rsvp, error } = await supabase
        .from('event_rsvps')
        .update({
          status: 'checked_in',
          is_checked_in: true,
          checked_in_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select(`
          *,
          event:events(*)
        `)
        .single();
      
      if (error) {
        return {
          success: false,
          error: error.message
        };
      }
      
      return {
        success: true,
        data: rsvp
      };
      
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to check in RSVP'
      };
    }
  }
  
  async bulkCheckIn(ids: string[]): Promise<ServiceResponse<EventRSVP[]>> {
    try {
      const { data: rsvps, error } = await supabase
        .from('event_rsvps')
        .update({
          status: 'checked_in',
          is_checked_in: true,
          checked_in_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .in('id', ids)
        .select(`
          *,
          event:events(*)
        `);
      
      if (error) {
        return {
          success: false,
          error: error.message
        };
      }
      
      return {
        success: true,
        data: rsvps || []
      };
      
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to bulk check in RSVPs'
      };
    }
  }
  
  // Waitlist operations
  async promoteFromWaitlist(eventId: string): Promise<ServiceResponse<EventRSVP[]>> {
    try {
      // Check if there's capacity available
      const capacityCheck = await this.checkEventCapacity(eventId);
      if (!capacityCheck.success || !capacityCheck.data!.has_capacity) {
        return {
          success: true,
          data: [] // No promotions possible
        };
      }
      
      // Get oldest waitlist entry
      const { data: waitlistRSVP, error: fetchError } = await supabase
        .from('event_rsvps')
        .select('*')
        .eq('event_id', eventId)
        .eq('status', 'waitlist')
        .order('created_at', { ascending: true })
        .limit(1)
        .single();
      
      if (fetchError || !waitlistRSVP) {
        return {
          success: true,
          data: [] // No one on waitlist
        };
      }
      
      // Promote to confirmed
      const { data: promoted, error: updateError } = await supabase
        .from('event_rsvps')
        .update({
          status: 'confirmed',
          updated_at: new Date().toISOString()
        })
        .eq('id', waitlistRSVP.id)
        .select(`
          *,
          event:events(*)
        `);
      
      if (updateError) {
        return {
          success: false,
          error: updateError.message
        };
      }
      
      // Send promotion notification
      if (promoted && promoted.length > 0) {
        await this.sendRSVPNotification(promoted[0], 'promoted');
      }
      
      return {
        success: true,
        data: promoted || []
      };
      
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to promote from waitlist'
      };
    }
  }
  
  async getWaitlistPosition(id: string): Promise<ServiceResponse<number>> {
    try {
      const { data: rsvp } = await supabase
        .from('event_rsvps')
        .select('event_id, created_at')
        .eq('id', id)
        .single();
      
      if (!rsvp) {
        return {
          success: false,
          error: 'RSVP not found'
        };
      }
      
      const { data: position, error } = await supabase
        .from('event_rsvps')
        .select('id')
        .eq('event_id', rsvp.event_id)
        .eq('status', 'waitlist')
        .lt('created_at', rsvp.created_at);
      
      if (error) {
        return {
          success: false,
          error: error.message
        };
      }
      
      return {
        success: true,
        data: (position?.length || 0) + 1
      };
      
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get waitlist position'
      };
    }
  }
  
  // Export and reporting
  async exportEventRSVPs(eventId: string, format: 'csv' | 'xlsx'): Promise<ServiceResponse<Blob>> {
    try {
      const rsvpsResponse = await this.getEventRSVPs(eventId);
      if (!rsvpsResponse.success) {
        return rsvpsResponse as ServiceResponse<Blob>;
      }
      
      const rsvps = rsvpsResponse.data!;
      
      if (format === 'csv') {
        const csvContent = this.convertToCSV(rsvps);
        const blob = new Blob([csvContent], { type: 'text/csv' });
        return {
          success: true,
          data: blob
        };
      } else {
        // For XLSX, you'd need to implement with a library like SheetJS
        return {
          success: false,
          error: 'XLSX export not implemented yet'
        };
      }
      
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to export RSVPs'
      };
    }
  }
  
  async sendRSVPReminders(eventId: string): Promise<ServiceResponse<{ sent: number; failed: number }>> {
    try {
      const rsvpsResponse = await this.getEventRSVPs(eventId);
      if (!rsvpsResponse.success) {
        return rsvpsResponse as ServiceResponse<{ sent: number; failed: number }>;
      }
      
      const confirmedRSVPs = rsvpsResponse.data!.filter(r => r.status === 'confirmed');
      let sent = 0;
      let failed = 0;
      
      for (const rsvp of confirmedRSVPs) {
        try {
          await this.sendRSVPNotification(rsvp, 'reminder');
          sent++;
        } catch (error) {
          failed++;
        }
      }
      
      return {
        success: true,
        data: { sent, failed }
      };
      
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send reminders'
      };
    }
  }
  
  // User operations
  async getUserRSVPs(userId: string): Promise<ServiceResponse<EventRSVP[]>> {
    try {
      const { data: rsvps, error } = await supabase
        .from('event_rsvps')
        .select(`
          *,
          event:events(*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) {
        return {
          success: false,
          error: error.message
        };
      }
      
      return {
        success: true,
        data: rsvps || []
      };
      
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get user RSVPs'
      };
    }
  }
  
  async getUserEventRSVP(userId: string, eventId: string): Promise<ServiceResponse<EventRSVP | null>> {
    try {
      const { data: rsvp, error } = await supabase
        .from('event_rsvps')
        .select(`
          *,
          event:events(*)
        `)
        .eq('user_id', userId)
        .eq('event_id', eventId)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        return {
          success: false,
          error: error.message
        };
      }
      
      return {
        success: true,
        data: rsvp || null
      };
      
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get user event RSVP'
      };
    }
  }
  
  // Helper methods
  private async checkEventCapacity(eventId: string): Promise<ServiceResponse<CapacityCheck>> {
    try {
      const { data: event, error: eventError } = await supabase
        .from('events')
        .select('max_rsvps, allow_waitlist, rsvp_enabled, status')
        .eq('id', eventId)
        .single();
      
      if (eventError) {
        return {
          success: false,
          error: eventError.message
        };
      }
      
      if (!event.rsvp_enabled) {
        return {
          success: false,
          error: 'RSVP is not enabled for this event'
        };
      }
      
      if (event.status !== 'published') {
        return {
          success: false,
          error: 'Event is not published'
        };
      }
      
      const statsResponse = await this.getEventRSVPStats(eventId);
      if (!statsResponse.success) {
        return statsResponse as ServiceResponse<CapacityCheck>;
      }
      
      const stats = statsResponse.data!;
      const hasCapacity = !event.max_rsvps || stats.confirmed_count < event.max_rsvps;
      
      return {
        success: true,
        data: {
          has_capacity: hasCapacity,
          current_count: stats.confirmed_count,
          max_capacity: event.max_rsvps,
          waitlist_available: event.allow_waitlist && !hasCapacity
        }
      };
      
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to check event capacity'
      };
    }
  }
  
  private async sendRSVPNotification(rsvp: EventRSVP, type: string): Promise<void> {
    // Implement email notification service integration
    // This would typically call your email service (SendGrid, Resend, etc.)
    console.log(`Sending ${type} notification for RSVP ${rsvp.id}`);
  }
  
  private convertToCSV(rsvps: EventRSVP[]): string {
    const headers = [
      'Name',
      'Email',
      'Phone',
      'Status',
      'Plus Ones',
      'Dietary Restrictions',
      'Accessibility Needs',
      'RSVP Date',
      'Checked In'
    ];
    
    const rows = rsvps.map(rsvp => [
      rsvp.attendee_name,
      rsvp.attendee_email,
      rsvp.attendee_phone || '',
      rsvp.status,
      rsvp.plus_one_count.toString(),
      rsvp.dietary_restrictions || '',
      rsvp.accessibility_needs || '',
      new Date(rsvp.created_at).toLocaleDateString(),
      rsvp.is_checked_in ? 'Yes' : 'No'
    ]);
    
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
    
    return csvContent;
  }
}

// Export singleton instance
export const rsvpService = new RSVPServiceImpl();