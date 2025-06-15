import { supabase } from '@/integrations/supabase/client';

export interface PaymentProvider {
  name: string;
  description: string;
  supports_cards: boolean;
  supports_digital_wallets: boolean;
}

export interface PaymentConfig {
  available_providers: string[];
  supported_currencies: string[];
  test_mode: boolean;
  provider_config: {
    square?: {
      app_id: string;
      environment: string;
    };
    paypal?: {
      client_id: string;
      environment: string;
    };
  };
}

export interface PaymentRequest {
  ticket_id: string;
  amount: number;
  currency: string;
  provider: 'square' | 'paypal' | 'cashapp' | 'cash';
  payment_method_data?: any;
  return_url?: string;
}

export interface PaymentResult {
  success: boolean;
  payment_id: string;
  provider: string;
  status?: string;
  amount: number;
  currency: string;
  approval_url?: string;
  receipt_number?: string;
  verification_code?: string;
}

export interface PaymentConfirmation {
  payment_id: string;
  provider: string;
  payer_id?: string;
}

export class PaymentService {
  private static instance: PaymentService;
  private config: PaymentConfig | null = null;
  private squareApplicationId: string | null = null;

  public static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService();
    }
    return PaymentService.instance;
  }

  // Initialize payment service and load configuration
  async initialize(): Promise<PaymentConfig> {
    if (!this.config) {
      this.config = await this.getPaymentConfig();
    }
    return this.config;
  }

  // Get payment configuration from environment variables
  async getPaymentConfig(): Promise<PaymentConfig> {
    // For 100% Supabase, we'll get config from environment or database
    this.config = {
      available_providers: ['square', 'paypal', 'cashapp', 'cash'],
      supported_currencies: ['USD'],
      test_mode: false, // Using production credentials
      provider_config: {
        square: {
          app_id: 'sq0idp-wGVapF8sNt9PLDj0iPiBlg', // Your production Square app ID
          environment: 'production'
        },
        paypal: {
          client_id: 'AWcmEjsKDeNUzvVQJyvc3lq5n4NXsh7-sHPgGT4ZiPFo8X6csYZcElZg2wsu_xsZE22DUoXOtF3MolVK',
          environment: 'production'
        }
      }
    };
    
    this.squareApplicationId = this.config.provider_config.square?.app_id;
    return this.config;
  }

  // Get available payment providers with details
  async getPaymentProviders(): Promise<Record<string, PaymentProvider>> {
    return {
      square: {
        name: 'Square / Cash App',
        description: 'Credit/debit cards and Cash App Pay',
        supports_cards: true,
        supports_digital_wallets: true
      },
      paypal: {
        name: 'PayPal',
        description: 'PayPal account or credit/debit card',
        supports_cards: true,
        supports_digital_wallets: true
      },
      cashapp: {
        name: 'Cash App',
        description: 'Cash App Pay',
        supports_cards: false,
        supports_digital_wallets: true
      },
      cash: {
        name: 'Cash Payment',
        description: 'Pay with cash at event',
        supports_cards: false,
        supports_digital_wallets: false
      }
    };
  }

  // Create a payment using Supabase Edge Function
  async createPayment(ticketId: string, paymentRequest: PaymentRequest): Promise<PaymentResult> {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      throw new Error('Authentication required');
    }

    const functionsUrl = import.meta.env.VITE_FUNCTIONS_URL || 'https://intcywjfnyjvvsypsetr.supabase.co/functions/v1';
    
    const response = await fetch(`${functionsUrl}/create-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        ticket_id: ticketId,
        amount: paymentRequest.amount,
        currency: paymentRequest.currency || 'USD',
        provider: paymentRequest.provider,
        payment_method_data: paymentRequest.payment_method_data,
        return_url: paymentRequest.return_url
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Payment processing failed');
    }

    const result = await response.json();
    
    return {
      success: result.status === 'completed' || result.status === 'pending',
      payment_id: result.payment_id,
      provider: paymentRequest.provider,
      status: result.status,
      amount: paymentRequest.amount,
      currency: paymentRequest.currency || 'USD',
      approval_url: result.approval_url,
      receipt_number: result.provider_payment_id
    };
  }

  // Confirm payment (mainly for PayPal)
  async confirmPayment(ticketId: string, confirmation: PaymentConfirmation): Promise<any> {
    // For Supabase implementation, payment confirmation is handled in the Edge Function
    // This method is kept for backward compatibility
    return { status: 'confirmed', payment_id: confirmation.payment_id };
  }

  // Get payment status
  async getPaymentStatus(ticketId: string): Promise<any> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      throw new Error('Failed to get payment status');
    }

    return {
      status: data.status,
      amount: data.amount,
      currency: data.currency,
      provider: data.provider,
      created_at: data.created_at
    };
  }

  // Square Web Payments SDK integration
  async initializeSquarePayments(): Promise<any> {
    if (!this.squareApplicationId) {
      throw new Error('Square application ID not configured');
    }

    // Load Square Web Payments SDK
    await this.loadSquareSDK();

    const payments = window.Square.payments(this.squareApplicationId, this.config?.provider_config?.square?.environment || 'sandbox');
    return payments;
  }

  // Load Square Web Payments SDK script
  private loadSquareSDK(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.Square) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      // Use production Square SDK since we're using live credentials
      script.src = 'https://web.squarecdn.com/v1/square.js';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Square SDK'));
      document.head.appendChild(script);
    });
  }

  // Create Square card payment token
  async createSquareCardToken(card: any): Promise<{ token: string; verificationToken?: string }> {
    const tokenResult = await card.tokenize();
    
    if (tokenResult.status === 'OK') {
      return {
        token: tokenResult.token,
        verificationToken: tokenResult.details?.cvv
      };
    } else {
      throw new Error(`Card tokenization failed: ${tokenResult.errors?.[0]?.message || 'Unknown error'}`);
    }
  }

  // PayPal integration
  async createPayPalPayment(ticketId: string, amount: number, returnUrl?: string): Promise<PaymentResult> {
    const paymentRequest: PaymentRequest = {
      ticket_id: ticketId,
      amount,
      currency: 'USD',
      provider: 'paypal',
      return_url: returnUrl || `${window.location.origin}/checkout/paypal-return`
    };

    return this.createPayment(ticketId, paymentRequest);
  }

  // Cash payment
  async createCashPayment(ticketId: string, amount: number): Promise<PaymentResult> {
    const paymentRequest: PaymentRequest = {
      ticket_id: ticketId,
      amount,
      currency: 'USD',
      provider: 'cash'
    };

    return this.createPayment(ticketId, paymentRequest);
  }

  // Square card payment
  async createSquareCardPayment(ticketId: string, amount: number, sourceId: string): Promise<PaymentResult> {
    const paymentRequest: PaymentRequest = {
      ticket_id: ticketId,
      amount,
      currency: 'USD',
      provider: 'square',
      payment_method_data: { source_id: sourceId }
    };

    return this.createPayment(ticketId, paymentRequest);
  }

  // Refund payment (admin/organizer only)
  async refundPayment(ticketId: string, amount?: number, reason?: string): Promise<any> {
    // This would typically require a separate Edge Function for refunds
    // For now, we'll create a refund record in the database
    const { data, error } = await supabase
      .from('payments')
      .update({
        status: 'refunded',
        metadata: { 
          refund_amount: amount,
          refund_reason: reason || 'Customer refund request',
          refunded_at: new Date().toISOString()
        }
      })
      .eq('ticket_id', ticketId)
      .select()
      .single();

    if (error) {
      throw new Error('Failed to process refund');
    }

    return data;
  }

  // Helper to format currency
  formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }

  // Check if provider is available
  isProviderAvailable(provider: string): boolean {
    return this.config?.available_providers?.includes(provider) || false;
  }

  // Get provider display name
  getProviderDisplayName(provider: string): string {
    const providerMap: Record<string, string> = {
      'square': 'Square / Cash App',
      'paypal': 'PayPal',
      'cash': 'Cash Payment'
    };
    return providerMap[provider] || provider;
  }
}

// Global payment service instance
export const paymentService = PaymentService.getInstance();

// Square Web Payments SDK types
declare global {
  interface Window {
    Square: any;
  }
} 