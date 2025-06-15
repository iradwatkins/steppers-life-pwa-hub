import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { 
  Grid3X3, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Share2, 
  Eye, 
  DollarSign, 
  Users, 
  TrendingUp,
  Calendar,
  ExternalLink,
  Copy,
  Tag
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { EventCollection } from '@/services/eventCollectionsService';
import { useEventCollections } from '@/hooks/useEventCollections';

interface CollectionsListProps {
  collections: EventCollection[];
  loading: boolean;
  error: string | null;
  viewMode: 'grid' | 'list' | 'calendar';
  organizerId: string;
  onSelectCollection: (collectionId: string | null) => void;
  selectedCollectionId: string | null;
}

const CollectionsList: React.FC<CollectionsListProps> = ({
  collections,
  loading,
  error,
  viewMode,
  organizerId,
  onSelectCollection,
  selectedCollectionId,
}) => {
  const {
    updateCollection,
    deleteCollection,
    getPublicCollectionUrl,
    exportCollectionData,
  } = useEventCollections(organizerId);

  const [draggedCollections, setDraggedCollections] = useState(collections);

  // Update local state when props change
  React.useEffect(() => {
    setDraggedCollections(collections);
  }, [collections]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(draggedCollections);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setDraggedCollections(items);
    // In a real app, you would persist this order to the backend
  };

  const handleShareCollection = async (collection: EventCollection) => {
    try {
      if (collection.isPublic) {
        const url = await getPublicCollectionUrl(collection.id);
        await navigator.clipboard.writeText(url);
        toast.success('Public collection URL copied to clipboard');
      } else {
        toast.error('Collection must be public to share');
      }
    } catch (error) {
      toast.error('Failed to get collection URL');
    }
  };

  const handleExportCollection = async (collection: EventCollection, format: 'csv' | 'json' | 'pdf') => {
    try {
      await exportCollectionData(collection.id, format);
    } catch (error) {
      toast.error(`Failed to export collection as ${format.toUpperCase()}`);
    }
  };

  const handleDeleteCollection = async (collection: EventCollection) => {
    if (window.confirm(`Are you sure you want to delete "${collection.name}"? This action cannot be undone.`)) {
      try {
        await deleteCollection(collection.id);
        if (selectedCollectionId === collection.id) {
          onSelectCollection(null);
        }
      } catch (error) {
        // Error is handled by the hook
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  const CollectionCard: React.FC<{ collection: EventCollection; index: number }> = ({ collection, index }) => (
    <Draggable draggableId={collection.id} index={index}>
      {(provided, snapshot) => (
        <Card
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`cursor-pointer transition-all hover:shadow-md ${
            selectedCollectionId === collection.id ? 'ring-2 ring-primary' : ''
          } ${snapshot.isDragging ? 'rotate-2 scale-105' : ''}`}
          onClick={() => onSelectCollection(collection.id)}
          style={{
            ...provided.draggableProps.style,
            borderLeft: `4px solid ${collection.branding.color}`,
          }}
        >
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold line-clamp-1">
                {collection.name}
              </CardTitle>
              <CardDescription className="line-clamp-2 mt-1">
                {collection.description}
              </CardDescription>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onSelectCollection(collection.id)}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Collection
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleShareCollection(collection)}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Collection
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportCollection(collection, 'csv')}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportCollection(collection, 'json')}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Export as JSON
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => handleDeleteCollection(collection)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Collection
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Tags */}
            {collection.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {collection.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
                {collection.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{collection.tags.length - 3} more
                  </Badge>
                )}
              </div>
            )}

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{collection.eventIds.length} events</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{collection.analytics.totalTicketsSold} sold</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{collection.analytics.totalViews} views</span>
              </div>
            </div>

            {/* Revenue and Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Revenue</span>
                <span className="text-sm font-semibold text-green-600">
                  {formatCurrency(collection.analytics.totalRevenue)}
                </span>
              </div>
              <Progress 
                value={(collection.analytics.totalTicketsSold / (collection.eventIds.length * 50)) * 100} 
                className="h-2"
              />
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
              <span>Updated {formatDate(collection.updatedAt)}</span>
              <div className="flex items-center gap-2">
                {collection.isPublic && (
                  <Badge variant="outline" className="text-xs">
                    Public
                  </Badge>
                )}
                <TrendingUp className="h-3 w-3" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </Draggable>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                  <Skeleton className="h-2 w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Failed to load collections</p>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (collections.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Grid3X3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No collections found</h3>
            <p className="text-muted-foreground mb-4">
              Create your first event collection to organize and promote your events
            </p>
            <Button>Create Collection</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (viewMode === 'grid') {
    return (
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="collections" direction="horizontal">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {draggedCollections.map((collection, index) => (
                <CollectionCard key={collection.id} collection={collection} index={index} />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    );
  }

  if (viewMode === 'list') {
    return (
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="collections">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-4">
              {draggedCollections.map((collection, index) => (
                <Draggable key={collection.id} draggableId={collection.id} index={index}>
                  {(provided, snapshot) => (
                    <Card
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedCollectionId === collection.id ? 'ring-2 ring-primary' : ''
                      } ${snapshot.isDragging ? 'rotate-1 scale-102' : ''}`}
                      onClick={() => onSelectCollection(collection.id)}
                      style={{
                        ...provided.draggableProps.style,
                        borderLeft: `4px solid ${collection.branding.color}`,
                      }}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-4">
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold">{collection.name}</h3>
                                <p className="text-muted-foreground text-sm">{collection.description}</p>
                              </div>
                              <div className="flex items-center gap-6 text-sm">
                                <div className="text-center">
                                  <div className="font-semibold">{collection.eventIds.length}</div>
                                  <div className="text-muted-foreground">Events</div>
                                </div>
                                <div className="text-center">
                                  <div className="font-semibold">{collection.analytics.totalTicketsSold}</div>
                                  <div className="text-muted-foreground">Sold</div>
                                </div>
                                <div className="text-center">
                                  <div className="font-semibold text-green-600">
                                    {formatCurrency(collection.analytics.totalRevenue)}
                                  </div>
                                  <div className="text-muted-foreground">Revenue</div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => onSelectCollection(collection.id)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Collection
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleShareCollection(collection)}>
                                <Share2 className="h-4 w-4 mr-2" />
                                Share Collection
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDeleteCollection(collection)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Collection
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    );
  }

  // Calendar view placeholder
  return (
    <Card>
      <CardContent className="flex items-center justify-center py-12">
        <div className="text-center">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Calendar View</h3>
          <p className="text-muted-foreground">
            Calendar view for collections is coming soon
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CollectionsList; 