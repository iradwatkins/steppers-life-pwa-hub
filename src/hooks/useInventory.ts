import { useState, useEffect, useCallback, useRef } from 'react';
import { InventoryService, type InventoryStatus } from '@/services/inventoryService';

interface UseInventoryOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const useInventory = (ticketTypeId: string, options: UseInventoryOptions = {}) => {
  const { autoRefresh = true, refreshInterval = 30000 } = options;
  const [status, setStatus] = useState<InventoryStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      setError(null);
      const inventoryStatus = await InventoryService.getInventoryStatus(ticketTypeId);
      setStatus(inventoryStatus);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch inventory status');
    } finally {
      setIsLoading(false);
    }
  }, [ticketTypeId]);

  useEffect(() => {
    if (!ticketTypeId) return;

    // Initial fetch
    fetchStatus();

    // Set up real-time subscription if auto-refresh is enabled
    if (autoRefresh) {
      const unsubscribe = InventoryService.subscribeToInventoryChanges(
        ticketTypeId,
        (newStatus) => {
          setStatus(newStatus);
          setError(null);
        }
      );
      unsubscribeRef.current = unsubscribe;

      return () => {
        unsubscribe();
      };
    }
  }, [ticketTypeId, autoRefresh, fetchStatus]);

  const refresh = useCallback(() => {
    setIsLoading(true);
    fetchStatus();
  }, [fetchStatus]);

  return {
    status,
    isLoading,
    error,
    refresh,
    isAvailable: status?.isAvailable ?? false,
    availableQuantity: status?.available ?? 0,
    isLowStock: status ? InventoryService.isLowInventory(status) : false,
  };
};

export const useBulkInventory = (ticketTypeIds: string[]) => {
  const [statuses, setStatuses] = useState<InventoryStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatuses = useCallback(async () => {
    if (ticketTypeIds.length === 0) {
      setStatuses([]);
      setIsLoading(false);
      return;
    }

    try {
      setError(null);
      const inventoryStatuses = await InventoryService.getBulkInventoryStatus(ticketTypeIds);
      setStatuses(inventoryStatuses);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch inventory statuses');
    } finally {
      setIsLoading(false);
    }
  }, [ticketTypeIds]);

  useEffect(() => {
    fetchStatuses();
  }, [fetchStatuses]);

  const refresh = useCallback(() => {
    setIsLoading(true);
    fetchStatuses();
  }, [fetchStatuses]);

  return {
    statuses,
    isLoading,
    error,
    refresh,
  };
};

export const useInventoryHold = () => {
  const [isCreatingHold, setIsCreatingHold] = useState(false);
  const [currentHolds, setCurrentHolds] = useState<Record<string, any>>({});

  const createHold = useCallback(async (
    ticketTypeId: string,
    quantity: number,
    sessionId: string,
    userId?: string
  ) => {
    setIsCreatingHold(true);
    try {
      const hold = await InventoryService.createInventoryHold(
        ticketTypeId,
        quantity,
        sessionId,
        userId
      );
      
      if (hold) {
        setCurrentHolds(prev => ({
          ...prev,
          [ticketTypeId]: hold
        }));
      }
      
      return hold;
    } catch (error) {
      console.error('Error creating inventory hold:', error);
      return null;
    } finally {
      setIsCreatingHold(false);
    }
  }, []);

  const releaseHold = useCallback(async (sessionId: string, ticketTypeId?: string) => {
    try {
      const success = await InventoryService.releaseInventoryHold(sessionId, ticketTypeId);
      
      if (success && ticketTypeId) {
        setCurrentHolds(prev => {
          const updated = { ...prev };
          delete updated[ticketTypeId];
          return updated;
        });
      } else if (success) {
        setCurrentHolds({});
      }
      
      return success;
    } catch (error) {
      console.error('Error releasing inventory hold:', error);
      return false;
    }
  }, []);

  const confirmHold = useCallback(async (
    sessionId: string,
    orderId: string,
    ticketTypeId: string,
    quantity: number
  ) => {
    try {
      const success = await InventoryService.confirmInventoryHold(
        sessionId,
        orderId,
        ticketTypeId,
        quantity
      );
      
      if (success) {
        setCurrentHolds(prev => {
          const updated = { ...prev };
          delete updated[ticketTypeId];
          return updated;
        });
      }
      
      return success;
    } catch (error) {
      console.error('Error confirming inventory hold:', error);
      return false;
    }
  }, []);

  return {
    createHold,
    releaseHold,
    confirmHold,
    isCreatingHold,
    currentHolds,
  };
};

export const useEventInventory = (eventId: string) => {
  const [summary, setSummary] = useState<{
    totalAvailable: number;
    totalSold: number;
    totalCapacity: number;
    ticketTypes: InventoryStatus[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    if (!eventId) return;

    try {
      setError(null);
      const eventSummary = await InventoryService.getEventInventorySummary(eventId);
      setSummary(eventSummary);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch event inventory summary');
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const refresh = useCallback(() => {
    setIsLoading(true);
    fetchSummary();
  }, [fetchSummary]);

  return {
    summary,
    isLoading,
    error,
    refresh,
    isSoldOut: summary ? summary.totalAvailable === 0 && summary.totalCapacity > 0 : false,
    isLowStock: summary ? summary.totalAvailable <= 10 && summary.totalAvailable > 0 : false,
    soldOutPercentage: summary && summary.totalCapacity > 0 
      ? Math.round((summary.totalSold / summary.totalCapacity) * 100) 
      : 0,
  };
};