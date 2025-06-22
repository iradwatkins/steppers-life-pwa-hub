/**
 * CollectionDetailView Component
 * Shows detailed view of an event collection with its events
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  DragDropContext,
  Droppable,
  Draggable,
  DropResult
} from '@hello-pangea/dnd';
import ShareableEventCard from '@/components/ShareableEventCard';
import {
  Calendar,
  Users,
  DollarSign,
  Package,
  Award,
  TrendingUp,
  Target,
  Globe,
  Lock,
  Edit,
  Plus,
  GripVertical,
  Trash2
} from 'lucide-react';
import type { EventCollectionWithEvents } from '@/services/eventCollectionsService';

interface CollectionDetailViewProps {
  collection: EventCollectionWithEvents;
  onEdit?: () => void;
  onReorderEvents?: (eventOrders: { eventId: string; orderIndex: number }[]) => Promise<boolean>;
  onRemoveEvent?: (eventId: string) => Promise<boolean>;
  onAddEvents?: () => void;
  isEditable?: boolean;
}

const CollectionDetailView: React.FC<CollectionDetailViewProps> = ({
  collection,
  onEdit,
  onReorderEvents,
  onRemoveEvent,
  onAddEvents,
  isEditable = false
}) => {
  const [events, setEvents] = useState(collection.events || []);

  const getCollectionTypeIcon = (type: string) => {
    switch (type) {
      case 'series':
        return <Calendar className="h-5 w-5" />;
      case 'bundle':
        return <Package className="h-5 w-5" />;
      case 'festival':
        return <Award className="h-5 w-5" />;
      case 'tour':
        return <TrendingUp className="h-5 w-5" />;
      default:
        return <Target className="h-5 w-5" />;
    }
  };

  const getCollectionTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'series':
        return 'bg-blue-500';
      case 'bundle':
        return 'bg-green-500';
      case 'festival':
        return 'bg-purple-500';
      case 'tour':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination || !onReorderEvents) return;

    const items = Array.from(events);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setEvents(items);

    // Update order indices
    const eventOrders = items.map((event, index) => ({
      eventId: event.id,
      orderIndex: index
    }));

    const success = await onReorderEvents(eventOrders);
    if (!success) {
      // Revert on failure
      setEvents(collection.events || []);
    }
  };

  const handleRemoveEvent = async (eventId: string) => {
    if (!onRemoveEvent) return;

    const success = await onRemoveEvent(eventId);
    if (success) {
      setEvents(events.filter(event => event.id !== eventId));
    }
  };

  return (
    <div className="space-y-6">
      {/* Collection Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-lg text-white ${getCollectionTypeBadgeColor(collection.collection_type)}`}>
                {getCollectionTypeIcon(collection.collection_type)}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge className={`text-white ${getCollectionTypeBadgeColor(collection.collection_type)}`}>
                    {collection.collection_type}
                  </Badge>
                  {collection.is_public ? (
                    <div className="flex items-center gap-1 text-green-600 text-sm">
                      <Globe className="h-3 w-3" />
                      <span>Public</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-gray-600 text-sm">
                      <Lock className="h-3 w-3" />
                      <span>Private</span>
                    </div>
                  )}
                </div>
                <CardTitle className="text-2xl">{collection.name}</CardTitle>
                <CardDescription className="mt-1">
                  {collection.description || 'No description provided'}
                </CardDescription>
              </div>
            </div>

            {isEditable && onEdit && (
              <Button variant="outline" onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Collection
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center text-blue-600 mb-2">
                <Calendar className="h-5 w-5" />
              </div>
              <p className="text-2xl font-bold">{collection.total_events || 0}</p>
              <p className="text-sm text-muted-foreground">Events</p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center text-green-600 mb-2">
                <Users className="h-5 w-5" />
              </div>
              <p className="text-2xl font-bold">{collection.total_attendees || 0}</p>
              <p className="text-sm text-muted-foreground">Total Attendees</p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center text-purple-600 mb-2">
                <DollarSign className="h-5 w-5" />
              </div>
              <p className="text-2xl font-bold">${(collection.total_revenue || 0).toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center text-orange-600 mb-2">
                <Award className="h-5 w-5" />
              </div>
              <p className="text-2xl font-bold">
                {collection.discount_percentage || 0}%
              </p>
              <p className="text-sm text-muted-foreground">Discount</p>
            </div>
          </div>

          {/* Collection dates */}
          {(collection.starts_at || collection.ends_at) && (
            <>
              <Separator className="my-4" />
              <div className="space-y-2">
                {collection.starts_at && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Starts:</span>
                    <span>{formatDate(collection.starts_at)}</span>
                  </div>
                )}
                {collection.ends_at && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Ends:</span>
                    <span>{formatDate(collection.ends_at)}</span>
                  </div>
                )}
                {collection.max_attendees && collection.max_attendees > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Max Attendees:</span>
                    <span>{collection.max_attendees.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Events in Collection */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Events in Collection</CardTitle>
              <CardDescription>
                {events.length} event{events.length !== 1 ? 's' : ''} in this collection
              </CardDescription>
            </div>
            
            {isEditable && onAddEvents && (
              <Button variant="outline" onClick={onAddEvents}>
                <Plus className="h-4 w-4 mr-2" />
                Add Events
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {events.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No events yet</h3>
              <p className="text-muted-foreground mb-4">
                Start adding events to this collection
              </p>
              {isEditable && onAddEvents && (
                <Button onClick={onAddEvents}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Events
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {isEditable && onReorderEvents ? (
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="events">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                        {events.map((event, index) => (
                          <Draggable key={event.id} draggableId={event.id} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className="flex items-center gap-4"
                              >
                                <div {...provided.dragHandleProps} className="cursor-grab">
                                  <GripVertical className="h-5 w-5 text-muted-foreground" />
                                </div>
                                
                                <div className="flex-1">
                                  <ShareableEventCard
                                    event={event}
                                    variant="compact"
                                    showSocialShare={false}
                                  />
                                </div>

                                {isEditable && onRemoveEvent && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleRemoveEvent(event.id)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {events.map((event) => (
                    <ShareableEventCard
                      key={event.id}
                      event={event}
                      variant="compact"
                      showSocialShare={true}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CollectionDetailView;