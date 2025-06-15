import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  MoreHorizontal, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Pause, 
  Play,
  Search,
  DollarSign,
  Calendar,
  ExternalLink,
  User,
  BarChart3,
  Filter
} from 'lucide-react';
import { useAdvertising } from '@/hooks/useAdvertising';
import { DirectUserAd, AdStatus } from '@/types/advertising';
import { toast } from 'sonner';

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: AdStatus.PENDING_APPROVAL, label: 'Pending Approval' },
  { value: AdStatus.APPROVED, label: 'Approved' },
  { value: AdStatus.RUNNING, label: 'Running' },
  { value: AdStatus.PAUSED, label: 'Paused' },
  { value: AdStatus.COMPLETED, label: 'Completed' },
  { value: AdStatus.REJECTED, label: 'Rejected' },
];

export const DirectAdsManagement: React.FC = () => {
  const { 
    directUserAds, 
    adZones,
    loadingAds, 
    updateAdStatus 
  } = useAdvertising();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedAd, setSelectedAd] = useState<DirectUserAd | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject'>('approve');
  const [adminNotes, setAdminNotes] = useState('');

  const filteredAds = directUserAds
    .filter(ad => {
      const matchesSearch = 
        ad.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ad.advertiserInfo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ad.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || ad.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const handleStatusUpdate = async (adId: string, status: AdStatus, notes?: string) => {
    try {
      await updateAdStatus(adId, status, notes);
      setShowApprovalDialog(false);
      setSelectedAd(null);
      setAdminNotes('');
    } catch (error) {
      toast.error('Failed to update ad status');
    }
  };

  const handleApprovalAction = (ad: DirectUserAd, action: 'approve' | 'reject') => {
    setSelectedAd(ad);
    setApprovalAction(action);
    setShowApprovalDialog(true);
  };

  const handleViewDetails = (ad: DirectUserAd) => {
    setSelectedAd(ad);
    setShowDetailsDialog(true);
  };

  const getStatusBadge = (status: AdStatus) => {
    const statusStyles = {
      [AdStatus.PENDING_APPROVAL]: 'bg-yellow-500',
      [AdStatus.APPROVED]: 'bg-blue-500',
      [AdStatus.RUNNING]: 'bg-green-500',
      [AdStatus.PAUSED]: 'bg-orange-500',
      [AdStatus.COMPLETED]: 'bg-gray-500',
      [AdStatus.REJECTED]: 'bg-red-500',
      [AdStatus.CANCELLED]: 'bg-gray-400',
      [AdStatus.DRAFT]: 'bg-gray-300',
    };

    const statusLabels = {
      [AdStatus.PENDING_APPROVAL]: 'Pending',
      [AdStatus.APPROVED]: 'Approved',
      [AdStatus.RUNNING]: 'Running',
      [AdStatus.PAUSED]: 'Paused',
      [AdStatus.COMPLETED]: 'Completed',
      [AdStatus.REJECTED]: 'Rejected',
      [AdStatus.CANCELLED]: 'Cancelled',
      [AdStatus.DRAFT]: 'Draft',
    };

    return (
      <Badge variant="default" className={statusStyles[status]}>
        {statusLabels[status]}
      </Badge>
    );
  };

  const getZoneName = (zoneId: string) => {
    const zone = adZones.find(z => z.id === zoneId);
    return zone ? zone.name : 'Unknown Zone';
  };

  const formatUserType = (userType: string) => {
    return userType.charAt(0).toUpperCase() + userType.slice(1);
  };

  if (loadingAds) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Direct Ads Management</CardTitle>
          <CardDescription>Loading direct user ads...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Direct Ads Management</CardTitle>
              <CardDescription>
                Review and manage user-submitted advertisements ({directUserAds.length} total ads)
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filter Controls */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search ads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {filteredAds.length === 0 ? (
            <div className="text-center py-8">
              <div className="mx-auto w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || statusFilter !== 'all' ? 'No ads found' : 'No ads submitted yet'}
              </h3>
              <p className="text-gray-500">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Direct user ads will appear here when submitted'
                }
              </p>
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ad Details</TableHead>
                    <TableHead>Advertiser</TableHead>
                    <TableHead>Zone</TableHead>
                    <TableHead>Schedule</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAds.map((ad) => (
                    <TableRow key={ad.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{ad.title}</div>
                          <div className="text-sm text-gray-500 line-clamp-2">
                            {ad.description}
                          </div>
                          {ad.performance && (
                            <div className="flex gap-4 mt-1 text-xs text-gray-500">
                              <span>{ad.performance.impressions.toLocaleString()} views</span>
                              <span>{ad.performance.clicks} clicks</span>
                              <span>{ad.performance.clickThroughRate.toFixed(2)}% CTR</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <div>
                            <div className="font-medium">{ad.advertiserInfo.name}</div>
                            <div className="text-sm text-gray-500">
                              {formatUserType(ad.advertiserInfo.userType)}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{getZoneName(ad.adZoneId)}</span>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {ad.schedule.startDate.toLocaleDateString()} - {ad.schedule.endDate.toLocaleDateString()}
                          </div>
                          <div className="text-gray-500">
                            {ad.schedule.duration} days
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          <span className="font-medium">${ad.pricing.totalCost}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          ${ad.pricing.pricePerDay}/day
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(ad.status)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewDetails(ad)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            {ad.clickThroughUrl && (
                              <DropdownMenuItem onClick={() => window.open(ad.clickThroughUrl, '_blank')}>
                                <ExternalLink className="mr-2 h-4 w-4" />
                                Visit Link
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            {ad.status === AdStatus.PENDING_APPROVAL && (
                              <>
                                <DropdownMenuItem 
                                  onClick={() => handleApprovalAction(ad, 'approve')}
                                  className="text-green-600"
                                >
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleApprovalAction(ad, 'reject')}
                                  className="text-red-600"
                                >
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Reject
                                </DropdownMenuItem>
                              </>
                            )}
                            {(ad.status === AdStatus.RUNNING || ad.status === AdStatus.APPROVED) && (
                              <DropdownMenuItem 
                                onClick={() => handleStatusUpdate(ad.id, AdStatus.PAUSED)}
                              >
                                <Pause className="mr-2 h-4 w-4" />
                                Pause Ad
                              </DropdownMenuItem>
                            )}
                            {ad.status === AdStatus.PAUSED && (
                              <DropdownMenuItem 
                                onClick={() => handleStatusUpdate(ad.id, AdStatus.RUNNING)}
                              >
                                <Play className="mr-2 h-4 w-4" />
                                Resume Ad
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ad Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Ad Details</DialogTitle>
            <DialogDescription>Complete information about this advertisement</DialogDescription>
          </DialogHeader>
          {selectedAd && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Ad Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Title:</strong> {selectedAd.title}</div>
                    <div><strong>Zone:</strong> {getZoneName(selectedAd.adZoneId)}</div>
                    <div><strong>Status:</strong> {getStatusBadge(selectedAd.status)}</div>
                    <div><strong>Created:</strong> {selectedAd.createdAt.toLocaleDateString()}</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Advertiser</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Name:</strong> {selectedAd.advertiserInfo.name}</div>
                    <div><strong>Email:</strong> {selectedAd.advertiserInfo.email}</div>
                    <div><strong>Type:</strong> {formatUserType(selectedAd.advertiserInfo.userType)}</div>
                  </div>
                </div>
              </div>
              
              {selectedAd.description && (
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-sm text-gray-600">{selectedAd.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Schedule</h4>
                  <div className="space-y-1 text-sm">
                    <div>Start: {selectedAd.schedule.startDate.toLocaleDateString()}</div>
                    <div>End: {selectedAd.schedule.endDate.toLocaleDateString()}</div>
                    <div>Duration: {selectedAd.schedule.duration} days</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Pricing</h4>
                  <div className="space-y-1 text-sm">
                    <div>Total Cost: ${selectedAd.pricing.totalCost}</div>
                    <div>Per Day: ${selectedAd.pricing.pricePerDay}</div>
                    {selectedAd.pricing.discountApplied && (
                      <div>Discount: ${selectedAd.pricing.discountApplied}</div>
                    )}
                  </div>
                </div>
              </div>

              {selectedAd.performance && (
                <div>
                  <h4 className="font-medium mb-2">Performance</h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>Impressions: {selectedAd.performance.impressions.toLocaleString()}</div>
                    <div>Clicks: {selectedAd.performance.clicks}</div>
                    <div>CTR: {selectedAd.performance.clickThroughRate.toFixed(2)}%</div>
                  </div>
                </div>
              )}

              {selectedAd.adminNotes && (
                <div>
                  <h4 className="font-medium mb-2">Admin Notes</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                    {selectedAd.adminNotes}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Approval Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {approvalAction === 'approve' ? 'Approve' : 'Reject'} Advertisement
            </DialogTitle>
            <DialogDescription>
              {approvalAction === 'approve' 
                ? 'This ad will be approved and can start running.'
                : 'This ad will be rejected and the advertiser will be notified.'
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                {approvalAction === 'approve' ? 'Approval Notes (Optional)' : 'Rejection Reason (Required)'}
              </label>
              <Textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder={approvalAction === 'approve' 
                  ? 'Add any notes about the approval...'
                  : 'Explain why this ad is being rejected...'
                }
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApprovalDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (selectedAd) {
                  const status = approvalAction === 'approve' ? AdStatus.APPROVED : AdStatus.REJECTED;
                  handleStatusUpdate(selectedAd.id, status, adminNotes);
                }
              }}
              variant={approvalAction === 'approve' ? 'default' : 'destructive'}
              disabled={approvalAction === 'reject' && !adminNotes.trim()}
            >
              {approvalAction === 'approve' ? 'Approve Ad' : 'Reject Ad'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}; 