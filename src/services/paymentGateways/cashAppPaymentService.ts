/**
 * Cash App Payment Gateway Integration
 * Story B.010: Payment Gateway Integration - Cash App Pay
 */

export interface CashAppPaymentConfig {
  applicationId: string;
  environment: 'sandbox' | 'production';
  locationId?: string;
}

export interface CashAppPaymentRequest {
  amount: number; // in cents
  currency: string;
  orderId: string;
  customerEmail?: string;
  description?: string;
  redirectUrl?: string;
}

export interface CashAppPaymentResult {
  success: boolean;
  paymentId?: string;
  cashAppPayId?: string;
  status: 'COMPLETED' | 'FAILED' | 'PENDING' | 'CANCELLED';
  errorMessage?: string;
  deepLink?: string; // For mobile redirect to Cash App
  details?: any;
}

export class CashAppPaymentService {
  private config: CashAppPaymentConfig;
  private cashAppPay: any; // Cash App Pay SDK

  constructor(config: CashAppPaymentConfig) {
    this.config = config;
  }

  async initialize(): Promise<boolean> {
    try {
      // Load Cash App Pay SDK (part of Square Web SDK)
      if (typeof window !== 'undefined' && !window.Square) {
        await this.loadSquareSDK();
      }

      if (window.Square) {
        const payments = window.Square.payments(this.config.applicationId, this.config.locationId);
        this.cashAppPay = await payments.cashAppPay({
          redirectURL: this.config.environment === 'sandbox' 
            ? 'https://developer.squareup.com/docs/web-payments/cash-app-pay'
            : window.location.origin + '/payment/cash-app/callback',
          referenceId: `cash-app-${Date.now()}`,
        });
        return !!this.cashAppPay;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to initialize Cash App Pay:', error);
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

  async createPayment(request: CashAppPaymentRequest): Promise<CashAppPaymentResult> {
    try {
      if (!this.cashAppPay) {
        throw new Error('Cash App Pay not initialized');
      }

      // Tokenize the payment method
      const tokenResult = await this.cashAppPay.tokenize();
      
      if (tokenResult.status === 'OK') {
        // Send token to backend for processing
        const response = await fetch('/api/payments/cashapp/process', {
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
            description: request.description,
          }),
        });

        const result = await response.json();
        
        return {
          success: result.success,
          paymentId: result.paymentId,
          cashAppPayId: result.cashAppPayId,
          status: result.status,
          errorMessage: result.errorMessage,
          details: result.details,
        };
      } else {
        return {
          success: false,
          status: 'FAILED',
          errorMessage: tokenResult.errors?.[0]?.detail || 'Cash App Pay tokenization failed',
        };
      }
    } catch (error) {
      console.error('Error processing Cash App payment:', error);
      return {
        success: false,
        status: 'FAILED',
        errorMessage: error instanceof Error ? error.message : 'Cash App payment processing failed',
      };
    }
  }

  async attachToButton(
    buttonElement: HTMLElement,
    request: CashAppPaymentRequest,
    onSuccess: (result: CashAppPaymentResult) => void,
    onError: (error: any) => void
  ): Promise<void> {
    if (!this.cashAppPay) {
      onError(new Error('Cash App Pay not initialized'));
      return;
    }

    try {
      await this.cashAppPay.attach(buttonElement, {
        onClick: async () => {
          try {
            const result = await this.createPayment(request);
            if (result.success) {
              onSuccess(result);
            } else {
              onError(new Error(result.errorMessage || 'Payment failed'));
            }
          } catch (error) {
            onError(error);
          }
        },
      });
    } catch (error) {
      console.error('Error attaching Cash App Pay to button:', error);
      onError(error);
    }
  }

  async refundPayment(paymentId: string, amount?: number): Promise<CashAppPaymentResult> {
    try {
      const response = await fetch('/api/payments/cashapp/refund', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentId,
          amount, // Optional: partial refund amount in cents
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
      console.error('Error processing Cash App refund:', error);
      return {
        success: false,
        status: 'FAILED',
        errorMessage: error instanceof Error ? error.message : 'Refund processing failed',
      };
    }
  }

  // Generate Cash App deep link for mobile payments
  generateDeepLink(request: CashAppPaymentRequest): string {
    const params = new URLSearchParams({
      amount: (request.amount / 100).toFixed(2), // Convert cents to dollars
      note: request.description || 'Event ticket payment',
      recipient: '$stepperslife', // Your Cash App handle
    });
    
    return `https://cash.app/pay?${params.toString()}`;
  }

  // Mock implementation for development
  async mockPayment(request: CashAppPaymentRequest): Promise<CashAppPaymentResult> {
    console.log('🔷 CASH APP PAYMENT (MOCK):', request);
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock successful payment 80% of the time
    const success = Math.random() > 0.2;
    
    if (success) {
      return {
        success: true,
        paymentId: `ca_payment_${Date.now()}`,
        cashAppPayId: `ca_pay_${Date.now()}`,
        status: 'COMPLETED',
        deepLink: this.generateDeepLink(request),
        details: {
          amount: request.amount,
          currency: request.currency,
          orderId: request.orderId,
          timestamp: new Date().toISOString(),
        },
      };
    } else {
      return {
        success: false,
        status: 'FAILED',
        errorMessage: 'Mock Cash App payment failure for testing',
      };
    }
  }

  // Check if Cash App Pay is available on the current device/browser
  static isAvailable(): boolean {
    // Cash App Pay is primarily mobile-focused
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const isIOSChromeOrSafari = /CriOS|Safari/i.test(navigator.userAgent);
    const isAndroidChrome = /Chrome/i.test(navigator.userAgent) && /Android/i.test(navigator.userAgent);
    
    return isMobile && (isIOSChromeOrSafari || isAndroidChrome);
  }

  formatAmount(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount / 100);
  }

  getEnvironmentDisplayName(): string {
    return this.config.environment === 'sandbox' ? 'Cash App Pay (Test)' : 'Cash App Pay';
  }
}

// Factory function for creating Cash App payment service
export function createCashAppPaymentService(): CashAppPaymentService {
  const config: CashAppPaymentConfig = {
    applicationId: process.env.REACT_APP_SQUARE_APPLICATION_ID || 'sandbox-sq0idb-placeholder',
    locationId: process.env.REACT_APP_SQUARE_LOCATION_ID || 'sandbox-location-placeholder',
    environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
  };

  return new CashAppPaymentService(config);
}

// Global Square types (Cash App Pay is part of Square SDK)
declare global {
  interface Window {
    Square?: any;
  }
}