import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Eye, 
  MousePointer, 
  DollarSign, 
  Calendar,
  ExternalLink,
  MoreHorizontal,
  Pause,
  Play,
  BarChart3
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { DirectUserAd, AdStatus } from '@/types/advertising';
import { format } from 'date-fns';

interface UserAdListProps {
  ads: DirectUserAd[];
}

export const UserAdList: React.FC<UserAdListProps> = ({ ads }) => {
  const getStatusBadge = (status: AdStatus) => {
    const statusConfig = {
      [AdStatus.DRAFT]: { variant: 'secondary' as const, label: 'Draft' },
      [AdStatus.PENDING_APPROVAL]: { variant: 'default' as const, label: 'Pending Review' },
      [AdStatus.APPROVED]: { variant: 'outline' as const, label: 'Approved' },
      [AdStatus.RUNNING]: { variant: 'default' as const, label: 'Running' },
      [AdStatus.PAUSED]: { variant: 'secondary' as const, label: 'Paused' },
      [AdStatus.COMPLETED]: { variant: 'outline' as const, label: 'Completed' },
      [AdStatus.REJECTED]: { variant: 'destructive' as const, label: 'Rejected' },
      [AdStatus.CANCELLED]: { variant: 'destructive' as const, label: 'Cancelled' }
    };

    const config = statusConfig[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getStatusColor = (status: AdStatus): string => {
    switch (status) {
      case AdStatus.RUNNING:
        return 'border-l-green-500';
      case AdStatus.PENDING_APPROVAL:
        return 'border-l-yellow-500';
      case AdStatus.REJECTED:
      case AdStatus.CANCELLED:
        return 'border-l-red-500';
      case AdStatus.COMPLETED:
        return 'border-l-blue-500';
      default:
        return 'border-l-gray-300';
    }
  };

  if (ads.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Advertisements Yet</h3>
          <p className="text-gray-600 mb-4">
            You haven't created any advertisements yet. Start promoting your services to the SteppersLife community!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {ads.map((ad) => (
        <Card key={ad.id} className={`border-l-4 ${getStatusColor(ad.status)}`}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-lg">{ad.title}</CardTitle>
                  {getStatusBadge(ad.status)}
                </div>
                <CardDescription>
                  {ad.description || 'No description provided'}
                </CardDescription>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {format(ad.schedule.startDate, 'MMM d')} - {format(ad.schedule.endDate, 'MMM d, yyyy')}
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    ${ad.pricing.totalCost}
                  </div>
                  <a 
                    href={ad.clickThroughUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Visit Site
                  </a>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Analytics
                  </DropdownMenuItem>
                  {ad.status === AdStatus.RUNNING && (
                    <DropdownMenuItem>
                      <Pause className="h-4 w-4 mr-2" />
                      Pause Ad
                    </DropdownMenuItem>
                  )}
                  {ad.status === AdStatus.PAUSED && (
                    <DropdownMenuItem>
                      <Play className="h-4 w-4 mr-2" />
                      Resume Ad
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem>
                    Edit Ad
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600">
                    Cancel Ad
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>

          <CardContent>
            {/* Performance Metrics */}
            {ad.performance && (
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-lg font-semibold">
                    <Eye className="h-4 w-4 text-blue-600" />
                    {ad.performance.impressions.toLocaleString()}
                  </div>
                  <p className="text-sm text-gray-500">Impressions</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-lg font-semibold">
                    <MousePointer className="h-4 w-4 text-green-600" />
                    {ad.performance.clicks.toLocaleString()}
                  </div>
                  <p className="text-sm text-gray-500">Clicks</p>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold">
                    {ad.performance.clickThroughRate.toFixed(2)}%
                  </div>
                  <p className="text-sm text-gray-500">CTR</p>
                </div>
              </div>
            )}

            {/* Status Messages */}
            {ad.status === AdStatus.REJECTED && ad.rejectionReason && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">
                  <strong>Rejection Reason:</strong> {ad.rejectionReason}
                </p>
              </div>
            )}

            {ad.status === AdStatus.PENDING_APPROVAL && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  Your ad is currently under review. We'll notify you once it's approved.
                </p>
              </div>
            )}

            {ad.adminNotes && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Admin Notes:</strong> {ad.adminNotes}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}; 