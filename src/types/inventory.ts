
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
