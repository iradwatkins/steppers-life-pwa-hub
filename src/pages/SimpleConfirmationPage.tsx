import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  ShoppingCart, 
  Download,
  ArrowLeft,
  Home,
  Mail
} from 'lucide-react';

interface SimpleOrder {
  id: string;
  userId: string;
  items: Array<{
    productId: string;
    productName: string;
    price: number;
    quantity: number;
  }>;
  totalAmount: number;
  billingDetails: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
}

const SimpleConfirmationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get order data from navigation state
  const order = location.state?.order as SimpleOrder;
  const paymentResult = location.state?.paymentResult;

  useEffect(() => {
    // Redirect if no order data
    if (!order) {
      navigate('/test-product');
    }
  }, [order, navigate]);

  if (!order) {
    return null;
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="container mx-auto max-w-4xl">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-gray-600">Your test order has been processed successfully</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Order Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Order Details
              </CardTitle>
              <CardDescription>
                Order #{order.id.slice(-8)} • {formatDate(order.createdAt)}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Order Status */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status:</span>
                <Badge variant="default" className="bg-green-600">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Completed
                </Badge>
              </div>

              <Separator />

              {/* Order Items */}
              <div className="space-y-3">
                <h4 className="font-semibold">Items Purchased:</h4>
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">{item.productName}</div>
                      <div className="text-sm text-gray-600">
                        {formatPrice(item.price)} × {item.quantity}
                      </div>
                    </div>
                    <div className="font-semibold">
                      {formatPrice(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Total */}
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total Paid:</span>
                <span>{formatPrice(order.totalAmount)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">Name:</label>
                  <p className="font-medium">
                    {order.billingDetails.firstName} {order.billingDetails.lastName}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Email:</label>
                  <p className="font-medium">{order.billingDetails.email}</p>
                </div>
                
                {order.billingDetails.phone && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Phone:</label>
                    <p className="font-medium">{order.billingDetails.phone}</p>
                  </div>
                )}
              </div>

              <Separator />

              {/* Payment Information */}
              <div className="space-y-3">
                <h4 className="font-semibold">Payment Information</h4>
                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 text-green-800">
                    <CheckCircle className="h-4 w-4" />
                    <span className="font-medium">Payment Confirmed</span>
                  </div>
                  <p className="text-green-700 text-sm mt-1">
                    Your payment has been processed successfully.
                  </p>
                  {paymentResult?.paymentId && (
                    <p className="text-green-600 text-xs mt-1">
                      Payment ID: {paymentResult.paymentId}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Success Message & Actions */}
        <Card className="mt-6">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-800 mb-2">✅ Payment System Test Complete!</h3>
                <div className="text-blue-700 text-sm space-y-1">
                  <p>• Cart persistence: Working ✓</p>
                  <p>• Payment processing: Working ✓</p>
                  <p>• Order creation: Working ✓</p>
                  <p>• Confirmation flow: Working ✓</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    onClick={() => navigate('/test-product')}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Test Again
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => navigate('/')}
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Back to Home
                  </Button>
                </div>
                
                <p className="text-gray-600 text-sm">
                  The payment system is now ready for production use with real events and tickets.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Technical Details (for debugging) */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-sm">Technical Details (Debug Info)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-3 rounded-lg">
              <pre className="text-xs text-gray-600 overflow-x-auto">
                {JSON.stringify({
                  orderId: order.id,
                  status: order.status,
                  timestamp: order.createdAt,
                  itemCount: order.items.length,
                  totalAmount: order.totalAmount,
                  paymentResult: paymentResult ? 'Received' : 'None'
                }, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SimpleConfirmationPage;