import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type TicketType = Database['public']['Tables']['ticket_types']['Row'];
type Ticket = Database['public']['Tables']['tickets']['Row'];

export interface InventoryStatus {
  ticketTypeId: string;
  available: number;
  sold: number;
  reserved: number;
  total: number;
  isAvailable: boolean;
  lastUpdated: string;
}

export interface InventoryHold {
  id: string;
  ticketTypeId: string;
  quantity: number;
  expiresAt: string;
  userId?: string;
  sessionId: string;
}

export class InventoryService {
  private static readonly HOLD_DURATION_MS = 15 * 60 * 1000; // 15 minutes
  private static readonly REFRESH_INTERVAL_MS = 30 * 1000; // 30 seconds

  // Real-time inventory tracking
  static async getInventoryStatus(ticketTypeId: string): Promise<InventoryStatus | null> {
    try {
      const { data: ticketType, error: ticketError } = await supabase
        .from('ticket_types')
        .select('*')
        .eq('id', ticketTypeId)
        .single();

      if (ticketError) throw ticketError;

      // Get current reservations (active holds)
      const { data: holds, error: holdsError } = await supabase
        .from('tickets')
        .select('id')
        .eq('ticket_type_id', ticketTypeId)
        .eq('status', 'reserved')
        .gte('reserved_until', new Date().toISOString());

      if (holdsError) throw holdsError;

      const reserved = holds?.length || 0;
      const sold = ticketType.quantity_sold;
      const total = ticketType.quantity_available;
      const available = Math.max(0, total - sold - reserved);

      return {
        ticketTypeId,
        available,
        sold,
        reserved,
        total,
        isAvailable: available > 0 && ticketType.is_active,
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error getting inventory status:', error);
      return null;
    }
  }

  // Create inventory hold for tickets during checkout
  static async createInventoryHold(
    ticketTypeId: string,
    quantity: number,
    sessionId: string,
    userId?: string
  ): Promise<InventoryHold | null> {
    try {
      // Check current availability
      const status = await this.getInventoryStatus(ticketTypeId);
      if (!status || status.available < quantity) {
        throw new Error('Insufficient tickets available');
      }

      // Create reserved tickets
      const expiresAt = new Date(Date.now() + this.HOLD_DURATION_MS).toISOString();
      const ticketsToReserve = Array.from({ length: quantity }, () => ({
        ticket_type_id: ticketTypeId,
        status: 'reserved' as const,
        reserved_until: expiresAt,
      }));

      const { data: reservedTickets, error: reserveError } = await supabase
        .from('tickets')
        .insert(ticketsToReserve)
        .select();

      if (reserveError) throw reserveError;

      return {
        id: `hold_${sessionId}_${Date.now()}`,
        ticketTypeId,
        quantity,
        expiresAt,
        userId,
        sessionId,
      };
    } catch (error) {
      console.error('Error creating inventory hold:', error);
      return null;
    }
  }

  // Release inventory hold
  static async releaseInventoryHold(sessionId: string, ticketTypeId?: string): Promise<boolean> {
    try {
      let query = supabase
        .from('tickets')
        .delete()
        .eq('status', 'reserved');

      // If specific ticket type, only release those
      if (ticketTypeId) {
        query = query.eq('ticket_type_id', ticketTypeId);
      }

      // For now, we'll use reserved_until as a proxy for session-based holds
      // In production, you'd want a proper session tracking system
      query = query.lt('reserved_until', new Date().toISOString());

      const { error } = await query;
      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Error releasing inventory hold:', error);
      return false;
    }
  }

  // Convert held tickets to sold tickets (during successful payment)
  static async confirmInventoryHold(
    sessionId: string,
    orderId: string,
    ticketTypeId: string,
    quantity: number
  ): Promise<boolean> {
    try {
      // Get reserved tickets for this session/type
      const { data: reservedTickets, error: fetchError } = await supabase
        .from('tickets')
        .select('id')
        .eq('ticket_type_id', ticketTypeId)
        .eq('status', 'reserved')
        .limit(quantity);

      if (fetchError) throw fetchError;
      if (!reservedTickets || reservedTickets.length < quantity) {
        throw new Error('Insufficient reserved tickets to confirm');
      }

      // Update tickets to sold status
      const ticketIds = reservedTickets.slice(0, quantity).map(t => t.id);
      const { error: updateError } = await supabase
        .from('tickets')
        .update({
          status: 'sold',
          reserved_until: null,
        })
        .in('id', ticketIds);

      if (updateError) throw updateError;

      // Update ticket type sold count
      const { error: countError } = await supabase
        .from('ticket_types')
        .update({
          quantity_sold: supabase.rpc('increment_quantity_sold', {
            ticket_type_id: ticketTypeId,
            increment_by: quantity
          })
        })
        .eq('id', ticketTypeId);

      if (countError) {
        console.warn('Error updating sold count:', countError);
      }

      return true;
    } catch (error) {
      console.error('Error confirming inventory hold:', error);
      return false;
    }
  }

  // Cleanup expired holds
  static async cleanupExpiredHolds(): Promise<number> {
    try {
      const { data: expiredTickets, error } = await supabase
        .from('tickets')
        .delete()
        .eq('status', 'reserved')
        .lt('reserved_until', new Date().toISOString())
        .select('id');

      if (error) throw error;

      const cleanedCount = expiredTickets?.length || 0;
      console.log(`Cleaned up ${cleanedCount} expired ticket holds`);
      return cleanedCount;
    } catch (error) {
      console.error('Error cleaning up expired holds:', error);
      return 0;
    }
  }

  // Get inventory status for multiple ticket types
  static async getBulkInventoryStatus(ticketTypeIds: string[]): Promise<InventoryStatus[]> {
    try {
      const statusPromises = ticketTypeIds.map(id => this.getInventoryStatus(id));
      const statuses = await Promise.all(statusPromises);
      return statuses.filter((status): status is InventoryStatus => status !== null);
    } catch (error) {
      console.error('Error getting bulk inventory status:', error);
      return [];
    }
  }

  // Subscribe to real-time inventory changes
  static subscribeToInventoryChanges(
    ticketTypeId: string,
    callback: (status: InventoryStatus) => void
  ): () => void {
    let isSubscribed = true;

    const updateStatus = async () => {
      if (!isSubscribed) return;
      
      const status = await this.getInventoryStatus(ticketTypeId);
      if (status && isSubscribed) {
        callback(status);
      }
    };

    // Initial status
    updateStatus();

    // Set up real-time subscription
    const subscription = supabase
      .channel(`inventory_${ticketTypeId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tickets',
          filter: `ticket_type_id=eq.${ticketTypeId}`,
        },
        updateStatus
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ticket_types',
          filter: `id=eq.${ticketTypeId}`,
        },
        updateStatus
      )
      .subscribe();

    // Periodic refresh as backup
    const interval = setInterval(updateStatus, this.REFRESH_INTERVAL_MS);

    // Cleanup function
    return () => {
      isSubscribed = false;
      clearInterval(interval);
      subscription.unsubscribe();
    };
  }

  // Check if quantity is available for immediate purchase
  static async checkAvailability(ticketTypeId: string, quantity: number): Promise<boolean> {
    const status = await this.getInventoryStatus(ticketTypeId);
    return status ? status.available >= quantity : false;
  }

  // Get low inventory warning threshold
  static isLowInventory(status: InventoryStatus, threshold: number = 10): boolean {
    return status.available <= threshold && status.available > 0;
  }

  // Get event-level inventory summary
  static async getEventInventorySummary(eventId: string): Promise<{
    totalAvailable: number;
    totalSold: number;
    totalCapacity: number;
    ticketTypes: InventoryStatus[];
  }> {
    try {
      const { data: ticketTypes, error } = await supabase
        .from('ticket_types')
        .select('id')
        .eq('event_id', eventId);

      if (error) throw error;

      const ticketTypeIds = ticketTypes.map(tt => tt.id);
      const inventoryStatuses = await this.getBulkInventoryStatus(ticketTypeIds);

      const summary = inventoryStatuses.reduce(
        (acc, status) => ({
          totalAvailable: acc.totalAvailable + status.available,
          totalSold: acc.totalSold + status.sold,
          totalCapacity: acc.totalCapacity + status.total,
        }),
        { totalAvailable: 0, totalSold: 0, totalCapacity: 0 }
      );

      return {
        ...summary,
        ticketTypes: inventoryStatuses,
      };
    } catch (error) {
      console.error('Error getting event inventory summary:', error);
      return {
        totalAvailable: 0,
        totalSold: 0,
        totalCapacity: 0,
        ticketTypes: [],
      };
    }
  }
}