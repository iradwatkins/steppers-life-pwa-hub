import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CreditCard, 
  Smartphone,
  CheckCircle,
  ArrowLeft
} from 'lucide-react';
import ModernSquarePaymentForm from './ModernSquarePaymentForm';
import ModernPayPalPaymentForm from './ModernPayPalPaymentForm';

interface ModernPaymentSelectorProps {
  amount: number;
  currency?: string;
  orderId: string;
  userId: string;
  onSuccess?: (result: any) => void;
  onError?: (error: string) => void;
  onCancel?: () => void;
}

type PaymentMethod = 'square' | 'paypal' | null;

export function ModernPaymentSelector({
  amount,
  currency = 'USD',
  orderId,
  userId,
  onSuccess,
  onError,
  onCancel
}: ModernPaymentSelectorProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(null);
  const [paymentResult, setPaymentResult] = useState<any>(null);

  const handlePaymentSuccess = (result: any) => {
    setPaymentResult(result);
    onSuccess?.(result);
  };

  const handlePaymentError = (error: string) => {
    onError?.(error);
  };

  const handleBackToSelection = () => {
    setSelectedMethod(null);
    setPaymentResult(null);
  };

  // If payment is successful, show success message
  if (paymentResult) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-8 text-center space-y-4">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
          <h2 className="text-2xl font-bold text-green-700">Payment Successful!</h2>
          <p className="text-gray-600">
            Your payment has been processed successfully.
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="font-medium">Order Details:</p>
            <p className="text-sm text-gray-600">Order ID: {paymentResult.orderId || orderId}</p>
            <p className="text-sm text-gray-600">Amount: ${amount.toFixed(2)} {currency}</p>
            {paymentResult.paymentId && (
              <p className="text-sm text-gray-600">Payment ID: {paymentResult.paymentId}</p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // If no method selected, show payment method selector
  if (!selectedMethod) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Choose Payment Method</CardTitle>
          <p className="text-center text-gray-600">
            Select your preferred payment method to complete your purchase
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Payment Summary */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <h3 className="font-medium">Order Summary</h3>
            <div className="flex justify-between text-sm">
              <span>Order ID:</span>
              <span className="font-mono text-xs">{orderId}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Amount:</span>
              <span>${amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-medium text-lg pt-2 border-t">
              <span>Total:</span>
              <span>${amount.toFixed(2)} {currency}</span>
            </div>
          </div>

          {/* Payment Method Options */}
          <div className="space-y-4">
            <h3 className="font-medium">Select Payment Method:</h3>
            
            {/* Square Payment (Credit Card, Apple Pay, Google Pay, Cash App) */}
            <Button
              onClick={() => setSelectedMethod('square')}
              variant="outline"
              className="w-full h-20 flex items-center justify-between p-6 border-2 hover:border-blue-500 hover:bg-blue-50"
            >
              <div className="flex items-center space-x-4">
                <CreditCard className="w-8 h-8 text-blue-600" />
                <div className="text-left">
                  <div className="font-medium">Credit/Debit Card</div>
                  <div className="text-sm text-gray-500">
                    Visa, Mastercard, American Express + Apple Pay, Google Pay, Cash App
                  </div>
                </div>
              </div>
              <div className="text-blue-600">→</div>
            </Button>

            {/* PayPal Payment */}
            <Button
              onClick={() => setSelectedMethod('paypal')}
              variant="outline"
              className="w-full h-20 flex items-center justify-between p-6 border-2 hover:border-[#0070ba] hover:bg-blue-50"
            >
              <div className="flex items-center space-x-4">
                <Smartphone className="w-8 h-8 text-[#0070ba]" />
                <div className="text-left">
                  <div className="font-medium">PayPal</div>
                  <div className="text-sm text-gray-500">
                    Pay with your PayPal account or PayPal Credit
                  </div>
                </div>
              </div>
              <div className="text-[#0070ba]">→</div>
            </Button>
          </div>

          {/* Security Notice */}
          <Alert>
            <AlertDescription className="text-center">
              🔒 All payments are secured with 256-bit SSL encryption. Your payment information is never stored on our servers.
            </AlertDescription>
          </Alert>

          {/* Cancel Option */}
          {onCancel && (
            <Button
              onClick={onCancel}
              variant="ghost"
              className="w-full"
            >
              Cancel Payment
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  // Show selected payment method form
  return (
    <div className="space-y-4">
      {/* Back Button */}
      <Button
        onClick={handleBackToSelection}
        variant="ghost"
        className="flex items-center space-x-2"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Payment Methods</span>
      </Button>

      {/* Payment Form */}
      {selectedMethod === 'square' && (
        <ModernSquarePaymentForm
          amount={amount}
          currency={currency}
          orderId={orderId}
          userId={userId}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
        />
      )}

      {selectedMethod === 'paypal' && (
        <ModernPayPalPaymentForm
          amount={amount}
          currency={currency}
          orderId={orderId}
          userId={userId}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
        />
      )}
    </div>
  );
}

export default ModernPaymentSelector;