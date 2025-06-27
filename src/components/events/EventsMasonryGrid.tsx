import React from 'react';
import EventCard from './EventCard';
import type { Database } from '@/integrations/supabase/types';

type Event = Database['public']['Tables']['events']['Row'] & {
  organizers?: any;
  venues?: any;
  ticket_types?: any[];
  distance?: number;
  requires_tickets?: boolean;
};

interface EventsMasonryGridProps {
  events: Event[];
  showRating?: boolean;
  showSoldOutStatus?: boolean;
  showSocialShare?: boolean;
  variant?: 'grid' | 'featured';
  className?: string;
}

const EventsMasonryGrid: React.FC<EventsMasonryGridProps> = ({
  events,
  showRating = true,
  showSoldOutStatus = true,
  showSocialShare = true,
  variant = 'grid',
  className = ''
}) => {
  // Distribute events across 4 columns for masonry effect
  const distributeEvents = () => {
    const columns = [[], [], [], []] as Event[][];
    
    events.forEach((event, index) => {
      const columnIndex = index % 4;
      columns[columnIndex].push(event);
    });
    
    return columns;
  };

  const eventColumns = distributeEvents();

  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className}`}>
      {eventColumns.map((column, columnIndex) => (
        <div key={columnIndex} className="grid gap-4">
          {column.map((event) => (
            <div key={event.id}>
              <EventCard
                event={event}
                variant={variant}
                showRating={showRating}
                showSoldOutStatus={showSoldOutStatus}
                showSocialShare={showSocialShare}
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default EventsMasonryGrid;