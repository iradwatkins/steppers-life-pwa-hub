import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useCart, type TicketType } from '@/contexts/CartContext';
import { Calendar, MapPin, Clock, Users, ShoppingCart, Plus, Minus } from 'lucide-react';

const TicketSelectionPage = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { state, addItem, updateQuantity, removeItem, setEvent, setStep } = useCart();
  const [selectedQuantities, setSelectedQuantities] = useState<Record<string, number>>({});

  // Mock event data - in real app, this would come from API
  const mockEvent = {
    id: eventId || '1',
    title: 'Chicago Stepping Championship',
    date: 'December 15, 2024',
    time: '7:00 PM',
    location: 'Navy Pier Grand Ballroom',
    description: 'Join us for the most prestigious stepping competition in Chicago.',
    image: '/placeholder.svg',
    ticketTypes: [
      {
        id: 'general',
        name: 'General Admission',
        price: 45,
        description: 'Access to main floor seating and dance area',
        availableQuantity: 150
      },
      {
        id: 'vip',
        name: 'VIP Experience',
        price: 85,
        description: 'Premium seating, complimentary drinks, and meet & greet',
        availableQuantity: 25
      },
      {
        id: 'table',
        name: 'Reserved Table (8 seats)',
        price: 320,
        description: 'Private table for 8 with premium service',
        availableQuantity: 10
      }
    ] as TicketType[]
  };

  useEffect(() => {
    setEvent(mockEvent.id, mockEvent.title);
    setStep(1);
  }, [eventId, setEvent, setStep]);

  const handleQuantityChange = (ticketType: TicketType, quantity: number) => {
    setSelectedQuantities(prev => ({
      ...prev,
      [ticketType.id]: quantity
    }));

    const currentItem = state.items.find(item => item.ticketType.id === ticketType.id);
    
    if (quantity === 0) {
      if (currentItem) {
        removeItem(ticketType.id);
      }
    } else {
      if (currentItem) {
        updateQuantity(ticketType.id, quantity);
      } else {
        addItem(ticketType, quantity);
      }
    }
  };

  const getQuantity = (ticketTypeId: string) => {
    return selectedQuantities[ticketTypeId] || 0;
  };

  const canProceed = state.items.length > 0;

  const handleProceedToCheckout = () => {
    if (canProceed) {
      navigate(`/checkout/details`);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        {/* Event Header */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1">
                  <CardTitle className="text-2xl md:text-3xl mb-2">{mockEvent.title}</CardTitle>
                  <div className="flex flex-wrap gap-4 text-muted-foreground mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {mockEvent.date}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {mockEvent.time}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {mockEvent.location}
                    </div>
                  </div>
                  <CardDescription>{mockEvent.description}</CardDescription>
                </div>
                <div className="lg:w-48">
                  <div className="aspect-square bg-muted rounded-lg"></div>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Ticket Selection */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-6">Select Your Tickets</h2>
            <div className="space-y-4">
              {mockEvent.ticketTypes.map((ticketType) => (
                <Card key={ticketType.id}>
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{ticketType.name}</CardTitle>
                        <CardDescription className="mt-1">{ticketType.description}</CardDescription>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary">
                            <Users className="h-3 w-3 mr-1" />
                            {ticketType.availableQuantity} available
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-stepping-purple">
                          ${ticketType.price}
                        </div>
                        <div className="text-sm text-muted-foreground">per ticket</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuantityChange(ticketType, Math.max(0, getQuantity(ticketType.id) - 1))}
                          disabled={getQuantity(ticketType.id) === 0}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-12 text-center font-medium">
                          {getQuantity(ticketType.id)}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuantityChange(ticketType, getQuantity(ticketType.id) + 1)}
                          disabled={getQuantity(ticketType.id) >= ticketType.availableQuantity}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <Select
                        value={getQuantity(ticketType.id).toString()}
                        onValueChange={(value) => handleQuantityChange(ticketType, parseInt(value))}
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: Math.min(ticketType.availableQuantity + 1, 11) }, (_, i) => (
                            <SelectItem key={i} value={i.toString()}>
                              {i}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                {state.items.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    No tickets selected
                  </p>
                ) : (
                  <div className="space-y-4">
                    {state.items.map((item) => (
                      <div key={item.ticketType.id} className="flex justify-between">
                        <div>
                          <div className="font-medium">{item.ticketType.name}</div>
                          <div className="text-sm text-muted-foreground">
                            ${item.ticketType.price} × {item.quantity}
                          </div>
                        </div>
                        <div className="font-medium">
                          ${item.ticketType.price * item.quantity}
                        </div>
                      </div>
                    ))}
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>${state.total}</span>
                    </div>
                  </div>
                )}
                
                <Button 
                  className="w-full mt-6" 
                  disabled={!canProceed}
                  onClick={handleProceedToCheckout}
                >
                  Proceed to Checkout
                </Button>
                
                {!canProceed && (
                  <p className="text-sm text-muted-foreground text-center mt-2">
                    Please select at least one ticket to continue
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketSelectionPage;