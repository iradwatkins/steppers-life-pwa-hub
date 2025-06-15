import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { TicketType, Event } from '../../types';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { useToast } from '../../hooks/use-toast';

interface TicketSelectionProps {
  event: Event;
  onSelectionComplete: (selectedTickets: {
    ticketType: string;
    quantity: number;
    attendeeName: string;
    attendeeEmail: string;
    attendeePhone?: string;
  }) => void;
}

const ticketSelectionSchema = z.object({
  ticketType: z.string().min(1, 'Please select a ticket type'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  attendeeName: z.string().min(1, 'Name is required'),
  attendeeEmail: z.string().email('Invalid email address'),
  attendeePhone: z.string().optional()
});

type TicketSelectionFormData = z.infer<typeof ticketSelectionSchema>;

export const TicketSelection: React.FC<TicketSelectionProps> = ({
  event,
  onSelectionComplete
}) => {
  const { toast } = useToast();
  const [selectedTicketType, setSelectedTicketType] = useState<TicketType | null>(null);
  const [quantity, setQuantity] = useState(1);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<TicketSelectionFormData>({
    resolver: zodResolver(ticketSelectionSchema),
    defaultValues: {
      quantity: 1
    }
  });

  const handleTicketTypeSelect = (ticketType: TicketType) => {
    setSelectedTicketType(ticketType);
    setQuantity(1);
  };

  const handleQuantityChange = (value: number) => {
    if (selectedTicketType && value <= selectedTicketType.available) {
      setQuantity(value);
    }
  };

  const onSubmit = (data: TicketSelectionFormData) => {
    if (!selectedTicketType) {
      toast({
        title: 'Error',
        description: 'Please select a ticket type',
        variant: 'destructive'
      });
      return;
    }

    onSelectionComplete({
      ticketType: selectedTicketType.name,
      quantity: data.quantity,
      attendeeName: data.attendeeName,
      attendeeEmail: data.attendeeEmail,
      attendeePhone: data.attendeePhone
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Select Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {event.ticket_types.map((ticketType) => (
              <div
                key={ticketType.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedTicketType?.id === ticketType.id
                    ? 'border-brand-primary bg-brand-primary/5'
                    : 'border-border-default hover:border-brand-primary/50'
                }`}
                onClick={() => handleTicketTypeSelect(ticketType)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold text-text-primary">{ticketType.name}</h4>
                    <p className="text-sm text-text-secondary">{ticketType.description}</p>
                  </div>
                  <span className="text-xl font-bold text-brand-primary">
                    ${ticketType.price.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text-secondary">
                    {ticketType.available} available
                  </span>
                  {ticketType.available === 0 && (
                    <Badge variant="destructive">Sold Out</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedTicketType && (
        <Card>
          <CardHeader>
            <CardTitle>Attendee Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                  >
                    -
                  </Button>
                  <Input
                    id="quantity"
                    type="number"
                    min={1}
                    max={selectedTicketType.available}
                    value={quantity}
                    onChange={(e) => handleQuantityChange(parseInt(e.target.value))}
                    className="w-20 text-center"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= selectedTicketType.available}
                  >
                    +
                  </Button>
                </div>
                {errors.quantity && (
                  <p className="text-sm text-feedback-error">{errors.quantity.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="attendeeName">Name</Label>
                <Input
                  id="attendeeName"
                  {...register('attendeeName')}
                  placeholder="Enter your name"
                />
                {errors.attendeeName && (
                  <p className="text-sm text-feedback-error">{errors.attendeeName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="attendeeEmail">Email</Label>
                <Input
                  id="attendeeEmail"
                  type="email"
                  {...register('attendeeEmail')}
                  placeholder="Enter your email"
                />
                {errors.attendeeEmail && (
                  <p className="text-sm text-feedback-error">{errors.attendeeEmail.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="attendeePhone">Phone (Optional)</Label>
                <Input
                  id="attendeePhone"
                  type="tel"
                  {...register('attendeePhone')}
                  placeholder="Enter your phone number"
                />
                {errors.attendeePhone && (
                  <p className="text-sm text-feedback-error">{errors.attendeePhone.message}</p>
                )}
              </div>

              <div className="pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-text-secondary">Subtotal</span>
                  <span className="font-semibold">
                    ${(selectedTicketType.price * quantity).toFixed(2)}
                  </span>
                </div>
                <Button type="submit" className="w-full">
                  Continue to Payment
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}; 