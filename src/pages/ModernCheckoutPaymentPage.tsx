/**
 * Modern Checkout Payment Page using Official React SDKs
 * Story B.010: Payment Gateway Integration - Modern Implementation
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { ExtensionProtection } from '@/utils/extensionProtection';
import { ExtensionWarningBanner } from '@/components/ExtensionWarningBanner';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/hooks/useAuth';
import { OrderService } from '@/services/orderService';
import { RealPaymentService } from '@/services/realPaymentService';
import { toast } from 'sonner';
import { ArrowLeft, CreditCard, ShoppingCart } from 'lucide-react';
import ModernPaymentMethodSelector from '@/components/payments/ModernPaymentMethodSelector';

const ModernCheckoutPaymentPage = () => {
  const navigate = useNavigate();
  const { state, setStep, clearCart } = useCart();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    setStep(3);
    
    // Redirect if no items in cart or no attendee info
    if (state.items.length === 0 || !state.attendeeInfo) {
      // Guard against null eventId
      if (state.eventId) {
        navigate(`/events/${state.eventId}/tickets`);
      } else {
        navigate('/events');
      }
      return;
    }

    // CRITICAL: Verify event requires tickets - prevent access for basic events
    const validateEventRequiresTickets = async () => {
      if (state.eventId) {
        try {
          const { EventService } = await import('@/services/eventService');
          const event = await EventService.getEventById(state.eventId);
          
          if (!event?.requires_tickets) {
            console.warn('🚫 Attempted modern checkout access for non-ticketed event:', state.eventId);
            toast.error('This event does not require tickets. Redirecting to event details.');
            navigate(`/events/${state.eventId}`);
            return;
          }
        } catch (error) {
          console.error('Error validating event tickets requirement:', error);
          toast.error('Unable to verify event details. Please try again.');
          navigate('/events');
          return;
        }
      }
    };

    validateEventRequiresTickets();
  }, [setStep, state.items.length, state.attendeeInfo, state.eventId, navigate]);

  const handlePaymentSuccess = async (result: any) => {
    if (!user || !state.eventId || !state.attendeeInfo) {
      toast.error('Missing order information. Please start over.');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Create order data for database
      const orderData = {
        userId: user.id,
        eventId: state.eventId,
        totalAmount: state.subtotal,
        discountAmount: state.discountAmount || 0,
        feesAmount: result.processingFee || 0,
        finalAmount: result.totalAmount || state.total,
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
        paymentIntentId: result.paymentId || result.transactionId || `payment_${Date.now()}`,
        paymentMethod: result.paymentMethod,
        paymentStatus: result.status,
      };

      // Create order
      const order = await OrderService.createOrder(orderData);

      if (!order) {
        throw new Error('Failed to create order');
      }

      console.log('✅ Order created successfully:', order);
      console.log('✅ Payment processed successfully:', result);

      // Send receipt email
      try {
        const emailSent = await RealPaymentService.sendReceiptEmail(
          order.id,
          user.id,
          state.attendeeInfo.email,
          `${state.attendeeInfo.firstName} ${state.attendeeInfo.lastName}`
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
      console.error('Order creation error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Order processing failed';
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment processing error:', error);
    toast.error(error);
    
    // Check if this might be extension-related
    const errorString = error.toLowerCase();
    if (errorString.includes('could not establish connection') || 
        errorString.includes('receiving end does not exist') ||
        errorString.includes('extension')) {
      ExtensionProtection.showExtensionInterferenceNotification(() => {
        // User can retry payment
        toast.info('Please try your payment again');
      });
    }
  };

  const handlePaymentCancel = () => {
    toast.info('Payment was cancelled. You can try again when ready.');
  };

  const handleBack = () => {
    navigate('/checkout/details');
  };

  if (state.items.length === 0 || !state.attendeeInfo) {
    return null; // Will redirect
  }

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
          {/* Modern Payment Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Information
                </CardTitle>
                <CardDescription>
                  Choose your payment method and complete your purchase securely using our modern payment system.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ModernPaymentMethodSelector
                  amount={Math.round(state.total * 100)} // Convert to cents
                  currency="USD"
                  orderId={`order_${Date.now()}`}
                  customerEmail={state.attendeeInfo.email}
                  customerName={`${state.attendeeInfo.firstName} ${state.attendeeInfo.lastName}`}
                  description={`Event ticket purchase - ${state.eventTitle}`}
                  onPaymentSuccess={handlePaymentSuccess}
                  onPaymentError={handlePaymentError}
                  onPaymentCancel={handlePaymentCancel}
                  disabled={isProcessing}
                />

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-6 mt-6 border-t">
                  <Button type="button" variant="outline" onClick={handleBack} disabled={isProcessing}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Details
                  </Button>
                  <div className="text-sm text-muted-foreground flex items-center">
                    Complete payment above to continue
                  </div>
                </div>
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
                        ${(item.ticketType.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>${state.subtotal.toFixed(2)}</span>
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
                      <span>${state.total.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <div className="text-xs text-muted-foreground mt-4 p-3 bg-muted/50 rounded-lg">
                    <p>Processing fees will be calculated and displayed when you select a payment method.</p>
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

export default ModernCheckoutPaymentPage;