import React from 'react';
import { Calendar, Clock, Repeat, Users, Play, Pause } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EventSeries, EventTemplate } from '@/services/eventCollectionsService';

interface EventSeriesManagerProps {
  series: EventSeries[];
  templates: EventTemplate[];
  loading: boolean;
  organizerId: string;
  viewMode: 'grid' | 'list' | 'calendar';
}

const EventSeriesManager: React.FC<EventSeriesManagerProps> = ({
  series,
  templates,
  loading,
  organizerId,
  viewMode,
}) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  const getRecurrenceText = (series: EventSeries) => {
    const { type, interval } = series.recurrencePattern;
    const intervalText = interval === 1 ? '' : `Every ${interval} `;
    return `${intervalText}${type}`;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-16" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (series.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Repeat className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No event series found</h3>
            <p className="text-muted-foreground mb-4">
              Create recurring events to streamline your event management
            </p>
            <Button>Create Event Series</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {series.map((seriesItem) => (
        <Card key={seriesItem.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="line-clamp-1">{seriesItem.name}</span>
              <Badge variant="outline" className="text-xs">
                {getRecurrenceText(seriesItem)}
              </Badge>
            </CardTitle>
            <CardDescription className="line-clamp-2">
              {seriesItem.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {seriesItem.generatedEventIds.length} events
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  Since {formatDate(seriesItem.createdAt)}
                </span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button size="sm" className="flex-1">
                <Play className="h-4 w-4 mr-2" />
                Generate Events
              </Button>
              <Button size="sm" variant="outline">
                <Pause className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default EventSeriesManager; 