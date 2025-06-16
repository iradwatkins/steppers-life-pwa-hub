import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { PromoCodeService } from '@/services/promoCodeService';
import { toast } from 'sonner';
import { Percent, X, Check } from 'lucide-react';

export interface PromoCodeApplication {
  promo_code: string;
  discount_amount: number;
  discount_type: 'percentage' | 'fixed_amount';
  discount_value: number;
}

interface PromoCodeInputProps {
  eventId: string;
  subtotal: number;
  onPromoCodeApplied: (application: PromoCodeApplication | null) => void;
  appliedPromoCode?: PromoCodeApplication | null;
  disabled?: boolean;
}

const PromoCodeInput: React.FC<PromoCodeInputProps> = ({
  eventId,
  subtotal,
  onPromoCodeApplied,
  appliedPromoCode,
  disabled = false
}) => {
  const [promoCode, setPromoCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  const validatePromoCode = async (code: string): Promise<PromoCodeApplication | null> => {
    try {
      const validation = await PromoCodeService.validatePromoCode(code.trim(), eventId, subtotal);
      
      if (!validation.isValid) {
        throw new Error(validation.errorMessage || 'Invalid promo code');
      }

      return {
        promo_code: code.trim().toUpperCase(),
        discount_amount: validation.discountAmount,
        discount_type: validation.promoCode!.discount_type,
        discount_value: validation.promoCode!.discount_value
      };
    } catch (error) {
      console.error('Error validating promo code:', error);
      throw error;
    }
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
      return `$${application.discount_value.toFixed(2)} off`;
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
            
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PromoCodeInput;