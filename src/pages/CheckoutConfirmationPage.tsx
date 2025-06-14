import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';
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
  User
} from 'lucide-react';

const CheckoutConfirmationPage = () => {
  const navigate = useNavigate();
  const { state, clearCart, setStep } = useCart();
  const [orderNumber] = useState(() => `SL${Date.now().toString().slice(-8)}`);

  useEffect(() => {
    setStep(4);
    // Redirect if no items in cart or no attendee info
    if (state.items.length === 0 || !state.attendeeInfo) {
      navigate('/events');
    }
  }, [setStep, state.items.length, state.attendeeInfo, navigate]);

  const handleNewOrder = () => {
    clearCart();
    navigate('/events');
  };

  const handleDownloadTickets = () => {
    // Mock ticket download
    alert('Tickets downloaded! (This is a demo)');
  };

  const handleShareEvent = () => {
    // Mock sharing functionality
    if (navigator.share) {
      navigator.share({
        title: state.eventTitle || 'Event',
        text: `Check out this event: ${state.eventTitle}`,
        url: window.location.origin + `/events/${state.eventId}`
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(`${window.location.origin}/events/${state.eventId}`);
      alert('Event link copied to clipboard!');
    }
  };

  if (state.items.length === 0 || !state.attendeeInfo) {
    return null; // Will redirect
  }

  const processingFee = state.total * 0.029 + 0.30;
  const totalAmount = state.total + processingFee;

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
            Order #{orderNumber}
          </Badge>
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
                <h3 className="font-semibold mb-3">{state.eventTitle}</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    December 15, 2024
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    7:00 PM
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Navy Pier Grand Ballroom
                  </div>
                </div>
              </div>

              <Separator />

              {/* Tickets */}
              <div>
                <h3 className="font-semibold mb-3">Tickets</h3>
                <div className="space-y-3">
                  {state.items.map((item) => (
                    <div key={item.ticketType.id} className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{item.ticketType.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Quantity: {item.quantity}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">${item.ticketType.price * item.quantity}</div>
                        <div className="text-sm text-muted-foreground">
                          ${item.ticketType.price} each
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
                    <span>${state.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Processing Fee</span>
                    <span>${processingFee.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total Paid</span>
                    <span>${totalAmount.toFixed(2)}</span>
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
                      {state.attendeeInfo.firstName} {state.attendeeInfo.lastName}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    {state.attendeeInfo.email}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    {state.attendeeInfo.phone}
                  </div>
                  {state.attendeeInfo.dietaryRestrictions && (
                    <div className="text-sm">
                      <span className="font-medium">Dietary Restrictions:</span>
                      <p className="text-muted-foreground mt-1">
                        {state.attendeeInfo.dietaryRestrictions}
                      </p>
                    </div>
                  )}
                  {state.attendeeInfo.specialRequests && (
                    <div className="text-sm">
                      <span className="font-medium">Special Requests:</span>
                      <p className="text-muted-foreground mt-1">
                        {state.attendeeInfo.specialRequests}
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
                <Button onClick={handleDownloadTickets} className="w-full" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download Tickets
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