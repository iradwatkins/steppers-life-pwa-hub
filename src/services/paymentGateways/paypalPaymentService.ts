/**
 * PayPal Payment Gateway Integration
 * Story B.010: Payment Gateway Integration - PayPal
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

export class PayPalPaymentService {
  private config: PayPalPaymentConfig;
  private paypal: any; // PayPal SDK

  constructor(config: PayPalPaymentConfig) {
    this.config = config;
  }

  async initialize(): Promise<boolean> {
    try {
      // Load PayPal SDK
      if (typeof window !== 'undefined' && !window.paypal) {
        await this.loadPayPalSDK();
      }

      this.paypal = window.paypal;
      return !!this.paypal;
    } catch (error) {
      console.error('Failed to initialize PayPal payments:', error);
      return false;
    }
  }

  private async loadPayPalSDK(): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      const params = new URLSearchParams({
        'client-id': this.config.clientId,
        currency: this.config.currency,
        intent: 'capture',
        components: 'buttons',
      });
      
      script.src = `https://www.paypal.com/sdk/js?${params.toString()}`;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load PayPal SDK'));
      document.head.appendChild(script);
    });
  }

  async createOrder(request: PayPalPaymentRequest): Promise<any> {
    try {
      return await this.paypal.Orders().create({
        intent: 'CAPTURE',
        purchase_units: [{
          reference_id: request.orderId,
          amount: {
            currency_code: request.currency,
            value: request.amount.toFixed(2),
            breakdown: {
              item_total: {
                currency_code: request.currency,
                value: request.amount.toFixed(2),
              },
            },
          },
          items: request.items?.map(item => ({
            name: item.name,
            quantity: item.quantity.toString(),
            unit_amount: {
              currency_code: request.currency,
              value: item.price.toFixed(2),
            },
          })) || [{
            name: 'Event Tickets',
            quantity: '1',
            unit_amount: {
              currency_code: request.currency,
              value: request.amount.toFixed(2),
            },
          }],
          description: request.description || 'Event ticket purchase',
        }],
        payer: request.customerEmail ? {
          email_address: request.customerEmail,
        } : undefined,
      });
    } catch (error) {
      console.error('Error creating PayPal order:', error);
      throw error;
    }
  }

  async captureOrder(orderId: string): Promise<PayPalPaymentResult> {
    try {
      const details = await this.paypal.Orders().capture(orderId);
      
      const captureDetails = details.purchase_units[0].payments.captures[0];
      const status = captureDetails.status;
      
      return {
        success: status === 'COMPLETED',
        paymentId: captureDetails.id,
        orderId: details.id,
        payerId: details.payer?.payer_id,
        status: status === 'COMPLETED' ? 'COMPLETED' : 'FAILED',
        details,
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

  createButtonContainer(
    containerId: string,
    request: PayPalPaymentRequest,
    onSuccess: (details: any) => void,
    onError: (error: any) => void,
    onCancel?: () => void
  ): void {
    if (!this.paypal) {
      console.error('PayPal SDK not loaded');
      return;
    }

    this.paypal.Buttons({
      style: {
        shape: 'rect',
        color: 'blue',
        layout: 'vertical',
        label: 'paypal',
      },
      createOrder: async () => {
        try {
          const order = await this.createOrder(request);
          return order.id;
        } catch (error) {
          console.error('Error in createOrder:', error);
          onError(error);
          throw error;
        }
      },
      onApprove: async (data: any) => {
        try {
          const result = await this.captureOrder(data.orderID);
          if (result.success) {
            onSuccess(result.details);
          } else {
            onError(new Error(result.errorMessage || 'Payment failed'));
          }
        } catch (error) {
          console.error('Error in onApprove:', error);
          onError(error);
        }
      },
      onCancel: () => {
        console.log('PayPal payment cancelled');
        onCancel?.();
      },
      onError: (error: any) => {
        console.error('PayPal button error:', error);
        onError(error);
      },
    }).render(`#${containerId}`);
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

// Factory function for creating PayPal payment service
export function createPayPalPaymentService(): PayPalPaymentService {
  const config: PayPalPaymentConfig = {
    clientId: process.env.REACT_APP_PAYPAL_CLIENT_ID || 'sandbox-paypal-client-id',
    environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
    currency: 'USD',
  };

  return new PayPalPaymentService(config);
}

// Global PayPal types
declare global {
  interface Window {
    paypal?: any;
  }
}