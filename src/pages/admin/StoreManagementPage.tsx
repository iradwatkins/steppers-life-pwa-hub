import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Store, StoreCategory, StoreStats } from '@/types/store';
import { storeService } from '@/services/storeService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, Edit, Trash2, Eye, Calendar, TrendingUp, Users, MessageCircle, Heart, BarChart3, Star, CheckCircle, XCircle, Clock, MapPin, Phone, Globe, Store as StoreIcon } from 'lucide-react';
import { formatDistanceToNow, parseISO, format } from 'date-fns';
import { toast } from 'sonner';

const StoreManagementPage = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [categories, setCategories] = useState<StoreCategory[]>([]);
  const [stats, setStats] = useState<StoreStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedStores, setSelectedStores] = useState<string[]>([]);

  useEffect(() => {
    loadData();
    loadCategories();
    loadStats();
  }, [statusFilter, categoryFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await storeService.getStores({
        status: statusFilter !== 'all' ? statusFilter as any : undefined,
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        keyword: searchTerm || undefined,
        sort_by: 'created_at',
        sort_order: 'desc',
        limit: 100
      });
      setStores(result.stores);
    } catch (error) {
      console.error('Failed to load stores:', error);
      toast.error('Failed to load stores');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const categoriesData = await storeService.getCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await storeService.getStats();
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleSearch = () => {
    loadData();
  };

  const handleApproveStore = async (storeId: string) => {
    try {
      await storeService.approveStore(storeId);
      toast.success('Store approved successfully');
      loadData();
      loadStats();
    } catch (error) {
      toast.error('Failed to approve store');
    }
  };

  const handleRejectStore = async (storeId: string, reason: string) => {
    try {
      await storeService.rejectStore(storeId, reason);
      toast.success('Store rejected');
      loadData();
      loadStats();
    } catch (error) {
      toast.error('Failed to reject store');
    }
  };

  const handleToggleFeatured = async (storeId: string, featured: boolean) => {
    try {
      await storeService.setFeaturedStore(storeId, featured);
      toast.success(`Store ${featured ? 'featured' : 'unfeatured'} successfully`);
      loadData();
    } catch (error) {
      toast.error('Failed to update featured status');
    }
  };

  const handleDeleteStore = async (storeId: string) => {
    try {
      await storeService.deleteStore(storeId);
      toast.success('Store deleted successfully');
      loadData();
      loadStats();
    } catch (error) {
      toast.error('Failed to delete store');
    }
  };

  const handleBulkApprove = async () => {
    try {
      await Promise.all(selectedStores.map(id => storeService.approveStore(id)));
      toast.success(`${selectedStores.length} stores approved`);
      setSelectedStores([]);
      loadData();
      loadStats();
    } catch (error) {
      toast.error('Failed to approve stores');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500 text-white">Approved</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500 text-white">Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500 text-white">Rejected</Badge>;
      case 'suspended':
        return <Badge className="bg-orange-500 text-white">Suspended</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredStores = stores.filter(store =>
    store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    store.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    store.owner_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Store Management</h1>
        <p className="text-muted-foreground">
          Manage community store listings, approvals, and moderation
        </p>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Stores</CardTitle>
              <StoreIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_stores}</div>
              <p className="text-xs text-muted-foreground">
                {stats.approved_stores} approved
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending_stores}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting review
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
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
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.categories_count}</div>
              <p className="text-xs text-muted-foreground">
                Active categories
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="stores" className="space-y-6">
        <TabsList>
          <TabsTrigger value="stores">Stores</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="stores" className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search stores, owners, descriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button onClick={handleSearch}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>

          {/* Bulk Actions */}
          {selectedStores.length > 0 && (
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {selectedStores.length} stores selected
                </span>
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleBulkApprove}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve Selected
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setSelectedStores([])}>
                    Clear Selection
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Stores Table */}
          <Card>
            <CardHeader>
              <CardTitle>Store Listings ({filteredStores.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading stores...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <input
                          type="checkbox"
                          checked={selectedStores.length === filteredStores.length && filteredStores.length > 0}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedStores(filteredStores.map(s => s.id));
                            } else {
                              setSelectedStores([]);
                            }
                          }}
                        />
                      </TableHead>
                      <TableHead>Store</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStores.map((store) => (
                      <TableRow key={store.id}>
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedStores.includes(store.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedStores([...selectedStores, store.id]);
                              } else {
                                setSelectedStores(selectedStores.filter(id => id !== store.id));
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {store.images.length > 0 ? (
                              <img
                                src={store.images.find(img => img.is_primary)?.url || store.images[0]?.url}
                                alt={store.name}
                                className="w-10 h-10 rounded object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                                <StoreIcon className="h-5 w-5" />
                              </div>
                            )}
                            <div>
                              <div className="font-medium">{store.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {store.view_count} views
                              </div>
                              {store.is_featured && (
                                <Badge className="bg-stepping-gradient text-xs">Featured</Badge>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{store.owner_name}</div>
                            {store.contact_email && (
                              <div className="text-sm text-muted-foreground">{store.contact_email}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{store.category?.name || 'Uncategorized'}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {store.location_type === 'online' ? (
                              <div className="flex items-center gap-1">
                                <Globe className="h-3 w-3" />
                                Online
                              </div>
                            ) : (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {store.city || 'Physical'}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm">{store.rating.toFixed(1)}</span>
                            <span className="text-xs text-muted-foreground">({store.review_count})</span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(store.status)}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {format(parseISO(store.created_at), 'MMM d, yyyy')}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatDistanceToNow(parseISO(store.created_at), { addSuffix: true })}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline" asChild>
                              <Link to={`/community/stores/${store.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>

                            {store.status === 'pending' && (
                              <>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleApproveStore(store.id)}
                                  className="text-green-600 hover:text-green-700"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      className="text-red-600 hover:text-red-700"
                                    >
                                      <XCircle className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Reject Store</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to reject "{store.name}"? This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleRejectStore(store.id, 'Does not meet community guidelines')}
                                        className="bg-red-600 hover:bg-red-700"
                                      >
                                        Reject
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </>
                            )}

                            {store.status === 'approved' && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleToggleFeatured(store.id, !store.is_featured)}
                                className={store.is_featured ? "text-yellow-600" : ""}
                              >
                                <Star className={`h-4 w-4 ${store.is_featured ? 'fill-yellow-400' : ''}`} />
                              </Button>
                            )}

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Store</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{store.name}"? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteStore(store.id)}
                                    className="bg-red-600 hover:bg-red-700"
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
              )}

              {filteredStores.length === 0 && !loading && (
                <div className="text-center py-8 text-muted-foreground">
                  No stores found matching your criteria.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle>Store Categories</CardTitle>
              <p className="text-sm text-muted-foreground">
                Manage categories for store listings
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">{category.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {category.description} • {category.store_count} stores
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={category.is_active ? "default" : "secondary"}>
                        {category.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {categories.slice(0, 5).map((category) => (
                    <div key={category.id} className="flex items-center justify-between">
                      <div className="font-medium">{category.name}</div>
                      <Badge variant="secondary">{category.store_count} stores</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stores.slice(0, 5).map((store) => (
                    <div key={store.id} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{store.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatDistanceToNow(parseISO(store.created_at), { addSuffix: true })}
                        </div>
                      </div>
                      {getStatusBadge(store.status)}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StoreManagementPage;