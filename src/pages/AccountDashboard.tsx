import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { 
  User, 
  Ticket, 
  Calendar, 
  Clock, 
  MapPin, 
  QrCode, 
  Share, 
  Download, 
  CreditCard, 
  Eye, 
  EyeOff,
  CheckCircle,
  XCircle,
  AlertCircle,
  Wallet,
  Receipt,
  Gift,
  Settings,
  Bell,
  Heart,
  History,
  ChevronRight,
  Search,
  Filter,
  SortAsc,
  SortDesc
} from 'lucide-react';

interface TicketData {
  id: string;
  orderNumber: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  venue: string;
  ticketType: string;
  seatInfo: string;
  price: number;
  qrCode: string;
  status: 'upcoming' | 'past' | 'cancelled' | 'pending_payment';
  purchaseDate: string;
  attendeeName: string;
  specialRequests?: string;
  paymentStatus: 'completed' | 'pending' | 'failed' | 'refunded';
  verificationCode?: string;
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'cash_app';
  lastFour?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  email?: string;
  username?: string;
  isDefault: boolean;
}

interface PendingPayment {
  id: string;
  orderNumber: string;
  eventTitle: string;
  amount: number;
  dueDate: string;
  verificationCode: string;
  instructions: string;
}

const AccountDashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showVerificationCode, setShowVerificationCode] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  // Mock data - in real implementation, this would come from API
  const mockTickets: TicketData[] = [
    {
      id: 'TKT001',
      orderNumber: 'SL12345678',
      eventTitle: 'Chicago Stepping Championship',
      eventDate: '2024-12-15',
      eventTime: '7:00 PM',
      venue: 'Navy Pier Grand Ballroom',
      ticketType: 'VIP Experience',
      seatInfo: 'Section A, Table 5',
      price: 85,
      qrCode: 'QR_CODE_DATA_001',
      status: 'upcoming',
      purchaseDate: '2024-11-20',
      attendeeName: `${user?.user_metadata?.first_name || 'John'} ${user?.user_metadata?.last_name || 'Doe'}`,
      specialRequests: 'Vegetarian meal',
      paymentStatus: 'completed'
    },
    {
      id: 'TKT002',
      orderNumber: 'SL12345679',
      eventTitle: 'New Year\'s Eve Stepping Gala',
      eventDate: '2024-12-31',
      eventTime: '8:00 PM',
      venue: 'Palmer House Hilton',
      ticketType: 'General Admission',
      seatInfo: 'Floor Seating',
      price: 65,
      qrCode: '',
      status: 'pending_payment',
      purchaseDate: '2024-11-22',
      attendeeName: `${user?.user_metadata?.first_name || 'John'} ${user?.user_metadata?.last_name || 'Doe'}`,
      paymentStatus: 'pending',
      verificationCode: '48291'
    },
    {
      id: 'TKT003',
      orderNumber: 'SL12345677',
      eventTitle: 'Halloween Stepping Social',
      eventDate: '2024-10-31',
      eventTime: '7:30 PM',
      venue: 'South Side Cultural Center',
      ticketType: 'General Admission',
      seatInfo: 'General Admission',
      price: 35,
      qrCode: 'QR_CODE_DATA_003',
      status: 'past',
      purchaseDate: '2024-10-15',
      attendeeName: `${user?.user_metadata?.first_name || 'John'} ${user?.user_metadata?.last_name || 'Doe'}`,
      paymentStatus: 'completed'
    }
  ];

  const mockPaymentMethods: PaymentMethod[] = [
    {
      id: 'pm_1',
      type: 'card',
      brand: 'visa',
      lastFour: '4242',
      expiryMonth: 12,
      expiryYear: 2025,
      isDefault: true
    },
    {
      id: 'pm_2',
      type: 'paypal',
      email: 'user@example.com',
      isDefault: false
    },
    {
      id: 'pm_3',
      type: 'cash_app',
      username: '$johndoe',
      isDefault: false
    }
  ];

  const mockPendingPayments: PendingPayment[] = [
    {
      id: 'pending_1',
      orderNumber: 'SL12345679',
      eventTitle: 'New Year\'s Eve Stepping Gala',
      amount: 65,
      dueDate: '2024-12-01',
      verificationCode: '48291',
      instructions: 'Complete payment via Cash App to $SteppersLife, then enter the 5-digit verification code below.'
    }
  ];

  // Filter and sort tickets
  const filteredTickets = mockTickets
    .filter(ticket => {
      const matchesSearch = ticket.eventTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           ticket.venue.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === 'all' || ticket.status === filterStatus;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      const dateA = new Date(a.eventDate);
      const dateB = new Date(b.eventDate);
      return sortOrder === 'asc' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
    });

  const upcomingTickets = filteredTickets.filter(ticket => ticket.status === 'upcoming');
  const pendingPaymentTickets = filteredTickets.filter(ticket => ticket.status === 'pending_payment');
  const pastTickets = filteredTickets.filter(ticket => ticket.status === 'past');

  const getStatusBadge = (status: string, paymentStatus: string) => {
    if (status === 'pending_payment') {
      return <Badge variant="destructive">Payment Required</Badge>;
    }
    if (status === 'upcoming' && paymentStatus === 'completed') {
      return <Badge variant="default" className="bg-green-600">Confirmed</Badge>;
    }
    if (status === 'past') {
      return <Badge variant="outline">Attended</Badge>;
    }
    if (status === 'cancelled') {
      return <Badge variant="destructive">Cancelled</Badge>;
    }
    return <Badge variant="secondary">{status}</Badge>;
  };

  const handleViewQR = (ticket: TicketData) => {
    if (!ticket.qrCode) {
      toast.error('QR code not available - complete payment first');
      return;
    }
    toast.info('QR Code viewer would open here');
  };

  const handleShareTicket = (ticket: TicketData) => {
    if (navigator.share) {
      navigator.share({
        title: `My ticket for ${ticket.eventTitle}`,
        text: `I'll be attending ${ticket.eventTitle} on ${ticket.eventDate}`,
        url: window.location.origin
      });
    } else {
      toast.success('Ticket details copied to clipboard!');
    }
  };

  const handleVerifyPayment = (ticketId: string, code: string) => {
    toast.success('Payment verified successfully! Your ticket is now active.');
  };

  const handleDownloadReceipt = (ticket: TicketData) => {
    toast.info('Receipt download would start here');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-stepping-purple border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2">Account Dashboard</h1>
              <p className="text-muted-foreground">
                Manage your tickets, payments, and account preferences
              </p>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline">
                <Link to="/profile">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Link>
              </Button>
              <Button asChild>
                <Link to="/events">
                  <Calendar className="h-4 w-4 mr-2" />
                  Browse Events
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-stepping-gradient rounded-lg">
                  <Ticket className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{upcomingTickets.length}</p>
                  <p className="text-sm text-muted-foreground">Upcoming Events</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-500 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{pendingPaymentTickets.length}</p>
                  <p className="text-sm text-muted-foreground">Pending Payments</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{pastTickets.length}</p>
                  <p className="text-sm text-muted-foreground">Events Attended</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500 rounded-lg">
                  <Wallet className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    ${mockTickets.reduce((sum, ticket) => sum + ticket.price, 0)}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Spent</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="tickets" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="tickets" className="flex items-center gap-2">
              <Ticket className="h-4 w-4" />
              My Tickets
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Payments
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tickets" className="mt-0">
            <div className="space-y-6">
              {/* Search and Filter Controls */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search events or venues..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-3 py-2 border rounded-md text-sm"
                      >
                        <option value="all">All Tickets</option>
                        <option value="upcoming">Upcoming</option>
                        <option value="pending_payment">Pending Payment</option>
                        <option value="past">Past Events</option>
                      </select>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                      >
                        {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Pending Payments Alert */}
              {pendingPaymentTickets.length > 0 && (
                <Card className="border-orange-200 bg-orange-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-orange-800">
                      <AlertCircle className="h-5 w-5" />
                      Payment Required
                    </CardTitle>
                    <CardDescription className="text-orange-700">
                      You have {pendingPaymentTickets.length} ticket(s) requiring payment completion
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockPendingPayments.map((payment) => (
                        <div key={payment.id} className="bg-white p-4 rounded-lg border">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-semibold">{payment.eventTitle}</h4>
                              <p className="text-sm text-muted-foreground">
                                Order #{payment.orderNumber} • ${payment.amount}
                              </p>
                              <p className="text-sm text-orange-600 font-medium">
                                Due: {new Date(payment.dueDate).toLocaleDateString()}
                              </p>
                            </div>
                            <Badge variant="destructive">Payment Required</Badge>
                          </div>
                          
                          <div className="bg-gray-50 p-3 rounded mb-4">
                            <p className="text-sm mb-2">{payment.instructions}</p>
                            <div className="flex items-center gap-2">
                              <Label htmlFor={`code-${payment.id}`} className="text-sm font-medium">
                                Verification Code:
                              </Label>
                              <Input
                                id={`code-${payment.id}`}
                                placeholder="Enter 5-digit code"
                                className="w-32"
                                maxLength={5}
                              />
                              <Button size="sm" onClick={() => handleVerifyPayment(payment.id, '')}>
                                Verify
                              </Button>
                            </div>
                            <div className="mt-2 flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">
                                Your code: 
                              </span>
                              <button
                                onClick={() => setShowVerificationCode(
                                  showVerificationCode === payment.id ? null : payment.id
                                )}
                                className="text-xs text-stepping-purple hover:underline flex items-center gap-1"
                              >
                                {showVerificationCode === payment.id ? (
                                  <>
                                    <EyeOff className="h-3 w-3" />
                                    Hide
                                  </>
                                ) : (
                                  <>
                                    <Eye className="h-3 w-3" />
                                    Show
                                  </>
                                )}
                              </button>
                              {showVerificationCode === payment.id && (
                                <span className="text-xs font-mono font-bold bg-yellow-100 px-2 py-1 rounded">
                                  {payment.verificationCode}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Tickets Display */}
              {filteredTickets.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Ticket className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Tickets Found</h3>
                    <p className="text-muted-foreground mb-4">
                      {searchTerm || filterStatus !== 'all' 
                        ? 'No tickets match your current search or filter criteria.'
                        : 'You don\'t have any tickets yet.'
                      }
                    </p>
                    <Button asChild>
                      <Link to="/events">Browse Events</Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredTickets.map((ticket) => (
                    <Card key={ticket.id} className="overflow-hidden">
                      <CardHeader className={`${
                        ticket.status === 'upcoming' && ticket.paymentStatus === 'completed'
                          ? 'bg-stepping-gradient text-white'
                          : ticket.status === 'pending_payment'
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-100'
                      }`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{ticket.eventTitle}</CardTitle>
                            <CardDescription className={`${
                              ticket.status === 'upcoming' || ticket.status === 'pending_payment'
                                ? 'text-white/80'
                                : 'text-gray-600'
                            }`}>
                              {ticket.ticketType} • ${ticket.price}
                            </CardDescription>
                          </div>
                          <div className="flex flex-col gap-2 items-end">
                            {getStatusBadge(ticket.status, ticket.paymentStatus)}
                            <Badge variant="secondary" className="bg-white/20 text-current">
                              #{ticket.id}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="p-6">
                        <div className="space-y-4">
                          {/* Event Details */}
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>{new Date(ticket.eventDate).toLocaleDateString('en-US', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>{ticket.eventTime}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span>{ticket.venue}</span>
                            </div>
                          </div>

                          <Separator />

                          {/* Ticket Info */}
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Seat/Table:</span>
                              <span className="font-medium">{ticket.seatInfo}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Attendee:</span>
                              <span className="font-medium">{ticket.attendeeName}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Order:</span>
                              <span className="font-medium">#{ticket.orderNumber}</span>
                            </div>
                            {ticket.specialRequests && (
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Special Requests:</span>
                                <span className="font-medium">{ticket.specialRequests}</span>
                              </div>
                            )}
                          </div>

                          {/* QR Code Section (only for confirmed tickets) */}
                          {ticket.status === 'upcoming' && ticket.paymentStatus === 'completed' && (
                            <>
                              <Separator />
                              <div className="text-center py-4">
                                <div className="w-24 h-24 bg-muted rounded-lg flex items-center justify-center mx-auto mb-3">
                                  <QrCode className="h-12 w-12 text-muted-foreground" />
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  Show this QR code at the event entrance
                                </p>
                              </div>
                            </>
                          )}

                          {/* Actions */}
                          <div className="flex gap-2">
                            {ticket.status === 'upcoming' && ticket.paymentStatus === 'completed' && (
                              <>
                                <Button 
                                  size="sm" 
                                  className="flex-1"
                                  onClick={() => handleViewQR(ticket)}
                                >
                                  <QrCode className="h-4 w-4 mr-2" />
                                  View QR
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleShareTicket(ticket)}
                                >
                                  <Share className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            
                            {ticket.status === 'past' && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="flex-1"
                                onClick={() => handleDownloadReceipt(ticket)}
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Download Receipt
                              </Button>
                            )}

                            {ticket.status === 'pending_payment' && (
                              <Button 
                                size="sm" 
                                className="flex-1 bg-orange-500 hover:bg-orange-600"
                                onClick={() => toast.info('Redirecting to payment completion...')}
                              >
                                <CreditCard className="h-4 w-4 mr-2" />
                                Complete Payment
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="payments" className="mt-0">
            <div className="space-y-6">
              {/* Saved Payment Methods */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Saved Payment Methods
                  </CardTitle>
                  <CardDescription>
                    Manage your saved payment methods for faster checkout
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockPaymentMethods.map((method) => (
                    <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-muted rounded">
                          {method.type === 'card' && <CreditCard className="h-4 w-4" />}
                          {method.type === 'paypal' && <Wallet className="h-4 w-4" />}
                          {method.type === 'cash_app' && <Wallet className="h-4 w-4" />}
                        </div>
                        <div>
                          <p className="font-medium">
                            {method.type === 'card' && `${method.brand?.toUpperCase()} •••• ${method.lastFour}`}
                            {method.type === 'paypal' && `PayPal (${method.email})`}
                            {method.type === 'cash_app' && `Cash App (${method.username})`}
                          </p>
                          {method.type === 'card' && (
                            <p className="text-sm text-muted-foreground">
                              Expires {method.expiryMonth?.toString().padStart(2, '0')}/{method.expiryYear}
                            </p>
                          )}
                          {method.isDefault && (
                            <Badge variant="secondary" className="text-xs mt-1">Default</Badge>
                          )}
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full">
                    Add New Payment Method
                  </Button>
                </CardContent>
              </Card>

              {/* Payment History */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5" />
                    Payment History
                  </CardTitle>
                  <CardDescription>
                    View your recent transaction history
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockTickets.map((ticket) => (
                      <div key={ticket.id} className="flex items-center justify-between py-3 border-b last:border-b-0">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-muted rounded">
                            <Receipt className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium">{ticket.eventTitle}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(ticket.purchaseDate).toLocaleDateString()} • Order #{ticket.orderNumber}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${ticket.price}</p>
                          <Badge 
                            variant={ticket.paymentStatus === 'completed' ? 'default' : 'destructive'}
                            className="text-xs"
                          >
                            {ticket.paymentStatus === 'completed' ? 'Paid' : 'Pending'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="profile" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Quick Profile Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Profile Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-stepping-gradient rounded-full flex items-center justify-center text-white font-bold text-xl">
                      {user?.user_metadata?.first_name?.[0] || 'U'}
                    </div>
                    <div>
                      <h3 className="font-semibold">
                        {user?.user_metadata?.first_name} {user?.user_metadata?.last_name}
                      </h3>
                      <p className="text-sm text-muted-foreground">{user?.email}</p>
                    </div>
                  </div>
                  <Button asChild className="w-full">
                    <Link to="/profile">
                      Edit Full Profile
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link to="/notifications">
                      <Bell className="h-4 w-4 mr-2" />
                      Notification Settings
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link to="/following">
                      <Heart className="h-4 w-4 mr-2" />
                      Following & Wishlist
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link to="/profile">
                      <Settings className="h-4 w-4 mr-2" />
                      Account Settings
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AccountDashboard;