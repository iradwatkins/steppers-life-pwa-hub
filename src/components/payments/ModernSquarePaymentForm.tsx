import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { 
  PaymentForm,
  CreditCard, 
  ApplePay,
  GooglePay,
  CashAppPay
} from 'react-square-web-payments-sdk';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CreditCard as CreditCardIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

interface ModernSquarePaymentFormProps {
  amount: number;
  currency?: string;
  orderId: string;
  userId: string;
  onSuccess?: (result: any) => void;
  onError?: (error: string) => void;
}

interface BillingDetails {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  billingAddress?: {
    addressLine1: string;
    addressLine2?: string;
    locality: string;
    administrativeDistrictLevel1: string;
    postalCode: string;
    country: string;
  };
}

export function ModernSquarePaymentForm({
  amount,
  currency = 'USD',
  orderId,
  userId,
  onSuccess,
  onError
}: ModernSquarePaymentFormProps) {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'applepay' | 'googlepay' | 'cashapp'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm<BillingDetails>();

  // Square configuration from environment variables
  const squareApplicationId = import.meta.env.VITE_SQUARE_APPLICATION_ID;
  const squareLocationId = import.meta.env.VITE_SQUARE_LOCATION_ID;
  const squareEnvironment = import.meta.env.VITE_SQUARE_ENVIRONMENT || 'sandbox';

  const processPaymentMutation = useMutation({
    mutationFn: async (paymentData: any) => {
      const { data, error } = await supabase.functions.invoke('process-square-payment', {
        body: JSON.stringify(paymentData)
      });
      
      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Payment failed');
      
      return data;
    },
    onSuccess: (data) => {
      setIsProcessing(false);
      onSuccess?.(data);
    },
    onError: (error: any) => {
      setIsProcessing(false);
      const errorMessage = error.message || 'Payment processing failed';
      onError?.(errorMessage);
    }
  });

  const handlePayment = async (token: any, billingDetails: BillingDetails) => {
    if (!token?.token) {
      onError?.('Invalid payment token');
      return;
    }

    setIsProcessing(true);

    const paymentData = {
      sourceId: token.token,
      amount,
      currency,
      orderId,
      userId,
      locationId: squareLocationId,
      idempotencyKey: uuidv4(),
      billingDetails
    };

    processPaymentMutation.mutate(paymentData);
  };

  const onFormSubmit = (billingDetails: BillingDetails) => {
    // This will trigger the payment form submission
    // The actual payment token will be handled by the Square SDK
    console.log('Billing details submitted:', billingDetails);
  };

  if (!squareApplicationId || !squareLocationId) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Square payment configuration is missing. Please check your environment variables.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCardIcon className="h-5 w-5" />
          Payment Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Payment Method Selection */}
        <div className="space-y-4">
          <Label className="text-base font-medium">Select Payment Method</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Button
              type="button"
              variant={paymentMethod === 'card' ? 'default' : 'outline'}
              onClick={() => setPaymentMethod('card')}
              className="h-12"
            >
              Credit Card
            </Button>
            <Button
              type="button"
              variant={paymentMethod === 'applepay' ? 'default' : 'outline'}
              onClick={() => setPaymentMethod('applepay')}
              className="h-12"
            >
              Apple Pay
            </Button>
            <Button
              type="button"
              variant={paymentMethod === 'googlepay' ? 'default' : 'outline'}
              onClick={() => setPaymentMethod('googlepay')}
              className="h-12"
            >
              Google Pay
            </Button>
            <Button
              type="button"
              variant={paymentMethod === 'cashapp' ? 'default' : 'outline'}
              onClick={() => setPaymentMethod('cashapp')}
              className="h-12"
            >
              Cash App
            </Button>
          </div>
        </div>

        {/* Billing Information Form */}
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">Full Name *</Label>
              <Input
                id="customerName"
                {...register('customerName', { required: 'Full name is required' })}
                placeholder="John Doe"
              />
              {errors.customerName && (
                <p className="text-sm text-red-600">{errors.customerName.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="customerEmail">Email Address *</Label>
              <Input
                id="customerEmail"
                type="email"
                {...register('customerEmail', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
                placeholder="john@example.com"
              />
              {errors.customerEmail && (
                <p className="text-sm text-red-600">{errors.customerEmail.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerPhone">Phone Number</Label>
            <Input
              id="customerPhone"
              type="tel"
              {...register('customerPhone')}
              placeholder="+1 (555) 123-4567"
            />
          </div>

          {/* Square Payments Form */}
          <PaymentForm
            applicationId={squareApplicationId}
            locationId={squareLocationId}
            sandbox={squareEnvironment === 'sandbox'}
            cardTokenizeResponseReceived={(token, buyer) => {
              handleSubmit((billingDetails) => {
                handlePayment(token, billingDetails);
              })();
            }}
            createPaymentRequest={() => ({
              countryCode: 'US',
              currencyCode: currency,
              total: {
                amount: amount.toString(),
                label: 'Total',
              },
            })}
          >
            <div className="space-y-4">
              {paymentMethod === 'card' && (
                <div className="space-y-2">
                  <Label>Card Information</Label>
                  <div className="border rounded-lg p-4">
                    <CreditCard 
                      includeInputLabels={false}
                      style={{
                        input: {
                          fontSize: '16px',
                          fontFamily: 'inherit'
                        },
                        '.input-container': {
                          borderColor: 'transparent'
                        }
                      }}
                    />
                  </div>
                </div>
              )}

              {paymentMethod === 'applepay' && (
                <div className="space-y-2">
                  <Label>Apple Pay</Label>
                  <ApplePay />
                </div>
              )}

              {paymentMethod === 'googlepay' && (
                <div className="space-y-2">
                  <Label>Google Pay</Label>
                  <GooglePay />
                </div>
              )}

              {paymentMethod === 'cashapp' && (
                <div className="space-y-2">
                  <Label>Cash App Pay</Label>
                  <CashAppPay />
                </div>
              )}

              {/* Payment Summary */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>${amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-medium text-base pt-2 border-t">
                  <span>Total:</span>
                  <span>${amount.toFixed(2)} {currency}</span>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isProcessing}
                className="w-full h-12 text-lg"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing Payment...
                  </>
                ) : (
                  `Pay $${amount.toFixed(2)}`
                )}
              </Button>
            </div>
          </PaymentForm>
        </form>

        {/* Error Display */}
        {processPaymentMutation.isError && (
          <Alert variant="destructive">
            <AlertDescription>
              {processPaymentMutation.error instanceof Error 
                ? processPaymentMutation.error.message 
                : 'Payment processing failed. Please try again.'}
            </AlertDescription>
          </Alert>
        )}

        {/* Success Display */}
        {processPaymentMutation.isSuccess && (
          <Alert className="border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">
              Payment processed successfully! Order ID: {processPaymentMutation.data?.orderId}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

export default ModernSquarePaymentForm;