import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  Download, 
  Eye, 
  Share2, 
  Calendar, 
  MapPin, 
  Clock, 
  Ticket,
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Filter,
  FileText,
  Mail,
  RefreshCw,
  QrCode
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { downloadTicketAsPDF, formatTicketDataForPDF } from '@/utils/ticketPDF';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface TicketPurchase {
  id: string;
  event_id: string;
  event_title: string;
  event_date: string;
  event_location: string;
  event_image?: string;
  ticket_type: string;
  quantity: number;
  price_per_ticket: number;
  total_amount: number;
  purchase_date: string;
  status: 'upcoming' | 'past' | 'cancelled' | 'refunded';
  payment_method: 'stripe' | 'cash' | 'paypal';
  order_id: string;
  ticket_numbers: string[];
  qr_codes: string[];
  organizer_name: string;
  organizer_email: string;
  notes?: string;
}

interface TicketStats {
  total_tickets: number;
  upcoming_events: number;
  past_events: number;
  cancelled_tickets: number;
  total_spent: number;
}

// Utility function for PDF generation
const handleDownloadTicketAsPDF = async (ticket: TicketPurchase) => {
  try {
    // Format the ticket data for the PDF utility
    const ticketData = formatTicketDataForPDF(
      {
        id: ticket.id,
        ticket_type: ticket.ticket_type,
        qr_code: ticket.qr_codes[0] || `TICKET-${ticket.id}`,
        attendee_name: 'Current User', // Would come from user context
        attendee_email: 'user@example.com', // Would come from user context
        order_number: ticket.order_id,
        purchase_date: ticket.purchase_date,
      },
      {
        title: ticket.event_title,
        start_date: ticket.event_date,
        venues: {
          name: ticket.event_location,
          address: ticket.event_location,
        }
      }
    );

    await downloadTicketAsPDF(ticketData);
    toast.success('Ticket PDF downloaded successfully!');
  } catch (error) {
    console.error('Error downloading ticket PDF:', error);
    toast.error('Failed to download ticket PDF. Please try again.');
  }
};

export default function TicketHistoryPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<TicketPurchase[]>([]);
  const [stats, setStats] = useState<TicketStats>({
    total_tickets: 0,
    upcoming_events: 0,
    past_events: 0,
    cancelled_tickets: 0,
    total_spent: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [selectedTickets, setSelectedTickets] = useState<string[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<TicketPurchase | null>(null);
  const [showTicketDialog, setShowTicketDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // PRODUCTION: Fetch real ticket data from Supabase
  useEffect(() => {
    const fetchTicketData = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch orders for the current user
        const { data: orders, error: ordersError } = await supabase
          .from('orders')
          .select(`
            id,
            order_number,
            total_amount,
            status,
            payment_method,
            created_at,
            billing_details,
            events (
              id,
              title,
              start_date,
              venues (
                name,
                city,
                state
              ),
              organizers (
                organization_name,
                profiles (
                  email
                )
              )
            ),
            order_items (
              id,
              quantity,
              price_per_item,
              ticket_types (
                id,
                name,
                description
              )
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (ordersError) {
          throw ordersError;
        }

        // Transform orders into ticket purchases
        const ticketPurchases: TicketPurchase[] = [];
        let totalSpent = 0;
        let upcomingEvents = 0;
        let pastEvents = 0;
        let cancelledTickets = 0;
        let totalTickets = 0;

        orders?.forEach(order => {
          const event = order.events;
          const venue = event?.venues;
          const organizer = event?.organizers;
          
          order.order_items?.forEach(item => {
            const ticketType = item.ticket_types;
            const eventDate = new Date(event?.start_date || '');
            const now = new Date();
            
            let status: TicketPurchase['status'] = 'upcoming';
            if (order.status === 'cancelled') {
              status = 'cancelled';
              cancelledTickets += item.quantity;
            } else if (order.status === 'refunded') {
              status = 'refunded';
            } else if (eventDate < now) {
              status = 'past';
              pastEvents++;
            } else {
              upcomingEvents++;
            }

            totalTickets += item.quantity;
            totalSpent += item.quantity * item.price_per_item;

            ticketPurchases.push({
              id: `${order.id}-${item.id}`,
              event_id: event?.id || '',
              event_title: event?.title || 'Unknown Event',
              event_date: event?.start_date || '',
              event_location: venue ? `${venue.name}, ${venue.city}, ${venue.state}` : 'Unknown Location',
              ticket_type: ticketType?.name || 'General Admission',
              quantity: item.quantity,
              price_per_ticket: item.price_per_item,
              total_amount: item.quantity * item.price_per_item,
              purchase_date: order.created_at,
              status,
              payment_method: order.payment_method as TicketPurchase['payment_method'],
              order_id: order.order_number || order.id,
              ticket_numbers: Array.from({ length: item.quantity }, (_, i) => `TKT-${order.order_number}-${i + 1}`),
              qr_codes: Array.from({ length: item.quantity }, (_, i) => `QR-${order.id}-${i + 1}`),
              organizer_name: organizer?.organization_name || 'Unknown Organizer',
              organizer_email: organizer?.profiles?.email || ''
            });
          });
        });

        setTickets(ticketPurchases);
        setStats({
          total_tickets: totalTickets,
          upcoming_events: upcomingEvents,
          past_events: pastEvents,
          cancelled_tickets: cancelledTickets,
          total_spent: totalSpent
        });

      } catch (error: any) {
        console.error('Error fetching ticket data:', error);
        setError('Failed to load ticket history. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchTicketData();
  }, [user?.id]);

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.event_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.event_location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.ticket_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.organizer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.order_id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    
    const matchesDate = dateFilter === 'all' || (() => {
      const eventDate = new Date(ticket.event_date);
      const now = new Date();
      
      switch (dateFilter) {
        case 'upcoming': return eventDate > now;
        case 'past': return eventDate < now;
        case 'this-month': {
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
          const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          return eventDate >= monthStart && eventDate <= monthEnd;
        }
        default: return true;
      }
    })();

    return matchesSearch && matchesStatus && matchesDate;
  });

  const handleBulkDownload = () => {
    const selectedTicketObjects = tickets.filter(ticket => selectedTickets.includes(ticket.id));
    selectedTicketObjects.forEach((ticket, index) => {
      setTimeout(() => handleDownloadTicketAsPDF(ticket), index * 1000); // Stagger downloads
    });
  };

  const handleShareTicket = async (ticket: TicketPurchase) => {
    const shareText = `Event: ${ticket.event_title}\nDate: ${new Date(ticket.event_date).toLocaleDateString()}\nTickets: ${ticket.quantity}\nOrder: ${ticket.order_id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Ticket for ${ticket.event_title}`,
          text: shareText
        });
      } catch (error) {
        navigator.clipboard.writeText(shareText);
        alert('Ticket details copied to clipboard!');
      }
    } else {
      navigator.clipboard.writeText(shareText);
      alert('Ticket details copied to clipboard!');
    }
  };

  const getStatusBadge = (status: TicketPurchase['status']) => {
    switch (status) {
      case 'upcoming':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200"><Calendar className="w-3 h-3 mr-1" />Upcoming</Badge>;
      case 'past':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200"><CheckCircle className="w-3 h-3 mr-1" />Attended</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200"><XCircle className="w-3 h-3 mr-1" />Cancelled</Badge>;
      case 'refunded':
        return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200"><AlertTriangle className="w-3 h-3 mr-1" />Refunded</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getPaymentMethodBadge = (method: TicketPurchase['payment_method']) => {
    switch (method) {
      case 'stripe':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Card</Badge>;
      case 'cash':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Cash</Badge>;
      case 'paypal':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">PayPal</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Tickets</h1>
          <p className="text-gray-600 mt-1">View and manage your ticket purchase history</p>
        </div>
        <div className="flex gap-2">
          {selectedTickets.length > 0 && (
            <Button variant="outline" onClick={handleBulkDownload}>
              <Download className="w-4 h-4 mr-2" />
              Download Selected ({selectedTickets.length})
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Tickets</p>
                <p className="text-2xl font-bold">{stats.total_tickets}</p>
              </div>
              <Ticket className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Upcoming</p>
                <p className="text-2xl font-bold text-blue-600">{stats.upcoming_events}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Past Events</p>
                <p className="text-2xl font-bold text-gray-600">{stats.past_events}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Cancelled</p>
                <p className="text-2xl font-bold text-red-600">{stats.cancelled_tickets}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-green-600">${stats.total_spent.toFixed(2)}</p>
              </div>
              <FileText className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by event, location, organizer, or order ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="past">Past</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="past">Past Events</SelectItem>
                <SelectItem value="this-month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tickets Table */}
      <Card>
        <CardHeader>
          <CardTitle>Ticket History ({filteredTickets.length})</CardTitle>
          <CardDescription>
            All your ticket purchases and event attendance history
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={filteredTickets.length > 0 && selectedTickets.length === filteredTickets.length}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedTickets(filteredTickets.map(t => t.id));
                      } else {
                        setSelectedTickets([]);
                      }
                    }}
                  />
                </TableHead>
                <TableHead>Event</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Tickets</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedTickets.includes(ticket.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedTickets([...selectedTickets, ticket.id]);
                        } else {
                          setSelectedTickets(selectedTickets.filter(id => id !== ticket.id));
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{ticket.event_title}</p>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {ticket.event_location}
                      </p>
                      <p className="text-xs text-gray-500">Order #{ticket.order_id}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium">{new Date(ticket.event_date).toLocaleDateString()}</p>
                      <p className="text-xs text-gray-600 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(ticket.event_date).toLocaleTimeString()}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium">{ticket.quantity}x {ticket.ticket_type}</p>
                      <p className="text-xs text-gray-600">${ticket.price_per_ticket.toFixed(2)} each</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">${ticket.total_amount.toFixed(2)}</span>
                  </TableCell>
                  <TableCell>
                    {getPaymentMethodBadge(ticket.payment_method)}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(ticket.status)}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setSelectedTicket(ticket)}>
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Ticket Details</DialogTitle>
                            <DialogDescription>
                              Complete information for your ticket purchase
                            </DialogDescription>
                          </DialogHeader>
                          {selectedTicket && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-medium mb-2">Event Information</h4>
                                  <div className="space-y-2 text-sm">
                                    <p><strong>Event:</strong> {selectedTicket.event_title}</p>
                                    <p><strong>Date:</strong> {new Date(selectedTicket.event_date).toLocaleString()}</p>
                                    <p><strong>Location:</strong> {selectedTicket.event_location}</p>
                                    <p><strong>Organizer:</strong> {selectedTicket.organizer_name}</p>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-medium mb-2">Ticket Information</h4>
                                  <div className="space-y-2 text-sm">
                                    <p><strong>Type:</strong> {selectedTicket.ticket_type}</p>
                                    <p><strong>Quantity:</strong> {selectedTicket.quantity}</p>
                                    <p><strong>Total:</strong> ${selectedTicket.total_amount.toFixed(2)}</p>
                                    <p><strong>Status:</strong> {getStatusBadge(selectedTicket.status)}</p>
                                  </div>
                                </div>
                              </div>
                              
                              <Separator />
                              
                              <div>
                                <h4 className="font-medium mb-2">Ticket Numbers</h4>
                                <div className="flex flex-wrap gap-2">
                                  {selectedTicket.ticket_numbers.map((ticketNum, index) => (
                                    <Badge key={index} variant="outline" className="font-mono">
                                      {ticketNum}
                                    </Badge>
                                  ))}
                                </div>
                              </div>

                              {selectedTicket.qr_codes && (
                                <div>
                                  <h4 className="font-medium mb-2">QR Codes</h4>
                                  <div className="flex gap-4">
                                    {selectedTicket.qr_codes.slice(0, 2).map((qrCode, index) => (
                                      <div key={index} className="text-center">
                                        <div className="bg-white p-2 border rounded">
                                          <QRCode value={qrCode} size={80} />
                                        </div>
                                        <p className="text-xs mt-1">Ticket {index + 1}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {selectedTicket.notes && (
                                <div>
                                  <h4 className="font-medium mb-2">Notes</h4>
                                  <p className="text-sm bg-gray-50 p-3 rounded">{selectedTicket.notes}</p>
                                </div>
                              )}

                              <div className="flex gap-2 pt-4">
                                <Button onClick={() => handleDownloadTicketAsPDF(selectedTicket)} className="flex-1">
                                  <Download className="w-4 h-4 mr-2" />
                                  Download PDF
                                </Button>
                                <Button variant="outline" onClick={() => handleShareTicket(selectedTicket)}>
                                  <Share2 className="w-4 h-4 mr-2" />
                                  Share
                                </Button>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      
                      <Button variant="outline" size="sm" onClick={() => handleDownloadTicketAsPDF(ticket)}>
                        <Download className="w-3 h-3 mr-1" />
                        PDF
                      </Button>
                      
                      <Button variant="outline" size="sm" onClick={() => handleShareTicket(ticket)}>
                        <Share2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredTickets.length === 0 && (
            <div className="text-center py-8">
              <Ticket className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tickets found</h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== 'all' || dateFilter !== 'all'
                  ? 'Try adjusting your filters to see more results.'
                  : 'You haven\'t purchased any tickets yet.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}