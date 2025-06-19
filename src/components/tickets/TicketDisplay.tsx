import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { OrderService, OrderWithItems } from '@/services/orderService';
import { QRCodeSVG } from 'qrcode.react';
import {
  Calendar,
  MapPin,
  Clock,
  QrCode,
  Ticket,
  AlertCircle,
  CheckCircle,
  CreditCard,
  Download,
  Eye,
  Loader2,
  Smartphone
} from 'lucide-react';

const TicketDisplay: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingCode, setPendingCode] = useState('');
  const [verifyingCode, setVerifyingCode] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchTickets();
    }
  }, [user]);

  const fetchTickets = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const userOrders = await OrderService.getUserOrders(user.id);
      // Only show confirmed orders for ticket display
      const confirmedOrders = userOrders.filter(order => 
        order.status === 'confirmed' || order.status === 'pending'
      );
      setOrders(confirmedOrders);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast({
        title: "Error",
        description: "Failed to load your tickets",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyPayment = async (orderId: string) => {
    if (!pendingCode || pendingCode.length !== 5) {
      toast({
        title: "Invalid Code",
        description: "Please enter a 5-digit verification code",
        variant: "destructive"
      });
      return;
    }

    try {
      setVerifyingCode(orderId);
      // TODO: Implement actual verification logic
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      // For demo purposes, assume verification succeeds
      const success = Math.random() > 0.3; // 70% success rate for demo
      
      if (success) {
        toast({
          title: "Payment Verified",
          description: "Your ticket has been confirmed and is now available!"
        });
        fetchTickets(); // Refresh tickets
        setPendingCode('');
      } else {
        toast({
          title: "Verification Failed",
          description: "The code entered is invalid. Please check and try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Verification failed:', error);
      toast({
        title: "Verification Error",
        description: "Failed to verify payment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setVerifyingCode('');
    }
  };

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    };
  };

  const generateQRData = (order: OrderWithItems, itemIndex: number) => {
    return JSON.stringify({
      orderId: order.id,
      orderNumber: order.order_number,
      eventId: order.event_id,
      eventTitle: order.event.title,
      ticketIndex: itemIndex,
      attendeeName: `${order.attendee_first_name} ${order.attendee_last_name}`,
      verificationType: 'event_entry',
      timestamp: new Date().toISOString()
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Confirmed</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending Payment</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Ticket className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Tickets Yet</h3>
          <p className="text-muted-foreground mb-4">
            You don't have any tickets yet. Purchase tickets for events to see them here.
          </p>
          <Button asChild>
            <Link to="/events">
              Browse Events
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const upcomingTickets = orders.filter(order => 
    new Date(order.event.start_date) > new Date()
  );
  const pastTickets = orders.filter(order => 
    new Date(order.event.start_date) <= new Date()
  );

  return (
    <div className="space-y-6">
      {/* Upcoming Events */}
      {upcomingTickets.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Upcoming Events</h3>
          <div className="grid gap-4">
            {upcomingTickets.map((order) => {
              const eventDateTime = formatEventDate(order.event.start_date);
              const isPending = order.status === 'pending';
              
              return (
                <Card key={order.id} className="relative overflow-hidden">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{order.event.title}</CardTitle>
                        <CardDescription>
                          Order #{order.order_number}
                        </CardDescription>
                      </div>
                      {getStatusBadge(order.status)}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Event Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{eventDateTime.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{eventDateTime.time}</span>
                      </div>
                      <div className="flex items-center gap-2 md:col-span-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {order.event.venue ? 
                            `${order.event.venue.name}, ${order.event.venue.city}` : 
                            'Venue TBD'
                          }
                        </span>
                      </div>
                    </div>

                    {/* Pending Payment Alert */}
                    {isPending && (
                      <Alert className="border-yellow-200 bg-yellow-50">
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                        <AlertDescription className="text-yellow-800">
                          <div className="space-y-3">
                            <p>Complete your payment to access your tickets. Enter the 5-digit verification code you received.</p>
                            <div className="flex gap-2">
                              <div className="flex-1">
                                <Label htmlFor="verification-code" className="sr-only">Verification Code</Label>
                                <Input
                                  id="verification-code"
                                  placeholder="Enter 5-digit code"
                                  value={pendingCode}
                                  onChange={(e) => setPendingCode(e.target.value.slice(0, 5))}
                                  maxLength={5}
                                  className="bg-white"
                                />
                              </div>
                              <Button
                                onClick={() => handleVerifyPayment(order.id)}
                                disabled={verifyingCode === order.id || pendingCode.length !== 5}
                                size="sm"
                              >
                                {verifyingCode === order.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <CheckCircle className="h-4 w-4" />
                                )}
                                Verify
                              </Button>
                            </div>
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Tickets */}
                    {!isPending && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium flex items-center gap-2">
                            <QrCode className="h-4 w-4" />
                            Your Tickets ({order.order_items.length})
                          </h4>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedTicket(selectedTicket === order.id ? null : order.id)}
                          >
                            {selectedTicket === order.id ? (
                              <>
                                <Eye className="h-4 w-4 mr-2" />
                                Hide QR
                              </>
                            ) : (
                              <>
                                <Smartphone className="h-4 w-4 mr-2" />
                                Show QR
                              </>
                            )}
                          </Button>
                        </div>

                        {selectedTicket === order.id && (
                          <div className="grid gap-4">
                            {order.order_items.map((item, index) => (
                              <div key={index} className="bg-muted/30 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-4">
                                  <div>
                                    <div className="font-medium">{item.ticket_type.name}</div>
                                    <div className="text-sm text-muted-foreground">
                                      Ticket #{index + 1} of {order.order_items.length}
                                    </div>
                                  </div>
                                  <div className="text-lg font-semibold">
                                    ${item.price_paid.toFixed(2)}
                                  </div>
                                </div>
                                
                                <div className="flex items-center justify-center bg-white rounded-lg p-4">
                                  <QRCodeSVG
                                    value={generateQRData(order, index)}
                                    size={120}
                                    level="M"
                                    includeMargin
                                  />
                                </div>
                                
                                <div className="text-center mt-2 text-sm text-muted-foreground">
                                  Scan this QR code at the event for entry
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="text-sm text-muted-foreground bg-blue-50 border border-blue-200 rounded-md p-3">
                          <div className="flex items-start gap-2">
                            <Smartphone className="h-4 w-4 mt-0.5 text-blue-600" />
                            <div>
                              <strong className="text-blue-800">Mobile Entry:</strong> Save this page to your phone's home screen for quick access to your tickets at the event.
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    {!isPending && (
                      <div className="flex gap-2 pt-2">
                        <Button variant="outline" size="sm" asChild className="flex-1">
                          <Link to={`/events/${order.event_id}`}>
                            View Event Details
                          </Link>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Past Events */}
      {pastTickets.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Past Events</h3>
          <div className="grid gap-4">
            {pastTickets.map((order) => {
              const eventDateTime = formatEventDate(order.event.start_date);
              
              return (
                <Card key={order.id} className="relative overflow-hidden opacity-75">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{order.event.title}</CardTitle>
                        <CardDescription>
                          Order #{order.order_number} • {eventDateTime.date}
                        </CardDescription>
                      </div>
                      <Badge variant="outline">Attended</Badge>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Ticket className="h-3 w-3" />
                        {order.order_items.length} ticket{order.order_items.length !== 1 ? 's' : ''}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {order.event.venue?.name || 'Event Venue'}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketDisplay;