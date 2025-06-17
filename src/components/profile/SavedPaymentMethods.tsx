import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { CreditCard, Plus, Trash2, Shield, Lock, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'debit_card' | 'paypal';
  last_four: string;
  card_brand: string;
  expiry_month: number;
  expiry_year: number;
  is_default: boolean;
  cardholder_name: string;
  created_at: string;
  updated_at: string;
}

interface SavedPaymentMethodsProps {
  userId: string;
  disabled?: boolean;
}

const SavedPaymentMethods: React.FC<SavedPaymentMethodsProps> = ({
  userId,
  disabled = false
}) => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [showCardNumber, setShowCardNumber] = useState(false);

  const [newPaymentMethod, setNewPaymentMethod] = useState({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cardholderName: '',
    cardBrand: '',
    isDefault: false
  });

  // Load saved payment methods
  useEffect(() => {
    loadPaymentMethods();
  }, [userId]);

  const loadPaymentMethods = async () => {
    if (!userId) return;

    setIsLoading(true);
    try {
      console.log('🔄 Loading saved payment methods...');
      
      const { data: methods, error } = await supabase
        .from('saved_payment_methods')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error loading payment methods:', error);
        toast.error('Failed to load payment methods');
        return;
      }

      console.log('✅ Payment methods loaded:', methods);
      setPaymentMethods(methods || []);
    } catch (error) {
      console.error('❌ Unexpected error loading payment methods:', error);
      toast.error('Failed to load payment methods');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPaymentMethod = async () => {
    if (!newPaymentMethod.cardNumber || !newPaymentMethod.expiryMonth || 
        !newPaymentMethod.expiryYear || !newPaymentMethod.cvv) {
      toast.error('Please fill in all card details');
      return;
    }

    setIsAdding(true);
    try {
      console.log('🔄 Adding new payment method...');

      // In a real implementation, this would go through a PCI-compliant payment processor
      // For demo purposes, we're storing minimal, tokenized information
      const lastFour = newPaymentMethod.cardNumber.slice(-4);
      
      // Detect card brand from card number (basic detection)
      const cardBrand = detectCardBrand(newPaymentMethod.cardNumber);

      const paymentMethodData = {
        user_id: userId,
        type: 'credit_card' as const,
        last_four: lastFour,
        card_brand: cardBrand,
        expiry_month: parseInt(newPaymentMethod.expiryMonth),
        expiry_year: parseInt(newPaymentMethod.expiryYear),
        cardholder_name: newPaymentMethod.cardholderName,
        is_default: newPaymentMethod.isDefault || paymentMethods.length === 0,
        // NOTE: In production, card details would be tokenized by payment processor
        // We never store actual card numbers, CVV, or other sensitive data
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // If this is set as default, remove default from other methods
      if (paymentMethodData.is_default) {
        await supabase
          .from('saved_payment_methods')
          .update({ is_default: false })
          .eq('user_id', userId);
      }

      const { data: newMethod, error } = await supabase
        .from('saved_payment_methods')
        .insert([paymentMethodData])
        .select()
        .single();

      if (error) {
        console.error('❌ Error adding payment method:', error);
        toast.error('Failed to add payment method');
        return;
      }

      console.log('✅ Payment method added successfully:', newMethod);
      toast.success('Payment method added successfully');

      // Reset form and close dialog
      setNewPaymentMethod({
        cardNumber: '',
        expiryMonth: '',
        expiryYear: '',
        cvv: '',
        cardholderName: '',
        cardBrand: '',
        isDefault: false
      });
      setIsAddDialogOpen(false);

      // Reload payment methods
      await loadPaymentMethods();
    } catch (error) {
      console.error('❌ Unexpected error adding payment method:', error);
      toast.error('Failed to add payment method');
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeletePaymentMethod = async (methodId: string) => {
    try {
      console.log('🗑️ Deleting payment method:', methodId);

      const { error } = await supabase
        .from('saved_payment_methods')
        .delete()
        .eq('id', methodId)
        .eq('user_id', userId);

      if (error) {
        console.error('❌ Error deleting payment method:', error);
        toast.error('Failed to delete payment method');
        return;
      }

      console.log('✅ Payment method deleted successfully');
      toast.success('Payment method removed');

      // Reload payment methods
      await loadPaymentMethods();
    } catch (error) {
      console.error('❌ Unexpected error deleting payment method:', error);
      toast.error('Failed to delete payment method');
    }
  };

  const handleSetDefault = async (methodId: string) => {
    try {
      console.log('⭐ Setting default payment method:', methodId);

      // Remove default from all methods
      await supabase
        .from('saved_payment_methods')
        .update({ is_default: false })
        .eq('user_id', userId);

      // Set new default
      const { error } = await supabase
        .from('saved_payment_methods')
        .update({ is_default: true })
        .eq('id', methodId)
        .eq('user_id', userId);

      if (error) {
        console.error('❌ Error setting default payment method:', error);
        toast.error('Failed to set default payment method');
        return;
      }

      console.log('✅ Default payment method updated');
      toast.success('Default payment method updated');

      // Reload payment methods
      await loadPaymentMethods();
    } catch (error) {
      console.error('❌ Unexpected error setting default:', error);
      toast.error('Failed to set default payment method');
    }
  };

  const detectCardBrand = (cardNumber: string): string => {
    const cleanNumber = cardNumber.replace(/\D/g, '');
    
    if (cleanNumber.startsWith('4')) return 'Visa';
    if (cleanNumber.startsWith('5') || cleanNumber.startsWith('2')) return 'Mastercard';
    if (cleanNumber.startsWith('3')) return 'American Express';
    if (cleanNumber.startsWith('6')) return 'Discover';
    
    return 'Unknown';
  };

  const formatCardNumber = (value: string) => {
    const cleanValue = value.replace(/\D/g, '');
    const groups = cleanValue.match(/.{1,4}/g) || [];
    return groups.join(' ').substr(0, 19); // Max 16 digits with spaces
  };

  const getCardIcon = (brand: string) => {
    // In a real implementation, you'd use actual card brand icons
    return <CreditCard className="h-4 w-4" />;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Methods
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Payment Methods
        </CardTitle>
        <CardDescription>
          Manage your saved payment methods for faster checkout
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Security Notice */}
        <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <Shield className="h-4 w-4 text-blue-600" />
          <span className="text-sm text-blue-800">
            Your payment information is encrypted and secure
          </span>
        </div>

        {/* Existing Payment Methods */}
        {paymentMethods.length > 0 ? (
          <div className="space-y-3">
            {paymentMethods.map((method) => (
              <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getCardIcon(method.card_brand)}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {method.card_brand} •••• {method.last_four}
                      </span>
                      {method.is_default && (
                        <Badge variant="default" className="text-xs">Default</Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Expires {method.expiry_month.toString().padStart(2, '0')}/{method.expiry_year}
                    </div>
                    {method.cardholder_name && (
                      <div className="text-sm text-muted-foreground">
                        {method.cardholder_name}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!method.is_default && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetDefault(method.id)}
                      disabled={disabled}
                    >
                      Set Default
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeletePaymentMethod(method.id)}
                    disabled={disabled}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No saved payment methods</p>
            <p className="text-sm">Add a payment method for faster checkout</p>
          </div>
        )}

        {/* Add Payment Method Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full" disabled={disabled}>
              <Plus className="h-4 w-4 mr-2" />
              Add Payment Method
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Payment Method</DialogTitle>
              <DialogDescription>
                Add a new payment method for faster checkout. Your information is secure and encrypted.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {/* Security Notice */}
              <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                <Lock className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-800">
                  This is a demo. No real payment data is processed.
                </span>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardNumber">Card Number</Label>
                <div className="relative">
                  <Input
                    id="cardNumber"
                    type={showCardNumber ? "text" : "password"}
                    placeholder="1234 5678 9012 3456"
                    value={newPaymentMethod.cardNumber}
                    onChange={(e) => setNewPaymentMethod(prev => ({
                      ...prev,
                      cardNumber: formatCardNumber(e.target.value)
                    }))}
                    maxLength={19}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={() => setShowCardNumber(!showCardNumber)}
                  >
                    {showCardNumber ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiryMonth">Expiry Month</Label>
                  <Select
                    value={newPaymentMethod.expiryMonth}
                    onValueChange={(value) => setNewPaymentMethod(prev => ({
                      ...prev,
                      expiryMonth: value
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="MM" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => (
                        <SelectItem key={i + 1} value={(i + 1).toString().padStart(2, '0')}>
                          {(i + 1).toString().padStart(2, '0')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiryYear">Expiry Year</Label>
                  <Select
                    value={newPaymentMethod.expiryYear}
                    onValueChange={(value) => setNewPaymentMethod(prev => ({
                      ...prev,
                      expiryYear: value
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="YYYY" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 10 }, (_, i) => (
                        <SelectItem key={i} value={(new Date().getFullYear() + i).toString()}>
                          {new Date().getFullYear() + i}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  type="password"
                  placeholder="123"
                  value={newPaymentMethod.cvv}
                  onChange={(e) => setNewPaymentMethod(prev => ({
                    ...prev,
                    cvv: e.target.value.replace(/\D/g, '').slice(0, 4)
                  }))}
                  maxLength={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardholderName">Cardholder Name</Label>
                <Input
                  id="cardholderName"
                  placeholder="John Doe"
                  value={newPaymentMethod.cardholderName}
                  onChange={(e) => setNewPaymentMethod(prev => ({
                    ...prev,
                    cardholderName: e.target.value
                  }))}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isDefault"
                  checked={newPaymentMethod.isDefault}
                  onCheckedChange={(checked) => setNewPaymentMethod(prev => ({
                    ...prev,
                    isDefault: !!checked
                  }))}
                />
                <Label htmlFor="isDefault" className="text-sm">
                  Set as default payment method
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
                disabled={isAdding}
              >
                Cancel
              </Button>
              <Button onClick={handleAddPaymentMethod} disabled={isAdding}>
                {isAdding ? 'Adding...' : 'Add Payment Method'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default SavedPaymentMethods;