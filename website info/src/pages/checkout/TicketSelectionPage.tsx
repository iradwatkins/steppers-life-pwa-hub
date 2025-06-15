import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Ticket, ShoppingCart, CalendarDays, MapPin, MinusCircle, PlusCircle, Percent, Tag, DollarSign, AlertTriangle, Loader2 } from 'lucide-react';
import { useInventory } from '@/hooks/useInventory';
import { HoldTimer, HoldTimerSummary } from '@/components/HoldTimer';
import { TicketAvailabilityStatus, InventoryHold } from '@/types/inventory';
import { useBackendEvent } from '@/hooks/useBackendEvents';
import { useTicketManagement } from '@/hooks/useBackendTickets';
import { toast } from '@/components/ui/sonner';

// Ticket type interface for compatibility with existing logic
interface TicketType {
  id: string;
  name: string;
  price: number;
  description?: string;
  availableQuantity?: number; // This will be overridden by real-time inventory
}

interface CartItem {
  ticketTypeId: string;
  ticketTypeName: string;
  quantity: number;
  pricePerTicket: number;
}

const TicketSelectionPage = () => {
  const { eventId: routeEventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const eventId = routeEventId || '1'; // Default fallback ID
  
  // Backend integration for event data
  const { event, loading: eventLoading, error: eventError } = useBackendEvent(eventId);
  const { createTicket } = useTicketManagement();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromoDetails, setAppliedPromoDetails] = useState<{ code: string; discountAmount: number; message: string } | null>(null);

  // Transform backend event data to frontend format
  const eventDetails = event ? {
    id: event.id.toString(),
    name: event.title,
    date: new Date(event.start_datetime).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    location: event.venue?.name || 'TBA',
    ticketTypes: [
      {
        id: 'general',
        name: 'General Admission',
        price: event.price || 0,
        description: 'Access to the event',
        availableQuantity: event.max_attendees ? event.max_attendees - event.current_attendees : 100,
      }
    ] as TicketType[]
  } : null;

  // Handle loading and error states
  useEffect(() => {
    if (eventError) {
      toast.error('Failed to load event details. Please try again.');
      console.error('Event loading error:', eventError);
    }
  }, [eventError]);

  // Use the inventory hook for real-time inventory management
  const {
    inventoryStatus,
    availabilityStatuses,
    userHolds,
    isLoading: inventoryLoading,
    error: inventoryError,
    checkAvailability,
    createHold,
    releaseHold,
    releaseAllHolds,
    getHoldForTicketType,
    getTotalHeldQuantity,
    refresh: refreshInventory
  } = useInventory({ eventId });

  // Handle hold expiration
  const handleHoldExpired = async (holdId: string) => {
    console.log('Hold expired:', holdId);
    const expiredHold = userHolds.find(hold => hold.id === holdId);
    if (expiredHold) {
      // Remove from cart
      setCart(prev => prev.filter(item => item.ticketTypeId !== expiredHold.ticketTypeId));
      // Refresh inventory
      await refreshInventory();
    }
  };

  const handleQuantityChange = async (ticketTypeId: string, ticketTypeName: string, pricePerTicket: number, newQuantity: number) => {
    const currentQuantity = getTicketQuantityInCart(ticketTypeId);
    const quantityDiff = newQuantity - currentQuantity;
    
    if (quantityDiff === 0) return;

    try {
      if (quantityDiff > 0) {
        // Increasing quantity - create hold for additional tickets
        const response = await createHold(ticketTypeId, quantityDiff, 'checkout');
        
        if (response.success) {
          updateCartQuantity(ticketTypeId, ticketTypeName, pricePerTicket, newQuantity);
        } else if (response.conflict) {
          // Handle partial fulfillment
          if (response.conflict.resolutionType === 'partial-fulfill') {
            const partialQuantity = currentQuantity + response.conflict.resolvedQuantity;
            if (confirm(`Only ${response.conflict.resolvedQuantity} tickets available. Accept ${partialQuantity} tickets total?`)) {
              updateCartQuantity(ticketTypeId, ticketTypeName, pricePerTicket, partialQuantity);
            }
          } else {
            alert(response.message);
          }
        } else {
          alert(response.message || 'Unable to reserve tickets');
        }
      } else {
        // Decreasing quantity - release some held tickets
        const ticketsToRelease = Math.abs(quantityDiff);
        const holdToAdjust = getHoldForTicketType(ticketTypeId);

        if (holdToAdjust) {
          if (holdToAdjust.quantity === ticketsToRelease) {
            // Release entire hold
            await releaseHold(holdToAdjust.id, 'User decreased quantity');
          } else {
            // For simplicity, release the hold and create a new smaller one
            await releaseHold(holdToAdjust.id, 'User decreased quantity');
            await createHold(ticketTypeId, holdToAdjust.quantity - ticketsToRelease, 'checkout');
          }
        }
        
        updateCartQuantity(ticketTypeId, ticketTypeName, pricePerTicket, newQuantity);
      }
    } catch (error) {
      console.error('Error updating ticket quantity:', error);
      alert('Error updating ticket selection. Please try again.');
    }
  };

  const updateCartQuantity = (ticketTypeId: string, ticketTypeName: string, pricePerTicket: number, quantity: number) => {
    const existingItemIndex = cart.findIndex(item => item.ticketTypeId === ticketTypeId);
    
    if (quantity === 0) {
      setCart(cart.filter(item => item.ticketTypeId !== ticketTypeId));
      return;
    }

    if (existingItemIndex > -1) {
      const updatedCart = [...cart];
      updatedCart[existingItemIndex].quantity = quantity;
      setCart(updatedCart);
    } else {
      setCart([...cart, { ticketTypeId, ticketTypeName, quantity, pricePerTicket }]);
    }
  };

  const getTicketQuantityInCart = (ticketTypeId: string): number => {
    return cart.find(item => item.ticketTypeId === ticketTypeId)?.quantity || 0;
  };

  const calculateSubtotal = () => {
    return cart.reduce((total, item) => total + (item.quantity * item.pricePerTicket), 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    if (appliedPromoDetails) {
      return Math.max(0, subtotal - appliedPromoDetails.discountAmount);
    }
    return subtotal;
  };

  const handleApplyPromoCode = () => {
    const currentSubtotal = calculateSubtotal();
    if (promoCode.toUpperCase() === "SAVE10") {
      const discountValue = currentSubtotal * 0.10;
      setAppliedPromoDetails({ code: promoCode, discountAmount: discountValue, message: `10% discount applied: -$${discountValue.toFixed(2)}` });
    } else if (promoCode.toUpperCase() === "FLAT20" && currentSubtotal >= 20) {
      setAppliedPromoDetails({ code: promoCode, discountAmount: 20, message: `Flat $20 discount applied: -$20.00` });
    } else if (promoCode.toUpperCase() === "FLAT20" && currentSubtotal < 20) {
      setAppliedPromoDetails(null);
      alert("Subtotal must be at least $20 to apply FLAT20 code.");
    } else {
      setAppliedPromoDetails(null);
      alert("Invalid promo code.");
    }
  };

  const handleProceedToCheckout = async () => {
    if (cart.length === 0) {
      toast.error("Please select at least one ticket to proceed.");
      return;
    }

    if (!eventDetails) {
      toast.error("Event details not available.");
      return;
    }

    try {
      // Create tickets in the backend
      const ticketPromises = cart.map(async (item) => {
        return createTicket({
          event_id: eventDetails.id,
          quantity: item.quantity,
          price: item.pricePerTicket,
          currency: 'USD',
          ticket_type: item.ticketTypeName,
        });
      });

      const createdTickets = await Promise.all(ticketPromises);
      
      if (createdTickets.every(ticket => ticket !== null)) {
        // All tickets created successfully, proceed to payment
        navigate(`/checkout/${eventId}/payment`, { 
          state: { 
            tickets: createdTickets,
            cart, 
            appliedPromoDetails, 
            subtotal: calculateSubtotal(), 
            total: calculateTotal(),
            sessionId: 'current-session',
            activeHolds: userHolds,
            event: eventDetails
          } 
        });
      } else {
        toast.error("Failed to create some tickets. Please try again.");
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error("Failed to proceed to checkout. Please try again.");
    }
  };

  // Get real-time availability for display
  const getAvailabilityDisplay = (ticketTypeId: string) => {
    const status = availabilityStatuses.get(ticketTypeId);
    const cartQuantity = getTicketQuantityInCart(ticketTypeId);
    
    if (!status) return null;

    return (
      <div className="mt-1">
        <Badge variant={
          status.status === 'sold-out' ? 'destructive' :
          status.status === 'critical-stock' ? 'destructive' :
          status.status === 'low-stock' ? 'secondary' : 'default'
        } className={`text-xs ${status.className}`}>
          {status.message}
        </Badge>
      </div>
    );
  };

  const isTicketUnavailable = (ticketTypeId: string) => {
    const status = availabilityStatuses.get(ticketTypeId);
    return status?.status === 'sold-out' || status?.availableQuantity === 0;
  };

  const getMaxQuantity = (ticketTypeId: string) => {
    const status = availabilityStatuses.get(ticketTypeId);
    return status?.availableQuantity || 0;
  };

  // Cleanup holds when leaving the page
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Release all holds when user leaves
      releaseAllHolds();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Also release holds when component unmounts
      releaseAllHolds();
    };
  }, [releaseAllHolds]);

  // Show loading state
  if (eventLoading) {
    return (
      <div className="min-h-screen bg-background-main py-8 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-surface-card">
            <CardContent className="p-8 text-center">
              <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-brand-primary" />
              <h3 className="text-xl font-semibold text-text-primary mb-2">Loading Event Details</h3>
              <p className="text-text-secondary">Please wait while we fetch the event information...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show error state
  if (eventError || !eventDetails) {
    return (
      <div className="min-h-screen bg-background-main py-8 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-surface-card">
            <CardContent className="p-8 text-center">
              <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-red-500" />
              <h3 className="text-xl font-semibold text-text-primary mb-2">Event Not Found</h3>
              <p className="text-text-secondary mb-4">
                {eventError || 'The event you are looking for could not be found.'}
              </p>
              <Button 
                variant="outline" 
                onClick={() => navigate('/events')}
              >
                Browse Events
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-main py-8 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Inventory Error Display */}
        {inventoryError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-800">
            <AlertTriangle className="h-4 w-4 mr-2" />
            {inventoryError}
          </div>
        )}

        {/* Hold Timer Summary */}
        {userHolds.length > 0 && (
          <div className="mb-6">
            <HoldTimerSummary
              holds={userHolds.map(hold => ({
                id: hold.id,
                expiresAt: hold.expiresAt,
                ticketTypeName: eventDetails.ticketTypes.find(t => t.id === hold.ticketTypeId)?.name
              }))}
              onHoldExpired={handleHoldExpired}
            />
          </div>
        )}

        <Card className="bg-surface-card mb-6">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-text-primary">{eventDetails.name}</CardTitle>
            <CardDescription className="text-text-secondary">
              <div className="flex items-center mt-1"><CalendarDays className="h-4 w-4 mr-2 text-text-tertiary" />{eventDetails.date}</div>
              <div className="flex items-center mt-1"><MapPin className="h-4 w-4 mr-2 text-text-tertiary" />{eventDetails.location}</div>
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="bg-surface-card">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-text-primary flex items-center">
              <Ticket className="mr-2 h-5 w-5 text-brand-primary" /> Select Your Tickets
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {eventDetails.ticketTypes.map((ticketType) => {
              const isUnavailable = isTicketUnavailable(ticketType.id);
              const maxQuantity = getMaxQuantity(ticketType.id);
              const cartQuantity = getTicketQuantityInCart(ticketType.id);
              
              return (
                <div key={ticketType.id} className={`p-4 border rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center ${
                  isUnavailable ? 'border-red-200 bg-gray-50 opacity-75' : 'border-border-default bg-background-main'
                }`}>
                  <div className="flex-grow mb-3 sm:mb-0">
                    <h4 className="font-semibold text-text-primary">{ticketType.name} (${ticketType.price.toFixed(2)})</h4>
                    {ticketType.description && <p className="text-sm text-text-secondary mt-1">{ticketType.description}</p>}
                    {getAvailabilityDisplay(ticketType.id)}
                  </div>
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => handleQuantityChange(ticketType.id, ticketType.name, ticketType.price, cartQuantity - 1)} 
                      disabled={cartQuantity === 0}
                    >
                      <MinusCircle className="h-4 w-4" />
                    </Button>
                    <Input 
                      type="number"
                      value={cartQuantity}
                      onChange={(e) => {
                        const newValue = Math.max(0, Math.min(parseInt(e.target.value, 10) || 0, maxQuantity));
                        handleQuantityChange(ticketType.id, ticketType.name, ticketType.price, newValue);
                      }}
                      className="w-16 text-center hide-arrows" 
                      min="0"
                      max={maxQuantity}
                      disabled={isUnavailable}
                    />
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => handleQuantityChange(ticketType.id, ticketType.name, ticketType.price, cartQuantity + 1)} 
                      disabled={isUnavailable || cartQuantity >= maxQuantity}
                    >
                      <PlusCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
          <Separator className="my-4" />
          <CardFooter className="flex flex-col items-start p-6 space-y-4">
            <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div className="text-lg font-semibold text-text-secondary mb-2 sm:mb-0">Subtotal:</div>
              <div className="text-lg font-semibold text-text-primary">${calculateSubtotal().toFixed(2)}</div>
            </div>

            <div className="w-full flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
              <Input 
                type="text"
                placeholder="Enter Promo Code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="flex-grow"
                disabled={!!appliedPromoDetails}
              />
              <Button 
                onClick={handleApplyPromoCode} 
                variant="outline" 
                className="w-full sm:w-auto whitespace-nowrap"
                disabled={!promoCode || !!appliedPromoDetails}
              >
                <Tag className="mr-2 h-4 w-4" /> Apply Code
              </Button>
            </div>

            {appliedPromoDetails && (
              <div className="w-full text-sm text-green-600 dark:text-green-400 flex justify-between items-center">
                <span>{appliedPromoDetails.message}</span>
                <Button variant="link" size="sm" onClick={() => { setAppliedPromoDetails(null); setPromoCode(""); }} className="text-red-500 hover:text-red-700">
                  Remove
                </Button>
              </div>
            )}
            
            <Separator className="w-full"/>

            <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center mt-2">
              <div className="text-xl font-bold text-text-primary mb-2 sm:mb-0">Total:</div>
              <div className="text-xl font-bold text-text-primary">${calculateTotal().toFixed(2)}</div>
            </div>

            <div className="w-full flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 mt-4">
              <Button 
                onClick={handleProceedToCheckout} 
                size="lg" 
                className="bg-brand-primary hover:bg-brand-primary-hover text-text-on-primary flex-1" 
                disabled={cart.length === 0}
              >
                <ShoppingCart className="mr-2 h-5 w-5" /> Proceed to Checkout
              </Button>
              
              <Button 
                onClick={() => navigate(`/event/${eventId}/cash-payment`)} 
                size="lg" 
                variant="outline" 
                className="flex-1 border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-text-on-primary"
              >
                <DollarSign className="mr-2 h-5 w-5" /> Pay with Cash
              </Button>
            </div>

            <p className="text-xs text-text-tertiary text-center mt-2">
              Choose "Pay with Cash" to generate a payment code for in-person transactions
            </p>
          </CardFooter>
        </Card>
      </div>
      <style>{`
        .hide-arrows::-webkit-outer-spin-button,
        .hide-arrows::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        .hide-arrows[type=number] {
          -moz-appearance: textfield;
        }
      `}</style>
    </div>
  );
};

export default TicketSelectionPage; 