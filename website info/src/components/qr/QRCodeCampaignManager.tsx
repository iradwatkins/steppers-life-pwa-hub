import React, { useState, useMemo } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Progress } from '../ui/progress';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Target, 
  Plus, 
  Edit, 
  Trash2, 
  Play, 
  Pause, 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Eye,
  MousePointer,
  Users,
  Calendar,
  Zap,
  TestTube,
  Award,
  AlertCircle
} from 'lucide-react';
import { useQRCodes } from '../../hooks/useQRCodes';
import { QRCodeCampaign } from '../../services/qrCodeService';

interface QRCodeCampaignManagerProps {
  eventId?: string;
}

export const QRCodeCampaignManager: React.FC<QRCodeCampaignManagerProps> = ({ eventId }) => {
  const { qrCodes, campaigns, createCampaign, updateCampaign, deleteCampaign, isLoading } = useQRCodes(eventId);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<QRCodeCampaign | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Filter campaigns
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(campaign => {
      const matchesSearch = campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           campaign.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'all' || campaign.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [campaigns, searchQuery, filterStatus]);

  // Calculate aggregate metrics
  const aggregateMetrics = useMemo(() => {
    const activeCampaigns = campaigns.filter(c => c.status === 'active');
    const totalScans = campaigns.reduce((sum, c) => sum + c.metrics.totalScans, 0);
    const totalConversions = campaigns.reduce((sum, c) => sum + c.metrics.conversions, 0);
    const avgConversionRate = campaigns.length > 0 
      ? campaigns.reduce((sum, c) => sum + c.metrics.conversionRate, 0) / campaigns.length 
      : 0;

    return {
      totalCampaigns: campaigns.length,
      activeCampaigns: activeCampaigns.length,
      totalScans,
      totalConversions,
      avgConversionRate
    };
  }, [campaigns]);

  const handleCreateCampaign = () => {
    setEditingCampaign(null);
    setShowCreateDialog(true);
  };

  const handleEditCampaign = (campaign: QRCodeCampaign) => {
    setEditingCampaign(campaign);
    setShowCreateDialog(true);
  };

  const handleDeleteCampaign = async (campaignId: string) => {
    if (window.confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) {
      await deleteCampaign(campaignId);
    }
  };

  const toggleCampaignStatus = async (campaign: QRCodeCampaign) => {
    const newStatus = campaign.status === 'active' ? 'paused' : 'active';
    await updateCampaign(campaign.id, {
      ...campaign,
      status: newStatus,
      updatedAt: new Date()
    });
  };

  const getCampaignQRCodes = (campaignId: string) => {
    return qrCodes.filter(qr => qr.campaignId === campaignId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Play className="h-3 w-3" />;
      case 'paused': return <Pause className="h-3 w-3" />;
      case 'completed': return <Award className="h-3 w-3" />;
      default: return <Eye className="h-3 w-3" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Campaign Management</h3>
          <p className="text-sm text-gray-600 mt-1">
            Organize QR codes into campaigns and track performance
          </p>
        </div>
        <Button onClick={handleCreateCampaign} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Create Campaign
        </Button>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Campaigns</p>
                <p className="text-2xl font-bold text-gray-900">{aggregateMetrics.totalCampaigns}</p>
                <p className="text-sm text-gray-500">{aggregateMetrics.activeCampaigns} active</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-100">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Scans</p>
                <p className="text-2xl font-bold text-gray-900">{aggregateMetrics.totalScans.toLocaleString()}</p>
                <p className="text-sm text-gray-500">Across all campaigns</p>
              </div>
              <div className="p-3 rounded-lg bg-green-100">
                <Eye className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conversions</p>
                <p className="text-2xl font-bold text-gray-900">{aggregateMetrics.totalConversions.toLocaleString()}</p>
                <p className="text-sm text-gray-500">{aggregateMetrics.avgConversionRate.toFixed(1)}% avg rate</p>
              </div>
              <div className="p-3 rounded-lg bg-purple-100">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">QR Codes</p>
                <p className="text-2xl font-bold text-gray-900">{qrCodes.length}</p>
                <p className="text-sm text-gray-500">Total managed</p>
              </div>
              <div className="p-3 rounded-lg bg-orange-100">
                <BarChart3 className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-md">
              <Input
                placeholder="Search campaigns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Campaigns List */}
      <div className="grid grid-cols-1 gap-6">
        {filteredCampaigns.map((campaign) => (
          <CampaignCard
            key={campaign.id}
            campaign={campaign}
            qrCodes={getCampaignQRCodes(campaign.id)}
            onEdit={handleEditCampaign}
            onDelete={handleDeleteCampaign}
            onToggleStatus={toggleCampaignStatus}
          />
        ))}
      </div>

      {filteredCampaigns.length === 0 && (
        <div className="text-center py-12">
          <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No campaigns found</p>
          {searchQuery || filterStatus !== 'all' ? (
            <p className="text-sm text-gray-500 mt-2">
              Try adjusting your search or filter criteria
            </p>
          ) : (
            <Button 
              variant="outline" 
              onClick={handleCreateCampaign}
              className="mt-4"
            >
              Create your first campaign
            </Button>
          )}
        </div>
      )}

      {/* Create/Edit Campaign Dialog */}
      <CampaignEditDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        campaign={editingCampaign}
        qrCodes={qrCodes}
        onSave={async (campaignData) => {
          if (editingCampaign) {
            await updateCampaign(editingCampaign.id, campaignData);
          } else {
            await createCampaign(campaignData);
          }
          setShowCreateDialog(false);
        }}
      />
    </div>
  );
};

interface CampaignCardProps {
  campaign: QRCodeCampaign;
  qrCodes: any[];
  onEdit: (campaign: QRCodeCampaign) => void;
  onDelete: (campaignId: string) => void;
  onToggleStatus: (campaign: QRCodeCampaign) => void;
}

const CampaignCard: React.FC<CampaignCardProps> = ({
  campaign,
  qrCodes,
  onEdit,
  onDelete,
  onToggleStatus
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Play className="h-3 w-3" />;
      case 'paused': return <Pause className="h-3 w-3" />;
      case 'completed': return <Award className="h-3 w-3" />;
      default: return <Eye className="h-3 w-3" />;
    }
  };

  const isActive = campaign.status === 'active';
  const daysRemaining = campaign.endDate 
    ? Math.max(0, Math.ceil((new Date(campaign.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <CardTitle className="text-lg">{campaign.name}</CardTitle>
              <Badge className={getStatusColor(campaign.status)}>
                {getStatusIcon(campaign.status)}
                <span className="ml-1 capitalize">{campaign.status}</span>
              </Badge>
              {campaign.isABTest && (
                <Badge variant="outline" className="text-xs">
                  <TestTube className="h-3 w-3 mr-1" />
                  A/B Test
                </Badge>
              )}
            </div>
            <p className="text-gray-600 text-sm">{campaign.description}</p>
            {daysRemaining !== null && (
              <p className="text-xs text-gray-500 mt-1">
                {daysRemaining > 0 ? `${daysRemaining} days remaining` : 'Campaign ended'}
              </p>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onToggleStatus(campaign)}
            >
              {isActive ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(campaign)}
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(campaign.id)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Performance Metrics */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 text-sm">Performance</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Scans:</span>
                <span className="font-medium">{campaign.metrics.totalScans.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Clicks:</span>
                <span className="font-medium">{campaign.metrics.totalClicks.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Conversions:</span>
                <span className="font-medium">{campaign.metrics.conversions.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Conv. Rate:</span>
                <span className="font-medium flex items-center">
                  {campaign.metrics.conversionRate.toFixed(1)}%
                  {campaign.metrics.conversionRate > 5 ? (
                    <TrendingUp className="h-3 w-3 text-green-600 ml-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-600 ml-1" />
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* A/B Test Results (if applicable) */}
          {campaign.isABTest && campaign.abTestResults && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 text-sm flex items-center">
                <TestTube className="h-4 w-4 mr-1" />
                A/B Test Results
              </h4>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>Variant A</span>
                    <span>{campaign.abTestResults.variantA.conversionRate.toFixed(1)}%</span>
                  </div>
                  <Progress value={campaign.abTestResults.variantA.conversionRate * 10} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>Variant B</span>
                    <span>{campaign.abTestResults.variantB.conversionRate.toFixed(1)}%</span>
                  </div>
                  <Progress value={campaign.abTestResults.variantB.conversionRate * 10} className="h-2" />
                </div>
                {campaign.abTestResults.winningVariant && (
                  <p className="text-xs text-green-600 flex items-center">
                    <Zap className="h-3 w-3 mr-1" />
                    Variant {campaign.abTestResults.winningVariant} is winning
                  </p>
                )}
              </div>
            </div>
          )}

          {/* QR Codes in Campaign */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 text-sm">QR Codes ({qrCodes.length})</h4>
            <div className="space-y-2 max-h-24 overflow-y-auto">
              {qrCodes.slice(0, 3).map((qr) => (
                <div key={qr.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 truncate">{qr.name}</span>
                  <Badge variant={qr.isActive ? 'default' : 'secondary'} className="text-xs">
                    {qr.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              ))}
              {qrCodes.length > 3 && (
                <p className="text-xs text-gray-500">
                  +{qrCodes.length - 3} more QR codes
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface CampaignEditDialogProps {
  open: boolean;
  onClose: () => void;
  campaign?: QRCodeCampaign | null;
  qrCodes: any[];
  onSave: (campaignData: Omit<QRCodeCampaign, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

const CampaignEditDialog: React.FC<CampaignEditDialogProps> = ({
  open,
  onClose,
  campaign,
  qrCodes,
  onSave
}) => {
  const [formData, setFormData] = useState<Omit<QRCodeCampaign, 'id' | 'createdAt' | 'updatedAt'>>({
    name: campaign?.name || '',
    description: campaign?.description || '',
    status: campaign?.status || 'draft',
    startDate: campaign?.startDate || new Date(),
    endDate: campaign?.endDate || null,
    targetAudience: campaign?.targetAudience || '',
    budget: campaign?.budget || 0,
    goals: campaign?.goals || [],
    isABTest: campaign?.isABTest || false,
    abTestConfig: campaign?.abTestConfig || null,
    abTestResults: campaign?.abTestResults || null,
    metrics: campaign?.metrics || {
      totalScans: 0,
      totalClicks: 0,
      conversions: 0,
      conversionRate: 0,
      cost: 0,
      roi: 0
    }
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedQRCodes, setSelectedQRCodes] = useState<string[]>(
    qrCodes.filter(qr => qr.campaignId === campaign?.id).map(qr => qr.id) || []
  );

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Campaign name is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (formData.endDate && new Date(formData.endDate) <= new Date(formData.startDate)) {
      newErrors.endDate = 'End date must be after start date';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    onSave(formData);
  };

  const updateFormData = (updates: any) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Target className="h-5 w-5 mr-2" />
            {campaign ? 'Edit Campaign' : 'Create Campaign'}
          </DialogTitle>
          <DialogDescription>
            Organize your QR codes into campaigns for better tracking and management.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Campaign Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="campaignName">Campaign Name *</Label>
                <Input
                  id="campaignName"
                  placeholder="e.g., Summer Promotion, Holiday Campaign"
                  value={formData.name}
                  onChange={(e) => updateFormData({ name: e.target.value })}
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
              </div>
              
              <div>
                <Label htmlFor="campaignDescription">Description *</Label>
                <Textarea
                  id="campaignDescription"
                  placeholder="Describe the campaign objectives and target audience"
                  value={formData.description}
                  onChange={(e) => updateFormData({ description: e.target.value })}
                  className={errors.description ? 'border-red-500' : ''}
                  rows={3}
                />
                {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description}</p>}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: any) => updateFormData({ status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="targetAudience">Target Audience</Label>
                  <Input
                    id="targetAudience"
                    placeholder="e.g., Young adults, Business professionals"
                    value={formData.targetAudience}
                    onChange={(e) => updateFormData({ targetAudience: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate.toISOString().split('T')[0]}
                    onChange={(e) => updateFormData({ startDate: new Date(e.target.value) })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="endDate">End Date (Optional)</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate ? formData.endDate.toISOString().split('T')[0] : ''}
                    onChange={(e) => updateFormData({ 
                      endDate: e.target.value ? new Date(e.target.value) : null 
                    })}
                    className={errors.endDate ? 'border-red-500' : ''}
                  />
                  {errors.endDate && <p className="text-sm text-red-500 mt-1">{errors.endDate}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* QR Code Assignment */}
          <Card>
            <CardHeader>
              <CardTitle>QR Code Assignment</CardTitle>
              <CardDescription>
                Select which QR codes belong to this campaign
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {qrCodes.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">No QR codes available</p>
                    <p className="text-sm text-gray-500">Create QR codes first to assign them to campaigns</p>
                  </div>
                ) : (
                  qrCodes.map((qr) => (
                    <div key={qr.id} className="flex items-center space-x-3 p-2 border rounded">
                      <input
                        type="checkbox"
                        checked={selectedQRCodes.includes(qr.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedQRCodes([...selectedQRCodes, qr.id]);
                          } else {
                            setSelectedQRCodes(selectedQRCodes.filter(id => id !== qr.id));
                          }
                        }}
                        className="rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{qr.name}</p>
                        <p className="text-xs text-gray-500">{qr.description}</p>
                      </div>
                      <Badge variant={qr.isActive ? 'default' : 'secondary'} className="text-xs">
                        {qr.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
              {selectedQRCodes.length > 0 && (
                <p className="text-sm text-gray-600 mt-2">
                  {selectedQRCodes.length} QR code{selectedQRCodes.length !== 1 ? 's' : ''} selected
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Action buttons */}
        <div className="flex justify-end space-x-3 pt-6 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700">
            {campaign ? 'Update Campaign' : 'Create Campaign'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 