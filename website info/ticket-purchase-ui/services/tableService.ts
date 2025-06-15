import type {
  TableService,
  TableReservation,
  ServiceResponse,
  Table,
  Section,
  Order
} from '../types';

class TableServiceImpl implements TableService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async getTables(eventId: number): Promise<ServiceResponse<Table[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/events/${eventId}/tables`);
      const result = await response.json();
      return {
        success: response.ok,
        data: result.data,
        error: result.error
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get tables'
      };
    }
  }

  async getSections(eventId: number): Promise<ServiceResponse<Section[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/events/${eventId}/sections`);
      const result = await response.json();
      return {
        success: response.ok,
        data: result.data,
        error: result.error
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get sections'
      };
    }
  }

  async reserveTable(data: TableReservation): Promise<ServiceResponse<Order>> {
    try {
      const response = await fetch(`${this.baseUrl}/tables/reserve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      const result = await response.json();
      return {
        success: response.ok,
        data: result.data,
        error: result.error
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to reserve table'
      };
    }
  }

  async cancelReservation(tableId: number): Promise<ServiceResponse<Order>> {
    try {
      const response = await fetch(`${this.baseUrl}/tables/${tableId}/cancel`, {
        method: 'POST'
      });
      const result = await response.json();
      return {
        success: response.ok,
        data: result.data,
        error: result.error
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to cancel reservation'
      };
    }
  }

  async checkInTable(tableId: number): Promise<ServiceResponse<Order>> {
    try {
      const response = await fetch(`${this.baseUrl}/tables/${tableId}/check-in`, {
        method: 'POST'
      });
      const result = await response.json();
      return {
        success: response.ok,
        data: result.data,
        error: result.error
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to check in table'
      };
    }
  }

  // Helper methods
  isTableAvailable(table: Table): boolean {
    return table.status === 'available';
  }

  isTableReserved(table: Table): boolean {
    return table.status === 'reserved';
  }

  isTableSold(table: Table): boolean {
    return table.status === 'sold';
  }

  isTableBlocked(table: Table): boolean {
    return table.status === 'blocked';
  }

  getTableStatusColor(status: Table['status']): string {
    switch (status) {
      case 'available':
        return 'bg-green-500';
      case 'reserved':
        return 'bg-yellow-500';
      case 'sold':
        return 'bg-red-500';
      case 'blocked':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  }

  getTableStatusText(status: Table['status']): string {
    switch (status) {
      case 'available':
        return 'Available';
      case 'reserved':
        return 'Reserved';
      case 'sold':
        return 'Sold';
      case 'blocked':
        return 'Blocked';
      default:
        return 'Unknown';
    }
  }

  calculateTablePrice(table: Table, quantity: number = 1): number {
    return table.price * quantity;
  }

  formatTableInfo(table: Table): {
    displayName: string;
    displayCapacity: string;
    displayPrice: string;
    displayStatus: string;
  } {
    return {
      displayName: table.name,
      displayCapacity: `${table.capacity} seats`,
      displayPrice: `$${table.price.toFixed(2)}`,
      displayStatus: this.getTableStatusText(table.status)
    };
  }
}

export const tableService = new TableServiceImpl(process.env.API_URL || ''); 