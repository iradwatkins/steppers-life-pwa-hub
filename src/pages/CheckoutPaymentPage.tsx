import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { ExtensionProtection } from '@/utils/extensionProtection';
import { ExtensionWarningBanner } from '@/components/ExtensionWarningBanner';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/hooks/useAuth';
import { OrderService } from '@/services/orderService';
import { RealPaymentService } from '@/services/realPaymentService';
import { toast } from 'sonner';
import { ArrowLeft, ArrowRight, CreditCard, ShoppingCart, Lock, Smartphone, Building, DollarSign } from 'lucide-react';

const paymentFormSchema = z.object({
  paymentMethod: z.enum(['card', 'paypal', 'apple_pay', 'google_pay', 'cash']),
  cardNumber: z.string().optional(),
  expiryDate: z.string().optional(),
  cvv: z.string().optional(),
  cardholderName: z.string().optional(),
  billingAddress: z.string().optional(),
  billingCity: z.string().optional(),
  billingState: z.string().optional(),
  billingZip: z.string().optional(),
}).refine((data) => {
  if (data.paymentMethod === 'card') {
    return data.cardNumber && data.expiryDate && data.cvv && data.cardholderName;
  }
  return true;
}, {
  message: "Credit card information is required when paying by card",
  path: ["cardNumber"]
});

type PaymentFormData = z.infer<typeof paymentFormSchema>;

const CheckoutPaymentPage = () => {
  const navigate = useNavigate();
  const { state, setStep, clearCart } = useCart();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      paymentMethod: 'card',
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cardholderName: '',
      billingAddress: '',
      billingCity: '',
      billingState: '',
      billingZip: '',
    }
  });

  const selectedPaymentMethod = form.watch('paymentMethod');

  useEffect(() => {
    setStep(3);
    // Redirect if no items in cart or no attendee info
    if (state.items.length === 0 || !state.attendeeInfo) {
      navigate(`/events/${state.eventId}/tickets`);
    }
  }, [setStep, state.items.length, state.attendeeInfo, state.eventId, navigate]);

  const onSubmit = async (data: PaymentFormData) => {
    if (!user) {
      toast.error('You must be logged in to complete your purchase');
      navigate('/login');
      return;
    }

    if (!state.eventId || !state.attendeeInfo) {
      toast.error('Missing order information. Please start over.');
      navigate(`/events/${state.eventId}/tickets`);
      return;
    }

    setIsProcessing(true);
    
    try {
      // Check for extension interference before processing payment
      const interferenceResult = ExtensionProtection.detectExtensionInterference();
      if (interferenceResult.hasInterference) {
        console.warn('⚠️ Extension interference detected during payment:', interferenceResult);
        
        // Show user-friendly notification with retry option
        const notificationShown = ExtensionProtection.showExtensionInterferenceNotification(() => {
          // Retry the payment submission
          onSubmit(data);
        });
        
        if (notificationShown) {
          setIsProcessing(false);
          return;
        }
      }
      
      if (data.paymentMethod === 'cash') {
        // Redirect to cash payment page
        navigate('/cash-payment');
        return;
      }
      
      // Create order data for database
      const orderData = {
        userId: user.id,
        eventId: state.eventId,
        totalAmount: state.subtotal,
        discountAmount: state.discountAmount || 0,
        feesAmount: 0, // You can calculate fees if needed
        finalAmount: state.total,
        promoCodeUsed: state.promoCode || undefined,
        billingDetails: {
          firstName: state.attendeeInfo.firstName,
          lastName: state.attendeeInfo.lastName,
          email: state.attendeeInfo.email,
          phone: state.attendeeInfo.phone,
          dietaryRestrictions: state.attendeeInfo.dietaryRestrictions || undefined,
          specialRequests: state.attendeeInfo.specialRequests || undefined,
        },
        items: state.items.map(item => ({
          ticketTypeId: item.ticketType.id,
          quantity: item.quantity,
          price: item.ticketType.price,
          attendeeName: `${state.attendeeInfo!.firstName} ${state.attendeeInfo!.lastName}`,
          attendeeEmail: state.attendeeInfo!.email,
          specialRequests: state.attendeeInfo!.specialRequests || undefined,
        })),
        paymentIntentId: `payment_${Date.now()}`, // In real app, this would come from payment processor
      };

      // Create order first
      const order = await OrderService.createOrder(orderData);

      if (!order) {
        throw new Error('Failed to create order');
      }

      console.log('✅ Order created successfully:', order);

      // Process payment if not cash
      if (data.paymentMethod !== 'cash') {
        const paymentRequest = {
          orderId: order.id,
          userId: user.id,
          amount: state.total,
          currency: 'USD',
          paymentMethod: data.paymentMethod as 'card' | 'paypal' | 'apple_pay' | 'google_pay',
          paymentData: {
            sourceId: data.paymentMethod === 'card' ? 'card-payment-token' : undefined, // In real implementation, this would come from Square Web SDK
          },
        };

        const paymentResult = await RealPaymentService.processPayment(paymentRequest);

        if (!paymentResult.success) {
          // Update order status to failed
          await OrderService.updateOrderStatus(order.id, 'cancelled');
          throw new Error(paymentResult.error || 'Payment processing failed');
        }

        console.log('✅ Payment processed successfully:', paymentResult);

        // For PayPal, handle redirect flow
        if (data.paymentMethod === 'paypal' && paymentResult.approvalUrl) {
          // Store order info in sessionStorage for return
          sessionStorage.setItem('pendingOrder', JSON.stringify({
            orderId: order.id,
            orderNumber: order.order_number,
            paypalOrderId: paymentResult.paypalOrderId,
          }));
          
          // Redirect to PayPal for approval
          window.location.href = paymentResult.approvalUrl;
          return;
        }
      }

      // Send receipt email
      try {
        const emailSent = await RealPaymentService.sendReceiptEmail(
          order.id,
          user.id,
          data.billingDetails.email,
          `${data.billingDetails.firstName} ${data.billingDetails.lastName}`
        );
        console.log(emailSent ? '📧 Receipt email sent' : '⚠️ Receipt email failed');
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
      }

      // Clear cart after successful payment
      clearCart();
      
      // Navigate to confirmation with order details
      navigate(`/checkout/confirmation?orderId=${order.id}&orderNumber=${order.order_number}`);
      
      toast.success("Payment successful! Your order has been confirmed.");
    } catch (error) {
      console.error('Payment processing error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Payment processing failed';
      toast.error(errorMessage);
      
      // Check if this might be extension-related
      const errorString = errorMessage.toLowerCase();
      if (errorString.includes('could not establish connection') || 
          errorString.includes('receiving end does not exist') ||
          errorString.includes('extension')) {
        ExtensionProtection.showExtensionInterferenceNotification(() => {
          onSubmit(data);
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBack = () => {
    navigate('/checkout/details');
  };

  if (state.items.length === 0 || !state.attendeeInfo) {
    return null; // Will redirect
  }

  const paymentMethods = [
    {
      id: 'card',
      name: 'Credit/Debit Card',
      icon: CreditCard,
      description: 'Visa, Mastercard, American Express'
    },
    {
      id: 'cash',
      name: 'Pay Cash at Venue',
      icon: DollarSign,
      description: 'Reserve tickets and pay cash at the event'
    },
    {
      id: 'paypal',
      name: 'PayPal',
      icon: Building,
      description: 'Pay with your PayPal account'
    },
    {
      id: 'apple_pay',
      name: 'Apple Pay',
      icon: Smartphone,
      description: 'Pay with Touch ID or Face ID'
    },
    {
      id: 'google_pay',
      name: 'Google Pay',
      icon: Smartphone,
      description: 'Pay with Google Pay'
    }
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        {/* Extension Warning Banner */}
        <ExtensionWarningBanner />
        
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Checkout</h1>
            <div className="text-sm text-muted-foreground">Step 3 of 4</div>
          </div>
          <Progress value={75} className="h-2" />
          <div className="flex justify-between mt-2 text-sm">
            <span className="text-muted-foreground">Selection</span>
            <span className="text-muted-foreground">Details</span>
            <span className="font-medium text-stepping-purple">Payment</span>
            <span className="text-muted-foreground">Confirmation</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Information
                </CardTitle>
                <CardDescription>
                  Choose your payment method and complete your purchase securely.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Payment Method Selection */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Payment Method</h3>
                      <FormField
                        control={form.control}
                        name="paymentMethod"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                value={field.value}
                                className="space-y-3"
                              >
                                {paymentMethods.map((method) => (
                                  <div key={method.id} className="flex items-center space-x-3">
                                    <RadioGroupItem value={method.id} id={method.id} />
                                    <Label 
                                      htmlFor={method.id} 
                                      className="flex items-center gap-3 cursor-pointer flex-1 p-3 rounded-lg border hover:bg-muted/50"
                                    >
                                      <method.icon className="h-5 w-5" />
                                      <div className="flex-1">
                                        <div className="font-medium">{method.name}</div>
                                        <div className="text-sm text-muted-foreground">
                                          {method.description}
                                        </div>
                                      </div>
                                    </Label>
                                  </div>
                                ))}
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Credit Card Form */}
                    {selectedPaymentMethod === 'card' && (
                      <>
                        <Separator />
                        <div>
                          <h3 className="text-lg font-semibold mb-4">Card Information</h3>
                          <div className="space-y-4">
                            <FormField
                              control={form.control}
                              name="cardholderName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Cardholder Name *</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Name on card" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="cardNumber"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Card Number *</FormLabel>
                                  <FormControl>
                                    <Input placeholder="1234 5678 9012 3456" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name="expiryDate"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Expiry Date *</FormLabel>
                                    <FormControl>
                                      <Input placeholder="MM/YY" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="cvv"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>CVV *</FormLabel>
                                    <FormControl>
                                      <Input placeholder="123" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                        </div>

                        <Separator />

                        {/* Billing Address */}
                        <div>
                          <h3 className="text-lg font-semibold mb-4">Billing Address</h3>
                          <div className="space-y-4">
                            <FormField
                              control={form.control}
                              name="billingAddress"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Street Address</FormLabel>
                                  <FormControl>
                                    <Input placeholder="123 Main Street" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <FormField
                                control={form.control}
                                name="billingCity"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>City</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Chicago" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="billingState"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>State</FormLabel>
                                    <FormControl>
                                      <Input placeholder="IL" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="billingZip"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>ZIP Code</FormLabel>
                                    <FormControl>
                                      <Input placeholder="60601" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Alternative Payment Methods */}
                    {selectedPaymentMethod !== 'card' && (
                      <div className="p-6 bg-muted/50 rounded-lg text-center">
                        <p className="text-muted-foreground mb-4">
                          You will be redirected to {paymentMethods.find(m => m.id === selectedPaymentMethod)?.name} to complete your payment.
                        </p>
                        <Badge variant="secondary">
                          <Lock className="h-3 w-3 mr-1" />
                          Secure Payment
                        </Badge>
                      </div>
                    )}

                    {/* Security Notice */}
                    <div className="flex items-center gap-2 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                      <Lock className="h-4 w-4 text-green-600" />
                      <p className="text-sm text-green-800 dark:text-green-400">
                        Your payment information is encrypted and secure. We never store your card details.
                      </p>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex justify-between pt-6">
                      <Button type="button" variant="outline" onClick={handleBack} disabled={isProcessing}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Details
                      </Button>
                      <Button type="submit" disabled={isProcessing}>
                        {isProcessing ? (
                          <>Processing Payment...</>
                        ) : (
                          <>
                            Complete Purchase
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Order Summary
                </CardTitle>
                <CardDescription>{state.eventTitle}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {state.items.map((item) => (
                    <div key={item.ticketType.id} className="flex justify-between">
                      <div>
                        <div className="font-medium">{item.ticketType.name}</div>
                        <div className="text-sm text-muted-foreground">
                          ${item.ticketType.price} × {item.quantity}
                        </div>
                      </div>
                      <div className="font-medium">
                        ${item.ticketType.price * item.quantity}
                      </div>
                    </div>
                  ))}
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>${state.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Processing Fee</span>
                      <span>${(state.subtotal * 0.029 + 0.30).toFixed(2)}</span>
                    </div>
                    {state.discountAmount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount</span>
                        <span>-${state.discountAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>${(state.total + state.subtotal * 0.029 + 0.30).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPaymentPage;