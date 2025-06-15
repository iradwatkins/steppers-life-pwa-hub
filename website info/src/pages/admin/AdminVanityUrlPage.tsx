import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Globe, TrendingUp, Check, X, Eye, Search, Filter } from 'lucide-react';
import { useAdminVanityUrls } from '../../hooks/useVanityUrls';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { toast } from 'sonner';

const AdminVanityUrlPage = () => {
  const { user } = useAuth();
  const { allRequests, allVanityUrls, stats, loading, approveRequest, rejectRequest } = useAdminVanityUrls();
  
  const [reviewDialog, setReviewDialog] = useState<{
    open: boolean;
    requestId: string;
    action: 'approve' | 'reject';
    rejectionReason: string;
  }>({
    open: false,
    requestId: '',
    action: 'approve',
    rejectionReason: '',
  });

  const [filters, setFilters] = useState({
    requestStatus: 'all',
    userType: 'all',
    searchTerm: '',
  });

  const handleReviewRequest = async () => {
    if (reviewDialog.action === 'approve') {
      const success = await approveRequest(reviewDialog.requestId, user?.id || 'admin');
      if (success) setReviewDialog({ open: false, requestId: '', action: 'approve', rejectionReason: '' });
    } else {
      if (!reviewDialog.rejectionReason.trim()) {
        toast.error('Please provide a rejection reason');
        return;
      }
      const success = await rejectRequest(reviewDialog.requestId, user?.id || 'admin', reviewDialog.rejectionReason);
      if (success) setReviewDialog({ open: false, requestId: '', action: 'approve', rejectionReason: '' });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-300">Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="text-green-600 border-green-300">Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="text-red-600 border-red-300">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredRequests = allRequests.filter(request => {
    const matchesStatus = filters.requestStatus === 'all' || request.status === filters.requestStatus;
    const matchesUserType = filters.userType === 'all' || request.userType === filters.userType;
    const matchesSearch = !filters.searchTerm || 
      request.requestedUrl.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      request.userId.toLowerCase().includes(filters.searchTerm.toLowerCase());
    
    return matchesStatus && matchesUserType && matchesSearch;
  });

  const filteredVanityUrls = allVanityUrls.filter(url => {
    const matchesUserType = filters.userType === 'all' || url.userType === filters.userType;
    const matchesSearch = !filters.searchTerm || 
      url.vanityUrl.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      url.userId.toLowerCase().includes(filters.searchTerm.toLowerCase());
    
    return matchesUserType && matchesSearch;
  });

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vanity URL Administration</h1>
          <p className="text-gray-600 mt-2">
            Manage vanity URL requests and monitor platform usage
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="requests">
            Requests
            {stats.pendingRequests > 0 && (
              <Badge variant="destructive" className="ml-2 px-1 py-0 text-xs">
                {stats.pendingRequests}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="active">Active URLs</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Total URLs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUrls}</div>
                <p className="text-xs text-gray-600">{stats.activeUrls} active</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Total Clicks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalClicks}</div>
                <p className="text-xs text-gray-600">All time</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Pending Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{stats.pendingRequests}</div>
                <p className="text-xs text-gray-600">Need review</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Active Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.totalUrls > 0 ? Math.round((stats.activeUrls / stats.totalUrls) * 100) : 0}%
                </div>
                <p className="text-xs text-gray-600">URLs active</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest vanity URL requests and activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {allRequests.slice(0, 5).map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">/{request.requestedUrl}</h4>
                      <p className="text-sm text-gray-600">
                        {request.userType.replace('_', ' ')} • {format(request.createdAt, 'MMM d, yyyy')}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(request.status)}
                      {request.status === 'pending' && (
                        <Button
                          size="sm"
                          onClick={() => setReviewDialog({
                            open: true,
                            requestId: request.id,
                            action: 'approve',
                            rejectionReason: '',
                          })}
                        >
                          Review
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                {allRequests.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No recent activity
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="status-filter">Status</Label>
                  <select
                    id="status-filter"
                    className="w-full p-2 border rounded-md"
                    value={filters.requestStatus}
                    onChange={(e) => setFilters(prev => ({ ...prev, requestStatus: e.target.value }))}
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="type-filter">User Type</Label>
                  <select
                    id="type-filter"
                    className="w-full p-2 border rounded-md"
                    value={filters.userType}
                    onChange={(e) => setFilters(prev => ({ ...prev, userType: e.target.value }))}
                  >
                    <option value="all">All Types</option>
                    <option value="organizer">Organizers</option>
                    <option value="sales_agent">Sales Agents</option>
                  </select>
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Search URLs or user IDs..."
                      value={filters.searchTerm}
                      onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <Card key={request.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium text-lg">
                          stepperslife.com/{request.requestedUrl}
                        </h3>
                        {getStatusBadge(request.status)}
                        <Badge variant="outline" className="capitalize">
                          {request.userType.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>User ID: {request.userId}</p>
                        <p>Requested: {format(request.createdAt, 'MMM d, yyyy h:mm a')}</p>
                        {request.reviewedAt && (
                          <p>Reviewed: {format(request.reviewedAt, 'MMM d, yyyy h:mm a')} by {request.reviewedBy}</p>
                        )}
                        {request.rejectionReason && (
                          <p className="text-red-600">Reason: {request.rejectionReason}</p>
                        )}
                      </div>
                    </div>
                    {request.status === 'pending' && (
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600 border-green-300 hover:bg-green-50"
                          onClick={() => setReviewDialog({
                            open: true,
                            requestId: request.id,
                            action: 'approve',
                            rejectionReason: '',
                          })}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-300 hover:bg-red-50"
                          onClick={() => setReviewDialog({
                            open: true,
                            requestId: request.id,
                            action: 'reject',
                            rejectionReason: '',
                          })}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredRequests.length === 0 && (
              <Card>
                <CardContent className="py-8 text-center">
                  <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Requests Found</h3>
                  <p className="text-gray-600">
                    No requests match your current filters
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="active" className="space-y-6">
          <div className="space-y-4">
            {filteredVanityUrls.map((url) => (
              <Card key={url.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium text-lg">
                          stepperslife.com/{url.vanityUrl}
                        </h3>
                        <Badge variant={url.isActive ? "default" : "secondary"}>
                          {url.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                          {url.userType.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>User ID: {url.userId}</p>
                        <p>Redirects to: {url.originalUrl}</p>
                        <p>Created: {format(url.createdAt, 'MMM d, yyyy')}</p>
                        <p>Clicks: {url.clickCount}</p>
                        {url.lastUsed && (
                          <p>Last used: {format(url.lastUsed, 'MMM d, yyyy')}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`https://stepperslife.com/${url.vanityUrl}`, '_blank')}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredVanityUrls.length === 0 && (
              <Card>
                <CardContent className="py-8 text-center">
                  <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Active URLs Found</h3>
                  <p className="text-gray-600">
                    No active vanity URLs match your current filters
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Usage by Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['organizer', 'sales_agent'].map(type => {
                    const count = allVanityUrls.filter(url => url.userType === type).length;
                    const percentage = allVanityUrls.length > 0 ? (count / allVanityUrls.length) * 100 : 0;
                    
                    return (
                      <div key={type} className="flex items-center justify-between">
                        <span className="capitalize">{type.replace('_', ' ')}</span>
                        <div className="flex items-center gap-3">
                          <div className="w-24 h-2 bg-gray-200 rounded-full">
                            <div 
                              className="h-2 bg-blue-600 rounded-full"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Request Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['pending', 'approved', 'rejected'].map(status => {
                    const count = allRequests.filter(req => req.status === status).length;
                    const percentage = allRequests.length > 0 ? (count / allRequests.length) * 100 : 0;
                    
                    return (
                      <div key={status} className="flex items-center justify-between">
                        <span className="capitalize">{status}</span>
                        <div className="flex items-center gap-3">
                          <div className="w-24 h-2 bg-gray-200 rounded-full">
                            <div 
                              className={`h-2 rounded-full ${
                                status === 'pending' ? 'bg-yellow-500' :
                                status === 'approved' ? 'bg-green-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={reviewDialog.open} onOpenChange={(open) => 
        setReviewDialog(prev => ({ ...prev, open }))
      }>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {reviewDialog.action === 'approve' ? 'Approve Request' : 'Reject Request'}
            </DialogTitle>
            <DialogDescription>
              {reviewDialog.action === 'approve' 
                ? 'Approve this vanity URL request and create the URL'
                : 'Reject this vanity URL request'
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {reviewDialog.action === 'reject' && (
              <div>
                <Label htmlFor="rejectionReason">Rejection Reason</Label>
                <Textarea
                  id="rejectionReason"
                  value={reviewDialog.rejectionReason}
                  onChange={(e) => setReviewDialog(prev => ({ 
                    ...prev, 
                    rejectionReason: e.target.value 
                  }))}
                  placeholder="Please provide a reason for rejection..."
                  className="mt-1"
                />
              </div>
            )}
            
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setReviewDialog(prev => ({ ...prev, open: false }))}
              >
                Cancel
              </Button>
              <Button
                onClick={handleReviewRequest}
                disabled={loading || (reviewDialog.action === 'reject' && !reviewDialog.rejectionReason.trim())}
                className={reviewDialog.action === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
              >
                {reviewDialog.action === 'approve' ? 'Approve' : 'Reject'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminVanityUrlPage; 