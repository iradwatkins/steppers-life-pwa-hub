import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ShoppingCart, 
  ArrowLeft, 
  CreditCard, 
  CheckCircle,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { ModernSquarePaymentForm } from '@/components/payments/ModernSquarePaymentForm';
import { v4 as uuidv4 } from 'uuid';

interface BillingDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

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
  billingDetails: BillingDetails;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
}

const SimpleCheckoutPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { state, clearSimpleCart } = useCart();
  const { user } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [order, setOrder] = useState<SimpleOrder | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, getValues } = useForm<BillingDetails>({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: user?.email || '',
      phone: ''
    }
  });

  // Redirect if cart is empty
  if (state.simpleItems.length === 0) {
    navigate('/simple-cart');
    return null;
  }

  // Redirect if not logged in
  if (!user) {
    navigate('/login?redirect=/simple-checkout');
    return null;
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const createSimpleOrder = (billingDetails: BillingDetails): SimpleOrder => {
    return {
      id: uuidv4(),
      userId: user.id,
      items: state.simpleItems.map(item => ({
        productId: item.product.id,
        productName: item.product.name,
        price: item.product.price,
        quantity: item.quantity
      })),
      totalAmount: state.total,
      billingDetails,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
  };

  const onBillingSubmit = (billingDetails: BillingDetails) => {
    const newOrder = createSimpleOrder(billingDetails);
    setOrder(newOrder);
    setCurrentStep(2);
    setPaymentError(null);
  };

  const handlePaymentSuccess = (result: any) => {
    console.log('Payment successful:', result);
    
    if (order) {
      // Update order status
      const completedOrder = { ...order, status: 'completed' as const };
      setOrder(completedOrder);
      
      // Clear cart
      clearSimpleCart();
      
      // Show success message
      toast({
        title: "Payment Successful!",
        description: `Order ${completedOrder.id.slice(-8)} has been processed successfully.`,
      });
      
      // Navigate to confirmation
      navigate('/simple-confirmation', { 
        state: { 
          order: completedOrder,
          paymentResult: result 
        } 
      });
    }
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment failed:', error);
    setPaymentError(error);
    
    if (order) {
      setOrder({ ...order, status: 'failed' });
    }
    
    toast({
      title: "Payment Failed",
      description: error || "There was an error processing your payment. Please try again.",
      variant: "destructive"
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/simple-cart')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Cart
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
          <p className="text-gray-600">Complete your test purchase</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step Indicator */}
            <div className="flex items-center space-x-4 mb-6">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {currentStep > 1 ? <CheckCircle className="h-4 w-4" /> : '1'}
              </div>
              <div className={`h-1 w-16 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {currentStep > 2 ? <CheckCircle className="h-4 w-4" /> : '2'}
              </div>
              <div className={`h-1 w-16 ${currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`} />
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                3
              </div>
            </div>

            {/* Step 1: Billing Information */}
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-sm">
                      1
                    </div>
                    Billing Information
                  </CardTitle>
                  <CardDescription>Enter your billing details</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit(onBillingSubmit)} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input
                          id="firstName"
                          {...register('firstName', { required: 'First name is required' })}
                          placeholder="John"
                        />
                        {errors.firstName && (
                          <p className="text-sm text-red-600">{errors.firstName.message}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input
                          id="lastName"
                          {...register('lastName', { required: 'Last name is required' })}
                          placeholder="Doe"
                        />
                        {errors.lastName && (
                          <p className="text-sm text-red-600">{errors.lastName.message}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        {...register('email', { 
                          required: 'Email is required',
                          pattern: {
                            value: /^\S+@\S+$/i,
                            message: 'Invalid email address'
                          }
                        })}
                        placeholder="john@example.com"
                      />
                      {errors.email && (
                        <p className="text-sm text-red-600">{errors.email.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        {...register('phone')}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    
                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                      Continue to Payment
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Payment */}
            {currentStep === 2 && order && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-sm">
                      2
                    </div>
                    Payment Information
                  </CardTitle>
                  <CardDescription>Complete your payment</CardDescription>
                </CardHeader>
                <CardContent>
                  {paymentError && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{paymentError}</AlertDescription>
                    </Alert>
                  )}
                  
                  <ModernSquarePaymentForm
                    amount={order.totalAmount}
                    currency="USD"
                    orderId={order.id}
                    userId={order.userId}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                  />
                  
                  <div className="mt-4 pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep(1)}
                      className="w-full"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Billing
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Order Summary
                </CardTitle>
                {order && (
                  <CardDescription>Order #{order.id.slice(-8)}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {state.simpleItems.map((item) => (
                    <div key={item.product.id} className="flex justify-between text-sm">
                      <div>
                        <div className="font-medium">{item.product.name}</div>
                        <div className="text-gray-500">
                          {formatPrice(item.product.price)} × {item.quantity}
                        </div>
                      </div>
                      <div className="font-medium">
                        {formatPrice(item.product.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatPrice(state.subtotal)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Processing Fee</span>
                    <span>$0.00</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>{formatPrice(state.total)}</span>
                  </div>
                </div>

                {/* Billing Summary */}
                {order && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h4 className="font-semibold text-sm mb-2">Billing Details</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>{order.billingDetails.firstName} {order.billingDetails.lastName}</div>
                      <div>{order.billingDetails.email}</div>
                      {order.billingDetails.phone && <div>{order.billingDetails.phone}</div>}
                    </div>
                  </div>
                )}

                {/* Test Mode Notice */}
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-800 text-sm mb-1">Test Mode</h4>
                  <p className="text-blue-700 text-xs">
                    Use test card: 4111 1111 1111 1111<br />
                    Any future date & any CVC
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleCheckoutPage;