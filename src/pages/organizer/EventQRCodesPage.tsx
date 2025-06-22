/**
 * Event QR Codes Management Page
 * Allows organizers to generate and manage QR codes for marketing purposes
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { QRCodeService, type MarketingQRCode, type QRCodeAnalytics, type QRCodeOptions } from '@/services/qrCodeService';
import { EventService } from '@/services/eventService';
import {
  Plus,
  Search,
  Download,
  Eye,
  Edit,
  Trash2,
  Copy,
  QrCode,
  BarChart3,
  Calendar,
  MapPin,
  ExternalLink,
  Loader2,
  TrendingUp,
  Users,
  MousePointer,
  Share2,
  Printer
} from 'lucide-react';

interface CreateQRForm {
  name: string;
  description: string;
  qr_type: 'event' | 'venue' | 'campaign' | 'custom';
  event_id?: string;
  venue_id?: string;
  custom_url?: string;
  campaign_source?: string;
  tracking_enabled: boolean;
  expires_at?: string;
  qr_options: QRCodeOptions;
}

const EventQRCodesPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [qrCodes, setQrCodes] = useState<MarketingQRCode[]>([]);
  const [analytics, setAnalytics] = useState<QRCodeAnalytics | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [previewQR, setPreviewQR] = useState<string | null>(null);
  
  const [createForm, setCreateForm] = useState<CreateQRForm>({
    name: '',
    description: '',
    qr_type: 'event',
    tracking_enabled: true,
    qr_options: {
      size: 300,
      format: 'png',
      errorCorrectionLevel: 'M',
      margin: 0,
      color: '000000',
      backgroundColor: 'ffffff'
    }
  });

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      const [qrCodesData, analyticsData, eventsData] = await Promise.all([
        QRCodeService.getOrganizerQRCodes(user.id),
        QRCodeService.getQRCodeAnalytics(user.id),
        EventService.getOrganizerEvents(user.id)
      ]);

      setQrCodes(qrCodesData);
      setAnalytics(analyticsData);
      setEvents(eventsData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load QR codes data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQRCode = async () => {
    if (!createForm.name.trim()) {
      toast({
        title: "Error",
        description: "QR code name is required",
        variant: "destructive"
      });
      return;
    }

    if (!user) return;

    try {
      let result = null;

      switch (createForm.qr_type) {
        case 'event':
          if (!createForm.event_id) {
            toast({
              title: "Error",
              description: "Please select an event",
              variant: "destructive"
            });
            return;
          }
          result = await QRCodeService.createEventQRCode(
            createForm.event_id,
            user.id,
            {
              name: createForm.name,
              description: createForm.description,
              campaignSource: createForm.campaign_source,
              trackingEnabled: createForm.tracking_enabled,
              expiresAt: createForm.expires_at,
              qrOptions: createForm.qr_options
            }
          );
          break;

        case 'custom':
        case 'campaign':
          if (!createForm.custom_url) {
            toast({
              title: "Error",
              description: "Please enter a target URL",
              variant: "destructive"
            });
            return;
          }
          result = await QRCodeService.createCustomQRCode(
            user.id,
            {
              name: createForm.name,
              description: createForm.description,
              targetUrl: createForm.custom_url,
              qrType: createForm.qr_type,
              trackingEnabled: createForm.tracking_enabled,
              expiresAt: createForm.expires_at,
              qrOptions: createForm.qr_options
            }
          );
          break;
      }

      if (result) {
        toast({
          title: "Success",
          description: "QR code created successfully",
        });
        setShowCreateDialog(false);
        resetForm();
        loadData();
      } else {
        toast({
          title: "Error",
          description: "Failed to create QR code",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error creating QR code:', error);
      toast({
        title: "Error",
        description: "Failed to create QR code",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setCreateForm({
      name: '',
      description: '',
      qr_type: 'event',
      tracking_enabled: true,
      qr_options: {
        size: 300,
        format: 'png',
        errorCorrectionLevel: 'M',
        margin: 0,
        color: '000000',
        backgroundColor: 'ffffff'
      }
    });
    setPreviewQR(null);
  };

  const handleDeleteQRCode = async (qrCodeId: string, qrCodeName: string) => {
    if (!confirm(`Are you sure you want to delete "${qrCodeName}"? This action cannot be undone.`)) {
      return;
    }

    const success = await QRCodeService.deleteQRCode(qrCodeId);
    if (success) {
      toast({
        title: "Success",
        description: "QR code deleted successfully"
      });
      loadData();
    } else {
      toast({
        title: "Error",
        description: "Failed to delete QR code",
        variant: "destructive"
      });
    }
  };

  const handleCopyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Success",
        description: "URL copied to clipboard"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy URL",
        variant: "destructive"
      });
    }
  };

  const handleDownloadQR = (qrCode: MarketingQRCode) => {
    const link = document.createElement('a');
    link.href = qrCode.qr_code_url;
    link.download = `${qrCode.name.replace(/\s+/g, '_')}_qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const updatePreview = () => {
    let previewUrl = '';
    
    switch (createForm.qr_type) {
      case 'event':
        if (createForm.event_id) {
          previewUrl = `${window.location.origin}/events/${createForm.event_id}`;
        }
        break;
      case 'custom':
      case 'campaign':
        if (createForm.custom_url) {
          previewUrl = createForm.custom_url;
        }
        break;
    }

    if (previewUrl) {
      const qrUrl = QRCodeService.generateQRCodeUrl(previewUrl, createForm.qr_options);
      setPreviewQR(qrUrl);
    } else {
      setPreviewQR(null);
    }
  };

  useEffect(() => {
    updatePreview();
  }, [createForm]);

  const filteredQRCodes = qrCodes.filter(qr =>
    qr.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    qr.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    qr.qr_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getQRTypeIcon = (type: string) => {
    switch (type) {
      case 'event':
        return <Calendar className="h-4 w-4" />;
      case 'venue':
        return <MapPin className="h-4 w-4" />;
      case 'campaign':
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <QrCode className="h-4 w-4" />;
    }
  };

  const getQRTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'event':
        return 'bg-blue-500';
      case 'venue':
        return 'bg-green-500';
      case 'campaign':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">QR Code Marketing</h1>
          <p className="text-muted-foreground">
            Generate and manage QR codes for events, campaigns, and marketing materials
          </p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create QR Code
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Marketing QR Code</DialogTitle>
              <DialogDescription>
                Generate a QR code for events, campaigns, or custom URLs
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">QR Code Name</Label>
                <Input
                  id="name"
                  value={createForm.name}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Summer Event Flyer QR"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={createForm.description}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe where this QR code will be used..."
                  rows={2}
                />
              </div>
              
              <div>
                <Label htmlFor="type">QR Code Type</Label>
                <Select 
                  value={createForm.qr_type} 
                  onValueChange={(value: any) => setCreateForm(prev => ({ ...prev, qr_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="event">Event QR Code</SelectItem>
                    <SelectItem value="campaign">Campaign QR Code</SelectItem>
                    <SelectItem value="custom">Custom URL QR Code</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {createForm.qr_type === 'event' && (
                <div>
                  <Label htmlFor="event">Select Event</Label>
                  <Select 
                    value={createForm.event_id || ''} 
                    onValueChange={(value) => setCreateForm(prev => ({ ...prev, event_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an event..." />
                    </SelectTrigger>
                    <SelectContent>
                      {events.map((event) => (
                        <SelectItem key={event.id} value={event.id}>
                          {event.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {(createForm.qr_type === 'custom' || createForm.qr_type === 'campaign') && (
                <div>
                  <Label htmlFor="url">Target URL</Label>
                  <Input
                    id="url"
                    type="url"
                    value={createForm.custom_url || ''}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, custom_url: e.target.value }))}
                    placeholder="https://example.com"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="source">Campaign Source (Optional)</Label>
                <Input
                  id="source"
                  value={createForm.campaign_source || ''}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, campaign_source: e.target.value }))}
                  placeholder="e.g., flyer, social_media, banner"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="tracking"
                  checked={createForm.tracking_enabled}
                  onCheckedChange={(checked) => setCreateForm(prev => ({ ...prev, tracking_enabled: checked }))}
                />
                <Label htmlFor="tracking">Enable scan tracking</Label>
              </div>

              <div>
                <Label htmlFor="expires">Expiration Date (Optional)</Label>
                <Input
                  id="expires"
                  type="date"
                  value={createForm.expires_at || ''}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, expires_at: e.target.value }))}
                />
              </div>

              {/* QR Options */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">QR Code Appearance</h4>
                
                <div className="space-y-3">
                  <div>
                    <Label>Size: {createForm.qr_options.size}px</Label>
                    <Slider
                      value={[createForm.qr_options.size || 300]}
                      onValueChange={(value) => setCreateForm(prev => ({
                        ...prev,
                        qr_options: { ...prev.qr_options, size: value[0] }
                      }))}
                      min={100}
                      max={1000}
                      step={50}
                      className="mt-2"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="color">QR Color</Label>
                      <Input
                        id="color"
                        type="color"
                        value={`#${createForm.qr_options.color}`}
                        onChange={(e) => setCreateForm(prev => ({
                          ...prev,
                          qr_options: { ...prev.qr_options, color: e.target.value.replace('#', '') }
                        }))}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="bg-color">Background</Label>
                      <Input
                        id="bg-color"
                        type="color"
                        value={`#${createForm.qr_options.backgroundColor}`}
                        onChange={(e) => setCreateForm(prev => ({
                          ...prev,
                          qr_options: { ...prev.qr_options, backgroundColor: e.target.value.replace('#', '') }
                        }))}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Preview */}
              {previewQR && (
                <div className="border-t pt-4">
                  <Label>Preview</Label>
                  <div className="mt-2 flex justify-center">
                    <img 
                      src={previewQR} 
                      alt="QR Code Preview" 
                      className="border rounded-lg"
                      style={{ maxWidth: '200px', maxHeight: '200px' }}
                    />
                  </div>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateQRCode}>
                Create QR Code
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Analytics Overview */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <QrCode className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total QR Codes</p>
                  <p className="text-2xl font-bold">{analytics.total_codes}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <MousePointer className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total Scans</p>
                  <p className="text-2xl font-bold">{analytics.total_scans}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Avg Scans per QR</p>
                  <p className="text-2xl font-bold">{analytics.scan_rate.toFixed(1)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Top Performer</p>
                  <p className="text-lg font-bold truncate">{analytics.most_scanned_code || 'None'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="qr-codes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="qr-codes">My QR Codes ({qrCodes.length})</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="qr-codes" className="space-y-4">
          {/* Search */}
          <div className="flex items-center space-x-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search QR codes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {/* QR Codes List */}
          <div className="space-y-4">
            {filteredQRCodes.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <QrCode className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No QR codes yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first QR code to start tracking engagement
                  </p>
                  <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First QR Code
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredQRCodes.map((qrCode) => (
                  <Card key={qrCode.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={`text-white ${getQRTypeBadgeColor(qrCode.qr_type)}`}>
                              {getQRTypeIcon(qrCode.qr_type)}
                              <span className="ml-1 capitalize">{qrCode.qr_type}</span>
                            </Badge>
                            {qrCode.tracking_enabled && (
                              <Badge variant="outline" className="text-xs">
                                Tracked
                              </Badge>
                            )}
                          </div>
                          <CardTitle className="text-lg line-clamp-1">{qrCode.name}</CardTitle>
                          <CardDescription className="line-clamp-2">
                            {qrCode.description || 'No description'}
                          </CardDescription>
                        </div>
                        <img 
                          src={qrCode.qr_code_url} 
                          alt="QR Code" 
                          className="w-16 h-16 border rounded"
                        />
                      </div>
                    </CardHeader>

                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Scans:</span>
                          <span className="font-semibold">{qrCode.scan_count}</span>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Created:</span>
                          <span>{new Date(qrCode.created_at).toLocaleDateString()}</span>
                        </div>

                        {qrCode.expires_at && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Expires:</span>
                            <span>{new Date(qrCode.expires_at).toLocaleDateString()}</span>
                          </div>
                        )}

                        <div className="flex gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopyUrl(qrCode.target_url)}
                            className="flex-1"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadQR(qrCode)}
                            className="flex-1"
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteQRCode(qrCode.id, qrCode.name)}
                            className="flex-1 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Scan Performance</CardTitle>
                <CardDescription>
                  QR code engagement over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Detailed analytics coming soon
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Scans</CardTitle>
                <CardDescription>
                  Latest QR code activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                {analytics?.recent_scans.length ? (
                  <div className="space-y-2">
                    {analytics.recent_scans.slice(0, 5).map((scan, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {new Date(scan.scanned_at).toLocaleDateString()}
                        </span>
                        <Badge variant="outline">
                          {scan.device_type || 'Unknown'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MousePointer className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      No scans recorded yet
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>QR Code Templates</CardTitle>
              <CardDescription>
                Pre-designed QR codes for common use cases
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Printer className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  QR code templates coming soon
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EventQRCodesPage;