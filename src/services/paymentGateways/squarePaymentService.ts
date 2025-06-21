/**
 * Square Payment Gateway Integration
 * Story B.010: Payment Gateway Integration - Square
 */

export interface SquarePaymentConfig {
  applicationId: string;
  locationId: string;
  environment: 'sandbox' | 'production';
}

export interface SquarePaymentRequest {
  amount: number; // in cents
  currency: string;
  orderId: string;
  customerEmail?: string;
  customerName?: string;
}

export interface SquarePaymentResult {
  success: boolean;
  paymentId?: string;
  transactionId?: string;
  status: 'COMPLETED' | 'FAILED' | 'PENDING';
  errorMessage?: string;
  receipt?: {
    receiptNumber: string;
    receiptUrl: string;
  };
}

export class SquarePaymentService {
  private config: SquarePaymentConfig;
  private payments: any; // Square Web Payments SDK

  constructor(config: SquarePaymentConfig) {
    this.config = config;
  }

  async initialize(): Promise<boolean> {
    try {
      // Load Square Web Payments SDK
      if (typeof window !== 'undefined' && !window.Square) {
        await this.loadSquareSDK();
      }

      this.payments = window.Square?.payments(this.config.applicationId, this.config.locationId);
      return !!this.payments;
    } catch (error) {
      console.error('Failed to initialize Square payments:', error);
      return false;
    }
  }

  private async loadSquareSDK(): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = this.config.environment === 'sandbox' 
        ? 'https://sandbox.web.squarecdn.com/v1/square.js'
        : 'https://web.squarecdn.com/v1/square.js';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Square SDK'));
      document.head.appendChild(script);
    });
  }

  async createCard(): Promise<any> {
    try {
      const card = await this.payments.card();
      return card;
    } catch (error) {
      console.error('Error creating Square card:', error);
      throw error;
    }
  }

  async createGooglePay(): Promise<any> {
    try {
      const googlePay = await this.payments.googlePay({
        // Configuration options
      });
      return googlePay;
    } catch (error) {
      console.error('Error creating Google Pay:', error);
      throw error;
    }
  }

  async createApplePay(): Promise<any> {
    try {
      const applePay = await this.payments.applePay({
        // Configuration options
      });
      return applePay;
    } catch (error) {
      console.error('Error creating Apple Pay:', error);
      throw error;
    }
  }

  async processPayment(
    paymentMethod: any,
    request: SquarePaymentRequest
  ): Promise<SquarePaymentResult> {
    try {
      // Tokenize the payment method
      const tokenResult = await paymentMethod.tokenize();
      
      if (tokenResult.status === 'OK') {
        // Send token to backend for processing
        const response = await fetch('/api/payments/square/process', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token: tokenResult.token,
            amount: request.amount,
            currency: request.currency,
            orderId: request.orderId,
            customerEmail: request.customerEmail,
            customerName: request.customerName,
          }),
        });

        const result = await response.json();
        
        return {
          success: result.success,
          paymentId: result.paymentId,
          transactionId: result.transactionId,
          status: result.status,
          errorMessage: result.errorMessage,
          receipt: result.receipt,
        };
      } else {
        return {
          success: false,
          status: 'FAILED',
          errorMessage: tokenResult.errors?.[0]?.detail || 'Tokenization failed',
        };
      }
    } catch (error) {
      console.error('Error processing Square payment:', error);
      return {
        success: false,
        status: 'FAILED',
        errorMessage: error instanceof Error ? error.message : 'Payment processing failed',
      };
    }
  }

  async refundPayment(paymentId: string, amount?: number): Promise<SquarePaymentResult> {
    try {
      const response = await fetch('/api/payments/square/refund', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentId,
          amount, // Optional: partial refund amount
        }),
      });

      const result = await response.json();
      
      return {
        success: result.success,
        paymentId: result.refundId,
        status: result.status,
        errorMessage: result.errorMessage,
      };
    } catch (error) {
      console.error('Error processing Square refund:', error);
      return {
        success: false,
        status: 'FAILED',
        errorMessage: error instanceof Error ? error.message : 'Refund processing failed',
      };
    }
  }

  // Mock implementation for development
  async mockPayment(request: SquarePaymentRequest): Promise<SquarePaymentResult> {
    console.log('🔷 SQUARE PAYMENT (MOCK):', request);
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock successful payment 90% of the time
    const success = Math.random() > 0.1;
    
    if (success) {
      return {
        success: true,
        paymentId: `sq_payment_${Date.now()}`,
        transactionId: `sq_txn_${Date.now()}`,
        status: 'COMPLETED',
        receipt: {
          receiptNumber: `SQ-${Date.now()}`,
          receiptUrl: `https://squareup.com/receipt/${Date.now()}`,
        },
      };
    } else {
      return {
        success: false,
        status: 'FAILED',
        errorMessage: 'Mock payment failure for testing',
      };
    }
  }

  formatAmount(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount / 100);
  }

  getEnvironmentDisplayName(): string {
    return this.config.environment === 'sandbox' ? 'Square (Test)' : 'Square';
  }
}

// Factory function for creating Square payment service
export function createSquarePaymentService(): SquarePaymentService {
  const config: SquarePaymentConfig = {
    applicationId: process.env.REACT_APP_SQUARE_APPLICATION_ID || 'sandbox-sq0idb-placeholder',
    locationId: process.env.REACT_APP_SQUARE_LOCATION_ID || 'sandbox-location-placeholder',
    environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
  };

  return new SquarePaymentService(config);
}

// Global Square types
declare global {
  interface Window {
    Square?: any;
  }
}