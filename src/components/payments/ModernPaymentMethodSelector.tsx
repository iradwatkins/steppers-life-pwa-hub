/**
 * Modern Payment Method Selector Component
 * Story B.010: Payment Gateway Integration - Modern UI with Official React SDKs
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
  Info,
  Phone
} from 'lucide-react';
import { modernPaymentGatewayManager, type PaymentMethod, type PaymentMethodAvailability, type UnifiedPaymentRequest } from '@/services/modernPaymentGatewayManager';
import { DeviceDetection } from '@/utils/deviceDetection';
import SquarePaymentForm from './SquarePaymentForm';
import PayPalPaymentForm from './PayPalPaymentForm';

interface ModernPaymentMethodSelectorProps {
  amount: number; // in cents
  currency?: string;
  orderId: string;
  customerEmail?: string;
  customerName?: string;
  description?: string;
  onPaymentSuccess: (result: any) => void;
  onPaymentError: (error: string) => void;
  onPaymentCancel?: () => void;
  disabled?: boolean;
  requiresTickets?: boolean; // New prop to control initialization
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

const ModernPaymentMethodSelector: React.FC<ModernPaymentMethodSelectorProps> = ({
  amount,
  currency = 'USD',
  orderId,
  customerEmail,
  customerName,
  description,
  onPaymentSuccess,
  onPaymentError,
  onPaymentCancel,
  disabled = false,
  requiresTickets = true, // Default to true for backward compatibility
}) => {
  const [availability, setAvailability] = useState<PaymentMethodAvailability>({
    square: false,
    paypal: false,
    cashapp: false,
    cash: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [selectedFees, setSelectedFees] = useState<{ processingFee: number; totalAmount: number } | null>(null);

  useEffect(() => {
    initializePaymentMethods();
  }, []);

  useEffect(() => {
    if (selectedMethod) {
      const fees = modernPaymentGatewayManager.calculateFees(amount, selectedMethod);
      setSelectedFees(fees);
    }
  }, [selectedMethod, amount]);

  const initializePaymentMethods = async () => {
    // Skip initialization if event doesn't require tickets
    if (!requiresTickets) {
      console.log('🚫 Skipping modern payment method initialization - event does not require tickets');
      setError('This event does not require payment.');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const availability = await modernPaymentGatewayManager.initialize();
      setAvailability(availability);
      
      // Auto-select first available method
      const availableMethods = getAllPaymentMethods().filter(method => method.available);
      if (availableMethods.length > 0 && !selectedMethod) {
        setSelectedMethod(availableMethods[0].id);
      }
    } catch (error) {
      console.error('Error initializing payment methods:', error);
      setError('Failed to load payment methods. Please refresh the page.');
    } finally {
      setIsLoading(false);
    }
  };

  // Get device capabilities for payment method filtering
  const deviceCaps = DeviceDetection.getCapabilities();

  const getAllPaymentMethods = (): PaymentMethodInfo[] => [
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
      id: 'cash',
      name: 'Pay Cash at Venue',
      description: 'Reserve tickets and pay cash to event organizers',
      icon: <DollarSign className="h-5 w-5" />,
      processingTime: '4 hours to confirm',
      available: availability.cash,
    },
  ];

  const paymentMethods = getAllPaymentMethods();

  const handleMethodSelect = (methodId: string) => {
    const method = methodId as PaymentMethod;
    setSelectedMethod(method);
  };

  const handleCashPayment = async () => {
    if (selectedMethod !== 'cash') return;

    try {
      const paymentRequest: UnifiedPaymentRequest = {
        amount,
        currency,
        orderId,
        customerEmail,
        customerName,
        description,
      };

      const result = await modernPaymentGatewayManager.processPayment('cash', paymentRequest);
      
      if (result.success) {
        onPaymentSuccess(result);
      } else {
        onPaymentError(result.errorMessage || 'Cash payment processing failed');
      }
    } catch (error) {
      console.error('Cash payment error:', error);
      onPaymentError(error instanceof Error ? error.message : 'Cash payment failed');
    }
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

  const availableMethods = paymentMethods.filter(method => {
    // First check if the method is available
    if (!method.available) return false;
    
    // On desktop, exclude mobile-only payment methods (if any are added in the future)
    if (!deviceCaps.isMobile && method.mobileOnly) return false;
    
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Payment Method Selection */}
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
              value={selectedMethod || ''} 
              onValueChange={handleMethodSelect}
              disabled={disabled}
            >
              {availableMethods.map((method) => {
                const fees = modernPaymentGatewayManager.calculateFees(amount, method.id);
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
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Payment Form based on selected method */}
      {selectedMethod === 'square' && availability.square && (
        <SquarePaymentForm
          applicationId={modernPaymentGatewayManager.getSquareConfig().applicationId}
          locationId={modernPaymentGatewayManager.getSquareConfig().locationId}
          environment={modernPaymentGatewayManager.getSquareConfig().environment}
          paymentRequest={{
            amount,
            currency,
            orderId,
            customerEmail,
            customerName,
          }}
          onPaymentSuccess={onPaymentSuccess}
          onPaymentError={onPaymentError}
          disabled={disabled}
        />
      )}

      {selectedMethod === 'paypal' && availability.paypal && (
        <PayPalPaymentForm
          clientId={modernPaymentGatewayManager.getPayPalConfig().clientId}
          environment={modernPaymentGatewayManager.getPayPalConfig().environment}
          paymentRequest={{
            amount: amount / 100, // Convert cents to dollars for PayPal
            currency,
            orderId,
            customerEmail,
            description,
          }}
          onPaymentSuccess={onPaymentSuccess}
          onPaymentError={onPaymentError}
          onPaymentCancel={onPaymentCancel}
          disabled={disabled}
        />
      )}

      {selectedMethod === 'cash' && (
        <Card>
          <CardHeader>
            <CardTitle>Cash Payment</CardTitle>
            <CardDescription>
              Reserve your tickets and pay cash at the venue
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Your tickets will be reserved for 4 hours. Please arrive at the venue 
                early to complete your payment with the event organizers.
              </AlertDescription>
            </Alert>
            
            <Button 
              onClick={handleCashPayment}
              disabled={disabled}
              className="w-full"
              size="lg"
            >
              Reserve Tickets for Cash Payment
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Security Notice */}
      {selectedMethod && selectedMethod !== 'cash' && (
        <div className="text-xs text-muted-foreground">
          <p>
            All transactions are secure and encrypted. Your payment information is never stored on our servers.
          </p>
        </div>
      )}
    </div>
  );
};

export default ModernPaymentMethodSelector;