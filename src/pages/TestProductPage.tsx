import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Plus, CheckCircle } from 'lucide-react';
import { useCart, type SimpleProduct } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';

const TestProductPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addSimpleItem, state } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  // Test product - $1 for payment testing
  const testProduct: SimpleProduct = {
    id: 'test-product-1',
    name: 'Test Product',
    price: 1.00,
    description: 'Simple $1 test product for payment system validation'
  };

  const handleAddToCart = async () => {
    setIsAdding(true);
    
    try {
      addSimpleItem(testProduct, 1);
      
      toast({
        title: "Added to Cart",
        description: `${testProduct.name} has been added to your cart`,
      });

      // Brief delay to show feedback
      setTimeout(() => {
        setIsAdding(false);
      }, 500);
      
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive"
      });
      setIsAdding(false);
    }
  };

  const isInCart = state.simpleItems.some(item => item.product.id === testProduct.id);
  const cartQuantity = state.simpleItems.find(item => item.product.id === testProduct.id)?.quantity || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-4"
          >
            ← Back to Home
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment System Test</h1>
          <p className="text-gray-600">Test the checkout flow with a simple $1 product</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Product Card */}
          <Card className="h-fit">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">{testProduct.name}</CardTitle>
                <Badge variant="secondary" className="text-lg font-bold">
                  ${testProduct.price.toFixed(2)}
                </Badge>
              </div>
              <CardDescription>{testProduct.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="h-16 w-16 text-blue-500" />
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Price:</span>
                  <span className="text-lg font-semibold">${testProduct.price.toFixed(2)}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Stock:</span>
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    In Stock
                  </Badge>
                </div>

                {isInCart && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">In Cart:</span>
                    <Badge variant="default">
                      {cartQuantity} item{cartQuantity > 1 ? 's' : ''}
                    </Badge>
                  </div>
                )}
              </div>

              <Button
                onClick={handleAddToCart}
                disabled={isAdding}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {isAdding ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Adding...
                  </div>
                ) : isInCart ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Add Another
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add to Cart
                  </div>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Cart Summary */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Cart Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {state.simpleItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Your cart is empty</p>
                  <p className="text-sm">Add the test product to continue</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {state.simpleItems.map((item) => (
                      <div key={item.product.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium">{item.product.name}</div>
                          <div className="text-sm text-gray-600">
                            ${item.product.price.toFixed(2)} × {item.quantity}
                          </div>
                        </div>
                        <div className="font-semibold">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>Total:</span>
                      <span>${state.total.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Button
                      onClick={() => navigate('/simple-cart')}
                      variant="outline"
                      className="w-full"
                    >
                      View Cart
                    </Button>
                    <Button
                      onClick={() => navigate('/simple-checkout')}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      Proceed to Checkout
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Testing Instructions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Testing Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Test Steps:</h4>
                <ol className="list-decimal list-inside space-y-1 text-gray-600">
                  <li>Add the $1 test product to cart</li>
                  <li>Refresh the page (cart should persist)</li>
                  <li>View cart and proceed to checkout</li>
                  <li>Complete payment with test card</li>
                  <li>Verify confirmation and receipt email</li>
                </ol>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Test Card Numbers:</h4>
                <div className="space-y-1 text-gray-600">
                  <div><strong>Visa:</strong> 4111 1111 1111 1111</div>
                  <div><strong>Mastercard:</strong> 5555 5555 5555 4444</div>
                  <div><strong>Amex:</strong> 3782 822463 10005</div>
                  <div><strong>Any future date & any CVC</strong></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TestProductPage;