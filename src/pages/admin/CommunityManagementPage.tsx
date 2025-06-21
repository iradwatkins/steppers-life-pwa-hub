import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { communityService } from '@/services/communityService';
import { 
  Store, 
  Briefcase, 
  Plus, 
  Edit, 
  Trash2, 
  Check, 
  X, 
  Flag, 
  Eye,
  Star,
  MessageCircle,
  Clock,
  Shield,
  Award,
  Settings,
  Users,
  AlertCircle
} from 'lucide-react';
import type { 
  Store as StoreType, 
  Service, 
  StoreCategory, 
  ServiceCategory, 
  CategorySuggestion,
  UserReview,
  UserComment,
  CommunityStats
} from '@/types/community';

const categoryFormSchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters'),
  slug: z.string().min(2, 'Slug must be at least 2 characters'),
  description: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  sort_order: z.number().min(0),
  is_active: z.boolean().default(true)
});

type CategoryFormData = z.infer<typeof categoryFormSchema>;

const CommunityManagementPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<CommunityStats | null>(null);
  const [pendingStores, setPendingStores] = useState<StoreType[]>([]);
  const [pendingServices, setPendingServices] = useState<Service[]>([]);
  const [storeCategories, setStoreCategories] = useState<StoreCategory[]>([]);
  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>([]);
  const [categorySuggestions, setCategorySuggestions] = useState<CategorySuggestion[]>([]);
  const [pendingReviews, setPendingReviews] = useState<UserReview[]>([]);
  const [pendingComments, setPendingComments] = useState<UserComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<StoreCategory | ServiceCategory | null>(null);
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [categoryType, setCategoryType] = useState<'store' | 'service'>('store');

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      icon: '',
      color: '',
      sort_order: 0,
      is_active: true
    }
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [
        statsResult,
        storeCatsResult,
        serviceCatsResult,
        suggestionsResult
      ] = await Promise.all([
        communityService.getCommunityStats(),
        communityService.getStoreCategories(),
        communityService.getServiceCategories(),
        communityService.getCategorySuggestions()
      ]);

      if (statsResult.success) setStats(statsResult.data!);
      if (storeCatsResult.success) setStoreCategories(storeCatsResult.data || []);
      if (serviceCatsResult.success) setServiceCategories(serviceCatsResult.data || []);
      if (suggestionsResult.success) setCategorySuggestions(suggestionsResult.data || []);

      // Load pending items
      await loadPendingItems();
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load community data');
    } finally {
      setLoading(false);
    }
  };

  const loadPendingItems = async () => {
    try {
      // These would be filtered API calls for pending items
      const [storesResult, servicesResult] = await Promise.all([
        communityService.getStores({ limit: 50 }),
        communityService.getServices({ limit: 50 })
      ]);

      if (storesResult.success) {
        setPendingStores((storesResult.data || []).filter(s => s.status === 'pending'));
      }
      if (servicesResult.success) {
        setPendingServices((servicesResult.data || []).filter(s => s.status === 'pending'));
      }
    } catch (error) {
      console.error('Failed to load pending items:', error);
    }
  };

  const handleApproveStore = async (storeId: string) => {
    try {
      const result = await communityService.approveStore(storeId);
      if (result.success) {
        toast.success('Store approved');
        loadPendingItems();
      } else {
        toast.error(result.error || 'Failed to approve store');
      }
    } catch (error) {
      console.error('Error approving store:', error);
      toast.error('Failed to approve store');
    }
  };

  const handleRejectStore = async (storeId: string, reason: string) => {
    try {
      const result = await communityService.rejectStore(storeId, reason);
      if (result.success) {
        toast.success('Store rejected');
        loadPendingItems();
      } else {
        toast.error(result.error || 'Failed to reject store');
      }
    } catch (error) {
      console.error('Error rejecting store:', error);
      toast.error('Failed to reject store');
    }
  };

  const handleApproveService = async (serviceId: string) => {
    try {
      const result = await communityService.approveService(serviceId);
      if (result.success) {
        toast.success('Service approved');
        loadPendingItems();
      } else {
        toast.error(result.error || 'Failed to approve service');
      }
    } catch (error) {
      console.error('Error approving service:', error);
      toast.error('Failed to approve service');
    }
  };

  const handleRejectService = async (serviceId: string, reason: string) => {
    try {
      const result = await communityService.rejectService(serviceId, reason);
      if (result.success) {
        toast.success('Service rejected');
        loadPendingItems();
      } else {
        toast.error(result.error || 'Failed to reject service');
      }
    } catch (error) {
      console.error('Error rejecting service:', error);
      toast.error('Failed to reject service');
    }
  };

  const handleApproveCategorySuggestion = async (id: string) => {
    try {
      const result = await communityService.approveCategorySuggestion(id);
      if (result.success) {
        toast.success('Category suggestion approved');
        loadData();
      } else {
        toast.error(result.error || 'Failed to approve suggestion');
      }
    } catch (error) {
      console.error('Error approving suggestion:', error);
      toast.error('Failed to approve suggestion');
    }
  };

  const handleRejectCategorySuggestion = async (id: string, notes: string) => {
    try {
      const result = await communityService.rejectCategorySuggestion(id, notes);
      if (result.success) {
        toast.success('Category suggestion rejected');
        loadData();
      } else {
        toast.error(result.error || 'Failed to reject suggestion');
      }
    } catch (error) {
      console.error('Error rejecting suggestion:', error);
      toast.error('Failed to reject suggestion');
    }
  };

  const handleCreateCategory = async (data: CategoryFormData) => {
    try {
      const categoryData = {
        ...data,
        parent_id: undefined,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const result = categoryType === 'store' 
        ? await communityService.createStoreCategory(categoryData)
        : await communityService.createServiceCategory(categoryData);

      if (result.success) {
        toast.success('Category created successfully');
        form.reset();
        loadData();
      } else {
        toast.error(result.error || 'Failed to create category');
      }
    } catch (error) {
      console.error('Error creating category:', error);
      toast.error('Failed to create category');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case 'approved':
        return <Badge className="bg-green-500">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500">Rejected</Badge>;
      case 'suspended':
        return <Badge className="bg-gray-500">Suspended</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-8 px-4">
        <div className="container mx-auto">
          <div className="text-center">Loading community management...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Community Management</h1>
          <p className="text-muted-foreground">
            Manage stores, services, categories, and moderate community content.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="pending">Pending Approval</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
            <TabsTrigger value="moderation">Moderation</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Stores</CardTitle>
                    <Store className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.total_stores}</div>
                    <p className="text-xs text-muted-foreground">
                      {pendingStores.length} pending approval
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Services</CardTitle>
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.total_services}</div>
                    <p className="text-xs text-muted-foreground">
                      {pendingServices.length} pending approval
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
                    <Star className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.total_reviews}</div>
                    <p className="text-xs text-muted-foreground">
                      {stats.average_rating.toFixed(1)} avg rating
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending Actions</CardTitle>
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.pending_approvals}</div>
                    <p className="text-xs text-muted-foreground">
                      {stats.category_suggestions} category suggestions
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top Rated Stores</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {stats?.top_rated_stores.slice(0, 5).map((store) => (
                      <div key={store.id} className="flex items-center justify-between">
                        <span className="font-medium">{store.name}</span>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span>{store.rating_average.toFixed(1)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Rated Services</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {stats?.top_rated_services.slice(0, 5).map((service) => (
                      <div key={service.id} className="flex items-center justify-between">
                        <span className="font-medium">{service.business_name}</span>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span>{service.rating_average.toFixed(1)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Pending Approval Tab */}
          <TabsContent value="pending" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Pending Stores ({pendingStores.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {pendingStores.map((store) => (
                    <div key={store.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium">{store.name}</h4>
                          <p className="text-sm text-muted-foreground">{store.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge>{store.category.name}</Badge>
                            {getStatusBadge(store.status)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-3">
                        <Button 
                          size="sm" 
                          onClick={() => handleApproveStore(store.id)}
                          className="bg-green-500 hover:bg-green-600"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="destructive">
                              <X className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Reject Store</DialogTitle>
                              <DialogDescription>
                                Please provide a reason for rejecting this store listing.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <Textarea placeholder="Reason for rejection..." />
                              <div className="flex gap-2">
                                <Button 
                                  variant="destructive"
                                  onClick={() => handleRejectStore(store.id, 'Does not meet guidelines')}
                                >
                                  Reject Store
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {pendingStores.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No pending stores to review
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pending Services ({pendingServices.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {pendingServices.map((service) => (
                    <div key={service.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium">{service.business_name}</h4>
                          <p className="text-sm text-muted-foreground">{service.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge>{service.category.name}</Badge>
                            {getStatusBadge(service.status)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-3">
                        <Button 
                          size="sm" 
                          onClick={() => handleApproveService(service.id)}
                          className="bg-green-500 hover:bg-green-600"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="destructive">
                              <X className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Reject Service</DialogTitle>
                              <DialogDescription>
                                Please provide a reason for rejecting this service listing.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <Textarea placeholder="Reason for rejection..." />
                              <div className="flex gap-2">
                                <Button 
                                  variant="destructive"
                                  onClick={() => handleRejectService(service.id, 'Does not meet guidelines')}
                                >
                                  Reject Service
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {pendingServices.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No pending services to review
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Category Management</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-stepping-gradient">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Category
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Category</DialogTitle>
                    <DialogDescription>
                      Add a new category for stores or services.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleCreateCategory)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category Name</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., DJ Services" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="slug"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Slug</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., dj-services" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="flex gap-4 items-center">
                        <label className="text-sm font-medium">Type:</label>
                        <Select value={categoryType} onValueChange={(value) => setCategoryType(value as 'store' | 'service')}>
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="store">Store Category</SelectItem>
                            <SelectItem value="service">Service Category</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description (Optional)</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Category description..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="sort_order"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Sort Order</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="0" 
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="color"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Color (Optional)</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., #FF5733" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button type="submit" className="bg-stepping-gradient">
                          Create Category
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Store Categories ({storeCategories.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {storeCategories.map((category) => (
                    <div key={category.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <span className="font-medium">{category.name}</span>
                        <Badge variant="outline" className="ml-2">
                          {category.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Service Categories ({serviceCategories.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {serviceCategories.map((category) => (
                    <div key={category.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <span className="font-medium">{category.name}</span>
                        <Badge variant="outline" className="ml-2">
                          {category.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Category Suggestions Tab */}
          <TabsContent value="suggestions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Category Suggestions ({categorySuggestions.length})</CardTitle>
                <CardDescription>
                  Review and approve new category suggestions from community members.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {categorySuggestions.map((suggestion) => (
                  <div key={suggestion.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium">{suggestion.suggested_name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Suggested by {suggestion.suggested_by_user_name}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline">
                            {suggestion.type === 'store' ? 'Store Category' : 'Service Category'}
                          </Badge>
                          {getStatusBadge(suggestion.status)}
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(suggestion.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    
                    {suggestion.status === 'pending' && (
                      <div className="flex gap-2 mt-3">
                        <Button 
                          size="sm" 
                          onClick={() => handleApproveCategorySuggestion(suggestion.id)}
                          className="bg-green-500 hover:bg-green-600"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleRejectCategorySuggestion(suggestion.id, 'Not suitable')}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
                
                {categorySuggestions.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No category suggestions to review
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Moderation Tab */}
          <TabsContent value="moderation" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Pending Reviews</CardTitle>
                  <CardDescription>
                    Review and moderate user-submitted reviews.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    No pending reviews to moderate
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pending Comments</CardTitle>
                  <CardDescription>
                    Review and moderate user-submitted comments.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    No pending comments to moderate
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CommunityManagementPage;