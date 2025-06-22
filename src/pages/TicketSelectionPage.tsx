import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ExtensionWarningBanner } from '@/components/ExtensionWarningBanner';
import { useCart, type TicketType } from '@/contexts/CartContext';
import { useInventory, useBulkInventory, useInventoryHold } from '@/hooks/useInventory';
import { Calendar, MapPin, Clock, Users, ShoppingCart, Plus, Minus, AlertTriangle, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const TicketSelectionPage = () => {
  const { id: eventId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state, addItem, updateQuantity, removeItem, setEvent, setStep } = useCart();
  const [selectedQuantities, setSelectedQuantities] = useState<Record<string, number>>({});
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random()}`);
  const { createHold, releaseHold, currentHolds } = useInventoryHold();

  // PRODUCTION: Fetch real event and ticket data from database
  const [event, setEventData] = useState<any>(null);
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [isLoadingEvent, setIsLoadingEvent] = useState(true);
  const [eventError, setEventError] = useState<string | null>(null);

  // Fetch real event data from Supabase
  useEffect(() => {
    const fetchEventData = async () => {
      if (!eventId) {
        setEventError('No event ID provided');
        setIsLoadingEvent(false);
        return;
      }

      try {
        setIsLoadingEvent(true);
        setEventError(null);

        // Fetch event details
        const { data: eventData, error: eventError } = await supabase
          .from('events')
          .select('*')
          .eq('id', eventId)
          .single();

        if (eventError) {
          console.error('Error fetching event:', eventError);
          setEventError('Event not found');
          setIsLoadingEvent(false);
          return;
        }

        // Fetch ticket types for this event
        const { data: ticketTypesData, error: ticketTypesError } = await supabase
          .from('ticket_types')
          .select('*')
          .eq('event_id', eventId)
          .order('price', { ascending: true });

        if (ticketTypesError) {
          console.error('Error fetching ticket types:', ticketTypesError);
          setEventError('Unable to load ticket information');
          setIsLoadingEvent(false);
          return;
        }

        setEventData(eventData);
        setTicketTypes(ticketTypesData || []);
        setIsLoadingEvent(false);

      } catch (error) {
        console.error('Error loading event data:', error);
        setEventError('Failed to load event data');
        setIsLoadingEvent(false);
      }
    };

    fetchEventData();
  }, [eventId]);

  // Get real-time inventory for all ticket types
  const ticketTypeIds = ticketTypes.map(tt => tt.id);
  const { statuses: inventoryStatuses, isLoading: inventoryLoading } = useBulkInventory(ticketTypeIds);

  // PRODUCTION: Only use real inventory data, no fallbacks
  const getInventoryStatus = (ticketTypeId: string) => {
    return inventoryStatuses.find(status => status.ticketTypeId === ticketTypeId);
  };

  useEffect(() => {
    if (event) {
      setEvent(event.id, event.title);
      setStep(1);
    }
  }, [event, setEvent, setStep]);

  const handleQuantityChange = async (ticketType: TicketType, quantity: number) => {
    const inventoryStatus = getInventoryStatus(ticketType.id);
    
    // Check if requested quantity is available
    if (quantity > 0 && inventoryStatus && quantity > inventoryStatus.available) {
      alert(`Only ${inventoryStatus.available} tickets available for ${ticketType.name}`);
      return;
    }

    setSelectedQuantities(prev => ({
      ...prev,
      [ticketType.id]: quantity
    }));

    const currentItem = state.items.find(item => item.ticketType.id === ticketType.id);
    
    if (quantity === 0) {
      // Release any holds for this ticket type
      await releaseHold(sessionId, ticketType.id);
      if (currentItem) {
        removeItem(ticketType.id);
      }
    } else {
      // Create inventory hold for new quantity
      const hold = await createHold(ticketType.id, quantity, sessionId);
      if (hold) {
        if (currentItem) {
          updateQuantity(ticketType.id, quantity);
        } else {
          addItem(ticketType, quantity);
        }
      } else {
        // Reset quantity if hold creation failed
        setSelectedQuantities(prev => ({
          ...prev,
          [ticketType.id]: 0
        }));
        alert('Unable to reserve tickets. Please try again.');
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

  // Cleanup holds when component unmounts
  useEffect(() => {
    return () => {
      // Release all holds for this session when leaving the page
      releaseHold(sessionId);
    };
  }, [sessionId, releaseHold]);

  // Helper function to render ticket availability status
  const renderAvailabilityBadge = (ticketType: TicketType) => {
    const inventoryStatus = getInventoryStatus(ticketType.id);
    
    if (inventoryLoading || !inventoryStatus) {
      return <Badge variant="secondary">Loading...</Badge>;
    }

    if (!inventoryStatus.isAvailable) {
      return <Badge variant="destructive">Sold Out</Badge>;
    }

    if (inventoryStatus.available <= 5) {
      return (
        <Badge variant="outline" className="border-orange-500 text-orange-700">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Only {inventoryStatus.available} left
        </Badge>
      );
    }

    if (inventoryStatus.available <= 20) {
      return (
        <Badge variant="outline" className="border-yellow-500 text-yellow-700">
          <Zap className="h-3 w-3 mr-1" />
          {inventoryStatus.available} available
        </Badge>
      );
    }

    return (
      <Badge variant="outline" className="border-green-500 text-green-700">
        {inventoryStatus.available} available
      </Badge>
    );
  };

  // Show loading state
  if (isLoadingEvent) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stepping-purple mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading event details...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (eventError || !event) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Event Not Found</h1>
          <p className="text-muted-foreground mb-4">{eventError || 'The requested event could not be found.'}</p>
          <Button onClick={() => navigate('/events')} variant="outline">
            Browse Events
          </Button>
        </div>
      </div>
    );
  }

  // Show no tickets available
  if (ticketTypes.length === 0) {
    return (
      <div className="min-h-screen bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <ExtensionWarningBanner />
          <div className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">No Tickets Available</h1>
            <p className="text-muted-foreground mb-4">There are currently no ticket types available for this event.</p>
            <Button onClick={() => navigate('/events')} variant="outline">
              Browse Other Events
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        {/* Extension Warning Banner */}
        <ExtensionWarningBanner />
        
        {/* Event Header */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1">
                  <CardTitle className="text-2xl md:text-3xl mb-2">{event.title}</CardTitle>
                  <div className="flex flex-wrap gap-4 text-muted-foreground mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {new Date(event.event_date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {event.start_time || 'Time TBA'}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {event.venue || 'Venue TBA'}
                    </div>
                  </div>
                  <CardDescription>{event.description}</CardDescription>
                </div>
                <div className="lg:w-48">
                  {event.image_url ? (
                    <img 
                      src={event.image_url} 
                      alt={event.title}
                      className="aspect-square object-cover rounded-lg"
                    />
                  ) : (
                    <div className="aspect-square bg-muted rounded-lg"></div>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Inventory Alerts */}
        {inventoryStatuses.some(status => !status.isAvailable) && (
          <Alert className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Some ticket types are sold out. Available options are shown below.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Ticket Selection */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-6">Select Your Tickets</h2>
            <div className="space-y-4">
              {ticketTypes.map((ticketType) => (
                <Card key={ticketType.id}>
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{ticketType.name}</CardTitle>
                        <CardDescription className="mt-1">{ticketType.description}</CardDescription>
                        <div className="flex items-center gap-2 mt-2">
                          {renderAvailabilityBadge(ticketType)}
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
                          disabled={(() => {
                            const inventoryStatus = getInventoryStatus(ticketType.id);
                            return !inventoryStatus?.isAvailable || getQuantity(ticketType.id) >= (inventoryStatus?.available || 0);
                          })()}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <Select
                        value={getQuantity(ticketType.id).toString()}
                        onValueChange={(value) => handleQuantityChange(ticketType, parseInt(value))}
                        disabled={(() => {
                          const inventoryStatus = getInventoryStatus(ticketType.id);
                          return !inventoryStatus?.isAvailable;
                        })()}
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {(() => {
                            const inventoryStatus = getInventoryStatus(ticketType.id);
                            const maxQuantity = Math.min(inventoryStatus?.available || 0, 10);
                            return Array.from({ length: maxQuantity + 1 }, (_, i) => (
                              <SelectItem key={i} value={i.toString()}>
                                {i}
                              </SelectItem>
                            ));
                          })()}
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