import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { InventoryService } from './inventoryService';
import { PurchaseChannel } from '@/types/inventory';

type Order = Database['public']['Tables']['orders']['Row'];
type OrderInsert = Database['public']['Tables']['orders']['Insert'];
type OrderItem = Database['public']['Tables']['order_items']['Row'];
type OrderItemInsert = Database['public']['Tables']['order_items']['Insert'];

export interface CreateOrderData {
  userId: string;
  eventId: string;
  totalAmount: number;
  discountAmount?: number;
  feesAmount?: number;
  finalAmount: number;
  promoCodeUsed?: string;
  billingDetails: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dietaryRestrictions?: string;
    specialRequests?: string;
  };
  items: Array<{
    ticketTypeId: string;
    quantity: number;
    price: number;
    attendeeName?: string;
    attendeeEmail?: string;
    specialRequests?: string;
  }>;
  paymentIntentId?: string;
  sessionId?: string;
}

export interface OrderWithItems extends Order {
  order_items: OrderItem[];
  event: {
    title: string;
    start_date: string;
    end_date: string;
    venue?: {
      name: string;
      address: string;
      city: string;
      state: string;
    };
  };
}

export class OrderService {
  // Generate unique order number
  static generateOrderNumber(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `SL${timestamp.slice(-6)}${random}`;
  }

  // Create a new order with items
  static async createOrder(data: CreateOrderData): Promise<Order | null> {
    try {
      const orderNumber = this.generateOrderNumber();
      const inventoryService = InventoryService.getInstance();

      // Check inventory availability for all items before proceeding
      for (const item of (data.items || [])) {
        const availability = await inventoryService.checkAvailability(
          item.ticketTypeId,
          item.quantity,
          false // Don't create hold, just check
        );
        
        if (!availability.available) {
          throw new Error(`Insufficient inventory for ticket type ${item.ticketTypeId}. Only ${availability.availableQuantity} available.`);
        }
      }

      // Create the order
      const orderData: OrderInsert = {
        user_id: data.userId,
        event_id: data.eventId,
        order_number: orderNumber,
        total_amount: data.totalAmount,
        discount_amount: data.discountAmount || 0,
        fees_amount: data.feesAmount || 0,
        final_amount: data.finalAmount,
        status: 'confirmed',
        payment_intent_id: data.paymentIntentId,
        promo_code_used: data.promoCodeUsed,
        billing_details: data.billingDetails
      };

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = (data.items || []).map(item => ({
        order_id: order.id,
        ticket_type_id: item.ticketTypeId,
        price: item.price,
        attendee_name: item.attendeeName || `${data.billingDetails.firstName} ${data.billingDetails.lastName}`,
        attendee_email: item.attendeeEmail || data.billingDetails.email,
        special_requests: item.specialRequests
      }));

      // Insert order items into database
      if (orderItems.length > 0) {
        const { data: insertedItems, error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItems)
          .select();

        if (itemsError) {
          console.error('Error inserting order items:', itemsError);
          throw itemsError;
        }

        console.log('Order items created successfully:', insertedItems);

        // Generate individual tickets for each order item
        for (const orderItem of insertedItems) {
          // Create individual tickets based on quantity (if quantity field exists)
          // For now, create one ticket per order item
          const ticketData = {
            ticket_type_id: orderItem.ticket_type_id,
            status: 'active' as const
          };

          const { data: ticket, error: ticketError } = await supabase
            .from('tickets')
            .insert(ticketData)
            .select()
            .single();

          if (ticketError) {
            console.error('Error creating ticket for order item:', orderItem.id, ticketError);
            // Don't throw here to avoid rolling back the order, just log the error
          } else {
            // Update the order item with the ticket ID
            const { error: updateError } = await supabase
              .from('order_items')
              .update({ ticket_id: ticket.id })
              .eq('id', orderItem.id);

            if (updateError) {
              console.error('Error linking ticket to order item:', updateError);
            } else {
              console.log('Ticket created and linked successfully:', ticket.id);
            }
          }
        }
      }

      // Process inventory for each item
      for (const item of (data.items || [])) {
        if (data.sessionId) {
          // Confirm existing inventory hold if sessionId provided
          const holdConfirmed = await InventoryService.confirmInventoryHold(
            data.sessionId,
            order.id,
            item.ticketTypeId,
            item.quantity
          );
          
          if (!holdConfirmed) {
            console.warn(`Failed to confirm inventory hold for ticket type ${item.ticketTypeId}`);
            // Fallback: directly complete purchase
            const purchaseResult = await inventoryService.completePurchase(`temp_hold_${order.id}`, order.id);
            if (!purchaseResult.success) {
              throw new Error(`Failed to process inventory for ticket type ${item.ticketTypeId}`);
            }
          }
        } else {
          // Create and immediately complete purchase for direct inventory update
          const holdResult = await inventoryService.createHold(
            item.ticketTypeId,
            item.quantity,
            PurchaseChannel.ONLINE,
            `order_session_${order.id}`,
            data.userId
          );
          
          if (holdResult.success && holdResult.hold) {
            const purchaseResult = await inventoryService.completePurchase(holdResult.hold.id, order.id);
            if (!purchaseResult.success) {
              throw new Error(`Failed to complete inventory purchase for ticket type ${item.ticketTypeId}`);
            }
          } else {
            throw new Error(`Failed to create inventory hold for ticket type ${item.ticketTypeId}`);
          }
        }

        // Update ticket type quantities in database as backup
        const { error: updateError } = await supabase
          .from('ticket_types')
          .update({ 
            quantity_sold: item.quantity // This will be handled by RLS/triggers for proper SQL operations
          })
          .eq('id', item.ticketTypeId);

        if (updateError) {
          console.error('Error updating ticket quantity in database:', updateError);
        }
      }

      return order;
    } catch (error) {
      console.error('Error creating order:', error);
      return null;
    }
  }

  // Get order by ID with full details
  static async getOrderWithDetails(orderId: string): Promise<OrderWithItems | null> {
    try {
      const { data: order, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*),
          event:events (
            title,
            start_date,
            end_date,
            venue:venues (
              name,
              address,
              city,
              state
            )
          )
        `)
        .eq('id', orderId)
        .single();

      if (error) throw error;
      return order as OrderWithItems;
    } catch (error) {
      console.error('Error fetching order details:', error);
      return null;
    }
  }

  // Get orders for a user
  static async getUserOrders(userId: string): Promise<OrderWithItems[]> {
    try {
      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*),
          event:events (
            title,
            start_date,
            end_date,
            venue:venues (
              name,
              address,
              city,
              state
            )
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return orders as OrderWithItems[] || [];
    } catch (error) {
      console.error('Error fetching user orders:', error);
      return [];
    }
  }

  // Get order by order number
  static async getOrderByNumber(orderNumber: string): Promise<OrderWithItems | null> {
    try {
      const { data: order, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*),
          event:events (
            title,
            start_date,
            end_date,
            venue:venues (
              name,
              address,
              city,
              state
            )
          )
        `)
        .eq('order_number', orderNumber)
        .single();

      if (error) throw error;
      return order as OrderWithItems;
    } catch (error) {
      console.error('Error fetching order by number:', error);
      return null;
    }
  }

  // Update order status
  static async updateOrderStatus(orderId: string, status: 'pending' | 'confirmed' | 'cancelled' | 'refunded'): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', orderId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating order status:', error);
      return false;
    }
  }

  // Cancel order and restore ticket quantities
  static async cancelOrder(orderId: string): Promise<boolean> {
    try {
      // Get order items to restore quantities
      const { data: orderItems, error: fetchError } = await supabase
        .from('order_items')
        .select('ticket_type_id, price')
        .eq('order_id', orderId);

      if (fetchError) throw fetchError;

      // Update order status
      const { error: statusError } = await supabase
        .from('orders')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('id', orderId);

      if (statusError) throw statusError;

      // Restore ticket quantities
      for (const item of (orderItems || [])) {
        const { error: restoreError } = await supabase
          .from('ticket_types')
          .update({ 
            quantity_sold: supabase.sql`GREATEST(0, quantity_sold - 1)`
          })
          .eq('id', item.ticket_type_id);

        if (restoreError) {
          console.error('Error restoring ticket quantity:', restoreError);
        }
      }

      return true;
    } catch (error) {
      console.error('Error cancelling order:', error);
      return false;
    }
  }

  // Calculate order analytics
  static async getOrderAnalytics(eventId?: string): Promise<{
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    conversionRate: number;
  }> {
    try {
      let query = supabase
        .from('orders')
        .select('final_amount, status');

      if (eventId) {
        query = query.eq('event_id', eventId);
      }

      const { data: orders, error } = await query;
      if (error) throw error;

      const confirmedOrders = orders?.filter(order => order.status === 'confirmed') || [];
      const totalOrders = confirmedOrders.length;
      const totalRevenue = confirmedOrders.reduce((sum, order) => sum + order.final_amount, 0);
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // For conversion rate, we'd need more data about visitors
      // This is a simplified calculation
      const conversionRate = totalOrders > 0 ? 85 : 0; // Mock conversion rate

      return {
        totalOrders,
        totalRevenue,
        averageOrderValue,
        conversionRate
      };
    } catch (error) {
      console.error('Error calculating order analytics:', error);
      return {
        totalOrders: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        conversionRate: 0
      };
    }
  }
}