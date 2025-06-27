/**
 * ShareableEventCard Component
 * Enhanced event card with built-in social sharing capabilities
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Clock, Users, DollarSign, Star, Heart } from 'lucide-react';
import FollowButton from '@/components/following/FollowButton';
import SocialShareButtons from '@/components/SocialShareButtons';
import { SocialSharingService } from '@/services/socialSharingService';
import type { Database } from '@/integrations/supabase/types';

type Event = Database['public']['Tables']['events']['Row'] & {
  organizers?: any;
  venues?: any;
  ticket_types?: any[];
  distance?: number;
  isFavorited?: boolean;
  requires_tickets?: boolean;
};

interface ShareableEventCardProps {
  event: Event;
  variant?: 'grid' | 'list' | 'featured' | 'compact';
  showRating?: boolean;
  showSoldOutStatus?: boolean;
  showSocialShare?: boolean;
  shareVariant?: 'inline' | 'popover' | 'modal' | 'icon-only';
  onToggleFavorite?: (eventId: string, isFavorited: boolean) => void;
}

const ShareableEventCard: React.FC<ShareableEventCardProps> = ({ 
  event, 
  variant = 'grid',
  showRating = true,
  showSoldOutStatus = true,
  showSocialShare = true,
  shareVariant = 'icon-only',
  onToggleFavorite
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

  const getEventPrice = (event: Event) => {
    // Check if this is a free event (no tickets required)
    if (event.requires_tickets === false) {
      return 'Free';
    }
    
    // For ticketed events, check ticket types
    const ticketTypes = event.ticket_types || [];
    if (ticketTypes.length === 0) {
      return 'Free';
    }
    
    const prices = ticketTypes.map(tt => tt.price).filter(p => p > 0);
    if (prices.length === 0) {
      return 'Free';
    }
    
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    
    if (minPrice === maxPrice) {
      return `$${minPrice}`;
    } else {
      return `$${minPrice} - $${maxPrice}`;
    }
  };

  const getAttendanceInfo = (event: Event) => {
    // For free events, return basic capacity info
    if (event.requires_tickets === false) {
      return { sold: 0, capacity: 100, isSoldOut: false };
    }
    
    // For ticketed events, use ticket data
    const ticketTypes = event.ticket_types || [];
    if (ticketTypes.length === 0) return { sold: 0, capacity: 0, isSoldOut: false };
    
    const sold = ticketTypes.reduce((sum, tt) => sum + (tt.quantity_sold || 0), 0);
    const capacity = ticketTypes.reduce((sum, tt) => sum + (tt.quantity_available || 0), 0);
    const totalCapacity = sold + capacity;
    const isSoldOut = capacity === 0 && sold > 0;
    
    return { sold, capacity: totalCapacity, isSoldOut };
  };

  const getActionButtonText = (event: Event, isSoldOut: boolean) => {
    if (isSoldOut) {
      return 'Sold Out';
    }
    
    if (event.requires_tickets === false) {
      return 'View Details';
    }
    
    return 'Get Tickets';
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

  const handleToggleFavorite = () => {
    if (onToggleFavorite) {
      onToggleFavorite(event.id, !event.isFavorited);
    }
  };

  const attendanceInfo = getAttendanceInfo(event);
  const eventRating = getEventRating();
  const shareOptions = SocialSharingService.generateEventShareOptions(event);

  // Compact variant for minimal space usage
  if (variant === 'compact') {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* Event Image */}
            <div className="w-16 h-16 bg-muted rounded-md flex-shrink-0 relative">
              {event.featured_image_url && (
                <img 
                  src={event.featured_image_url} 
                  alt={event.title}
                  className="w-full h-full object-cover rounded-md"
                />
              )}
              {showSoldOutStatus && attendanceInfo.isSoldOut && (
                <div className="absolute inset-0 bg-black/50 rounded-md flex items-center justify-center">
                  <Badge variant="destructive" className="text-xs">Sold Out</Badge>
                </div>
              )}
            </div>
            
            {/* Event Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-1">
                <div className="flex items-center gap-1">
                  <Badge className={`text-white text-xs ${getCategoryBadgeColor(event.category)}`}>
                    {event.category}
                  </Badge>
                  {showRating && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      {eventRating.toFixed(1)}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {onToggleFavorite && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleToggleFavorite}
                      className="h-6 w-6 p-0"
                    >
                      <Heart className={`h-3 w-3 ${event.isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
                    </Button>
                  )}
                  {showSocialShare && (
                    <SocialShareButtons
                      shareOptions={shareOptions}
                      variant={shareVariant}
                      size="sm"
                      showLabels={false}
                      className="h-6 w-6 p-0"
                    />
                  )}
                </div>
              </div>
              
              <h3 className="font-medium text-sm line-clamp-1 mb-1">{event.title}</h3>
              
              <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatEventDate(event.start_date, event.end_date)}
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3 text-stepping-purple" />
                  <span className="font-semibold text-stepping-purple">
                    {getEventPrice(event)}
                  </span>
                </div>
              </div>
              
              <Button size="sm" asChild className="w-full bg-stepping-gradient text-xs h-7">
                <Link to={`/events/${event.id}`}>
                  {getActionButtonText(event, attendanceInfo.isSoldOut)}
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

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
                    {getEventPrice(event)}
                  </span>
                </div>
                {onToggleFavorite && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleToggleFavorite}
                    className="h-8 w-8 p-0"
                  >
                    <Heart className={`h-4 w-4 ${event.isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
                  </Button>
                )}
                {showSocialShare && (
                  <SocialShareButtons
                    shareOptions={shareOptions}
                    variant={shareVariant}
                    size="sm"
                    showLabels={false}
                  />
                )}
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
                  {getActionButtonText(event, attendanceInfo.isSoldOut)}
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
          
          {/* Social Share and Favorite buttons overlay */}
          <div className="absolute top-2 right-2 flex gap-1">
            {onToggleFavorite && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleToggleFavorite}
                className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
              >
                <Heart className={`h-4 w-4 ${event.isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
            )}
            {showSocialShare && (
              <SocialShareButtons
                shareOptions={shareOptions}
                variant={shareVariant}
                size="sm"
                showLabels={false}
                className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
              />
            )}
          </div>
          
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
              {getEventPrice(event)}
            </span>
          </div>
          <Button 
            size="sm" 
            asChild 
            className="bg-stepping-gradient"
            disabled={showSoldOutStatus && attendanceInfo.isSoldOut}
          >
            <Link to={`/events/${event.id}`}>
              {getActionButtonText(event, attendanceInfo.isSoldOut)}
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ShareableEventCard;