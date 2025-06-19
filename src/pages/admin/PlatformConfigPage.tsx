import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { 
  PlatformConfigService, 
  CreateCategoryData, 
  UpdateCategoryData,
  CreateSettingData,
  UpdateSettingData,
  CreatePickupLocationData,
  UpdatePickupLocationData,
  UpdateVodConfigData
} from '@/services/platformConfigService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  ArrowLeft,
  Tag,
  DollarSign,
  MapPin,
  Palette,
  GripVertical,
  Eye,
  EyeOff,
  Globe,
  CheckCircle,
  XCircle,
  Search,
  Filter
} from 'lucide-react';

interface PlatformCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  type: 'event' | 'class' | 'content';
  color_hex: string;
  icon_name: string | null;
  is_active: boolean;
  sort_order: number;
  parent_id: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

interface PlatformSetting {
  id: string;
  key: string;
  value: string;
  type: 'string' | 'number' | 'boolean' | 'json' | 'array';
  description: string | null;
  category: string;
  is_public: boolean;
  validation_rules: Record<string, any>;
  updated_at: string;
}

interface VodConfiguration {
  id: string;
  hosting_fee_amount: number;
  hosting_fee_currency: string;
  introductory_offer_enabled: boolean;
  introductory_offer_amount: number;
  introductory_offer_description: string | null;
  introductory_offer_expires_at: string | null;
  is_active: boolean;
  updated_at: string;
}

interface PickupLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip_code: string | null;
  country: string;
  phone: string | null;
  email: string | null;
  hours_of_operation: Record<string, string> | null;
  special_instructions: string | null;
  is_active: boolean;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  updated_at: string;
}

interface CategoryFilters {
  type?: 'event' | 'class' | 'content';
  isActive?: boolean;
  search?: string;
}

interface SettingFilters {
  category?: string;
  isPublic?: boolean;
  search?: string;
}

function PlatformConfigPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // State management
  const [categories, setCategories] = useState<PlatformCategory[]>([]);
  const [settings, setSettings] = useState<PlatformSetting[]>([]);
  const [vodConfig, setVodConfig] = useState<VodConfiguration | null>(null);
  const [pickupLocations, setPickupLocations] = useState<PickupLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('categories');
  
  // Drag and drop state
  const [draggedCategory, setDraggedCategory] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  
  // Dialog states
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [showSettingDialog, setShowSettingDialog] = useState(false);
  const [showPickupDialog, setShowPickupDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<PlatformCategory | null>(null);
  const [editingSetting, setEditingSetting] = useState<PlatformSetting | null>(null);
  const [editingPickup, setEditingPickup] = useState<PickupLocation | null>(null);
  
  // Filter states
  const [categoryFilters, setCategoryFilters] = useState<CategoryFilters>({});
  const [settingFilters, setSettingFilters] = useState<SettingFilters>({});
  
  // Form states
  const [categoryForm, setCategoryForm] = useState<CreateCategoryData>({
    name: '',
    slug: '',
    description: '',
    type: 'event',
    colorHex: '#3B82F6',
    iconName: ''
  });
  
  const [settingForm, setSettingForm] = useState<CreateSettingData>({
    key: '',
    value: '',
    type: 'string',
    description: '',
    category: 'general',
    isPublic: false
  });
  
  const [pickupForm, setPickupForm] = useState<CreatePickupLocationData>({
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    email: '',
    specialInstructions: ''
  });
  
  const [vodForm, setVodForm] = useState<UpdateVodConfigData>({
    hostingFeeAmount: 5.00,
    hostingFeeCurrency: 'USD',
    introductoryOfferEnabled: false,
    introductoryOfferAmount: 0.00,
    introductoryOfferDescription: ''
  });
  
  // Check admin access
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    // Only allow admin and super_admin users
    if (!user.user_metadata?.role || !['admin', 'super_admin'].includes(user.user_metadata.role)) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page.",
        variant: "destructive",
      });
      navigate('/');
      return;
    }
    
    loadAllData();
  }, [user, navigate, toast]);
  
  // Load all configuration data
  const loadAllData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        loadCategories(),
        loadSettings(),
        loadVodConfiguration(),
        loadPickupLocations()
      ]);
    } catch (error) {
      console.error('Error loading platform configuration:', error);
      toast({
        title: "Error",
        description: "Failed to load platform configuration",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load categories
  const loadCategories = async () => {
    try {
      const data = await PlatformConfigService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
      throw error;
    }
  };
  
  // Load settings
  const loadSettings = async () => {
    try {
      const data = await PlatformConfigService.getSettings();
      setSettings(data);
    } catch (error) {
      console.error('Error loading settings:', error);
      throw error;
    }
  };
  
  // Load VOD configuration
  const loadVodConfiguration = async () => {
    try {
      const data = await PlatformConfigService.getVodConfiguration();
      if (data) {
        setVodConfig(data);
        setVodForm({
          hostingFeeAmount: data.hosting_fee_amount,
          hostingFeeCurrency: data.hosting_fee_currency,
          introductoryOfferEnabled: data.introductory_offer_enabled,
          introductoryOfferAmount: data.introductory_offer_amount,
          introductoryOfferDescription: data.introductory_offer_description || ''
        });
      }
    } catch (error) {
      console.error('Error loading VOD configuration:', error);
      throw error;
    }
  };
  
  // Load pickup locations
  const loadPickupLocations = async () => {
    try {
      const data = await PlatformConfigService.getPickupLocations();
      setPickupLocations(data);
    } catch (error) {
      console.error('Error loading pickup locations:', error);
      throw error;
    }
  };
  
  // Category management functions
  const handleCreateCategory = async () => {
    const validationError = validateCategoryForm();
    if (validationError) {
      toast({
        title: "Validation Error",
        description: validationError,
        variant: "destructive",
      });
      return;
    }
    
    try {
      await PlatformConfigService.createCategory(categoryForm);
      toast({
        title: "Success",
        description: "Category created successfully",
      });
      await loadCategories();
      setShowCategoryDialog(false);
      resetCategoryForm();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create category",
        variant: "destructive",
      });
    }
  };
  
  const handleUpdateCategory = async () => {
    if (!editingCategory) return;
    
    const validationError = validateCategoryForm();
    if (validationError) {
      toast({
        title: "Validation Error",
        description: validationError,
        variant: "destructive",
      });
      return;
    }
    
    try {
      const updateData: UpdateCategoryData = {
        name: categoryForm.name,
        slug: categoryForm.slug,
        description: categoryForm.description,
        colorHex: categoryForm.colorHex,
        iconName: categoryForm.iconName
      };
      
      await PlatformConfigService.updateCategory(editingCategory.id, updateData);
      toast({
        title: "Success",
        description: "Category updated successfully",
      });
      await loadCategories();
      setShowCategoryDialog(false);
      setEditingCategory(null);
      resetCategoryForm();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update category",
        variant: "destructive",
      });
    }
  };
  
  const handleDeleteCategory = async (categoryId: string) => {
    try {
      await PlatformConfigService.deleteCategory(categoryId);
      toast({
        title: "Success",
        description: "Category deleted successfully",
      });
      await loadCategories();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete category",
        variant: "destructive",
      });
    }
  };
  
  const handleToggleCategoryStatus = async (category: PlatformCategory) => {
    try {
      await PlatformConfigService.updateCategory(category.id, {
        isActive: !category.is_active
      });
      toast({
        title: "Success",
        description: `Category ${category.is_active ? 'deactivated' : 'activated'} successfully`,
      });
      await loadCategories();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update category status",
        variant: "destructive",
      });
    }
  };
  
  // Setting management functions
  const handleCreateSetting = async () => {
    const validationError = validateSettingForm();
    if (validationError) {
      toast({
        title: "Validation Error",
        description: validationError,
        variant: "destructive",
      });
      return;
    }
    
    try {
      await PlatformConfigService.createSetting(settingForm);
      toast({
        title: "Success",
        description: "Setting created successfully",
      });
      await loadSettings();
      setShowSettingDialog(false);
      resetSettingForm();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create setting",
        variant: "destructive",
      });
    }
  };
  
  const handleUpdateSetting = async () => {
    if (!editingSetting) return;
    
    try {
      const updateData: UpdateSettingData = {
        value: settingForm.value,
        type: settingForm.type,
        description: settingForm.description,
        category: settingForm.category,
        isPublic: settingForm.isPublic
      };
      
      await PlatformConfigService.updateSetting(editingSetting.key, updateData);
      toast({
        title: "Success",
        description: "Setting updated successfully",
      });
      await loadSettings();
      setShowSettingDialog(false);
      setEditingSetting(null);
      resetSettingForm();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update setting",
        variant: "destructive",
      });
    }
  };
  
  const handleDeleteSetting = async (settingKey: string) => {
    try {
      await PlatformConfigService.deleteSetting(settingKey);
      toast({
        title: "Success",
        description: "Setting deleted successfully",
      });
      await loadSettings();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete setting",
        variant: "destructive",
      });
    }
  };
  
  // VOD configuration functions
  const handleUpdateVodConfig = async () => {
    try {
      await PlatformConfigService.updateVodConfiguration(vodForm);
      toast({
        title: "Success",
        description: "VOD configuration updated successfully",
      });
      await loadVodConfiguration();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update VOD configuration",
        variant: "destructive",
      });
    }
  };
  
  // Pickup location functions
  const handleCreatePickupLocation = async () => {
    try {
      await PlatformConfigService.createPickupLocation(pickupForm);
      toast({
        title: "Success",
        description: "Pickup location created successfully",
      });
      await loadPickupLocations();
      setShowPickupDialog(false);
      resetPickupForm();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create pickup location",
        variant: "destructive",
      });
    }
  };
  
  const handleUpdatePickupLocation = async () => {
    if (!editingPickup) return;
    
    try {
      const updateData: UpdatePickupLocationData = {
        name: pickupForm.name,
        address: pickupForm.address,
        city: pickupForm.city,
        state: pickupForm.state,
        zipCode: pickupForm.zipCode,
        phone: pickupForm.phone,
        email: pickupForm.email,
        specialInstructions: pickupForm.specialInstructions
      };
      
      await PlatformConfigService.updatePickupLocation(editingPickup.id, updateData);
      toast({
        title: "Success",
        description: "Pickup location updated successfully",
      });
      await loadPickupLocations();
      setShowPickupDialog(false);
      setEditingPickup(null);
      resetPickupForm();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update pickup location",
        variant: "destructive",
      });
    }
  };
  
  const handleDeletePickupLocation = async (locationId: string) => {
    try {
      await PlatformConfigService.deletePickupLocation(locationId);
      toast({
        title: "Success",
        description: "Pickup location deleted successfully",
      });
      await loadPickupLocations();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete pickup location",
        variant: "destructive",
      });
    }
  };
  
  const handleTogglePickupStatus = async (location: PickupLocation) => {
    try {
      await PlatformConfigService.updatePickupLocation(location.id, {
        isActive: !location.is_active
      });
      toast({
        title: "Success",
        description: `Pickup location ${location.is_active ? 'deactivated' : 'activated'} successfully`,
      });
      await loadPickupLocations();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update pickup location status",
        variant: "destructive",
      });
    }
  };
  
  // Form reset functions
  const resetCategoryForm = () => {
    setCategoryForm({
      name: '',
      slug: '',
      description: '',
      type: 'event',
      colorHex: '#3B82F6',
      iconName: ''
    });
  };
  
  const resetSettingForm = () => {
    setSettingForm({
      key: '',
      value: '',
      type: 'string',
      description: '',
      category: 'general',
      isPublic: false
    });
  };
  
  const resetPickupForm = () => {
    setPickupForm({
      name: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      phone: '',
      email: '',
      specialInstructions: ''
    });
  };
  
  // Edit handlers
  const handleEditCategory = (category: PlatformCategory) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      type: category.type,
      colorHex: category.color_hex,
      iconName: category.icon_name || ''
    });
    setShowCategoryDialog(true);
  };
  
  const handleEditSetting = (setting: PlatformSetting) => {
    setEditingSetting(setting);
    setSettingForm({
      key: setting.key,
      value: setting.value,
      type: setting.type,
      description: setting.description || '',
      category: setting.category,
      isPublic: setting.is_public
    });
    setShowSettingDialog(true);
  };
  
  const handleEditPickupLocation = (location: PickupLocation) => {
    setEditingPickup(location);
    setPickupForm({
      name: location.name,
      address: location.address,
      city: location.city,
      state: location.state,
      zipCode: location.zip_code || '',
      phone: location.phone || '',
      email: location.email || '',
      specialInstructions: location.special_instructions || ''
    });
    setShowPickupDialog(true);
  };
  
  // Auto-generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };
  
  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, categoryId: string) => {
    setDraggedCategory(categoryId);
    e.dataTransfer.effectAllowed = 'move';
  };
  
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };
  
  const handleDragLeave = () => {
    setDragOverIndex(null);
  };
  
  const handleDrop = async (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    
    if (!draggedCategory) return;
    
    const draggedIndex = filteredCategories.findIndex(cat => cat.id === draggedCategory);
    if (draggedIndex === -1 || draggedIndex === targetIndex) {
      setDraggedCategory(null);
      setDragOverIndex(null);
      return;
    }
    
    // Create new order
    const reorderedCategories = [...filteredCategories];
    const draggedItem = reorderedCategories[draggedIndex];
    reorderedCategories.splice(draggedIndex, 1);
    reorderedCategories.splice(targetIndex, 0, draggedItem);
    
    // Update sort order
    const categoryIds = reorderedCategories.map(cat => cat.id);
    
    try {
      await PlatformConfigService.reorderCategories(categoryIds);
      toast({
        title: "Success",
        description: "Categories reordered successfully",
      });
      await loadCategories();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to reorder categories",
        variant: "destructive",
      });
    }
    
    setDraggedCategory(null);
    setDragOverIndex(null);
  };
  
  const handleDragEnd = () => {
    setDraggedCategory(null);
    setDragOverIndex(null);
  };
  
  // Validation functions
  const validateCategoryForm = (): string | null => {
    if (!categoryForm.name.trim()) return "Category name is required";
    if (!categoryForm.slug.trim()) return "Category slug is required";
    if (categoryForm.slug.includes(' ')) return "Category slug cannot contain spaces";
    if (!categoryForm.type) return "Category type is required";
    if (categoryForm.colorHex && !/^#[0-9A-F]{6}$/i.test(categoryForm.colorHex)) {
      return "Color must be a valid hex code (e.g., #3B82F6)";
    }
    return null;
  };
  
  const validateSettingForm = (): string | null => {
    if (!settingForm.key.trim()) return "Setting key is required";
    if (!settingForm.value.trim()) return "Setting value is required";
    if (settingForm.key.includes(' ')) return "Setting key cannot contain spaces";
    if (settingForm.type === 'number' && isNaN(Number(settingForm.value))) {
      return "Value must be a valid number for number type";
    }
    if (settingForm.type === 'boolean' && !['true', 'false'].includes(settingForm.value.toLowerCase())) {
      return "Value must be 'true' or 'false' for boolean type";
    }
    if (settingForm.type === 'json') {
      try {
        JSON.parse(settingForm.value);
      } catch {
        return "Value must be valid JSON for json type";
      }
    }
    return null;
  };
  
  const validatePickupForm = (): string | null => {
    if (!pickupForm.name.trim()) return "Location name is required";
    if (!pickupForm.address.trim()) return "Address is required";
    if (!pickupForm.city.trim()) return "City is required";
    if (!pickupForm.state.trim()) return "State is required";
    if (pickupForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(pickupForm.email)) {
      return "Invalid email format";
    }
    return null;
  };
  
  const validateVodForm = (): string | null => {
    if (vodForm.hostingFeeAmount === undefined || vodForm.hostingFeeAmount < 0) {
      return "Hosting fee must be a positive number";
    }
    if (vodForm.introductoryOfferEnabled && (vodForm.introductoryOfferAmount === undefined || vodForm.introductoryOfferAmount < 0)) {
      return "Introductory offer amount must be a positive number";
    }
    return null;
  };
  
  // Filter functions
  const filteredCategories = categories.filter(category => {
    if (categoryFilters.type && category.type !== categoryFilters.type) return false;
    if (categoryFilters.isActive !== undefined && category.is_active !== categoryFilters.isActive) return false;
    if (categoryFilters.search && !category.name.toLowerCase().includes(categoryFilters.search.toLowerCase())) return false;
    return true;
  });
  
  const filteredSettings = settings.filter(setting => {
    if (settingFilters.category && setting.category !== settingFilters.category) return false;
    if (settingFilters.isPublic !== undefined && setting.is_public !== settingFilters.isPublic) return false;
    if (settingFilters.search && !setting.key.toLowerCase().includes(settingFilters.search.toLowerCase())) return false;
    return true;
  });
  
  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading platform configuration...</div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/admin')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Admin</span>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Platform Configuration</h1>
            <p className="text-muted-foreground">Manage categories, settings, and platform configuration</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Settings className="h-6 w-6 text-muted-foreground" />
        </div>
      </div>
      
      {/* Configuration Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="categories" className="flex items-center space-x-2">
            <Tag className="h-4 w-4" />
            <span>Categories</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Site Settings</span>
          </TabsTrigger>
          <TabsTrigger value="vod" className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4" />
            <span>VOD Config</span>
          </TabsTrigger>
          <TabsTrigger value="pickup" className="flex items-center space-x-2">
            <MapPin className="h-4 w-4" />
            <span>Pickup Locations</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <Tag className="h-5 w-5" />
                    <span>Category Management</span>
                  </CardTitle>
                  <CardDescription>
                    Manage event and class categories with drag-and-drop reordering
                  </CardDescription>
                </div>
                <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
                  <DialogTrigger asChild>
                    <Button 
                      onClick={() => {
                        setEditingCategory(null);
                        resetCategoryForm();
                      }}
                      className="flex items-center space-x-2"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add Category</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>
                        {editingCategory ? 'Edit Category' : 'Create Category'}
                      </DialogTitle>
                      <DialogDescription>
                        {editingCategory ? 'Update category details' : 'Add a new category for events or classes'}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="categoryName">Name</Label>
                        <Input
                          id="categoryName"
                          value={categoryForm.name}
                          onChange={(e) => {
                            const name = e.target.value;
                            setCategoryForm(prev => ({
                              ...prev,
                              name,
                              slug: generateSlug(name)
                            }));
                          }}
                          placeholder="Category name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="categorySlug">Slug</Label>
                        <Input
                          id="categorySlug"
                          value={categoryForm.slug}
                          onChange={(e) => setCategoryForm(prev => ({ ...prev, slug: e.target.value }))}
                          placeholder="category-slug"
                        />
                      </div>
                      <div>
                        <Label htmlFor="categoryType">Type</Label>
                        <Select 
                          value={categoryForm.type} 
                          onValueChange={(value: 'event' | 'class' | 'content') => 
                            setCategoryForm(prev => ({ ...prev, type: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="event">Event</SelectItem>
                            <SelectItem value="class">Class</SelectItem>
                            <SelectItem value="content">Content</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="categoryDescription">Description</Label>
                        <Textarea
                          id="categoryDescription"
                          value={categoryForm.description}
                          onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Category description"
                          rows={3}
                        />
                      </div>
                      <div className="flex space-x-4">
                        <div className="flex-1">
                          <Label htmlFor="categoryColor">Color</Label>
                          <div className="flex items-center space-x-2">
                            <Input
                              id="categoryColor"
                              type="color"
                              value={categoryForm.colorHex}
                              onChange={(e) => setCategoryForm(prev => ({ ...prev, colorHex: e.target.value }))}
                              className="w-12 h-8 p-1 border rounded"
                            />
                            <Input
                              value={categoryForm.colorHex}
                              onChange={(e) => setCategoryForm(prev => ({ ...prev, colorHex: e.target.value }))}
                              placeholder="#3B82F6"
                              className="flex-1"
                            />
                          </div>
                        </div>
                        <div className="flex-1">
                          <Label htmlFor="categoryIcon">Icon</Label>
                          <Input
                            id="categoryIcon"
                            value={categoryForm.iconName}
                            onChange={(e) => setCategoryForm(prev => ({ ...prev, iconName: e.target.value }))}
                            placeholder="music, users, heart"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setShowCategoryDialog(false);
                            setEditingCategory(null);
                            resetCategoryForm();
                          }}
                        >
                          Cancel
                        </Button>
                        <Button 
                          onClick={editingCategory ? handleUpdateCategory : handleCreateCategory}
                          className="flex items-center space-x-2"
                        >
                          <Save className="h-4 w-4" />
                          <span>{editingCategory ? 'Update' : 'Create'}</span>
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {/* Category filters */}
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search categories..."
                    value={categoryFilters.search || ''}
                    onChange={(e) => setCategoryFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="w-64"
                  />
                </div>
                <Select 
                  value={categoryFilters.type || 'all'} 
                  onValueChange={(value) => 
                    setCategoryFilters(prev => ({ 
                      ...prev, 
                      type: value === 'all' ? undefined : value as 'event' | 'class' | 'content'
                    }))
                  }
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="event">Events</SelectItem>
                    <SelectItem value="class">Classes</SelectItem>
                    <SelectItem value="content">Content</SelectItem>
                  </SelectContent>
                </Select>
                <Select 
                  value={categoryFilters.isActive === undefined ? 'all' : categoryFilters.isActive.toString()} 
                  onValueChange={(value) => 
                    setCategoryFilters(prev => ({ 
                      ...prev, 
                      isActive: value === 'all' ? undefined : value === 'true'
                    }))
                  }
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Categories table */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8"></TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Color</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sort Order</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategories.map((category, index) => (
                    <TableRow 
                      key={category.id}
                      className={`
                        ${draggedCategory === category.id ? 'opacity-50' : ''}
                        ${dragOverIndex === index ? 'border-t-2 border-primary' : ''}
                        transition-all duration-150
                      `}
                      draggable
                      onDragStart={(e) => handleDragStart(e, category.id)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, index)}
                      onDragEnd={handleDragEnd}
                    >
                      <TableCell>
                        <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{category.name}</div>
                          <div className="text-sm text-muted-foreground">{category.slug}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {category.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-4 h-4 rounded border"
                            style={{ backgroundColor: category.color_hex }}
                          />
                          <span className="text-sm">{category.color_hex}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={category.is_active}
                            onCheckedChange={() => handleToggleCategoryStatus(category)}
                          />
                          <Badge variant={category.is_active ? "default" : "secondary"}>
                            {category.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>{category.sort_order}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditCategory(category)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Category</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{category.name}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteCategory(category.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {filteredCategories.length === 0 && (
                <div className="text-center py-8">
                  <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No categories found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="h-5 w-5" />
                    <span>Site Settings</span>
                  </CardTitle>
                  <CardDescription>
                    Manage platform-wide settings and configuration
                  </CardDescription>
                </div>
                <Dialog open={showSettingDialog} onOpenChange={setShowSettingDialog}>
                  <DialogTrigger asChild>
                    <Button 
                      onClick={() => {
                        setEditingSetting(null);
                        resetSettingForm();
                      }}
                      className="flex items-center space-x-2"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add Setting</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>
                        {editingSetting ? 'Edit Setting' : 'Create Setting'}
                      </DialogTitle>
                      <DialogDescription>
                        {editingSetting ? 'Update setting details' : 'Add a new platform setting'}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="settingKey">Key</Label>
                        <Input
                          id="settingKey"
                          value={settingForm.key}
                          onChange={(e) => setSettingForm(prev => ({ ...prev, key: e.target.value }))}
                          placeholder="setting_key"
                          disabled={!!editingSetting}
                        />
                      </div>
                      <div>
                        <Label htmlFor="settingValue">Value</Label>
                        <Textarea
                          id="settingValue"
                          value={settingForm.value}
                          onChange={(e) => setSettingForm(prev => ({ ...prev, value: e.target.value }))}
                          placeholder="Setting value"
                          rows={3}
                        />
                      </div>
                      <div className="flex space-x-4">
                        <div className="flex-1">
                          <Label htmlFor="settingType">Type</Label>
                          <Select 
                            value={settingForm.type} 
                            onValueChange={(value: any) => setSettingForm(prev => ({ ...prev, type: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="string">String</SelectItem>
                              <SelectItem value="number">Number</SelectItem>
                              <SelectItem value="boolean">Boolean</SelectItem>
                              <SelectItem value="json">JSON</SelectItem>
                              <SelectItem value="array">Array</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex-1">
                          <Label htmlFor="settingCategory">Category</Label>
                          <Input
                            id="settingCategory"
                            value={settingForm.category}
                            onChange={(e) => setSettingForm(prev => ({ ...prev, category: e.target.value }))}
                            placeholder="general"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="settingDescription">Description</Label>
                        <Textarea
                          id="settingDescription"
                          value={settingForm.description}
                          onChange={(e) => setSettingForm(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Setting description"
                          rows={2}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={settingForm.isPublic}
                          onCheckedChange={(checked) => setSettingForm(prev => ({ ...prev, isPublic: checked }))}
                        />
                        <Label>Public (visible to non-admin users)</Label>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setShowSettingDialog(false);
                            setEditingSetting(null);
                            resetSettingForm();
                          }}
                        >
                          Cancel
                        </Button>
                        <Button 
                          onClick={editingSetting ? handleUpdateSetting : handleCreateSetting}
                          className="flex items-center space-x-2"
                        >
                          <Save className="h-4 w-4" />
                          <span>{editingSetting ? 'Update' : 'Create'}</span>
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {/* Setting filters */}
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search settings..."
                    value={settingFilters.search || ''}
                    onChange={(e) => setSettingFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="w-64"
                  />
                </div>
                <Select 
                  value={settingFilters.isPublic === undefined ? 'all' : settingFilters.isPublic.toString()} 
                  onValueChange={(value) => 
                    setSettingFilters(prev => ({ 
                      ...prev, 
                      isPublic: value === 'all' ? undefined : value === 'true'
                    }))
                  }
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Visibility</SelectItem>
                    <SelectItem value="true">Public</SelectItem>
                    <SelectItem value="false">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Settings table */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Key</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Visibility</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSettings.map((setting) => (
                    <TableRow key={setting.key}>
                      <TableCell>
                        <div className="font-medium">{setting.key}</div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate text-sm">
                          {setting.value}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {setting.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {setting.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {setting.is_public ? (
                            <Eye className="h-4 w-4 text-green-600" />
                          ) : (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          )}
                          <Badge variant={setting.is_public ? "default" : "secondary"}>
                            {setting.is_public ? 'Public' : 'Private'}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditSetting(setting)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Setting</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{setting.key}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteSetting(setting.key)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {filteredSettings.length === 0 && (
                <div className="text-center py-8">
                  <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No settings found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* VOD Configuration Tab */}
        <TabsContent value="vod" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <span>VOD Hosting Configuration</span>
              </CardTitle>
              <CardDescription>
                Configure video-on-demand hosting fees and promotional offers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="hostingFee">Hosting Fee Amount</Label>
                    <div className="flex items-center space-x-2">
                      <Select 
                        value={vodForm.hostingFeeCurrency} 
                        onValueChange={(value) => setVodForm(prev => ({ ...prev, hostingFeeCurrency: value }))}
                      >
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="GBP">GBP</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        id="hostingFee"
                        type="number"
                        step="0.01"
                        value={vodForm.hostingFeeAmount}
                        onChange={(e) => setVodForm(prev => ({ ...prev, hostingFeeAmount: parseFloat(e.target.value) || 0 }))}
                        placeholder="5.00"
                        className="flex-1"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={vodForm.introductoryOfferEnabled}
                      onCheckedChange={(checked) => setVodForm(prev => ({ ...prev, introductoryOfferEnabled: checked }))}
                    />
                    <Label>Enable Introductory Offer</Label>
                  </div>
                </div>
                
                {vodForm.introductoryOfferEnabled && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="offerAmount">Offer Amount</Label>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">{vodForm.hostingFeeCurrency}</span>
                        <Input
                          id="offerAmount"
                          type="number"
                          step="0.01"
                          value={vodForm.introductoryOfferAmount}
                          onChange={(e) => setVodForm(prev => ({ ...prev, introductoryOfferAmount: parseFloat(e.target.value) || 0 }))}
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="offerDescription">Offer Description</Label>
                      <Textarea
                        id="offerDescription"
                        value={vodForm.introductoryOfferDescription}
                        onChange={(e) => setVodForm(prev => ({ ...prev, introductoryOfferDescription: e.target.value }))}
                        placeholder="Free hosting for your first 3 months!"
                        rows={3}
                      />
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end">
                <Button 
                  onClick={handleUpdateVodConfig}
                  className="flex items-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>Update VOD Configuration</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Pickup Locations Tab */}
        <TabsContent value="pickup" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <MapPin className="h-5 w-5" />
                    <span>Pickup Locations</span>
                  </CardTitle>
                  <CardDescription>
                    Manage physical store pickup locations for merchandise
                  </CardDescription>
                </div>
                <Dialog open={showPickupDialog} onOpenChange={setShowPickupDialog}>
                  <DialogTrigger asChild>
                    <Button 
                      onClick={() => {
                        setEditingPickup(null);
                        resetPickupForm();
                      }}
                      className="flex items-center space-x-2"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add Location</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>
                        {editingPickup ? 'Edit Pickup Location' : 'Create Pickup Location'}
                      </DialogTitle>
                      <DialogDescription>
                        {editingPickup ? 'Update pickup location details' : 'Add a new pickup location for merchandise'}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="locationName">Location Name</Label>
                        <Input
                          id="locationName"
                          value={pickupForm.name}
                          onChange={(e) => setPickupForm(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Store or location name"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="locationAddress">Address</Label>
                        <Input
                          id="locationAddress"
                          value={pickupForm.address}
                          onChange={(e) => setPickupForm(prev => ({ ...prev, address: e.target.value }))}
                          placeholder="Street address"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="locationCity">City</Label>
                          <Input
                            id="locationCity"
                            value={pickupForm.city}
                            onChange={(e) => setPickupForm(prev => ({ ...prev, city: e.target.value }))}
                            placeholder="City"
                          />
                        </div>
                        <div>
                          <Label htmlFor="locationState">State</Label>
                          <Input
                            id="locationState"
                            value={pickupForm.state}
                            onChange={(e) => setPickupForm(prev => ({ ...prev, state: e.target.value }))}
                            placeholder="State"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="locationZip">ZIP Code</Label>
                          <Input
                            id="locationZip"
                            value={pickupForm.zipCode}
                            onChange={(e) => setPickupForm(prev => ({ ...prev, zipCode: e.target.value }))}
                            placeholder="ZIP Code"
                          />
                        </div>
                        <div>
                          <Label htmlFor="locationPhone">Phone</Label>
                          <Input
                            id="locationPhone"
                            value={pickupForm.phone}
                            onChange={(e) => setPickupForm(prev => ({ ...prev, phone: e.target.value }))}
                            placeholder="Phone number"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="locationEmail">Email</Label>
                        <Input
                          id="locationEmail"
                          type="email"
                          value={pickupForm.email}
                          onChange={(e) => setPickupForm(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="Contact email"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="locationInstructions">Special Instructions</Label>
                        <Textarea
                          id="locationInstructions"
                          value={pickupForm.specialInstructions}
                          onChange={(e) => setPickupForm(prev => ({ ...prev, specialInstructions: e.target.value }))}
                          placeholder="Special pickup instructions..."
                          rows={3}
                        />
                      </div>
                      
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setShowPickupDialog(false);
                            setEditingPickup(null);
                            resetPickupForm();
                          }}
                        >
                          Cancel
                        </Button>
                        <Button 
                          onClick={editingPickup ? handleUpdatePickupLocation : handleCreatePickupLocation}
                          className="flex items-center space-x-2"
                        >
                          <Save className="h-4 w-4" />
                          <span>{editingPickup ? 'Update' : 'Create'}</span>
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {/* Pickup locations table */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pickupLocations.map((location) => (
                    <TableRow key={location.id}>
                      <TableCell>
                        <div className="font-medium">{location.name}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{location.address}</div>
                          <div className="text-muted-foreground">
                            {location.city}, {location.state} {location.zip_code}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {location.phone && <div>{location.phone}</div>}
                          {location.email && <div>{location.email}</div>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={location.is_active}
                            onCheckedChange={() => handleTogglePickupStatus(location)}
                          />
                          <Badge variant={location.is_active ? "default" : "secondary"}>
                            {location.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditPickupLocation(location)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Pickup Location</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{location.name}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeletePickupLocation(location.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {pickupLocations.length === 0 && (
                <div className="text-center py-8">
                  <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No pickup locations found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default PlatformConfigPage;