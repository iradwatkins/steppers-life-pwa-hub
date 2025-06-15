// Real-time Inventory Management Service
// Created for B-011: Real-time Inventory Management System

import {
  TicketInventory,
  InventoryHold,
  InventoryTransaction,
  InventoryStatus,
  InventoryConflictResolution,
  InventoryUpdateRequest,
  InventoryUpdateResponse,
  InventoryConfig,
  TicketAvailabilityStatus,
  InventoryAlert
} from '@/types/inventory';

// Simple EventEmitter replacement for browser compatibility
class SimpleEventEmitter {
  private listeners: Map<string, Function[]> = new Map();

  on(event: string, listener: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(listener);
  }

  emit(event: string, data?: any) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(listener => listener(event, data));
    }
  }

  removeAllListeners() {
    this.listeners.clear();
  }

  addEventListener(listener: Function) {
    // For backward compatibility
    this.on('inventory-updated', listener);
    this.on('hold-created', listener);
    this.on('hold-released', listener);
    this.on('purchase-completed', listener);
    this.on('alert-created', listener);
  }

  removeEventListener(listener: Function) {
    // For backward compatibility - simplified removal
    this.listeners.forEach((listeners, event) => {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    });
  }
}

// Configuration - In real app, this would come from backend/config
const DEFAULT_CONFIG: InventoryConfig = {
  defaultHoldDurationMinutes: 15,
  cashPaymentHoldDurationMinutes: 240, // 4 hours
  adminReserveHoldDurationMinutes: 1440, // 24 hours
  lowStockThreshold: 10,
  criticalStockThreshold: 5,
  enableConflictResolution: true,
  enablePartialFulfillment: true,
  enableRequestQueuing: false,
  auditRetentionDays: 90
};

class InventoryService extends SimpleEventEmitter {
  private config: InventoryConfig = DEFAULT_CONFIG;
  private inventory: Map<string, TicketInventory> = new Map();
  private holds: Map<string, InventoryHold> = new Map();
  private transactions: InventoryTransaction[] = [];
  private alerts: InventoryAlert[] = [];
  private operationLocks: Set<string> = new Set(); // For thread-safe operations
  private holdTimeoutMs = 5 * 60 * 1000; // 5 minutes
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    super();
    this.initializeMockData();
    this.startHoldCleanupInterval();
  }

  // Initialize with mock data for demo
  private initializeMockData(): void {
    const eventId = 'evt987';
    const ticketTypes = [
      { id: 'tt001', name: 'General Admission', totalQuantity: 200, soldQuantity: 50 },
      { id: 'tt002', name: 'VIP Ticket', totalQuantity: 50, soldQuantity: 15 },
      { id: 'tt003', name: 'Early Bird Special', totalQuantity: 30, soldQuantity: 25 },
      { id: 'tt004', name: 'Table Reservation (Party of 8)', totalQuantity: 20, soldQuantity: 5 }
    ];

    ticketTypes.forEach(ticket => {
      const inventoryKey = `${eventId}-${ticket.id}`;
      const inventory: TicketInventory = {
        eventId,
        ticketTypeId: ticket.id,
        ticketTypeName: ticket.name,
        totalQuantity: ticket.totalQuantity,
        soldQuantity: ticket.soldQuantity,
        heldQuantity: 0,
        availableQuantity: ticket.totalQuantity - ticket.soldQuantity,
        lastUpdated: new Date()
      };
      this.inventory.set(inventoryKey, inventory);
    });
  }

  // Thread-safe operation wrapper
  private async executeWithLock<T>(
    lockKey: string,
    operation: () => Promise<T> | T
  ): Promise<T> {
    if (this.operationLocks.has(lockKey)) {
      throw new Error(`Operation already in progress for ${lockKey}`);
    }

    this.operationLocks.add(lockKey);
    try {
      return await operation();
    } finally {
      this.operationLocks.delete(lockKey);
    }
  }

  // Generate unique session ID for holds
  public generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  }

  // Get current inventory status for an event
  public getInventoryStatus(eventId: string): InventoryStatus {
    const eventInventory = Array.from(this.inventory.values())
      .filter(inv => inv.eventId === eventId);
    
    const activeHolds = Array.from(this.holds.values())
      .filter(hold => hold.eventId === eventId && !hold.isExpired);

    const totals = eventInventory.reduce(
      (acc, inv) => ({
        totalTickets: acc.totalTickets + inv.totalQuantity,
        totalSold: acc.totalSold + inv.soldQuantity,
        totalHeld: acc.totalHeld + inv.heldQuantity,
        totalAvailable: acc.totalAvailable + inv.availableQuantity
      }),
      { totalTickets: 0, totalSold: 0, totalHeld: 0, totalAvailable: 0 }
    );

    return {
      eventId,
      ...totals,
      ticketTypes: eventInventory,
      activeHolds,
      lastUpdated: new Date()
    };
  }

  // Get ticket availability with status indicators
  public getTicketAvailabilityStatus(eventId: string, ticketTypeId: string): TicketAvailabilityStatus {
    const inventoryKey = `${eventId}-${ticketTypeId}`;
    const inventory = this.inventory.get(inventoryKey);

    if (!inventory) {
      return {
        ticketTypeId,
        status: 'coming-soon',
        availableQuantity: 0,
        totalQuantity: 0,
        message: 'Tickets not yet available',
        className: 'text-gray-500'
      };
    }

    const { availableQuantity, totalQuantity } = inventory;

    if (availableQuantity === 0) {
      return {
        ticketTypeId,
        status: 'sold-out',
        availableQuantity,
        totalQuantity,
        message: 'Sold Out',
        className: 'text-red-600 bg-red-50'
      };
    }

    if (availableQuantity <= this.config.criticalStockThreshold) {
      return {
        ticketTypeId,
        status: 'critical-stock',
        availableQuantity,
        totalQuantity,
        message: `Only ${availableQuantity} left!`,
        className: 'text-red-600 bg-red-50'
      };
    }

    if (availableQuantity <= this.config.lowStockThreshold) {
      return {
        ticketTypeId,
        status: 'low-stock',
        availableQuantity,
        totalQuantity,
        message: `Only ${availableQuantity} remaining`,
        className: 'text-orange-600 bg-orange-50'
      };
    }

    return {
      ticketTypeId,
      status: 'available',
      availableQuantity,
      totalQuantity,
      message: `${availableQuantity} available`,
      className: 'text-green-600 bg-green-50'
    };
  }

  // Create inventory hold with conflict resolution
  public async createHold(request: InventoryUpdateRequest): Promise<InventoryUpdateResponse> {
    const lockKey = `${request.eventId}-${request.ticketTypeId}`;
    
    return this.executeWithLock(lockKey, async () => {
      const inventoryKey = `${request.eventId}-${request.ticketTypeId}`;
      const inventory = this.inventory.get(inventoryKey);

      if (!inventory) {
        return {
          success: false,
          message: 'Ticket type not found'
        };
      }

      // Check availability and resolve conflicts
      if (inventory.availableQuantity < request.quantity) {
        const conflict: InventoryConflictResolution = {
          conflictId: `conflict_${Date.now()}`,
          eventId: request.eventId,
          ticketTypeId: request.ticketTypeId,
          requestedQuantity: request.quantity,
          availableQuantity: inventory.availableQuantity,
          sessionId: request.sessionId || '',
          resolutionType: this.config.enablePartialFulfillment && inventory.availableQuantity > 0 
            ? 'partial-fulfill' 
            : 'deny-request',
          resolvedQuantity: this.config.enablePartialFulfillment 
            ? inventory.availableQuantity 
            : 0,
          message: this.config.enablePartialFulfillment && inventory.availableQuantity > 0
            ? `Only ${inventory.availableQuantity} tickets available. Partial fulfillment offered.`
            : 'Requested quantity not available',
          timestamp: new Date()
        };

        if (conflict.resolutionType === 'deny-request') {
          return {
            success: false,
            conflict,
            message: conflict.message
          };
        }

        // Partial fulfillment
        request.quantity = conflict.resolvedQuantity;
      }

      // Create hold
      const hold: InventoryHold = {
        id: `hold_${Date.now()}_${Math.random().toString(36).substring(2)}`,
        eventId: request.eventId,
        ticketTypeId: request.ticketTypeId,
        quantity: request.quantity,
        sessionId: request.sessionId || this.generateSessionId(),
        holdType: request.holdType || 'checkout',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + (request.holdDurationMinutes || this.config.defaultHoldDurationMinutes) * 60000),
        isExpired: false
      };

      // Update inventory
      const updatedInventory: TicketInventory = {
        ...inventory,
        heldQuantity: inventory.heldQuantity + request.quantity,
        availableQuantity: inventory.availableQuantity - request.quantity,
        lastUpdated: new Date()
      };

      // Create transaction record
      const transaction: InventoryTransaction = {
        id: `txn_${Date.now()}`,
        eventId: request.eventId,
        ticketTypeId: request.ticketTypeId,
        transactionType: 'hold-create',
        quantity: request.quantity,
        previousAvailable: inventory.availableQuantity,
        newAvailable: updatedInventory.availableQuantity,
        sessionId: request.sessionId,
        userId: request.userId,
        reason: `Hold created for ${hold.holdType}`,
        createdAt: new Date(),
        metadata: { holdId: hold.id, holdType: hold.holdType }
      };

      // Persist updates
      this.inventory.set(inventoryKey, updatedInventory);
      this.holds.set(hold.id, hold);
      this.transactions.push(transaction);

      // Check for low stock alerts
      this.checkAndCreateAlerts(updatedInventory);

      // Emit real-time update event
      this.emit('inventory-updated', { inventory: updatedInventory });
      this.emit('hold-created', { hold });

      return {
        success: true,
        updatedInventory,
        hold,
        transaction,
        message: `Hold created for ${request.quantity} tickets`
      };
    });
  }

  // Release inventory hold
  public async releaseHold(holdId: string, reason?: string): Promise<InventoryUpdateResponse> {
    const hold = this.holds.get(holdId);
    
    if (!hold || hold.isExpired || hold.releasedAt) {
      return {
        success: false,
        message: 'Hold not found or already released'
      };
    }

    const lockKey = `${hold.eventId}-${hold.ticketTypeId}`;
    
    return this.executeWithLock(lockKey, async () => {
      const inventoryKey = `${hold.eventId}-${hold.ticketTypeId}`;
      const inventory = this.inventory.get(inventoryKey);

      if (!inventory) {
        return {
          success: false,
          message: 'Inventory not found for hold'
        };
      }

      // Update hold status
      const updatedHold: InventoryHold = {
        ...hold,
        isExpired: true,
        releasedAt: new Date()
      };

      // Update inventory
      const updatedInventory: TicketInventory = {
        ...inventory,
        heldQuantity: inventory.heldQuantity - hold.quantity,
        availableQuantity: inventory.availableQuantity + hold.quantity,
        lastUpdated: new Date()
      };

      // Create transaction record
      const transaction: InventoryTransaction = {
        id: `txn_${Date.now()}`,
        eventId: hold.eventId,
        ticketTypeId: hold.ticketTypeId,
        transactionType: 'hold-release',
        quantity: hold.quantity,
        previousAvailable: inventory.availableQuantity,
        newAvailable: updatedInventory.availableQuantity,
        sessionId: hold.sessionId,
        reason: reason || 'Hold released',
        createdAt: new Date(),
        metadata: { holdId, holdType: hold.holdType }
      };

      // Persist updates
      this.inventory.set(inventoryKey, updatedInventory);
      this.holds.set(holdId, updatedHold);
      this.transactions.push(transaction);

      // Emit real-time update event
      this.emit('inventory-updated', { inventory: updatedInventory });
      this.emit('hold-released', { hold: updatedHold });

      return {
        success: true,
        updatedInventory,
        transaction,
        message: `Hold released for ${hold.quantity} tickets`
      };
    });
  }

  // Process ticket purchase (converts hold to sale or direct purchase)
  public async processPurchase(request: InventoryUpdateRequest): Promise<InventoryUpdateResponse> {
    const lockKey = `${request.eventId}-${request.ticketTypeId}`;
    
    return this.executeWithLock(lockKey, async () => {
      const inventoryKey = `${request.eventId}-${request.ticketTypeId}`;
      const inventory = this.inventory.get(inventoryKey);

      if (!inventory) {
        return {
          success: false,
          message: 'Ticket type not found'
        };
      }

      // If sessionId provided, convert existing hold
      let holdToConvert: InventoryHold | undefined;
      if (request.sessionId) {
        holdToConvert = Array.from(this.holds.values()).find(
          h => h.sessionId === request.sessionId && 
               h.eventId === request.eventId && 
               h.ticketTypeId === request.ticketTypeId && 
               !h.isExpired
        );
      }

      let updatedInventory: TicketInventory;
      
      if (holdToConvert) {
        // Convert hold to purchase
        if (holdToConvert.quantity !== request.quantity) {
          return {
            success: false,
            message: 'Purchase quantity does not match held quantity'
          };
        }

        updatedInventory = {
          ...inventory,
          soldQuantity: inventory.soldQuantity + request.quantity,
          heldQuantity: inventory.heldQuantity - request.quantity,
          lastUpdated: new Date()
        };

        // Mark hold as converted
        this.holds.set(holdToConvert.id, {
          ...holdToConvert,
          isExpired: true,
          releasedAt: new Date()
        });
      } else {
        // Direct purchase without hold
        if (inventory.availableQuantity < request.quantity) {
          return {
            success: false,
            message: 'Insufficient inventory for direct purchase'
          };
        }

        updatedInventory = {
          ...inventory,
          soldQuantity: inventory.soldQuantity + request.quantity,
          availableQuantity: inventory.availableQuantity - request.quantity,
          lastUpdated: new Date()
        };
      }

      // Create transaction record
      const transaction: InventoryTransaction = {
        id: `txn_${Date.now()}`,
        eventId: request.eventId,
        ticketTypeId: request.ticketTypeId,
        transactionType: 'purchase',
        quantity: request.quantity,
        previousAvailable: inventory.availableQuantity,
        newAvailable: updatedInventory.availableQuantity,
        sessionId: request.sessionId,
        userId: request.userId,
        orderId: request.orderId,
        reason: 'Ticket purchase completed',
        createdAt: new Date(),
        metadata: holdToConvert ? { convertedHoldId: holdToConvert.id } : {}
      };

      // Persist updates
      this.inventory.set(inventoryKey, updatedInventory);
      this.transactions.push(transaction);

      // Check for alerts
      this.checkAndCreateAlerts(updatedInventory);

      // Emit real-time update event
      this.emit('inventory-updated', { inventory: updatedInventory });
      this.emit('purchase-completed', { transaction });

      return {
        success: true,
        updatedInventory,
        transaction,
        message: `Purchase completed for ${request.quantity} tickets`
      };
    });
  }

  // Clean up expired holds
  public cleanupExpiredHolds(): void {
    const now = new Date();
    const expiredHolds = Array.from(this.holds.values())
      .filter(hold => !hold.isExpired && hold.expiresAt <= now);

    expiredHolds.forEach(hold => {
      this.releaseHold(hold.id, 'Automatic cleanup - hold expired');
    });
  }

  // Start automatic cleanup interval
  private startHoldCleanupInterval(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredHolds();
    }, 60000); // Check every minute
  }

  // Check and create inventory alerts
  private checkAndCreateAlerts(inventory: TicketInventory): void {
    const status = this.getTicketAvailabilityStatus(inventory.eventId, inventory.ticketTypeId);
    
    if (status.status === 'sold-out') {
      this.createAlert({
        type: 'sold-out',
        eventId: inventory.eventId,
        ticketTypeId: inventory.ticketTypeId,
        message: `${inventory.ticketTypeName} is now sold out`,
        severity: 'warning'
      });
    } else if (status.status === 'low-stock') {
      this.createAlert({
        type: 'low-stock',
        eventId: inventory.eventId,
        ticketTypeId: inventory.ticketTypeId,
        message: `${inventory.ticketTypeName} is running low (${inventory.availableQuantity} left)`,
        severity: 'info'
      });
    }
  }

  // Create system alert
  private createAlert(alertData: Omit<InventoryAlert, 'id' | 'timestamp' | 'acknowledged'>): void {
    const alert: InventoryAlert = {
      id: `alert_${Date.now()}`,
      timestamp: new Date(),
      acknowledged: false,
      ...alertData
    };

    this.alerts.push(alert);
    this.emit('alert-created', { alert });
  }

  // Get transactions for audit trail
  public getTransactions(eventId?: string, ticketTypeId?: string): InventoryTransaction[] {
    return this.transactions.filter(txn => 
      (!eventId || txn.eventId === eventId) &&
      (!ticketTypeId || txn.ticketTypeId === ticketTypeId)
    ).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Get system alerts
  public getAlerts(eventId?: string): InventoryAlert[] {
    return this.alerts.filter(alert =>
      (!eventId || alert.eventId === eventId)
    ).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Cleanup resources
  public destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.removeAllListeners();
  }
}

// Singleton instance
export const inventoryService = new InventoryService();
export default inventoryService; 