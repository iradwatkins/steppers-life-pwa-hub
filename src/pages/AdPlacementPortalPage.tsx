/**
 * Ad Placement Portal Page - Epic O.001: Advertising System
 * 
 * User-facing interface for eligible users (organizers, instructors, businesses) to
 * place ad orders, upload creatives, and manage their advertising campaigns.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
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
  Upload,
  CreditCard,
  Eye,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Image as ImageIcon,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAdvertising } from '@/hooks/useAdvertising';
import { AdZone, DirectAd } from '@/services/advertisingService';

const AdPlacementPortalPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    adZones,
    userAds,
    loading,
    error,
    submitAdPlacement,
    fetchUserAds,
    calculateAdPrice,
    validateCreativeFile,
    clearError
  } = useAdvertising({ 
    autoFetch: true,
    userId: user?.id 
  });

  const [selectedZone, setSelectedZone] = useState<AdZone | null>(null);
  const [showPlacementDialog, setShowPlacementDialog] = useState(false);
  const [creativeFile, setCreativeFile] = useState<File | null>(null);
  const [creativePreview, setCreativePreview] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Form state
  const [placementForm, setPlacementForm] = useState({
    title: '',
    description: '',
    click_through_url: '',
    duration_days: 7
  });

  useEffect(() => {
    if (user?.id) {
      fetchUserAds(user.id);
    }
  }, [user?.id, fetchUserAds]);

  const handleZoneSelect = (zone: AdZone) => {
    setSelectedZone(zone);
    setShowPlacementDialog(true);
    resetForm();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedZone) return;

    // Validate file
    const validation = validateCreativeFile(file, selectedZone);
    setValidationErrors(validation.errors);

    if (validation.valid) {
      setCreativeFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setCreativePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setCreativeFile(null);
      setCreativePreview(null);
    }
  };

  const handleSubmitPlacement = async () => {
    if (!selectedZone || !creativeFile || !user?.id) return;

    const placementData = {
      zone_id: selectedZone.id,
      title: placementForm.title,
      description: placementForm.description,
      click_through_url: placementForm.click_through_url,
      duration_days: placementForm.duration_days,
      creative_file: creativeFile
    };

    const result = await submitAdPlacement(placementData);
    if (result) {
      setShowPlacementDialog(false);
      resetForm();
      // Navigate to payment or show success message
    }
  };

  const resetForm = () => {
    setPlacementForm({
      title: '',
      description: '',
      click_through_url: '',
      duration_days: 7
    });
    setCreativeFile(null);
    setCreativePreview(null);
    setValidationErrors([]);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: { variant: 'outline', className: 'text-yellow-600', icon: Clock },
      approved: { variant: 'default', className: 'text-green-600', icon: CheckCircle },
      rejected: { variant: 'destructive', icon: AlertTriangle },
      running: { variant: 'default', className: 'text-blue-600', icon: BarChart3 },
      paused: { variant: 'outline', className: 'text-gray-600' },
      completed: { variant: 'secondary', icon: CheckCircle },
      expired: { variant: 'outline', className: 'text-red-600' }
    };

    const props = variants[status] || { variant: 'secondary' };
    const Icon = props.icon;
    
    return (
      <Badge {...props}>
        {Icon && <Icon className="h-3 w-3 mr-1" />}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getTierBadge = (tier: string) => {
    const colors = {
      premium: 'bg-yellow-100 text-yellow-800',
      standard: 'bg-blue-100 text-blue-800',
      random: 'bg-green-100 text-green-800'
    };
    return (
      <Badge className={colors[tier as keyof typeof colors] || colors.standard}>
        {tier.charAt(0).toUpperCase() + tier.slice(1)}
      </Badge>
    );
  };

  const calculateTotalPrice = () => {
    if (!selectedZone) return 0;
    return calculateAdPrice(selectedZone, placementForm.duration_days);
  };

  // Check if user is eligible to place ads
  const isEligibleUser = user?.role === 'organizer' || user?.role === 'instructor' || user?.role === 'business';

  if (!isEligibleUser) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Only organizers, instructors, and businesses can place advertisements. 
            Please contact support if you believe this is an error.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Ad Placement Portal</h1>
        <p className="text-muted-foreground">
          Promote your business with targeted advertising across our platform
        </p>
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

      {/* Available Ad Zones */}
      <Card>
        <CardHeader>
          <CardTitle>Available Ad Zones</CardTitle>
          <CardDescription>
            Choose from our premium advertising locations to maximize your reach
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {adZones.filter(zone => zone.is_active).map((zone) => (
              <Card key={zone.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{zone.name}</CardTitle>
                      <CardDescription>{zone.placement_location}</CardDescription>
                    </div>
                    {getTierBadge(zone.pricing_tier)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Dimensions:</span>
                      <span className="font-medium">
                        {zone.dimensions.width}×{zone.dimensions.height}px
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Starting at:</span>
                      <span className="font-medium text-green-600">
                        ${zone.base_price}/day
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {zone.description}
                    </div>
                    <Button 
                      className="w-full"
                      onClick={() => handleZoneSelect(zone)}
                    >
                      Select This Zone
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* User's Ad History */}
      <Card>
        <CardHeader>
          <CardTitle>Your Advertisements</CardTitle>
          <CardDescription>
            Track the performance and status of your ad campaigns
          </CardDescription>
        </CardHeader>
        <CardContent>
          {userAds.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ad Title</TableHead>
                  <TableHead>Zone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead>Total Cost</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userAds.map((ad) => (
                  <TableRow key={ad.id}>
                    <TableCell className="font-medium">{ad.title}</TableCell>
                    <TableCell>{ad.zone_name}</TableCell>
                    <TableCell>{getStatusBadge(ad.status)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{ad.duration_days} days</div>
                        <div className="text-muted-foreground">
                          {new Date(ad.start_date).toLocaleDateString()} - 
                          {new Date(ad.end_date).toLocaleDateString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{ad.impressions.toLocaleString()} views</div>
                        <div>{ad.clicks} clicks ({ad.ctr.toFixed(2)}% CTR)</div>
                      </div>
                    </TableCell>
                    <TableCell>${ad.total_price.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-3 w-3" />
                        </Button>
                        {ad.creative_url && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.open(ad.creative_url, '_blank')}
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>You haven't placed any advertisements yet.</p>
              <p>Select an ad zone above to get started!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ad Placement Dialog */}
      <Dialog open={showPlacementDialog} onOpenChange={setShowPlacementDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Place Advertisement</DialogTitle>
            <DialogDescription>
              Create your ad campaign for {selectedZone?.name}
            </DialogDescription>
          </DialogHeader>

          {selectedZone && (
            <div className="space-y-6">
              {/* Zone Information */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Zone Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Location:</span>
                      <p className="font-medium">{selectedZone.placement_location}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Dimensions:</span>
                      <p className="font-medium">
                        {selectedZone.dimensions.width}×{selectedZone.dimensions.height}px
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Supported Formats:</span>
                      <p className="font-medium">
                        {selectedZone.supported_file_types.map(type => 
                          type.split('/')[1].toUpperCase()
                        ).join(', ')}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Max File Size:</span>
                      <p className="font-medium">{selectedZone.max_file_size_mb}MB</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Ad Details Form */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Ad Title *</Label>
                  <Input
                    id="title"
                    value={placementForm.title}
                    onChange={(e) => setPlacementForm({...placementForm, title: e.target.value})}
                    placeholder="Enter your ad title"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (days) *</Label>
                  <Select
                    value={placementForm.duration_days.toString()}
                    onValueChange={(value) => setPlacementForm({...placementForm, duration_days: parseInt(value)})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 days</SelectItem>
                      <SelectItem value="14">14 days (5% discount)</SelectItem>
                      <SelectItem value="30">30 days (15% discount)</SelectItem>
                      <SelectItem value="60">60 days (20% discount)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={placementForm.description}
                    onChange={(e) => setPlacementForm({...placementForm, description: e.target.value})}
                    placeholder="Brief description of your ad (optional)"
                    rows={3}
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="url">Click-Through URL *</Label>
                  <Input
                    id="url"
                    type="url"
                    value={placementForm.click_through_url}
                    onChange={(e) => setPlacementForm({...placementForm, click_through_url: e.target.value})}
                    placeholder="https://your-website.com"
                    required
                  />
                </div>
              </div>

              {/* Creative Upload */}
              <div className="space-y-4">
                <Label>Upload Creative *</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <div className="text-center">
                    <Upload className="h-8 w-8 mx-auto mb-4 text-gray-400" />
                    <div className="mb-4">
                      <label htmlFor="creative-upload" className="cursor-pointer">
                        <span className="text-blue-600 hover:text-blue-500">
                          Click to upload
                        </span>
                        <span className="text-gray-500"> or drag and drop</span>
                      </label>
                      <input
                        id="creative-upload"
                        type="file"
                        accept={selectedZone.supported_file_types.join(',')}
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </div>
                    <p className="text-sm text-gray-500">
                      {selectedZone.supported_file_types.map(type => 
                        type.split('/')[1].toUpperCase()
                      ).join(', ')} up to {selectedZone.max_file_size_mb}MB
                    </p>
                  </div>
                </div>

                {validationErrors.length > 0 && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <ul className="list-disc pl-4">
                        {validationErrors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                {creativePreview && (
                  <div className="space-y-2">
                    <Label>Preview</Label>
                    <div className="border rounded-lg p-4 bg-gray-50">
                      <img
                        src={creativePreview}
                        alt="Creative preview"
                        className="max-w-full h-auto"
                        style={{
                          maxWidth: selectedZone.dimensions.width,
                          maxHeight: selectedZone.dimensions.height
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Pricing Summary */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <DollarSign className="h-5 w-5 mr-2" />
                    Pricing Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Base price per day:</span>
                      <span>${selectedZone.base_price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span>{placementForm.duration_days} days</span>
                    </div>
                    {placementForm.duration_days >= 7 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount applied:</span>
                        <span>
                          {placementForm.duration_days >= 30 ? '15%' : 
                           placementForm.duration_days >= 14 ? '10%' : '5%'}
                        </span>
                      </div>
                    )}
                    <div className="border-t pt-2 flex justify-between font-bold text-lg">
                      <span>Total:</span>
                      <span>${calculateTotalPrice().toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setShowPlacementDialog(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitPlacement}
                  disabled={!placementForm.title || !placementForm.click_through_url || !creativeFile || validationErrors.length > 0}
                  className="flex items-center"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Proceed to Payment (${calculateTotalPrice().toFixed(2)})
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdPlacementPortalPage;