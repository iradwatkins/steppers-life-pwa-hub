import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Slider } from '../ui/slider';
import { Switch } from '../ui/switch';
import { Alert, AlertDescription } from '../ui/alert';
import { QrCode, Settings, Palette, Target, Eye, Download, Copy, Smartphone, FileImage, Printer } from 'lucide-react';
import { useQRCodes } from '../../hooks/useQRCodes';
import { QRCodeConfig, QRCodeDesign, QRCodeFormat } from '../../services/qrCodeService';

interface CreateQRCodeDialogProps {
  open: boolean;
  onClose: () => void;
  eventId?: string;
  editingCode?: any;
}

export const CreateQRCodeDialog: React.FC<CreateQRCodeDialogProps> = ({ 
  open, 
  onClose, 
  eventId,
  editingCode 
}) => {
  const { createQRCode, updateQRCode, templates, isGenerating } = useQRCodes(eventId);
  const [activeTab, setActiveTab] = useState('basic');
  const [qrPreviewUrl, setQrPreviewUrl] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Form state
  const [formData, setFormData] = useState<QRCodeConfig>({
    id: editingCode?.id || '',
    eventId: eventId || '',
    name: editingCode?.name || '',
    description: editingCode?.description || '',
    targetUrl: editingCode?.targetUrl || `${window.location.origin}/events/${eventId}`,
    trackingParams: editingCode?.trackingParams || {},
    design: editingCode?.design || {
      size: 256,
      errorCorrectionLevel: 'M',
      margin: 4,
      darkColor: '#000000',
      lightColor: '#FFFFFF',
      logoUrl: '',
      logoSize: 20,
      cornerRadius: 0,
      dotStyle: 'square',
      eyeStyle: 'square',
      gradientType: 'none',
      gradientColors: ['#000000', '#000000']
    },
    format: editingCode?.format || 'png',
    isActive: editingCode?.isActive ?? true,
    createdAt: editingCode?.createdAt || new Date(),
    updatedAt: new Date()
  });

  const [campaignName, setCampaignName] = useState(editingCode?.campaignName || '');
  const [selectedTemplate, setSelectedTemplate] = useState(editingCode?.templateId || '');

  useEffect(() => {
    if (formData.targetUrl) {
      // Generate preview URL with tracking params
      const url = new URL(formData.targetUrl);
      Object.entries(formData.trackingParams).forEach(([key, value]) => {
        url.searchParams.set(key, value);
      });
      setQrPreviewUrl(url.toString());
    }
  }, [formData.targetUrl, formData.trackingParams]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.targetUrl.trim()) {
      newErrors.targetUrl = 'Target URL is required';
    } else {
      try {
        new URL(formData.targetUrl);
      } catch {
        newErrors.targetUrl = 'Please enter a valid URL';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      if (editingCode) {
        await updateQRCode(formData.id, formData);
      } else {
        await createQRCode(formData, campaignName);
      }
      onClose();
    } catch (error) {
      console.error('Failed to save QR code:', error);
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setFormData(prev => ({
        ...prev,
        design: { ...prev.design, ...template.design },
        format: template.format
      }));
      setSelectedTemplate(templateId);
    }
  };

  const updateFormData = (updates: Partial<QRCodeConfig>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const updateDesign = (updates: Partial<QRCodeDesign>) => {
    setFormData(prev => ({
      ...prev,
      design: { ...prev.design, ...updates }
    }));
  };

  const presets = [
    { name: 'Business Card', size: 128, format: 'png' as QRCodeFormat, icon: FileImage },
    { name: 'Flyer', size: 256, format: 'svg' as QRCodeFormat, icon: Printer },
    { name: 'Social Media', size: 512, format: 'png' as QRCodeFormat, icon: Smartphone },
    { name: 'Large Print', size: 1024, format: 'svg' as QRCodeFormat, icon: Printer }
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <QrCode className="h-5 w-5 mr-2" />
            {editingCode ? 'Edit QR Code' : 'Create QR Code'}
          </DialogTitle>
          <DialogDescription>
            Generate a custom QR code for your event promotion and marketing materials.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Form */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic" className="flex items-center space-x-2">
                  <Settings className="h-4 w-4" />
                  <span>Basic</span>
                </TabsTrigger>
                <TabsTrigger value="design" className="flex items-center space-x-2">
                  <Palette className="h-4 w-4" />
                  <span>Design</span>
                </TabsTrigger>
                <TabsTrigger value="tracking" className="flex items-center space-x-2">
                  <Target className="h-4 w-4" />
                  <span>Tracking</span>
                </TabsTrigger>
              </TabsList>

              {/* Basic Tab */}
              <TabsContent value="basic" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        placeholder="e.g., Main Event QR, Social Media QR"
                        value={formData.name}
                        onChange={(e) => updateFormData({ name: e.target.value })}
                        className={errors.name ? 'border-red-500' : ''}
                      />
                      {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
                    </div>
                    
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Optional description for your reference"
                        value={formData.description}
                        onChange={(e) => updateFormData({ description: e.target.value })}
                        rows={3}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="targetUrl">Target URL *</Label>
                      <Input
                        id="targetUrl"
                        placeholder="https://example.com/event/123"
                        value={formData.targetUrl}
                        onChange={(e) => updateFormData({ targetUrl: e.target.value })}
                        className={errors.targetUrl ? 'border-red-500' : ''}
                      />
                      {errors.targetUrl && <p className="text-sm text-red-500 mt-1">{errors.targetUrl}</p>}
                    </div>
                    
                    <div>
                      <Label htmlFor="campaignName">Campaign Name</Label>
                      <Input
                        id="campaignName"
                        placeholder="Optional campaign grouping"
                        value={campaignName}
                        onChange={(e) => setCampaignName(e.target.value)}
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isActive"
                        checked={formData.isActive}
                        onCheckedChange={(checked) => updateFormData({ isActive: checked })}
                      />
                      <Label htmlFor="isActive">Active</Label>
                    </div>
                  </CardContent>
                </Card>

                {/* Templates */}
                <Card>
                  <CardHeader>
                    <CardTitle>Templates</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      {templates.map((template) => (
                        <Button
                          key={template.id}
                          variant={selectedTemplate === template.id ? 'default' : 'outline'}
                          onClick={() => handleTemplateSelect(template.id)}
                          className="h-auto p-3 text-left"
                        >
                          <div>
                            <div className="font-medium">{template.name}</div>
                            <div className="text-xs text-gray-500">{template.description}</div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Design Tab */}
              <TabsContent value="design" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Format & Size</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Format</Label>
                        <Select
                          value={formData.format}
                          onValueChange={(value: QRCodeFormat) => updateFormData({ format: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="png">PNG (Raster)</SelectItem>
                            <SelectItem value="svg">SVG (Vector)</SelectItem>
                            <SelectItem value="pdf">PDF (Print)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label>Error Correction</Label>
                        <Select
                          value={formData.design.errorCorrectionLevel}
                          onValueChange={(value: any) => updateDesign({ errorCorrectionLevel: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="L">Low (~7%)</SelectItem>
                            <SelectItem value="M">Medium (~15%)</SelectItem>
                            <SelectItem value="Q">Quartile (~25%)</SelectItem>
                            <SelectItem value="H">High (~30%)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div>
                      <Label>Size: {formData.design.size}px</Label>
                      <Slider
                        value={[formData.design.size]}
                        onValueChange={([value]) => updateDesign({ size: value })}
                        min={128}
                        max={1024}
                        step={64}
                        className="mt-2"
                      />
                    </div>
                    
                    <div>
                      <Label>Margin: {formData.design.margin}</Label>
                      <Slider
                        value={[formData.design.margin]}
                        onValueChange={([value]) => updateDesign({ margin: value })}
                        min={0}
                        max={10}
                        step={1}
                        className="mt-2"
                      />
                    </div>

                    {/* Quick Presets */}
                    <div>
                      <Label>Quick Presets</Label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {presets.map((preset) => (
                          <Button
                            key={preset.name}
                            variant="outline"
                            onClick={() => {
                              updateDesign({ size: preset.size });
                              updateFormData({ format: preset.format });
                            }}
                            className="flex items-center space-x-2"
                          >
                            <preset.icon className="h-4 w-4" />
                            <span>{preset.name}</span>
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Colors & Style</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="darkColor">Foreground Color</Label>
                        <div className="flex items-center space-x-2">
                          <Input
                            id="darkColor"
                            type="color"
                            value={formData.design.darkColor}
                            onChange={(e) => updateDesign({ darkColor: e.target.value })}
                            className="w-12 h-10 p-1"
                          />
                          <Input
                            value={formData.design.darkColor}
                            onChange={(e) => updateDesign({ darkColor: e.target.value })}
                            placeholder="#000000"
                            className="flex-1"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="lightColor">Background Color</Label>
                        <div className="flex items-center space-x-2">
                          <Input
                            id="lightColor"
                            type="color"
                            value={formData.design.lightColor}
                            onChange={(e) => updateDesign({ lightColor: e.target.value })}
                            className="w-12 h-10 p-1"
                          />
                          <Input
                            value={formData.design.lightColor}
                            onChange={(e) => updateDesign({ lightColor: e.target.value })}
                            placeholder="#FFFFFF"
                            className="flex-1"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Dot Style</Label>
                        <Select
                          value={formData.design.dotStyle}
                          onValueChange={(value: any) => updateDesign({ dotStyle: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="square">Square</SelectItem>
                            <SelectItem value="rounded">Rounded</SelectItem>
                            <SelectItem value="circle">Circle</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label>Eye Style</Label>
                        <Select
                          value={formData.design.eyeStyle}
                          onValueChange={(value: any) => updateDesign({ eyeStyle: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="square">Square</SelectItem>
                            <SelectItem value="circle">Circle</SelectItem>
                            <SelectItem value="rounded">Rounded</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div>
                      <Label>Corner Radius: {formData.design.cornerRadius}%</Label>
                      <Slider
                        value={[formData.design.cornerRadius]}
                        onValueChange={([value]) => updateDesign({ cornerRadius: value })}
                        min={0}
                        max={50}
                        step={5}
                        className="mt-2"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Logo (Optional)</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="logoUrl">Logo URL</Label>
                      <Input
                        id="logoUrl"
                        placeholder="https://example.com/logo.png"
                        value={formData.design.logoUrl}
                        onChange={(e) => updateDesign({ logoUrl: e.target.value })}
                      />
                    </div>
                    
                    {formData.design.logoUrl && (
                      <div>
                        <Label>Logo Size: {formData.design.logoSize}%</Label>
                        <Slider
                          value={[formData.design.logoSize]}
                          onValueChange={([value]) => updateDesign({ logoSize: value })}
                          min={10}
                          max={40}
                          step={5}
                          className="mt-2"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tracking Tab */}
              <TabsContent value="tracking" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Tracking Parameters</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="utm_source">UTM Source</Label>
                        <Input
                          id="utm_source"
                          placeholder="qr_code"
                          value={formData.trackingParams.utm_source || ''}
                          onChange={(e) => updateFormData({
                            trackingParams: { ...formData.trackingParams, utm_source: e.target.value }
                          })}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="utm_medium">UTM Medium</Label>
                        <Input
                          id="utm_medium"
                          placeholder="print, social, email"
                          value={formData.trackingParams.utm_medium || ''}
                          onChange={(e) => updateFormData({
                            trackingParams: { ...formData.trackingParams, utm_medium: e.target.value }
                          })}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="utm_campaign">UTM Campaign</Label>
                        <Input
                          id="utm_campaign"
                          placeholder="summer_promotion"
                          value={formData.trackingParams.utm_campaign || ''}
                          onChange={(e) => updateFormData({
                            trackingParams: { ...formData.trackingParams, utm_campaign: e.target.value }
                          })}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="utm_content">UTM Content</Label>
                        <Input
                          id="utm_content"
                          placeholder="flyer_a, banner_top"
                          value={formData.trackingParams.utm_content || ''}
                          onChange={(e) => updateFormData({
                            trackingParams: { ...formData.trackingParams, utm_content: e.target.value }
                          })}
                        />
                      </div>
                    </div>
                    
                    <Alert>
                      <Target className="h-4 w-4" />
                      <AlertDescription>
                        UTM parameters help track the effectiveness of your QR code campaigns in analytics tools like Google Analytics.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Preview */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* QR Code Preview */}
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  <div 
                    className="inline-block p-4 bg-white rounded-lg shadow-sm"
                    style={{ backgroundColor: formData.design.lightColor }}
                  >
                    <QrCode 
                      className="mx-auto"
                      style={{ 
                        width: Math.min(formData.design.size / 4, 120),
                        height: Math.min(formData.design.size / 4, 120),
                        color: formData.design.darkColor
                      }}
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {formData.design.size}×{formData.design.size}px {formData.format.toUpperCase()}
                  </p>
                </div>
                
                {/* Details */}
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Name:</span> {formData.name || 'Untitled'}
                  </div>
                  <div>
                    <span className="font-medium">Target:</span> 
                    <span className="text-blue-600 break-all"> {formData.targetUrl}</span>
                  </div>
                  {Object.keys(formData.trackingParams).length > 0 && (
                    <div>
                      <span className="font-medium">Tracking:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {Object.entries(formData.trackingParams)
                          .filter(([_, value]) => value)
                          .map(([key, value]) => (
                            <Badge key={key} variant="secondary" className="text-xs">
                              {key}: {value}
                            </Badge>
                          ))
                        }
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Preview Actions */}
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Copy className="h-3 w-3 mr-1" />
                    Copy URL
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Download className="h-3 w-3 mr-1" />
                    Test
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex justify-end space-x-3 pt-6 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isGenerating}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isGenerating ? 'Generating...' : editingCode ? 'Update QR Code' : 'Create QR Code'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 