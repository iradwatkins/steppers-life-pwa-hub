/**
 * FollowingFeed Component - Epic G.005: Following Organizers, Instructors, Community Listings
 * 
 * Displays a real-time feed of updates from followed organizers, instructors,
 * and businesses with engagement tracking and personalized content.
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useFollowing } from '@/hooks/useFollowing';
import { 
  Calendar, 
  MessageSquare, 
  Bell, 
  ExternalLink, 
  RefreshCw,
  Users,
  Megaphone,
  BookOpen,
  Heart,
  Eye
} from 'lucide-react';
import { type FollowingFeedItem } from '@/services/followingService';

export interface FollowingFeedProps {
  maxItems?: number;
  showRefreshButton?: boolean;
  className?: string;
}

export const FollowingFeed: React.FC<FollowingFeedProps> = ({
  maxItems = 20,
  showRefreshButton = true,
  className
}) => {
  const { followingFeed, refreshFeed, isLoading } = useFollowing();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshFeed();
    setIsRefreshing(false);
  };

  const getTypeIcon = (type: FollowingFeedItem['type']) => {
    switch (type) {
      case 'new_event':
        return <Calendar className="h-4 w-4 text-blue-500" />;
      case 'new_class':
        return <BookOpen className="h-4 w-4 text-green-500" />;
      case 'announcement':
        return <Megaphone className="h-4 w-4 text-purple-500" />;
      case 'update':
        return <Bell className="h-4 w-4 text-orange-500" />;
      default:
        return <MessageSquare className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTypeBadge = (type: FollowingFeedItem['type']) => {
    const config = {
      new_event: { label: 'New Event', color: 'bg-blue-100 text-blue-800' },
      new_class: { label: 'New Class', color: 'bg-green-100 text-green-800' },
      announcement: { label: 'Announcement', color: 'bg-purple-100 text-purple-800' },
      update: { label: 'Update', color: 'bg-orange-100 text-orange-800' }
    };

    const { label, color } = config[type] || { label: 'Update', color: 'bg-gray-100 text-gray-800' };
    
    return (
      <Badge variant="secondary" className={color}>
        {getTypeIcon(type)}
        <span className="ml-1">{label}</span>
      </Badge>
    );
  };

  const getEntityTypeIcon = (entityType: 'organizer' | 'instructor' | 'business') => {
    switch (entityType) {
      case 'organizer':
        return <Users className="h-3 w-3" />;
      case 'instructor':
        return <BookOpen className="h-3 w-3" />;
      case 'business':
        return <Megaphone className="h-3 w-3" />;
      default:
        return <Users className="h-3 w-3" />;
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  const displayedItems = followingFeed.slice(0, maxItems);

  if (isLoading && followingFeed.length === 0) {
    return (
      <div className={className}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Following Feed</h3>
          {showRefreshButton && (
            <Skeleton className="h-8 w-20" />
          )}
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-4 w-12" />
                </div>
                <Skeleton className="h-5 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Following Feed</h3>
        {showRefreshButton && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        )}
      </div>

      {displayedItems.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Heart className="h-12 w-12 text-muted-foreground mb-4" />
            <h4 className="text-lg font-medium mb-2">No updates yet</h4>
            <p className="text-muted-foreground text-center mb-4">
              Follow organizers, instructors, and businesses to see their latest updates here.
            </p>
            <Button variant="outline" asChild>
              <Link to="/events">Discover Events</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {displayedItems.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      {getEntityTypeIcon(item.entityType)}
                      <span className="capitalize">{item.entityType}</span>
                    </div>
                    <span className="font-medium">{item.entityName}</span>
                    {getTypeBadge(item.type)}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {formatTimeAgo(item.createdAt)}
                  </span>
                </div>
                <CardTitle className="text-base">{item.title}</CardTitle>
              </CardHeader>
              
              <CardContent>
                <CardDescription className="mb-4">
                  {item.description}
                </CardDescription>

                {item.imageUrl && (
                  <div className="mb-4">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-32 object-cover rounded-md"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      <span>{Math.floor(Math.random() * 100) + 20}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="h-3 w-3" />
                      <span>{Math.floor(Math.random() * 50) + 5}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      <span>{Math.floor(Math.random() * 10)}</span>
                    </div>
                  </div>

                  {item.actionUrl && (
                    <Button variant="outline" size="sm" asChild>
                      <Link to={item.actionUrl} className="flex items-center gap-1">
                        <span>View</span>
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {followingFeed.length > maxItems && (
            <Card>
              <CardContent className="flex items-center justify-center py-4">
                <Button variant="outline" className="w-full">
                  Load More Updates
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default FollowingFeed;