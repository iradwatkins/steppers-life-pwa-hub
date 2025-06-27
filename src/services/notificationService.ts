import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type User = Database['public']['Tables']['users']['Row'];
type Order = Database['public']['Tables']['orders']['Row'];
type Event = Database['public']['Tables']['events']['Row'];

export interface NotificationData {
  to: string;
  subject: string;
  message: string;
  type: 'email' | 'sms' | 'push';
  templateData?: Record<string, any>;
}

export interface EventCancellationNotification {
  eventId: string;
  eventTitle: string;
  eventDate: string;
  reason: string;
  organizerName: string;
  refundInfo?: {
    amount: number;
    processingDays: number;
    method: string;
  };
}

export class NotificationService {
  
  static async sendEventCancellationNotifications(
    eventId: string, 
    cancellationData: EventCancellationNotification
  ): Promise<{ success: number; failed: number; details: any[] }> {
    try {
      console.log('📧 Starting event cancellation notifications for event:', eventId);

      // Get all ticket holders for this event
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          users:user_id (
            id,
            email,
            full_name,
            phone
          ),
          order_items (
            quantity,
            ticket_types (
              name,
              price
            )
          )
        `)
        .eq('event_id', eventId)
        .eq('status', 'completed');

      if (ordersError) {
        console.error('❌ Error fetching orders for cancellation notifications:', ordersError);
        throw ordersError;
      }

      if (!orders || orders.length === 0) {
        console.log('ℹ️ No completed orders found for event cancellation notifications');
        return { success: 0, failed: 0, details: [] };
      }

      const notificationResults = [];
      let successCount = 0;
      let failedCount = 0;

      // Send notifications to each ticket holder
      for (const order of orders) {
        try {
          const user = order.users as any;
          if (!user?.email) {
            console.warn('⚠️ No email found for user in order:', order.id);
            failedCount++;
            continue;
          }

          // Calculate refund amount (total minus commission)
          const refundAmount = order.total_amount * 0.97; // 3% commission retained

          const emailResult = await this.sendEventCancellationEmail({
            to: user.email,
            userName: user.full_name || 'Valued Customer',
            eventTitle: cancellationData.eventTitle,
            eventDate: cancellationData.eventDate,
            reason: cancellationData.reason,
            organizerName: cancellationData.organizerName,
            orderNumber: order.order_number,
            refundAmount: refundAmount,
            originalAmount: order.total_amount,
            orderItems: order.order_items || []
          });

          if (emailResult.success) {
            successCount++;
          } else {
            failedCount++;
          }

          notificationResults.push({
            orderId: order.id,
            userEmail: user.email,
            result: emailResult
          });

          // Optional: Send SMS if phone number is available
          if (user.phone) {
            try {
              const smsResult = await this.sendEventCancellationSMS({
                to: user.phone,
                userName: user.full_name || 'Customer',
                eventTitle: cancellationData.eventTitle,
                eventDate: cancellationData.eventDate,
                refundAmount: refundAmount
              });
              
              console.log('📱 SMS sent result:', smsResult);
            } catch (smsError) {
              console.warn('⚠️ SMS sending failed (non-critical):', smsError);
            }
          }

        } catch (error) {
          console.error('❌ Error sending notification for order:', order.id, error);
          failedCount++;
          notificationResults.push({
            orderId: order.id,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      console.log(`✅ Event cancellation notifications complete: ${successCount} success, ${failedCount} failed`);

      return {
        success: successCount,
        failed: failedCount,
        details: notificationResults
      };

    } catch (error) {
      console.error('❌ Error in sendEventCancellationNotifications:', error);
      throw error;
    }
  }

  private static async sendEventCancellationEmail(data: {
    to: string;
    userName: string;
    eventTitle: string;
    eventDate: string;
    reason: string;
    organizerName: string;
    orderNumber: string;
    refundAmount: number;
    originalAmount: number;
    orderItems: any[];
  }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // Use Supabase Edge Function for email sending
      const { data: result, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: data.to,
          subject: `Event Cancelled: ${data.eventTitle}`,
          template: 'event-cancellation',
          templateData: {
            userName: data.userName,
            eventTitle: data.eventTitle,
            eventDate: data.eventDate,
            reason: data.reason,
            organizerName: data.organizerName,
            orderNumber: data.orderNumber,
            refundAmount: data.refundAmount.toFixed(2),
            originalAmount: data.originalAmount.toFixed(2),
            orderItems: data.orderItems,
            supportEmail: 'support@stepperslife.com',
            platformName: 'SteppersLife'
          }
        }
      });

      if (error) {
        console.error('❌ Email sending error:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Cancellation email sent successfully to:', data.to);
      return { success: true, messageId: result?.messageId };

    } catch (error) {
      console.error('❌ Error sending cancellation email:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  private static async sendEventCancellationSMS(data: {
    to: string;
    userName: string;
    eventTitle: string;
    eventDate: string;
    refundAmount: number;
  }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // Use Supabase Edge Function for SMS sending
      const { data: result, error } = await supabase.functions.invoke('send-sms', {
        body: {
          to: data.to,
          message: `Hi ${data.userName}, unfortunately "${data.eventTitle}" on ${data.eventDate} has been cancelled. You'll receive a refund of $${data.refundAmount.toFixed(2)} within 5-7 business days. Check your email for details. - SteppersLife`
        }
      });

      if (error) {
        console.error('❌ SMS sending error:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Cancellation SMS sent successfully to:', data.to);
      return { success: true, messageId: result?.messageId };

    } catch (error) {
      console.error('❌ Error sending cancellation SMS:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  static async processEventCancellationRefunds(eventId: string): Promise<{
    success: number;
    failed: number;
    totalRefunded: number;
    details: any[];
  }> {
    try {
      console.log('💰 Starting refund process for cancelled event:', eventId);

      // Get all completed orders for this event
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('event_id', eventId)
        .eq('status', 'completed');

      if (ordersError) {
        console.error('❌ Error fetching orders for refunds:', ordersError);
        throw ordersError;
      }

      if (!orders || orders.length === 0) {
        console.log('ℹ️ No orders to refund for cancelled event');
        return { success: 0, failed: 0, totalRefunded: 0, details: [] };
      }

      let successCount = 0;
      let failedCount = 0;
      let totalRefunded = 0;
      const refundDetails = [];

      for (const order of orders) {
        try {
          // Calculate refund amount (minus platform commission)
          const refundAmount = order.total_amount * 0.97; // Retain 3% commission
          
          // Create refund record
          const { data: refund, error: refundError } = await supabase
            .from('refunds')
            .insert({
              order_id: order.id,
              event_id: eventId,
              user_id: order.user_id,
              amount: refundAmount,
              reason: 'Event Cancelled',
              status: 'pending',
              refund_method: order.payment_method || 'original_payment',
              created_at: new Date().toISOString()
            })
            .select()
            .single();

          if (refundError) {
            console.error('❌ Error creating refund record:', refundError);
            failedCount++;
            continue;
          }

          // Update order status to refunded
          const { error: orderUpdateError } = await supabase
            .from('orders')
            .update({ 
              status: 'refunded',
              updated_at: new Date().toISOString()
            })
            .eq('id', order.id);

          if (orderUpdateError) {
            console.warn('⚠️ Error updating order status:', orderUpdateError);
          }

          successCount++;
          totalRefunded += refundAmount;
          
          refundDetails.push({
            orderId: order.id,
            orderNumber: order.order_number,
            originalAmount: order.total_amount,
            refundAmount: refundAmount,
            refundId: refund.id,
            status: 'pending'
          });

          console.log(`✅ Refund processed for order ${order.order_number}: $${refundAmount.toFixed(2)}`);

        } catch (error) {
          console.error('❌ Error processing refund for order:', order.id, error);
          failedCount++;
          refundDetails.push({
            orderId: order.id,
            orderNumber: order.order_number,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      console.log(`✅ Refund processing complete: ${successCount} success, ${failedCount} failed, $${totalRefunded.toFixed(2)} total`);

      return {
        success: successCount,
        failed: failedCount,
        totalRefunded,
        details: refundDetails
      };

    } catch (error) {
      console.error('❌ Error in processEventCancellationRefunds:', error);
      throw error;
    }
  }

  static async sendGeneralNotification(notification: NotificationData): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      switch (notification.type) {
        case 'email':
          return await this.sendEmail(notification);
        case 'sms':
          return await this.sendSMS(notification);
        case 'push':
          return await this.sendPushNotification(notification);
        default:
          throw new Error(`Unsupported notification type: ${notification.type}`);
      }
    } catch (error) {
      console.error('❌ Error sending notification:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private static async sendEmail(notification: NotificationData): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const { data: result, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: notification.to,
          subject: notification.subject,
          message: notification.message,
          templateData: notification.templateData
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, messageId: result?.messageId };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private static async sendSMS(notification: NotificationData): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const { data: result, error } = await supabase.functions.invoke('send-sms', {
        body: {
          to: notification.to,
          message: notification.message
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, messageId: result?.messageId };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private static async sendPushNotification(notification: NotificationData): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const { data: result, error } = await supabase.functions.invoke('send-push', {
        body: {
          to: notification.to,
          title: notification.subject,
          message: notification.message,
          data: notification.templateData
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, messageId: result?.messageId };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}