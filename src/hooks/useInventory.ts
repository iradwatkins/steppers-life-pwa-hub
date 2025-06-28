
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { InventoryStatus } from '@/types/inventory';

export const useInventory = (ticketTypeId: string) => {
  const [status, setStatus] = useState<InventoryStatus>({
    isAvailable: true,
    available: 0,
    sold: 0,
    held: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInventoryStatus = async () => {
    try {
      setLoading(true);
      
      // Fetch ticket type details
      const { data: ticketType, error: ticketError } = await supabase
        .from('ticket_types')
        .select('quantity')
        .eq('id', ticketTypeId)
        .single();

      if (ticketError) throw ticketError;

      // Fetch sold tickets count
      const { count: soldCount, error: soldError } = await supabase
        .from('tickets')
        .select('*', { count: 'exact' })
        .eq('ticket_type_id', ticketTypeId)
        .eq('status', 'active');

      if (soldError) throw soldError;

      // Fetch held tickets count
      const { count: heldCount, error: heldError } = await supabase
        .from('inventory_holds')
        .select('*', { count: 'exact' })
        .eq('ticket_type_id', ticketTypeId)
        .gt('expires_at', new Date().toISOString());

      if (heldError) throw heldError;

      const total = ticketType?.quantity || 0;
      const sold = soldCount || 0;
      const held = heldCount || 0;
      const available = Math.max(0, total - sold - held);

      setStatus({
        isAvailable: available > 0,
        available,
        sold,
        held,
        total,
      });
    } catch (error) {
      console.error('Error fetching inventory status:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch inventory');
    } finally {
      setLoading(false);
    }
  };

  const holdTickets = async (quantity: number, userId: string): Promise<boolean> => {
    try {
      if (!status.isAvailable || status.available < quantity) {
        return false;
      }

      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 15); // 15-minute hold

      const { error } = await supabase
        .from('inventory_holds')
        .insert({
          user_id: userId,
          ticket_type_id: ticketTypeId,
          quantity,
          expires_at: expiresAt.toISOString(),
        });

      if (error) throw error;

      await fetchInventoryStatus();
      return true;
    } catch (error) {
      console.error('Error holding tickets:', error);
      return false;
    }
  };

  const releaseHold = async (holdId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('inventory_holds')
        .delete()
        .eq('id', holdId);

      if (error) throw error;

      await fetchInventoryStatus();
      return true;
    } catch (error) {
      console.error('Error releasing hold:', error);
      return false;
    }
  };

  useEffect(() => {
    if (ticketTypeId) {
      fetchInventoryStatus();
    }
  }, [ticketTypeId]);

  return {
    status,
    loading,
    error,
    refetch: fetchInventoryStatus,
    holdTickets,
    releaseHold,
  };
};
