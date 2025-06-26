/**
 * Modern Unified Payment Gateway Manager
 * Story B.010: Payment Gateway Integration - Unified Management with React SDKs
 */

import { ModernSquarePaymentService, createModernSquarePaymentService, type SquarePaymentRequest, type SquarePaymentResult } from './paymentGateways/modernSquarePaymentService';
import { ModernPayPalPaymentService, createModernPayPalPaymentService, type PayPalPaymentRequest, type PayPalPaymentResult } from './paymentGateways/modernPayPalPaymentService';
import { CashAppPaymentService, createCashAppPaymentService, type CashAppPaymentRequest, type CashAppPaymentResult } from './paymentGateways/cashAppPaymentService';

export type PaymentMethod = 'square' | 'paypal' | 'cashapp' | 'cash' | 'apple_pay' | 'google_pay';

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

export interface PaymentGatewayConfig {
  square: {
    applicationId: string;
    locationId: string;
    environment: 'sandbox' | 'production';
  };
  paypal: {
    clientId: string;
    environment: 'sandbox' | 'production';
    currency: string;
  };
}

export class ModernPaymentGatewayManager {
  private static instance: ModernPaymentGatewayManager;
  
  private squareService: ModernSquarePaymentService;
  private paypalService: ModernPayPalPaymentService;
  private cashappService: CashAppPaymentService;
  
  private isInitialized = false;
  private availability: PaymentMethodAvailability = {
    square: false,
    paypal: false,
    cashapp: false,
    cash: true, // Always available
  };

  private constructor() {
    this.squareService = createModernSquarePaymentService();
    this.paypalService = createModernPayPalPaymentService();
    this.cashappService = createCashAppPaymentService();
  }

  public static getInstance(): ModernPaymentGatewayManager {
    if (!ModernPaymentGatewayManager.instance) {
      ModernPaymentGatewayManager.instance = new ModernPaymentGatewayManager();
    }
    return ModernPaymentGatewayManager.instance;
  }

  async initialize(): Promise<PaymentMethodAvailability> {
    if (this.isInitialized) {
      return this.availability;
    }

    console.log('🔄 Initializing Modern Payment Gateway Manager...');

    try {
      // Check availability based on configuration
      this.availability.square = !!(
        process.env.REACT_APP_SQUARE_APPLICATION_ID && 
        process.env.REACT_APP_SQUARE_LOCATION_ID
      );
      
      this.availability.paypal = !!(
        process.env.REACT_APP_PAYPAL_CLIENT_ID
      );
      
      // Cash App Pay requires Square to be available
      this.availability.cashapp = this.availability.square && CashAppPaymentService.isAvailable();

      this.isInitialized = true;
      
      console.log('✅ Modern Payment Gateway Manager initialized:', this.availability);
      return this.availability;
    } catch (error) {
      console.error('❌ Failed to initialize Modern Payment Gateway Manager:', error);
      return this.availability;
    }
  }

  getAvailability(): PaymentMethodAvailability {
    return { ...this.availability };
  }

  getConfig(): PaymentGatewayConfig {
    return {
      square: this.squareService.getConfig(),
      paypal: this.paypalService.getConfig(),
    };
  }

  // Helper methods for React components
  getSquareConfig() {
    return this.squareService.getConfig();
  }

  getPayPalConfig() {
    return this.paypalService.getConfig();
  }

  // Process payments using traditional API calls (for backwards compatibility)
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
        case 'cash':
          return await this.processCashPayment(request);
        default:
          throw new Error(`Direct payment processing not supported for ${method}. Use React components instead.`);
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
  getSquareService(): ModernSquarePaymentService {
    return this.squareService;
  }

  getPayPalService(): ModernPayPalPaymentService {
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
      case 'apple_pay':
        return 'Apple Pay';
      case 'google_pay':
        return 'Google Pay';
      case 'paypal':
        return this.paypalService.getEnvironmentDisplayName();
      case 'cashapp':
        return 'Cash App Pay';
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
      case 'apple_pay':
      case 'google_pay':
      case 'cashapp':
        // All Square-based payments have same fee structure
        feePercentage = 0.029; // 2.9%
        fixedFee = 30; // $0.30 in cents
        break;
      case 'paypal':
        feePercentage = 0.0349; // 3.49%
        fixedFee = 49; // $0.49 in cents
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
export const modernPaymentGatewayManager = ModernPaymentGatewayManager.getInstance();