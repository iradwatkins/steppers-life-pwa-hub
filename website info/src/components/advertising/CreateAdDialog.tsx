import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Upload,
  Calendar as CalendarIcon,
  DollarSign,
  Clock,
  FileImage,
  Info,
  CreditCard,
  AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { AdZone, AdFormData } from '@/types/advertising';
import { useAdvertising } from '@/hooks/useAdvertising';

interface CreateAdDialogProps {
  open: boolean;
  onClose: () => void;
  selectedZone: AdZone | null;
  advertiserId: string;
}

export const CreateAdDialog: React.FC<CreateAdDialogProps> = ({
  open,
  onClose,
  selectedZone,
  advertiserId
}) => {
  const [formData, setFormData] = useState<Partial<AdFormData>>({
    title: '',
    description: '',
    clickThroughUrl: '',
    schedule: {
      startDate: new Date(),
      duration: 7
    }
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { createDirectUserAd } = useAdvertising();

  // Calculate pricing based on duration
  const calculatePrice = (days: number): number => {
    if (!selectedZone) return 0;
    
    let basePrice = selectedZone.pricing.basePricePerDay * days;
    
    if (days >= 30 && selectedZone.pricing.monthlyDiscount) {
      basePrice = basePrice * (1 - selectedZone.pricing.monthlyDiscount / 100);
    } else if (days >= 7 && selectedZone.pricing.weeklyDiscount) {
      basePrice = basePrice * (1 - selectedZone.pricing.weeklyDiscount / 100);
    }
    
    return Math.round(basePrice);
  };

  const totalCost = calculatePrice(formData.schedule?.duration || 7);
  const savingsAmount = selectedZone 
    ? (selectedZone.pricing.basePricePerDay * (formData.schedule?.duration || 7)) - totalCost
    : 0;

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title?.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.clickThroughUrl?.trim()) {
      newErrors.clickThroughUrl = 'Click-through URL is required';
    } else if (!isValidUrl(formData.clickThroughUrl)) {
      newErrors.clickThroughUrl = 'Please enter a valid URL';
    }

    if (!selectedFile) {
      newErrors.creative = 'Ad creative is required';
    } else if (selectedZone && selectedFile.size > selectedZone.maxFileSize * 1024 * 1024) {
      newErrors.creative = `File size must be under ${selectedZone.maxFileSize}MB`;
    }

    if (!formData.schedule?.duration || formData.schedule.duration < 1) {
      newErrors.duration = 'Duration must be at least 1 day';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && selectedZone) {
      // Check file type
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      if (!fileExtension || !selectedZone.supportedFormats.includes(fileExtension)) {
        setErrors(prev => ({
          ...prev,
          creative: `File must be one of: ${selectedZone.supportedFormats.join(', ')}`
        }));
        return;
      }
      
      // Check file size
      if (file.size > selectedZone.maxFileSize * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          creative: `File size must be under ${selectedZone.maxFileSize}MB`
        }));
        return;
      }

      setSelectedFile(file);
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.creative;
        return newErrors;
      });
    }
  };

  const handleSubmit = async () => {
    if (!validateForm() || !selectedZone) return;

    setIsSubmitting(true);
    try {
      const adData: AdFormData = {
        title: formData.title!,
        description: formData.description,
        adZoneId: selectedZone.id,
        clickThroughUrl: formData.clickThroughUrl!,
        schedule: formData.schedule!,
        creative: selectedFile!
      };

      await createDirectUserAd(adData, advertiserId);
      onClose();
      resetForm();
    } catch (error) {
      console.error('Failed to create ad:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      clickThroughUrl: '',
      schedule: {
        startDate: new Date(),
        duration: 7
      }
    });
    setSelectedFile(null);
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!selectedZone) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Advertisement</DialogTitle>
          <DialogDescription>
            Create a new advertisement for the {selectedZone.name} zone
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Zone Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                {selectedZone.name}
                {selectedZone.pricing.isPremium && (
                  <Badge variant="default" className="bg-gradient-to-r from-yellow-400 to-orange-500">
                    Premium
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                {selectedZone.description} • {selectedZone.dimensions.width} × {selectedZone.dimensions.height}px
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Ad Details Form */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Ad Title *</Label>
              <Input
                id="title"
                value={formData.title || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter a compelling title for your ad"
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your offering (optional)"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="url">Click-through URL *</Label>
              <Input
                id="url"
                type="url"
                value={formData.clickThroughUrl || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, clickThroughUrl: e.target.value }))}
                placeholder="https://your-website.com"
                className={errors.clickThroughUrl ? 'border-red-500' : ''}
              />
              {errors.clickThroughUrl && (
                <p className="text-red-500 text-sm mt-1">{errors.clickThroughUrl}</p>
              )}
            </div>

            {/* Creative Upload */}
            <div>
              <Label htmlFor="creative">Ad Creative *</Label>
              <div className="mt-2">
                <label
                  htmlFor="creative"
                  className={cn(
                    "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors",
                    errors.creative ? 'border-red-500' : 'border-gray-300'
                  )}
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {selectedFile ? (
                      <>
                        <FileImage className="w-8 h-8 mb-2 text-green-500" />
                        <p className="text-sm text-gray-500">{selectedFile.name}</p>
                        <p className="text-xs text-gray-400">
                          {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB
                        </p>
                      </>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 mb-2 text-gray-400" />
                        <p className="text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span> your ad creative
                        </p>
                        <p className="text-xs text-gray-400">
                          {selectedZone.supportedFormats.join(', ').toUpperCase()} up to {selectedZone.maxFileSize}MB
                        </p>
                      </>
                    )}
                  </div>
                  <input
                    id="creative"
                    type="file"
                    className="hidden"
                    accept={selectedZone.supportedFormats.map(format => `.${format}`).join(',')}
                    onChange={handleFileUpload}
                  />
                </label>
              </div>
              {errors.creative && (
                <p className="text-red-500 text-sm mt-1">{errors.creative}</p>
              )}
            </div>
          </div>

          <Separator />

          {/* Schedule and Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Schedule */}
            <div className="space-y-4">
              <h3 className="font-semibold">Schedule</h3>
              
              <div>
                <Label>Start Date</Label>
                <Popover open={showCalendar} onOpenChange={setShowCalendar}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.schedule?.startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.schedule?.startDate ? (
                        format(formData.schedule.startDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.schedule?.startDate}
                      onSelect={(date) => {
                        if (date) {
                          setFormData(prev => ({
                            ...prev,
                            schedule: { ...prev.schedule!, startDate: date }
                          }));
                        }
                        setShowCalendar(false);
                      }}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label htmlFor="duration">Duration (days)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  value={formData.schedule?.duration || 7}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    schedule: { ...prev.schedule!, duration: parseInt(e.target.value) || 7 }
                  }))}
                  className={errors.duration ? 'border-red-500' : ''}
                />
                {errors.duration && (
                  <p className="text-red-500 text-sm mt-1">{errors.duration}</p>
                )}
              </div>
            </div>

            {/* Pricing */}
            <div className="space-y-4">
              <h3 className="font-semibold">Pricing</h3>
              
              <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Base price:</span>
                  <span className="font-semibold">
                    ${selectedZone.pricing.basePricePerDay}/day × {formData.schedule?.duration || 7} days
                  </span>
                </div>
                
                {savingsAmount > 0 && (
                  <div className="flex justify-between items-center text-green-600">
                    <span className="text-sm">Discount:</span>
                    <span className="font-semibold">-${savingsAmount}</span>
                  </div>
                )}
                
                <Separator />
                
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total:</span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    {totalCost}
                  </span>
                </div>
              </div>

              {savingsAmount > 0 && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    You save ${savingsAmount} with the {
                      (formData.schedule?.duration || 7) >= 30 
                        ? `${selectedZone.pricing.monthlyDiscount}% monthly`
                        : `${selectedZone.pricing.weeklyDiscount}% weekly`
                    } discount!
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          {/* Guidelines */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              All advertisements are subject to approval. Please ensure your content follows our 
              community guidelines. Inappropriate content will be rejected and refunded.
            </AlertDescription>
          </Alert>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting}
              className="flex-1 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4" />
                  Create Ad - ${totalCost}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 