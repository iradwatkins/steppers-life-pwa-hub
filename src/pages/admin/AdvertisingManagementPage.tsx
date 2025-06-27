/**
 * Advertising Management Page - Epic O.001: Advertising System
 * 
 * Administrative interface for managing ad zones, direct ads, AdSense configuration,
 * and system settings with comprehensive analytics and approval workflows.
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plus,
  Edit,
  Trash2,
  Eye,
  Check,
  X,
  DollarSign,
  BarChart3,
  Settings,
  Pause,
  Play,
  AlertTriangle,
  TrendingUp
} from 'lucide-react';
import { useAdvertising } from '@/hooks/useAdvertising';
import { AdZone, DirectAd } from '@/services/advertisingService';

const AdvertisingManagementPage: React.FC = () => {
  const {
    adZones,
    directAds,
    adSenseConfig,
    systemSettings,
    revenueReport,
    loading,
    error,
    total,
    fetchAdZones,
    createAdZone,
    updateAdZone,
    deleteAdZone,
    fetchDirectAds,
    approveAd,
    rejectAd,
    pauseAd,
    resumeAd,
    fetchAdSenseConfig,
    updateAdSenseConfig,
    enableAdSense,
    disableAdSense,
    fetchRevenueReport,
    fetchSystemSettings,
    updateSystemSettings,
    clearError
  } = useAdvertising({ autoFetch: true });

  const [selectedAd, setSelectedAd] = useState<DirectAd | null>(null);
  const [selectedZone, setSelectedZone] = useState<AdZone | null>(null);
  const [showZoneDialog, setShowZoneDialog] = useState(false);
  const [showAdDialog, setShowAdDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [zoneFilter, setZoneFilter] = useState<string>('all');

  // Form states for creating/editing zones
  const [zoneForm, setZoneForm] = useState({
    name: '',
    description: '',
    placement_location: '',
    width: 300,
    height: 250,
    pricing_tier: 'standard' as 'standard' | 'premium' | 'random',
    base_price: 15.00,
    supported_file_types: ['image/jpeg', 'image/png'],
    max_file_size_mb: 1,
    is_active: true
  });

  useEffect(() => {
    // Fetch revenue report for last 30 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    
    fetchRevenueReport({
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString()
    });
  }, [fetchRevenueReport]);

  const handleCreateZone = async () => {
    const newZone = await createAdZone({
      ...zoneForm,
      dimensions: { width: zoneForm.width, height: zoneForm.height },
      currency: 'USD'
    });
    
    if (newZone) {
      setShowZoneDialog(false);
      resetZoneForm();
    }
  };

  const handleUpdateZone = async () => {
    if (!selectedZone) return;
    
    const updatedZone = await updateAdZone(selectedZone.id, {
      ...zoneForm,
      dimensions: { width: zoneForm.width, height: zoneForm.height }
    });
    
    if (updatedZone) {
      setShowZoneDialog(false);
      setSelectedZone(null);
      resetZoneForm();
    }
  };

  const handleDeleteZone = async (zoneId: string) => {
    if (window.confirm('Are you sure you want to delete this ad zone?')) {
      await deleteAdZone(zoneId);
    }
  };

  const handleApproveAd = async (adId: string) => {
    await approveAd(adId, 'Admin');
  };

  const handleRejectAd = async () => {
    if (selectedAd && rejectionReason.trim()) {
      await rejectAd(selectedAd.id, rejectionReason, 'Admin');
      setShowRejectDialog(false);
      setSelectedAd(null);
      setRejectionReason('');
    }
  };

  const handlePauseResumeAd = async (ad: DirectAd) => {
    if (ad.status === 'running') {
      await pauseAd(ad.id);
    } else if (ad.status === 'paused') {
      await resumeAd(ad.id);
    }
  };

  const handleToggleAdSense = async () => {
    if (adSenseConfig?.is_enabled) {
      await disableAdSense();
    } else {
      await enableAdSense();
    }
  };

  const resetZoneForm = () => {
    setZoneForm({
      name: '',
      description: '',
      placement_location: '',
      width: 300,
      height: 250,
      pricing_tier: 'standard',
      base_price: 15.00,
      supported_file_types: ['image/jpeg', 'image/png'],
      max_file_size_mb: 1,
      is_active: true
    });
  };

  const openEditZone = (zone: AdZone) => {
    setSelectedZone(zone);
    setZoneForm({
      name: zone.name,
      description: zone.description,
      placement_location: zone.placement_location,
      width: zone.dimensions.width,
      height: zone.dimensions.height,
      pricing_tier: zone.pricing_tier,
      base_price: zone.base_price,
      supported_file_types: zone.supported_file_types,
      max_file_size_mb: zone.max_file_size_mb,
      is_active: zone.is_active
    });
    setShowZoneDialog(true);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: { variant: 'outline', className: 'text-yellow-600' },
      approved: { variant: 'default', className: 'text-green-600' },
      rejected: { variant: 'destructive' },
      running: { variant: 'default', className: 'text-blue-600' },
      paused: { variant: 'outline', className: 'text-gray-600' },
      completed: { variant: 'secondary' },
      expired: { variant: 'outline', className: 'text-red-600' }
    };

    const props = variants[status] || { variant: 'secondary' };
    return <Badge {...props}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
  };

  const filteredAds = (directAds || []).filter(ad => {
    if (statusFilter !== 'all' && ad.status !== statusFilter) return false;
    if (zoneFilter !== 'all' && ad.zone_id !== zoneFilter) return false;
    return true;
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Advertising Management</h1>
          <p className="text-muted-foreground">
            Manage ad zones, direct ads, and revenue optimization
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {revenueReport && (
            <Badge variant="outline" className="text-green-600">
              ${(revenueReport?.direct_ads?.total_revenue || 0) + (revenueReport?.adsense?.estimated_revenue || 0)} Revenue (30d)
            </Badge>
          )}
        </div>
      </div>

      {error && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button variant="link" onClick={clearError} className="p-0 ml-2 h-auto">
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="zones">Ad Zones</TabsTrigger>
          <TabsTrigger value="ads">Direct Ads</TabsTrigger>
          <TabsTrigger value="adsense">AdSense</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {revenueReport && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${((revenueReport?.direct_ads?.total_revenue || 0) + (revenueReport?.adsense?.estimated_revenue || 0)).toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground">Last 30 days</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Direct Ads</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{revenueReport?.direct_ads?.active_ads || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {revenueReport?.direct_ads?.pending_ads || 0} pending approval
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">AdSense CTR</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{(revenueReport?.adsense?.ctr || 0).toFixed(2)}%</div>
                  <p className="text-xs text-muted-foreground">
                    {(revenueReport?.adsense?.clicks || 0).toLocaleString()} clicks
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ad Zones</CardTitle>
                  <Settings className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{(adZones || []).length}</div>
                  <p className="text-xs text-muted-foreground">
                    {(adZones || []).filter(z => z.is_active).length} active
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Top Performing Ads */}
          {revenueReport?.top_performing_ads && (
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Ads</CardTitle>
                <CardDescription>Highest revenue generating ads this month</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ad Title</TableHead>
                      <TableHead>Impressions</TableHead>
                      <TableHead>Clicks</TableHead>
                      <TableHead>Revenue</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(revenueReport?.top_performing_ads || []).map((ad) => (
                      <TableRow key={ad.ad_id}>
                        <TableCell className="font-medium">{ad.title}</TableCell>
                        <TableCell>{ad.impressions.toLocaleString()}</TableCell>
                        <TableCell>{ad.clicks.toLocaleString()}</TableCell>
                        <TableCell>${ad.revenue.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Ad Zones Tab */}
        <TabsContent value="zones" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Ad Zone Management</h2>
            <Dialog open={showZoneDialog} onOpenChange={setShowZoneDialog}>
              <DialogTrigger asChild>
                <Button onClick={resetZoneForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Zone
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {selectedZone ? 'Edit Ad Zone' : 'Create Ad Zone'}
                  </DialogTitle>
                  <DialogDescription>
                    Configure ad zone specifications and pricing
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Zone Name</Label>
                    <Input
                      id="name"
                      value={zoneForm.name}
                      onChange={(e) => setZoneForm({...zoneForm, name: e.target.value})}
                      placeholder="Homepage Banner"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="placement">Placement Location</Label>
                    <Input
                      id="placement"
                      value={zoneForm.placement_location}
                      onChange={(e) => setZoneForm({...zoneForm, placement_location: e.target.value})}
                      placeholder="Homepage Header"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="width">Width (px)</Label>
                    <Input
                      id="width"
                      type="number"
                      value={zoneForm.width}
                      onChange={(e) => setZoneForm({...zoneForm, width: parseInt(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="height">Height (px)</Label>
                    <Input
                      id="height"
                      type="number"
                      value={zoneForm.height}
                      onChange={(e) => setZoneForm({...zoneForm, height: parseInt(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pricing-tier">Pricing Tier</Label>
                    <Select
                      value={zoneForm.pricing_tier}
                      onValueChange={(value: any) => setZoneForm({...zoneForm, pricing_tier: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                        <SelectItem value="random">Random</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="base-price">Base Price ($)</Label>
                    <Input
                      id="base-price"
                      type="number"
                      step="0.01"
                      value={zoneForm.base_price}
                      onChange={(e) => setZoneForm({...zoneForm, base_price: parseFloat(e.target.value)})}
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={zoneForm.description}
                      onChange={(e) => setZoneForm({...zoneForm, description: e.target.value})}
                      placeholder="Describe this ad zone..."
                    />
                  </div>
                  <div className="col-span-2 flex items-center space-x-2">
                    <Switch
                      checked={zoneForm.is_active}
                      onCheckedChange={(checked) => setZoneForm({...zoneForm, is_active: checked})}
                    />
                    <Label>Active Zone</Label>
                  </div>
                </div>
                <div className="flex justify-end space-x-2 mt-4">
                  <Button variant="outline" onClick={() => setShowZoneDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={selectedZone ? handleUpdateZone : handleCreateZone}>
                    {selectedZone ? 'Update' : 'Create'} Zone
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(adZones || []).map((zone) => (
              <Card key={zone.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{zone.name}</CardTitle>
                      <CardDescription>{zone.placement_location}</CardDescription>
                    </div>
                    <Badge variant={zone.is_active ? 'default' : 'secondary'}>
                      {zone.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Dimensions:</span>
                      <span className="text-sm font-medium">
                        {zone.dimensions.width}×{zone.dimensions.height}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Pricing:</span>
                      <span className="text-sm font-medium">
                        ${zone.base_price}/day ({zone.pricing_tier})
                      </span>
                    </div>
                    <div className="flex justify-end space-x-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditZone(zone)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteZone(zone.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Direct Ads Tab */}
        <TabsContent value="ads" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Direct Ad Management</h2>
            <div className="flex space-x-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="running">Running</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select value={zoneFilter} onValueChange={setZoneFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="All Zones" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Zones</SelectItem>
                  {(adZones || []).map((zone) => (
                    <SelectItem key={zone.id} value={zone.id}>
                      {zone.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ad Title</TableHead>
                    <TableHead>Advertiser</TableHead>
                    <TableHead>Zone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Performance</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(filteredAds || []).map((ad) => (
                    <TableRow key={ad.id}>
                      <TableCell className="font-medium">{ad.title}</TableCell>
                      <TableCell>{ad.advertiser_name}</TableCell>
                      <TableCell>{ad.zone_name}</TableCell>
                      <TableCell>{getStatusBadge(ad.status)}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{ad.impressions.toLocaleString()} impressions</div>
                          <div>{ad.clicks} clicks ({ad.ctr.toFixed(2)}% CTR)</div>
                        </div>
                      </TableCell>
                      <TableCell>${ad.total_price.toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {ad.status === 'pending' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleApproveAd(ad.id)}
                              >
                                <Check className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedAd(ad);
                                  setShowRejectDialog(true);
                                }}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </>
                          )}
                          {(ad.status === 'running' || ad.status === 'paused') && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePauseResumeAd(ad)}
                            >
                              {ad.status === 'running' ? (
                                <Pause className="h-3 w-3" />
                              ) : (
                                <Play className="h-3 w-3" />
                              )}
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedAd(ad)}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AdSense Tab */}
        <TabsContent value="adsense" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Google AdSense Configuration</CardTitle>
              <CardDescription>
                Manage Google AdSense integration and automatic ad serving
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>AdSense Status</Label>
                  <p className="text-sm text-muted-foreground">
                    {adSenseConfig?.is_enabled ? 'AdSense is enabled and serving ads' : 'AdSense is disabled'}
                  </p>
                </div>
                <Switch
                  checked={adSenseConfig?.is_enabled || false}
                  onCheckedChange={handleToggleAdSense}
                />
              </div>
              
              {adSenseConfig && (
                <div className="space-y-4">
                  <div>
                    <Label>Publisher ID</Label>
                    <Input
                      value={adSenseConfig.publisher_id}
                      placeholder="pub-1234567890123456"
                      readOnly
                    />
                  </div>
                  
                  {revenueReport && (
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div>
                        <Label>Est. Revenue (30d)</Label>
                        <div className="text-2xl font-bold text-green-600">
                          ${(revenueReport?.adsense?.estimated_revenue || 0).toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <Label>Impressions</Label>
                        <div className="text-2xl font-bold">
                          {(revenueReport?.adsense?.impressions || 0).toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <Label>Click Rate</Label>
                        <div className="text-2xl font-bold">
                          {(revenueReport?.adsense?.ctr || 0).toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>
                Configure advertising system behavior and policies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {systemSettings && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Max Ads Per Page</Label>
                    <Input
                      type="number"
                      value={systemSettings.max_ads_per_page}
                      readOnly
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>In-Feed Frequency</Label>
                    <Input
                      type="number"
                      value={systemSettings.in_feed_frequency}
                      readOnly
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label>Quality Guidelines</Label>
                    <Textarea
                      value={systemSettings.quality_guidelines}
                      readOnly
                      rows={3}
                    />
                  </div>
                  <div className="col-span-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={systemSettings.direct_ads_enabled}
                        disabled
                      />
                      <Label>Direct Ads Enabled</Label>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Rejection Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Ad</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this ad placement.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              rows={3}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRejectAd}>
              Reject Ad
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdvertisingManagementPage;