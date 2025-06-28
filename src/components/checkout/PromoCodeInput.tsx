
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PromoCodeInputProps {
  onApply: (code: string) => void;
  isLoading?: boolean;
  className?: string;
}

const PromoCodeInput: React.FC<PromoCodeInputProps> = ({ onApply, isLoading, className }) => {
  const [code, setCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim()) {
      onApply(code.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-2 ${className}`}>
      <Label htmlFor="promo-code">Promo Code</Label>
      <div className="flex gap-2">
        <Input
          id="promo-code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter promo code"
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading || !code.trim()}>
          Apply
        </Button>
      </div>
    </form>
  );
};

export default PromoCodeInput;
