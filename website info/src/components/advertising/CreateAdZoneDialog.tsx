import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { useAdvertising } from '@/hooks/useAdvertising';
import { AdPlacement, AdZoneFormData } from '@/types/advertising';
import { toast } from 'sonner';

interface CreateAdZoneDialogProps {
  open: boolean;
  onClose: () => void;
}

const placementOptions = [
  { value: AdPlacement.HEADER_BANNER, label: 'Header Banner' },
  { value: AdPlacement.SIDEBAR_RIGHT, label: 'Right Sidebar' },
  { value: AdPlacement.SIDEBAR_LEFT, label: 'Left Sidebar' },
  { value: AdPlacement.IN_FEED, label: 'In-Feed' },
  { value: AdPlacement.FOOTER_BANNER, label: 'Footer Banner' },
  { value: AdPlacement.EVENT_DETAIL_TOP, label: 'Event Detail Top' },
  { value: AdPlacement.EVENT_DETAIL_BOTTOM, label: 'Event Detail Bottom' },
  { value: AdPlacement.BLOG_POST_TOP, label: 'Blog Post Top' },
  { value: AdPlacement.BLOG_POST_BOTTOM, label: 'Blog Post Bottom' },
  { value: AdPlacement.SEARCH_RESULTS, label: 'Search Results' },
];

const defaultFormats = ['jpg', 'png', 'gif', 'webp'];

export const CreateAdZoneDialog: React.FC<CreateAdZoneDialogProps> = ({ open, onClose }) => {
  const { createAdZone } = useAdvertising();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<AdZoneFormData>({
    name: '',
    description: '',
    placement: AdPlacement.HEADER_BANNER,
    dimensions: { width: 1200, height: 90 },
    basePricePerDay: 25,
    isPremium: false,
    supportedFormats: ['jpg', 'png', 'webp'],
    maxFileSize: 2,
    isRandomPlacement: false,
  });

  const [customFormat, setCustomFormat] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Zone name is required');
      return;
    }
    
    if (formData.dimensions.width <= 0 || formData.dimensions.height <= 0) {
      toast.error('Valid dimensions are required');
      return;
    }
    
    if (formData.basePricePerDay <= 0) {
      toast.error('Price per day must be greater than 0');
      return;
    }

    try {
      setLoading(true);
      await createAdZone(formData);
      toast.success('Ad zone created successfully');
      onClose();
      resetForm();
    } catch (error) {
      toast.error('Failed to create ad zone');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      placement: AdPlacement.HEADER_BANNER,
      dimensions: { width: 1200, height: 90 },
      basePricePerDay: 25,
      isPremium: false,
      supportedFormats: ['jpg', 'png', 'webp'],
      maxFileSize: 2,
      isRandomPlacement: false,
    });
    setCustomFormat('');
  };

  const handleFormatToggle = (format: string) => {
    const currentFormats = formData.supportedFormats;
    const newFormats = currentFormats.includes(format)
      ? currentFormats.filter(f => f !== format)
      : [...currentFormats, format];
    
    setFormData(prev => ({ ...prev, supportedFormats: newFormats }));
  };

  const addCustomFormat = () => {
    if (customFormat.trim() && !formData.supportedFormats.includes(customFormat.trim())) {
      setFormData(prev => ({
        ...prev,
        supportedFormats: [...prev.supportedFormats, customFormat.trim()]
      }));
      setCustomFormat('');
    }
  };

  const removeFormat = (format: string) => {
    setFormData(prev => ({
      ...prev,
      supportedFormats: prev.supportedFormats.filter(f => f !== format)
    }));
  };

  const updatePlacement = (placement: AdPlacement) => {
    setFormData(prev => ({ ...prev, placement }));
    
    // Set default dimensions based on placement
    const placementDimensions: Record<AdPlacement, { width: number; height: number }> = {
      [AdPlacement.HEADER_BANNER]: { width: 1200, height: 90 },
      [AdPlacement.SIDEBAR_RIGHT]: { width: 300, height: 250 },
      [AdPlacement.SIDEBAR_LEFT]: { width: 300, height: 250 },
      [AdPlacement.IN_FEED]: { width: 600, height: 200 },
      [AdPlacement.FOOTER_BANNER]: { width: 1200, height: 90 },
      [AdPlacement.EVENT_DETAIL_TOP]: { width: 800, height: 150 },
      [AdPlacement.EVENT_DETAIL_BOTTOM]: { width: 800, height: 150 },
      [AdPlacement.BLOG_POST_TOP]: { width: 700, height: 150 },
      [AdPlacement.BLOG_POST_BOTTOM]: { width: 700, height: 150 },
      [AdPlacement.SEARCH_RESULTS]: { width: 600, height: 100 },
      [AdPlacement.MODAL_OVERLAY]: { width: 500, height: 400 },
      [AdPlacement.BETWEEN_CONTENT]: { width: 728, height: 90 },
    };
    
    setFormData(prev => ({
      ...prev,
      dimensions: placementDimensions[placement] || { width: 300, height: 250 }
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Ad Zone</DialogTitle>
          <DialogDescription>
            Create a new advertising zone with custom specifications
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="name">Zone Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Header Banner, Right Sidebar"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the ad zone placement and visibility"
                rows={3}
              />
            </div>
          </div>

          {/* Placement */}
          <div>
            <Label htmlFor="placement">Placement *</Label>
            <Select value={formData.placement} onValueChange={updatePlacement}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {placementOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Dimensions */}
          <div>
            <Label>Dimensions (pixels) *</Label>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div>
                <Label htmlFor="width">Width</Label>
                <Input
                  id="width"
                  type="number"
                  value={formData.dimensions.width}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    dimensions: { ...prev.dimensions, width: parseInt(e.target.value) || 0 }
                  }))}
                  min="1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="height">Height</Label>
                <Input
                  id="height"
                  type="number"
                  value={formData.dimensions.height}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    dimensions: { ...prev.dimensions, height: parseInt(e.target.value) || 0 }
                  }))}
                  min="1"
                  required
                />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Base Price per Day ($) *</Label>
              <Input
                id="price"
                type="number"
                value={formData.basePricePerDay}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  basePricePerDay: parseFloat(e.target.value) || 0 
                }))}
                min="0.01"
                step="0.01"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="maxFileSize">Max File Size (MB) *</Label>
              <Input
                id="maxFileSize"
                type="number"
                value={formData.maxFileSize}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  maxFileSize: parseFloat(e.target.value) || 1 
                }))}
                min="0.1"
                step="0.1"
                required
              />
            </div>
          </div>

          {/* Supported Formats */}
          <div>
            <Label>Supported File Formats</Label>
            <div className="mt-2 space-y-3">
              <div className="flex flex-wrap gap-2">
                {defaultFormats.map(format => (
                  <div key={format} className="flex items-center space-x-2">
                    <Checkbox
                      id={format}
                      checked={formData.supportedFormats.includes(format)}
                      onCheckedChange={() => handleFormatToggle(format)}
                    />
                    <Label htmlFor={format} className="text-sm">{format.toUpperCase()}</Label>
                  </div>
                ))}
              </div>
              
              <div className="flex gap-2">
                <Input
                  placeholder="Add custom format"
                  value={customFormat}
                  onChange={(e) => setCustomFormat(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomFormat())}
                />
                <Button type="button" variant="outline" onClick={addCustomFormat}>
                  Add
                </Button>
              </div>
              
              {formData.supportedFormats.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.supportedFormats.map(format => (
                    <Badge key={format} variant="secondary" className="flex items-center gap-1">
                      {format.toUpperCase()}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeFormat(format)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isPremium"
                checked={formData.isPremium}
                onCheckedChange={(checked) => setFormData(prev => ({ 
                  ...prev, 
                  isPremium: checked as boolean 
                }))}
              />
              <Label htmlFor="isPremium">Premium Zone (higher pricing, better placement)</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isRandomPlacement"
                checked={formData.isRandomPlacement}
                onCheckedChange={(checked) => setFormData(prev => ({ 
                  ...prev, 
                  isRandomPlacement: checked as boolean 
                }))}
              />
              <Label htmlFor="isRandomPlacement">Random placement (rotate multiple ads)</Label>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Zone'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}; 