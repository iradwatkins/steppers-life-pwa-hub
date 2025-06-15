import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Upload, X, Plus, Store, Clock, MapPin, Phone, Mail, Globe, Camera } from 'lucide-react';
import { useStoreDirectory } from '@/hooks/useStoreDirectory';
import { StoreSubmissionData, ContactInfo, Address, OperatingHours, StoreCategory } from '@/services/storeDirectoryService';
import { toast } from 'sonner';

interface StoreSubmissionFormProps {
  onSuccess?: (storeId: string) => void;
  editingStoreId?: string;
  initialData?: Partial<StoreSubmissionData>;
}

const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' }
];

export const StoreSubmissionForm: React.FC<StoreSubmissionFormProps> = ({
  onSuccess,
  editingStoreId,
  initialData
}) => {
  const { 
    categories, 
    submitStoreListing, 
    updateStoreListing, 
    searchCategories, 
    isSubmitting 
  } = useStoreDirectory();

  // Form state
  const [formData, setFormData] = useState<StoreSubmissionData>({
    name: '',
    description: '',
    categoryId: '',
    suggestedCategory: '',
    contactInfo: {
      email: '',
      phone: '',
      website: '',
      facebook: '',
      instagram: '',
      twitter: ''
    },
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'US',
      isOnlineOnly: false
    },
    operatingHours: {},
    tags: []
  });

  const [categorySearch, setCategorySearch] = useState('');
  const [filteredCategories, setFilteredCategories] = useState<StoreCategory[]>([]);
  const [showSuggestCategory, setShowSuggestCategory] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Load initial data if editing
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  // Filter categories based on search
  useEffect(() => {
    const filterCategories = async () => {
      if (categorySearch.trim()) {
        const filtered = await searchCategories(categorySearch);
        setFilteredCategories(filtered);
      } else {
        setFilteredCategories(categories);
      }
    };
    filterCategories();
  }, [categorySearch, categories, searchCategories]);

  // Validate form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = 'Store name is required';
    }

    if (!formData.description.trim()) {
      errors.description = 'Store description is required';
    }

    if (!formData.categoryId && !formData.suggestedCategory) {
      errors.category = 'Please select a category or suggest a new one';
    }

    if (!formData.address.city.trim()) {
      errors.city = 'City is required';
    }

    if (!formData.address.state.trim()) {
      errors.state = 'State is required';
    }

    if (formData.contactInfo.email && !/\S+@\S+\.\S+/.test(formData.contactInfo.email)) {
      errors.email = 'Please enter a valid email address';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    try {
      let result;
      if (editingStoreId) {
        result = await updateStoreListing(editingStoreId, formData);
      } else {
        result = await submitStoreListing(formData);
      }

      if (result && onSuccess) {
        onSuccess(result.id);
      }
    } catch (error) {
      console.error('Submission error:', error);
    }
  };

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const maxImages = 5;
    
    if (images.length + files.length > maxImages) {
      toast.error(`You can only upload up to ${maxImages} images`);
      return;
    }

    // Create preview URLs
    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    
    setImages(prev => [...prev, ...files]);
    setImagePreviewUrls(prev => [...prev, ...newPreviewUrls]);
  };

  // Remove image
  const removeImage = (index: number) => {
    const newImages = [...images];
    const newPreviews = [...imagePreviewUrls];
    
    // Revoke the URL to prevent memory leaks
    URL.revokeObjectURL(newPreviews[index]);
    
    newImages.splice(index, 1);
    newPreviews.splice(index, 1);
    
    setImages(newImages);
    setImagePreviewUrls(newPreviews);
  };

  // Add tag
  const addTag = () => {
    const tag = newTag.trim().toLowerCase();
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
      setNewTag('');
    }
  };

  // Remove tag
  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // Update operating hours
  const updateOperatingHours = (day: string, field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      operatingHours: {
        ...prev.operatingHours,
        [day]: {
          ...prev.operatingHours?.[day as keyof OperatingHours],
          [field]: value
        }
      }
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            Basic Information
          </CardTitle>
          <CardDescription>
            Tell us about your store or business
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="storeName">Store Name *</Label>
            <Input
              id="storeName"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter your store name"
              className={formErrors.name ? 'border-red-500' : ''}
            />
            {formErrors.name && (
              <p className="text-sm text-red-500 mt-1">{formErrors.name}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your store, products, and what makes it special..."
              rows={4}
              className={formErrors.description ? 'border-red-500' : ''}
            />
            {formErrors.description && (
              <p className="text-sm text-red-500 mt-1">{formErrors.description}</p>
            )}
          </div>

          {/* Category Selection */}
          <div>
            <Label>Category *</Label>
            <div className="space-y-2">
              <Input
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                placeholder="Search for a category..."
              />
              
              {filteredCategories.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                  {filteredCategories.map((category) => (
                    <Button
                      key={category.id}
                      type="button"
                      variant={formData.categoryId === category.id ? "default" : "outline"}
                      className="justify-start text-left h-auto p-2"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, categoryId: category.id }));
                        setShowSuggestCategory(false);
                      }}
                    >
                      <div>
                        <div className="font-medium">{category.name}</div>
                        <div className="text-xs text-muted-foreground">{category.description}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="suggestCategory"
                  checked={showSuggestCategory}
                  onCheckedChange={setShowSuggestCategory}
                />
                <Label htmlFor="suggestCategory">Suggest a new category</Label>
              </div>

              {showSuggestCategory && (
                <Input
                  value={formData.suggestedCategory || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    suggestedCategory: e.target.value,
                    categoryId: '' 
                  }))}
                  placeholder="Enter category name for admin review"
                />
              )}
            </div>
            {formErrors.category && (
              <p className="text-sm text-red-500 mt-1">{formErrors.category}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Contact Information
          </CardTitle>
          <CardDescription>
            How can customers reach you?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.contactInfo.email || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  contactInfo: { ...prev.contactInfo, email: e.target.value }
                }))}
                placeholder="contact@yourstore.com"
                className={formErrors.email ? 'border-red-500' : ''}
              />
              {formErrors.email && (
                <p className="text-sm text-red-500 mt-1">{formErrors.email}</p>
              )}
            </div>

            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.contactInfo.phone || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  contactInfo: { ...prev.contactInfo, phone: e.target.value }
                }))}
                placeholder="(555) 123-4567"
              />
            </div>

            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={formData.contactInfo.website || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  contactInfo: { ...prev.contactInfo, website: e.target.value }
                }))}
                placeholder="https://yourstore.com"
              />
            </div>

            <div>
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                id="instagram"
                value={formData.contactInfo.instagram || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  contactInfo: { ...prev.contactInfo, instagram: e.target.value }
                }))}
                placeholder="@yourstore"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Location
          </CardTitle>
          <CardDescription>
            Where can customers find you?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="onlineOnly"
              checked={formData.address.isOnlineOnly}
              onCheckedChange={(checked) => setFormData(prev => ({
                ...prev,
                address: { ...prev.address, isOnlineOnly: checked }
              }))}
            />
            <Label htmlFor="onlineOnly">Online-only business</Label>
          </div>

          {!formData.address.isOnlineOnly && (
            <div>
              <Label htmlFor="street">Street Address</Label>
              <Input
                id="street"
                value={formData.address.street || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  address: { ...prev.address, street: e.target.value }
                }))}
                placeholder="123 Main Street"
              />
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={formData.address.city}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  address: { ...prev.address, city: e.target.value }
                }))}
                placeholder="City"
                className={formErrors.city ? 'border-red-500' : ''}
              />
              {formErrors.city && (
                <p className="text-sm text-red-500 mt-1">{formErrors.city}</p>
              )}
            </div>

            <div>
              <Label htmlFor="state">State *</Label>
              <Input
                id="state"
                value={formData.address.state}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  address: { ...prev.address, state: e.target.value }
                }))}
                placeholder="State"
                className={formErrors.state ? 'border-red-500' : ''}
              />
              {formErrors.state && (
                <p className="text-sm text-red-500 mt-1">{formErrors.state}</p>
              )}
            </div>

            <div>
              <Label htmlFor="zipCode">ZIP Code</Label>
              <Input
                id="zipCode"
                value={formData.address.zipCode || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  address: { ...prev.address, zipCode: e.target.value }
                }))}
                placeholder="12345"
              />
            </div>

            <div>
              <Label htmlFor="country">Country</Label>
              <Select
                value={formData.address.country}
                onValueChange={(value) => setFormData(prev => ({
                  ...prev,
                  address: { ...prev.address, country: value }
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="US">United States</SelectItem>
                  <SelectItem value="CA">Canada</SelectItem>
                  <SelectItem value="UK">United Kingdom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Operating Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Operating Hours
          </CardTitle>
          <CardDescription>
            When are you open? (Optional)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {DAYS_OF_WEEK.map(({ key, label }) => (
            <div key={key} className="flex items-center space-x-4">
              <div className="w-24">
                <Label>{label}</Label>
              </div>
              <Checkbox
                checked={formData.operatingHours?.[key as keyof OperatingHours]?.closed || false}
                onCheckedChange={(checked) => updateOperatingHours(key, 'closed', checked)}
              />
              <Label className="text-sm">Closed</Label>
              
              {!formData.operatingHours?.[key as keyof OperatingHours]?.closed && (
                <>
                  <Input
                    type="time"
                    value={formData.operatingHours?.[key as keyof OperatingHours]?.open || ''}
                    onChange={(e) => updateOperatingHours(key, 'open', e.target.value)}
                    className="w-32"
                  />
                  <span>to</span>
                  <Input
                    type="time"
                    value={formData.operatingHours?.[key as keyof OperatingHours]?.close || ''}
                    onChange={(e) => updateOperatingHours(key, 'close', e.target.value)}
                    className="w-32"
                  />
                </>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Images */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Store Images
          </CardTitle>
          <CardDescription>
            Upload up to 5 images of your store (Optional)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {imagePreviewUrls.map((url, index) => (
              <div key={index} className="relative">
                <img
                  src={url}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 h-6 w-6 p-0"
                  onClick={() => removeImage(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            
            {images.length < 5 && (
              <Label
                htmlFor="images"
                className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400"
              >
                <Upload className="h-8 w-8 text-gray-400" />
                <span className="text-sm text-gray-500">Upload Image</span>
                <Input
                  id="images"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                />
              </Label>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tags */}
      <Card>
        <CardHeader>
          <CardTitle>Tags & Keywords</CardTitle>
          <CardDescription>
            Help customers find your store with relevant tags
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Enter a tag..."
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
            />
            <Button type="button" onClick={addTag}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {formData.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="cursor-pointer">
                {tag}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                  onClick={() => removeTag(tag)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="min-w-32"
        >
          {isSubmitting ? 'Submitting...' : editingStoreId ? 'Update Store' : 'Submit Store'}
        </Button>
      </div>
    </form>
  );
}; 