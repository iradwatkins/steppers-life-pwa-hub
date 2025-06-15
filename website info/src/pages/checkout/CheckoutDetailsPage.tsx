import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { User, Mail, CreditCard, ArrowLeft, Percent } from 'lucide-react';

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

const CheckoutDetailsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { eventId } = useParams<{ eventId: string }>();
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [attendeeName, setAttendeeName] = useState('');
  const [attendeeEmail, setAttendeeEmail] = useState('');
  const [subtotal, setSubtotal] = useState<number | null>(null);
  const [finalTotal, setFinalTotal] = useState<number | null>(null);
  const [appliedPromoDetails, setAppliedPromoDetails] = useState<AppliedPromoDetails | null>(null);

  useEffect(() => {
    if (location.state) {
      setCart(location.state.cart || []);
      setSubtotal(location.state.subtotal !== undefined ? location.state.subtotal : null);
      setFinalTotal(location.state.total !== undefined ? location.state.total : null); // 'total' from previous page is the final total
      setAppliedPromoDetails(location.state.appliedPromoDetails || null);

      if (!location.state.cart || location.state.cart.length === 0) {
        console.warn('No cart data or empty cart found in location state. Redirecting...');
        if (eventId) {
          navigate(`/event/${eventId}/tickets`);
        } else {
          navigate('/events');
        }
      }
    } else {
      console.warn('No location state found. Redirecting...');
      if (eventId) {
        navigate(`/event/${eventId}/tickets`);
      } else {
        navigate('/events');
      }
    }
  }, [location.state, navigate, eventId]);

  const handleSubmitDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!attendeeName.trim() || !attendeeEmail.trim()) {
      alert('Please fill in your name and email.');
      return;
    }
    // Validate email format (basic)
    if (!/\S+@\S+\.\S+/.test(attendeeEmail)) {
        alert('Please enter a valid email address.');
        return;
    }

    const orderDetails = {
      cart,
      attendeeName,
      attendeeEmail,
      subtotalAmount: subtotal, // Pass subtotal (pre-discount)
      appliedPromoDetails, // Pass promo details
      totalAmount: finalTotal, // Pass final total (post-discount)
    };
    console.log('Proceeding to payment with details:', orderDetails);
    navigate(`/checkout/${eventId}/payment`, { state: { orderDetails } });
  };
  
  if (cart.length === 0 && !(location.state && location.state.cart)) {
    // Still loading cart or cart is genuinely empty and redirected, show minimal UI or loading
    return <div className="min-h-screen bg-background-main flex items-center justify-center"><p>Loading checkout details...</p></div>;
  }

  return (
    <div className="min-h-screen bg-background-main py-8 px-4 md:px-8">
      <div className="max-w-3xl mx-auto">
        <Button variant="outline" onClick={() => navigate(`/event/${eventId}/tickets`)} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Ticket Selection
        </Button>

        <Card className="bg-surface-card">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-text-primary">Checkout Details</CardTitle>
            <CardDescription className="text-text-secondary">
              Please review your order and provide your contact information.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Order Summary */}
            <section>
              <h3 className="text-lg font-semibold text-text-primary mb-3">Order Summary</h3>
              {cart.length > 0 && subtotal !== null && finalTotal !== null ? (
                <div className="space-y-3">
                  {cart.map(item => (
                    <div key={item.ticketTypeId} className="flex justify-between items-center p-3 bg-background-main rounded-md border border-border-default">
                      <div>
                        <p className="font-medium text-text-primary">{item.ticketTypeName}</p>
                        <p className="text-sm text-text-secondary">Quantity: {item.quantity} x ${item.pricePerTicket.toFixed(2)}</p>
                      </div>
                      <p className="font-semibold text-text-primary">${(item.quantity * item.pricePerTicket).toFixed(2)}</p>
                    </div>
                  ))}
                  <Separator className="my-3" />
                  <div className="flex justify-between items-center text-md text-text-secondary pt-2">
                    <p>Subtotal:</p>
                    <p>${subtotal.toFixed(2)}</p>
                  </div>
                  {appliedPromoDetails && appliedPromoDetails.discountAmount > 0 && (
                    <div className="flex justify-between items-center text-sm text-green-600 dark:text-green-400">
                      <p className="flex items-center">
                        <Percent className="mr-1 h-4 w-4" /> 
                        Discount ({appliedPromoDetails.code}):
                      </p>
                      <p>-${appliedPromoDetails.discountAmount.toFixed(2)}</p>
                    </div>
                  )}
                  <Separator className="my-3" />
                  <div className="flex justify-between items-center font-bold text-xl text-text-primary pt-2">
                    <p>Total Amount:</p>
                    <p>${finalTotal.toFixed(2)}</p>
                  </div>
                </div>
              ) : (
                <p className="text-text-secondary">Your cart is empty. Please select tickets first.</p>
              )}
            </section>

            <Separator />

            {/* Attendee Information Form */}
            {cart.length > 0 && (
                <section>
                <h3 className="text-lg font-semibold text-text-primary mb-4">Your Information</h3>
                <form onSubmit={handleSubmitDetails} className="space-y-4">
                    <div>
                    <Label htmlFor="attendeeName" className="text-text-primary font-medium flex items-center">
                        <User className="mr-2 h-4 w-4 text-text-secondary" /> Full Name
                    </Label>
                    <Input 
                        id="attendeeName" 
                        type="text" 
                        value={attendeeName} 
                        onChange={(e) => setAttendeeName(e.target.value)} 
                        placeholder="Your full name"
                        className="mt-1"
                        required 
                    />
                    </div>
                    <div>
                    <Label htmlFor="attendeeEmail" className="text-text-primary font-medium flex items-center">
                        <Mail className="mr-2 h-4 w-4 text-text-secondary" /> Email Address
                    </Label>
                    <Input 
                        id="attendeeEmail" 
                        type="email" 
                        value={attendeeEmail} 
                        onChange={(e) => setAttendeeEmail(e.target.value)} 
                        placeholder="your.email@example.com"
                        className="mt-1"
                        required 
                    />
                    </div>
                    <CardFooter className="px-0 pt-6">
                        <Button type="submit" size="lg" className="w-full bg-brand-primary hover:bg-brand-primary-hover text-text-on-primary">
                            <CreditCard className="mr-2 h-5 w-5" /> Proceed to Payment
                        </Button>
                    </CardFooter>
                </form>
                </section>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CheckoutDetailsPage; 