import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { InventoryService } from './inventoryService';
import { PurchaseChannel } from '@/types/inventory';

type Order = Database['public']['Tables']['orders']['Row'];
type OrderInsert = Database['public']['Tables']['orders']['Insert'];

export interface CashPaymentCode {
  id: string;
  orderId: string;
  paymentCode: string;
  qrCode: string;
  amount: number;
  expiresAt: string;
  status: 'pending' | 'paid' | 'expired' | 'cancelled';
  createdAt: string;
}

export interface CashPaymentRequest {
  eventId: string;
  userId: string;
  items: Array<{
    ticketTypeId: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  discountAmount?: number;
  promoCode?: string;
  customerDetails: {
    name: string;
    email: string;
    phone: string;
  };
}

export class CashPaymentService {
  private static readonly HOLD_DURATION_HOURS = 4;
  private static readonly CODE_LENGTH = 12;

  // Generate unique payment code
  static generatePaymentCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < this.CODE_LENGTH; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Generate QR code data for payment
  static generateQRCodeData(paymentCode: string, amount: number): string {
    return JSON.stringify({
      type: 'cash_payment',
      code: paymentCode,
      amount: amount,
      timestamp: new Date().toISOString(),
    });
  }

  // Create cash payment order with 4-hour hold
  static async createCashPaymentOrder(request: CashPaymentRequest): Promise<CashPaymentCode | null> {
    try {
      // First, create inventory holds for all items
      const sessionId = `cash_${Date.now()}_${Math.random()}`;
      const holdPromises = request.items.map(item =>
        InventoryService.createInventoryHold(
          item.ticketTypeId,
          item.quantity,
          sessionId,
          request.userId,
          PurchaseChannel.CASH
        )
      );

      const holds = await Promise.all(holdPromises);
      const failedHolds = holds.some(hold => !hold);

      if (failedHolds) {
        // Release any successful holds
        await InventoryService.releaseInventoryHold(sessionId);
        throw new Error('Unable to reserve tickets for cash payment');
      }

      // Create order with pending status
      const orderNumber = `CASH-${Date.now()}`;
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + this.HOLD_DURATION_HOURS);

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: request.userId,
          event_id: request.eventId,
          order_number: orderNumber,
          total_amount: request.totalAmount,
          discount_amount: request.discountAmount || 0,
          fees_amount: 0,
          final_amount: request.totalAmount - (request.discountAmount || 0),
          status: 'pending',
          promo_code_used: request.promoCode,
          billing_details: {
            payment_method: 'cash',
            customer_name: request.customerDetails.name,
            customer_email: request.customerDetails.email,
            customer_phone: request.customerDetails.phone,
            expires_at: expiresAt.toISOString(),
          },
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = request.items.map(item => ({
        order_id: order.id,
        ticket_type_id: item.ticketTypeId,
        price: item.price,
        attendee_name: request.customerDetails.name,
        attendee_email: request.customerDetails.email,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Generate payment code and QR code
      const paymentCode = this.generatePaymentCode();
      const qrCodeData = this.generateQRCodeData(paymentCode, order.final_amount);

      // Store cash payment details in order metadata
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          billing_details: {
            ...order.billing_details,
            payment_code: paymentCode,
            qr_code_data: qrCodeData,
          }
        })
        .eq('id', order.id);

      if (updateError) throw updateError;

      return {
        id: order.id,
        orderId: order.id,
        paymentCode,
        qrCode: qrCodeData,
        amount: order.final_amount,
        expiresAt: expiresAt.toISOString(),
        status: 'pending',
        createdAt: order.created_at,
      };

    } catch (error) {
      console.error('Error creating cash payment order:', error);
      return null;
    }
  }

  // Process cash payment (called when payment is received)
  static async processCashPayment(paymentCode: string): Promise<boolean> {
    try {
      // Find order by payment code
      const { data: orders, error: findError } = await supabase
        .from('orders')
        .select('*')
        .eq('status', 'pending')
        .like('billing_details->>payment_code', paymentCode);

      if (findError) throw findError;
      if (!orders || orders.length === 0) {
        throw new Error('Payment code not found or already processed');
      }

      const order = orders[0];

      // Check if payment hasn't expired
      const billingDetails = order.billing_details as any;
      const expiresAt = new Date(billingDetails.expires_at);
      if (new Date() > expiresAt) {
        throw new Error('Payment code has expired');
      }

      // Update order status to confirmed
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          status: 'confirmed',
          billing_details: {
            ...billingDetails,
            paid_at: new Date().toISOString(),
          }
        })
        .eq('id', order.id);

      if (updateError) throw updateError;

      // Get order items to confirm inventory holds
      const { data: orderItems, error: itemsError } = await supabase
        .from('order_items')
        .select('*, ticket_types(*)')
        .eq('order_id', order.id);

      if (itemsError) throw itemsError;

      // Confirm inventory holds by converting to sold tickets
      for (const item of orderItems || []) {
        await InventoryService.confirmInventoryHold(
          `cash_${order.created_at}`,
          order.id,
          item.ticket_type_id,
          1 // Assuming 1 ticket per order item
        );
      }

      // Create payment record
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          order_id: order.id,
          payment_method: 'cash',
          amount: order.final_amount,
          status: 'completed',
          payment_details: {
            payment_code: paymentCode,
            processed_at: new Date().toISOString(),
          }
        });

      if (paymentError) {
        console.warn('Error creating payment record:', paymentError);
      }

      return true;

    } catch (error) {
      console.error('Error processing cash payment:', error);
      return false;
    }
  }

  // Get cash payment status
  static async getCashPaymentStatus(paymentCode: string): Promise<CashPaymentCode | null> {
    try {
      const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .like('billing_details->>payment_code', paymentCode)
        .single();

      if (error) throw error;

      const billingDetails = orders.billing_details as any;
      const expiresAt = new Date(billingDetails.expires_at);
      const isExpired = new Date() > expiresAt;

      let status: 'pending' | 'paid' | 'expired' | 'cancelled' = 'pending';
      if (orders.status === 'confirmed') {
        status = 'paid';
      } else if (isExpired) {
        status = 'expired';
      } else if (orders.status === 'cancelled') {
        status = 'cancelled';
      }

      return {
        id: orders.id,
        orderId: orders.id,
        paymentCode: billingDetails.payment_code,
        qrCode: billingDetails.qr_code_data,
        amount: orders.final_amount,
        expiresAt: billingDetails.expires_at,
        status,
        createdAt: orders.created_at,
      };

    } catch (error) {
      console.error('Error getting cash payment status:', error);
      return null;
    }
  }

  // Cancel cash payment order
  static async cancelCashPayment(paymentCode: string): Promise<boolean> {
    try {
      const { data: orders, error: findError } = await supabase
        .from('orders')
        .select('*')
        .like('billing_details->>payment_code', paymentCode)
        .eq('status', 'pending');

      if (findError) throw findError;
      if (!orders || orders.length === 0) {
        return false;
      }

      const order = orders[0];

      // Update order status to cancelled
      const { error: updateError } = await supabase
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('id', order.id);

      if (updateError) throw updateError;

      // Release inventory holds
      const sessionId = `cash_${order.created_at}`;
      await InventoryService.releaseInventoryHold(sessionId);

      return true;

    } catch (error) {
      console.error('Error cancelling cash payment:', error);
      return false;
    }
  }

  // Cleanup expired cash payments
  static async cleanupExpiredCashPayments(): Promise<number> {
    try {
      const now = new Date().toISOString();
      
      // Find expired pending orders
      const { data: expiredOrders, error: findError } = await supabase
        .from('orders')
        .select('*')
        .eq('status', 'pending')
        .like('billing_details->>payment_method', 'cash')
        .lt('billing_details->>expires_at', now);

      if (findError) throw findError;

      if (!expiredOrders || expiredOrders.length === 0) {
        return 0;
      }

      // Cancel expired orders
      const orderIds = expiredOrders.map(order => order.id);
      const { error: updateError } = await supabase
        .from('orders')
        .update({ status: 'cancelled' })
        .in('id', orderIds);

      if (updateError) throw updateError;

      // Release inventory holds for expired orders
      for (const order of expiredOrders) {
        const sessionId = `cash_${order.created_at}`;
        await InventoryService.releaseInventoryHold(sessionId);
      }

      console.log(`Cleaned up ${expiredOrders.length} expired cash payment orders`);
      return expiredOrders.length;

    } catch (error) {
      console.error('Error cleaning up expired cash payments:', error);
      return 0;
    }
  }

  // Get all pending cash payments for an event (admin view)
  static async getPendingCashPayments(eventId: string): Promise<CashPaymentCode[]> {
    try {
      const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .eq('event_id', eventId)
        .eq('status', 'pending')
        .like('billing_details->>payment_method', 'cash')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (orders || []).map(order => {
        const billingDetails = order.billing_details as any;
        const expiresAt = new Date(billingDetails.expires_at);
        const isExpired = new Date() > expiresAt;

        return {
          id: order.id,
          orderId: order.id,
          paymentCode: billingDetails.payment_code,
          qrCode: billingDetails.qr_code_data,
          amount: order.final_amount,
          expiresAt: billingDetails.expires_at,
          status: isExpired ? 'expired' : 'pending',
          createdAt: order.created_at,
        };
      });

    } catch (error) {
      console.error('Error getting pending cash payments:', error);
      return [];
    }
  }

  // Validate payment code format
  static isValidPaymentCode(code: string): boolean {
    return /^[A-Z0-9]{12}$/.test(code);
  }

  // Get time remaining for payment
  static getTimeRemaining(expiresAt: string): {
    hours: number;
    minutes: number;
    isExpired: boolean;
  } {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires.getTime() - now.getTime();

    if (diff <= 0) {
      return { hours: 0, minutes: 0, isExpired: true };
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return { hours, minutes, isExpired: false };
  }
}