
export interface SquareTokenResult {
  token: string;
  status: 'OK' | 'ERROR';
  details: {
    method: string;
    card?: {
      brand: string;
      last4: string;
      expMonth: number;
      expYear: number;
    };
  };
}

export interface SquarePaymentRequest {
  amount: number; // in cents
  currency: string;
  orderId: string;
  userId?: string;
  customerEmail?: string; // Add this missing property
  customerName?: string; // Add this missing property
  description?: string;
}

export interface SquarePaymentResult {
  success: boolean;
  paymentId?: string;
  errorMessage?: string;
  transactionDetails?: any;
}

export class ModernSquarePaymentService {
  private applicationId: string;
  private locationId: string;
  private environment: 'sandbox' | 'production';

  constructor(config: {
    applicationId: string;
    locationId: string;
    environment: 'sandbox' | 'production';
  }) {
    this.applicationId = config.applicationId;
    this.locationId = config.locationId;
    this.environment = config.environment;
  }

  async processPayment(
    tokenResult: SquareTokenResult,
    paymentRequest: SquarePaymentRequest
  ): Promise<SquarePaymentResult> {
    try {
      console.log('Processing Square payment:', { tokenResult, paymentRequest });
      
      // In production, this would call your backend API
      // For now, simulate successful payment
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return {
        success: true,
        paymentId: `square_${Date.now()}`,
        transactionDetails: {
          amount: paymentRequest.amount,
          currency: paymentRequest.currency,
          orderId: paymentRequest.orderId,
        }
      };
    } catch (error) {
      console.error('Square payment processing error:', error);
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Payment processing failed'
      };
    }
  }

  async mockPayment(paymentRequest: SquarePaymentRequest): Promise<SquarePaymentResult> {
    console.log('Mock Square payment processing:', paymentRequest);
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      success: true,
      paymentId: `mock_square_${Date.now()}`,
      transactionDetails: {
        amount: paymentRequest.amount,
        currency: paymentRequest.currency,
        orderId: paymentRequest.orderId,
        mock: true,
      }
    };
  }
}
