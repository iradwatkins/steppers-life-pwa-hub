import type {
  TableService,
  TableReservation,
  ServiceResponse,
  Table,
  Section,
  Order
} from '@/types/ticket';
import { apiClient } from './apiClient';

class TableServiceImpl implements TableService {
  async getTables(eventId: number): Promise<ServiceResponse<Table[]>> {
    return apiClient.get<Table[]>(`/events/${eventId}/tables`);
  }

  async getSections(eventId: number): Promise<ServiceResponse<Section[]>> {
    return apiClient.get<Section[]>(`/events/${eventId}/sections`);
  }

  async reserveTable(data: TableReservation): Promise<ServiceResponse<Order>> {
    return apiClient.post<Order>('/tables/reserve', data);
  }

  async cancelReservation(tableId: number): Promise<ServiceResponse<Order>> {
    return apiClient.post<Order>(`/tables/${tableId}/cancel`);
  }

  async checkInTable(tableId: number): Promise<ServiceResponse<Order>> {
    return apiClient.post<Order>(`/tables/${tableId}/check-in`);
  }

  // Helper methods
  isTableAvailable(table: Table): boolean {
    return table.available;
  }

  getTableStatusColor(available: boolean): string {
    return available ? 'bg-green-500' : 'bg-red-500';
  }

  getTableStatusText(available: boolean): string {
    return available ? 'Available' : 'Reserved';
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
      displayName: table.number,
      displayCapacity: `${table.capacity} seats`,
      displayPrice: `$${table.price.toFixed(2)}`,
      displayStatus: this.getTableStatusText(table.available)
    };
  }
}

export const tableService = new TableServiceImpl();