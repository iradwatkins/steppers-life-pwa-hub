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

interface FavoriteEvent {
  id: string;
  user_id: string;
  event_id: string;
  saved_at: string;
  notes?: string;
  event?: any;
}

interface FavoriteEventsProps {
  userId: string;
  disabled?: boolean;
}

const FavoriteEvents: React.FC<FavoriteEventsProps> = ({
  userId,
  disabled = false
}) => {
  const [favoriteEvents, setFavoriteEvents] = useState<FavoriteEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadFavoriteEvents();
    }
  }, [userId]);

  const loadFavoriteEvents = async () => {
    try {
      setIsLoading(true);
      
      // For now, show mock data since the backend table might not exist yet
      createMockFavoriteEvents();
    } catch (error) {
      console.error('Error loading favorite events:', error);
      createMockFavoriteEvents();
    } finally {
      setIsLoading(false);
    }
  };

  const createMockFavoriteEvents = () => {
    const mockEvents: FavoriteEvent[] = [
      {
        id: '1',
        user_id: userId,
        event_id: 'mock-event-1',
        saved_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        notes: 'Can\'t wait for this workshop!',
        event: {
          id: 'mock-event-1',
          title: 'Advanced Chicago Stepping Workshop',
          description: 'Master advanced techniques in Chicago stepping with professional instructors.',
          category: 'Workshop',
          start_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
          end_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7 + 1000 * 60 * 60 * 3).toISOString(),
          is_online: false,
          featured_image_url: null,
          location: 'Chicago Dance Studio',
          organizer_id: 'organizer-1',
          organizer_name: 'StepMaster Pro',
          ticket_types: [
            {
              id: 'ticket-1',
              name: 'Workshop Pass',
              description: 'Full access to the workshop',
              price: 45.00,
              quantity_available: 30,
              quantity_sold: 8
            }
          ]
        }
      },
      {
        id: '2',
        user_id: userId,
        event_id: 'mock-event-2',
        saved_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
        notes: 'Love this monthly social!',
        event: {
          id: 'mock-event-2',
          title: 'Monthly Step Social',
          description: 'Join fellow steppers for a night of great music and dancing.',
          category: 'Social',
          start_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
          end_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14 + 1000 * 60 * 60 * 4).toISOString(),
          is_online: false,
          featured_image_url: null,
          location: 'Community Center Ballroom',
          organizer_id: 'organizer-2',
          organizer_name: 'Step Society',
          ticket_types: [
            {
              id: 'ticket-2',
              name: 'Social Entry',
              description: 'Entry to the monthly social',
              price: 15.00,
              quantity_available: 100,
              quantity_sold: 42
            }
          ]
        }
      }
    ];

    setFavoriteEvents(mockEvents);
  };

  const removeFavorite = async (eventId: string) => {
    try {
      // For now, just remove from local state
      setFavoriteEvents(prev => prev.filter(event => event.event_id !== eventId));
      toast.success('Event removed from favorites');
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast.error('Failed to remove favorite');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const getEventPrice = (ticketTypes: any[] = []) => {
    if (!Array.isArray(ticketTypes) || ticketTypes.length === 0) return 'Free';
    
    const prices = (ticketTypes || []).map(tt => tt?.price || 0).filter(p => p > 0);
    if (prices.length === 0) return 'Free';
    
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    
    if (minPrice === maxPrice) {
      return `$${minPrice.toFixed(2)}`;
    }
    return `$${minPrice.toFixed(2)} - $${maxPrice.toFixed(2)}`;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (favoriteEvents.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No Favorite Events Yet</h3>
          <p className="text-muted-foreground mb-6">
            Save events you're interested in to keep track of them here.
          </p>
          <Link to="/events">
            <Button>
              <Calendar className="h-4 w-4 mr-2" />
              Browse Events
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Favorite Events ({favoriteEvents.length})</h3>
      </div>

      <div className="space-y-4">
        {(favoriteEvents || []).map((favoriteEvent) => {
          const event = favoriteEvent?.event;
          if (!event) return null;

          return (
            <Card key={favoriteEvent.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-lg">{event.title}</h4>
                          <Badge variant="secondary">{event.category}</Badge>
                        </div>
                        
                        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                          {event.description}
                        </p>

                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(event.start_date)}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span>{event.is_online ? 'Online Event' : event.location}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <DollarSign className="h-4 w-4" />
                            <span>{getEventPrice(event.ticket_types)}</span>
                          </div>

                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Users className="h-4 w-4" />
                            <span>by {event.organizer_name}</span>
                          </div>
                        </div>

                        {favoriteEvent.notes && (
                          <div className="mt-3 p-2 bg-muted rounded text-sm">
                            <span className="font-medium">Note: </span>
                            {favoriteEvent.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <Link to={`/events/${event.id}`}>
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Event
                      </Button>
                    </Link>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeFavorite(event.id)}
                      disabled={disabled}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default FavoriteEvents;