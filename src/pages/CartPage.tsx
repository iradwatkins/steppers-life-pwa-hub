import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Plus, Minus, Trash2, ArrowLeft, ArrowRight } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import PromoCodeInput from '@/components/checkout/PromoCodeInput';

const CartPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { state, updateQuantity, removeItem, setPromoCode } = useCart();

  const handleQuantityChange = (ticketTypeId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(ticketTypeId);
      toast.success('Item removed from cart');
    } else {
      updateQuantity(ticketTypeId, newQuantity);
    }
  };

  const handleRemoveItem = (ticketTypeId: string, ticketName: string) => {
    removeItem(ticketTypeId);
    toast.success(`${ticketName} removed from cart`);
  };

  const handleContinueShopping = () => {
    if (state.eventId) {
      navigate(`/events/${state.eventId}/tickets`);
    } else {
      navigate('/events');
    }
  };

  const handleProceedToCheckout = () => {
    navigate('/checkout/details');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center py-16">
            <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
            <p className="text-muted-foreground mb-8">
              Looks like you haven't added any tickets to your cart yet.
            </p>
            <Button onClick={() => navigate('/events')} className="bg-stepping-gradient">
              Browse Events
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <ShoppingCart className="h-8 w-8 text-blue-500" />
            <div>
              <h1 className="text-3xl font-bold">Shopping Cart</h1>
              <p className="text-muted-foreground">
                Review your tickets before checkout
              </p>
            </div>
          </div>
          
          {state.eventTitle && (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-sm">
                Event: {state.eventTitle}
              </Badge>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Cart Items ({state.items.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {state.items.map((item) => (
                  <div key={item.ticketType.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{item.ticketType.name}</h3>
                      {item.ticketType.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {item.ticketType.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-lg font-bold text-green-600">
                          {formatPrice(item.ticketType.price)}
                        </span>
                        <span className="text-sm text-muted-foreground">per ticket</span>
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleQuantityChange(item.ticketType.id, item.quantity - 1)}
                        className="h-8 w-8"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 0;
                          handleQuantityChange(item.ticketType.id, value);
                        }}
                        className="w-16 text-center"
                        min="0"
                        max={item.ticketType.availableQuantity || 10}
                      />
                      
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleQuantityChange(item.ticketType.id, item.quantity + 1)}
                        className="h-8 w-8"
                        disabled={item.quantity >= (item.ticketType.availableQuantity || 10)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Item Total */}
                    <div className="text-right min-w-[100px]">
                      <div className="font-bold text-lg">
                        {formatPrice(item.ticketType.price * item.quantity)}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveItem(item.ticketType.id, item.ticketType.name)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Promo Code Section */}
            <Card>
              <CardHeader>
                <CardTitle>Promo Code</CardTitle>
                <CardDescription>
                  Have a promo code? Enter it here to apply discounts.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PromoCodeInput
                  eventId={state.eventId || ''}
                  onPromoCodeApplied={setPromoCode}
                  currentPromoCode={state.promoCodeApplication}
                />
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Items breakdown */}
                <div className="space-y-2">
                  {state.items.map((item) => (
                    <div key={item.ticketType.id} className="flex justify-between text-sm">
                      <span>
                        {item.ticketType.name} × {item.quantity}
                      </span>
                      <span>{formatPrice(item.ticketType.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Subtotal */}
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatPrice(state.subtotal)}</span>
                </div>

                {/* Discount */}
                {state.discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>
                      Discount
                      {state.promoCodeApplication?.promoCode && (
                        <span className="text-xs ml-1">
                          ({state.promoCodeApplication.promoCode})
                        </span>
                      )}
                    </span>
                    <span>-{formatPrice(state.discountAmount)}</span>
                  </div>
                )}

                <Separator />

                {/* Total */}
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{formatPrice(state.total)}</span>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 pt-4">
                  <Button
                    onClick={handleProceedToCheckout}
                    className="w-full bg-stepping-gradient"
                    size="lg"
                  >
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Proceed to Checkout
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={handleContinueShopping}
                    className="w-full"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Continue Shopping
                  </Button>
                </div>

                {/* Security Notice */}
                <div className="text-xs text-muted-foreground text-center pt-4 border-t">
                  🔒 Secure checkout powered by Stripe
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage; 