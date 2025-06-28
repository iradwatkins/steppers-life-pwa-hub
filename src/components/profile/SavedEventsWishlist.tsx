import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Calendar, MapPin, Trash2, Eye, Bell, BellOff } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface SavedEvent {
  id: string;
  event_id: string;
  event_title: string;
  event_description: string;
  event_category: string;
  event_start_date: string;
  event_end_date: string;
  event_is_online: boolean;
  venue_name: string;
  venue_city: string;
  venue_state: string;
  min_price: number;
  max_price: number;
  notes: string;
  priority: number;
  saved_at: string;
  last_viewed_at: string;
  notifications_enabled: boolean;
}

const SavedEventsWishlist: React.FC = () => {
  const { user } = useAuth();
  const [savedEvents, setSavedEvents] = useState<SavedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');

  const loadSavedEvents = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Mock data for now since we don't have the actual service
      const mockEvents: SavedEvent[] = [];
      setSavedEvents(mockEvents);
    } catch (error) {
      console.error('Error loading saved events:', error);
      toast.error('Failed to load saved events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSavedEvents();
  }, [user]);

  const handleRemoveEvent = async (eventId: string) => {
    try {
      // Remove from state immediately for better UX
      setSavedEvents(prev => prev.filter(event => event.event_id !== eventId));
      toast.success('Event removed from wishlist');
    } catch (error) {
      console.error('Error removing event:', error);
      toast.error('Failed to remove event');
    }
  };

  const handleToggleNotifications = async (eventId: string, enabled: boolean) => {
    try {
      setSavedEvents(prev =>
        prev.map(event =>
          event.event_id === eventId
            ? { ...event, notifications_enabled: enabled }
            : event
        )
      );
      toast.success(enabled ? 'Notifications enabled' : 'Notifications disabled');
    } catch (error) {
      console.error('Error updating notifications:', error);
      toast.error('Failed to update notifications');
    }
  };

  const filteredEvents = savedEvents.filter(event => {
    const eventDate = new Date(event.event_start_date);
    const now = new Date();
    
    switch (filter) {
      case 'upcoming':
        return eventDate > now;
      case 'past':
        return eventDate < now;
      default:
        return true;
    }
  });

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            My Saved Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Loading your saved events...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5" />
          My Saved Events ({savedEvents.length})
        </CardTitle>
        <CardDescription>
          Events you've saved to attend later
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filter buttons */}
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All Events
          </Button>
          <Button
            variant={filter === 'upcoming' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('upcoming')}
          >
            Upcoming
          </Button>
          <Button
            variant={filter === 'past' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('past')}
          >
            Past
          </Button>
        </div>

        {filteredEvents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No saved events found</p>
            <p className="text-sm">Start exploring events to build your wishlist!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEvents.map((event) => (
              <div key={event.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{event.event_title}</h3>
                    <p className="text-muted-foreground text-sm line-clamp-2">
                      {event.event_description}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleNotifications(
                        event.event_id,
                        !event.notifications_enabled
                      )}
                    >
                      {event.notifications_enabled ? (
                        <Bell className="h-4 w-4" />
                      ) : (
                        <BellOff className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveEvent(event.event_id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(event.event_start_date), 'MMM d, yyyy')}
                  </div>
                  {!event.event_is_online && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {event.venue_name}, {event.venue_city}
                    </div>
                  )}
                  {event.event_is_online && (
                    <Badge variant="secondary">Online Event</Badge>
                  )}
                </div>

                {event.event_category && (
                  <Badge variant="outline">{event.event_category}</Badge>
                )}

                {event.notes && (
                  <div className="text-sm">
                    <span className="font-medium">My Notes: </span>
                    <span className="text-muted-foreground">{event.notes}</span>
                  </div>
                )}

                <div className="flex justify-between items-center pt-2">
                  <div className="text-sm text-muted-foreground">
                    Saved {format(new Date(event.saved_at), 'MMM d, yyyy')}
                  </div>
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    View Event
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SavedEventsWishlist;
