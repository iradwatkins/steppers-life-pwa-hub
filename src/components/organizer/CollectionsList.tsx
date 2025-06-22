/**
 * CollectionsList Component
 * Displays a list of event collections with management actions
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { 
  Calendar,
  Users,
  DollarSign,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Package,
  Award,
  TrendingUp,
  Target,
  Globe,
  Lock,
  CheckCircle2,
  Clock
} from 'lucide-react';
import type { EventCollectionWithEvents } from '@/services/eventCollectionsService';

interface CollectionsListProps {
  collections: EventCollectionWithEvents[];
  onEdit?: (collection: EventCollectionWithEvents) => void;
  onDelete?: (collection: EventCollectionWithEvents) => void;
  onView?: (collection: EventCollectionWithEvents) => void;
  variant?: 'grid' | 'list';
}

const CollectionsList: React.FC<CollectionsListProps> = ({
  collections,
  onEdit,
  onDelete,
  onView,
  variant = 'list'
}) => {
  const getCollectionTypeIcon = (type: string) => {
    switch (type) {
      case 'series':
        return <Calendar className="h-4 w-4" />;
      case 'bundle':
        return <Package className="h-4 w-4" />;
      case 'festival':
        return <Award className="h-4 w-4" />;
      case 'tour':
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <Target className="h-4 w-4" />;
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge variant="outline" className="text-green-700 border-green-500">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Active
          </Badge>
        );
      case 'draft':
        return (
          <Badge variant="outline" className="text-yellow-700 border-yellow-500">
            <Clock className="h-3 w-3 mr-1" />
            Draft
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            {status}
          </Badge>
        );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (variant === 'grid') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {collections.map((collection) => (
          <Card key={collection.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Badge className={`text-white ${getCollectionTypeBadgeColor(collection.collection_type)}`}>
                    {getCollectionTypeIcon(collection.collection_type)}
                    <span className="ml-1 capitalize">{collection.collection_type}</span>
                  </Badge>
                  {collection.is_public ? (
                    <Globe className="h-4 w-4 text-green-600" title="Public Collection" />
                  ) : (
                    <Lock className="h-4 w-4 text-gray-600" title="Private Collection" />
                  )}
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {onView && (
                      <DropdownMenuItem onClick={() => onView(collection)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                    )}
                    {onEdit && (
                      <DropdownMenuItem onClick={() => onEdit(collection)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                    )}
                    {onDelete && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => onDelete(collection)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <div>
                <CardTitle className="text-lg line-clamp-1">{collection.name}</CardTitle>
                <CardDescription className="line-clamp-2 mt-1">
                  {collection.description || 'No description provided'}
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Status:</span>
                  {getStatusBadge(collection.status)}
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="flex items-center justify-center text-blue-600 mb-1">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <p className="font-semibold">{collection.total_events || 0}</p>
                    <p className="text-xs text-muted-foreground">Events</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center text-green-600 mb-1">
                      <Users className="h-4 w-4" />
                    </div>
                    <p className="font-semibold">{collection.total_attendees || 0}</p>
                    <p className="text-xs text-muted-foreground">Attendees</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center text-purple-600 mb-1">
                      <DollarSign className="h-4 w-4" />
                    </div>
                    <p className="font-semibold">${(collection.total_revenue || 0).toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Revenue</p>
                  </div>
                </div>

                {collection.discount_percentage && collection.discount_percentage > 0 && (
                  <div className="text-center">
                    <Badge variant="secondary" className="bg-red-50 text-red-700">
                      {collection.discount_percentage}% Discount
                    </Badge>
                  </div>
                )}

                <div className="text-xs text-muted-foreground text-center">
                  Created {formatDate(collection.created_at)}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // List variant (default)
  return (
    <div className="space-y-4">
      {collections.map((collection) => (
        <Card key={collection.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <Badge className={`text-white ${getCollectionTypeBadgeColor(collection.collection_type)}`}>
                    {getCollectionTypeIcon(collection.collection_type)}
                    <span className="ml-1 capitalize">{collection.collection_type}</span>
                  </Badge>
                  
                  {getStatusBadge(collection.status)}
                  
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

                  {collection.discount_percentage && collection.discount_percentage > 0 && (
                    <Badge variant="secondary" className="bg-red-50 text-red-700">
                      {collection.discount_percentage}% Discount
                    </Badge>
                  )}
                </div>
                
                <h3 className="text-lg font-semibold mb-1 line-clamp-1">{collection.name}</h3>
                <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                  {collection.description || 'No description provided'}
                </p>

                <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{collection.total_events || 0} events</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{collection.total_attendees || 0} attendees</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    <span>${(collection.total_revenue || 0).toLocaleString()} revenue</span>
                  </div>
                  
                  <div className="text-xs">
                    Created {formatDate(collection.created_at)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 ml-4">
                {onView && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onView(collection)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                )}

                {onEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(collection)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}

                {onDelete && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(collection)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default CollectionsList;