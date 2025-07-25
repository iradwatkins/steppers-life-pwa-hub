import type {
  PaymentService,
  ServiceResponse,
  PaymentIntent
} from '@/types/ticket';
import { apiClient } from './apiClient';

class PaymentServiceImpl implements PaymentService {
  private readonly PROCESSING_FEE_PERCENTAGE = 0.029; // 2.9%
  private readonly PROCESSING_FEE_FIXED = 0.30; // $0.30

  async createPaymentIntent(amount: number): Promise<ServiceResponse<PaymentIntent>> {
    return apiClient.post<PaymentIntent>('/payments/create-intent', { amount });
  }

  async confirmPayment(paymentIntentId: string): Promise<ServiceResponse<PaymentIntent>> {
    return apiClient.post<PaymentIntent>(`/payments/${paymentIntentId}/confirm`);
  }

  async refundPayment(paymentIntentId: string): Promise<ServiceResponse<PaymentIntent>> {
    return apiClient.post<PaymentIntent>(`/payments/${paymentIntentId}/refund`);
  }

  // Helper methods
  formatAmount(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100); // Convert cents to dollars
  }

  getPaymentStatusColor(status: PaymentIntent['status']): string {
    switch (status) {
      case 'succeeded':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'failed':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  }

  getPaymentStatusText(status: PaymentIntent['status']): string {
    switch (status) {
      case 'succeeded':
        return 'Payment Successful';
      case 'pending':
        return 'Payment Pending';
      case 'failed':
        return 'Payment Failed';
      default:
        return 'Unknown Status';
    }
  }

  validateAmount(amount: number): {
    valid: boolean;
    error?: string;
  } {
    if (amount <= 0) {
      return {
        valid: false,
        error: 'Amount must be greater than 0'
      };
    }

    if (amount > 1000000) { // $10,000.00
      return {
        valid: false,
        error: 'Amount exceeds maximum allowed'
      };
    }

    return { valid: true };
  }

  calculateFees(amount: number): {
    processingFee: number;
    totalAmount: number;
  } {
    const processingFee = amount * this.PROCESSING_FEE_PERCENTAGE + this.PROCESSING_FEE_FIXED;
    const totalAmount = amount + processingFee;
    return {
      processingFee,
      totalAmount
    };
  }
}

export const paymentService = new PaymentServiceImpl();