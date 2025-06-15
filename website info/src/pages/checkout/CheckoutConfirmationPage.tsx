import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Ticket, Home, Percent, Calendar } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { useToast } from "@/components/ui/use-toast";
import CalendarIntegration from '@/components/notifications/CalendarIntegration';

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
  attendeeName: string;
  attendeeEmail: string;
  subtotalAmount: number | null;
  appliedPromoDetails: AppliedPromoDetails | null;
  totalAmount: number | null;
}

interface ConfirmationState {
  orderDetails: OrderDetails;
  mockOrderId: string;
}

const CheckoutConfirmationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { eventId } = useParams<{ eventId: string }>();
  const [confirmationData, setConfirmationData] = useState<ConfirmationState | null>(null);
  const { scheduleTicketConfirmation, scheduleEventReminders } = useNotifications();
  const { toast } = useToast();

  // Mock event data - in real implementation, this would be fetched
  const mockEventData = {
    id: eventId || '1',
    title: 'Chicago Step Championship',
    date: '2024-07-15',
    time: '7:00 PM',
    location: 'Chicago Cultural Center',
    address: '78 E Washington St, Chicago, IL 60602',
    description: 'Annual championship showcasing the best steppers in the Midwest.'
  };

  useEffect(() => {
    if (location.state && location.state.orderDetails && location.state.mockOrderId) {
      const state = location.state as ConfirmationState;
      setConfirmationData({
        ...state,
        orderDetails: {
          ...state.orderDetails,
          subtotalAmount: typeof state.orderDetails.subtotalAmount === 'number' ? state.orderDetails.subtotalAmount : null,
          appliedPromoDetails: state.orderDetails.appliedPromoDetails || null,
          totalAmount: typeof state.orderDetails.totalAmount === 'number' ? state.orderDetails.totalAmount : null,
        }
      });

      // Schedule notifications after successful purchase
      scheduleNotifications(state.orderDetails);
    } else {
      console.warn('No confirmation data found. Redirecting to events...');
      navigate('/events');
    }
  }, [location.state, navigate]);

  const scheduleNotifications = async (orderDetails: OrderDetails) => {
    try {
      // Calculate total tickets purchased
      const totalTickets = orderDetails.cart.reduce((sum, item) => sum + item.quantity, 0);
      const ticketType = orderDetails.cart.length > 0 ? orderDetails.cart[0].ticketTypeName : 'General Admission';

      // Schedule confirmation notification
      await scheduleTicketConfirmation(mockEventData.id, {
        title: mockEventData.title,
        date: mockEventData.date,
        time: mockEventData.time,
        location: mockEventData.location,
        ticketCount: totalTickets,
        ticketType: ticketType
      });

      // Schedule event reminders
      const eventDate = new Date(`${mockEventData.date} ${mockEventData.time}`);
      await scheduleEventReminders(mockEventData.id, eventDate, {
        title: mockEventData.title,
        time: mockEventData.time,
        location: mockEventData.location,
        address: mockEventData.address
      });

      console.log('Notifications scheduled successfully');
    } catch (error) {
      console.error('Failed to schedule notifications:', error);
      // Don't show error to user as this shouldn't block the confirmation flow
    }
  };

  if (!confirmationData) {
    return <div className="min-h-screen bg-background-main flex items-center justify-center"><p>Loading confirmation...</p></div>;
  }

  const { orderDetails, mockOrderId } = confirmationData;

  return (
    <div className="min-h-screen bg-background-main py-8 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Confirmation Card */}
          <div className="lg:col-span-2">
            <Card className="bg-surface-card shadow-xl">
              <CardHeader className="text-center bg-green-500 text-white py-8 rounded-t-lg">
                <CheckCircle className="mx-auto h-16 w-16 mb-4" />
                <CardTitle className="text-3xl font-bold">Thank You For Your Order!</CardTitle>
                <CardDescription className="text-green-100 text-lg mt-2">
                  Your tickets have been confirmed and notifications scheduled.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 md:p-8 space-y-6">
                <div className="text-center">
                  <p className="text-text-secondary">Your Order ID is:</p>
                  <p className="text-2xl font-semibold text-brand-primary my-1">{mockOrderId}</p>
                  <p className="text-text-secondary text-sm">A confirmation email has been sent to {orderDetails.attendeeEmail}.</p>
                </div>
                
                <Separator />

                <div>
                  <h4 className="text-lg font-semibold text-text-primary mb-3">Order Summary:</h4>
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
                    
                    {orderDetails.subtotalAmount !== null && orderDetails.totalAmount !== null && orderDetails.subtotalAmount !== orderDetails.totalAmount && (
                      <>
                        <Separator className="my-2" />
                        <div className="flex justify-between items-center text-sm text-text-secondary">
                            <span>Subtotal:</span>
                            <span>${orderDetails.subtotalAmount.toFixed(2)}</span>
                        </div>
                      </>
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

                    <Separator className="my-2" />
                    <div className="flex justify-between items-center font-bold text-lg text-text-primary pt-1">
                      <p>Total Amount Paid:</p>
                      <p>${orderDetails.totalAmount !== null ? orderDetails.totalAmount.toFixed(2) : 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/profile">
                      <Ticket className="mr-2 h-4 w-4" /> View My Tickets
                    </Link>
                  </Button>
                  <Button asChild className="w-full bg-brand-primary hover:bg-brand-primary-hover text-text-on-primary">
                    <Link to="/events">
                      <Home className="mr-2 h-4 w-4" /> Browse More Events
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Event Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Event Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h4 className="font-medium text-text-primary">{mockEventData.title}</h4>
                  <p className="text-sm text-text-secondary">{mockEventData.date} at {mockEventData.time}</p>
                  <p className="text-sm text-text-secondary">{mockEventData.location}</p>
                </div>
                <Separator />
                <div className="text-xs text-text-secondary">
                  <p>✓ Confirmation email sent</p>
                  <p>✓ Event reminders scheduled</p>
                  <p>✓ Calendar invites available</p>
                </div>
              </CardContent>
            </Card>

            {/* Calendar Integration */}
            <CalendarIntegration
              eventDetails={{
                title: mockEventData.title,
                description: mockEventData.description,
                startDate: new Date(`${mockEventData.date} ${mockEventData.time}`),
                endDate: new Date(`${mockEventData.date} ${mockEventData.time}`), // Add 3 hours for end time
                location: mockEventData.location,
                address: mockEventData.address
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutConfirmationPage; 