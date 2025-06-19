import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Clock, Users, DollarSign, Star } from 'lucide-react';
import FollowButton from '@/components/following/FollowButton';
import type { Database } from '@/integrations/supabase/types';

type Event = Database['public']['Tables']['events']['Row'] & {
  organizers?: any;
  venues?: any;
  ticket_types?: any[];
  distance?: number;
};

interface EventCardProps {
  event: Event;
  variant?: 'grid' | 'list' | 'featured';
  showRating?: boolean;
  showSoldOutStatus?: boolean;
}

const EventCard: React.FC<EventCardProps> = ({ 
  event, 
  variant = 'grid',
  showRating = true,
  showSoldOutStatus = true 
}) => {
  // Helper functions
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

  const formatEventDate = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const formatOptions: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
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
    if (!ticketTypes || ticketTypes.length === 0) return { sold: 0, capacity: 0, isSoldOut: false };
    
    const sold = ticketTypes.reduce((sum, tt) => sum + (tt.quantity_sold || 0), 0);
    const capacity = ticketTypes.reduce((sum, tt) => sum + (tt.quantity_available || 0), 0);
    const totalCapacity = sold + capacity;
    const isSoldOut = capacity === 0 && sold > 0;
    
    return { sold, capacity: totalCapacity, isSoldOut };
  };

  const formatDistance = (distance: number) => {
    if (distance < 1) {
      return `${(distance * 5280).toFixed(0)} ft`;
    }
    return `${distance.toFixed(1)} mi`;
  };

  const getEventRating = () => {
    // Mock rating for now - would come from reviews/ratings table
    return 4.2 + Math.random() * 0.8; // Random rating between 4.2 and 5.0
  };

  const attendanceInfo = getAttendanceInfo(event.ticket_types || []);
  const eventRating = getEventRating();

  // List View Layout
  if (variant === 'list') {
    return (
      <Card className="hover:shadow-lg transition-shadow p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Event Image */}
          <div className="w-full sm:w-32 h-24 bg-muted rounded-md flex-shrink-0 relative">
            {event.featured_image_url && (
              <img 
                src={event.featured_image_url} 
                alt={event.title}
                className="w-full h-full object-cover rounded-md"
              />
            )}
            {showSoldOutStatus && attendanceInfo.isSoldOut && (
              <div className="absolute inset-0 bg-black/50 rounded-md flex items-center justify-center">
                <Badge variant="destructive">Sold Out</Badge>
              </div>
            )}
          </div>
          
          {/* Event Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={`text-white ${getCategoryBadgeColor(event.category)}`}>
                  {event.category}
                </Badge>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Users className="h-3 w-3" />
                  {attendanceInfo.sold}/{attendanceInfo.capacity}
                </div>
                {showRating && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    {eventRating.toFixed(1)}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4 text-stepping-purple" />
                  <span className="text-lg font-semibold text-stepping-purple">
                    {getEventPrice(event.ticket_types || [])}
                  </span>
                </div>
                {event.organizer_id && (
                  <FollowButton
                    entityId={event.organizer_id}
                    entityType="organizer"
                    entityName={event.organizers?.organization_name}
                    variant="icon"
                    size="sm"
                  />
                )}
              </div>
            </div>
            
            <h3 className="text-lg font-semibold mb-2 line-clamp-1">{event.title}</h3>
            <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
              {event.short_description || event.description}
            </p>
            
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatEventDate(event.start_date, event.end_date)}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatEventTime(event.start_date, event.end_date)}
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <div className="flex-1">
                  {event.is_online ? 'Online Event' : (event.venues as any)?.name || 'TBD'}
                  {!event.is_online && event.distance && (
                    <span className="ml-2 text-xs bg-stepping-purple/10 text-stepping-purple px-2 py-1 rounded-full">
                      {formatDistance(event.distance)}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button 
                size="sm" 
                asChild 
                className="bg-stepping-gradient"
                disabled={showSoldOutStatus && attendanceInfo.isSoldOut}
              >
                <Link to={`/events/${event.id}`}>
                  {attendanceInfo.isSoldOut ? 'Sold Out' : 'View Details'}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Grid View Layout (default and featured)
  return (
    <Card className={`hover:shadow-lg transition-shadow ${variant === 'featured' ? 'border-yellow-200' : ''}`}>
      <CardHeader>
        <div className="aspect-video bg-muted rounded-md mb-4 relative">
          {variant === 'featured' && (
            <Badge className="absolute top-2 left-2 bg-yellow-500 text-yellow-900">
              <Star className="h-3 w-3 mr-1" />
              Featured
            </Badge>
          )}
          {event.featured_image_url && (
            <img 
              src={event.featured_image_url} 
              alt={event.title}
              className="w-full h-full object-cover rounded-md"
            />
          )}
          {showSoldOutStatus && attendanceInfo.isSoldOut && (
            <div className="absolute inset-0 bg-black/50 rounded-md flex items-center justify-center">
              <Badge variant="destructive" className="text-lg">Sold Out</Badge>
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={`text-white ${getCategoryBadgeColor(event.category)}`}>
              {event.category}
            </Badge>
            {showRating && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                {eventRating.toFixed(1)}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Users className="h-3 w-3" />
              {attendanceInfo.sold}/{attendanceInfo.capacity}
            </div>
            {event.organizer_id && (
              <FollowButton
                entityId={event.organizer_id}
                entityType="organizer"
                entityName={event.organizers?.organization_name}
                variant="icon"
                size="sm"
              />
            )}
          </div>
        </div>
        
        <CardTitle className="text-lg line-clamp-2">{event.title}</CardTitle>
        <CardDescription className="line-clamp-2">
          {event.short_description || event.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-2 mb-4">
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
            <div className="flex-1">
              {event.is_online ? 'Online Event' : (event.venues as any)?.name || 'TBD'}
              {!event.is_online && event.distance && (
                <span className="ml-2 text-xs bg-stepping-purple/10 text-stepping-purple px-2 py-1 rounded-full">
                  {formatDistance(event.distance)}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <DollarSign className="h-4 w-4 text-stepping-purple" />
            <span className="text-lg font-semibold text-stepping-purple">
              {getEventPrice(event.ticket_types || [])}
            </span>
          </div>
          <Button 
            size="sm" 
            asChild 
            className="bg-stepping-gradient"
            disabled={showSoldOutStatus && attendanceInfo.isSoldOut}
          >
            <Link to={`/events/${event.id}`}>
              {attendanceInfo.isSoldOut ? 'Sold Out' : 'View Details'}
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EventCard;