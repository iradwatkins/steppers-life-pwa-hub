import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EventService } from '@/services/eventService';
import { useCart } from '@/contexts/CartContext';
import { useInventory } from '@/hooks/useInventory';
import { InventoryStatusBadge } from '@/components/inventory/InventoryStatus';
import PromoCodeInput from '@/components/checkout/PromoCodeInput';
import SocialShareButtons from '@/components/SocialShareButtons';
import { SocialSharingService } from '@/services/socialSharingService';
import { useEventMetaTags } from '@/hooks/useMetaTags';
import { Calendar, MapPin, Clock, Users, DollarSign, Share2, Heart, ArrowLeft, Star, ExternalLink, Phone, Mail, Globe, AlertTriangle, CheckCircle2, ImageIcon } from 'lucide-react';
import { ClickableImage } from '@/components/ui/clickable-image';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type Event = Database['public']['Tables']['events']['Row'] & {
  organizers?: any;
  venues?: any;
  ticket_types?: any[];
};

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem, setEvent } = useCart();
  
  // State management
  const [event, setEventData] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTicketQuantities, setSelectedTicketQuantities] = useState<Record<string, number>>({});
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  
  // Set up meta tags for social sharing
  useEventMetaTags(event);
  
  // Load event data
  useEffect(() => {
    const loadEvent = async () => {
      // Enhanced check for invalid event ID
      if (!id || id === 'null' || id === 'undefined' || id.trim() === '') {
        console.error('❌ Invalid event ID provided:', id);
        setError('Invalid event ID provided');
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        console.log('🔍 Loading event with ID:', id);
        const eventData = await EventService.getEventById(id);
        console.log('📊 Event data received:', eventData);
        if (eventData) {
          // PRODUCTION: Only use real ticket types from database
          setEventData(eventData);
          console.log('✅ Event data loaded successfully');
        } else {
          console.error('❌ Event not found for ID:', id);
          setError('Event not found');
        }
      } catch (error) {
        console.error('❌ Error loading event:', error);
        setError('Failed to load event details');
      } finally {
        setIsLoading(false);
      }
    };

    loadEvent();
  }, [id]);

  // Set event in cart context when event data is loaded (separate effect)
  useEffect(() => {
    if (event) {
      setEvent(event.id, event.title);
    }
  }, [event?.id, event?.title, setEvent]);

  // Helper functions
  const formatEventDate = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const formatOptions: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    
    if (start.toDateString() === end.toDateString()) {
      return start.toLocaleDateString('en-US', formatOptions);
    } else {
      return `${start.toLocaleDateString('en-US', formatOptions)} - ${end.toLocaleDateString('en-US', formatOptions)}`;
    }
  };

  const formatEventTime = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    };
    
    return `${start.toLocaleTimeString('en-US', timeOptions)} - ${end.toLocaleTimeString('en-US', timeOptions)}`;
  };

  const getCategoryBadgeColor = (category: string) => {
    const categoryLower = category.toLowerCase();
    if (categoryLower.includes('competition')) return 'bg-red-500';
    if (categoryLower.includes('workshop')) return 'bg-blue-500';
    if (categoryLower.includes('social')) return 'bg-green-500';
    if (categoryLower.includes('class')) return 'bg-purple-500';
    if (categoryLower.includes('youth')) return 'bg-orange-500';
    if (categoryLower.includes('community')) return 'bg-teal-500';
    return 'bg-gray-500';
  };

  const getAttendanceInfo = (ticketTypes: any[]) => {
    if (!ticketTypes || ticketTypes.length === 0) return { sold: 0, capacity: 0 };
    
    const sold = ticketTypes.reduce((sum, tt) => sum + (tt.quantity_sold || 0), 0);
    const capacity = ticketTypes.reduce((sum, tt) => sum + (tt.quantity_available || 0), 0);
    
    return { sold, capacity: sold + capacity };
  };

  const handleTicketQuantityChange = (ticketTypeId: string, quantity: number) => {
    setSelectedTicketQuantities(prev => ({
      ...prev,
      [ticketTypeId]: quantity
    }));
  };

  const handleAddToCart = async (ticketType: any) => {
    // CRITICAL: Validate event requires tickets before allowing cart operations
    if (!event?.requires_tickets) {
      console.warn('🚫 Attempted to add ticket to cart for non-ticketed event:', event?.id);
      toast.error('This event does not require tickets.');
      return;
    }

    const quantity = selectedTicketQuantities[ticketType.id] || 1;
    
    setIsAddingToCart(true);
    try {
      // Create proper TicketType object for cart context
      const ticketTypeForCart = {
        id: ticketType.id.toString(),
        name: ticketType.name,
        price: ticketType.price,
        description: ticketType.description || '',
        availableQuantity: (ticketType.quantity_available || 0) - (ticketType.quantity_sold || 0)
      };
      
      addItem(ticketTypeForCart, quantity);
      
      toast.success(`Added ${quantity} ${ticketType.name} ticket(s) to cart`);
      
      // Navigate to checkout after adding to cart
      navigate(`/events/${event?.id}/tickets`);
      
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add tickets to cart');
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Generate share options for the event
  const shareOptions = event ? SocialSharingService.generateEventShareOptions(event) : null;

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          <Skeleton className="h-8 w-32 mb-6" />
          <Skeleton className="aspect-video w-full mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div>
                <Skeleton className="h-6 w-24 mb-2" />
                <Skeleton className="h-10 w-3/4 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
            <div className="space-y-6">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !event) {
    return (
      <div className="min-h-screen py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          <Button 
            variant="ghost" 
            onClick={() => {
              if (window.history.length > 1) {
                navigate(-1);
              } else {
                navigate('/events');
              }
            }}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Button>
          
          <div className="text-center py-12">
            <AlertTriangle className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h1 className="text-2xl font-bold mb-2">Event Not Found</h1>
            <p className="text-muted-foreground mb-6">
              {error || 'The event you\'re looking for could not be found.'}
            </p>
            <Button asChild>
              <Link to="/events">Browse All Events</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const attendanceInfo = getAttendanceInfo(event.ticket_types || []);

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => {
            if (window.history.length > 1) {
              navigate(-1);
            } else {
              navigate('/events');
            }
          }}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Events
        </Button>

        {/* Hero Section with Enhanced Media */}
        <div className="relative mb-8">
          {/* Main Hero Image/Video */}
          <div className="aspect-video bg-muted rounded-lg relative overflow-hidden">
            {event.featured_image_url ? (
              <ClickableImage
                src={event.featured_image_url}
                alt={event.title}
                className="w-full h-full"
                images={[event.featured_image_url, ...(event.gallery_images || [])]}
                aspectRatio="video"
                rounded={false}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <ImageIcon className="h-16 w-16 text-muted-foreground" />
              </div>
            )}
            
            {/* Overlay badges and actions */}
            <div className="absolute inset-0 bg-black/20" />
            
            {/* Top badges */}
            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
              {/* Featured badge temporarily removed due to missing is_featured column */}
              <Badge className={`text-white ${getCategoryBadgeColor(event.category)}`}>
                {event.category}
              </Badge>
              {event.status === 'published' && (
                <Badge variant="outline" className="bg-white/90 text-green-700 border-green-500">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              )}
              {event.status === 'cancelled' && (
                <Badge variant="outline" className="bg-white/90 text-red-700 border-red-500">
                  <XCircle className="h-3 w-3 mr-1" />
                  Cancelled
                </Badge>
              )}
            </div>
            
            {/* Top actions */}
            <div className="absolute top-4 right-4 flex gap-2">
              <Button 
                size="icon" 
                variant="secondary"
                onClick={() => setIsFavorited(!isFavorited)}
                className="bg-white/90 hover:bg-white"
              >
                <Heart className={`h-4 w-4 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
              {shareOptions && (
                <SocialShareButtons
                  shareOptions={shareOptions}
                  variant="icon-only"
                  size="sm"
                  showLabels={false}
                  className="bg-white/90 hover:bg-white"
                />
              )}
            </div>

            {/* Bottom info overlay */}
            <div className="absolute bottom-4 left-4 right-4">
              <div className="bg-black/60 backdrop-blur-sm rounded-lg p-4 text-white">
                <h1 className="text-2xl md:text-3xl font-bold mb-2">{event.title}</h1>
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {formatEventDate(event.start_date, event.end_date)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {formatEventTime(event.start_date, event.end_date)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {attendanceInfo.sold}/{attendanceInfo.capacity} attending
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Gallery thumbnails */}
          {Array.isArray(event.gallery_images) && event.gallery_images.length > 0 && (
            <div className="flex gap-2 mt-4 overflow-x-auto">
              {(event.gallery_images || []).slice(0, 5).map((image, index) => (
                <div key={index} className="flex-shrink-0">
                  <ClickableImage
                    src={image}
                    alt={`${event.title} gallery ${index + 1}`}
                    className="w-20 h-20"
                    images={[event.featured_image_url, ...(event.gallery_images || [])].filter(Boolean)}
                    currentIndex={event.featured_image_url ? index + 1 : index}
                    aspectRatio="square"
                  />
                </div>
              ))}
              {(event.gallery_images || []).length > 5 && (
                <div className="flex-shrink-0 w-20 h-20 bg-muted rounded-lg flex items-center justify-center text-xs font-medium">
                  +{(event.gallery_images || []).length - 5}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Cancelled Event Alert */}
        {event.status === 'cancelled' && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <span className="font-semibold">This event has been cancelled.</span>
              {event.additional_info?.cancellation_reason && (
                <span className="block mt-1">
                  Reason: {event.additional_info.cancellation_reason}
                </span>
              )}
              {event.additional_info?.cancelled_at && (
                <span className="block mt-1 text-sm">
                  Cancelled on: {new Date(event.additional_info.cancelled_at).toLocaleDateString()}
                </span>
              )}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title and Basic Info */}
            <div>
              <Badge className="mb-2 bg-red-500 text-white">Competition</Badge>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{event.title}</h1>
              <p className="text-lg text-muted-foreground mb-6">{event.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-stepping-purple" />
                  <span>{formatEventDate(event.start_date, event.end_date)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-stepping-purple" />
                  <span>{formatEventTime(event.start_date, event.end_date)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-stepping-purple" />
                  <span>{event.venues?.name || 'Online Event'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-stepping-purple" />
                  <span>{attendanceInfo.sold}/{attendanceInfo.capacity} attending</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Detailed Description */}
            {event.description && (
              <div>
                <h2 className="text-2xl font-bold mb-4">About This Event</h2>
                <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {event.description}
                </div>
              </div>
            )}

            <Separator />

            {/* Organizer Info */}
            {event.organizers && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Event Organizer</h2>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-stepping-gradient rounded-full flex items-center justify-center">
                        <Users className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{event.organizers.organization_name}</h3>
                        {event.organizers.contact_email && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {event.organizers.contact_email}
                          </p>
                        )}
                        {event.organizers.contact_phone && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {event.organizers.contact_phone}
                          </p>
                        )}
                        {event.organizers.website_url && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Globe className="h-3 w-3" />
                            <a 
                              href={event.organizers.website_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {event.organizers.website_url}
                            </a>
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Enhanced Sidebar */}
          <div className="space-y-6">
            {/* Conditional: Ticket Purchase OR RSVP based on event.requires_tickets */}
            {event.requires_tickets ? (
              /* Ticket Purchase with Real-time Inventory */
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Get Tickets
                  </CardTitle>
                  <CardDescription>
                    Select your tickets and add to cart
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {event.status === 'cancelled' ? (
                    <div className="text-center py-6">
                      <XCircle className="h-8 w-8 mx-auto mb-2 text-red-500" />
                      <p className="text-sm text-red-600 font-medium">
                        Ticket sales unavailable - Event cancelled
                      </p>
                    </div>
                  ) : Array.isArray(event.ticket_types) && event.ticket_types.length > 0 ? (
                    (event.ticket_types || [])
                      .filter((ticket: any) => ticket.is_active)
                      .map((ticket: any) => {
                      const availableQuantity = ticket.quantity_available - (ticket.quantity_sold || 0);
                      const selectedQuantity = selectedTicketQuantities[ticket.id] || 0;
                      
                      return (
                        <div key={ticket.id} className="p-4 border rounded-lg space-y-3">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-medium">{ticket.name}</h4>
                              <p className="text-sm text-muted-foreground">{ticket.description}</p>
                            </div>
                            <div className="text-right">
                              <span className="font-bold text-stepping-purple text-lg">
                                ${ticket.price}
                              </span>
                            </div>
                          </div>
                          
                          {/* Real-time inventory status */}
                          <InventoryStatusBadge 
                            ticketTypeId={ticket.id} 
                            showDetails={true}
                          />
                          
                          {availableQuantity > 0 ? (
                            <div className="space-y-3">
                              {/* Quantity selector */}
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Quantity:</span>
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleTicketQuantityChange(
                                      ticket.id, 
                                      Math.max(0, selectedQuantity - 1)
                                    )}
                                    disabled={selectedQuantity <= 0 || event.status === 'cancelled'}
                                  >
                                    -
                                  </Button>
                                  <span className="min-w-8 text-center">{selectedQuantity}</span>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleTicketQuantityChange(
                                      ticket.id, 
                                      Math.min(availableQuantity, ticket.max_per_order || 10, selectedQuantity + 1)
                                    )}
                                    disabled={selectedQuantity >= Math.min(availableQuantity, ticket.max_per_order || 10) || event.status === 'cancelled'}
                                  >
                                    +
                                  </Button>
                                </div>
                              </div>
                              
                              {/* Add to cart button */}
                              <Button 
                                className="w-full bg-stepping-gradient"
                                onClick={() => handleAddToCart(ticket)}
                                disabled={selectedQuantity === 0 || isAddingToCart || event.status === 'cancelled'}
                              >
                                {event.status === 'cancelled' ? 'Event Cancelled' : isAddingToCart ? 'Adding...' : `Add to Cart - $${(ticket.price * selectedQuantity).toFixed(2)}`}
                              </Button>
                            </div>
                          ) : (
                            <Button disabled className="w-full">
                              Sold Out
                            </Button>
                          )}
                        </div>
                      );
                    })
                ) : (
                  <div className="text-center py-6">
                    <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Tickets will be available soon
                    </p>
                  </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              /* Simple Event - View Only */
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Event Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-4 space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">
                        This is a Simple Event - just show up and enjoy!
                      </p>
                      {event.free_entry_condition && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                          <p className="text-sm font-medium text-green-800">
                            {event.free_entry_condition}
                          </p>
                        </div>
                      )}
                      {event.door_price && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <p className="text-sm text-blue-800">
                            <span className="font-medium">Door Price:</span> ${event.door_price}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Promo Code Integration - Only for ticketed events */}
            {event.requires_tickets && event.ticket_types && event.ticket_types.length > 0 && (
              <PromoCodeInput 
                eventId={event.id.toString()}
                subtotal={0}
                onPromoCodeApplied={() => {}}
              />
            )}

            {/* Enhanced Location Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  {event.is_online ? 'Online Event' : 'Location'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {event.is_online ? (
                    <div className="text-center py-4">
                      <Globe className="h-8 w-8 mx-auto mb-2 text-stepping-purple" />
                      <p className="font-medium">Online Event</p>
                      <p className="text-sm text-muted-foreground">Join from anywhere</p>
                    </div>
                  ) : event.venues ? (
                    <>
                      <div>
                        <p className="font-medium">{event.venues.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {event.venues.address}, {event.venues.city}, {event.venues.state}
                        </p>
                      </div>
                      <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                        <MapPin className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => {
                          const address = `${event.venues.address}, ${event.venues.city}, ${event.venues.state}`;
                          window.open(`https://maps.google.com/maps?q=${encodeURIComponent(address)}`, '_blank');
                        }}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Map
                      </Button>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">Location TBD</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Share Card */}
            {shareOptions && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Share2 className="h-5 w-5" />
                    Share Event
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <SocialShareButtons
                    shareOptions={shareOptions}
                    variant="inline"
                    size="sm"
                    showLabels={true}
                    maxButtons={6}
                  />
                </CardContent>
              </Card>
            )}

            {/* Event Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  Event Info
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge variant={
                      event.status === 'published' ? 'default' : 
                      event.status === 'cancelled' ? 'destructive' : 
                      'secondary'
                    }>
                      {event.status === 'cancelled' ? 'CANCELLED' : event.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created:</span>
                    <span>{new Date(event.created_at).toLocaleDateString()}</span>
                  </div>
                  {event.max_attendees && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Capacity:</span>
                      <span>{attendanceInfo.sold} / {event.max_attendees}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
