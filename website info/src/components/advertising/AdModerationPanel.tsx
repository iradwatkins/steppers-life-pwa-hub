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
  Shield, 
  MoreHorizontal, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Flag,
  AlertTriangle,
  Search,
  Calendar,
  User,
  Filter
} from 'lucide-react';
import { useAdvertising } from '@/hooks/useAdvertising';
import { AdModeration, ModerationStatus, ModerationAction } from '@/types/advertising';
import { toast } from 'sonner';

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: ModerationStatus.PENDING, label: 'Pending' },
  { value: ModerationStatus.UNDER_REVIEW, label: 'Under Review' },
  { value: ModerationStatus.APPROVED, label: 'Approved' },
  { value: ModerationStatus.REJECTED, label: 'Rejected' },
  { value: ModerationStatus.FLAGGED, label: 'Flagged' },
];

const actionOptions = [
  { value: ModerationAction.APPROVED, label: 'Approve Content' },
  { value: ModerationAction.REJECTED, label: 'Reject Content' },
  { value: ModerationAction.CONTENT_WARNING, label: 'Add Warning' },
  { value: ModerationAction.SUSPENDED, label: 'Suspend Ad' },
  { value: ModerationAction.REMOVED, label: 'Remove Ad' },
];

export const AdModerationPanel: React.FC = () => {
  const {
    moderationReports,
    directUserAds,
    loadingModeration,
    resolveModerationReport
  } = useAdvertising();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedReport, setSelectedReport] = useState<AdModeration | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [moderationAction, setModerationAction] = useState<ModerationAction>(ModerationAction.APPROVED);
  const [reviewNotes, setReviewNotes] = useState('');

  const filteredReports = moderationReports
    .filter(report => {
      const matchesSearch = 
        report.reportReason.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.reportedBy?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      // Sort by pending first, then by creation date
      if (a.status === ModerationStatus.PENDING && b.status !== ModerationStatus.PENDING) return -1;
      if (a.status !== ModerationStatus.PENDING && b.status === ModerationStatus.PENDING) return 1;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

  const handleResolveReport = async (reportId: string, action: ModerationAction, notes: string) => {
    try {
      await resolveModerationReport(reportId, action, notes);
      setShowActionDialog(false);
      setSelectedReport(null);
      setReviewNotes('');
      toast.success('Moderation report resolved');
    } catch (error) {
      toast.error('Failed to resolve moderation report');
    }
  };

  const handleViewDetails = (report: AdModeration) => {
    setSelectedReport(report);
    setShowDetailsDialog(true);
  };

  const handleTakeAction = (report: AdModeration) => {
    setSelectedReport(report);
    setShowActionDialog(true);
  };

  const getStatusBadge = (status: ModerationStatus) => {
    const statusStyles = {
      [ModerationStatus.PENDING]: 'bg-yellow-500',
      [ModerationStatus.UNDER_REVIEW]: 'bg-blue-500',
      [ModerationStatus.APPROVED]: 'bg-green-500',
      [ModerationStatus.REJECTED]: 'bg-red-500',
      [ModerationStatus.FLAGGED]: 'bg-orange-500',
    };

    const statusLabels = {
      [ModerationStatus.PENDING]: 'Pending',
      [ModerationStatus.UNDER_REVIEW]: 'Under Review',
      [ModerationStatus.APPROVED]: 'Approved',
      [ModerationStatus.REJECTED]: 'Rejected',
      [ModerationStatus.FLAGGED]: 'Flagged',
    };

    return (
      <Badge variant="default" className={statusStyles[status]}>
        {statusLabels[status]}
      </Badge>
    );
  };

  const getAdTitle = (adId: string) => {
    const ad = directUserAds.find(a => a.id === adId);
    return ad ? ad.title : 'Unknown Ad';
  };

  const getActionBadge = (action: ModerationAction) => {
    const actionStyles = {
      [ModerationAction.APPROVED]: 'bg-green-500',
      [ModerationAction.REJECTED]: 'bg-red-500',
      [ModerationAction.CONTENT_WARNING]: 'bg-yellow-500',
      [ModerationAction.SUSPENDED]: 'bg-orange-500',
      [ModerationAction.REMOVED]: 'bg-red-600',
    };

    const actionLabels = {
      [ModerationAction.APPROVED]: 'Approved',
      [ModerationAction.REJECTED]: 'Rejected',
      [ModerationAction.CONTENT_WARNING]: 'Warning Added',
      [ModerationAction.SUSPENDED]: 'Suspended',
      [ModerationAction.REMOVED]: 'Removed',
    };

    return (
      <Badge variant="default" className={actionStyles[action]}>
        {actionLabels[action]}
      </Badge>
    );
  };

  const pendingCount = moderationReports.filter(r => r.status === ModerationStatus.PENDING).length;

  if (loadingModeration) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ad Moderation Panel</CardTitle>
          <CardDescription>Loading moderation reports...</CardDescription>
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
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <div>
                <CardTitle>Ad Moderation Panel</CardTitle>
                <CardDescription>
                  Review and moderate reported advertisements ({moderationReports.length} total reports)
                  {pendingCount > 0 && (
                    <Badge variant="destructive" className="ml-2">
                      {pendingCount} pending
                    </Badge>
                  )}
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filter Controls */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search reports..."
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

          {/* Priority Alert */}
          {pendingCount > 0 && (
            <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <div>
                  <h4 className="font-medium text-orange-800">Action Required</h4>
                  <p className="text-sm text-orange-700">
                    {pendingCount} report{pendingCount > 1 ? 's' : ''} pending review. 
                    High-priority reports should be reviewed within 24 hours.
                  </p>
                </div>
              </div>
            </div>
          )}

          {filteredReports.length === 0 ? (
            <div className="text-center py-8">
              <div className="mx-auto w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || statusFilter !== 'all' ? 'No reports found' : 'No moderation reports'}
              </h3>
              <p className="text-gray-500">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Moderation reports will appear here when ads are flagged'
                }
              </p>
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report Details</TableHead>
                    <TableHead>Ad</TableHead>
                    <TableHead>Reporter</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action Taken</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            <Flag className="h-4 w-4 text-red-500" />
                            Report #{report.id.slice(-6)}
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            {report.reportReason}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{getAdTitle(report.adId)}</div>
                          <div className="text-gray-500">ID: {report.adId.slice(-6)}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">
                            {report.reportedBy || 'System'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Calendar className="h-3 w-3" />
                          {report.createdAt.toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(report.status)}
                      </TableCell>
                      <TableCell>
                        {report.actionTaken ? (
                          getActionBadge(report.actionTaken)
                        ) : (
                          <span className="text-sm text-gray-400">None</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewDetails(report)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            {(report.status === ModerationStatus.PENDING || report.status === ModerationStatus.UNDER_REVIEW) && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => handleTakeAction(report)}
                                  className="text-blue-600"
                                >
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Take Action
                                </DropdownMenuItem>
                              </>
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

      {/* Report Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Moderation Report Details</DialogTitle>
            <DialogDescription>Complete information about this moderation report</DialogDescription>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Report Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Report ID:</strong> {selectedReport.id}</div>
                    <div><strong>Ad ID:</strong> {selectedReport.adId}</div>
                    <div><strong>Status:</strong> {getStatusBadge(selectedReport.status)}</div>
                    <div><strong>Created:</strong> {selectedReport.createdAt.toLocaleDateString()}</div>
                    {selectedReport.resolvedAt && (
                      <div><strong>Resolved:</strong> {selectedReport.resolvedAt.toLocaleDateString()}</div>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Reporter</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Reported By:</strong> {selectedReport.reportedBy || 'System'}</div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Report Reason</h4>
                <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded">
                  {selectedReport.reportReason}
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Associated Ad</h4>
                <p className="text-sm text-gray-600">
                  <strong>Title:</strong> {getAdTitle(selectedReport.adId)}
                </p>
              </div>

              {selectedReport.actionTaken && (
                <div>
                  <h4 className="font-medium mb-2">Action Taken</h4>
                  <div className="space-y-2">
                    <div>{getActionBadge(selectedReport.actionTaken)}</div>
                    {selectedReport.reviewNotes && (
                      <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded">
                        {selectedReport.reviewNotes}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Action Dialog */}
      <Dialog open={showActionDialog} onOpenChange={setShowActionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Take Moderation Action</DialogTitle>
            <DialogDescription>
              Resolve this moderation report by taking appropriate action
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Action</label>
              <Select value={moderationAction} onValueChange={(value) => setModerationAction(value as ModerationAction)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {actionOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Review Notes</label>
              <Textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Add notes about your decision and any actions taken..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowActionDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (selectedReport) {
                  handleResolveReport(selectedReport.id, moderationAction, reviewNotes);
                }
              }}
              disabled={!reviewNotes.trim()}
            >
              Take Action
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}; 