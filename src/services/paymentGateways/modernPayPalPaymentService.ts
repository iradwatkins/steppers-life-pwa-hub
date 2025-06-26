/**
 * Modern PayPal Payment Gateway Integration
 * Story B.010: Payment Gateway Integration - PayPal with Official React SDK
 */

export interface PayPalPaymentConfig {
  clientId: string;
  environment: 'sandbox' | 'production';
  currency: string;
}

export interface PayPalPaymentRequest {
  amount: number; // in dollars (not cents)
  currency: string;
  orderId: string;
  customerEmail?: string;
  description?: string;
  items?: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

export interface PayPalPaymentResult {
  success: boolean;
  paymentId?: string;
  orderId?: string;
  payerId?: string;
  status: 'COMPLETED' | 'FAILED' | 'PENDING' | 'CANCELLED';
  errorMessage?: string;
  details?: any;
}

export class ModernPayPalPaymentService {
  private config: PayPalPaymentConfig;

  constructor(config: PayPalPaymentConfig) {
    this.config = config;
  }

  getConfig(): PayPalPaymentConfig {
    return { ...this.config };
  }

  async captureOrder(orderId: string): Promise<PayPalPaymentResult> {
    try {
      const response = await fetch('/api/payments/paypal/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          action: 'capture',
        }),
      });

      const result = await response.json();
      
      return {
        success: result.success,
        paymentId: result.paymentId,
        orderId: result.orderId,
        payerId: result.payerId,
        status: result.status,
        errorMessage: result.errorMessage,
        details: result.details,
      };
    } catch (error) {
      console.error('Error capturing PayPal payment:', error);
      return {
        success: false,
        status: 'FAILED',
        errorMessage: error instanceof Error ? error.message : 'Payment capture failed',
      };
    }
  }

  async refundPayment(captureId: string, amount?: number): Promise<PayPalPaymentResult> {
    try {
      const response = await fetch('/api/payments/paypal/refund', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          captureId,
          amount: amount ? {
            currency_code: this.config.currency,
            value: amount.toFixed(2),
          } : undefined,
        }),
      });

      const result = await response.json();
      
      return {
        success: result.success,
        paymentId: result.refundId,
        status: result.status,
        errorMessage: result.errorMessage,
        details: result.details,
      };
    } catch (error) {
      console.error('Error processing PayPal refund:', error);
      return {
        success: false,
        status: 'FAILED',
        errorMessage: error instanceof Error ? error.message : 'Refund processing failed',
      };
    }
  }

  // Mock implementation for development
  async mockPayment(request: PayPalPaymentRequest): Promise<PayPalPaymentResult> {
    console.log('🔷 PAYPAL PAYMENT (MOCK):', request);
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock successful payment 85% of the time
    const success = Math.random() > 0.15;
    
    if (success) {
      return {
        success: true,
        paymentId: `pp_payment_${Date.now()}`,
        orderId: `pp_order_${Date.now()}`,
        payerId: `pp_payer_${Date.now()}`,
        status: 'COMPLETED',
        details: {
          id: `pp_order_${Date.now()}`,
          status: 'COMPLETED',
          purchase_units: [{
            payments: {
              captures: [{
                id: `pp_payment_${Date.now()}`,
                status: 'COMPLETED',
                amount: {
                  currency_code: request.currency,
                  value: request.amount.toFixed(2),
                },
              }],
            },
          }],
        },
      };
    } else {
      return {
        success: false,
        status: 'FAILED',
        errorMessage: 'Mock PayPal payment failure for testing',
      };
    }
  }

  formatAmount(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: this.config.currency,
    }).format(amount);
  }

  getEnvironmentDisplayName(): string {
    return this.config.environment === 'sandbox' ? 'PayPal (Test)' : 'PayPal';
  }
}

// Factory function for creating modern PayPal payment service
export function createModernPayPalPaymentService(): ModernPayPalPaymentService {
  const config: PayPalPaymentConfig = {
    clientId: process.env.REACT_APP_PAYPAL_CLIENT_ID || 'sandbox-paypal-client-id',
    environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
    currency: 'USD',
  };

  return new ModernPayPalPaymentService(config);
}