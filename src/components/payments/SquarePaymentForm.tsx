
import React, { useState } from 'react';
import { 
  PaymentForm, 
  CreditCard, 
  ApplePay, 
  GooglePay, 
  CashAppPay,
  type PaymentFormProps
} from 'react-square-web-payments-sdk';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle } from 'lucide-react';
import { ModernSquarePaymentService, type SquarePaymentRequest } from '@/services/paymentGateways/modernSquarePaymentService';
import { DeviceDetection } from '@/utils/deviceDetection';

// Define TokenResult type since it's not exported from the SDK
interface TokenResult {
  token: string;
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

interface SquarePaymentFormProps {
  applicationId: string;
  locationId: string;
  environment: 'sandbox' | 'production';
  paymentRequest: SquarePaymentRequest;
  onPaymentSuccess: (result: any) => void;
  onPaymentError: (error: string) => void;
  disabled?: boolean;
}

const SquarePaymentForm: React.FC<SquarePaymentFormProps> = ({
  applicationId,
  locationId,
  environment,
  paymentRequest,
  onPaymentSuccess,
  onPaymentError,
  disabled = false,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'apple_pay' | 'google_pay' | 'cash_app'>('card');
  
  const paymentService = new ModernSquarePaymentService({
    applicationId,
    locationId,
    environment,
  });

  // Device capabilities
  const deviceCaps = DeviceDetection.getCapabilities();
  const showApplePay = DeviceDetection.shouldShowApplePay();
  const showGooglePay = DeviceDetection.shouldShowGooglePay();
  const showCashApp = DeviceDetection.shouldShowCashApp();

  const handlePaymentSubmit = async (tokenResult: TokenResult, buyer?: any) => {
    if (disabled || isProcessing) return;

    setIsProcessing(true);
    
    try {
      let result;
      
      if (process.env.NODE_ENV === 'development') {
        // Use mock payment in development
        result = await paymentService.mockPayment(paymentRequest);
      } else {
        // Process real payment
        result = await paymentService.processPayment(tokenResult, paymentRequest);
      }

      if (result.success) {
        onPaymentSuccess({
          ...result,
          buyer,
          paymentMethod: 'square',
        });
      } else {
        onPaymentError(result.errorMessage || 'Payment processing failed');
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      onPaymentError(error instanceof Error ? error.message : 'Payment processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const paymentFormProps: PaymentFormProps = {
    applicationId,
    locationId,
    cardTokenizeResponseReceived: handlePaymentSubmit,
    createPaymentRequest: () => ({
      countryCode: 'US',
      currencyCode: paymentRequest.currency,
      total: {
        amount: (paymentRequest.amount / 100).toString(),
        label: 'Total',
      },
    }),
    children: (
      <div className="space-y-4">
        {paymentMethod === 'card' && (
          <div className="space-y-4">
            <CreditCard includeInputLabels />
            {isProcessing && (
              <Alert>
                <Loader2 className="h-4 w-4 animate-spin" />
                <AlertDescription>
                  Processing your payment securely...
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {paymentMethod === 'apple_pay' && showApplePay && <ApplePay />}
        {paymentMethod === 'google_pay' && showGooglePay && <GooglePay />}
        {paymentMethod === 'cash_app' && showCashApp && (
          <CashAppPay
            redirectURL={window.location.origin + '/payment/cash-app/callback'}
            referenceId={`cash-app-${paymentRequest.orderId}`}
          />
        )}
      </div>
    )
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Payment Details
          {environment === 'sandbox' && (
            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
              TEST MODE
            </span>
          )}
        </CardTitle>
        <CardDescription>
          Complete your payment securely with Square
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Payment Method Selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Payment Method</label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={paymentMethod === 'card' ? 'default' : 'outline'}
              onClick={() => setPaymentMethod('card')}
              disabled={disabled || isProcessing}
              className="h-12"
            >
              Credit Card
            </Button>
            {showApplePay && (
              <Button
                type="button"
                variant={paymentMethod === 'apple_pay' ? 'default' : 'outline'}
                onClick={() => setPaymentMethod('apple_pay')}
                disabled={disabled || isProcessing}
                className="h-12"
              >
                Apple Pay
              </Button>
            )}
            {showGooglePay && (
              <Button
                type="button"
                variant={paymentMethod === 'google_pay' ? 'default' : 'outline'}
                onClick={() => setPaymentMethod('google_pay')}
                disabled={disabled || isProcessing}
                className="h-12"
              >
                Google Pay
              </Button>
            )}
            {showCashApp && (
              <Button
                type="button"
                variant={paymentMethod === 'cash_app' ? 'default' : 'outline'}
                onClick={() => setPaymentMethod('cash_app')}
                disabled={disabled || isProcessing}
                className="h-12"
              >
                Cash App
              </Button>
            )}
          </div>
        </div>

        {/* Payment Form */}
        <PaymentForm {...paymentFormProps} />

        {/* Security Notice */}
        <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="h-3 w-3 text-green-600" />
            <span className="font-medium">Secure Payment</span>
          </div>
          <p>
            Your payment information is encrypted and processed securely by Square. 
            We never store your payment details on our servers.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SquarePaymentForm;
