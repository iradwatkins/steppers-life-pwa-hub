import { supabase } from '@/integrations/supabase/client';

export interface PaymentRequest {
  orderId: string;
  userId: string;
  amount: number;
  currency: string;
  paymentMethod: 'card' | 'paypal' | 'apple_pay' | 'google_pay' | 'cashapp';
  paymentData?: any;
}

export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  orderId: string;
  error?: string;
  paypalOrderId?: string;
  approvalUrl?: string;
}

export class RealPaymentService {
  
  static async processSquarePayment(request: PaymentRequest): Promise<PaymentResult> {
    try {
      const { data, error } = await supabase.functions.invoke('process-square-payment', {
        body: {
          amount: request.amount,
          currency: request.currency,
          sourceId: request.paymentData.sourceId,
          orderId: request.orderId,
          userId: request.userId,
          idempotencyKey: `${request.orderId}-${Date.now()}`,
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.success) {
        return {
          success: false,
          orderId: request.orderId,
          error: data.error || 'Payment failed',
        };
      }

      return {
        success: true,
        paymentId: data.paymentId,
        orderId: request.orderId,
      };

    } catch (error) {
      console.error('Square payment error:', error);
      return {
        success: false,
        orderId: request.orderId,
        error: error instanceof Error ? error.message : 'Payment processing failed',
      };
    }
  }

  static async createPayPalOrder(request: PaymentRequest): Promise<PaymentResult> {
    try {
      const orderData = {
        intent: 'CAPTURE' as const,
        purchase_units: [
          {
            reference_id: request.orderId,
            amount: {
              currency_code: request.currency.toUpperCase(),
              value: request.amount.toFixed(2),
            },
            description: `Order ${request.orderId}`,
          },
        ],
      };

      const { data, error } = await supabase.functions.invoke('process-paypal-payment', {
        body: {
          orderData,
          orderId: request.orderId,
          userId: request.userId,
        },
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.success) {
        return {
          success: false,
          orderId: request.orderId,
          error: data.error || 'PayPal order creation failed',
        };
      }

      // Find approval URL
      const approvalLink = data.links?.find((link: any) => link.rel === 'approve');

      return {
        success: true,
        orderId: request.orderId,
        paypalOrderId: data.orderId,
        approvalUrl: approvalLink?.href,
      };

    } catch (error) {
      console.error('PayPal order creation error:', error);
      return {
        success: false,
        orderId: request.orderId,
        error: error instanceof Error ? error.message : 'PayPal order creation failed',
      };
    }
  }

  static async capturePayPalPayment(paypalOrderId: string, orderId: string, userId: string): Promise<PaymentResult> {
    try {
      const { data, error } = await supabase.functions.invoke('process-paypal-payment', {
        body: {
          paypalOrderId,
          orderId,
          userId,
          action: 'capture', // Include action in body instead of query
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.success) {
        return {
          success: false,
          orderId,
          error: data.error || 'PayPal capture failed',
        };
      }

      return {
        success: true,
        paymentId: data.captureId,
        orderId,
      };

    } catch (error) {
      console.error('PayPal capture error:', error);
      return {
        success: false,
        orderId,
        error: error instanceof Error ? error.message : 'PayPal capture failed',
      };
    }
  }

  static async sendReceiptEmail(orderId: string, userId: string, customerEmail: string, customerName: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('send-receipt-email', {
        body: {
          orderId,
          userId,
          customerEmail,
          customerName,
        }
      });

      if (error) {
        console.error('Receipt email error:', error);
        return false;
      }

      return data.success || false;

    } catch (error) {
      console.error('Receipt email service error:', error);
      return false;
    }
  }

  // Main payment processing method
  static async processPayment(request: PaymentRequest): Promise<PaymentResult> {
    switch (request.paymentMethod) {
      case 'card':
      case 'apple_pay':
      case 'google_pay':
      case 'cashapp':
        // All Square-based payment methods
        return this.processSquarePayment(request);
      
      case 'paypal':
        return this.createPayPalOrder(request);
      
      default:
        return {
          success: false,
          orderId: request.orderId,
          error: 'Unsupported payment method',
        };
    }
  }
}