import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Download, Search, QrCode, Calendar, MapPin, Ticket, Eye, Share2, Filter, RefreshCw, Clock } from 'lucide-react';
import { downloadTicketAsPDF, downloadAllTicketsAsZip } from '@/utils/ticketDownload';

interface TicketPurchase {
  id: string;
  orderNumber: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  ticketType: string;
  quantity: number;
  totalAmount: number;
  purchaseDate: string;
  status: 'Active' | 'Used' | 'Cancelled' | 'Refunded' | 'Expired';
  tickets: Ticket[];
  paymentMethod: 'Credit Card' | 'Cash' | 'Promo Code';
  qrCodeData?: string;
}

interface Ticket {
  id: string;
  ticketNumber: string;
  seatInfo?: string;
  usedAt?: string;
  qrCode: string;
}

// Mock ticket history data
const mockTicketHistory: TicketPurchase[] = [
  {
    id: 'purchase001',
    orderNumber: 'SL-2025-001234',
    eventId: 'evt001',
    eventTitle: 'Steppers Life Annual Dance Competition',
    eventDate: '2025-02-15T19:00:00Z',
    eventLocation: 'Chicago Cultural Center, 78 E Washington St, Chicago, IL',
    ticketType: 'VIP Package',
    quantity: 2,
    totalAmount: 240.00,
    purchaseDate: '2025-01-10T14:30:00Z',
    status: 'Active',
    paymentMethod: 'Credit Card',
    tickets: [
      {
        id: 'ticket001',
        ticketNumber: 'SL-VIP-001',
        seatInfo: 'Section A, Row 1, Seat 12',
        qrCode: 'VIP-QR-001234'
      },
      {
        id: 'ticket002',
        ticketNumber: 'SL-VIP-002',
        seatInfo: 'Section A, Row 1, Seat 13',
        qrCode: 'VIP-QR-001235'
      }
    ]
  },
  {
    id: 'purchase002',
    orderNumber: 'SL-2025-001235',
    eventId: 'evt002',
    eventTitle: 'Spring Step Showcase',
    eventDate: '2025-03-20T18:00:00Z',
    eventLocation: 'Downtown Community Center, 123 Main St, Chicago, IL',
    ticketType: 'General Admission',
    quantity: 1,
    totalAmount: 45.00,
    purchaseDate: '2025-01-08T10:15:00Z',
    status: 'Used',
    paymentMethod: 'Cash',
    tickets: [
      {
        id: 'ticket003',
        ticketNumber: 'SL-GA-003',
        usedAt: '2025-03-20T17:45:00Z',
        qrCode: 'GA-QR-001236'
      }
    ]
  },
  {
    id: 'purchase003',
    orderNumber: 'SL-2025-001236',
    eventId: 'evt003',
    eventTitle: 'Youth Step Championship',
    eventDate: '2025-04-10T15:00:00Z',
    eventLocation: 'Lincoln High School Auditorium, 456 Oak Ave, Chicago, IL',
    ticketType: 'Student Discount',
    quantity: 3,
    totalAmount: 90.00,
    purchaseDate: '2025-01-05T16:20:00Z',
    status: 'Active',
    paymentMethod: 'Credit Card',
    tickets: [
      {
        id: 'ticket004',
        ticketNumber: 'SL-STU-004',
        qrCode: 'STU-QR-001237'
      },
      {
        id: 'ticket005',
        ticketNumber: 'SL-STU-005',
        qrCode: 'STU-QR-001238'
      },
      {
        id: 'ticket006',
        ticketNumber: 'SL-STU-006',
        qrCode: 'STU-QR-001239'
      }
    ]
  },
  {
    id: 'purchase004',
    orderNumber: 'SL-2025-001237',
    eventId: 'evt004',
    eventTitle: 'Winter Step Battle',
    eventDate: '2024-12-15T19:30:00Z',
    eventLocation: 'Grand Ballroom, 789 State St, Chicago, IL',
    ticketType: 'General Admission',
    quantity: 2,
    totalAmount: 80.00,
    purchaseDate: '2024-11-20T12:00:00Z',
    status: 'Refunded',
    paymentMethod: 'Credit Card',
    tickets: [
      {
        id: 'ticket007',
        ticketNumber: 'SL-GA-007',
        qrCode: 'GA-QR-001240'
      },
      {
        id: 'ticket008',
        ticketNumber: 'SL-GA-008',
        qrCode: 'GA-QR-001241'
      }
    ]
  }
];

const TicketHistoryPage = () => {
  const navigate = useNavigate();
  const [purchases, setPurchases] = useState<TicketPurchase[]>(mockTicketHistory);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedPurchase, setSelectedPurchase] = useState<TicketPurchase | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  const filteredPurchases = purchases.filter(purchase => {
    const matchesSearch = purchase.eventTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         purchase.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         purchase.ticketType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || purchase.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeVariant = (status: TicketPurchase['status']) => {
    switch (status) {
      case 'Active': return 'default';
      case 'Used': return 'secondary';
      case 'Cancelled': return 'destructive';
      case 'Refunded': return 'outline';
      case 'Expired': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusColor = (status: TicketPurchase['status']) => {
    switch (status) {
      case 'Active': return 'text-green-600';
      case 'Used': return 'text-blue-600';
      case 'Cancelled': return 'text-red-600';
      case 'Refunded': return 'text-orange-600';
      case 'Expired': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const downloadTicket = (purchase: TicketPurchase) => {
    const ticketData = {
      orderNumber: purchase.orderNumber,
      eventTitle: purchase.eventTitle,
      eventDate: new Date(purchase.eventDate).toLocaleDateString(),
      ticketType: purchase.ticketType,
      quantity: purchase.quantity,
      tickets: purchase.tickets
    };
    
    downloadTicketAsPDF(ticketData);
    alert(`Ticket downloaded for ${purchase.eventTitle}`);
  };

  const downloadAllTickets = () => {
    const allTicketsData = filteredPurchases.map(purchase => ({
      orderNumber: purchase.orderNumber,
      eventTitle: purchase.eventTitle,
      eventDate: new Date(purchase.eventDate).toLocaleDateString(),
      ticketType: purchase.ticketType,
      quantity: purchase.quantity,
      tickets: purchase.tickets
    }));
    
    downloadAllTicketsAsZip(allTicketsData);
    alert('All tickets downloaded successfully!');
  };

  const shareTicket = (purchase: TicketPurchase) => {
    if (navigator.share) {
      navigator.share({
        title: `Ticket for ${purchase.eventTitle}`,
        text: `My ticket for ${purchase.eventTitle} - Order: ${purchase.orderNumber}`,
        url: window.location.href
      });
    } else {
      // Fallback to clipboard
      const shareText = `My ticket for ${purchase.eventTitle} - Order: ${purchase.orderNumber}`;
      navigator.clipboard.writeText(shareText);
      alert('Ticket details copied to clipboard!');
    }
  };

  const viewTicketDetails = (purchase: TicketPurchase) => {
    setSelectedPurchase(purchase);
    setIsDetailDialogOpen(true);
  };

  const isEventUpcoming = (eventDate: string) => {
    return new Date(eventDate) > new Date();
  };

  return (
    <div className="min-h-screen bg-background-main py-8 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <Button variant="outline" onClick={() => navigate('/profile')} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Profile
        </Button>

        <Card className="bg-surface-card mb-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-text-primary flex items-center">
              <Ticket className="mr-2 h-6 w-6 text-brand-primary" />
              My Ticket History
            </CardTitle>
            <CardDescription className="text-text-secondary">
              View, download, and manage all your purchased tickets
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Filters and Actions */}
        <Card className="bg-surface-card mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-text-tertiary" />
                <Input
                  placeholder="Search by event name, order number, or ticket type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full lg:w-48">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Used">Used</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                  <SelectItem value="Refunded">Refunded</SelectItem>
                  <SelectItem value="Expired">Expired</SelectItem>
                </SelectContent>
              </Select>

              <Button 
                onClick={downloadAllTickets}
                variant="outline"
                className="border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-text-on-primary"
                disabled={filteredPurchases.length === 0}
              >
                <Download className="mr-2 h-4 w-4" />
                Download All
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tickets List */}
        {filteredPurchases.length === 0 ? (
          <Card className="bg-surface-card">
            <CardContent className="p-8 text-center text-text-secondary">
              <Ticket className="mx-auto h-12 w-12 mb-4 text-text-tertiary" />
              <p>No tickets found matching your criteria.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredPurchases.map((purchase) => (
              <Card key={purchase.id} className="bg-surface-card border-border-default">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Badge variant={getStatusBadgeVariant(purchase.status)} className={getStatusColor(purchase.status)}>
                            {purchase.status}
                          </Badge>
                          {isEventUpcoming(purchase.eventDate) && purchase.status === 'Active' && (
                            <Badge variant="outline" className="border-blue-500 text-blue-600">
                              <Clock className="mr-1 h-3 w-3" />
                              Upcoming
                            </Badge>
                          )}
                        </div>
                        <div className="text-lg font-semibold text-text-primary">
                          ${purchase.totalAmount.toFixed(2)}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-xl font-semibold text-text-primary mb-1">{purchase.eventTitle}</h3>
                        <p className="text-sm text-text-tertiary">Order #{purchase.orderNumber}</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-text-tertiary" />
                          <span>{new Date(purchase.eventDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-text-tertiary" />
                          <span className="truncate">{purchase.eventLocation}</span>
                        </div>
                        <div>
                          <span className="text-text-tertiary">Tickets: </span>
                          <span>{purchase.ticketType} (x{purchase.quantity})</span>
                        </div>
                        <div>
                          <span className="text-text-tertiary">Purchased: </span>
                          <span>{new Date(purchase.purchaseDate).toLocaleDateString()}</span>
                        </div>
                        <div>
                          <span className="text-text-tertiary">Payment: </span>
                          <span>{purchase.paymentMethod}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 lg:ml-6">
                      <Button
                        onClick={() => viewTicketDetails(purchase)}
                        variant="outline"
                        size="sm"
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Button>
                      
                      {(purchase.status === 'Active' || purchase.status === 'Used') && (
                        <Button
                          onClick={() => downloadTicket(purchase)}
                          className="bg-brand-primary hover:bg-brand-primary-hover text-text-on-primary"
                          size="sm"
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </Button>
                      )}
                      
                      <Button
                        onClick={() => shareTicket(purchase)}
                        variant="outline"
                        size="sm"
                      >
                        <Share2 className="mr-2 h-4 w-4" />
                        Share
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Ticket Details Dialog */}
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Ticket Details</DialogTitle>
              <DialogDescription>
                Complete information for your ticket purchase
              </DialogDescription>
            </DialogHeader>
            
            {selectedPurchase && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-text-primary mb-2">Event Information</h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>Event:</strong> {selectedPurchase.eventTitle}</p>
                      <p><strong>Date:</strong> {new Date(selectedPurchase.eventDate).toLocaleDateString()}</p>
                      <p><strong>Time:</strong> {new Date(selectedPurchase.eventDate).toLocaleTimeString()}</p>
                      <p><strong>Location:</strong> {selectedPurchase.eventLocation}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-text-primary mb-2">Purchase Details</h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>Order #:</strong> {selectedPurchase.orderNumber}</p>
                      <p><strong>Ticket Type:</strong> {selectedPurchase.ticketType}</p>
                      <p><strong>Quantity:</strong> {selectedPurchase.quantity}</p>
                      <p><strong>Total Amount:</strong> ${selectedPurchase.totalAmount.toFixed(2)}</p>
                      <p><strong>Payment Method:</strong> {selectedPurchase.paymentMethod}</p>
                      <p><strong>Status:</strong> <span className={getStatusColor(selectedPurchase.status)}>{selectedPurchase.status}</span></p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold text-text-primary mb-3">Individual Tickets</h4>
                  <div className="space-y-3">
                    {selectedPurchase.tickets.map((ticket, index) => (
                      <div key={ticket.id} className="p-3 bg-background-main rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">Ticket #{index + 1}</p>
                            <p className="text-sm text-text-tertiary">Number: {ticket.ticketNumber}</p>
                            {ticket.seatInfo && <p className="text-sm text-text-tertiary">Seat: {ticket.seatInfo}</p>}
                            {ticket.usedAt && (
                              <p className="text-sm text-green-600">
                                Used: {new Date(ticket.usedAt).toLocaleString()}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="w-16 h-16 bg-white border rounded flex items-center justify-center">
                              <QrCode className="h-8 w-8" />
                            </div>
                            <p className="text-xs text-text-tertiary mt-1">QR Code</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
                Close
              </Button>
              {selectedPurchase && (selectedPurchase.status === 'Active' || selectedPurchase.status === 'Used') && (
                <Button onClick={() => { downloadTicket(selectedPurchase); setIsDetailDialogOpen(false); }}>
                  <Download className="mr-2 h-4 w-4" />
                  Download Ticket
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default TicketHistoryPage; 