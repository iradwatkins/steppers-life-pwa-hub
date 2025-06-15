import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Event } from '../../types';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useToast } from '../../hooks/use-toast';
import { paymentService } from '../../services/paymentService';
import { ticketService } from '../../services/ticketService';
import { tableService } from '../../services/tableService';

interface CheckoutFormProps {
  event: Event;
  purchaseType: 'ticket' | 'table';
  purchaseData: {
    ticketType?: string;
    quantity?: number;
    tableId?: number;
    attendeeName: string;
    attendeeEmail: string;
    attendeePhone?: string;
  };
  onCheckoutComplete: (orderId: number) => void;
}

const checkoutSchema = z.object({
  cardNumber: z.string().min(16, 'Card number must be 16 digits'),
  expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/([0-9]{2})$/, 'Invalid expiry date'),
  cvv: z.string().min(3, 'CVV must be 3 digits'),
  name: z.string().min(1, 'Name is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zip: z.string().min(5, 'ZIP code is required')
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export const CheckoutForm: React.FC<CheckoutFormProps> = ({
  event,
  purchaseType,
  purchaseData,
  onCheckoutComplete
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema)
  });

  const calculateTotal = () => {
    if (purchaseType === 'ticket') {
      const ticketType = event.ticket_types.find(t => t.name === purchaseData.ticketType);
      return ticketType ? ticketType.price * (purchaseData.quantity || 1) : 0;
    } else {
      const section = event.sections?.find(s => 
        s.tables.some(t => t.id === purchaseData.tableId)
      );
      const table = section?.tables.find(t => t.id === purchaseData.tableId);
      return table ? table.price : 0;
    }
  };

  const handlePayment = async (data: CheckoutFormData) => {
    setLoading(true);
    try {
      const total = calculateTotal();
      const { processingFee, totalAmount } = paymentService.calculateFees(total);

      // Create payment intent
      const paymentResponse = await paymentService.createPaymentIntent(totalAmount);
      if (!paymentResponse.success || !paymentResponse.data) {
        throw new Error(paymentResponse.error || 'Failed to create payment intent');
      }

      // Process purchase based on type
      if (purchaseType === 'ticket') {
        const ticketResponse = await ticketService.purchaseTicket({
          event_id: event.id,
          ticket_type: purchaseData.ticketType!,
          quantity: purchaseData.quantity!,
          attendee_name: purchaseData.attendeeName,
          attendee_email: purchaseData.attendeeEmail,
          attendee_phone: purchaseData.attendeePhone
        });

        if (!ticketResponse.success || !ticketResponse.data) {
          throw new Error(ticketResponse.error || 'Failed to purchase ticket');
        }

        // Confirm payment
        const confirmResponse = await paymentService.confirmPayment(
          paymentResponse.data.id
        );
        if (!confirmResponse.success) {
          throw new Error(confirmResponse.error || 'Failed to confirm payment');
        }

        onCheckoutComplete(ticketResponse.data.id);
      } else {
        const tableResponse = await tableService.reserveTable({
          event_id: event.id,
          table_id: purchaseData.tableId!,
          attendee_name: purchaseData.attendeeName,
          attendee_email: purchaseData.attendeeEmail,
          attendee_phone: purchaseData.attendeePhone
        });

        if (!tableResponse.success || !tableResponse.data) {
          throw new Error(tableResponse.error || 'Failed to reserve table');
        }

        // Confirm payment
        const confirmResponse = await paymentService.confirmPayment(
          paymentResponse.data.id
        );
        if (!confirmResponse.success) {
          throw new Error(confirmResponse.error || 'Failed to confirm payment');
        }

        onCheckoutComplete(tableResponse.data.id);
      }

      toast({
        title: 'Success',
        description: `Your ${purchaseType} has been purchased successfully!`,
        variant: 'default'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Payment failed',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Checkout</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handlePayment)} className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-semibold">Payment Information</h3>
            <div className="space-y-2">
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input
                id="cardNumber"
                {...register('cardNumber')}
                placeholder="1234 5678 9012 3456"
                maxLength={16}
              />
              {errors.cardNumber && (
                <p className="text-sm text-feedback-error">{errors.cardNumber.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input
                  id="expiryDate"
                  {...register('expiryDate')}
                  placeholder="MM/YY"
                  maxLength={5}
                />
                {errors.expiryDate && (
                  <p className="text-sm text-feedback-error">{errors.expiryDate.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  {...register('cvv')}
                  placeholder="123"
                  maxLength={3}
                  type="password"
                />
                {errors.cvv && (
                  <p className="text-sm text-feedback-error">{errors.cvv.message}</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Billing Information</h3>
            <div className="space-y-2">
              <Label htmlFor="name">Name on Card</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="John Doe"
              />
              {errors.name && (
                <p className="text-sm text-feedback-error">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                {...register('address')}
                placeholder="123 Main St"
              />
              {errors.address && (
                <p className="text-sm text-feedback-error">{errors.address.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  {...register('city')}
                  placeholder="New York"
                />
                {errors.city && (
                  <p className="text-sm text-feedback-error">{errors.city.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  {...register('state')}
                  placeholder="NY"
                  maxLength={2}
                />
                {errors.state && (
                  <p className="text-sm text-feedback-error">{errors.state.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="zip">ZIP Code</Label>
              <Input
                id="zip"
                {...register('zip')}
                placeholder="10001"
                maxLength={5}
              />
              {errors.zip && (
                <p className="text-sm text-feedback-error">{errors.zip.message}</p>
              )}
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Subtotal</span>
                <span>${calculateTotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Processing Fee</span>
                <span>${paymentService.calculateFees(calculateTotal()).processingFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center font-semibold">
                <span>Total</span>
                <span>${paymentService.calculateFees(calculateTotal()).totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full mt-4"
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Complete Purchase'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}; 