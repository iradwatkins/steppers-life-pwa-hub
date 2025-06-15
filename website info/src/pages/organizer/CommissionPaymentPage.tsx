import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
  DollarSign,
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  Eye,
  Edit,
  FileText,
  Send,
  ArrowLeft,
  Filter,
  Calendar,
  CreditCard,
  AlertCircle,
  TrendingUp,
  MoreHorizontal,
  Search
} from 'lucide-react';
import { useCommissionPayments } from '../../hooks/useCommissionPayments';
import { CommissionPayment, CommissionDispute } from '../../services/commissionPaymentService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { toast } from '../../hooks/use-toast';

const CommissionPaymentPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const organizerId = 'org_1'; // In real app, get from auth context

  const {
    payments,
    summary,
    configuration,
    isLoading,
    markPaymentAsPaid,
    createDispute,
    resolveDispute,
    createPayoutBatch,
    exportPayments,
    updateConfiguration,
    setFilters,
    clearFilters,
    getPaymentsByStatus,
    getDisputedPayments,
    getPendingAmount,
    refreshData
  } = useCommissionPayments(organizerId);

  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);
  const [showMarkPaidDialog, setShowMarkPaidDialog] = useState(false);
  const [showDisputeDialog, setShowDisputeDialog] = useState(false);
  const [showBatchDialog, setShowBatchDialog] = useState(false);
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [currentPayment, setCurrentPayment] = useState<CommissionPayment | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Form states
  const [markPaidForm, setMarkPaidForm] = useState({
    paymentMethod: 'manual' as CommissionPayment['paymentMethod'],
    paymentReference: '',
    notes: ''
  });

  const [disputeForm, setDisputeForm] = useState({
    disputeType: 'incorrect_amount' as CommissionDispute['disputeType'],
    description: '',
    supportingDocuments: [] as string[]
  });

  const [batchForm, setBatchForm] = useState({
    paymentMethod: 'bank_transfer' as 'bank_transfer' | 'paypal' | 'manual'
  });

  const handleMarkPaid = async () => {
    if (!currentPayment) return;

    try {
      await markPaymentAsPaid(currentPayment.id, {
        ...markPaidForm,
        processedBy: 'admin_user' // In real app, get from auth context
      });
      
      setShowMarkPaidDialog(false);
      setCurrentPayment(null);
      setMarkPaidForm({
        paymentMethod: 'manual',
        paymentReference: '',
        notes: ''
      });
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleCreateDispute = async () => {
    if (!currentPayment) return;

    try {
      await createDispute(currentPayment.id, {
        ...disputeForm,
        submittedBy: 'agent_user' // In real app, get from auth context
      });
      
      setShowDisputeDialog(false);
      setCurrentPayment(null);
      setDisputeForm({
        disputeType: 'incorrect_amount',
        description: '',
        supportingDocuments: []
      });
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleCreateBatch = async () => {
    if (selectedPayments.length === 0) {
      toast({ title: "Error", description: "Please select payments to batch", variant: "destructive" });
      return;
    }

    try {
      await createPayoutBatch(selectedPayments, {
        ...batchForm,
        processedBy: 'admin_user' // In real app, get from auth context
      });
      
      setShowBatchDialog(false);
      setSelectedPayments([]);
      setBatchForm({ paymentMethod: 'bank_transfer' });
    } catch (error) {
      // Error handled by hook
    }
  };

  const handlePaymentSelection = (paymentId: string, selected: boolean) => {
    if (selected) {
      setSelectedPayments(prev => [...prev, paymentId]);
    } else {
      setSelectedPayments(prev => prev.filter(id => id !== paymentId));
    }
  };

  const getStatusColor = (status: CommissionPayment['status']) => {
    switch (status) {
      case 'paid': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'processing': return 'bg-blue-500';
      case 'disputed': return 'bg-red-500';
      case 'cancelled': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: CommissionPayment['status']) => {
    switch (status) {
      case 'paid': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'processing': return <TrendingUp className="w-4 h-4" />;
      case 'disputed': return <AlertTriangle className="w-4 h-4" />;
      case 'cancelled': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
    const matchesSearch = searchTerm === '' || 
      payment.agentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.eventTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  const pendingPayments = getPaymentsByStatus('pending');
  const disputedPayments = getDisputedPayments();

  if (isLoading && payments.length === 0) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Commission Payments</h1>
            <p className="text-gray-600">Manage sales agent commission payments and payouts</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => exportPayments('csv')}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={() => setShowConfigDialog(true)}>
            <CreditCard className="w-4 h-4 mr-2" />
            Payment Config
          </Button>
          <Button onClick={refreshData}>
            <TrendingUp className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(summary.totalPending)}</div>
              <p className="text-xs text-muted-foreground">
                {summary.pendingCount} payments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(summary.totalPaid)}</div>
              <p className="text-xs text-muted-foreground">
                {summary.paidCount} payments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Disputed</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(summary.totalDisputed)}</div>
              <p className="text-xs text-muted-foreground">
                {summary.disputedCount} payments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Commission</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(summary.averageCommission)}</div>
              <p className="text-xs text-muted-foreground">
                Per payment
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Payment Management</CardTitle>
              <CardDescription>Track and process commission payments</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              {selectedPayments.length > 0 && (
                <Button onClick={() => setShowBatchDialog(true)}>
                  <Send className="w-4 h-4 mr-2" />
                  Create Batch ({selectedPayments.length})
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by agent, event, or payment ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="disputed">Disputed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Payments List */}
          <div className="space-y-4">
            {filteredPayments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No payments found</h3>
                <p className="text-sm">Try adjusting your filters or search terms</p>
              </div>
            ) : (
              filteredPayments.map((payment) => (
                <Card key={payment.id} className="transition-all hover:shadow-md">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <input
                          type="checkbox"
                          checked={selectedPayments.includes(payment.id)}
                          onChange={(e) => handlePaymentSelection(payment.id, e.target.checked)}
                          className="rounded border-gray-300"
                        />
                        
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-medium">{payment.agentName}</h3>
                            <Badge className={`${getStatusColor(payment.status)} text-white`}>
                              <div className="flex items-center space-x-1">
                                {getStatusIcon(payment.status)}
                                <span>{payment.status}</span>
                              </div>
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600">
                            {payment.eventTitle} • {payment.salesCount} sales • Period: {formatDate(payment.periodStart)} - {formatDate(payment.periodEnd)}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Payment ID: {payment.id}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-6">
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(payment.netAmount)}</div>
                          <div className="text-sm text-gray-500">
                            Commission: {formatCurrency(payment.commissionAmount)}
                          </div>
                          <div className="text-xs text-gray-500">
                            Tax: {formatCurrency(payment.taxAmount)}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          {payment.status === 'pending' && (
                            <Button
                              size="sm"
                              onClick={() => {
                                setCurrentPayment(payment);
                                setShowMarkPaidDialog(true);
                              }}
                            >
                              Mark Paid
                            </Button>
                          )}
                          
                          {payment.status !== 'disputed' && payment.status !== 'paid' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setCurrentPayment(payment);
                                setShowDisputeDialog(true);
                              }}
                            >
                              Dispute
                            </Button>
                          )}

                          <Button size="sm" variant="ghost">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Payment Details */}
                    {payment.paymentDate && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span>Paid on {formatDate(payment.paymentDate)} via {payment.paymentMethod}</span>
                          {payment.paymentReference && (
                            <span>Ref: {payment.paymentReference}</span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Disputes */}
                    {payment.disputes && payment.disputes.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="text-sm">
                          <div className="flex items-center text-red-600 mb-2">
                            <AlertTriangle className="w-4 h-4 mr-1" />
                            <span className="font-medium">Disputed</span>
                          </div>
                          {payment.disputes.map((dispute) => (
                            <div key={dispute.id} className="text-gray-600">
                              <div>{dispute.description}</div>
                              <div className="text-xs text-gray-500">
                                {dispute.disputeType} • {formatDate(dispute.submittedDate)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Mark Paid Dialog */}
      <Dialog open={showMarkPaidDialog} onOpenChange={setShowMarkPaidDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark Payment as Paid</DialogTitle>
            <DialogDescription>
              Record payment details for {currentPayment?.agentName} - {formatCurrency(currentPayment?.netAmount || 0)}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select 
                value={markPaidForm.paymentMethod} 
                onValueChange={(value) => setMarkPaidForm(prev => ({ ...prev, paymentMethod: value as CommissionPayment['paymentMethod'] }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                  <SelectItem value="check">Check</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Payment Reference</Label>
              <Input
                value={markPaidForm.paymentReference}
                onChange={(e) => setMarkPaidForm(prev => ({ ...prev, paymentReference: e.target.value }))}
                placeholder="Transaction ID, check number, etc."
              />
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={markPaidForm.notes}
                onChange={(e) => setMarkPaidForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes about this payment..."
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setShowMarkPaidDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleMarkPaid}>
              Mark as Paid
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Dispute Dialog */}
      <Dialog open={showDisputeDialog} onOpenChange={setShowDisputeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Dispute</DialogTitle>
            <DialogDescription>
              Submit a dispute for payment {currentPayment?.id}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Dispute Type</Label>
              <Select 
                value={disputeForm.disputeType} 
                onValueChange={(value) => setDisputeForm(prev => ({ ...prev, disputeType: value as CommissionDispute['disputeType'] }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="incorrect_amount">Incorrect Amount</SelectItem>
                  <SelectItem value="missing_sales">Missing Sales</SelectItem>
                  <SelectItem value="duplicate_payment">Duplicate Payment</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={disputeForm.description}
                onChange={(e) => setDisputeForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Detailed description of the dispute..."
                rows={4}
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setShowDisputeDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateDispute}>
              Submit Dispute
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Batch Dialog */}
      <Dialog open={showBatchDialog} onOpenChange={setShowBatchDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Payout Batch</DialogTitle>
            <DialogDescription>
              Process {selectedPayments.length} selected payments in a batch
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select 
                value={batchForm.paymentMethod} 
                onValueChange={(value) => setBatchForm(prev => ({ ...prev, paymentMethod: value as 'bank_transfer' | 'paypal' | 'manual' }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-gray-50 p-4 rounded">
              <h4 className="font-medium mb-2">Batch Summary</h4>
              <div className="text-sm text-gray-600">
                <div>Selected Payments: {selectedPayments.length}</div>
                <div>Total Amount: {formatCurrency(
                  payments
                    .filter(p => selectedPayments.includes(p.id))
                    .reduce((sum, p) => sum + p.netAmount, 0)
                )}</div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setShowBatchDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateBatch}>
              Create Batch
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CommissionPaymentPage; 