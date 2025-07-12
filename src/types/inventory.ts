
export interface InventoryStatus {
  isAvailable: boolean;
  available: number;
  sold: number;
  held: number;
  total: number;
}

export interface InventoryHold {
  id: string;
  user_id: string;
  ticket_type_id: string;
  quantity: number;
  expires_at: string;
  created_at: string;
}

export interface TicketInventory {
  ticket_type_id: string;
  total_capacity: number;
  sold_count: number;
  held_count: number;
  available_count: number;
  last_updated: string;
}

// Add missing exports for inventory service
export interface InventoryConfig {
  cleanupIntervalMinutes: number;
  lowStockThreshold: number;
  veryLowStockThreshold: number;
}

export const DEFAULT_INVENTORY_CONFIG: InventoryConfig = {
  cleanupIntervalMinutes: 5,
  lowStockThreshold: 10,
  veryLowStockThreshold: 3,
};

export enum PurchaseChannel {
  ONLINE = 'online',
  CASH = 'cash',
  ADMIN = 'admin'
}

export const DEFAULT_HOLD_TIMEOUTS = {
  [PurchaseChannel.ONLINE]: 15, // 15 minutes
  [PurchaseChannel.CASH]: 480,  // 8 hours
  [PurchaseChannel.ADMIN]: 60   // 1 hour
};

export enum HoldStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  COMPLETED = 'completed'
}

export enum InventoryUpdateType {
  HOLD_CREATED = 'hold_created',
  HOLD_EXPIRED = 'hold_expired',
  PURCHASE_COMPLETED = 'purchase_completed'
}

export interface InventoryCheckResult {
  available: boolean;
  availableQuantity: number;
  requestedQuantity: number;
  inventoryStatus: any;
  message: string;
  holdCreated?: any;
}

export interface HoldCreationResult {
  success: boolean;
  error?: string;
  hold?: any;
}

export interface PurchaseResult {
  success: boolean;
  inventoryUpdated: boolean;
  holdReleased: boolean;
  remainingInventory: number;
  error?: string;
}

export interface InventoryStatusSummary {
  eventId: string;
  totalAvailable: number;
  totalSold: number;
  totalCapacity: number;
}

export interface InventoryUpdateEvent {
  type: InventoryUpdateType;
  ticketTypeId: string;
  eventId: string;
  inventory: any;
  timestamp: Date;
}
