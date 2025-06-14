import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { TicketType, Event } from '@/types/ticket';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Minus, Plus, Clock, Users, DollarSign } from 'lucide-react';

interface EnhancedTicketSelectionProps {
  event: Event;
  onSelectionComplete: (selectedTickets: {
    ticketType: string;
    quantity: number;
    attendeeName: string;
    attendeeEmail: string;
    attendeePhone?: string;
    totalAmount: number;
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

export const EnhancedTicketSelection: React.FC<EnhancedTicketSelectionProps> = ({
  event,
  onSelectionComplete
}) => {
  const { toast } = useToast();
  const [selectedTicketType, setSelectedTicketType] = useState<TicketType | null>(null);
  const [quantity, setQuantity] = useState(1);

  const {
    register,
    handleSubmit,
    setValue,
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
    setValue('ticketType', ticketType.name);
    setValue('quantity', 1);
  };

  const handleQuantityChange = (value: number) => {
    if (selectedTicketType && value >= 1 && value <= selectedTicketType.available) {
      setQuantity(value);
      setValue('quantity', value);
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

    const totalAmount = selectedTicketType.price * data.quantity;

    onSelectionComplete({
      ticketType: selectedTicketType.name,
      quantity: data.quantity,
      attendeeName: data.attendeeName,
      attendeeEmail: data.attendeeEmail,
      attendeePhone: data.attendeePhone,
      totalAmount
    });
  };

  const getTotalAmount = () => {
    if (!selectedTicketType) return 0;
    return selectedTicketType.price * quantity;
  };

  const getAvailabilityStatus = (available: number) => {
    if (available === 0) return { text: 'Sold Out', variant: 'destructive' as const };
    if (available <= 10) return { text: `Only ${available} left`, variant: 'destructive' as const };
    if (available <= 50) return { text: `${available} available`, variant: 'secondary' as const };
    return { text: `${available} available`, variant: 'secondary' as const };
  };

  return (
    <div className="space-y-6">
      {/* Event Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="mr-2 h-5 w-5" />
            {event.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center">
              <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>{new Date(event.date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center">
              <Users className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>{event.location}</span>
            </div>
            <div className="flex items-center">
              <DollarSign className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>{event.ticket_types.length} ticket types</span>
            </div>
          </div>
          {event.description && (
            <p className="mt-3 text-muted-foreground">{event.description}</p>
          )}
        </CardContent>
      </Card>

      {/* Ticket Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {event.ticket_types.map((ticketType) => {
              const availabilityStatus = getAvailabilityStatus(ticketType.available);
              const isSelected = selectedTicketType?.id === ticketType.id;
              const isSoldOut = ticketType.available === 0;
              
              return (
                <div
                  key={ticketType.id}
                  className={`p-4 border rounded-lg transition-all duration-200 ${
                    isSoldOut 
                      ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                      : isSelected
                        ? 'border-primary bg-primary/5 shadow-md cursor-pointer'
                        : 'border-border hover:border-primary/50 hover:shadow-sm cursor-pointer'
                  }`}
                  onClick={() => !isSoldOut && handleTicketTypeSelect(ticketType)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg">{ticketType.name}</h4>
                      <p className="text-muted-foreground mt-1">{ticketType.description}</p>
                      {ticketType.max_per_order && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Max {ticketType.max_per_order} per order
                        </p>
                      )}
                    </div>
                    <div className="text-right ml-4">
                      <span className="text-2xl font-bold text-primary">
                        ${ticketType.price.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <Badge variant={availabilityStatus.variant}>
                      {availabilityStatus.text}
                    </Badge>
                    {isSelected && !isSoldOut && (
                      <Badge variant="default">Selected</Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Attendee Information Form */}
      {selectedTicketType && (
        <Card>
          <CardHeader>
            <CardTitle>Attendee Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Quantity Selection */}
              <div className="space-y-3">
                <Label htmlFor="quantity" className="text-base font-medium">
                  Number of Tickets
                </Label>
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  
                  <div className="flex items-center gap-2">
                    <Input
                      id="quantity"
                      type="number"
                      min={1}
                      max={Math.min(selectedTicketType.available, selectedTicketType.max_per_order || selectedTicketType.available)}
                      value={quantity}
                      onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                      className="w-20 text-center"
                      {...register('quantity', { valueAsNumber: true })}
                    />
                    <span className="text-sm text-muted-foreground">
                      of {selectedTicketType.available} available
                    </span>
                  </div>
                  
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= Math.min(selectedTicketType.available, selectedTicketType.max_per_order || selectedTicketType.available)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {errors.quantity && (
                  <p className="text-sm text-destructive">{errors.quantity.message}</p>
                )}
              </div>

              {/* Attendee Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="attendeeName">Full Name *</Label>
                  <Input
                    id="attendeeName"
                    {...register('attendeeName')}
                    placeholder="Enter your full name"
                  />
                  {errors.attendeeName && (
                    <p className="text-sm text-destructive">{errors.attendeeName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="attendeeEmail">Email Address *</Label>
                  <Input
                    id="attendeeEmail"
                    type="email"
                    {...register('attendeeEmail')}
                    placeholder="Enter your email address"
                  />
                  {errors.attendeeEmail && (
                    <p className="text-sm text-destructive">{errors.attendeeEmail.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="attendeePhone">Phone Number (Optional)</Label>
                <Input
                  id="attendeePhone"
                  type="tel"
                  {...register('attendeePhone')}
                  placeholder="Enter your phone number"
                />
                {errors.attendeePhone && (
                  <p className="text-sm text-destructive">{errors.attendeePhone.message}</p>
                )}
              </div>

              {/* Order Summary */}
              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-medium mb-3">Order Summary</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>{selectedTicketType.name}</span>
                    <span>${selectedTicketType.price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Quantity</span>
                    <span>×{quantity}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total</span>
                      <span>${getTotalAmount().toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg">
                Continue to Payment - ${getTotalAmount().toFixed(2)}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};