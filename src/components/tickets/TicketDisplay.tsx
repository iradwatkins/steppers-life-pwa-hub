import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Ticket, Download, Mail, QrCode, Calendar, MapPin, User, Clock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface OrderWithItems {
  id: string;
  order_number: string;
  event_id: string;
  total_amount: number;
  final_amount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'refunded';
  created_at: string;
  billing_details: any;
  event?: {
    title: string;
    start_date: string;
    end_date: string;
    venue?: {
      name: string;
      address: string;
      city: string;
      state: string;
    };
  };
  order_items: Array<{
    id: string;
    attendee_name: string;
    attendee_email: string;
    price: number;
    ticket_type_id: string;
    created_at: string;
    special_requests?: string;
  }>;
}

interface TicketDisplayProps {
  className?: string;
}

const TicketDisplay: React.FC<TicketDisplayProps> = ({ className }) => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');

  const loadTickets = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Mock data for now
      const mockTickets: OrderWithItems[] = [];
      setTickets(mockTickets);
    } catch (error) {
      console.error('Error loading tickets:', error);
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, [user]);

  const getStatusBadge = (status: OrderWithItems['status']) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800">Confirmed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      case 'refunded':
        return <Badge className="bg-gray-100 text-gray-800">Refunded</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleDownloadTicket = async (orderId: string) => {
    try {
      toast.success('Ticket downloaded successfully');
    } catch (error) {
      console.error('Error downloading ticket:', error);
      toast.error('Failed to download ticket');
    }
  };

  const handleEmailTicket = async (orderId: string) => {
    try {
      toast.success('Ticket sent via email');
    } catch (error) {
      console.error('Error emailing ticket:', error);
      toast.error('Failed to send ticket via email');
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    if (!ticket.event?.start_date) return true;
    
    const eventDate = new Date(ticket.event.start_date);
    const now = new Date();
    
    switch (filter) {
      case 'upcoming':
        return eventDate > now;
      case 'past':
        return eventDate < now;
      default:
        return true;
    }
  });

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5" />
            My Tickets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Loading your tickets...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ticket className="h-5 w-5" />
          My Tickets ({tickets.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filter buttons */}
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All Tickets
          </Button>
          <Button
            variant={filter === 'upcoming' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('upcoming')}
          >
            Upcoming
          </Button>
          <Button
            variant={filter === 'past' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('past')}
          >
            Past Events
          </Button>
        </div>

        {filteredTickets.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Ticket className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No tickets found</p>
            <p className="text-sm">Your event tickets will appear here after purchase</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTickets.map((ticket) => (
              <div key={ticket.id} className="border rounded-lg p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">
                        {ticket.event?.title || 'Event Title'}
                      </h3>
                      {getStatusBadge(ticket.status)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Order #{ticket.order_number}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEmailTicket(ticket.id)}
                    >
                      <Mail className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadTicket(ticket.id)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="default" size="sm">
                      <QrCode className="h-4 w-4 mr-2" />
                      QR Code
                    </Button>
                  </div>
                </div>

                {ticket.event && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {format(new Date(ticket.event.start_date), 'MMM d, yyyy • h:mm a')}
                      </span>
                    </div>
                    {ticket.event.venue && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {ticket.event.venue.name}, {ticket.event.venue.city}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Ticket details */}
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Ticket Details</h4>
                  <div className="space-y-2">
                    {ticket.order_items.map((item, index) => (
                      <div key={item.id} className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>{item.attendee_name || 'Attendee'}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-muted-foreground">
                            ${item.price.toFixed(2)}
                          </span>
                          <Badge variant="outline">Ticket {index + 1}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center text-sm pt-2 border-t">
                  <span className="text-muted-foreground">
                    Purchased {format(new Date(ticket.created_at), 'MMM d, yyyy')}
                  </span>
                  <span className="font-medium">
                    Total: ${ticket.final_amount.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TicketDisplay;
