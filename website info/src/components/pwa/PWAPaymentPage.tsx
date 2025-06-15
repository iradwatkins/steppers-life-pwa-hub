import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, DollarSign, Receipt, Settings, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import usePWAPayments, { PaymentFormData } from '../../lib/hooks/usePWAPayments';
import PaymentForm from './payments/PaymentForm';
import TransactionHistory from './payments/TransactionHistory';
import PaymentStats from './payments/PaymentStats';
import PaymentSettings from './payments/PaymentSettings';
import { usePWAAuth } from '../../hooks/usePWAAuth';

interface PWAPaymentPageProps {}

type TabType = 'payment' | 'history' | 'stats' | 'settings';

const PWAPaymentPage: React.FC<PWAPaymentPageProps> = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { user } = usePWAAuth();
  
  // PWA Payments hook
  const {
    payments,
    currentTransaction,
    paymentMethods,
    stats,
    settings,
    isProcessing,
    isLoading,
    isSyncing,
    filters,
    setFilters,
    processPayment,
    processRefund,
    processVoid,
    setCurrentTransaction,
    generateReceipt,
    printReceipt,
    emailReceipt,
    updateSettings,
    togglePaymentMethod,
    formatCurrency,
    calculateTotal,
    refreshData,
    syncTransactions,
    isOnline,
    pendingSyncCount
  } = usePWAPayments(eventId);
  
  // Local state
  const [activeTab, setActiveTab] = useState<TabType>('payment');
  const [showTransactionDetails, setShowTransactionDetails] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  
  // Auto-refresh data periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (isOnline && !isProcessing && !isSyncing) {
        refreshData();
        setLastRefresh(new Date());
      }
    }, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(interval);
  }, [isOnline, isProcessing, isSyncing, refreshData]);
  
  // Handle manual refresh
  const handleRefresh = async () => {
    try {
      if (isOnline) {
        await syncTransactions();
      } else {
        refreshData();
      }
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Refresh failed:', error);
    }
  };
  
  // Handle payment submission
  const handlePaymentSubmit = async (formData: PaymentFormData) => {
    try {
      const transaction = await processPayment(formData);
      setCurrentTransaction(transaction);
      
      // Auto-switch to history tab to show the new transaction
      setTimeout(() => {
        setActiveTab('history');
      }, 2000);
      
    } catch (error) {
      console.error('Payment failed:', error);
    }
  };
  
  // Handle refund
  const handleRefund = async (transactionId: string, amount: number, reason: string) => {
    try {
      await processRefund(transactionId, amount, reason);
      setShowTransactionDetails(false);
    } catch (error) {
      console.error('Refund failed:', error);
    }
  };
  
  // Handle void
  const handleVoid = async (transactionId: string, reason: string) => {
    try {
      await processVoid(transactionId, reason);
      setShowTransactionDetails(false);
    } catch (error) {
      console.error('Void failed:', error);
    }
  };
  
  // Handle receipt actions
  const handlePrintReceipt = async (transactionId: string) => {
    try {
      const receipt = generateReceipt(transactionId);
      if (receipt) {
        await printReceipt(receipt.id);
      }
    } catch (error) {
      console.error('Print failed:', error);
    }
  };
  
  const handleEmailReceipt = async (transactionId: string, email: string) => {
    try {
      const receipt = generateReceipt(transactionId);
      if (receipt) {
        await emailReceipt(receipt.id, email);
      }
    } catch (error) {
      console.error('Email failed:', error);
    }
  };
  
  // Tab configuration
  const tabs = [
    {
      id: 'payment' as TabType,
      label: 'New Payment',
      icon: <CreditCard className="w-5 h-5" />,
      badge: paymentMethods.length
    },
    {
      id: 'history' as TabType,
      label: 'History',
      icon: <Receipt className="w-5 h-5" />,
      badge: payments.length
    },
    {
      id: 'stats' as TabType,
      label: 'Stats',
      icon: <DollarSign className="w-5 h-5" />,
      badge: stats.totalTransactions
    },
    {
      id: 'settings' as TabType,
      label: 'Settings',
      icon: <Settings className="w-5 h-5" />,
      badge: pendingSyncCount > 0 ? pendingSyncCount : undefined
    }
  ];
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment system...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate(`/pwa/dashboard/${eventId}`)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Payment Processing</h1>
                <p className="text-sm text-gray-500">Event Payment Management</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Network Status */}
              <div className="flex items-center space-x-1">
                {isOnline ? (
                  <Wifi className="w-4 h-4 text-green-600" />
                ) : (
                  <WifiOff className="w-4 h-4 text-red-600" />
                )}
                <span className="text-xs text-gray-500">
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
              
              {/* Pending Sync Badge */}
              {pendingSyncCount > 0 && (
                <div className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                  {pendingSyncCount} pending
                </div>
              )}
              
              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={isSyncing}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 text-gray-600 ${isSyncing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
        
        {/* Stats Summary */}
        <div className="px-4 py-2 bg-gray-50 border-t">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-green-600">
                {formatCurrency(stats.totalAmount)}
              </div>
              <div className="text-xs text-gray-500">Total Sales</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-blue-600">
                {stats.totalTransactions}
              </div>
              <div className="text-xs text-gray-500">Transactions</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-purple-600">
                {formatCurrency(stats.averageTransactionAmount)}
              </div>
              <div className="text-xs text-gray-500">Average</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-orange-600">
                {stats.successfulTransactions}
              </div>
              <div className="text-xs text-gray-500">Successful</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tab Navigation */}
      <div className="bg-white border-b">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center py-3 px-2 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="relative">
                {tab.icon}
                {tab.badge !== undefined && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {tab.badge > 99 ? '99+' : tab.badge}
                  </span>
                )}
              </div>
              <span className="mt-1">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Tab Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'payment' && (
          <div className="p-4">
            <PaymentForm
              paymentMethods={paymentMethods}
              isProcessing={isProcessing}
              onSubmit={handlePaymentSubmit}
              formatCurrency={formatCurrency}
              calculateTotal={calculateTotal}
              settings={settings}
            />
          </div>
        )}
        
        {activeTab === 'history' && (
          <div className="p-4">
            <TransactionHistory
              payments={payments}
              currentTransaction={currentTransaction}
              showDetails={showTransactionDetails}
              isProcessing={isProcessing}
              filters={filters}
              onFiltersChange={setFilters}
              onTransactionSelect={setCurrentTransaction}
              onShowDetails={setShowTransactionDetails}
              onRefund={handleRefund}
              onVoid={handleVoid}
              onPrintReceipt={handlePrintReceipt}
              onEmailReceipt={handleEmailReceipt}
              formatCurrency={formatCurrency}
            />
          </div>
        )}
        
        {activeTab === 'stats' && (
          <div className="p-4">
            <PaymentStats
              stats={stats}
              formatCurrency={formatCurrency}
              lastRefresh={lastRefresh}
            />
          </div>
        )}
        
        {activeTab === 'settings' && (
          <div className="p-4">
            <PaymentSettings
              settings={settings}
              paymentMethods={paymentMethods}
              pendingSyncCount={pendingSyncCount}
              isOnline={isOnline}
              onUpdateSettings={updateSettings}
              onTogglePaymentMethod={togglePaymentMethod}
              onSyncTransactions={syncTransactions}
              formatCurrency={formatCurrency}
            />
          </div>
        )}
      </div>
      
      {/* Processing Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Processing Payment</h3>
            <p className="text-gray-600">Please wait while we process your payment...</p>
          </div>
        </div>
      )}
      
      {/* Sync Indicator */}
      {isSyncing && (
        <div className="fixed top-20 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-40">
          <div className="flex items-center space-x-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span className="text-sm">Syncing transactions...</span>
          </div>
        </div>
      )}
      
      {/* Offline Indicator */}
      {!isOnline && (
        <div className="fixed top-20 right-4 bg-orange-600 text-white px-4 py-2 rounded-lg shadow-lg z-40">
          <div className="flex items-center space-x-2">
            <WifiOff className="w-4 h-4" />
            <span className="text-sm">Working offline</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PWAPaymentPage; 