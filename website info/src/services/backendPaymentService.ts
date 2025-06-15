import apiService from './apiService';

export type PaymentProvider = 'square' | 'paypal' | 'cash' | 'cashapp';

export interface PaymentRequest {
  provider: PaymentProvider;
  source_id?: string; // Square payment token
  verification_token?: string; // Square CVV verification
  verification_code?: string; // Cash payment verification code
  cashtag?: string; // Cash App $cashtag
  return_url?: string; // PayPal/Cash App return URL
  cancel_url?: string; // PayPal/Cash App cancel URL
}

export interface PaymentConfirmation {
  payment_id: string;
  provider: PaymentProvider;
  payer_id?: string; // PayPal payer ID
}

export interface PaymentProvider_Info {
  name: string;
  enabled: boolean;
  config: Record<string, any>;
}

export interface PaymentResponse {
  payment_id: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  amount: number;
  currency: string;
  provider: PaymentProvider;
  redirect_url?: string;
  qr_code?: string;
  payment_url?: string;
}

export interface PayoutRequest {
  recipient_email: string;
  amount: number;
  currency?: string;
  note?: string;
  cashtag?: string; // For Cash App payouts
}

export interface BatchPayoutRequest {
  payouts: PayoutRequest[];
  email_subject?: string;
  email_message?: string;
}

export interface CashAppPayoutRequest {
  recipient_cashtag: string; // Must start with $
  amount: number;
  currency?: string;
  note?: string;
}

export interface PayoutResponse {
  payout_id: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  amount: number;
  currency: string;
  provider: PaymentProvider;
  recipient: string;
}

/**
 * Backend Payment Service
 * Handles payment processing with the FastAPI backend
 */
class BackendPaymentService {
  private static instance: BackendPaymentService;

  static getInstance(): BackendPaymentService {
    if (!BackendPaymentService.instance) {
      BackendPaymentService.instance = new BackendPaymentService();
    }
    return BackendPaymentService.instance;
  }

  /**
   * Get available payment providers
   */
  async getPaymentProviders(): Promise<Record<string, PaymentProvider_Info>> {
    try {
      return await apiService.get<Record<string, PaymentProvider_Info>>('/payments/providers');
    } catch (error) {
      console.error('Get payment providers failed:', error);
      throw error;
    }
  }

  /**
   * Process a payment for a ticket
   */
  async processPayment(ticketId: string, paymentData: PaymentRequest): Promise<PaymentResponse> {
    try {
      return await apiService.post<PaymentResponse>(`/payments/process/${ticketId}`, paymentData);
    } catch (error) {
      console.error('Payment processing failed:', error);
      throw error;
    }
  }

  /**
   * Confirm a payment (for PayPal/external providers)
   */
  async confirmPayment(ticketId: string, confirmationData: PaymentConfirmation): Promise<PaymentResponse> {
    try {
      return await apiService.post<PaymentResponse>(`/payments/confirm/${ticketId}`, confirmationData);
    } catch (error) {
      console.error('Payment confirmation failed:', error);
      throw error;
    }
  }

  /**
   * Cancel a payment
   */
  async cancelPayment(paymentId: string): Promise<{ message: string }> {
    try {
      return await apiService.post<{ message: string }>(`/payments/${paymentId}/cancel`);
    } catch (error) {
      console.error('Payment cancellation failed:', error);
      throw error;
    }
  }

  /**
   * Refund a payment
   */
  async refundPayment(paymentId: string, amount?: number, reason?: string): Promise<PaymentResponse> {
    try {
      const data: any = {};
      if (amount) data.amount = amount;
      if (reason) data.reason = reason;
      
      return await apiService.post<PaymentResponse>(`/payments/${paymentId}/refund`, data);
    } catch (error) {
      console.error('Payment refund failed:', error);
      throw error;
    }
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(paymentId: string): Promise<PaymentResponse> {
    try {
      return await apiService.get<PaymentResponse>(`/payments/${paymentId}/status`);
    } catch (error) {
      console.error('Get payment status failed:', error);
      throw error;
    }
  }

  /**
   * Send a payout to an individual
   */
  async sendPayout(payoutData: PayoutRequest): Promise<PayoutResponse> {
    try {
      return await apiService.post<PayoutResponse>('/payments/payout', payoutData);
    } catch (error) {
      console.error('Payout failed:', error);
      throw error;
    }
  }

  /**
   * Send batch payouts
   */
  async sendBatchPayout(batchData: BatchPayoutRequest): Promise<PayoutResponse[]> {
    try {
      return await apiService.post<PayoutResponse[]>('/payments/batch-payout', batchData);
    } catch (error) {
      console.error('Batch payout failed:', error);
      throw error;
    }
  }

  /**
   * Send Cash App payout
   */
  async sendCashAppPayout(payoutData: CashAppPayoutRequest): Promise<PayoutResponse> {
    try {
      return await apiService.post<PayoutResponse>('/payments/cashapp-payout', payoutData);
    } catch (error) {
      console.error('Cash App payout failed:', error);
      throw error;
    }
  }

  /**
   * Get transaction history
   */
  async getTransactionHistory(
    startDate?: string,
    endDate?: string,
    provider?: PaymentProvider
  ): Promise<PaymentResponse[]> {
    try {
      const params: Record<string, string> = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      if (provider) params.provider = provider;

      return await apiService.get<PaymentResponse[]>('/payments/history', params);
    } catch (error) {
      console.error('Get transaction history failed:', error);
      throw error;
    }
  }

  /**
   * Get payment analytics
   */
  async getPaymentAnalytics(
    startDate?: string,
    endDate?: string
  ): Promise<{
    total_revenue: number;
    total_transactions: number;
    average_transaction: number;
    provider_breakdown: Record<string, number>;
    daily_revenue: Array<{ date: string; amount: number }>;
  }> {
    try {
      const params: Record<string, string> = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      return await apiService.get('/payments/analytics', params);
    } catch (error) {
      console.error('Get payment analytics failed:', error);
      throw error;
    }
  }

  /**
   * Handle payment webhook (for server-side payment confirmations)
   */
  async handleWebhook(provider: PaymentProvider, payload: any): Promise<{ status: string }> {
    try {
      return await apiService.post<{ status: string }>(`/payments/webhook/${provider}`, payload);
    } catch (error) {
      console.error('Webhook handling failed:', error);
      throw error;
    }
  }

  /**
   * Validate payment configuration
   */
  async validatePaymentConfig(provider: PaymentProvider): Promise<{ valid: boolean; errors?: string[] }> {
    try {
      return await apiService.get<{ valid: boolean; errors?: string[] }>(`/payments/validate/${provider}`);
    } catch (error) {
      console.error('Payment config validation failed:', error);
      throw error;
    }
  }
}

export default BackendPaymentService.getInstance();