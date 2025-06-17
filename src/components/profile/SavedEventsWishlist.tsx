import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  Heart, 
  Calendar, 
  MapPin, 
  Clock, 
  DollarSign, 
  ExternalLink,
  Trash2,
  Star,
  Users
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { EventService } from '@/services/eventService';

interface SavedEvent {
  id: string;
  user_id: string;
  event_id: string;
  saved_at: string;
  notes?: string;
  event?: any; // Full event data
}

interface SavedEventsWishlistProps {
  userId: string;
  disabled?: boolean;
}

const SavedEventsWishlist: React.FC<SavedEventsWishlistProps> = ({
  userId,
  disabled = false
}) => {
  const [savedEvents, setSavedEvents] = useState<SavedEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSavedEvents();
  }, [userId]);

  const loadSavedEvents = async () => {
    if (!userId) return;

    setIsLoading(true);
    try {
      console.log('🔄 Loading saved events...');
      
      const { data: savedEventData, error } = await supabase
        .from('saved_events')
        .select('*')
        .eq('user_id', userId)
        .order('saved_at', { ascending: false });

      if (error) {
        console.error('❌ Error loading saved events:', error);
        // Create mock data for demo if table doesn't exist
        createMockSavedEvents();
        return;
      }

      // Load full event details for each saved event
      const eventsWithDetails = await Promise.all(
        (savedEventData || []).map(async (savedEvent) => {
          try {
            const eventDetails = await EventService.getEventById(savedEvent.event_id);
            return {
              ...savedEvent,
              event: eventDetails
            };
          } catch (error) {
            console.error('Error loading event details:', error);
            return savedEvent;
          }
        })
      );

      console.log('✅ Saved events loaded:', eventsWithDetails);
      setSavedEvents(eventsWithDetails);
    } catch (error) {
      console.error('❌ Unexpected error loading saved events:', error);
      createMockSavedEvents();
    } finally {
      setIsLoading(false);
    }
  };

  const createMockSavedEvents = () => {
    // Create mock saved events data for demo purposes
    const mockSavedEvents: SavedEvent[] = [
      {
        id: '1',
        user_id: userId,
        event_id: 'mock-event-1',
        saved_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        notes: 'Looks like a fun workshop!',
        event: {
          id: 'mock-event-1',
          title: 'Advanced Chicago Stepping Workshop',
          description: 'Master advanced techniques in Chicago stepping with professional instructors.',
          category: 'Workshop',
          start_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(), // 1 week from now
          end_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7 + 1000 * 60 * 60 * 3).toISOString(), // 3 hours later
          is_online: false,
          featured_image_url: null,
          venues: {
            name: 'Chicago Dance Academy',
            city: 'Chicago',
            state: 'IL'
          },
          ticket_types: [
            {
              price: 45,
              quantity_available: 20,
              quantity_sold: 8
            }
          ]
        }
      },
      {
        id: '2',
        user_id: userId,
        event_id: 'mock-event-2',
        saved_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
        event: {
          id: 'mock-event-2',
          title: 'Summer Dance Social',
          description: 'Join us for an amazing summer dance social with live music and prizes.',
          category: 'Social',
          start_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(), // 2 weeks from now
          end_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14 + 1000 * 60 * 60 * 4).toISOString(), // 4 hours later
          is_online: false,
          featured_image_url: null,
          venues: {
            name: 'Millennium Park',
            city: 'Chicago',
            state: 'IL'
          },
          ticket_types: [
            {
              price: 0,
              quantity_available: 200,
              quantity_sold: 45
            }
          ]
        }
      }
    ];

    setSavedEvents(mockSavedEvents);
  };

  const handleRemoveFromWishlist = async (savedEventId: string, eventTitle: string) => {
    try {
      console.log('🗑️ Removing event from wishlist:', savedEventId);

      const { error } = await supabase
        .from('saved_events')
        .delete()
        .eq('id', savedEventId)
        .eq('user_id', userId);

      if (error) {
        console.error('❌ Error removing from wishlist:', error);
        toast.error('Failed to remove event from wishlist');
        return;
      }

      console.log('✅ Event removed from wishlist');
      toast.success(`"${eventTitle}" removed from wishlist`);

      // Reload saved events
      await loadSavedEvents();
    } catch (error) {
      console.error('❌ Unexpected error removing from wishlist:', error);
      toast.error('Failed to remove event from wishlist');
    }
  };

  // Helper function to add event to wishlist (can be called from other components)
  const addToWishlist = async (eventId: string, notes?: string) => {
    try {
      console.log('❤️ Adding event to wishlist:', eventId);

      const { data: existing, error: checkError } = await supabase
        .from('saved_events')
        .select('id')
        .eq('user_id', userId)
        .eq('event_id', eventId)
        .single();

      if (existing) {
        toast.info('Event is already in your wishlist');
        return;
      }

      const { error } = await supabase
        .from('saved_events')
        .insert([{
          user_id: userId,
          event_id: eventId,
          notes: notes || null,
          saved_at: new Date().toISOString()
        }]);

      if (error) {
        console.error('❌ Error adding to wishlist:', error);
        toast.error('Failed to add event to wishlist');
        return;
      }

      console.log('✅ Event added to wishlist');
      toast.success('Event added to wishlist');

      // Reload saved events
      await loadSavedEvents();
    } catch (error) {
      console.error('❌ Unexpected error adding to wishlist:', error);
      toast.error('Failed to add event to wishlist');
    }
  };

  const formatEventDate = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const formatOptions: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
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

  const getEventPrice = (ticketTypes: any[]) => {
    if (!ticketTypes || ticketTypes.length === 0) return 'Free';
    
    const prices = ticketTypes.map(tt => tt.price).filter(p => p > 0);
    if (prices.length === 0) return 'Free';
    
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    
    if (minPrice === maxPrice) {
      return `$${minPrice}`;
    } else {
      return `$${minPrice} - $${maxPrice}`;
    }
  };

  const getAttendanceInfo = (ticketTypes: any[]) => {
    if (!ticketTypes || ticketTypes.length === 0) return { sold: 0, capacity: 0 };
    
    const sold = ticketTypes.reduce((sum, tt) => sum + (tt.quantity_sold || 0), 0);
    const capacity = ticketTypes.reduce((sum, tt) => sum + (tt.quantity_available || 0), 0);
    
    return { sold, capacity: sold + capacity };
  };

  // Expose addToWishlist function for use by other components
  React.useImperativeHandle(() => ({
    addToWishlist
  }), [userId]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Saved Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5" />
          Saved Events Wishlist
        </CardTitle>
        <CardDescription>
          Events you've saved for later consideration
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {savedEvents.length > 0 ? (
          <div className="space-y-4">
            {savedEvents.map((savedEvent) => {
              const event = savedEvent.event;
              if (!event) return null;

              const attendanceInfo = getAttendanceInfo(event.ticket_types || []);
              
              return (
                <Card key={savedEvent.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Event Image Placeholder */}
                      <div className="w-20 h-20 bg-gradient-to-br from-stepping-purple to-stepping-pink rounded-lg flex-shrink-0 flex items-center justify-center">
                        <Calendar className="h-8 w-8 text-white" />
                      </div>

                      {/* Event Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-lg line-clamp-1">{event.title}</h3>
                            <Badge variant="secondary" className="text-xs">
                              {event.category}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveFromWishlist(savedEvent.id, event.title)}
                              disabled={disabled}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2 mb-3">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            {formatEventDate(event.start_date, event.end_date)}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            {formatEventTime(event.start_date, event.end_date)}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            {event.is_online ? 'Online Event' : event.venues?.name || 'TBD'}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              {getEventPrice(event.ticket_types || [])}
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {attendanceInfo.sold}/{attendanceInfo.capacity}
                            </div>
                          </div>
                        </div>

                        {savedEvent.notes && (
                          <div className="p-2 bg-yellow-50 rounded border border-yellow-200 mb-3">
                            <p className="text-sm text-yellow-800">
                              <Star className="h-3 w-3 inline mr-1" />
                              {savedEvent.notes}
                            </p>
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <Button size="sm" asChild className="bg-stepping-gradient">
                            <Link to={`/events/${event.id}`}>
                              <ExternalLink className="h-4 w-4 mr-2" />
                              View Event
                            </Link>
                          </Button>
                          <span className="text-xs text-muted-foreground">
                            Saved {new Date(savedEvent.saved_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Heart className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No saved events yet</h3>
            <p className="text-sm mb-4">
              Save events you're interested in to easily find them later
            </p>
            <Button asChild>
              <Link to="/events">
                Browse Events
              </Link>
            </Button>
          </div>
        )}

        {/* Tips */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2">💡 Tips</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Save events you're considering to compare later</li>
            <li>• Add notes to remember why you're interested</li>
            <li>• Check back regularly as event details may change</li>
            <li>• Events in your wishlist won't be held - register when ready</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default SavedEventsWishlist;