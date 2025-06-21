/**
 * Payment Method Selector Component
 * Story B.010: Payment Gateway Integration - UI Component
 */

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { 
  CreditCard, 
  Smartphone, 
  DollarSign, 
  Loader2, 
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';
import { paymentGatewayManager, type PaymentMethod, type PaymentMethodAvailability } from '@/services/paymentGatewayManager';

interface PaymentMethodSelectorProps {
  amount: number; // in cents
  currency?: string;
  onMethodSelect: (method: PaymentMethod) => void;
  onFeesCalculated: (fees: { processingFee: number; totalAmount: number }) => void;
  selectedMethod?: PaymentMethod;
  disabled?: boolean;
}

interface PaymentMethodInfo {
  id: PaymentMethod;
  name: string;
  description: string;
  icon: React.ReactNode;
  processingTime: string;
  available: boolean;
  recommended?: boolean;
  mobileOnly?: boolean;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  amount,
  currency = 'USD',
  onMethodSelect,
  onFeesCalculated,
  selectedMethod,
  disabled = false,
}) => {
  const [availability, setAvailability] = useState<PaymentMethodAvailability>({
    square: false,
    paypal: false,
    cashapp: false,
    cash: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFees, setSelectedFees] = useState<{ processingFee: number; totalAmount: number } | null>(null);

  useEffect(() => {
    initializePaymentMethods();
  }, []);

  useEffect(() => {
    if (selectedMethod) {
      const fees = paymentGatewayManager.calculateFees(amount, selectedMethod);
      setSelectedFees(fees);
      onFeesCalculated(fees);
    }
  }, [selectedMethod, amount, onFeesCalculated]);

  const initializePaymentMethods = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const availability = await paymentGatewayManager.initialize();
      setAvailability(availability);
    } catch (error) {
      console.error('Error initializing payment methods:', error);
      setError('Failed to load payment methods. Please refresh the page.');
    } finally {
      setIsLoading(false);
    }
  };

  const paymentMethods: PaymentMethodInfo[] = [
    {
      id: 'square',
      name: 'Credit/Debit Card',
      description: 'Visa, Mastercard, American Express, Discover',
      icon: <CreditCard className="h-5 w-5" />,
      processingTime: 'Instant',
      available: availability.square,
      recommended: true,
    },
    {
      id: 'paypal',
      name: 'PayPal',
      description: 'Pay with your PayPal account or card',
      icon: (
        <div className="h-5 w-5 bg-blue-600 rounded flex items-center justify-center">
          <span className="text-white text-xs font-bold">P</span>
        </div>
      ),
      processingTime: 'Instant',
      available: availability.paypal,
    },
    {
      id: 'cashapp',
      name: 'Cash App Pay',
      description: 'Pay instantly with Cash App',
      icon: <Smartphone className="h-5 w-5" />,
      processingTime: 'Instant',
      available: availability.cashapp,
      mobileOnly: true,
    },
    {
      id: 'cash',
      name: 'Cash Payment',
      description: 'Pay in person with verification code',
      icon: <DollarSign className="h-5 w-5" />,
      processingTime: '4 hours to confirm',
      available: availability.cash,
    },
  ];

  const handleMethodSelect = (methodId: string) => {
    const method = methodId as PaymentMethod;
    onMethodSelect(method);
  };

  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount / 100);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading Payment Methods
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardContent className="pt-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={initializePaymentMethods} className="mt-4 w-full">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  const availableMethods = paymentMethods.filter(method => method.available);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Choose Payment Method</CardTitle>
        <CardDescription>
          Select how you'd like to pay for your tickets
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {availableMethods.length === 0 ? (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              No payment methods are currently available. Please try again later or contact support.
            </AlertDescription>
          </Alert>
        ) : (
          <RadioGroup 
            value={selectedMethod} 
            onValueChange={handleMethodSelect}
            disabled={disabled}
          >
            {availableMethods.map((method) => {
              const fees = paymentGatewayManager.calculateFees(amount, method.id);
              const isSelected = selectedMethod === method.id;
              
              return (
                <div key={method.id} className="space-y-2">
                  <Label
                    htmlFor={method.id}
                    className={`
                      flex items-center space-x-3 border rounded-lg p-4 cursor-pointer transition-colors
                      ${isSelected 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50'
                      }
                      ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                  >
                    <RadioGroupItem value={method.id} id={method.id} disabled={disabled} />
                    
                    <div className="flex items-center gap-3 flex-1">
                      <div className="flex-shrink-0 text-muted-foreground">
                        {method.icon}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{method.name}</span>
                          {method.recommended && (
                            <Badge variant="secondary" className="text-xs">
                              Recommended
                            </Badge>
                          )}
                          {method.mobileOnly && (
                            <Badge variant="outline" className="text-xs">
                              Mobile Only
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{method.description}</p>
                        <p className="text-xs text-muted-foreground">
                          Processing time: {method.processingTime}
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {formatAmount(fees.totalAmount)}
                        </div>
                        {fees.processingFee > 0 && (
                          <div className="text-xs text-muted-foreground">
                            +{formatAmount(fees.processingFee)} fee
                          </div>
                        )}
                      </div>
                    </div>
                  </Label>
                </div>
              );
            })}
          </RadioGroup>
        )}

        {selectedMethod && selectedFees && (
          <>
            <Separator />
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Payment Summary
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatAmount(amount)}</span>
                </div>
                {selectedFees.processingFee > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Processing fee:</span>
                    <span>+{formatAmount(selectedFees.processingFee)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>Total:</span>
                  <span>{formatAmount(selectedFees.totalAmount)}</span>
                </div>
              </div>
              
              <div className="mt-3 text-xs text-muted-foreground">
                <p>
                  Payment will be processed by {paymentGatewayManager.getPaymentMethodDisplayName(selectedMethod)}.
                  {selectedMethod === 'cash' && (
                    <span className="block mt-1 text-orange-600">
                      Cash payments require in-person verification within 4 hours.
                    </span>
                  )}
                </p>
              </div>
            </div>
          </>
        )}

        {availableMethods.length > 0 && (
          <div className="text-xs text-muted-foreground">
            <p>
              All transactions are secure and encrypted. Your payment information is never stored on our servers.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentMethodSelector;