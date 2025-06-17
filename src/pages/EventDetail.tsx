
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
import { Calendar, MapPin, Clock, Users, DollarSign, Share2, Heart, ArrowLeft, Star, ExternalLink, Phone, Mail, Globe, AlertTriangle, CheckCircle2, ImageIcon } from 'lucide-react';
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
  
  // Load event data
  useEffect(() => {
    const loadEvent = async () => {
      if (!id) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const eventData = await EventService.getEventById(id);
        if (eventData) {
          setEventData(eventData);
          // Set event in cart context for later checkout
          setEvent(eventData.id, eventData.title);
        } else {
          setError('Event not found');
        }
      } catch (error) {
        console.error('Error loading event:', error);
        setError('Failed to load event details');
      } finally {
        setIsLoading(false);
      }
    };

    loadEvent();
  }, [id, setEvent]);

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
    const quantity = selectedTicketQuantities[ticketType.id] || 1;
    
    setIsAddingToCart(true);
    try {
      addItem({
        id: ticketType.id,
        name: ticketType.name,
        price: ticketType.price,
        description: ticketType.description || '',
        availableQuantity: ticketType.quantity_available - ticketType.quantity_sold
      }, quantity);
      
      toast.success(`Added ${quantity} ${ticketType.name} ticket(s) to cart`);
      
      // Reset quantity for this ticket type
      setSelectedTicketQuantities(prev => ({
        ...prev,
        [ticketType.id]: 0
      }));
    } catch (error) {
      toast.error('Failed to add tickets to cart');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleShare = async (platform?: string) => {
    const url = window.location.href;
    const title = event?.title || 'Check out this event';
    
    if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
    } else if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, '_blank');
    } else {
      // Copy to clipboard
      try {
        await navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard');
      } catch (error) {
        toast.error('Failed to copy link');
      }
    }
  };

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
          <Button variant="ghost" asChild className="mb-6">
            <Link to="/events">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Events
            </Link>
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
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/events">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Link>
        </Button>

        {/* Hero Section with Enhanced Media */}
        <div className="relative mb-8">
          {/* Main Hero Image/Video */}
          <div className="aspect-video bg-muted rounded-lg relative overflow-hidden">
            {event.featured_image_url ? (
              <img 
                src={event.featured_image_url} 
                alt={event.title}
                className="w-full h-full object-cover"
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
              <Button 
                size="icon" 
                variant="secondary"
                onClick={() => handleShare()}
                className="bg-white/90 hover:bg-white"
              >
                <Share2 className="h-4 w-4" />
              </Button>
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
                <div key={index} className="flex-shrink-0 w-20 h-20 bg-muted rounded-lg overflow-hidden">
                  <img 
                    src={image} 
                    alt={`${event.title} gallery ${index + 1}`}
                    className="w-full h-full object-cover cursor-pointer hover:scale-110 transition-transform"
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
                  <span>{event.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-stepping-purple" />
                  <span>{event.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-stepping-purple" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-stepping-purple" />
                  <span>{event.attending}/{event.capacity} attending</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Detailed Description */}
            <div>
              <h2 className="text-2xl font-bold mb-4">About This Event</h2>
              <p className="text-muted-foreground leading-relaxed">{event.longDescription}</p>
            </div>

            <Separator />

            {/* Schedule */}
            {Array.isArray(event.schedule) && event.schedule.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Event Schedule</h2>
                <div className="space-y-3">
                  {(event.schedule || []).map((item, index) => (
                  <div key={index} className="flex gap-4 p-3 bg-muted/30 rounded-lg">
                    <div className="font-medium text-stepping-purple min-w-20">{item.time}</div>
                    <div>{item.activity}</div>
                  </div>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Organizer Info */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Event Organizer</h2>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-stepping-gradient rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{event.organizer}</h3>
                      <p className="text-sm text-muted-foreground">{event.contact}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Enhanced Sidebar */}
          <div className="space-y-6">
            {/* Ticket Purchase with Real-time Inventory */}
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
                {Array.isArray(event.ticket_types) && event.ticket_types.length > 0 ? (
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
                                    disabled={selectedQuantity <= 0}
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
                                    disabled={selectedQuantity >= Math.min(availableQuantity, ticket.max_per_order || 10)}
                                  >
                                    +
                                  </Button>
                                </div>
                              </div>
                              
                              {/* Add to cart button */}
                              <Button 
                                className="w-full bg-stepping-gradient"
                                onClick={() => handleAddToCart(ticket)}
                                disabled={selectedQuantity === 0 || isAddingToCart}
                              >
                                {isAddingToCart ? 'Adding...' : `Add to Cart - $${(ticket.price * selectedQuantity).toFixed(2)}`}
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

            {/* Promo Code Integration */}
            {event.ticket_types && event.ticket_types.length > 0 && (
              <PromoCodeInput 
                eventId={event.id}
                className="w-full"
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="h-5 w-5" />
                  Share Event
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleShare('facebook')}
                    >
                      Facebook
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleShare('twitter')}
                    >
                      Twitter
                    </Button>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => handleShare()}
                  >
                    Copy Link
                  </Button>
                </div>
              </CardContent>
            </Card>

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
                    <Badge variant={event.status === 'published' ? 'default' : 'secondary'}>
                      {event.status}
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
