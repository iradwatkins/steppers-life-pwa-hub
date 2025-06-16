import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/hooks/useAuth';
import { CashPaymentService, type CashPaymentCode } from '@/services/cashPaymentService';
import { 
  QrCode, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Copy, 
  MapPin,
  Phone,
  Mail,
  RefreshCw,
  ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';

const CashPaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { state: cartState, clearCart } = useCart();
  const { user } = useAuth();
  const [paymentCode, setPaymentCode] = useState<CashPaymentCode | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState<{
    hours: number;
    minutes: number;
    isExpired: boolean;
  }>({ hours: 0, minutes: 0, isExpired: false });

  // Get payment code from URL params or create new one
  useEffect(() => {
    const initializePayment = async () => {
      const existingCode = searchParams.get('code');
      
      if (existingCode) {
        // Load existing payment code
        const existing = await CashPaymentService.getCashPaymentStatus(existingCode);
        if (existing) {
          setPaymentCode(existing);
          if (existing.status === 'paid') {
            navigate(`/checkout/confirmation?orderId=${existing.orderId}`);
            return;
          }
        }
      } else if (cartState.items.length > 0 && user) {
        // Create new payment code from cart
        try {
          const cashPayment = await CashPaymentService.createCashPaymentOrder({
            eventId: cartState.eventId || '',
            userId: user.id,
            items: cartState.items.map(item => ({
              ticketTypeId: item.ticketType.id,
              quantity: item.quantity,
              price: item.ticketType.price,
            })),
            totalAmount: cartState.total,
            discountAmount: cartState.discount,
            promoCode: cartState.promoCode,
            customerDetails: {
              name: user.user_metadata?.full_name || user.email || '',
              email: user.email || '',
              phone: user.user_metadata?.phone || '',
            },
          });

          if (cashPayment) {
            setPaymentCode(cashPayment);
            // Update URL with payment code
            navigate(`/cash-payment?code=${cashPayment.paymentCode}`, { replace: true });
          } else {
            toast.error('Failed to create cash payment. Please try again.');
            navigate('/checkout/payment');
          }
        } catch (error) {
          console.error('Error creating cash payment:', error);
          toast.error('Failed to create cash payment. Please try again.');
          navigate('/checkout/payment');
        }
      } else {
        // No cart or payment code, redirect to events
        navigate('/events');
      }
      
      setIsLoading(false);
    };

    initializePayment();
  }, [searchParams, cartState, user, navigate]);

  // Update time remaining every minute
  useEffect(() => {
    if (!paymentCode) return;

    const updateTimer = () => {
      const remaining = CashPaymentService.getTimeRemaining(paymentCode.expiresAt);
      setTimeRemaining(remaining);
      
      if (remaining.isExpired && paymentCode.status === 'pending') {
        setPaymentCode(prev => prev ? { ...prev, status: 'expired' } : null);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [paymentCode]);

  // Check payment status periodically
  useEffect(() => {
    if (!paymentCode || paymentCode.status !== 'pending') return;

    const checkStatus = async () => {
      const updated = await CashPaymentService.getCashPaymentStatus(paymentCode.paymentCode);
      if (updated && updated.status !== paymentCode.status) {
        setPaymentCode(updated);
        
        if (updated.status === 'paid') {
          clearCart();
          navigate(`/checkout/confirmation?orderId=${updated.orderId}`);
        }
      }
    };

    const interval = setInterval(checkStatus, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [paymentCode, navigate, clearCart]);

  const handleCopyCode = async () => {
    if (paymentCode) {
      try {
        await navigator.clipboard.writeText(paymentCode.paymentCode);
        toast.success('Payment code copied to clipboard');
      } catch (error) {
        toast.error('Failed to copy payment code');
      }
    }
  };

  const handleRefreshStatus = async () => {
    if (!paymentCode) return;
    
    const updated = await CashPaymentService.getCashPaymentStatus(paymentCode.paymentCode);
    if (updated) {
      setPaymentCode(updated);
      if (updated.status === 'paid') {
        clearCart();
        navigate(`/checkout/confirmation?orderId=${updated.orderId}`);
      }
    }
  };

  const handleCancelPayment = async () => {
    if (!paymentCode) return;
    
    if (window.confirm('Are you sure you want to cancel this payment? This will release your ticket reservations.')) {
      const success = await CashPaymentService.cancelCashPayment(paymentCode.paymentCode);
      if (success) {
        toast.success('Payment cancelled successfully');
        navigate('/events');
      } else {
        toast.error('Failed to cancel payment');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Setting up your cash payment...</p>
        </div>
      </div>
    );
  }

  if (!paymentCode) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Payment Not Found</CardTitle>
            <CardDescription>The payment code could not be found or has expired.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/events')} className="w-full">
              Browse Events
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusBadge = () => {
    switch (paymentCode.status) {
      case 'pending':
        return <Badge variant="outline" className="border-orange-500 text-orange-700">Awaiting Payment</Badge>;
      case 'paid':
        return <Badge variant="outline" className="border-green-500 text-green-700">Paid</Badge>;
      case 'expired':
        return <Badge variant="destructive">Expired</Badge>;
      case 'cancelled':
        return <Badge variant="secondary">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)} className="p-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Cash Payment</h1>
            <p className="text-muted-foreground">Complete your payment at the venue</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Payment Code Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="h-5 w-5" />
                  Payment Code
                </CardTitle>
                {getStatusBadge()}
              </div>
              <CardDescription>
                Show this code at the venue to complete your payment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Payment Code */}
              <div className="text-center space-y-4">
                <div className="text-4xl font-mono font-bold tracking-wider bg-muted p-4 rounded-lg">
                  {paymentCode.paymentCode}
                </div>
                <Button variant="outline" onClick={handleCopyCode} className="w-full">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Code
                </Button>
              </div>

              {/* QR Code Placeholder */}
              <div className="text-center">
                <div className="w-48 h-48 bg-muted rounded-lg mx-auto flex items-center justify-center">
                  <QrCode className="h-24 w-24 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  QR Code for quick scanning
                </p>
              </div>

              {/* Timer */}
              {paymentCode.status === 'pending' && !timeRemaining.isExpired && (
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 text-lg font-medium">
                    <Clock className="h-5 w-5" />
                    <span>
                      {timeRemaining.hours}h {timeRemaining.minutes}m remaining
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Payment must be completed within this time
                  </p>
                </div>
              )}

              {/* Status Messages */}
              {paymentCode.status === 'expired' && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    This payment code has expired. Your ticket reservations have been released.
                  </AlertDescription>
                </Alert>
              )}

              {paymentCode.status === 'paid' && (
                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>
                    Payment received! Your tickets are confirmed.
                  </AlertDescription>
                </Alert>
              )}

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button 
                  onClick={handleRefreshStatus} 
                  variant="outline" 
                  className="w-full"
                  disabled={paymentCode.status !== 'pending'}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Check Payment Status
                </Button>
                
                {paymentCode.status === 'pending' && (
                  <Button 
                    onClick={handleCancelPayment} 
                    variant="outline" 
                    className="w-full text-destructive hover:text-destructive"
                  >
                    Cancel Payment
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Payment Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Instructions</CardTitle>
              <CardDescription>
                How to complete your cash payment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="font-medium">Visit the Venue</h3>
                    <p className="text-sm text-muted-foreground">
                      Go to the event venue at least 30 minutes before the event starts
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="font-medium">Find the Payment Desk</h3>
                    <p className="text-sm text-muted-foreground">
                      Look for the "Cash Payment" or "Will Call" desk at the entrance
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="font-medium">Show Your Code</h3>
                    <p className="text-sm text-muted-foreground">
                      Present your payment code or QR code to the staff member
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                    4
                  </div>
                  <div>
                    <h3 className="font-medium">Complete Payment</h3>
                    <p className="text-sm text-muted-foreground">
                      Pay the exact amount in cash and receive your tickets
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Payment Amount */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Payment Amount</h3>
                <div className="text-3xl font-bold">${paymentCode.amount.toFixed(2)}</div>
                <p className="text-sm text-muted-foreground">Total amount due in cash</p>
              </div>

              <Separator />

              {/* Contact Information */}
              <div className="space-y-3">
                <h3 className="font-medium">Need Help?</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>Navy Pier Grand Ballroom</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>(312) 555-0123</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>support@stepperslife.com</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CashPaymentPage;