// Inventory Management System Types
// Created for B-011: Real-time Inventory Management System

export interface TicketInventory {
  eventId: string;
  ticketTypeId: string;
  ticketTypeName: string;
  totalQuantity: number;
  soldQuantity: number;
  heldQuantity: number;
  availableQuantity: number;
  lastUpdated: Date;
}

export interface InventoryHold {
  id: string;
  eventId: string;
  ticketTypeId: string;
  quantity: number;
  sessionId: string; // Unique session identifier
  holdType: 'checkout' | 'cash-payment' | 'admin-reserve';
  createdAt: Date;
  expiresAt: Date;
  isExpired: boolean;
  releasedAt?: Date;
}

export interface InventoryTransaction {
  id: string;
  eventId: string;
  ticketTypeId: string;
  transactionType: 'purchase' | 'refund' | 'admin-adjustment' | 'hold-create' | 'hold-release';
  quantity: number;
  previousAvailable: number;
  newAvailable: number;
  userId?: string;
  sessionId?: string;
  orderId?: string;
  reason?: string;
  createdAt: Date;
  metadata?: Record<string, any>;
}

export interface InventoryStatus {
  eventId: string;
  totalTickets: number;
  totalSold: number;
  totalHeld: number;
  totalAvailable: number;
  ticketTypes: TicketInventory[];
  activeHolds: InventoryHold[];
  lastUpdated: Date;
}

export interface InventoryConflictResolution {
  conflictId: string;
  eventId: string;
  ticketTypeId: string;
  requestedQuantity: number;
  availableQuantity: number;
  sessionId: string;
  resolutionType: 'partial-fulfill' | 'deny-request' | 'queue-request';
  resolvedQuantity: number;
  message: string;
  timestamp: Date;
}

export interface InventoryUpdateRequest {
  eventId: string;
  ticketTypeId: string;
  requestType: 'create-hold' | 'release-hold' | 'purchase' | 'refund';
  quantity: number;
  sessionId?: string;
  holdType?: InventoryHold['holdType'];
  holdDurationMinutes?: number;
  userId?: string;
  orderId?: string;
  reason?: string;
}

export interface InventoryUpdateResponse {
  success: boolean;
  updatedInventory?: TicketInventory;
  conflict?: InventoryConflictResolution;
  hold?: InventoryHold;
  transaction?: InventoryTransaction;
  message: string;
}

export interface BulkInventoryOperation {
  operationId: string;
  eventId: string;
  operationType: 'adjust-quantities' | 'release-expired-holds' | 'bulk-purchase';
  operations: InventoryUpdateRequest[];
  userId: string;
  createdAt: Date;
  completedAt?: Date;
  results: InventoryUpdateResponse[];
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
}

// Configuration types
export interface InventoryConfig {
  defaultHoldDurationMinutes: number;
  cashPaymentHoldDurationMinutes: number;
  adminReserveHoldDurationMinutes: number;
  lowStockThreshold: number;
  criticalStockThreshold: number;
  enableConflictResolution: boolean;
  enablePartialFulfillment: boolean;
  enableRequestQueuing: boolean;
  auditRetentionDays: number;
}

// UI Status types
export interface TicketAvailabilityStatus {
  ticketTypeId: string;
  status: 'available' | 'low-stock' | 'critical-stock' | 'sold-out' | 'coming-soon';
  availableQuantity: number;
  totalQuantity: number;
  message: string;
  className: string; // CSS classes for visual indicators
}

export interface InventoryAlert {
  id: string;
  type: 'low-stock' | 'sold-out' | 'system-error' | 'conflict-resolved';
  eventId: string;
  ticketTypeId?: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'success';
  timestamp: Date;
  acknowledged: boolean;
  userId?: string;
} 