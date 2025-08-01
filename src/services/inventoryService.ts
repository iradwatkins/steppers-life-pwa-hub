/**
 * Real-time Inventory Management Service
 * Story B.011: Real-time Inventory Management System
 */

import { supabase } from '@/integrations/supabase/client';
import type {
  TicketInventory,
  InventoryHold,
  InventoryCheckResult,
  HoldCreationResult,
  PurchaseResult,
  InventoryStatusSummary,
  InventoryUpdateEvent,
  InventoryConfig
} from '@/types/inventory';
import {
  PurchaseChannel,
  HoldStatus,
  InventoryStatus,
  InventoryUpdateType
} from '@/types/inventory';
import {
  DEFAULT_INVENTORY_CONFIG,
  DEFAULT_HOLD_TIMEOUTS
} from '@/types/inventory';

export class InventoryService {
  private static instance: InventoryService;
  private config: InventoryConfig = DEFAULT_INVENTORY_CONFIG;
  private inventoryCache = new Map<string, TicketInventory>();
  private failedTicketTypes = new Set<string>(); // Cache failed ticket type lookups
  private activeHolds = new Map<string, InventoryHold>();
  private updateListeners = new Set<(event: InventoryUpdateEvent) => void>();
  private cleanupInterval: NodeJS.Timeout | null = null;
  private isInitialized = false;

  private constructor() {
    this.initializeService();
  }

  public static getInstance(): InventoryService {
    if (!InventoryService.instance) {
      InventoryService.instance = new InventoryService();
    }
    return InventoryService.instance;
  }

  private async initializeService(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log('🔄 Initializing Inventory Service (Production)...');
      await this.loadInventoryCache();
      this.startCleanupService();
      this.isInitialized = true;
      console.log('✅ Inventory Service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Inventory Service:', error);
    }
  }

  private async loadInventoryCache(): Promise<void> {
    try {
      const { data: ticketTypes, error } = await supabase
        .from('ticket_types')
        .select('id, event_id, quantity_available, quantity_sold');

      if (error) throw error;

      ticketTypes?.forEach(ticketType => {
        const inventory: TicketInventory = {
          ticketTypeId: ticketType.id,
          eventId: ticketType.event_id,
          totalQuantity: ticketType.quantity_available + (ticketType.quantity_sold || 0),
          availableQuantity: ticketType.quantity_available || 0,
          soldQuantity: ticketType.quantity_sold || 0,
          heldQuantity: 0,
          lastUpdated: new Date(),
          version: 1
        };
        this.inventoryCache.set(ticketType.id, inventory);
      });

      console.log(`✅ Loaded ${this.inventoryCache.size} inventory items`);
    } catch (error) {
      console.error('❌ Error loading inventory cache:', error);
    }
  }

  private startCleanupService(): void {
    if (this.cleanupInterval) clearInterval(this.cleanupInterval);
    
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredHolds();
    }, this.config.cleanupIntervalMinutes * 60 * 1000);
  }

  public async checkAvailability(
    ticketTypeId: string,
    quantity: number,
    createHold: boolean = false,
    channel: PurchaseChannel = PurchaseChannel.ONLINE,
    sessionId?: string
  ): Promise<InventoryCheckResult> {
    try {
      const inventory = await this.getInventory(ticketTypeId);
      if (!inventory) {
        return {
          available: false,
          availableQuantity: 0,
          requestedQuantity: quantity,
          inventoryStatus: InventoryStatus.SOLD_OUT,
          message: 'Ticket type not found'
        };
      }

      const currentAvailable = inventory.availableQuantity - inventory.heldQuantity;
      const available = currentAvailable >= quantity;
      const inventoryStatus = this.getInventoryStatus(inventory);

      const result: InventoryCheckResult = {
        available,
        availableQuantity: currentAvailable,
        requestedQuantity: quantity,
        inventoryStatus,
        message: available ? 'Tickets available' : 'Insufficient inventory'
      };

      if (createHold && available && sessionId) {
        const holdResult = await this.createHold(ticketTypeId, quantity, channel, sessionId);
        if (holdResult.success && holdResult.hold) {
          result.holdCreated = holdResult.hold;
        }
      }

      return result;
    } catch (error) {
      console.error('❌ Error checking availability:', error);
      return {
        available: false,
        availableQuantity: 0,
        requestedQuantity: quantity,
        inventoryStatus: InventoryStatus.SOLD_OUT,
        message: 'Error checking availability'
      };
    }
  }

  public async createHold(
    ticketTypeId: string,
    quantity: number,
    channel: PurchaseChannel,
    sessionId: string,
    userId?: string
  ): Promise<HoldCreationResult> {
    try {
      const inventory = await this.getInventory(ticketTypeId);
      if (!inventory) {
        return { success: false, error: 'Ticket type not found' };
      }

      const currentAvailable = inventory.availableQuantity - inventory.heldQuantity;
      if (currentAvailable < quantity) {
        return { success: false, error: `Only ${currentAvailable} tickets available` };
      }

      const timeoutMinutes = DEFAULT_HOLD_TIMEOUTS[channel as keyof typeof DEFAULT_HOLD_TIMEOUTS];
      const expiresAt = new Date();
      if (channel === PurchaseChannel.CASH) {
        expiresAt.setHours(expiresAt.getHours() + timeoutMinutes / 60);
      } else {
        expiresAt.setMinutes(expiresAt.getMinutes() + timeoutMinutes);
      }

      const hold: InventoryHold = {
        id: `hold_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ticketTypeId,
        eventId: inventory.eventId,
        quantity,
        userId,
        sessionId,
        channel,
        createdAt: new Date(),
        expiresAt,
        status: HoldStatus.ACTIVE
      };

      this.activeHolds.set(hold.id, hold);
      inventory.heldQuantity += quantity;
      inventory.lastUpdated = new Date();
      inventory.version += 1;
      this.inventoryCache.set(ticketTypeId, inventory);

      this.emitInventoryUpdate({
        type: InventoryUpdateType.HOLD_CREATED,
        ticketTypeId,
        eventId: inventory.eventId,
        inventory,
        timestamp: new Date()
      });

      return { success: true, hold };
    } catch (error) {
      console.error('❌ Error creating hold:', error);
      return { success: false, error: 'Failed to create hold' };
    }
  }

  public async completePurchase(holdId: string, orderId: string, userId?: string): Promise<PurchaseResult> {
    try {
      const hold = this.activeHolds.get(holdId);
      if (!hold || hold.status !== HoldStatus.ACTIVE) {
        return {
          success: false,
          inventoryUpdated: false,
          holdReleased: false,
          remainingInventory: 0,
          error: 'Hold not found or expired'
        };
      }

      const inventory = this.inventoryCache.get(hold.ticketTypeId);
      if (!inventory) {
        return {
          success: false,
          inventoryUpdated: false,
          holdReleased: false,
          remainingInventory: 0,
          error: 'Inventory not found'
        };
      }

      inventory.heldQuantity = Math.max(0, inventory.heldQuantity - hold.quantity);
      inventory.soldQuantity += hold.quantity;
      inventory.availableQuantity = Math.max(0, inventory.availableQuantity - hold.quantity);
      inventory.lastUpdated = new Date();
      inventory.version += 1;

      const { error: updateError } = await supabase
        .from('ticket_types')
        .update({
          quantity_sold: inventory.soldQuantity,
          quantity_available: inventory.availableQuantity
        })
        .eq('id', hold.ticketTypeId);

      if (updateError) {
        console.error('❌ Database update failed:', updateError);
        return {
          success: false,
          inventoryUpdated: false,
          holdReleased: false,
          remainingInventory: inventory.availableQuantity,
          error: 'Database update failed'
        };
      }

      hold.status = HoldStatus.COMPLETED;
      this.activeHolds.delete(holdId);
      this.inventoryCache.set(hold.ticketTypeId, inventory);

      this.emitInventoryUpdate({
        type: InventoryUpdateType.PURCHASE_COMPLETED,
        ticketTypeId: hold.ticketTypeId,
        eventId: hold.eventId,
        inventory,
        timestamp: new Date()
      });

      return {
        success: true,
        inventoryUpdated: true,
        holdReleased: true,
        remainingInventory: inventory.availableQuantity
      };
    } catch (error) {
      console.error('❌ Error completing purchase:', error);
      return {
        success: false,
        inventoryUpdated: false,
        holdReleased: false,
        remainingInventory: 0,
        error: 'Purchase completion failed'
      };
    }
  }

  private async cleanupExpiredHolds(): Promise<void> {
    const now = new Date();
    const expiredHolds: string[] = [];

    for (const [holdId, hold] of this.activeHolds) {
      if (hold.status === HoldStatus.ACTIVE && hold.expiresAt <= now) {
        expiredHolds.push(holdId);
      }
    }

    if (expiredHolds.length > 0) {
      for (const holdId of expiredHolds) {
        await this.expireHold(holdId);
      }
    }
  }

  private async expireHold(holdId: string): Promise<void> {
    const hold = this.activeHolds.get(holdId);
    if (!hold) return;

    hold.status = HoldStatus.EXPIRED;
    this.activeHolds.delete(holdId);

    const inventory = this.inventoryCache.get(hold.ticketTypeId);
    if (inventory) {
      inventory.heldQuantity = Math.max(0, inventory.heldQuantity - hold.quantity);
      inventory.lastUpdated = new Date();
      inventory.version += 1;
      this.inventoryCache.set(hold.ticketTypeId, inventory);

      this.emitInventoryUpdate({
        type: InventoryUpdateType.HOLD_EXPIRED,
        ticketTypeId: hold.ticketTypeId,
        eventId: hold.eventId,
        inventory,
        timestamp: new Date()
      });
    }
  }

  public async getInventory(ticketTypeId: string): Promise<TicketInventory | null> {
    // Check if this ticket type has already failed
    if (this.failedTicketTypes.has(ticketTypeId)) {
      return null;
    }

    let inventory = this.inventoryCache.get(ticketTypeId);
    
    if (!inventory) {
      try {
        const { data: ticketType, error } = await supabase
          .from('ticket_types')
          .select('id, event_id, quantity_available, quantity_sold')
          .eq('id', ticketTypeId)
          .single();

        if (error || !ticketType) {
          console.warn(`⚠️ Ticket type not found: ${ticketTypeId}`);
          // Cache the failed ticket type to prevent repeated queries
          this.failedTicketTypes.add(ticketTypeId);
          return null;
        }

        inventory = {
          ticketTypeId: ticketType.id,
          eventId: ticketType.event_id,
          totalQuantity: (ticketType.quantity_available || 0) + (ticketType.quantity_sold || 0),
          availableQuantity: ticketType.quantity_available || 0,
          soldQuantity: ticketType.quantity_sold || 0,
          heldQuantity: 0,
          lastUpdated: new Date(),
          version: 1
        };

        this.inventoryCache.set(ticketTypeId, inventory);
      } catch (error) {
        console.error(`❌ Error fetching inventory for ${ticketTypeId}:`, error);
        // Cache the failed ticket type to prevent repeated queries
        this.failedTicketTypes.add(ticketTypeId);
        return null;
      }
    }

    return inventory;
  }

  private getInventoryStatus(inventory: TicketInventory): InventoryStatus {
    const available = inventory.availableQuantity - inventory.heldQuantity;
    
    if (available <= 0) return InventoryStatus.SOLD_OUT;
    if (available <= this.config.veryLowStockThreshold) return InventoryStatus.VERY_LOW_STOCK;
    if (available <= this.config.lowStockThreshold) return InventoryStatus.LOW_STOCK;
    return InventoryStatus.AVAILABLE;
  }

  private emitInventoryUpdate(event: InventoryUpdateEvent): void {
    this.updateListeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('❌ Error in inventory update listener:', error);
      }
    });
  }

  public onInventoryUpdate(listener: (event: InventoryUpdateEvent) => void): () => void {
    this.updateListeners.add(listener);
    return () => this.updateListeners.delete(listener);
  }

  // Additional methods for compatibility with hooks
  public static subscribeToInventoryChanges(
    ticketTypeId: string,
    callback: (status: any) => void
  ): () => void {
    const service = InventoryService.getInstance();
    return service.onInventoryUpdate((event) => {
      if (event.ticketTypeId === ticketTypeId) {
        const status = {
          isAvailable: event.inventory.availableQuantity > 0,
          available: event.inventory.availableQuantity,
          sold: event.inventory.soldQuantity,
          held: event.inventory.heldQuantity,
          total: event.inventory.totalQuantity
        };
        callback(status);
      }
    });
  }

  public static async getInventoryStatus(ticketTypeId: string) {
    const service = InventoryService.getInstance();
    const inventory = await service.getInventory(ticketTypeId);
    if (!inventory) return null;
    
    return {
      isAvailable: inventory.availableQuantity > 0,
      available: inventory.availableQuantity,
      sold: inventory.soldQuantity,
      held: inventory.heldQuantity,
      total: inventory.totalQuantity
    };
  }

  public static async getBulkInventoryStatus(ticketTypeIds: string[]) {
    const service = InventoryService.getInstance();
    const results = [];
    
    for (const ticketTypeId of ticketTypeIds) {
      const status = await InventoryService.getInventoryStatus(ticketTypeId);
      if (status) {
        results.push({
          ticketTypeId,
          ...status
        });
      }
    }
    
    return results;
  }

  public static async createInventoryHold(
    ticketTypeId: string,
    quantity: number,
    sessionId: string,
    userId?: string,
    channel: PurchaseChannel = PurchaseChannel.ONLINE
  ) {
    const service = InventoryService.getInstance();
    const result = await service.createHold(ticketTypeId, quantity, channel, sessionId, userId);
    return result.success ? result.hold : null;
  }

  public static async releaseInventoryHold(sessionId: string, ticketTypeId?: string) {
    // Implementation for releasing holds
    return true; // Placeholder
  }

  public static async confirmInventoryHold(
    sessionId: string,
    orderId: string,
    ticketTypeId: string,
    quantity: number
  ) {
    const service = InventoryService.getInstance();
    const holds = Array.from(service.activeHolds.values())
      .filter(hold => hold.sessionId === sessionId && hold.ticketTypeId === ticketTypeId);
    
    if (holds.length > 0) {
      const result = await service.completePurchase(holds[0].id, orderId);
      return result.success;
    }
    
    return false;
  }

  public static async getEventInventorySummary(eventId: string) {
    const service = InventoryService.getInstance();
    let totalAvailable = 0;
    let totalSold = 0;
    let totalCapacity = 0;
    const ticketTypes = [];
    
    for (const inventory of service.inventoryCache.values()) {
      if (inventory.eventId === eventId) {
        totalAvailable += inventory.availableQuantity;
        totalSold += inventory.soldQuantity;
        totalCapacity += inventory.totalQuantity;
        
        ticketTypes.push({
          isAvailable: inventory.availableQuantity > 0,
          available: inventory.availableQuantity,
          sold: inventory.soldQuantity,
          held: inventory.heldQuantity,
          total: inventory.totalQuantity
        });
      }
    }
    
    return {
      totalAvailable,
      totalSold,
      totalCapacity,
      ticketTypes
    };
  }

  public static isLowInventory(status: any): boolean {
    return status.available > 0 && status.available <= 10;
  }

  public async getAllInventory(): Promise<TicketInventory[]> {
    return Array.from(this.inventoryCache.values());
  }

  public async getActiveHolds(): Promise<InventoryHold[]> {
    return Array.from(this.activeHolds.values())
      .filter(hold => hold.status === HoldStatus.ACTIVE);
  }

  public async getAuditLog(): Promise<InventoryAuditEntry[]> {
    // Mock implementation - in production this would query the database
    return [];
  }

  public async releaseEventHolds(eventId: string): Promise<void> {
    const eventHolds = Array.from(this.activeHolds.values())
      .filter(hold => hold.eventId === eventId);
    
    for (const hold of eventHolds) {
      await this.releaseHold(hold.id);
    }
  }

  public async adjustInventory(ticketTypeId: string, adjustment: number, reason: string): Promise<void> {
    const inventory = this.inventoryCache.get(ticketTypeId);
    if (!inventory) {
      throw new Error(`Inventory not found for ticket type: ${ticketTypeId}`);
    }

    inventory.totalQuantity += adjustment;
    inventory.availableQuantity += adjustment;
    inventory.lastUpdated = new Date();
    inventory.version++;

    this.inventoryCache.set(ticketTypeId, inventory);
    this.notifyUpdate({
      type: InventoryUpdateType.INVENTORY_CHANGED,
      ticketTypeId,
      eventId: inventory.eventId,
      inventory,
      timestamp: new Date()
    });
  }

  public clearFailedTicketTypesCache(): void {
    this.failedTicketTypes.clear();
    console.log('🔄 Cleared failed ticket types cache');
  }

  public async getInventoryStatusSummary(): Promise<InventoryStatusSummary> {
    try {
      const totalTicketTypes = this.inventoryCache.size;
      let totalInventory = 0;
      let totalSold = 0;
      let totalHeld = 0;
      let lowStockAlerts = 0;
      let soldOutEvents = 0;

      for (const inventory of this.inventoryCache.values()) {
        totalInventory += inventory.totalQuantity;
        totalSold += inventory.soldQuantity;
        totalHeld += inventory.heldQuantity;
        
        const status = this.getInventoryStatus(inventory);
        if (status === InventoryStatus.LOW_STOCK || status === InventoryStatus.VERY_LOW_STOCK) {
          lowStockAlerts++;
        }
        if (status === InventoryStatus.SOLD_OUT) {
          soldOutEvents++;
        }
      }

      const activeHolds = Array.from(this.activeHolds.values())
        .filter(hold => hold.status === HoldStatus.ACTIVE).length;

      return {
        totalEvents: new Set(Array.from(this.inventoryCache.values()).map(i => i.eventId)).size,
        totalTicketTypes,
        totalInventory,
        totalSold,
        totalHeld,
        totalAvailable: totalInventory - totalSold - totalHeld,
        activeHolds,
        expiredHolds: 0,
        lowStockAlerts,
        soldOutEvents,
        lowStockEvents: lowStockAlerts
      };
    } catch (error) {
      console.error('❌ Error getting inventory summary:', error);
      return {
        totalEvents: 0,
        totalTicketTypes: 0,
        totalInventory: 0,
        totalSold: 0,
        totalHeld: 0,
        totalAvailable: 0,
        activeHolds: 0,
        expiredHolds: 0,
        lowStockAlerts: 0,
        soldOutEvents: 0,
        lowStockEvents: 0
      };
    }
  }
}

export const inventoryService = InventoryService.getInstance();

// Export types for hooks
export type { InventoryStatus } from '@/types/inventory';