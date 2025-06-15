import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Lock, User, Calendar, ArrowLeft, ShieldCheck, Percent, Loader2 } from 'lucide-react';
import { usePaymentProcessing, usePaymentProviders } from '@/hooks/useBackendPayments';
import { toast } from '@/components/ui/sonner';
import type { Ticket } from '@/services/backendTicketService';

interface CartItem {
  ticketTypeId: string;
  ticketTypeName: string;
  quantity: number;
  pricePerTicket: number;
}

interface AppliedPromoDetails {
  code: string;
  discountAmount: number;
  message: string;
}

interface OrderDetails {
  cart: CartItem[];
  tickets?: Ticket[]; // Backend tickets
  attendeeName?: string;
  attendeeEmail?: string;
  subtotalAmount: number | null;
  appliedPromoDetails: AppliedPromoDetails | null;
  totalAmount: number | null;
  event?: any; // Event details
}

const CheckoutPaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { eventId } = useParams<{ eventId: string }>();

  // Backend integration
  const { processPayment, loading: paymentLoading } = usePaymentProcessing();
  const { providers, loading: providersLoading } = usePaymentProviders();

  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<string>('square');
  
  // Payment form state
  const [cardholderName, setCardholderName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');

  useEffect(() => {
    // Handle new state structure from updated ticket selection page
    if (location.state) {
      const state = location.state;
      
      // Check if it's the new structure with tickets
      if (state.tickets && state.cart) {
        setOrderDetails({
          cart: state.cart,
          tickets: state.tickets,
          subtotalAmount: state.subtotal || null,
          totalAmount: state.total || null,
          appliedPromoDetails: state.appliedPromoDetails || null,
          event: state.event,
        });
      } 
      // Handle legacy structure
      else if (state.orderDetails) {
        const details = state.orderDetails;
        setOrderDetails({
          ...details,
          subtotalAmount: typeof details.subtotalAmount === 'number' ? details.subtotalAmount : null,
          totalAmount: typeof details.totalAmount === 'number' ? details.totalAmount : null,
        });
      }
    } else {
      console.warn('No order details found. Redirecting...');
      navigate(`/event/${eventId}/tickets`);
    }
  }, [location.state, navigate, eventId]);

  const handlePayment = async () => {
    if (!orderDetails || !orderDetails.tickets || orderDetails.tickets.length === 0) {
      toast.error('No tickets found for payment');
      return;
    }

    if (!cardholderName || !cardNumber || !expiryDate || !cvv) {
      toast.error('Please fill in all payment details');
      return;
    }

    try {
      // Process payment for each ticket
      const paymentPromises = orderDetails.tickets.map(async (ticket) => {
        return processPayment(ticket.id, {
          provider: selectedProvider as any,
          source_id: `${cardNumber}-${expiryDate}`, // In real implementation, this would be tokenized
          verification_token: cvv,
        });
      });

      const paymentResults = await Promise.all(paymentPromises);
      
      if (paymentResults.every(result => result && result.status === 'completed')) {
        toast.success('Payment successful!');
        navigate(`/checkout/${eventId}/confirmation`, {
          state: {
            tickets: orderDetails.tickets,
            payments: paymentResults,
            event: orderDetails.event,
          }
        });
      } else {
        toast.error('Some payments failed. Please try again.');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment processing failed. Please try again.');
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!cardholderName.trim() || !cardNumber.trim() || !expiryDate.trim() || !cvv.trim()) {
      toast.error('Please fill in all payment details.');
      return;
    }
    
    if (cardNumber.replace(/\s+/g, '').length !== 16 || !/^[0-9]+$/.test(cardNumber.replace(/\s+/g, ''))) {
      toast.error('Please enter a valid 16-digit card number.');
      return;
    }
    
    if (!/^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(expiryDate)) {
      toast.error('Please enter a valid expiry date in MM/YY format.');
      return;
    }
    
    if (cvv.length < 3 || cvv.length > 4 || !/^[0-9]+$/.test(cvv)) {
      toast.error('Please enter a valid CVV (3 or 4 digits).');
      return;
    }

    await handlePayment();
  };

  if (!orderDetails) {
    return <div className="min-h-screen bg-background-main flex items-center justify-center"><p>Loading payment details...</p></div>;
  }

  // Prepare data for the back navigation
  const backState = {
      cart: orderDetails.cart,
      subtotal: orderDetails.subtotalAmount,
      total: orderDetails.totalAmount,
      appliedPromoDetails: orderDetails.appliedPromoDetails,
      // carry over attendeeName and attendeeEmail so user doesn't have to re-fill them
      attendeeName: orderDetails.attendeeName,
      attendeeEmail: orderDetails.attendeeEmail
  };

  return (
    <div className="min-h-screen bg-background-main py-8 px-4 md:px-8">
      <div className="max-w-3xl mx-auto">
        <Button variant="outline" onClick={() => navigate(`/checkout/${eventId}/details`, { state: backState })} className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Attendee Details
        </Button>

        <Card className="bg-surface-card">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-text-primary flex items-center">
                <CreditCard className="mr-2 h-6 w-6 text-brand-primary" /> Payment Information
            </CardTitle>
            <CardDescription className="text-text-secondary">
              Review your order and enter your payment details below.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Final Order Summary */}
            <section>
              <h3 className="text-lg font-semibold text-text-primary mb-3">Order Confirmation</h3>
              <div className="p-4 bg-background-main rounded-md border border-border-default space-y-2">
                <p className="text-text-secondary"><strong className="text-text-primary">Name:</strong> {orderDetails.attendeeName}</p>
                <p className="text-text-secondary"><strong className="text-text-primary">Email:</strong> {orderDetails.attendeeEmail}</p>
                <Separator className="my-2" />
                {orderDetails.cart.map(item => (
                  <div key={item.ticketTypeId} className="flex justify-between items-center text-sm">
                    <span>{item.ticketTypeName} (x{item.quantity})</span>
                    <span>${(item.quantity * item.pricePerTicket).toFixed(2)}</span>
                  </div>
                ))}
                <Separator className="my-2" />
                {orderDetails.subtotalAmount !== null && (
                    <div className="flex justify-between items-center text-sm text-text-secondary">(Subtotal)
                        <span>Subtotal:</span>
                        <span>${orderDetails.subtotalAmount.toFixed(2)}</span>
                    </div>
                )}
                {orderDetails.appliedPromoDetails && orderDetails.appliedPromoDetails.discountAmount > 0 && (
                    <div className="flex justify-between items-center text-sm text-green-600 dark:text-green-400">
                        <span className="flex items-center">
                            <Percent className="mr-1 h-3 w-3" />
                            Discount ({orderDetails.appliedPromoDetails.code}):
                        </span>
                        <span>-${orderDetails.appliedPromoDetails.discountAmount.toFixed(2)}</span>
                    </div>
                )}
                <div className="flex justify-between items-center font-bold text-lg text-text-primary pt-1">
                  <p>Total Amount:</p>
                  <p>${orderDetails.totalAmount !== null ? orderDetails.totalAmount.toFixed(2) : 'N/A'}</p>
                </div>
              </div>
            </section>

            <Separator />

            {/* Mock Payment Form */}
            <section>
              <h3 className="text-lg font-semibold text-text-primary mb-4">Enter Payment Details (Mock)</h3>
              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="cardholderName" className="flex items-center"><User className="mr-2 h-4 w-4 text-text-secondary"/>Cardholder Name</Label>
                  <Input id="cardholderName" type="text" value={cardholderName} onChange={(e) => setCardholderName(e.target.value)} placeholder="Full Name as on Card" required className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="cardNumber" className="flex items-center"><CreditCard className="mr-2 h-4 w-4 text-text-secondary"/>Card Number</Label>
                  <Input id="cardNumber" type="text" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} placeholder="0000 0000 0000 0000" required className="mt-1" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiryDate" className="flex items-center"><Calendar className="mr-2 h-4 w-4 text-text-secondary"/>Expiry Date</Label>
                    <Input id="expiryDate" type="text" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} placeholder="MM/YY" required className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="cvv" className="flex items-center"><Lock className="mr-2 h-4 w-4 text-text-secondary"/>CVV</Label>
                    <Input id="cvv" type="text" value={cvv} onChange={(e) => setCvv(e.target.value)} placeholder="123" required className="mt-1" />
                  </div>
                </div>
                <CardFooter className="px-0 pt-6">
                  <Button type="submit" size="lg" className="w-full bg-green-600 hover:bg-green-700 text-white">
                    <ShieldCheck className="mr-2 h-5 w-5" /> Confirm & Pay (Mock)
                  </Button>
                </CardFooter>
              </form>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CheckoutPaymentPage; 