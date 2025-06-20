import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, CreditCard, Banknote, Smartphone, QrCode, Receipt, RefreshCw, Settings, AlertTriangle, CheckCircle, DollarSign, Users, TrendingUp, Clock, Calculator, Trash2, Edit, Eye, Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { usePWAPayment } from '@/hooks/usePWAPayment';
import { PaymentItem, CashCount } from '@/services/pwaPaymentService';

export const PWAPaymentPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('new');
  const [showSettings, setShowSettings] = useState(false);

  // New transaction state
  const [cartItems, setCartItems] = useState<PaymentItem[]>([]);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    customerId: ''
  });
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'digital_wallet' | 'qr_code'>('cash');
  const [tipAmount, setTipAmount] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);

  // Cash payment state
  const [amountTendered, setAmountTendered] = useState('');
  
  // Card payment state
  const [cardDetails, setCardDetails] = useState({
    last4: '',
    cardType: '',
    authCode: '',
    terminalId: '',
    emvChip: false,
    contactless: false
  });

  // Cash drawer state
  const [drawerBalance, setDrawerBalance] = useState('');
  const [cashCounts, setCashCounts] = useState<CashCount[]>([
    { denomination: '$100', count: 0, value: 0 },
    { denomination: '$50', count: 0, value: 0 },
    { denomination: '$20', count: 0, value: 0 },
    { denomination: '$10', count: 0, value: 0 },
    { denomination: '$5', count: 0, value: 0 },
    { denomination: '$1', count: 0, value: 0 },
    { denomination: '$0.25', count: 0, value: 0 },
    { denomination: '$0.10', count: 0, value: 0 },
    { denomination: '$0.05', count: 0, value: 0 },
    { denomination: '$0.01', count: 0, value: 0 }
  ]);

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const {
    currentTransaction,
    transactions,
    cashDrawerSession,
    settings,
    loading,
    error,
    isOnline,
    createTransaction,
    processCashPayment,
    processCardPayment,
    processDigitalWalletPayment,
    processRefund,
    voidTransaction,
    openCashDrawer,
    closeCashDrawer,
    refreshData,
    updateSettings,
    clearError,
    clearCurrentTransaction,
    formatCurrency,
    calculateTotal,
    todaysSales,
    todaysTransactionCount,
    averageTransactionValue,
    cashDrawerBalance,
    pendingTransactions,
    recentTransactions,
    paymentMethodBreakdown
  } = usePWAPayment(eventId || '');

  useEffect(() => {
    if (!eventId) {
      navigate('/pwa');
      return;
    }
  }, [eventId, navigate]);

  // Mock items for demo (in real app, would fetch from inventory)
  const availableItems: PaymentItem[] = [
    {
      id: 'item-1',
      name: 'General Admission Ticket',
      description: 'Access to main event',
      quantity: 1,
      unitPrice: 75.00,
      totalPrice: 75.00,
      taxRate: 0.08,
      category: 'ticket',
      eventId: eventId || ''
    },
    {
      id: 'item-2',
      name: 'VIP Ticket',
      description: 'Premium access with perks',
      quantity: 1,
      unitPrice: 150.00,
      totalPrice: 150.00,
      taxRate: 0.08,
      category: 'ticket',
      eventId: eventId || ''
    },
    {
      id: 'item-3',
      name: 'Event T-Shirt',
      description: 'Official event merchandise',
      quantity: 1,
      unitPrice: 25.00,
      totalPrice: 25.00,
      taxRate: 0.08,
      category: 'merchandise',
      eventId: eventId || ''
    }
  ];

  const addItemToCart = (item: PaymentItem) => {
    const existingItem = cartItems.find(cartItem => cartItem.id === item.id);
    if (existingItem) {
      setCartItems(cartItems.map(cartItem =>
        cartItem.id === item.id
          ? { ...cartItem, quantity: cartItem.quantity + 1, totalPrice: cartItem.unitPrice * (cartItem.quantity + 1) }
          : cartItem
      ));
    } else {
      setCartItems([...cartItems, { ...item }]);
    }
  };

  const removeItemFromCart = (itemId: string) => {
    setCartItems(cartItems.filter(item => item.id !== itemId));
  };

  const updateItemQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItemFromCart(itemId);
      return;
    }
    
    setCartItems(cartItems.map(item =>
      item.id === itemId
        ? { ...item, quantity, totalPrice: item.unitPrice * quantity }
        : item
    ));
  };

  const handleCreateTransaction = async () => {
    if (cartItems.length === 0) {
      toast.error('Please add items to cart');
      return;
    }

    if (!customerInfo.name || !customerInfo.email) {
      toast.error('Please enter customer name and email');
      return;
    }

    try {
      await createTransaction({
        eventId: eventId!,
        items: cartItems,
        customerInfo,
        staffId: 'staff-001' // Would come from auth
      });
      
      // Switch to payment processing tab
      setActiveTab('process');
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleProcessPayment = async () => {
    if (!currentTransaction) {
      toast.error('No active transaction');
      return;
    }

    try {
      switch (paymentMethod) {
        case 'cash':
          if (!amountTendered || parseFloat(amountTendered) < currentTransaction.totalAmount + tipAmount) {
            toast.error('Invalid amount tendered');
            return;
          }
          await processCashPayment(currentTransaction.id, {
            amountTendered: parseFloat(amountTendered),
            tipAmount
          });
          break;

        case 'card':
          if (!cardDetails.last4 || !cardDetails.authCode) {
            toast.error('Please enter card details');
            return;
          }
          await processCardPayment(currentTransaction.id, {
            ...cardDetails,
            tipAmount
          });
          break;

        case 'digital_wallet':
          await processDigitalWalletPayment(currentTransaction.id, {
            walletType: 'apple_pay', // Would be selected by user
            deviceId: 'device-123',
            transactionId: `wallet-${Date.now()}`,
            tipAmount
          });
          break;
      }

      // Clear transaction and reset form
      clearCurrentTransaction();
      setCartItems([]);
      setCustomerInfo({ name: '', email: '', phone: '', customerId: '' });
      setAmountTendered('');
      setTipAmount(0);
      setActiveTab('new');
      
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleOpenCashDrawer = async () => {
    if (!drawerBalance) {
      toast.error('Please enter opening balance');
      return;
    }

    try {
      await openCashDrawer(
        'staff-001', // Would come from auth
        eventId!,
        parseFloat(drawerBalance)
      );
      setDrawerBalance('');
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleCloseCashDrawer = async () => {
    const updatedCounts = cashCounts.map(count => ({
      ...count,
      value: count.count * parseFloat(count.denomination.replace('$', ''))
    }));

    try {
      await closeCashDrawer(updatedCounts, 'End of shift');
    } catch (error) {
      // Error handled by hook
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const { subtotal, taxAmount, total } = calculateTotal(cartItems, tipAmount, discountAmount);

  if (loading && !currentTransaction) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading payment system...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/pwa')}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Payment Processing</h1>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <div className={`flex items-center space-x-1 ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
                    <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-600' : 'bg-red-600'}`} />
                    <span>{isOnline ? 'Online' : 'Offline'}</span>
                  </div>
                  {cashDrawerSession && (
                    <>
                      <span>•</span>
                      <span>Cash Drawer: {cashDrawerSession.status}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={refreshData}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
              <Button
                variant="link"
                size="sm"
                onClick={clearError}
                className="ml-2 h-auto p-0 text-red-600"
              >
                Dismiss
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Quick Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Today's Sales</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(todaysSales)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Transactions</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {todaysTransactionCount}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg. Sale</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(averageTransactionValue)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Banknote className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Cash Drawer</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(cashDrawerBalance)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="new">New Sale</TabsTrigger>
            <TabsTrigger value="process">Process Payment</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="drawer">Cash Drawer</TabsTrigger>
          </TabsList>

          {/* New Sale Tab */}
          <TabsContent value="new" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Items Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>Available Items</CardTitle>
                  <CardDescription>Select items to add to cart</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {availableItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-gray-600">{item.description}</p>
                        <p className="text-lg font-bold text-green-600">
                          {formatCurrency(item.unitPrice)}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => addItemToCart(item)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Cart and Customer Info */}
              <div className="space-y-6">
                {/* Shopping Cart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Shopping Cart</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {cartItems.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">Cart is empty</p>
                    ) : (
                      <div className="space-y-4">
                        {cartItems.map((item) => (
                          <div key={item.id} className="flex items-center justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium">{item.name}</h4>
                              <p className="text-sm text-gray-600">
                                {formatCurrency(item.unitPrice)} x {item.quantity}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => updateItemQuantity(item.id, parseInt(e.target.value) || 0)}
                                className="w-16"
                                min="0"
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeItemFromCart(item.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                        
                        <Separator />
                        
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Subtotal:</span>
                            <span>{formatCurrency(subtotal)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Tax:</span>
                            <span>{formatCurrency(taxAmount)}</span>
                          </div>
                          <div className="flex justify-between text-lg font-bold">
                            <span>Total:</span>
                            <span>{formatCurrency(total)}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Customer Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Customer Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="customer-name">Name *</Label>
                      <Input
                        id="customer-name"
                        value={customerInfo.name}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                        placeholder="Customer name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="customer-email">Email *</Label>
                      <Input
                        id="customer-email"
                        type="email"
                        value={customerInfo.email}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                        placeholder="customer@example.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="customer-phone">Phone</Label>
                      <Input
                        id="customer-phone"
                        value={customerInfo.phone}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                        placeholder="(555) 123-4567"
                      />
                    </div>
                    
                    <Button
                      onClick={handleCreateTransaction}
                      disabled={cartItems.length === 0 || !customerInfo.name || !customerInfo.email}
                      className="w-full"
                    >
                      Create Transaction
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Process Payment Tab */}
          <TabsContent value="process" className="space-y-6">
            {currentTransaction ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Transaction Details */}
                <Card>
                  <CardHeader>
                    <CardTitle>Transaction Details</CardTitle>
                    <CardDescription>
                      Receipt: {currentTransaction.receiptNumber}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium">Customer</h4>
                      <p>{currentTransaction.customerName}</p>
                      <p className="text-sm text-gray-600">{currentTransaction.customerEmail}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium">Items</h4>
                      <div className="space-y-2">
                        {currentTransaction.items.map((item) => (
                          <div key={item.id} className="flex justify-between">
                            <span>{item.name} x{item.quantity}</span>
                            <span>{formatCurrency(item.totalPrice)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>{formatCurrency(currentTransaction.subtotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax:</span>
                        <span>{formatCurrency(currentTransaction.taxAmount)}</span>
                      </div>
                      {tipAmount > 0 && (
                        <div className="flex justify-between">
                          <span>Tip:</span>
                          <span>{formatCurrency(tipAmount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total:</span>
                        <span>{formatCurrency(currentTransaction.totalAmount + tipAmount)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Processing */}
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Method</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Payment Method Selection */}
                    <div className="grid grid-cols-2 gap-4">
                      <Button
                        variant={paymentMethod === 'cash' ? 'default' : 'outline'}
                        onClick={() => setPaymentMethod('cash')}
                        className="h-20 flex-col"
                      >
                        <Banknote className="h-6 w-6 mb-2" />
                        Cash
                      </Button>
                      <Button
                        variant={paymentMethod === 'card' ? 'default' : 'outline'}
                        onClick={() => setPaymentMethod('card')}
                        className="h-20 flex-col"
                      >
                        <CreditCard className="h-6 w-6 mb-2" />
                        Card
                      </Button>
                      <Button
                        variant={paymentMethod === 'digital_wallet' ? 'default' : 'outline'}
                        onClick={() => setPaymentMethod('digital_wallet')}
                        className="h-20 flex-col"
                      >
                        <Smartphone className="h-6 w-6 mb-2" />
                        Digital Wallet
                      </Button>
                      <Button
                        variant={paymentMethod === 'qr_code' ? 'default' : 'outline'}
                        onClick={() => setPaymentMethod('qr_code')}
                        className="h-20 flex-col"
                      >
                        <QrCode className="h-6 w-6 mb-2" />
                        QR Code
                      </Button>
                    </div>

                    {/* Tip Amount */}
                    <div>
                      <Label htmlFor="tip-amount">Tip Amount</Label>
                      <div className="flex space-x-2 mt-2">
                        {[15, 18, 20, 25].map((percentage) => (
                          <Button
                            key={percentage}
                            variant="outline"
                            size="sm"
                            onClick={() => setTipAmount(currentTransaction.totalAmount * (percentage / 100))}
                          >
                            {percentage}%
                          </Button>
                        ))}
                      </div>
                      <Input
                        id="tip-amount"
                        type="number"
                        step="0.01"
                        value={tipAmount}
                        onChange={(e) => setTipAmount(parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        className="mt-2"
                      />
                    </div>

                    {/* Payment Method Specific Fields */}
                    {paymentMethod === 'cash' && (
                      <div>
                        <Label htmlFor="amount-tendered">Amount Tendered</Label>
                        <Input
                          id="amount-tendered"
                          type="number"
                          step="0.01"
                          value={amountTendered}
                          onChange={(e) => setAmountTendered(e.target.value)}
                          placeholder="0.00"
                        />
                        {amountTendered && parseFloat(amountTendered) >= (currentTransaction.totalAmount + tipAmount) && (
                          <p className="text-sm text-green-600 mt-2">
                            Change: {formatCurrency(parseFloat(amountTendered) - (currentTransaction.totalAmount + tipAmount))}
                          </p>
                        )}
                      </div>
                    )}

                    {paymentMethod === 'card' && (
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="card-last4">Last 4 Digits</Label>
                          <Input
                            id="card-last4"
                            value={cardDetails.last4}
                            onChange={(e) => setCardDetails({ ...cardDetails, last4: e.target.value })}
                            placeholder="1234"
                            maxLength={4}
                          />
                        </div>
                        <div>
                          <Label htmlFor="card-type">Card Type</Label>
                          <Select value={cardDetails.cardType} onValueChange={(value) => setCardDetails({ ...cardDetails, cardType: value })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select card type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="visa">Visa</SelectItem>
                              <SelectItem value="mastercard">Mastercard</SelectItem>
                              <SelectItem value="amex">American Express</SelectItem>
                              <SelectItem value="discover">Discover</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="auth-code">Authorization Code</Label>
                          <Input
                            id="auth-code"
                            value={cardDetails.authCode}
                            onChange={(e) => setCardDetails({ ...cardDetails, authCode: e.target.value })}
                            placeholder="123456"
                          />
                        </div>
                        <div className="flex items-center space-x-4">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={cardDetails.emvChip}
                              onChange={(e) => setCardDetails({ ...cardDetails, emvChip: e.target.checked })}
                              className="mr-2"
                            />
                            EMV Chip
                          </label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={cardDetails.contactless}
                              onChange={(e) => setCardDetails({ ...cardDetails, contactless: e.target.checked })}
                              className="mr-2"
                            />
                            Contactless
                          </label>
                        </div>
                      </div>
                    )}

                    <Button
                      onClick={handleProcessPayment}
                      className="w-full"
                      size="lg"
                    >
                      Process Payment - {formatCurrency(currentTransaction.totalAmount + tipAmount)}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Calculator className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Transaction</h3>
                  <p className="text-gray-600 mb-4">Create a new transaction to process payment</p>
                  <Button onClick={() => setActiveTab('new')}>
                    Create New Transaction
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search transactions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="max-w-sm"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="refunded">Refunded</SelectItem>
                      <SelectItem value="voided">Voided</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <div>
                            <h4 className="font-medium">{transaction.customerName}</h4>
                            <p className="text-sm text-gray-600">{transaction.receiptNumber}</p>
                          </div>
                          <Badge variant={
                            transaction.status === 'completed' ? 'default' :
                            transaction.status === 'pending' ? 'secondary' :
                            transaction.status === 'refunded' ? 'outline' :
                            'destructive'
                          }>
                            {transaction.status}
                          </Badge>
                        </div>
                        <div className="mt-2 text-sm text-gray-600">
                          {new Date(transaction.timestamp).toLocaleString()} • 
                          {transaction.paymentMethod} • 
                          {formatCurrency(transaction.totalAmount)}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Receipt className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cash Drawer Tab */}
          <TabsContent value="drawer" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Cash Drawer Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Cash Drawer Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cashDrawerSession ? (
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <Badge variant={cashDrawerSession.status === 'open' ? 'default' : 'secondary'}>
                          {cashDrawerSession.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Opening Balance:</span>
                        <span>{formatCurrency(cashDrawerSession.openingBalance)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Expected Balance:</span>
                        <span>{formatCurrency(cashDrawerSession.expectedBalance)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Opened At:</span>
                        <span>{new Date(cashDrawerSession.openedAt).toLocaleString()}</span>
                      </div>
                      
                      {cashDrawerSession.status === 'open' && (
                        <Button
                          onClick={() => setActiveTab('drawer')}
                          variant="outline"
                          className="w-full"
                        >
                          Close Cash Drawer
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-gray-600">No cash drawer session active</p>
                      <div>
                        <Label htmlFor="opening-balance">Opening Balance</Label>
                        <Input
                          id="opening-balance"
                          type="number"
                          step="0.01"
                          value={drawerBalance}
                          onChange={(e) => setDrawerBalance(e.target.value)}
                          placeholder="0.00"
                        />
                      </div>
                      <Button onClick={handleOpenCashDrawer} className="w-full">
                        Open Cash Drawer
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Cash Count (for closing drawer) */}
              {cashDrawerSession?.status === 'open' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Cash Count</CardTitle>
                    <CardDescription>
                      Count cash to close drawer
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {cashCounts.map((count, index) => (
                      <div key={count.denomination} className="flex items-center justify-between">
                        <span className="font-medium">{count.denomination}</span>
                        <div className="flex items-center space-x-2">
                          <Input
                            type="number"
                            value={count.count}
                            onChange={(e) => {
                              const newCounts = [...cashCounts];
                              newCounts[index].count = parseInt(e.target.value) || 0;
                              newCounts[index].value = newCounts[index].count * parseFloat(count.denomination.replace('$', ''));
                              setCashCounts(newCounts);
                            }}
                            className="w-20"
                            min="0"
                          />
                          <span className="w-20 text-right">
                            {formatCurrency(count.value)}
                          </span>
                        </div>
                      </div>
                    ))}
                    
                    <Separator />
                    
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total:</span>
                      <span>
                        {formatCurrency(cashCounts.reduce((sum, count) => sum + count.value, 0))}
                      </span>
                    </div>
                    
                    <Button onClick={handleCloseCashDrawer} className="w-full">
                      Close Cash Drawer
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};