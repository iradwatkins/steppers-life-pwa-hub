import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CreditCard, Wallet, DollarSign, Shield, Clock } from 'lucide-react';
import { paymentService, PaymentProvider } from '@/services/paymentService';
import { toast } from 'sonner';

interface PaymentProviderSelectorProps {
  selectedProvider: string | null;
  onProviderSelect: (provider: string) => void;
  amount: number;
  currency?: string;
  disabled?: boolean;
}

interface ProviderConfig extends PaymentProvider {
  id: string;
  icon: React.ReactNode;
  badges: string[];
  processingTime: string;
  fees: string;
}

export function PaymentProviderSelector({
  selectedProvider,
  onProviderSelect,
  amount,
  currency = 'USD',
  disabled = false
}: PaymentProviderSelectorProps) {
  const [providers, setProviders] = useState<Record<string, PaymentProvider>>({});
  const [loading, setLoading] = useState(true);
  const [availableProviders, setAvailableProviders] = useState<string[]>([]);

  useEffect(() => {
    loadPaymentProviders();
  }, []);

  const loadPaymentProviders = async () => {
    try {
      setLoading(true);
      
      // Initialize payment service and get configuration
      const config = await paymentService.initialize();
      const providerDetails = await paymentService.getPaymentProviders();
      
      setAvailableProviders(config.available_providers);
      setProviders(providerDetails);
    } catch (error) {
      console.error('Failed to load payment providers:', error);
      toast.error('Failed to load payment options');
    } finally {
      setLoading(false);
    }
  };

  const getProviderConfig = (providerId: string): ProviderConfig => {
    const provider = providers[providerId];
    
    const baseConfig = {
      id: providerId,
      name: provider?.name || providerId,
      description: provider?.description || '',
      supports_cards: provider?.supports_cards || false,
      supports_digital_wallets: provider?.supports_digital_wallets || false,
      icon: <CreditCard className="h-5 w-5" />,
      badges: [] as string[],
      processingTime: 'Instant',
      fees: 'Standard fees apply'
    };

    switch (providerId) {
      case 'square':
        return {
          ...baseConfig,
          icon: <CreditCard className="h-5 w-5" />,
          badges: ['Secure', 'Instant'],
          processingTime: 'Instant',
          fees: '2.9% + 30¢'
        };

      case 'paypal':
        return {
          ...baseConfig,
          icon: <Wallet className="h-5 w-5" />,
          badges: ['Secure', 'Popular'],
          processingTime: 'Instant',
          fees: '2.9% + fixed fee'
        };

      case 'cash':
        return {
          ...baseConfig,
          icon: <DollarSign className="h-5 w-5" />,
          badges: ['No fees', 'Event pickup'],
          processingTime: 'At event',
          fees: 'No processing fees'
        };

      default:
        return baseConfig;
    }
  };

  const formattedAmount = paymentService.formatCurrency(amount, currency);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment Options</CardTitle>
          <CardDescription>Loading payment methods...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (availableProviders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment Options</CardTitle>
          <CardDescription>No payment methods available</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Please contact support for assistance with payment options.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Choose Payment Method
        </CardTitle>
        <CardDescription>
          Select how you'd like to pay {formattedAmount}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={selectedProvider || ''}
          onValueChange={onProviderSelect}
          disabled={disabled}
          className="space-y-3"
        >
          {availableProviders.map((providerId) => {
            const config = getProviderConfig(providerId);
            const isSelected = selectedProvider === providerId;

            return (
              <div key={providerId} className="relative">
                <Label
                  htmlFor={providerId}
                  className={`
                    flex items-center space-x-4 rounded-lg border-2 p-4 cursor-pointer
                    transition-all duration-200 hover:bg-accent
                    ${isSelected 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border'
                    }
                    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  <RadioGroupItem
                    value={providerId}
                    id={providerId}
                    disabled={disabled}
                    className="mt-1"
                  />
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                          {config.icon}
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm">{config.name}</h3>
                          <p className="text-xs text-muted-foreground">{config.description}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <div className="flex gap-1">
                          {config.badges.map((badge) => (
                            <Badge key={badge} variant="secondary" className="text-xs">
                              {badge}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {config.processingTime}
                      </div>
                      <div className="text-right">
                        {config.fees}
                      </div>
                    </div>

                    {/* Payment method specific features */}
                    {providerId === 'square' && (
                      <div className="flex gap-2 text-xs text-muted-foreground">
                        <span>💳 Credit/Debit Cards</span>
                        <span>📱 Cash App</span>
                        <span>🍎 Apple Pay</span>
                        <span>🔗 Google Pay</span>
                      </div>
                    )}

                    {providerId === 'paypal' && (
                      <div className="flex gap-2 text-xs text-muted-foreground">
                        <span>💳 PayPal Balance</span>
                        <span>🏦 Bank Account</span>
                        <span>💳 Cards via PayPal</span>
                      </div>
                    )}

                    {providerId === 'cash' && (
                      <div className="text-xs text-muted-foreground">
                        ⚠️ Payment required at event check-in
                      </div>
                    )}
                  </div>
                </Label>
              </div>
            );
          })}
        </RadioGroup>

        {selectedProvider && (
          <div className="mt-4 p-3 bg-primary/5 rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <Shield className="h-4 w-4 text-primary" />
              <span className="font-medium">Secure Payment</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {selectedProvider === 'square' && 'Your payment is processed securely through Square\'s encrypted platform.'}
              {selectedProvider === 'paypal' && 'Your payment is processed securely through PayPal\'s trusted platform.'}
              {selectedProvider === 'cash' && 'Cash payment will be collected securely at the event location.'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 