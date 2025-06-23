/**
 * Vanity URL Management Page - Epic M.001: Vanity URL System
 * 
 * Administrative interface for managing vanity URL requests, approvals, and analytics
 * for organizers and sales agents.
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  ExternalLink, 
  Search, 
  Filter, 
  Eye, 
  Check, 
  X, 
  AlertTriangle,
  BarChart3,
  Users,
  Calendar
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface VanityURLRequest {
  id: string;
  requestedUrl: string;
  requestedBy: string;
  userType: 'organizer' | 'sales_agent';
  targetUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  requestDate: string;
  reviewedBy?: string;
  reviewDate?: string;
  rejectionReason?: string;
  clickCount: number;
  isActive: boolean;
}

interface URLAnalytics {
  url: string;
  totalClicks: number;
  uniqueClicks: number;
  clicksByDate: { date: string; clicks: number }[];
  topReferrers: { referrer: string; clicks: number }[];
  deviceBreakdown: { device: string; clicks: number }[];
}

const VanityURLManagementPage: React.FC = () => {
  const { toast } = useToast();
  const [requests, setRequests] = useState<VanityURLRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<VanityURLRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [userTypeFilter, setUserTypeFilter] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<VanityURLRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [analytics, setAnalytics] = useState<URLAnalytics[]>([]);

  // Load vanity URL requests on component mount
  useEffect(() => {
    loadVanityURLRequests();
    loadAnalytics();
  }, []);

  // Filter requests based on search term and filters
  useEffect(() => {
    let filtered = requests;

    if (searchTerm) {
      filtered = filtered.filter(request =>
        request.requestedUrl.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.requestedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.targetUrl.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(request => request.status === statusFilter);
    }

    if (userTypeFilter !== 'all') {
      filtered = filtered.filter(request => request.userType === userTypeFilter);
    }

    setFilteredRequests(filtered);
  }, [requests, searchTerm, statusFilter, userTypeFilter]);

  const loadVanityURLRequests = async () => {
    try {
      setIsLoading(true);
      // TODO: Replace with actual API call
      const mockRequests: VanityURLRequest[] = [
        {
          id: '1',
          requestedUrl: 'stepperslife.com/chicagostep',
          requestedBy: 'John Smith',
          userType: 'organizer',
          targetUrl: 'https://stepperslife.com/events/chicago-stepping-weekend',
          status: 'pending',
          requestDate: '2024-01-15T10:30:00Z',
          clickCount: 0,
          isActive: false
        },
        {
          id: '2',
          requestedUrl: 'stepperslife.com/sarahevents',
          requestedBy: 'Sarah Johnson',
          userType: 'organizer',
          targetUrl: 'https://stepperslife.com/organizers/sarah-johnson',
          status: 'approved',
          requestDate: '2024-01-10T14:20:00Z',
          reviewedBy: 'Admin',
          reviewDate: '2024-01-12T09:15:00Z',
          clickCount: 247,
          isActive: true
        },
        {
          id: '3',
          requestedUrl: 'stepperslife.com/agent123',
          requestedBy: 'Mike Rodriguez',
          userType: 'sales_agent',
          targetUrl: 'https://stepperslife.com/agents/mike-rodriguez/events',
          status: 'rejected',
          requestDate: '2024-01-08T16:45:00Z',
          reviewedBy: 'Admin',
          reviewDate: '2024-01-09T11:30:00Z',
          rejectionReason: 'URL too generic, please use more specific identifier',
          clickCount: 0,
          isActive: false
        }
      ];
      setRequests(mockRequests);
    } catch (error) {
      console.error('Error loading vanity URL requests:', error);
      toast({
        title: "Error",
        description: "Failed to load vanity URL requests.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      // TODO: Replace with actual API call
      const mockAnalytics: URLAnalytics[] = [
        {
          url: 'stepperslife.com/sarahevents',
          totalClicks: 247,
          uniqueClicks: 186,
          clicksByDate: [
            { date: '2024-01-15', clicks: 23 },
            { date: '2024-01-16', clicks: 31 },
            { date: '2024-01-17', clicks: 28 },
            { date: '2024-01-18', clicks: 35 },
            { date: '2024-01-19', clicks: 42 }
          ],
          topReferrers: [
            { referrer: 'facebook.com', clicks: 89 },
            { referrer: 'instagram.com', clicks: 64 },
            { referrer: 'direct', clicks: 58 },
            { referrer: 'google.com', clicks: 36 }
          ],
          deviceBreakdown: [
            { device: 'mobile', clicks: 148 },
            { device: 'desktop', clicks: 73 },
            { device: 'tablet', clicks: 26 }
          ]
        }
      ];
      setAnalytics(mockAnalytics);
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  const handleApproveRequest = async (requestId: string) => {
    try {
      // TODO: Replace with actual API call
      setRequests(current =>
        current.map(request =>
          request.id === requestId
            ? { 
                ...request, 
                status: 'approved' as const, 
                reviewedBy: 'Current Admin',
                reviewDate: new Date().toISOString(),
                isActive: true
              }
            : request
        )
      );

      toast({
        title: "Request Approved",
        description: "Vanity URL request has been approved and is now active.",
      });
    } catch (error) {
      console.error('Error approving request:', error);
      toast({
        title: "Error",
        description: "Failed to approve vanity URL request.",
        variant: "destructive",
      });
    }
  };

  const handleRejectRequest = async (requestId: string, reason: string) => {
    try {
      // TODO: Replace with actual API call
      setRequests(current =>
        current.map(request =>
          request.id === requestId
            ? { 
                ...request, 
                status: 'rejected' as const, 
                reviewedBy: 'Current Admin',
                reviewDate: new Date().toISOString(),
                rejectionReason: reason,
                isActive: false
              }
            : request
        )
      );

      toast({
        title: "Request Rejected",
        description: "Vanity URL request has been rejected.",
      });
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast({
        title: "Error",
        description: "Failed to reject vanity URL request.",
        variant: "destructive",
      });
    }
  };

  const handleDeactivateURL = async (requestId: string) => {
    try {
      // TODO: Replace with actual API call
      setRequests(current =>
        current.map(request =>
          request.id === requestId
            ? { ...request, isActive: false }
            : request
        )
      );

      toast({
        title: "URL Deactivated",
        description: "Vanity URL has been deactivated.",
      });
    } catch (error) {
      console.error('Error deactivating URL:', error);
      toast({
        title: "Error",
        description: "Failed to deactivate vanity URL.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600">Pending</Badge>;
      case 'approved':
        return <Badge variant="default" className="text-green-600">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getUserTypeBadge = (userType: string) => {
    return (
      <Badge variant="secondary">
        {userType === 'organizer' ? 'Organizer' : 'Sales Agent'}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vanity URL Management</h1>
          <p className="text-muted-foreground">
            Manage vanity URL requests and track analytics
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-blue-600">
            {requests.filter(r => r.status === 'pending').length} Pending
          </Badge>
          <Badge variant="outline" className="text-green-600">
            {requests.filter(r => r.isActive).length} Active URLs
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="requests" className="space-y-6">
        <TabsList>
          <TabsTrigger value="requests">URL Requests</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* URL Requests Tab */}
        <TabsContent value="requests" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Filter className="h-5 w-5" />
                <span>Filters</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search URLs, users, or targets..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>User Type</Label>
                  <Select value={userTypeFilter} onValueChange={setUserTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All user types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="organizer">Organizers</SelectItem>
                      <SelectItem value="sales_agent">Sales Agents</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Requests Table */}
          <Card>
            <CardHeader>
              <CardTitle>Vanity URL Requests</CardTitle>
              <CardDescription>
                Review and manage vanity URL requests from organizers and sales agents.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Loading requests...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Requested URL</TableHead>
                      <TableHead>Requested By</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Target URL</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Request Date</TableHead>
                      <TableHead>Clicks</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center space-x-2">
                            <span>{request.requestedUrl}</span>
                            {request.isActive && (
                              <ExternalLink className="h-3 w-3 text-green-600" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{request.requestedBy}</TableCell>
                        <TableCell>{getUserTypeBadge(request.userType)}</TableCell>
                        <TableCell className="max-w-xs truncate" title={request.targetUrl}>
                          {request.targetUrl}
                        </TableCell>
                        <TableCell>{getStatusBadge(request.status)}</TableCell>
                        <TableCell>{formatDate(request.requestDate)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{request.clickCount}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {request.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleApproveRequest(request.id)}
                                  className="text-green-600 hover:text-green-700"
                                >
                                  <Check className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleRejectRequest(request.id, 'Rejected by admin')}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </>
                            )}
                            {request.isActive && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeactivateURL(request.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                Deactivate
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedRequest(request)}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Request Details Modal would go here */}
          {selectedRequest && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Request details for {selectedRequest.requestedUrl} would be shown in a modal.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Active URLs</CardTitle>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{requests.filter(r => r.isActive).length}</div>
                <p className="text-xs text-muted-foreground">
                  {requests.filter(r => r.status === 'pending').length} pending approval
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {requests.reduce((sum, r) => sum + r.clickCount, 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Across all active URLs
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average CTR</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3.2%</div>
                <p className="text-xs text-muted-foreground">
                  Click-through rate
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Analytics */}
          <Card>
            <CardHeader>
              <CardTitle>URL Performance</CardTitle>
              <CardDescription>
                Detailed analytics for active vanity URLs
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analytics.length > 0 ? (
                <div className="space-y-6">
                  {analytics.map((urlAnalytics, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <h3 className="font-semibold mb-3">{urlAnalytics.url}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Clicks</p>
                          <p className="text-2xl font-bold">{urlAnalytics.totalClicks}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Unique Clicks</p>
                          <p className="text-2xl font-bold">{urlAnalytics.uniqueClicks}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Top Device</p>
                          <p className="text-lg font-semibold">
                            {urlAnalytics.deviceBreakdown[0]?.device || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No analytics data available yet.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VanityURLManagementPage;