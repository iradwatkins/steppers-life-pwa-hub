import React, { useState } from 'react';
import { Search, Filter, MoreVertical, Receipt, RefreshCw, Mail, Printer, AlertCircle, CheckCircle, Clock, X } from 'lucide-react';
import { PaymentTransaction } from '../../../lib/services/pwaPaymentService';
import { PaymentFilters } from '../../../lib/hooks/usePWAPayments';

interface TransactionHistoryProps {
  payments: PaymentTransaction[];
  currentTransaction: PaymentTransaction | null;
  showDetails: boolean;
  isProcessing: boolean;
  filters: PaymentFilters;
  onFiltersChange: (filters: PaymentFilters) => void;
  onTransactionSelect: (transaction: PaymentTransaction | null) => void;
  onShowDetails: (show: boolean) => void;
  onRefund: (transactionId: string, amount: number, reason: string) => Promise<void>;
  onVoid: (transactionId: string, reason: string) => Promise<void>;
  onPrintReceipt: (transactionId: string) => Promise<void>;
  onEmailReceipt: (transactionId: string, email: string) => Promise<void>;
  formatCurrency: (amount: number) => string;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  payments,
  currentTransaction,
  showDetails,
  isProcessing,
  filters,
  onFiltersChange,
  onTransactionSelect,
  onShowDetails,
  onRefund,
  onVoid,
  onPrintReceipt,
  onEmailReceipt,
  formatCurrency
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);
  const [showActions, setShowActions] = useState<string | null>(null);
  const [refundData, setRefundData] = useState({ amount: 0, reason: '' });
  const [voidReason, setVoidReason] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [showVoidModal, setShowVoidModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  
  // Status badge styling
  const getStatusBadge = (status: string) => {
    const styles = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-purple-100 text-purple-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };
    
    const icons = {
      completed: <CheckCircle className="w-3 h-3" />,
      pending: <Clock className="w-3 h-3" />,
      processing: <RefreshCw className="w-3 h-3 animate-spin" />,
      failed: <AlertCircle className="w-3 h-3" />,
      refunded: <RefreshCw className="w-3 h-3" />,
      cancelled: <X className="w-3 h-3" />
    };
    
    return (
      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || styles.pending}`}>
        {icons[status as keyof typeof icons]}
        <span className="capitalize">{status}</span>
      </span>
    );
  };
  
  // Payment method badge
  const getPaymentMethodBadge = (transaction: PaymentTransaction) => {
    const method = transaction.paymentMethod;
    return (
      <span className="inline-flex items-center space-x-1 px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
        <span>{method.icon}</span>
        <span>{method.name}</span>
      </span>
    );
  };
  
  // Handle transaction actions
  const handleRefund = async () => {
    if (!selectedTransactionId || !refundData.amount || !refundData.reason) return;
    
    try {
      await onRefund(selectedTransactionId, refundData.amount, refundData.reason);
      setShowRefundModal(false);
      setRefundData({ amount: 0, reason: '' });
      setSelectedTransactionId(null);
    } catch (error) {
      console.error('Refund failed:', error);
    }
  };
  
  const handleVoid = async () => {
    if (!selectedTransactionId || !voidReason) return;
    
    try {
      await onVoid(selectedTransactionId, voidReason);
      setShowVoidModal(false);
      setVoidReason('');
      setSelectedTransactionId(null);
    } catch (error) {
      console.error('Void failed:', error);
    }
  };
  
  const handleEmailReceipt = async () => {
    if (!selectedTransactionId || !emailAddress) return;
    
    try {
      await onEmailReceipt(selectedTransactionId, emailAddress);
      setShowEmailModal(false);
      setEmailAddress('');
      setSelectedTransactionId(null);
    } catch (error) {
      console.error('Email failed:', error);
    }
  };
  
  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex items-center space-x-3 mb-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={filters.searchTerm || ''}
              onChange={(e) => onFiltersChange({ ...filters, searchTerm: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 border rounded-md transition-colors ${
              showFilters ? 'bg-blue-50 border-blue-300 text-blue-600' : 'border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>
        
        {/* Expanded Filters */}
        {showFilters && (
          <div className="grid grid-cols-2 gap-3 pt-3 border-t">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status || ''}
                onChange={(e) => onFiltersChange({ ...filters, status: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
              <select
                value={filters.paymentMethod || ''}
                onChange={(e) => onFiltersChange({ ...filters, paymentMethod: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Methods</option>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="digital_wallet">Digital Wallet</option>
                <option value="qr_code">QR Code</option>
              </select>
            </div>
          </div>
        )}
      </div>
      
      {/* Transaction List */}
      <div className="space-y-3">
        {payments.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
            <p className="text-gray-500">
              {filters.searchTerm || filters.status || filters.paymentMethod
                ? 'Try adjusting your search filters'
                : 'Transactions will appear here once payments are processed'
              }
            </p>
          </div>
        ) : (
          payments.map((transaction) => (
            <div
              key={transaction.id}
              className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-semibold text-gray-900">{transaction.description}</h3>
                    {getStatusBadge(transaction.status)}
                    {getPaymentMethodBadge(transaction)}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Amount:</span> {formatCurrency(transaction.totalAmount)}
                    </div>
                    <div>
                      <span className="font-medium">Receipt:</span> {transaction.receiptNumber}
                    </div>
                    <div>
                      <span className="font-medium">Date:</span> {new Date(transaction.timestamp).toLocaleDateString()}
                    </div>
                    <div>
                      <span className="font-medium">Time:</span> {new Date(transaction.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                  
                  {/* Additional details for specific payment methods */}
                  {transaction.cardDetails && (
                    <div className="mt-2 text-sm text-gray-600">
                      <span className="font-medium">Card:</span> **** {transaction.cardDetails.last4} ({transaction.cardDetails.brand})
                    </div>
                  )}
                  
                  {transaction.cashDetails && (
                    <div className="mt-2 text-sm text-gray-600">
                      <span className="font-medium">Cash:</span> Received {formatCurrency(transaction.cashDetails.amountReceived)}
                      {transaction.cashDetails.change > 0 && `, Change ${formatCurrency(transaction.cashDetails.change)}`}
                    </div>
                  )}
                  
                  {transaction.attendeeId && (
                    <div className="mt-2 text-sm text-gray-600">
                      <span className="font-medium">Attendee:</span> {transaction.attendeeId}
                    </div>
                  )}
                  
                  {transaction.syncStatus !== 'synced' && (
                    <div className="mt-2">
                      <span className="inline-flex items-center space-x-1 px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">
                        <RefreshCw className="w-3 h-3" />
                        <span>Pending sync</span>
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Actions Menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowActions(showActions === transaction.id ? null : transaction.id)}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  
                  {showActions === transaction.id && (
                    <div className="absolute right-0 top-10 bg-white border rounded-lg shadow-lg z-20 py-1 min-w-48">
                      <button
                        onClick={() => {
                          onTransactionSelect(transaction);
                          onShowDetails(true);
                          setShowActions(null);
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2"
                      >
                        <Receipt className="w-4 h-4" />
                        <span>View Details</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          onPrintReceipt(transaction.id);
                          setShowActions(null);
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2"
                      >
                        <Printer className="w-4 h-4" />
                        <span>Print Receipt</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          setSelectedTransactionId(transaction.id);
                          setShowEmailModal(true);
                          setShowActions(null);
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2"
                      >
                        <Mail className="w-4 h-4" />
                        <span>Email Receipt</span>
                      </button>
                      
                      {transaction.status === 'completed' && (
                        <button
                          onClick={() => {
                            setSelectedTransactionId(transaction.id);
                            setRefundData({ amount: transaction.totalAmount, reason: '' });
                            setShowRefundModal(true);
                            setShowActions(null);
                          }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 text-orange-600 flex items-center space-x-2"
                        >
                          <RefreshCw className="w-4 h-4" />
                          <span>Process Refund</span>
                        </button>
                      )}
                      
                      {(transaction.status === 'pending' || transaction.status === 'processing') && (
                        <button
                          onClick={() => {
                            setSelectedTransactionId(transaction.id);
                            setShowVoidModal(true);
                            setShowActions(null);
                          }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 text-red-600 flex items-center space-x-2"
                        >
                          <X className="w-4 h-4" />
                          <span>Void Transaction</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Refund Modal */}
      {showRefundModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Process Refund</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Refund Amount
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={refundData.amount}
                  onChange={(e) => setRefundData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for Refund
                </label>
                <textarea
                  value={refundData.reason}
                  onChange={(e) => setRefundData(prev => ({ ...prev, reason: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter reason for refund"
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleRefund}
                disabled={!refundData.amount || !refundData.reason || isProcessing}
                className="flex-1 bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Processing...' : 'Process Refund'}
              </button>
              <button
                onClick={() => {
                  setShowRefundModal(false);
                  setRefundData({ amount: 0, reason: '' });
                  setSelectedTransactionId(null);
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Void Modal */}
      {showVoidModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Void Transaction</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for Void
                </label>
                <textarea
                  value={voidReason}
                  onChange={(e) => setVoidReason(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter reason for voiding transaction"
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleVoid}
                disabled={!voidReason || isProcessing}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Processing...' : 'Void Transaction'}
              </button>
              <button
                onClick={() => {
                  setShowVoidModal(false);
                  setVoidReason('');
                  setSelectedTransactionId(null);
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Receipt</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter email address"
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleEmailReceipt}
                disabled={!emailAddress || isProcessing}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Sending...' : 'Send Receipt'}
              </button>
              <button
                onClick={() => {
                  setShowEmailModal(false);
                  setEmailAddress('');
                  setSelectedTransactionId(null);
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Click outside to close actions menu */}
      {showActions && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setShowActions(null)}
        />
      )}
    </div>
  );
};

export default TransactionHistory; 