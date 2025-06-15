import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog";
import { ArrowLeft, RefreshCw, DollarSign, Search, Filter, CheckCircle, XCircle, Clock, User, Mail, Calendar } from 'lucide-react';

interface RefundRequest {
  id: string;
  orderNumber: string;
  attendeeName: string;
  attendeeEmail: string;
  ticketType: string;
  quantity: number;
  originalAmount: number;
  requestedAmount: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Processed';
  requestDate: string;
  processedDate?: string;
}

// Mock data for refund requests
const mockRefundRequests: RefundRequest[] = [
  {
    id: 'refund001',
    orderNumber: 'ORD-2025-001',
    attendeeName: 'Sarah Johnson',
    attendeeEmail: 'sarah.johnson@example.com',
    ticketType: 'VIP Ticket',
    quantity: 2,
    originalAmount: 240.00,
    requestedAmount: 240.00,
    reason: 'Unable to attend due to family emergency',
    status: 'Pending',
    requestDate: '2025-01-10'
  },
  {
    id: 'refund002',
    orderNumber: 'ORD-2025-003',
    attendeeName: 'Mike Rodriguez',
    attendeeEmail: 'mike.rodriguez@example.com',
    ticketType: 'General Admission',
    quantity: 1,
    originalAmount: 50.00,
    requestedAmount: 40.00, // Partial refund after fee
    reason: 'Event date conflicts with work schedule',
    status: 'Pending',
    requestDate: '2025-01-08'
  },
  {
    id: 'refund003',
    orderNumber: 'ORD-2025-007',
    attendeeName: 'Lisa Chen',
    attendeeEmail: 'lisa.chen@example.com',
    ticketType: 'Early Bird Special',
    quantity: 1,
    originalAmount: 40.00,
    requestedAmount: 40.00,
    reason: 'Medical issue preventing attendance',
    status: 'Approved',
    requestDate: '2025-01-05',
    processedDate: '2025-01-06'
  }
];

const EventRefundsPage = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [refundRequests, setRefundRequests] = useState<RefundRequest[]>(mockRefundRequests);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | RefundRequest['status']>('All');
  const [selectedRefund, setSelectedRefund] = useState<RefundRequest | null>(null);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');

  const filteredRequests = refundRequests.filter(request => {
    const matchesSearch = 
      request.attendeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.attendeeEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.orderNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || request.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleApproveRefund = (refundId: string) => {
    if (!selectedRefund || !refundAmount) {
      alert('Please enter a refund amount');
      return;
    }

    setRefundRequests(prev => 
      prev.map(request => 
        request.id === refundId 
          ? { 
              ...request, 
              status: 'Approved' as const,
              requestedAmount: parseFloat(refundAmount),
              processedDate: new Date().toISOString().split('T')[0]
            } 
          : request
      )
    );
    
    setSelectedRefund(null);
    setRefundAmount('');
    setRefundReason('');
    alert(`Refund approved for $${refundAmount}. (Mock action - payment gateway integration required)`);
  };

  const handleRejectRefund = (refundId: string) => {
    if (!selectedRefund || !refundReason.trim()) {
      alert('Please enter a reason for rejection');
      return;
    }

    setRefundRequests(prev => 
      prev.map(request => 
        request.id === refundId 
          ? { 
              ...request, 
              status: 'Rejected' as const,
              processedDate: new Date().toISOString().split('T')[0]
            } 
          : request
      )
    );
    
    setSelectedRefund(null);
    setRefundAmount('');
    setRefundReason('');
    alert(`Refund request rejected. Attendee will be notified. (Mock action)`);
  };

  const openRefundDialog = (request: RefundRequest) => {
    setSelectedRefund(request);
    setRefundAmount(request.requestedAmount.toString());
    setRefundReason('');
  };

  const getStatusBadgeVariant = (status: RefundRequest['status']) => {
    switch (status) {
      case 'Pending': return 'secondary';
      case 'Approved': return 'success';
      case 'Rejected': return 'destructive';
      case 'Processed': return 'success';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: RefundRequest['status']) => {
    switch (status) {
      case 'Pending': return <Clock className="h-3 w-3" />;
      case 'Approved': case 'Processed': return <CheckCircle className="h-3 w-3" />;
      case 'Rejected': return <XCircle className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  return (
    <div className="min-h-screen bg-background-main py-8 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <Button variant="outline" onClick={() => navigate(`/organizer/event/${eventId}/manage`)} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Manage Event
        </Button>

        <Card className="bg-surface-card mb-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-text-primary flex items-center">
              <RefreshCw className="mr-2 h-6 w-6 text-brand-primary" />
              Refunds & Cancellations
            </CardTitle>
            <CardDescription className="text-text-secondary">
              Manage refund requests and ticket cancellations for your event.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Filters and Search */}
        <Card className="bg-surface-card mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="search" className="text-sm font-medium">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-text-tertiary" />
                  <Input
                    id="search"
                    placeholder="Search by name, email, or order number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full md:w-48">
                <Label htmlFor="status-filter" className="text-sm font-medium">Filter by Status</Label>
                <div className="relative">
                  <Filter className="absolute left-3 top-3 h-4 w-4 text-text-tertiary" />
                  <select
                    id="status-filter"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                    className="w-full pl-10 pr-4 py-2 border border-border-default rounded-md bg-background-main text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Processed">Processed</option>
                  </select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Refund Requests List */}
        {filteredRequests.length === 0 ? (
          <Card className="bg-surface-card">
            <CardContent className="p-8 text-center text-text-secondary">
              <RefreshCw className="mx-auto h-12 w-12 mb-4 text-text-tertiary" />
              <p>No refund requests found.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <Card key={request.id} className="bg-surface-card border-border-default">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Badge variant={getStatusBadgeVariant(request.status)} className="flex items-center space-x-1">
                            {getStatusIcon(request.status)}
                            <span>{request.status}</span>
                          </Badge>
                          <span className="text-sm text-text-tertiary">Order: {request.orderNumber}</span>
                        </div>
                        <div className="text-lg font-semibold text-text-primary flex items-center">
                          <DollarSign className="h-4 w-4 mr-1" />
                          {request.requestedAmount.toFixed(2)}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-text-tertiary" />
                          <span className="font-medium">{request.attendeeName}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-text-tertiary" />
                          <span>{request.attendeeEmail}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-text-tertiary" />
                          <span>Requested: {request.requestDate}</span>
                        </div>
                        <div>
                          <span className="text-text-tertiary">Ticket: </span>
                          <span>{request.ticketType} (x{request.quantity})</span>
                        </div>
                      </div>

                      <div className="bg-background-main p-3 rounded-md">
                        <p className="text-sm text-text-secondary">
                          <span className="font-medium text-text-primary">Reason: </span>
                          {request.reason}
                        </p>
                      </div>
                    </div>

                    {request.status === 'Pending' && (
                      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 lg:ml-6">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              onClick={() => openRefundDialog(request)}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Approve
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Approve Refund Request</AlertDialogTitle>
                              <AlertDialogDescription>
                                Review and approve the refund for {selectedRefund?.attendeeName}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="refund-amount">Refund Amount</Label>
                                <Input
                                  id="refund-amount"
                                  type="number"
                                  step="0.01"
                                  value={refundAmount}
                                  onChange={(e) => setRefundAmount(e.target.value)}
                                  placeholder="Enter refund amount"
                                />
                              </div>
                            </div>
                            <AlertDialogFooter>
                              <AlertDialogCancel onClick={() => setSelectedRefund(null)}>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => selectedRefund && handleApproveRefund(selectedRefund.id)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Approve Refund
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              onClick={() => openRefundDialog(request)}
                              variant="destructive"
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Reject
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Reject Refund Request</AlertDialogTitle>
                              <AlertDialogDescription>
                                Provide a reason for rejecting {selectedRefund?.attendeeName}'s refund request
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="reject-reason">Reason for Rejection</Label>
                                <Textarea
                                  id="reject-reason"
                                  value={refundReason}
                                  onChange={(e) => setRefundReason(e.target.value)}
                                  placeholder="Explain why this refund request is being rejected..."
                                  rows={3}
                                />
                              </div>
                            </div>
                            <AlertDialogFooter>
                              <AlertDialogCancel onClick={() => setSelectedRefund(null)}>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => selectedRefund && handleRejectRefund(selectedRefund.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Reject Request
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventRefundsPage; 