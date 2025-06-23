import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { RealPaymentService } from '@/services/realPaymentService';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const PayPalReturnPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processPayPalReturn = async () => {
      try {
        // Get PayPal parameters from URL
        const token = searchParams.get('token'); // PayPal order ID
        const payerID = searchParams.get('PayerID');
        
        // Get stored order info
        const pendingOrderStr = sessionStorage.getItem('pendingOrder');
        
        if (!token || !payerID || !pendingOrderStr || !user) {
          throw new Error('Invalid PayPal return parameters');
        }

        const pendingOrder = JSON.parse(pendingOrderStr);
        
        // Capture the PayPal payment
        const result = await RealPaymentService.capturePayPalPayment(
          token,
          pendingOrder.orderId,
          user.id
        );

        if (!result.success) {
          throw new Error(result.error || 'PayPal payment capture failed');
        }

        // Send receipt email
        try {
          await RealPaymentService.sendReceiptEmail(
            pendingOrder.orderId,
            user.id,
            user.email || '',
            user.user_metadata?.full_name || 'Customer'
          );
        } catch (emailError) {
          console.error('Email sending failed:', emailError);
        }

        // Clean up session storage
        sessionStorage.removeItem('pendingOrder');

        setStatus('success');
        
        // Navigate to confirmation after a short delay
        setTimeout(() => {
          navigate(`/checkout/confirmation?orderId=${pendingOrder.orderId}&orderNumber=${pendingOrder.orderNumber}`);
        }, 2000);

        toast.success('PayPal payment completed successfully!');

      } catch (error) {
        console.error('PayPal return processing error:', error);
        setError(error instanceof Error ? error.message : 'Payment processing failed');
        setStatus('error');
        toast.error('PayPal payment failed');
      }
    };

    processPayPalReturn();
  }, [searchParams, user, navigate]);

  const handleRetry = () => {
    navigate('/checkout/payment');
  };

  const handleGoHome = () => {
    navigate('/events');
  };

  if (status === 'processing') {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <Card className="w-96">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              Processing PayPal Payment
            </CardTitle>
            <CardDescription>
              Please wait while we complete your PayPal payment...
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground">
              Do not close this window or press the back button.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <Card className="w-96">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-green-600">
              <CheckCircle className="h-6 w-6" />
              Payment Successful!
            </CardTitle>
            <CardDescription>
              Your PayPal payment has been processed successfully.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Redirecting you to order confirmation...
            </p>
            <Loader2 className="h-4 w-4 animate-spin mx-auto" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center">
      <Card className="w-96">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-red-600">
            <AlertCircle className="h-6 w-6" />
            Payment Failed
          </CardTitle>
          <CardDescription>
            There was an issue processing your PayPal payment.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
          <div className="flex gap-2">
            <Button onClick={handleRetry} className="flex-1">
              Try Again
            </Button>
            <Button onClick={handleGoHome} variant="outline" className="flex-1">
              Go Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PayPalReturnPage;