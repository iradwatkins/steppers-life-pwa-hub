import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { AlertCircle, Check, X, Globe, TrendingUp, Copy, Trash2, ExternalLink, Plus } from 'lucide-react';
import { useVanityUrls } from '../hooks/useVanityUrls';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { toast } from 'sonner';

const VanityUrlManagementPage = () => {
  const { user } = useAuth();
  const { vanityUrls, requests, loading, requestVanityUrl, checkAvailability, toggleVanityUrl, deleteVanityUrl } = useVanityUrls(user?.id);
  
  const [requestDialog, setRequestDialog] = useState(false);
  const [newUrlForm, setNewUrlForm] = useState({
    userType: 'organizer' as 'organizer' | 'sales_agent',
    requestedUrl: '',
    checking: false,
    availability: null as { available: boolean; reason?: string } | null,
  });

  const handleCheckAvailability = async () => {
    if (!newUrlForm.requestedUrl.trim()) return;
    
    setNewUrlForm(prev => ({ ...prev, checking: true }));
    const result = await checkAvailability(newUrlForm.requestedUrl.trim());
    setNewUrlForm(prev => ({ ...prev, availability: result, checking: false }));
  };

  const handleSubmitRequest = async () => {
    if (!newUrlForm.availability?.available) return;
    
    const success = await requestVanityUrl(newUrlForm.userType, newUrlForm.requestedUrl.trim());
    if (success) {
      setRequestDialog(false);
      setNewUrlForm({
        userType: 'organizer',
        requestedUrl: '',
        checking: false,
        availability: null,
      });
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(`https://stepperslife.com/${url}`);
    toast.success('URL copied to clipboard');
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

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vanity URL Management</h1>
          <p className="text-gray-600 mt-2">
            Create custom URLs to make your events and content easy to find and share
          </p>
        </div>
        <Dialog open={requestDialog} onOpenChange={setRequestDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Request Vanity URL
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Request New Vanity URL</DialogTitle>
              <DialogDescription>
                Create a custom URL for your organizer profile or sales agent page
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="userType">Type</Label>
                <Select
                  value={newUrlForm.userType}
                  onValueChange={(value: 'organizer' | 'sales_agent') => 
                    setNewUrlForm(prev => ({ ...prev, userType: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="organizer">Event Organizer</SelectItem>
                    <SelectItem value="sales_agent">Sales Agent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="requestedUrl">Requested URL</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-sm text-gray-500">stepperslife.com/</span>
                  <Input
                    id="requestedUrl"
                    value={newUrlForm.requestedUrl}
                    onChange={(e) => setNewUrlForm(prev => ({ 
                      ...prev, 
                      requestedUrl: e.target.value,
                      availability: null 
                    }))}
                    placeholder="your-custom-url"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCheckAvailability}
                    disabled={!newUrlForm.requestedUrl.trim() || newUrlForm.checking}
                  >
                    {newUrlForm.checking ? 'Checking...' : 'Check'}
                  </Button>
                </div>
                
                {newUrlForm.availability && (
                  <div className={`flex items-center gap-2 mt-2 text-sm ${
                    newUrlForm.availability.available ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {newUrlForm.availability.available ? (
                      <>
                        <Check className="h-4 w-4" />
                        URL is available
                      </>
                    ) : (
                      <>
                        <X className="h-4 w-4" />
                        {newUrlForm.availability.reason}
                      </>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setRequestDialog(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitRequest}
                  disabled={!newUrlForm.availability?.available || loading}
                >
                  Submit Request
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="active" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">Active URLs</TabsTrigger>
          <TabsTrigger value="requests">My Requests</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {vanityUrls.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Vanity URLs</h3>
                <p className="text-gray-600 mb-4">
                  Create your first vanity URL to make your events easier to find and share
                </p>
                <Button onClick={() => setRequestDialog(true)} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Request Your First URL
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {vanityUrls.map((url) => (
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
                        <p className="text-gray-600 text-sm mb-3">
                          Redirects to: {url.originalUrl}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>Created: {format(url.createdAt, 'MMM d, yyyy')}</span>
                          <span>Clicks: {url.clickCount}</span>
                          {url.lastUsed && (
                            <span>Last used: {format(url.lastUsed, 'MMM d, yyyy')}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(url.vanityUrl)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`https://stepperslife.com/${url.vanityUrl}`, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={url.isActive}
                            onCheckedChange={(checked) => toggleVanityUrl(url.id, checked)}
                          />
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteVanityUrl(url.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          {requests.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Requests</h3>
                <p className="text-gray-600 mb-4">
                  You haven't submitted any vanity URL requests yet
                </p>
                <Button onClick={() => setRequestDialog(true)} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Submit Your First Request
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {requests.map((request) => (
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
                          <p>Requested: {format(request.createdAt, 'MMM d, yyyy h:mm a')}</p>
                          {request.reviewedAt && (
                            <p>Reviewed: {format(request.reviewedAt, 'MMM d, yyyy h:mm a')}</p>
                          )}
                          {request.rejectionReason && (
                            <p className="text-red-600">Reason: {request.rejectionReason}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Total URLs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{vanityUrls.length}</div>
                <p className="text-xs text-gray-600">Active vanity URLs</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Total Clicks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {vanityUrls.reduce((sum, url) => sum + url.clickCount, 0)}
                </div>
                <p className="text-xs text-gray-600">All time clicks</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Active Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {requests.filter(req => req.status === 'pending').length}
                </div>
                <p className="text-xs text-gray-600">Pending approval</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                URL Performance
              </CardTitle>
              <CardDescription>
                Click performance for your vanity URLs
              </CardDescription>
            </CardHeader>
            <CardContent>
              {vanityUrls.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No data available. Create your first vanity URL to see analytics.
                </div>
              ) : (
                <div className="space-y-4">
                  {vanityUrls.map((url) => (
                    <div key={url.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">/{url.vanityUrl}</h4>
                        <p className="text-sm text-gray-600">{url.userType.replace('_', ' ')}</p>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{url.clickCount} clicks</div>
                        {url.lastUsed && (
                          <div className="text-sm text-gray-600">
                            Last: {format(url.lastUsed, 'MMM d')}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VanityUrlManagementPage; 