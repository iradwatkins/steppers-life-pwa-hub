import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Percent, X, Check } from 'lucide-react';
import type { PromoCodeApplication } from '@/types/ticket';

interface PromoCodeInputProps {
  eventId: number;
  subtotal: number;
  onPromoCodeApplied: (application: PromoCodeApplication | null) => void;
  appliedPromoCode?: PromoCodeApplication | null;
  disabled?: boolean;
}

// Mock promo codes for validation - replace with actual API call
const mockPromoCodes = [
  {
    code: 'EARLY20',
    type: 'percentage' as const,
    value: 20,
    isActive: true,
    validFrom: '2024-01-01T00:00:00Z',
    validUntil: '2024-12-31T23:59:59Z'
  },
  {
    code: 'SAVE50',
    type: 'fixed' as const,
    value: 50,
    isActive: true,
    validFrom: '2024-01-01T00:00:00Z',
    validUntil: '2024-12-31T23:59:59Z'
  },
  {
    code: 'STUDENT15',
    type: 'percentage' as const,
    value: 15,
    isActive: true,
    validFrom: '2024-01-01T00:00:00Z',
    validUntil: '2024-12-31T23:59:59Z'
  }
];

const PromoCodeInput: React.FC<PromoCodeInputProps> = ({
  eventId,
  subtotal,
  onPromoCodeApplied,
  appliedPromoCode,
  disabled = false
}) => {
  const [promoCode, setPromoCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  const calculateDiscount = (type: 'percentage' | 'fixed', value: number, subtotal: number): number => {
    if (type === 'percentage') {
      return Math.round((subtotal * value / 100) * 100) / 100;
    } else {
      return Math.min(value, subtotal);
    }
  };

  const validatePromoCode = async (code: string): Promise<PromoCodeApplication | null> => {
    // Mock validation - replace with actual API call
    const foundCode = mockPromoCodes.find(
      pc => pc.code.toUpperCase() === code.toUpperCase() && pc.isActive
    );

    if (!foundCode) {
      throw new Error('Invalid promo code');
    }

    const now = new Date();
    const validFrom = new Date(foundCode.validFrom);
    const validUntil = new Date(foundCode.validUntil);

    if (now < validFrom || now > validUntil) {
      throw new Error('Promo code has expired');
    }

    const discountAmount = calculateDiscount(foundCode.type, foundCode.value, subtotal);

    return {
      promo_code: foundCode.code,
      discount_amount: discountAmount,
      discount_type: foundCode.type,
      discount_value: foundCode.value
    };
  };

  const handleApplyPromoCode = async () => {
    if (!promoCode.trim()) {
      toast.error('Please enter a promo code');
      return;
    }

    setIsValidating(true);
    try {
      const application = await validatePromoCode(promoCode.trim());
      onPromoCodeApplied(application);
      toast.success('Promo code applied successfully!');
      setPromoCode('');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to apply promo code');
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemovePromoCode = () => {
    onPromoCodeApplied(null);
    toast.success('Promo code removed');
  };

  const formatDiscount = (application: PromoCodeApplication): string => {
    if (application.discount_type === 'percentage') {
      return `${application.discount_value}% off`;
    } else {
      return `$${application.discount_amount.toFixed(2)} off`;
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        {appliedPromoCode ? (
          // Applied promo code display
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <span className="font-medium">Promo Code Applied</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemovePromoCode}
                disabled={disabled}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="font-mono">
                  {appliedPromoCode.promo_code}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {formatDiscount(appliedPromoCode)}
                </span>
              </div>
              <span className="font-medium text-green-600">
                -${appliedPromoCode.discount_amount.toFixed(2)}
              </span>
            </div>
          </div>
        ) : (
          // Promo code input
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Percent className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Have a promo code?</span>
            </div>
            
            <div className="flex gap-2">
              <Input
                placeholder="Enter promo code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleApplyPromoCode();
                  }
                }}
                disabled={disabled || isValidating}
                className="font-mono"
              />
              <Button
                onClick={handleApplyPromoCode}
                disabled={disabled || isValidating || !promoCode.trim()}
                size="sm"
              >
                {isValidating ? 'Applying...' : 'Apply'}
              </Button>
            </div>
            
            {/* Sample promo codes for demo */}
            <div className="text-xs text-muted-foreground">
              <p>Try: EARLY20, SAVE50, or STUDENT15</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PromoCodeInput;