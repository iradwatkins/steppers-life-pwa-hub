/**
 * Comprehensive Inventory Management Types
 * Story B.011: Real-time Inventory Management System
 * 
 * Supports real-time tracking, automatic holds, conflict resolution,
 * and multi-channel inventory management (online, cash, admin)
 */

export interface TicketInventory {
  ticketTypeId: string;
  eventId: string;
  totalQuantity: number;
  availableQuantity: number;
  soldQuantity: number;
  heldQuantity: number;
  lastUpdated: Date;
  version: number; // For optimistic locking
}

export interface InventoryHold {
  id: string;
  ticketTypeId: string;
  eventId: string;
  quantity: number;
  userId?: string;
  sessionId: string;
  channel: PurchaseChannel;
  createdAt: Date;
  expiresAt: Date;
  status: HoldStatus;
  metadata?: Record<string, any>;
}

export interface InventoryTransaction {
  id: string;
  type: TransactionType;
  ticketTypeId: string;
  eventId: string;
  quantity: number;
  userId?: string;
  sessionId: string;
  channel: PurchaseChannel;
  relatedHoldId?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface InventoryAuditLog {
  id: string;
  action: AuditAction;
  ticketTypeId: string;
  eventId: string;
  userId?: string;
  previousState: Partial<TicketInventory>;
  newState: Partial<TicketInventory>;
  timestamp: Date;
  details: string;
  metadata?: Record<string, any>;
}

export interface ConflictResolution {
  conflictId: string;
  ticketTypeId: string;
  attemptedQuantity: number;
  availableQuantity: number;
  conflictingRequests: ConflictingRequest[];
  resolution: ResolutionStrategy;
  resolvedAt: Date;
}

export interface ConflictingRequest {
  sessionId: string;
  userId?: string;
  requestedQuantity: number;
  timestamp: Date;
  priority: number;
}

// Enums
export enum PurchaseChannel {
  ONLINE = 'online',
  CASH = 'cash',
  ADMIN = 'admin',
  BULK = 'bulk'
}

export enum HoldStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  RELEASED = 'released',
  COMPLETED = 'completed'
}

export enum TransactionType {
  HOLD_CREATE = 'hold_create',
  HOLD_RELEASE = 'hold_release',
  HOLD_EXPIRE = 'hold_expire',
  PURCHASE_COMPLETE = 'purchase_complete',
  REFUND = 'refund',
  ADMIN_ADJUSTMENT = 'admin_adjustment'
}

export enum AuditAction {
  INVENTORY_CREATED = 'inventory_created',
  INVENTORY_UPDATED = 'inventory_updated',
  HOLD_CREATED = 'hold_created',
  HOLD_RELEASED = 'hold_released',
  HOLD_EXPIRED = 'hold_expired',
  PURCHASE_COMPLETED = 'purchase_completed',
  REFUND_PROCESSED = 'refund_processed',
  ADMIN_OVERRIDE = 'admin_override'
}

export enum ResolutionStrategy {
  FIRST_COME_FIRST_SERVED = 'first_come_first_served',
  PRIORITY_BASED = 'priority_based',
  RANDOM_SELECTION = 'random_selection'
}

export enum InventoryStatus {
  AVAILABLE = 'available',
  LOW_STOCK = 'low_stock',
  VERY_LOW_STOCK = 'very_low_stock',
  SOLD_OUT = 'sold_out'
}

// Configuration Interfaces
export interface InventoryConfig {
  holdTimeoutMinutes: number;
  cashHoldTimeoutHours: number;
  lowStockThreshold: number;
  veryLowStockThreshold: number;
  cleanupIntervalMinutes: number;
  conflictResolutionStrategy: ResolutionStrategy;
  enableAuditLogging: boolean;
}

export interface HoldTimeouts {
  [PurchaseChannel.ONLINE]: number; // minutes
  [PurchaseChannel.CASH]: number;   // hours
  [PurchaseChannel.ADMIN]: number;  // minutes
  [PurchaseChannel.BULK]: number;   // minutes
}

// Response Interfaces
export interface InventoryCheckResult {
  available: boolean;
  availableQuantity: number;
  requestedQuantity: number;
  inventoryStatus: InventoryStatus;
  holdCreated?: InventoryHold;
  message?: string;
}

export interface HoldCreationResult {
  success: boolean;
  hold?: InventoryHold;
  error?: string;
  conflictResolution?: ConflictResolution;
}

export interface PurchaseResult {
  success: boolean;
  inventoryUpdated: boolean;
  holdReleased: boolean;
  remainingInventory: number;
  transaction?: InventoryTransaction;
  error?: string;
}

export interface InventoryStatusSummary {
  totalEvents: number;
  totalTicketTypes: number;
  totalInventory: number;
  totalSold: number;
  totalHeld: number;
  totalAvailable: number;
  activeHolds: number;
  expiredHolds: number;
  lowStockAlerts: number;
  soldOutEvents: number;
  lowStockEvents: number;
}

export interface InventoryAuditEntry {
  id: string;
  ticketTypeId: string;
  eventId: string;
  action: AuditAction;
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  userId?: string;
  sessionId?: string;
  channel: PurchaseChannel;
  reason?: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

// Real-time Update Interfaces
export interface InventoryUpdateEvent {
  type: InventoryUpdateType;
  ticketTypeId: string;
  eventId: string;
  inventory: TicketInventory;
  timestamp: Date;
}

export enum InventoryUpdateType {
  INVENTORY_CHANGED = 'inventory_changed',
  HOLD_CREATED = 'hold_created',
  HOLD_RELEASED = 'hold_released',
  HOLD_EXPIRED = 'hold_expired',
  PURCHASE_COMPLETED = 'purchase_completed'
}

// Bulk Management Interfaces
export interface BulkInventoryUpdate {
  ticketTypeId: string;
  operation: BulkOperation;
  quantity?: number;
  reason: string;
}

export enum BulkOperation {
  ADD_INVENTORY = 'add_inventory',
  REMOVE_INVENTORY = 'remove_inventory',
  SET_INVENTORY = 'set_inventory',
  RELEASE_ALL_HOLDS = 'release_all_holds'
}

export interface BulkUpdateResult {
  success: boolean;
  updatedTicketTypes: string[];
  errors: BulkUpdateError[];
  summary: BulkUpdateSummary;
}

export interface BulkUpdateError {
  ticketTypeId: string;
  error: string;
  operation: BulkOperation;
}

export interface BulkUpdateSummary {
  totalProcessed: number;
  successfulUpdates: number;
  failedUpdates: number;
  inventoryAdjustment: number;
  holdsReleased: number;
}

// Default Configuration
export const DEFAULT_INVENTORY_CONFIG: InventoryConfig = {
  holdTimeoutMinutes: 15,
  cashHoldTimeoutHours: 4,
  lowStockThreshold: 10,
  veryLowStockThreshold: 3,
  cleanupIntervalMinutes: 5,
  conflictResolutionStrategy: ResolutionStrategy.FIRST_COME_FIRST_SERVED,
  enableAuditLogging: true
};

export const DEFAULT_HOLD_TIMEOUTS: HoldTimeouts = {
  [PurchaseChannel.ONLINE]: 15,     // 15 minutes
  [PurchaseChannel.CASH]: 4 * 60,   // 4 hours in minutes
  [PurchaseChannel.ADMIN]: 60,      // 1 hour
  [PurchaseChannel.BULK]: 30        // 30 minutes
};