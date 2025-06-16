import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/hooks/useAuth';
import { OrderService, CreateOrderData } from '@/services/orderService';
import { EmailService } from '@/services/emailService';
import { TicketPDFService } from '@/services/ticketPDFService';
import type { OrderWithItems } from '@/services/orderService';
import { 
  CheckCircle, 
  Calendar, 
  MapPin, 
  Clock, 
  Mail, 
  Phone, 
  Download, 
  Share,
  ArrowRight,
  Ticket,
  User,
  Loader2,
  AlertCircle
} from 'lucide-react';

const CheckoutConfirmationPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { state, clearCart, setStep } = useCart();
  const [order, setOrder] = useState<OrderWithItems | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    setStep(4);
    // Redirect if no items in cart or no attendee info
    if (state.items.length === 0 || !state.attendeeInfo || !user) {
      navigate('/events');
      return;
    }

    // Process the order
    processOrder();
  }, [setStep, state.items.length, state.attendeeInfo, user, navigate]);

  const processOrder = async () => {
    if (!user || !state.attendeeInfo || state.items.length === 0) return;

    try {
      setIsProcessing(true);
      setError(null);

      // Calculate totals
      const subtotal = state.total;
      const processingFee = subtotal * 0.029 + 0.30;
      const totalAmount = subtotal + processingFee;

      // Prepare order data
      const orderData: CreateOrderData = {
        userId: user.id,
        eventId: state.eventId || '',
        totalAmount: subtotal,
        feesAmount: processingFee,
        finalAmount: totalAmount,
        billingDetails: {
          firstName: state.attendeeInfo.firstName,
          lastName: state.attendeeInfo.lastName,
          email: state.attendeeInfo.email,
          phone: state.attendeeInfo.phone,
          dietaryRestrictions: state.attendeeInfo.dietaryRestrictions,
          specialRequests: state.attendeeInfo.specialRequests
        },
        items: state.items.map(item => ({
          ticketTypeId: item.ticketType.id,
          quantity: item.quantity,
          price: item.ticketType.price,
          attendeeName: `${state.attendeeInfo!.firstName} ${state.attendeeInfo!.lastName}`,
          attendeeEmail: state.attendeeInfo!.email
        })),
        paymentIntentId: 'mock_payment_intent_' + Date.now()
      };

      // Create order in database
      const createdOrder = await OrderService.createOrder(orderData);
      if (!createdOrder) {
        throw new Error('Failed to create order');
      }

      // Get full order details
      const orderWithDetails = await OrderService.getOrderWithDetails(createdOrder.id);
      if (!orderWithDetails) {
        throw new Error('Failed to retrieve order details');
      }

      setOrder(orderWithDetails);

      // Send email receipt
      try {
        const emailSent = await EmailService.sendReceiptEmail({
          order: orderWithDetails,
          customerEmail: state.attendeeInfo.email,
          customerName: `${state.attendeeInfo.firstName} ${state.attendeeInfo.lastName}`
        });
        setEmailSent(emailSent);
        
        if (emailSent) {
          toast({
            title: "Receipt Sent",
            description: "Order confirmation sent to your email"
          });
        }
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
      }

    } catch (error) {
      console.error('Order processing failed:', error);
      setError(error instanceof Error ? error.message : 'Failed to process order');
      toast({
        title: "Order Processing Failed",
        description: "There was an error processing your order. Please contact support.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNewOrder = () => {
    clearCart();
    navigate('/events');
  };

  const handleDownloadTickets = async () => {
    if (!order) return;

    try {
      setIsDownloading(true);
      const success = await TicketPDFService.downloadTickets(order);
      
      if (success) {
        toast({
          title: "Tickets Downloaded",
          description: "Your tickets have been downloaded successfully"
        });
      } else {
        throw new Error('Download failed');
      }
    } catch (error) {
      console.error('Ticket download failed:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download tickets. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShareEvent = async () => {
    if (!order) return;

    const shareData = {
      title: order.event.title,
      text: `Check out this amazing event: ${order.event.title}`,
      url: `${window.location.origin}/events/${order.event_id}`
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        toast({
          title: "Event Shared",
          description: "Event shared successfully"
        });
      } else {
        // Fallback for browsers that don't support Web Share API
        await navigator.clipboard.writeText(shareData.url);
        toast({
          title: "Link Copied",
          description: "Event link copied to clipboard"
        });
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Sharing failed:', error);
        toast({
          title: "Sharing Failed",
          description: "Failed to share event",
          variant: "destructive"
        });
      }
    }
  };

  if (state.items.length === 0 || !state.attendeeInfo || !user) {
    return null; // Will redirect
  }

  // Show loading state while processing
  if (isProcessing || !order) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Processing Your Order
            </CardTitle>
            <CardDescription>
              Please wait while we confirm your purchase...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Order Processing Failed
            </CardTitle>
            <CardDescription>
              {error}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/events')} className="w-full">
              Return to Events
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Order Complete</h1>
            <div className="text-sm text-muted-foreground">Step 4 of 4</div>
          </div>
          <Progress value={100} className="h-2" />
          <div className="flex justify-between mt-2 text-sm">
            <span className="text-muted-foreground">Selection</span>
            <span className="text-muted-foreground">Details</span>
            <span className="text-muted-foreground">Payment</span>
            <span className="font-medium text-green-600">Confirmation</span>
          </div>
        </div>

        {/* Success Message */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <h2 className="text-3xl font-bold mb-2">Payment Successful!</h2>
          <p className="text-xl text-muted-foreground mb-4">
            Your tickets have been confirmed and sent to your email.
          </p>
          <Badge variant="secondary" className="text-sm">
            Order #{order.order_number}
          </Badge>
          {emailSent && (
            <Badge variant="outline" className="text-sm ml-2 text-green-600 border-green-200">
              ✓ Receipt Emailed
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Order Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ticket className="h-5 w-5" />
                Order Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Event Information */}
              <div>
                <h3 className="font-semibold mb-3">{order.event.title}</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {new Date(order.event.start_date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {new Date(order.event.start_date).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    })}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {order.event.venue ? 
                      `${order.event.venue.name}, ${order.event.venue.city}, ${order.event.venue.state}` : 
                      'Venue TBD'
                    }
                  </div>
                </div>
              </div>

              <Separator />

              {/* Tickets */}
              <div>
                <h3 className="font-semibold mb-3">Tickets</h3>
                <div className="space-y-3">
                  {order.order_items.map((item, index) => (
                    <div key={item.id} className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">Ticket #{item.id.slice(-8).toUpperCase()}</div>
                        <div className="text-sm text-muted-foreground">
                          {item.attendee_name}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">${item.price.toFixed(2)}</div>
                        <div className="text-sm text-muted-foreground">
                          General Admission
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Payment Summary */}
              <div>
                <h3 className="font-semibold mb-3">Payment Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${order.total_amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Processing Fee</span>
                    <span>${order.fees_amount.toFixed(2)}</span>
                  </div>
                  {order.discount_amount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount</span>
                      <span>-${order.discount_amount.toFixed(2)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total Paid</span>
                    <span>${order.final_amount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attendee Information & Actions */}
          <div className="space-y-6">
            {/* Attendee Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Attendee Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="font-medium">
                      {(order.billing_details as any).firstName} {(order.billing_details as any).lastName}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    {(order.billing_details as any).email}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    {(order.billing_details as any).phone}
                  </div>
                  {(order.billing_details as any).dietaryRestrictions && (
                    <div className="text-sm">
                      <span className="font-medium">Dietary Restrictions:</span>
                      <p className="text-muted-foreground mt-1">
                        {(order.billing_details as any).dietaryRestrictions}
                      </p>
                    </div>
                  )}
                  {(order.billing_details as any).specialRequests && (
                    <div className="text-sm">
                      <span className="font-medium">Special Requests:</span>
                      <p className="text-muted-foreground mt-1">
                        {(order.billing_details as any).specialRequests}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Next Steps</CardTitle>
                <CardDescription>
                  Your tickets and event details have been sent to your email.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={handleDownloadTickets} 
                  className="w-full" 
                  variant="outline"
                  disabled={isDownloading}
                >
                  {isDownloading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  {isDownloading ? 'Generating...' : 'Download Tickets'}
                </Button>
                
                <Button onClick={handleShareEvent} className="w-full" variant="outline">
                  <Share className="h-4 w-4 mr-2" />
                  Share Event
                </Button>

                <Separator />

                <div className="space-y-2">
                  <Button asChild className="w-full">
                    <Link to="/dashboard">
                      View My Events
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                  
                  <Button onClick={handleNewOrder} variant="outline" className="w-full">
                    Browse More Events
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Important Information */}
            <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  Important Information
                </h3>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• Please bring a valid photo ID to the event</li>
                  <li>• Tickets are non-refundable but transferable</li>
                  <li>• Doors open 30 minutes before event start time</li>
                  <li>• Contact support for any questions or changes</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutConfirmationPage;