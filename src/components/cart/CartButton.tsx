import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

const CartButton = () => {
  const { state } = useCart();
  const navigate = useNavigate();
  const itemCount = state.items.reduce((total, item) => total + item.quantity, 0);

  const handleCartNavigation = () => {
    navigate('/cart');
  };

  return (
    <Button variant="ghost" size="icon" onClick={handleCartNavigation} className="relative">
      <ShoppingCart className="h-5 w-5" />
      {itemCount > 0 && (
        <Badge 
          variant="destructive" 
          className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
        >
          {itemCount > 99 ? '99+' : itemCount}
        </Badge>
      )}
      <span className="sr-only">
        Shopping cart with {itemCount} items
      </span>
    </Button>
  );
};

export default CartButton; 