import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRoles } from '@/hooks/useRoles';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  DollarSign, 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  ArrowLeft,
  MoreHorizontal,
  Download,
  Users,
  Clock,
  MessageSquare,
  RefreshCw
} from 'lucide-react';

interface RefundRequest {
  id: string;
  ticket_id: string;
  user_id: string;
  event_id: string;
  amount: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'processed';
  requested_at: string;
  processed_at?: string;
  processed_by?: string;
  admin_notes?: string;
  user_name: string;
  user_email: string;
  event_title: string;
  payment_method: 'stripe' | 'cash' | 'paypal';
  original_purchase_date: string;
}

interface RefundStats {
  total_requests: number;
  pending_requests: number;
  approved_requests: number;
  rejected_requests: number;
  total_amount_requested: number;
  total_amount_approved: number;
}

export default function EventRefundsPage() {
  const { user } = useAuth();
  const { hasRole } = useRoles();
  const [refunds, setRefunds] = useState<RefundRequest[]>([]);
  const [stats, setStats] = useState<RefundStats>({
    total_requests: 0,
    pending_requests: 0,
    approved_requests: 0,
    rejected_requests: 0,
    total_amount_requested: 0,
    total_amount_approved: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [selectedRefunds, setSelectedRefunds] = useState<string[]>([]);
  const [selectedRefund, setSelectedRefund] = useState<RefundRequest | null>(null);
  const [showProcessDialog, setShowProcessDialog] = useState(false);
  const [processingAction, setProcessingAction] = useState<'approve' | 'reject'>('approve');
  const [adminNotes, setAdminNotes] = useState('');
  const [loading, setLoading] = useState(true);

  // Mock data for development
  useEffect(() => {
    const mockRefunds: RefundRequest[] = [
      {
        id: 'ref_001',
        ticket_id: 'tkt_001',
        user_id: 'usr_001',
        event_id: 'evt_001',
        amount: 45.00,
        reason: 'Unable to attend due to illness',
        status: 'pending',
        requested_at: '2024-06-18T10:30:00Z',
        user_name: 'Sarah Johnson',
        user_email: 'sarah.johnson@email.com',
        event_title: 'Beginner Salsa Class',
        payment_method: 'stripe',
        original_purchase_date: '2024-06-15T14:20:00Z'
      },
      {
        id: 'ref_002',
        ticket_id: 'tkt_002',
        user_id: 'usr_002',
        event_id: 'evt_002',
        amount: 65.00,
        reason: 'Event was cancelled by organizer',
        status: 'approved',
        requested_at: '2024-06-17T15:45:00Z',
        processed_at: '2024-06-17T16:00:00Z',
        processed_by: 'admin_001',
        admin_notes: 'Automatic approval for organizer cancellation',
        user_name: 'Mike Rodriguez',
        user_email: 'mike.rodriguez@email.com',
        event_title: 'Advanced Bachata Workshop',
        payment_method: 'stripe',
        original_purchase_date: '2024-06-10T09:15:00Z'
      },
      {
        id: 'ref_003',
        ticket_id: 'tkt_003',
        user_id: 'usr_003',
        event_id: 'evt_003',
        amount: 35.00,
        reason: 'Changed my mind',
        status: 'rejected',
        requested_at: '2024-06-16T11:20:00Z',
        processed_at: '2024-06-16T14:30:00Z',
        processed_by: 'admin_001',
        admin_notes: 'Refund requested after 24-hour policy deadline',
        user_name: 'Emma Wilson',
        user_email: 'emma.wilson@email.com',
        event_title: 'Merengue Fundamentals',
        payment_method: 'cash',
        original_purchase_date: '2024-06-14T16:45:00Z'
      },
      {
        id: 'ref_004',
        ticket_id: 'tkt_004',
        user_id: 'usr_004',
        event_id: 'evt_004',
        amount: 85.00,
        reason: 'Family emergency - need to travel',
        status: 'pending',
        requested_at: '2024-06-18T08:15:00Z',
        user_name: 'Carlos Martinez',
        user_email: 'carlos.martinez@email.com',
        event_title: 'Latin Dance Intensive Weekend',
        payment_method: 'stripe',
        original_purchase_date: '2024-06-12T19:30:00Z'
      }
    ];

    const mockStats: RefundStats = {
      total_requests: 4,
      pending_requests: 2,
      approved_requests: 1,
      rejected_requests: 1,
      total_amount_requested: 230.00,
      total_amount_approved: 65.00
    };

    setRefunds(mockRefunds);
    setStats(mockStats);
    setLoading(false);
  }, []);

  const filteredRefunds = refunds.filter(refund => {
    const matchesSearch = refund.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         refund.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         refund.event_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         refund.reason.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || refund.status === statusFilter;
    
    const matchesDate = dateFilter === 'all' || (() => {
      const requestDate = new Date(refund.requested_at);
      const today = new Date();
      const daysDiff = Math.floor((today.getTime() - requestDate.getTime()) / (1000 * 60 * 60 * 24));
      
      switch (dateFilter) {
        case 'today': return daysDiff === 0;
        case 'week': return daysDiff <= 7;
        case 'month': return daysDiff <= 30;
        default: return true;
      }
    })();

    return matchesSearch && matchesStatus && matchesDate;
  });

  const handleProcessRefund = async (action: 'approve' | 'reject') => {
    if (!selectedRefund) return;

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedRefunds = refunds.map(refund => 
        refund.id === selectedRefund.id 
          ? {
              ...refund,
              status: action === 'approve' ? 'approved' as const : 'rejected' as const,
              processed_at: new Date().toISOString(),
              processed_by: user?.id || 'current_admin',
              admin_notes: adminNotes
            }
          : refund
      );
      
      setRefunds(updatedRefunds);
      
      // Update stats
      setStats(prev => ({
        ...prev,
        pending_requests: prev.pending_requests - 1,
        approved_requests: action === 'approve' ? prev.approved_requests + 1 : prev.approved_requests,
        rejected_requests: action === 'reject' ? prev.rejected_requests + 1 : prev.rejected_requests,
        total_amount_approved: action === 'approve' ? prev.total_amount_approved + selectedRefund.amount : prev.total_amount_approved
      }));

      setShowProcessDialog(false);
      setSelectedRefund(null);
      setAdminNotes('');
    } catch (error) {
      console.error('Failed to process refund:', error);
    }
  };

  const handleBulkAction = async (action: 'approve' | 'reject') => {
    if (selectedRefunds.length === 0) return;

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const updatedRefunds = refunds.map(refund => 
        selectedRefunds.includes(refund.id) && refund.status === 'pending'
          ? {
              ...refund,
              status: action === 'approve' ? 'approved' as const : 'rejected' as const,
              processed_at: new Date().toISOString(),
              processed_by: user?.id || 'current_admin',
              admin_notes: `Bulk ${action} operation`
            }
          : refund
      );
      
      setRefunds(updatedRefunds);
      setSelectedRefunds([]);
    } catch (error) {
      console.error('Failed to perform bulk action:', error);
    }
  };

  const getStatusBadge = (status: RefundRequest['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      case 'processed':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200"><RefreshCw className="w-3 h-3 mr-1" />Processed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getPaymentMethodBadge = (method: RefundRequest['payment_method']) => {
    switch (method) {
      case 'stripe':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Stripe</Badge>;
      case 'cash':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Cash</Badge>;
      case 'paypal':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">PayPal</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (!hasRole('admin') && !hasRole('organizer')) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-gray-600">You don't have permission to access refund management.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold">Refund Management</h1>
          <p className="text-gray-600 mt-1">Process refund requests and manage cancellations</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          {selectedRefunds.length > 0 && (
            <div className="flex gap-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-green-600 border-green-200">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Bulk Approve ({selectedRefunds.length})
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Bulk Approve Refunds</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to approve {selectedRefunds.length} refund requests? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleBulkAction('approve')}>
                      Approve All
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-red-600 border-red-200">
                    <XCircle className="w-4 h-4 mr-2" />
                    Bulk Reject ({selectedRefunds.length})
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Bulk Reject Refunds</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to reject {selectedRefunds.length} refund requests? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleBulkAction('reject')}>
                      Reject All
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold">{stats.total_requests}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending_requests}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Amount Requested</p>
                <p className="text-2xl font-bold">${stats.total_amount_requested.toFixed(2)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Amount Approved</p>
                <p className="text-2xl font-bold text-green-600">${stats.total_amount_approved.toFixed(2)}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
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
                  placeholder="Search by name, email, event, or reason..."
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
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="processed">Processed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Refunds Table */}
      <Card>
        <CardHeader>
          <CardTitle>Refund Requests ({filteredRefunds.length})</CardTitle>
          <CardDescription>
            Manage and process refund requests from event attendees
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={filteredRefunds.length > 0 && selectedRefunds.length === filteredRefunds.filter(r => r.status === 'pending').length}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedRefunds(filteredRefunds.filter(r => r.status === 'pending').map(r => r.id));
                      } else {
                        setSelectedRefunds([]);
                      }
                    }}
                  />
                </TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Event</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Requested</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRefunds.map((refund) => (
                <TableRow key={refund.id}>
                  <TableCell>
                    {refund.status === 'pending' && (
                      <Checkbox
                        checked={selectedRefunds.includes(refund.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedRefunds([...selectedRefunds, refund.id]);
                          } else {
                            setSelectedRefunds(selectedRefunds.filter(id => id !== refund.id));
                          }
                        }}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{refund.user_name}</p>
                      <p className="text-sm text-gray-600">{refund.user_email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{refund.event_title}</p>
                      <p className="text-sm text-gray-600">
                        Purchased: {new Date(refund.original_purchase_date).toLocaleDateString()}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">${refund.amount.toFixed(2)}</span>
                  </TableCell>
                  <TableCell>
                    {getPaymentMethodBadge(refund.payment_method)}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(refund.status)}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm">{new Date(refund.requested_at).toLocaleDateString()}</p>
                      <p className="text-xs text-gray-600">{new Date(refund.requested_at).toLocaleTimeString()}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Refund Request Details</DialogTitle>
                            <DialogDescription>
                              Complete information for refund request
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label className="text-sm font-medium">Customer</Label>
                              <p className="text-sm">{refund.user_name} ({refund.user_email})</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Event</Label>
                              <p className="text-sm">{refund.event_title}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Refund Amount</Label>
                              <p className="text-sm font-medium">${refund.amount.toFixed(2)}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Reason</Label>
                              <p className="text-sm bg-gray-50 p-2 rounded">{refund.reason}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Status</Label>
                              <div className="mt-1">{getStatusBadge(refund.status)}</div>
                            </div>
                            {refund.admin_notes && (
                              <div>
                                <Label className="text-sm font-medium">Admin Notes</Label>
                                <p className="text-sm bg-blue-50 p-2 rounded">{refund.admin_notes}</p>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      {refund.status === 'pending' && (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-green-600 border-green-200"
                            onClick={() => {
                              setSelectedRefund(refund);
                              setProcessingAction('approve');
                              setShowProcessDialog(true);
                            }}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-red-600 border-red-200"
                            onClick={() => {
                              setSelectedRefund(refund);
                              setProcessingAction('reject');
                              setShowProcessDialog(true);
                            }}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredRefunds.length === 0 && (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No refund requests found</h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== 'all' || dateFilter !== 'all'
                  ? 'Try adjusting your filters to see more results.'
                  : 'No refund requests have been submitted yet.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Process Refund Dialog */}
      <Dialog open={showProcessDialog} onOpenChange={setShowProcessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {processingAction === 'approve' ? 'Approve' : 'Reject'} Refund Request
            </DialogTitle>
            <DialogDescription>
              {processingAction === 'approve' 
                ? 'Approve this refund request and process the payment.'
                : 'Reject this refund request with a reason.'}
            </DialogDescription>
          </DialogHeader>
          
          {selectedRefund && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Refund Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Customer:</span>
                    <p className="font-medium">{selectedRefund.user_name}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Amount:</span>
                    <p className="font-medium">${selectedRefund.amount.toFixed(2)}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-600">Event:</span>
                    <p className="font-medium">{selectedRefund.event_title}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-600">Reason:</span>
                    <p className="bg-white p-2 rounded border text-sm">{selectedRefund.reason}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <Label htmlFor="adminNotes" className="text-sm font-medium">
                  Admin Notes {processingAction === 'reject' ? '(Required)' : '(Optional)'}
                </Label>
                <Textarea
                  id="adminNotes"
                  placeholder={
                    processingAction === 'approve' 
                      ? 'Add any notes about this approval...'
                      : 'Please provide a reason for rejecting this refund...'
                  }
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="mt-1"
                  rows={3}
                />
              </div>
              
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowProcessDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => handleProcessRefund(processingAction)}
                  className={processingAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
                  disabled={processingAction === 'reject' && !adminNotes.trim()}
                >
                  {processingAction === 'approve' ? 'Approve Refund' : 'Reject Refund'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}