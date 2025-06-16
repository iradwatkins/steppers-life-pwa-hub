import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useInventory, useEventInventory } from '@/hooks/useInventory';
import { 
  AlertTriangle, 
  Zap, 
  CheckCircle, 
  Clock, 
  Users,
  TrendingUp,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface InventoryStatusBadgeProps {
  ticketTypeId: string;
  showDetails?: boolean;
  className?: string;
}

export const InventoryStatusBadge: React.FC<InventoryStatusBadgeProps> = ({
  ticketTypeId,
  showDetails = false,
  className
}) => {
  const { status, isLoading } = useInventory(ticketTypeId);

  if (isLoading || !status) {
    return (
      <Badge variant="secondary" className={className}>
        <Activity className="h-3 w-3 mr-1 animate-pulse" />
        Loading...
      </Badge>
    );
  }

  if (!status.isAvailable) {
    return (
      <Badge variant="destructive" className={className}>
        <AlertTriangle className="h-3 w-3 mr-1" />
        Sold Out
      </Badge>
    );
  }

  if (status.available <= 5) {
    return (
      <Badge 
        variant="outline" 
        className={cn("border-red-500 text-red-700", className)}
      >
        <AlertTriangle className="h-3 w-3 mr-1" />
        {showDetails ? `Only ${status.available} left!` : 'Almost Gone'}
      </Badge>
    );
  }

  if (status.available <= 20) {
    return (
      <Badge 
        variant="outline" 
        className={cn("border-orange-500 text-orange-700", className)}
      >
        <Zap className="h-3 w-3 mr-1" />
        {showDetails ? `${status.available} available` : 'Limited'}
      </Badge>
    );
  }

  return (
    <Badge 
      variant="outline" 
      className={cn("border-green-500 text-green-700", className)}
    >
      <CheckCircle className="h-3 w-3 mr-1" />
      {showDetails ? `${status.available} available` : 'Available'}
    </Badge>
  );
};

interface InventoryDetailsCardProps {
  ticketTypeId: string;
  ticketTypeName: string;
  showProgressBar?: boolean;
}

export const InventoryDetailsCard: React.FC<InventoryDetailsCardProps> = ({
  ticketTypeId,
  ticketTypeName,
  showProgressBar = true
}) => {
  const { status, isLoading, error } = useInventory(ticketTypeId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">{ticketTypeName}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 animate-pulse" />
            <span className="text-sm text-muted-foreground">Loading inventory...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !status) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">{ticketTypeName}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm">Unable to load inventory</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const soldPercentage = status.total > 0 ? (status.sold / status.total) * 100 : 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">{ticketTypeName}</CardTitle>
          <InventoryStatusBadge ticketTypeId={ticketTypeId} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground">Available</div>
            <div className="font-medium text-green-600">{status.available}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Sold</div>
            <div className="font-medium">{status.sold}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Total</div>
            <div className="font-medium">{status.total}</div>
          </div>
        </div>

        {showProgressBar && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Sales Progress</span>
              <span>{Math.round(soldPercentage)}%</span>
            </div>
            <Progress 
              value={soldPercentage} 
              className="h-2"
            />
          </div>
        )}

        {status.reserved > 0 && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{status.reserved} currently reserved</span>
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          Last updated: {new Date(status.lastUpdated).toLocaleTimeString()}
        </div>
      </CardContent>
    </Card>
  );
};

interface EventInventorySummaryProps {
  eventId: string;
  compact?: boolean;
}

export const EventInventorySummary: React.FC<EventInventorySummaryProps> = ({
  eventId,
  compact = false
}) => {
  const { summary, isLoading, isSoldOut, isLowStock, soldOutPercentage } = useEventInventory(eventId);

  if (isLoading || !summary) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 animate-pulse" />
            <span className="text-sm text-muted-foreground">Loading event inventory...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span>{summary.totalAvailable} available</span>
        </div>
        <div className="flex items-center gap-1">
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
          <span>{soldOutPercentage}% sold</span>
        </div>
        {isSoldOut && (
          <Badge variant="destructive">Sold Out</Badge>
        )}
        {isLowStock && !isSoldOut && (
          <Badge variant="outline" className="border-orange-500 text-orange-700">
            Low Stock
          </Badge>
        )}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Event Inventory Summary
        </CardTitle>
        <CardDescription>
          Real-time ticket availability across all ticket types
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{summary.totalAvailable}</div>
            <div className="text-sm text-muted-foreground">Available</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{summary.totalSold}</div>
            <div className="text-sm text-muted-foreground">Sold</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{summary.totalCapacity}</div>
            <div className="text-sm text-muted-foreground">Total Capacity</div>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span>Sales Progress</span>
            <span className="font-medium">{soldOutPercentage}%</span>
          </div>
          <Progress value={soldOutPercentage} className="h-3" />
        </div>

        <div className="flex gap-2">
          {isSoldOut && (
            <Badge variant="destructive">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Event Sold Out
            </Badge>
          )}
          {isLowStock && !isSoldOut && (
            <Badge variant="outline" className="border-orange-500 text-orange-700">
              <Zap className="h-3 w-3 mr-1" />
              Low Stock Event
            </Badge>
          )}
          {!isLowStock && !isSoldOut && (
            <Badge variant="outline" className="border-green-500 text-green-700">
              <CheckCircle className="h-3 w-3 mr-1" />
              Tickets Available
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};