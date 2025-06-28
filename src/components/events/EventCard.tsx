import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, Share2 } from 'lucide-react';
import SocialShareButtons from '@/components/SocialShareButtons';
import { format } from 'date-fns';

interface EventCardProps {
  event: {
    id: string;
    title: string;
    description?: string;
    start_date: string;
    start_time?: string;
    venue_name?: string;
    venue_address?: string;
    image_url?: string;
  };
  className?: string;
  showActions?: boolean;
}

const EventCard: React.FC<EventCardProps> = ({ event, className, showActions = true }) => {
  const formattedDate = format(new Date(event.start_date), 'EEE, MMM d, yyyy');
  const formattedTime = event.start_time ? format(new Date(`2000-01-01T${event.start_time}`), 'h:mm a') : null;

  const shareOptions = {
    title: event.title,
    text: event.description || '',
    url: `${window.location.origin}/events/${event.id}`,
  };

  return (
    <Card className={`group hover:shadow-lg transition-all duration-200 ${className}`}>
      {/* Image Section */}
      {event.image_url && (
        <div className="relative">
          <img
            src={event.image_url}
            alt={event.title}
            className="aspect-video w-full object-cover rounded-t-md"
          />
          <div className="absolute top-2 right-2">
            <SocialShareButtons shareOptions={shareOptions} variant="icon-only" size="sm" />
          </div>
        </div>
      )}
      
      <CardContent className="p-4 space-y-3">
        {/* Title and Description */}
        <div className="space-y-1">
          <CardTitle className="text-lg font-semibold line-clamp-1">{event.title}</CardTitle>
          {event.description && (
            <CardDescription className="text-sm text-muted-foreground line-clamp-2">
              {event.description}
            </CardDescription>
          )}
        </div>
        
        {/* Date and Time */}
        <div className="flex items-center text-sm text-muted-foreground">
          <Calendar className="h-4 w-4 mr-2" />
          {formattedDate}
        </div>
        {formattedTime && (
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="h-4 w-4 mr-2" />
            {formattedTime}
          </div>
        )}
        
        {/* Venue Information */}
        {(event.venue_name || event.venue_address) && (
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mr-2" />
            <span>
              {event.venue_name && <div>{event.venue_name}</div>}
              {event.venue_address && <div>{event.venue_address}</div>}
            </span>
          </div>
        )}
        
        {/* Action Buttons */}
        {showActions && (
          <div className="flex flex-wrap gap-2 pt-2">
            <Button size="sm" asChild>
              <Link to={`/events/${event.id}`}>
                View Details
              </Link>
            </Button>
            
            {/* Removed rsvp_enabled check since property doesn't exist */}
            <Button variant="outline" size="sm" asChild>
              <Link to={`/events/${event.id}/tickets`}>
                Get Tickets
              </Link>
            </Button>
            
            <SocialShareButtons shareOptions={shareOptions} variant="inline" size="sm" showLabels={false} />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EventCard;
