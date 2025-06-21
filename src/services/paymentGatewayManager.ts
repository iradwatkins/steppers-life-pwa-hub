/**
 * Unified Payment Gateway Manager
 * Story B.010: Payment Gateway Integration - Unified Management
 */

import { SquarePaymentService, createSquarePaymentService, type SquarePaymentRequest, type SquarePaymentResult } from './paymentGateways/squarePaymentService';
import { PayPalPaymentService, createPayPalPaymentService, type PayPalPaymentRequest, type PayPalPaymentResult } from './paymentGateways/paypalPaymentService';
import { CashAppPaymentService, createCashAppPaymentService, type CashAppPaymentRequest, type CashAppPaymentResult } from './paymentGateways/cashAppPaymentService';

export type PaymentMethod = 'square' | 'paypal' | 'cashapp' | 'cash';

export interface UnifiedPaymentRequest {
  amount: number; // in cents for consistency
  currency: string;
  orderId: string;
  customerEmail?: string;
  customerName?: string;
  description?: string;
  items?: Array<{
    name: string;
    quantity: number;
    price: number; // in cents
  }>;
}

export interface UnifiedPaymentResult {
  success: boolean;
  paymentMethod: PaymentMethod;
  paymentId?: string;
  transactionId?: string;
  status: 'COMPLETED' | 'FAILED' | 'PENDING' | 'CANCELLED';
  errorMessage?: string;
  receipt?: {
    receiptNumber: string;
    receiptUrl?: string;
  };
  rawDetails?: any; // Original gateway response
}

export interface PaymentMethodAvailability {
  square: boolean;
  paypal: boolean;
  cashapp: boolean;
  cash: boolean;
}

export class PaymentGatewayManager {
  private static instance: PaymentGatewayManager;
  
  private squareService: SquarePaymentService;
  private paypalService: PayPalPaymentService;
  private cashappService: CashAppPaymentService;
  
  private isInitialized = false;
  private availability: PaymentMethodAvailability = {
    square: false,
    paypal: false,
    cashapp: false,
    cash: true, // Always available
  };

  private constructor() {
    this.squareService = createSquarePaymentService();
    this.paypalService = createPayPalPaymentService();
    this.cashappService = createCashAppPaymentService();
  }

  public static getInstance(): PaymentGatewayManager {
    if (!PaymentGatewayManager.instance) {
      PaymentGatewayManager.instance = new PaymentGatewayManager();
    }
    return PaymentGatewayManager.instance;
  }

  async initialize(): Promise<PaymentMethodAvailability> {
    if (this.isInitialized) {
      return this.availability;
    }

    console.log('🔄 Initializing Payment Gateway Manager...');

    try {
      // Initialize all payment services in parallel
      const [squareReady, paypalReady, cashappReady] = await Promise.allSettled([
        this.squareService.initialize(),
        this.paypalService.initialize(),
        this.cashappService.initialize(),
      ]);

      this.availability.square = squareReady.status === 'fulfilled' && squareReady.value;
      this.availability.paypal = paypalReady.status === 'fulfilled' && paypalReady.value;
      this.availability.cashapp = cashappReady.status === 'fulfilled' && cashappReady.value && CashAppPaymentService.isAvailable();

      this.isInitialized = true;
      
      console.log('✅ Payment Gateway Manager initialized:', this.availability);
      return this.availability;
    } catch (error) {
      console.error('❌ Failed to initialize Payment Gateway Manager:', error);
      return this.availability;
    }
  }

  getAvailability(): PaymentMethodAvailability {
    return { ...this.availability };
  }

  async processPayment(
    method: PaymentMethod,
    request: UnifiedPaymentRequest,
    paymentMethodData?: any
  ): Promise<UnifiedPaymentResult> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      switch (method) {
        case 'square':
          return await this.processSquarePayment(request, paymentMethodData);
        case 'paypal':
          return await this.processPayPalPayment(request);
        case 'cashapp':
          return await this.processCashAppPayment(request);
        case 'cash':
          return await this.processCashPayment(request);
        default:
          throw new Error(`Unsupported payment method: ${method}`);
      }
    } catch (error) {
      console.error(`Error processing ${method} payment:`, error);
      return {
        success: false,
        paymentMethod: method,
        status: 'FAILED',
        errorMessage: error instanceof Error ? error.message : 'Payment processing failed',
      };
    }
  }

  private async processSquarePayment(
    request: UnifiedPaymentRequest,
    paymentMethodData: any
  ): Promise<UnifiedPaymentResult> {
    if (!this.availability.square) {
      throw new Error('Square payments not available');
    }

    const squareRequest: SquarePaymentRequest = {
      amount: request.amount,
      currency: request.currency,
      orderId: request.orderId,
      customerEmail: request.customerEmail,
      customerName: request.customerName,
    };

    let result: SquarePaymentResult;
    
    if (process.env.NODE_ENV === 'development') {
      result = await this.squareService.mockPayment(squareRequest);
    } else {
      result = await this.squareService.processPayment(paymentMethodData, squareRequest);
    }

    return {
      success: result.success,
      paymentMethod: 'square',
      paymentId: result.paymentId,
      transactionId: result.transactionId,
      status: result.status,
      errorMessage: result.errorMessage,
      receipt: result.receipt,
      rawDetails: result,
    };
  }

  private async processPayPalPayment(request: UnifiedPaymentRequest): Promise<UnifiedPaymentResult> {
    if (!this.availability.paypal) {
      throw new Error('PayPal payments not available');
    }

    const paypalRequest: PayPalPaymentRequest = {
      amount: request.amount / 100, // Convert cents to dollars for PayPal
      currency: request.currency,
      orderId: request.orderId,
      customerEmail: request.customerEmail,
      description: request.description,
      items: request.items?.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price / 100, // Convert cents to dollars
      })),
    };

    let result: PayPalPaymentResult;
    
    if (process.env.NODE_ENV === 'development') {
      result = await this.paypalService.mockPayment(paypalRequest);
    } else {
      // PayPal integration requires UI interaction, so this would typically
      // be handled through the PayPal button component
      throw new Error('PayPal payments must be processed through PayPal button component');
    }

    return {
      success: result.success,
      paymentMethod: 'paypal',
      paymentId: result.paymentId,
      transactionId: result.orderId,
      status: result.status,
      errorMessage: result.errorMessage,
      rawDetails: result,
    };
  }

  private async processCashAppPayment(request: UnifiedPaymentRequest): Promise<UnifiedPaymentResult> {
    if (!this.availability.cashapp) {
      throw new Error('Cash App Pay not available');
    }

    const cashappRequest: CashAppPaymentRequest = {
      amount: request.amount,
      currency: request.currency,
      orderId: request.orderId,
      customerEmail: request.customerEmail,
      description: request.description,
    };

    let result: CashAppPaymentResult;
    
    if (process.env.NODE_ENV === 'development') {
      result = await this.cashappService.mockPayment(cashappRequest);
    } else {
      result = await this.cashappService.createPayment(cashappRequest);
    }

    return {
      success: result.success,
      paymentMethod: 'cashapp',
      paymentId: result.paymentId,
      transactionId: result.cashAppPayId,
      status: result.status,
      errorMessage: result.errorMessage,
      rawDetails: result,
    };
  }

  private async processCashPayment(request: UnifiedPaymentRequest): Promise<UnifiedPaymentResult> {
    // Cash payments are handled through the existing cash payment workflow
    console.log('🔷 CASH PAYMENT INITIATED:', request);
    
    // This would typically redirect to the cash payment page
    // For now, return a pending status
    return {
      success: true,
      paymentMethod: 'cash',
      paymentId: `cash_${Date.now()}`,
      status: 'PENDING',
      receipt: {
        receiptNumber: `CASH-${Date.now()}`,
      },
    };
  }

  async refundPayment(
    method: PaymentMethod,
    paymentId: string,
    amount?: number
  ): Promise<UnifiedPaymentResult> {
    try {
      let result: any;

      switch (method) {
        case 'square':
          result = await this.squareService.refundPayment(paymentId, amount);
          break;
        case 'paypal':
          result = await this.paypalService.refundPayment(paymentId, amount ? amount / 100 : undefined);
          break;
        case 'cashapp':
          result = await this.cashappService.refundPayment(paymentId, amount);
          break;
        case 'cash':
          // Cash refunds handled manually
          result = {
            success: true,
            status: 'COMPLETED',
          };
          break;
        default:
          throw new Error(`Unsupported refund method: ${method}`);
      }

      return {
        success: result.success,
        paymentMethod: method,
        paymentId: result.paymentId || paymentId,
        status: result.status,
        errorMessage: result.errorMessage,
        rawDetails: result,
      };
    } catch (error) {
      console.error(`Error processing ${method} refund:`, error);
      return {
        success: false,
        paymentMethod: method,
        status: 'FAILED',
        errorMessage: error instanceof Error ? error.message : 'Refund processing failed',
      };
    }
  }

  // Get service instances for direct use (e.g., for UI components)
  getSquareService(): SquarePaymentService {
    return this.squareService;
  }

  getPayPalService(): PayPalPaymentService {
    return this.paypalService;
  }

  getCashAppService(): CashAppPaymentService {
    return this.cashappService;
  }

  // Helper methods
  formatAmount(amount: number, currency = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount / 100);
  }

  getPaymentMethodDisplayName(method: PaymentMethod): string {
    switch (method) {
      case 'square':
        return this.squareService.getEnvironmentDisplayName();
      case 'paypal':
        return this.paypalService.getEnvironmentDisplayName();
      case 'cashapp':
        return this.cashappService.getEnvironmentDisplayName();
      case 'cash':
        return 'Cash Payment';
      default:
        return 'Unknown Payment Method';
    }
  }

  // Calculate fees for different payment methods
  calculateFees(amount: number, method: PaymentMethod): {
    processingFee: number;
    totalAmount: number;
  } {
    let feePercentage: number;
    let fixedFee: number;

    switch (method) {
      case 'square':
        feePercentage = 0.029; // 2.9%
        fixedFee = 30; // $0.30 in cents
        break;
      case 'paypal':
        feePercentage = 0.0349; // 3.49%
        fixedFee = 49; // $0.49 in cents
        break;
      case 'cashapp':
        feePercentage = 0.029; // 2.9% (same as Square)
        fixedFee = 30; // $0.30 in cents
        break;
      case 'cash':
        feePercentage = 0;
        fixedFee = 0;
        break;
      default:
        feePercentage = 0.029;
        fixedFee = 30;
    }

    const processingFee = Math.round(amount * feePercentage) + fixedFee;
    const totalAmount = amount + processingFee;

    return {
      processingFee,
      totalAmount,
    };
  }
}

// Export singleton instance
export const paymentGatewayManager = PaymentGatewayManager.getInstance();