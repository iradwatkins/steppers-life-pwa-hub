import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { 
  PayPalScriptProvider, 
  PayPalButtons,
  PayPalButtonsComponentProps
} from '@paypal/react-paypal-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CreditCard } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ModernPayPalPaymentFormProps {
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
}

interface PayPalOrderData {
  intent: 'CAPTURE';
  purchase_units: Array<{
    reference_id: string;
    amount: {
      currency_code: string;
      value: string;
    };
    description?: string;
  }>;
}

export function ModernPayPalPaymentForm({
  amount,
  currency = 'USD',
  orderId,
  userId,
  onSuccess,
  onError
}: ModernPayPalPaymentFormProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [billingDetails, setBillingDetails] = useState<BillingDetails | null>(null);
  const [showPayPalButtons, setShowPayPalButtons] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm<BillingDetails>();

  // PayPal configuration from environment variables
  const paypalClientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;
  const paypalEnvironment = import.meta.env.VITE_PAYPAL_ENVIRONMENT || 'sandbox';

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: PayPalOrderData) => {
      const { data, error } = await supabase.functions.invoke('process-paypal-payment', {
        body: JSON.stringify({
          orderData,
          orderId,
          userId
        })
      });
      
      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Order creation failed');
      
      return data;
    }
  });

  const captureOrderMutation = useMutation({
    mutationFn: async (paypalOrderId: string) => {
      const { data, error } = await supabase.functions.invoke('process-paypal-payment?action=capture', {
        body: JSON.stringify({
          paypalOrderId,
          orderId,
          userId
        })
      });
      
      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Payment capture failed');
      
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

  const onFormSubmit = (data: BillingDetails) => {
    setBillingDetails(data);
    setShowPayPalButtons(true);
  };

  const createOrder: PayPalButtonsComponentProps['createOrder'] = async () => {
    if (!billingDetails) {
      throw new Error('Billing details are required');
    }

    const orderData: PayPalOrderData = {
      intent: 'CAPTURE',
      purchase_units: [{
        reference_id: orderId,
        amount: {
          currency_code: currency,
          value: amount.toFixed(2)
        },
        description: `Order ${orderId} - SteppersLife Event`
      }]
    };

    try {
      const result = await createOrderMutation.mutateAsync(orderData);
      return result.orderId;
    } catch (error) {
      console.error('PayPal order creation failed:', error);
      throw error;
    }
  };

  const onApprove: PayPalButtonsComponentProps['onApprove'] = async (data) => {
    setIsProcessing(true);
    
    try {
      await captureOrderMutation.mutateAsync(data.orderID);
    } catch (error) {
      console.error('PayPal payment capture failed:', error);
      setIsProcessing(false);
    }
  };

  const onError_PayPal: PayPalButtonsComponentProps['onError'] = (err) => {
    console.error('PayPal error:', err);
    setIsProcessing(false);
    onError?.('PayPal payment failed. Please try again.');
  };

  const onCancel: PayPalButtonsComponentProps['onCancel'] = () => {
    setIsProcessing(false);
    onError?.('Payment was cancelled.');
  };

  if (!paypalClientId) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          PayPal payment configuration is missing. Please check your environment variables.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          PayPal Payment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {!showPayPalButtons ? (
          /* Billing Information Form */
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

            <Button
              type="submit"
              className="w-full h-12 text-lg bg-[#0070ba] hover:bg-[#005ea6]"
            >
              Continue to PayPal
            </Button>
          </form>
        ) : (
          /* PayPal Buttons */
          <div className="space-y-4">
            {/* Show billing details summary */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium mb-2">Billing Information</h3>
              <p className="text-sm">{billingDetails?.customerName}</p>
              <p className="text-sm">{billingDetails?.customerEmail}</p>
              {billingDetails?.customerPhone && (
                <p className="text-sm">{billingDetails.customerPhone}</p>
              )}
            </div>

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

            {/* PayPal Script Provider and Buttons */}
            <PayPalScriptProvider
              options={{
                clientId: paypalClientId,
                currency: currency,
                intent: 'capture',
                components: 'buttons',
                ...(paypalEnvironment === 'sandbox' && {
                  'data-namespace': 'PayPalSDK'
                })
              }}
            >
              <div className="relative">
                {isProcessing && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Processing payment...</span>
                    </div>
                  </div>
                )}
                
                <PayPalButtons
                  style={{
                    layout: 'vertical',
                    color: 'blue',
                    shape: 'rect',
                    label: 'paypal'
                  }}
                  createOrder={createOrder}
                  onApprove={onApprove}
                  onError={onError_PayPal}
                  onCancel={onCancel}
                  disabled={isProcessing}
                />
              </div>
            </PayPalScriptProvider>

            {/* Back button */}
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowPayPalButtons(false)}
              className="w-full"
              disabled={isProcessing}
            >
              ← Back to Billing Information
            </Button>
          </div>
        )}

        {/* Error Display */}
        {(createOrderMutation.isError || captureOrderMutation.isError) && (
          <Alert variant="destructive">
            <AlertDescription>
              {createOrderMutation.error instanceof Error 
                ? createOrderMutation.error.message 
                : captureOrderMutation.error instanceof Error
                ? captureOrderMutation.error.message
                : 'Payment processing failed. Please try again.'}
            </AlertDescription>
          </Alert>
        )}

        {/* Success Display */}
        {captureOrderMutation.isSuccess && (
          <Alert className="border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">
              PayPal payment processed successfully! Order ID: {captureOrderMutation.data?.orderId}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

export default ModernPayPalPaymentForm;