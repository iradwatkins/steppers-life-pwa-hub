import React from 'react';
import { BarChart3, TrendingUp, Users, Eye, DollarSign } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EventCollection } from '@/services/eventCollectionsService';

interface CollectionAnalyticsDashboardProps {
  collections: EventCollection[];
  loading: boolean;
  organizerId: string;
}

const CollectionAnalyticsDashboard: React.FC<CollectionAnalyticsDashboardProps> = ({
  collections,
  loading,
  organizerId,
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getTotalMetrics = () => {
    return collections.reduce(
      (totals, collection) => ({
        totalViews: totals.totalViews + collection.analytics.totalViews,
        totalTicketsSold: totals.totalTicketsSold + collection.analytics.totalTicketsSold,
        totalRevenue: totals.totalRevenue + collection.analytics.totalRevenue,
        totalEvents: totals.totalEvents + collection.eventIds.length,
      }),
      { totalViews: 0, totalTicketsSold: 0, totalRevenue: 0, totalEvents: 0 }
    );
  };

  const getTopPerformingCollections = () => {
    return [...collections]
      .sort((a, b) => b.analytics.totalRevenue - a.analytics.totalRevenue)
      .slice(0, 5);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-3 w-24 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Performance Table */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-4 w-32" />
                  <div className="flex gap-4">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (collections.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No analytics data</h3>
            <p className="text-muted-foreground">
              Create collections to start tracking performance analytics
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalMetrics = getTotalMetrics();
  const topCollections = getTopPerformingCollections();

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Collections</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{collections.length}</div>
            <p className="text-xs text-muted-foreground">
              {totalMetrics.totalEvents} total events
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMetrics.totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Across all collections
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tickets Sold</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMetrics.totalTicketsSold}</div>
            <p className="text-xs text-muted-foreground">
              Total attendees
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalMetrics.totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              From all collections
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Collections */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Top Performing Collections
          </CardTitle>
          <CardDescription>
            Collections ranked by total revenue generated
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topCollections.map((collection, index) => (
              <div key={collection.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-semibold">{collection.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {collection.eventIds.length} events • {collection.tags.join(', ')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <div className="font-semibold">{collection.analytics.totalViews}</div>
                    <div className="text-muted-foreground">Views</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">{collection.analytics.totalTicketsSold}</div>
                    <div className="text-muted-foreground">Tickets</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-green-600">
                      {formatCurrency(collection.analytics.totalRevenue)}
                    </div>
                    <div className="text-muted-foreground">Revenue</div>
                  </div>
                  <Badge 
                    variant={collection.isPublic ? "default" : "secondary"}
                    className="ml-4"
                  >
                    {collection.isPublic ? 'Public' : 'Private'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Collection Performance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Collection Status</CardTitle>
            <CardDescription>
              Overview of your collection visibility
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Public Collections</span>
                <Badge variant="default">
                  {collections.filter(c => c.isPublic).length}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Private Collections</span>
                <Badge variant="secondary">
                  {collections.filter(c => !c.isPublic).length}
                </Badge>
              </div>
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-sm font-medium">Total Collections</span>
                <Badge variant="outline">
                  {collections.length}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>
              Average performance across collections
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Avg. Views per Collection</span>
                <span className="font-semibold">
                  {Math.round(totalMetrics.totalViews / collections.length)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Avg. Tickets per Collection</span>
                <span className="font-semibold">
                  {Math.round(totalMetrics.totalTicketsSold / collections.length)}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-sm font-medium">Avg. Revenue per Collection</span>
                <span className="font-semibold text-green-600">
                  {formatCurrency(totalMetrics.totalRevenue / collections.length)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CollectionAnalyticsDashboard; 