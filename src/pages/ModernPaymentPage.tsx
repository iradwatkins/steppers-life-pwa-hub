import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ArrowLeft, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ModernPaymentSelector from '@/components/payments/ModernPaymentSelector';
import { supabase } from '@/integrations/supabase/client';

interface OrderDetails {
  id: string;
  order_number: string;
  total_amount: number;
  discount_amount: number;
  fees_amount: number;
  final_amount: number;
  status: string;
  created_at: string;
  billing_details: any;
  event: {
    title: string;
    start_date: string;
    venue: {
      name: string;
      address: string;
    };
  };
  order_items: Array<{
    quantity: number;
    price: number;
    attendee_name: string;
  }>;
}

export function ModernPaymentPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const orderId = searchParams.get('orderId');
  const userId = searchParams.get('userId');

  // Fetch order details
  const { data: order, isLoading, error } = useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      if (!orderId || !userId) {
        throw new Error('Order ID and User ID are required');
      }

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          event:events(
            title,
            start_date,
            venue:venues(name, address)
          ),
          order_items(
            quantity,
            price,
            attendee_name
          )
        `)
        .eq('id', orderId)
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Order not found');

      return data as OrderDetails;
    },
    enabled: !!orderId && !!userId
  });

  useEffect(() => {
    if (!orderId || !userId) {
      navigate('/orders', { replace: true });
    }
  }, [orderId, userId, navigate]);

  const handlePaymentSuccess = (result: any) => {
    setPaymentSuccess(true);
    setPaymentError(null);
    
    // Optional: Navigate to success page after a delay
    setTimeout(() => {
      navigate(`/orders/${orderId}/confirmation`, { replace: true });
    }, 3000);
  };

  const handlePaymentError = (error: string) => {
    setPaymentError(error);
    setPaymentSuccess(false);
  };

  const handleCancel = () => {
    navigate(`/orders/${orderId}`, { replace: true });
  };

  if (!orderId || !userId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>
            Invalid payment link. Please check your order and try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="w-full max-w-2xl mx-auto">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p>Loading order details...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>
            Unable to load order details. Please check your order ID and try again.
          </AlertDescription>
        </Alert>
        <Button 
          onClick={() => navigate('/orders')} 
          variant="outline" 
          className="mt-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Orders
        </Button>
      </div>
    );
  }

  // Check if order is already paid
  if (order.status === 'confirmed' || order.status === 'completed') {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert className="border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">
            This order has already been paid and confirmed.
          </AlertDescription>
        </Alert>
        <Button 
          onClick={() => navigate(`/orders/${orderId}`)} 
          className="mt-4"
        >
          View Order Details
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button
          onClick={() => navigate(`/orders/${orderId}`)}
          variant="ghost"
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Order
        </Button>
        
        <div className="text-center">
          <h1 className="text-3xl font-bold flex items-center justify-center gap-2 mb-2">
            <ShoppingCart className="w-8 h-8" />
            Complete Your Payment
          </h1>
          <p className="text-gray-600">
            Secure payment for Order #{order.order_number}
          </p>
        </div>
      </div>

      {/* Order Summary */}
      <Card className="w-full max-w-2xl mx-auto mb-8">
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Event Details */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium mb-2">{order.event?.title || 'Event'}</h3>
            <p className="text-sm text-gray-600">
              {order.event?.start_date 
                ? new Date(order.event.start_date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })
                : 'Date TBD'
              }
            </p>
            <p className="text-sm text-gray-600">
              {order.event?.venue?.name || 'Venue TBD'}
            </p>
            {order.event?.venue?.address && (
              <p className="text-sm text-gray-600">{order.event.venue.address}</p>
            )}
          </div>

          {/* Order Items */}
          <div>
            <h4 className="font-medium mb-2">Attendees:</h4>
            {order.order_items?.map((item, index) => (
              <div key={index} className="flex justify-between text-sm py-1">
                <span>{item.attendee_name} (Qty: {item.quantity})</span>
                <span>${item.price.toFixed(2)}</span>
              </div>
            ))}
          </div>

          {/* Pricing Breakdown */}
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span>${order.total_amount.toFixed(2)}</span>
            </div>
            {order.discount_amount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount:</span>
                <span>-${order.discount_amount.toFixed(2)}</span>
              </div>
            )}
            {order.fees_amount > 0 && (
              <div className="flex justify-between text-sm">
                <span>Processing Fees:</span>
                <span>${order.fees_amount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg pt-2 border-t">
              <span>Total:</span>
              <span>${order.final_amount.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {paymentError && (
        <Alert variant="destructive" className="w-full max-w-2xl mx-auto mb-8">
          <AlertDescription>{paymentError}</AlertDescription>
        </Alert>
      )}

      {/* Payment Component */}
      {!paymentSuccess && (
        <ModernPaymentSelector
          amount={order.final_amount}
          currency="USD"
          orderId={order.id}
          userId={userId}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
          onCancel={handleCancel}
        />
      )}

      {/* Success Message */}
      {paymentSuccess && (
        <Card className="w-full max-w-2xl mx-auto">
          <CardContent className="p-8 text-center space-y-4">
            <div className="text-green-600 text-6xl mb-4">✓</div>
            <h2 className="text-2xl font-bold text-green-700">Payment Successful!</h2>
            <p className="text-gray-600">
              Your payment has been processed successfully. You will receive a confirmation email shortly.
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="font-medium">Order #{order.order_number}</p>
              <p className="text-sm text-gray-600">Amount: ${order.final_amount.toFixed(2)}</p>
            </div>
            <p className="text-sm text-gray-500">
              Redirecting to confirmation page in a few seconds...
            </p>
          </CardContent>
        </Card>
      )}

      {/* Security Notice */}
      <div className="text-center mt-8 text-sm text-gray-500">
        <p>🔒 Secure payment processing powered by Square and PayPal</p>
        <p>Your payment information is encrypted and never stored on our servers</p>
      </div>
    </div>
  );
}

export default ModernPaymentPage;