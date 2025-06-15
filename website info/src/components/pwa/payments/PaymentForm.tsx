import React, { useState, useCallback } from 'react';
import { Plus, Minus, X, Calculator, CreditCard, Smartphone, QrCode, DollarSign } from 'lucide-react';
import { PaymentMethod, PaymentSettings, PaymentItem } from '../../../lib/services/pwaPaymentService';
import { PaymentFormData } from '../../../lib/hooks/usePWAPayments';

interface PaymentFormProps {
  paymentMethods: PaymentMethod[];
  isProcessing: boolean;
  onSubmit: (formData: PaymentFormData) => Promise<void>;
  formatCurrency: (amount: number) => string;
  calculateTotal: (items: PaymentItem[], discountAmount?: number) => number;
  settings: PaymentSettings;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  paymentMethods,
  isProcessing,
  onSubmit,
  formatCurrency,
  calculateTotal,
  settings
}) => {
  // Form state
  const [selectedMethodId, setSelectedMethodId] = useState<string>(paymentMethods[0]?.id || '');
  const [description, setDescription] = useState('Event Payment');
  const [items, setItems] = useState<PaymentItem[]>([
    {
      id: '1',
      name: 'General Admission',
      description: 'Event ticket',
      quantity: 1,
      unitPrice: 50.00,
      totalPrice: 50.00,
      category: 'Tickets',
      taxRate: settings.taxRate
    }
  ]);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [attendeeId, setAttendeeId] = useState('');
  const [notes, setNotes] = useState('');
  
  // Cash payment specific
  const [amountReceived, setAmountReceived] = useState<number>(0);
  
  // Split payment specific
  const [splitPayments, setSplitPayments] = useState<{ methodId: string; amount: number }[]>([]);
  const [showSplitPayment, setShowSplitPayment] = useState(false);
  
  // UI state
  const [showItemForm, setShowItemForm] = useState(false);
  const [newItem, setNewItem] = useState<Partial<PaymentItem>>({
    name: '',
    quantity: 1,
    unitPrice: 0,
    category: 'Tickets'
  });
  
  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const finalTotal = calculateTotal(items, discountAmount);
  const taxAmount = finalTotal - (subtotal - discountAmount);
  const selectedMethod = paymentMethods.find(m => m.id === selectedMethodId);
  
  // Calculate change for cash payments
  const change = selectedMethod?.type === 'cash' && amountReceived > finalTotal 
    ? amountReceived - finalTotal 
    : 0;
  
  // Handle item operations
  const handleAddItem = useCallback(() => {
    if (!newItem.name || !newItem.unitPrice) return;
    
    const item: PaymentItem = {
      id: Date.now().toString(),
      name: newItem.name!,
      description: newItem.description || '',
      quantity: newItem.quantity || 1,
      unitPrice: newItem.unitPrice!,
      totalPrice: (newItem.quantity || 1) * newItem.unitPrice!,
      category: newItem.category || 'Tickets',
      taxRate: settings.taxRate
    };
    
    setItems(prev => [...prev, item]);
    setNewItem({ name: '', quantity: 1, unitPrice: 0, category: 'Tickets' });
    setShowItemForm(false);
  }, [newItem, settings.taxRate]);
  
  const handleRemoveItem = useCallback((itemId: string) => {
    setItems(prev => prev.filter(item => item.id !== itemId));
  }, []);
  
  const handleUpdateItemQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity < 1) return;
    
    setItems(prev => prev.map(item => 
      item.id === itemId 
        ? { ...item, quantity, totalPrice: quantity * item.unitPrice }
        : item
    ));
  }, []);
  
  // Handle split payment
  const handleAddSplitPayment = useCallback(() => {
    const remainingAmount = finalTotal - splitPayments.reduce((sum, sp) => sum + sp.amount, 0);
    if (remainingAmount > 0) {
      setSplitPayments(prev => [...prev, { methodId: paymentMethods[0]?.id || '', amount: remainingAmount }]);
    }
  }, [finalTotal, splitPayments, paymentMethods]);
  
  const handleRemoveSplitPayment = useCallback((index: number) => {
    setSplitPayments(prev => prev.filter((_, i) => i !== index));
  }, []);
  
  const handleUpdateSplitPayment = useCallback((index: number, field: 'methodId' | 'amount', value: string | number) => {
    setSplitPayments(prev => prev.map((sp, i) => 
      i === index ? { ...sp, [field]: value } : sp
    ));
  }, []);
  
  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedMethod || items.length === 0) return;
    
    const formData: PaymentFormData = {
      amount: subtotal,
      paymentMethodId: selectedMethodId,
      description,
      items,
      attendeeId: attendeeId || undefined,
      discountAmount,
      notes: notes || undefined
    };
    
    // Add method-specific data
    if (selectedMethod.type === 'cash') {
      formData.amountReceived = amountReceived;
    }
    
    if (showSplitPayment && splitPayments.length > 0) {
      formData.splitPayments = splitPayments;
    }
    
    try {
      await onSubmit(formData);
      
      // Reset form after successful submission
      setDescription('Event Payment');
      setItems([{
        id: Date.now().toString(),
        name: 'General Admission',
        description: 'Event ticket',
        quantity: 1,
        unitPrice: 50.00,
        totalPrice: 50.00,
        category: 'Tickets',
        taxRate: settings.taxRate
      }]);
      setDiscountAmount(0);
      setAttendeeId('');
      setNotes('');
      setAmountReceived(0);
      setSplitPayments([]);
      setShowSplitPayment(false);
      
    } catch (error) {
      console.error('Payment submission failed:', error);
    }
  };
  
  // Payment method icons
  const getPaymentMethodIcon = (method: PaymentMethod) => {
    switch (method.type) {
      case 'cash':
        return <DollarSign className="w-5 h-5" />;
      case 'card':
        return <CreditCard className="w-5 h-5" />;
      case 'digital_wallet':
        return <Smartphone className="w-5 h-5" />;
      case 'qr_code':
        return <QrCode className="w-5 h-5" />;
      default:
        return <CreditCard className="w-5 h-5" />;
    }
  };
  
  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Payment Method Selection */}
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h3>
          <div className="grid grid-cols-2 gap-3">
            {paymentMethods.map((method) => (
              <button
                key={method.id}
                type="button"
                onClick={() => {
                  setSelectedMethodId(method.id);
                  if (method.type !== 'cash') {
                    setAmountReceived(0);
                  }
                }}
                className={`p-4 border rounded-lg text-left transition-all ${
                  selectedMethodId === method.id
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  {getPaymentMethodIcon(method)}
                  <div>
                    <div className="font-medium">{method.name}</div>
                    {method.processingFee && (
                      <div className="text-sm text-gray-500">
                        {(method.processingFee * 100).toFixed(1)}% fee
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
        
        {/* Items */}
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Items</h3>
            <button
              type="button"
              onClick={() => setShowItemForm(true)}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">Add Item</span>
            </button>
          </div>
          
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{item.name}</div>
                  <div className="text-sm text-gray-500">
                    {formatCurrency(item.unitPrice)} × {item.quantity}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => handleUpdateItemQuantity(item.id, item.quantity - 1)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                    disabled={item.quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => handleUpdateItemQuantity(item.id, item.quantity + 1)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="text-right">
                  <div className="font-semibold text-gray-900">
                    {formatCurrency(item.totalPrice)}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.id)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {/* Add Item Form */}
          {showItemForm && (
            <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Item Name
                  </label>
                  <input
                    type="text"
                    value={newItem.name || ''}
                    onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter item name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={newItem.category || 'Tickets'}
                    onChange={(e) => setNewItem(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Tickets">Tickets</option>
                    <option value="Merchandise">Merchandise</option>
                    <option value="Food">Food & Beverages</option>
                    <option value="Services">Services</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newItem.quantity || 1}
                    onChange={(e) => setNewItem(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit Price
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={newItem.unitPrice || ''}
                    onChange={(e) => setNewItem(prev => ({ ...prev, unitPrice: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Add Item
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowItemForm(false);
                    setNewItem({ name: '', quantity: 1, unitPrice: 0, category: 'Tickets' });
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Additional Fields */}
        <div className="bg-white rounded-lg shadow-sm border p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Payment description"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Attendee ID (Optional)
              </label>
              <input
                type="text"
                value={attendeeId}
                onChange={(e) => setAttendeeId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Link to attendee"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount Amount
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={discountAmount}
                onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>
          </div>
          
          {/* Cash specific fields */}
          {selectedMethod?.type === 'cash' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount Received
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={amountReceived}
                onChange={(e) => setAmountReceived(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={formatCurrency(finalTotal)}
              />
              {change > 0 && (
                <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm">
                  <span className="text-green-800">Change: {formatCurrency(change)}</span>
                </div>
              )}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Additional notes"
            />
          </div>
        </div>
        
        {/* Total Summary */}
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Discount</span>
                <span className="text-red-600">-{formatCurrency(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax ({(settings.taxRate * 100).toFixed(1)}%)</span>
              <span>{formatCurrency(taxAmount)}</span>
            </div>
            <div className="border-t pt-2">
              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span>{formatCurrency(finalTotal)}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Submit Button */}
        <button
          type="submit"
          disabled={isProcessing || items.length === 0 || !selectedMethod}
          className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg text-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isProcessing ? 'Processing Payment...' : `Process Payment ${formatCurrency(finalTotal)}`}
        </button>
      </form>
    </div>
  );
};

export default PaymentForm; 