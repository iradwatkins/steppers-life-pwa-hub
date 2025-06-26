/**
 * PayPal Payment Form using Official React SDK
 * Story B.010: Payment Gateway Integration - Modern PayPal Implementation
 */

import React, { useState } from 'react';
import {
  PayPalButtons,
  PayPalScriptProvider,
  usePayPalScriptReducer,
  type PayPalButtonsComponentProps,
  type CreateOrderData,
  type CreateOrderActions,
  type OnApproveData,
  type OnApproveActions,
} from '@paypal/react-paypal-js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import { ModernPayPalPaymentService, type PayPalPaymentRequest } from '@/services/paymentGateways/modernPayPalPaymentService';

interface PayPalPaymentFormProps {
  clientId: string;
  environment: 'sandbox' | 'production';
  paymentRequest: PayPalPaymentRequest;
  onPaymentSuccess: (result: any) => void;
  onPaymentError: (error: string) => void;
  onPaymentCancel?: () => void;
  disabled?: boolean;
}

const PayPalButtonWrapper: React.FC<PayPalPaymentFormProps> = ({
  paymentRequest,
  onPaymentSuccess,
  onPaymentError,
  onPaymentCancel,
  disabled = false,
  clientId,
  environment,
}) => {
  const [{ isPending }] = usePayPalScriptReducer();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const paymentService = new ModernPayPalPaymentService({
    clientId,
    environment,
    currency: paymentRequest.currency,
  });

  const createOrder: PayPalButtonsComponentProps['createOrder'] = async (
    data: CreateOrderData,
    actions: CreateOrderActions
  ) => {
    try {
      return await actions.order.create({
        intent: 'CAPTURE',
        purchase_units: [{
          reference_id: paymentRequest.orderId,
          amount: {
            currency_code: paymentRequest.currency,
            value: paymentRequest.amount.toFixed(2),
            breakdown: {
              item_total: {
                currency_code: paymentRequest.currency,
                value: paymentRequest.amount.toFixed(2),
              },
            },
          },
          items: paymentRequest.items?.map(item => ({
            name: item.name,
            quantity: item.quantity.toString(),
            unit_amount: {
              currency_code: paymentRequest.currency,
              value: item.price.toFixed(2),
            },
          })) || [{
            name: 'Event Tickets',
            quantity: '1',
            unit_amount: {
              currency_code: paymentRequest.currency,
              value: paymentRequest.amount.toFixed(2),
            },
          }],
          description: paymentRequest.description || 'Event ticket purchase',
        }],
        payer: paymentRequest.customerEmail ? {
          email_address: paymentRequest.customerEmail,
        } : undefined,
      });
    } catch (error) {
      console.error('Error creating PayPal order:', error);
      onPaymentError(error instanceof Error ? error.message : 'Failed to create PayPal order');
      throw error;
    }
  };

  const onApprove: PayPalButtonsComponentProps['onApprove'] = async (
    data: OnApproveData,
    actions: OnApproveActions
  ) => {
    if (disabled || isProcessing) return;

    setIsProcessing(true);
    
    try {
      let result;
      
      if (process.env.NODE_ENV === 'development') {
        // Use mock payment in development
        result = await paymentService.mockPayment(paymentRequest);
      } else {
        // Capture the order in production
        result = await paymentService.captureOrder(data.orderID);
      }

      if (result.success) {
        onPaymentSuccess({
          ...result,
          paymentMethod: 'paypal',
          orderData: data,
        });
      } else {
        onPaymentError(result.errorMessage || 'PayPal payment failed');
      }
    } catch (error) {
      console.error('PayPal payment processing error:', error);
      onPaymentError(error instanceof Error ? error.message : 'PayPal payment processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const onCancel: PayPalButtonsComponentProps['onCancel'] = (data) => {
    console.log('PayPal payment cancelled:', data);
    onPaymentCancel?.();
  };

  const onError: PayPalButtonsComponentProps['onError'] = (error) => {
    console.error('PayPal button error:', error);
    onPaymentError(error instanceof Error ? error.message : 'PayPal error occurred');
  };

  if (isPending) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Loading PayPal...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {isProcessing && (
        <Alert>
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertDescription>
            Processing your PayPal payment...
          </AlertDescription>
        </Alert>
      )}

      <PayPalButtons
        style={{
          shape: 'rect',
          layout: 'vertical',
          color: 'blue',
          label: 'paypal',
        }}
        createOrder={createOrder}
        onApprove={onApprove}
        onCancel={onCancel}
        onError={onError}
        disabled={disabled || isProcessing}
      />

      {/* Security Notice */}
      <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
        <div className="flex items-center gap-2 mb-1">
          <CheckCircle className="h-3 w-3 text-green-600" />
          <span className="font-medium">Secure Payment</span>
        </div>
        <p>
          Your payment is processed securely by PayPal. You can pay with your PayPal account 
          or any major credit card.
        </p>
      </div>
    </div>
  );
};

const PayPalPaymentForm: React.FC<PayPalPaymentFormProps> = (props) => {
  const { clientId, environment } = props;

  const paypalScriptOptions = {
    clientId,
    currency: props.paymentRequest.currency,
    intent: 'capture' as const,
    components: 'buttons' as const,
    ...(environment === 'sandbox' && { 'data-client-token': 'sandbox' }),
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          PayPal Payment
          {environment === 'sandbox' && (
            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
              TEST MODE
            </span>
          )}
        </CardTitle>
        <CardDescription>
          Pay securely with PayPal or your credit card
        </CardDescription>
      </CardHeader>
      <CardContent>
        <PayPalScriptProvider options={paypalScriptOptions}>
          <PayPalButtonWrapper {...props} />
        </PayPalScriptProvider>
      </CardContent>
    </Card>
  );
};

export default PayPalPaymentForm;