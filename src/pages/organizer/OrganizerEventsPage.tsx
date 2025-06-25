import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { EventService } from '@/services/eventService';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { 
  Plus,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Edit,
  BarChart3,
  Settings,
  Eye,
  AlertCircle,
  CheckCircle2,
  Clock,
  Ticket
} from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type Event = Database['public']['Tables']['events']['Row'] & {
  venues?: any;
  ticket_types?: any[];
};

const OrganizerEventsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [organizerId, setOrganizerId] = useState<string | null>(null);

  // Get organizer ID and load events
  useEffect(() => {
    const loadOrganizerData = async () => {
      if (!user?.id) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Get organizer ID for the current user
        const organizer = await EventService.getOrganizerByUserId(user.id);
        if (!organizer) {
          setError('You need to set up your organizer profile first.');
          return;
        }
        
        setOrganizerId(organizer.id);
        
        // Load events for this organizer
        const organizerEvents = await EventService.getEventsByOrganizer(organizer.id);
        setEvents(organizerEvents);
      } catch (error) {
        console.error('Error loading organizer events:', error);
        setError('Failed to load your events. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadOrganizerData();
  }, [user?.id]);

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

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'published': return 'default';
      case 'draft': return 'secondary';
      case 'unpublished': return 'outline';
      case 'archived': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published': return <CheckCircle2 className="h-3 w-3" />;
      case 'draft': return <Edit className="h-3 w-3" />;
      case 'unpublished': return <Clock className="h-3 w-3" />;
      case 'archived': return <AlertCircle className="h-3 w-3" />;
      default: return <AlertCircle className="h-3 w-3" />;
    }
  };

  const getTotalRevenue = (ticketTypes: any[]) => {
    if (!ticketTypes) return 0;
    return ticketTypes.reduce((sum, tt) => sum + (tt.price * (tt.quantity_sold || 0)), 0);
  };

  const getTotalTicketsSold = (ticketTypes: any[]) => {
    if (!ticketTypes) return 0;
    return ticketTypes.reduce((sum, tt) => sum + (tt.quantity_sold || 0), 0);
  };

  const getTotalTicketsAvailable = (ticketTypes: any[]) => {
    if (!ticketTypes) return 0;
    return ticketTypes.reduce((sum, tt) => sum + (tt.quantity_available || 0), 0);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            {error.includes('organizer profile') && (
              <Button asChild className="ml-4" size="sm">
                <Link to="/organizer/setup">Set Up Profile</Link>
              </Button>
            )}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Events</h1>
          <p className="text-muted-foreground">
            Manage your events, track performance, and engage with attendees.
          </p>
        </div>
        <Button asChild className="bg-stepping-gradient">
          <Link to="/events/create">
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </Link>
        </Button>
      </div>

      {/* Events Grid */}
      {events.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">No Events Yet</h2>
          <p className="text-muted-foreground mb-6">
            Create your first event to start building your community.
          </p>
          <Button asChild className="bg-stepping-gradient">
            <Link to="/events/create">
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Event
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => {
            const totalRevenue = getTotalRevenue(event.ticket_types || []);
            const ticketsSold = getTotalTicketsSold(event.ticket_types || []);
            const ticketsAvailable = getTotalTicketsAvailable(event.ticket_types || []);

            return (
              <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-muted relative">
                  {event.featured_image_url ? (
                    <img 
                      src={event.featured_image_url} 
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Calendar className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute top-2 left-2">
                    <Badge 
                      variant={getStatusBadgeVariant(event.status)} 
                      className="flex items-center gap-1"
                    >
                      {getStatusIcon(event.status)}
                      {event.status}
                    </Badge>
                  </div>
                </div>
                
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="line-clamp-2 text-lg">{event.title}</CardTitle>
                      <CardDescription className="line-clamp-2 mt-1">
                        {event.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Event Details */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{formatEventDate(event.start_date, event.end_date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {event.is_online ? 'Online Event' : 
                         event.venues ? `${event.venues.city}, ${event.venues.state}` : 'TBD'}
                      </span>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center p-2 bg-muted/50 rounded">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Ticket className="h-4 w-4 text-stepping-purple" />
                        <span className="font-medium">{ticketsSold}</span>
                      </div>
                      <span className="text-muted-foreground">Sold</span>
                    </div>
                    <div className="text-center p-2 bg-muted/50 rounded">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span className="font-medium">${totalRevenue}</span>
                      </div>
                      <span className="text-muted-foreground">Revenue</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      asChild
                    >
                      <Link to={`/events/${event.id}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Link>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      asChild
                    >
                      <Link to={`/events/create?edit=${event.id}`}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Link>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      asChild
                    >
                      <Link to={`/organizer/event/${event.id}`}>
                        <Settings className="h-4 w-4 mr-2" />
                        Manage
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrganizerEventsPage;