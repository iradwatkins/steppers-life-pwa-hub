// Inventory Management React Hook
// Created for B-011: Real-time Inventory Management System

import { useState, useEffect, useCallback, useRef } from 'react';
import inventoryService from '@/services/inventoryService';
import {
  TicketInventory,
  InventoryHold,
  InventoryStatus,
  TicketAvailabilityStatus,
  InventoryUpdateRequest,
  InventoryUpdateResponse
} from '@/types/inventory';

export interface UseInventoryOptions {
  eventId: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export interface UseInventoryReturn {
  // State
  inventoryStatus: InventoryStatus | null;
  availabilityStatuses: Map<string, TicketAvailabilityStatus>;
  userHolds: InventoryHold[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  checkAvailability: (ticketTypeId: string, quantity: number) => TicketAvailabilityStatus;
  createHold: (ticketTypeId: string, quantity: number, holdType?: InventoryHold['holdType']) => Promise<InventoryUpdateResponse>;
  updateHold: (holdId: string, newQuantity: number) => Promise<InventoryUpdateResponse>;
  releaseHold: (holdId: string, reason?: string) => Promise<InventoryUpdateResponse>;
  releaseAllHolds: () => Promise<void>;
  purchaseTickets: (holdId: string) => Promise<InventoryUpdateResponse>;
  refresh: () => Promise<void>;
  
  // Utilities
  getHoldForTicketType: (ticketTypeId: string) => InventoryHold | null;
  getTotalHeldQuantity: () => number;
  getHoldTimeRemaining: (holdId: string) => number; // milliseconds
  isHoldExpiringSoon: (holdId: string, warningThresholdMs?: number) => boolean;
}

export function useInventory({ 
  eventId, 
  autoRefresh = true, 
  refreshInterval = 30000 
}: UseInventoryOptions): UseInventoryReturn {
  // State
  const [inventoryStatus, setInventoryStatus] = useState<InventoryStatus | null>(null);
  const [availabilityStatuses, setAvailabilityStatuses] = useState<Map<string, TicketAvailabilityStatus>>(new Map());
  const [userHolds, setUserHolds] = useState<InventoryHold[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Refs for cleanup
  const refreshTimer = useRef<NodeJS.Timeout | null>(null);
  const sessionId = useRef<string>(inventoryService.generateSessionId());

  // Load inventory data
  const loadInventoryData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get inventory status for the event
      const status = inventoryService.getInventoryStatus(eventId);
      setInventoryStatus(status);
      
      // Get availability statuses for all ticket types
      const statusMap = new Map<string, TicketAvailabilityStatus>();
      status.ticketTypes.forEach(ticketType => {
        const availability = inventoryService.getTicketAvailabilityStatus(eventId, ticketType.ticketTypeId);
        statusMap.set(ticketType.ticketTypeId, availability);
      });
      setAvailabilityStatuses(statusMap);
      
      // Get user's current holds
      const holds = status.activeHolds.filter(hold => hold.sessionId === sessionId.current);
      setUserHolds(holds);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load inventory data');
      console.error('Error loading inventory:', err);
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  // Set up real-time updates and auto-refresh
  useEffect(() => {
    loadInventoryData();

    // Listen for real-time inventory updates
    const handleInventoryUpdate = (event: string, data: any) => {
      if (event === 'inventory-updated' && data.inventory?.eventId === eventId) {
        loadInventoryData();
      } else if (event === 'hold-created' && data.hold?.eventId === eventId) {
        if (data.hold.sessionId === sessionId.current) {
          setUserHolds(prev => [...prev, data.hold]);
        }
        loadInventoryData();
      } else if (event === 'hold-released' && data.hold?.eventId === eventId) {
        if (data.hold.sessionId === sessionId.current) {
          setUserHolds(prev => prev.filter(hold => hold.id !== data.hold.id));
        }
        loadInventoryData();
      } else if (event === 'purchase-completed' && data.transaction?.eventId === eventId) {
        loadInventoryData();
      }
    };

    inventoryService.addEventListener(handleInventoryUpdate);

    // Set up auto-refresh timer
    if (autoRefresh) {
      refreshTimer.current = setInterval(loadInventoryData, refreshInterval);
    }

    return () => {
      inventoryService.removeEventListener(handleInventoryUpdate);
      if (refreshTimer.current) {
        clearInterval(refreshTimer.current);
      }
    };
  }, [eventId, autoRefresh, refreshInterval, loadInventoryData]);

  // Check availability for a specific quantity
  const checkAvailability = useCallback((ticketTypeId: string, quantity: number): TicketAvailabilityStatus => {
    const status = availabilityStatuses.get(ticketTypeId);
    if (!status) {
      return {
        ticketTypeId,
        status: 'coming-soon',
        availableQuantity: 0,
        totalQuantity: 0,
        message: 'Ticket type not found',
        className: 'text-gray-500'
      };
    }

    if (quantity > status.availableQuantity) {
      return {
        ...status,
        status: 'insufficient-quantity' as any,
        message: `Only ${status.availableQuantity} available (requested ${quantity})`,
        className: 'text-red-600 bg-red-50'
      };
    }

    return status;
  }, [availabilityStatuses]);

  // Create a hold
  const createHold = useCallback(async (
    ticketTypeId: string, 
    quantity: number, 
    holdType: InventoryHold['holdType'] = 'checkout'
  ): Promise<InventoryUpdateResponse> => {
    try {
      const request: InventoryUpdateRequest = {
        eventId,
        ticketTypeId,
        requestType: 'create-hold',
        quantity,
        sessionId: sessionId.current,
        holdType
      };

      const response = await inventoryService.createHold(request);
      
      if (response.success && response.hold) {
        setUserHolds(prev => [...prev, response.hold!]);
      }

      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create hold';
      setError(errorMessage);
      return {
        success: false,
        message: errorMessage
      };
    }
  }, [eventId]);

  // Update an existing hold
  const updateHold = useCallback(async (
    holdId: string, 
    newQuantity: number
  ): Promise<InventoryUpdateResponse> => {
    try {
      const hold = userHolds.find(h => h.id === holdId);
      if (!hold) {
        return {
          success: false,
          message: 'Hold not found'
        };
      }

      const request: InventoryUpdateRequest = {
        eventId: hold.eventId,
        ticketTypeId: hold.ticketTypeId,
        requestType: 'create-hold', // Update is handled as new hold with existing cleanup
        quantity: newQuantity,
        sessionId: sessionId.current,
        holdType: hold.holdType
      };

      // Release old hold first
      await releaseHold(holdId, 'updated');
      
      // Create new hold with updated quantity
      return await createHold(hold.ticketTypeId, newQuantity, hold.holdType);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update hold';
      setError(errorMessage);
      return {
        success: false,
        message: errorMessage
      };
    }
  }, [userHolds, eventId, createHold, releaseHold]);

  // Release a hold
  const releaseHold = useCallback(async (
    holdId: string, 
    reason: string = 'cancelled'
  ): Promise<InventoryUpdateResponse> => {
    try {
      const response = await inventoryService.releaseHold(holdId, reason);
      
      if (response.success) {
        setUserHolds(prev => prev.filter(hold => hold.id !== holdId));
      }

      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to release hold';
      setError(errorMessage);
      return {
        success: false,
        message: errorMessage
      };
    }
  }, []);

  // Release all user holds
  const releaseAllHolds = useCallback(async (): Promise<void> => {
    try {
      const releasePromises = userHolds.map(hold => 
        releaseHold(hold.id, 'checkout_cancelled')
      );
      
      await Promise.all(releasePromises);
      setUserHolds([]);
    } catch (err) {
      console.error('Error releasing all holds:', err);
      setError('Failed to release all holds');
    }
  }, [userHolds, releaseHold]);

  // Purchase tickets from hold
  const purchaseTickets = useCallback(async (holdId: string): Promise<InventoryUpdateResponse> => {
    try {
      const hold = userHolds.find(h => h.id === holdId);
      if (!hold) {
        return {
          success: false,
          message: 'Hold not found'
        };
      }

      const request: InventoryUpdateRequest = {
        eventId: hold.eventId,
        ticketTypeId: hold.ticketTypeId,
        requestType: 'purchase',
        quantity: hold.quantity,
        sessionId: sessionId.current
      };

      const response = await inventoryService.processPurchase(request);
      
      if (response.success) {
        setUserHolds(prev => prev.filter(h => h.id !== holdId));
      }

      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to purchase tickets';
      setError(errorMessage);
      return {
        success: false,
        message: errorMessage
      };
    }
  }, [userHolds]);

  // Utility functions
  const getHoldForTicketType = useCallback((ticketTypeId: string): InventoryHold | null => {
    return userHolds.find(hold => hold.ticketTypeId === ticketTypeId) || null;
  }, [userHolds]);

  const getTotalHeldQuantity = useCallback((): number => {
    return userHolds.reduce((total, hold) => total + hold.quantity, 0);
  }, [userHolds]);

  const getHoldTimeRemaining = useCallback((holdId: string): number => {
    const hold = userHolds.find(h => h.id === holdId);
    if (!hold) return 0;
    
    return Math.max(0, hold.expiresAt.getTime() - Date.now());
  }, [userHolds]);

  const isHoldExpiringSoon = useCallback((
    holdId: string, 
    warningThresholdMs: number = 2 * 60 * 1000 // 2 minutes default
  ): boolean => {
    const timeRemaining = getHoldTimeRemaining(holdId);
    return timeRemaining > 0 && timeRemaining <= warningThresholdMs;
  }, [getHoldTimeRemaining]);

  const refresh = useCallback(async (): Promise<void> => {
    await loadInventoryData();
  }, [loadInventoryData]);

  return {
    // State
    inventoryStatus,
    availabilityStatuses,
    userHolds,
    isLoading,
    error,
    
    // Actions
    checkAvailability,
    createHold,
    updateHold,
    releaseHold,
    releaseAllHolds,
    purchaseTickets,
    refresh,
    
    // Utilities
    getHoldForTicketType,
    getTotalHeldQuantity,
    getHoldTimeRemaining,
    isHoldExpiringSoon
  };
} 