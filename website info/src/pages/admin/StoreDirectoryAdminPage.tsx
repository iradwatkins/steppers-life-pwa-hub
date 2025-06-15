import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Store, 
  Plus, 
  Edit2, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Eye,
  Flag,
  Search,
  Filter,
  MoreVertical,
  Shield,
  Clock,
  Star
} from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useStoreDirectory } from '@/hooks/useStoreDirectory';
import { useReviews } from '@/hooks/useReviews';
import { StoreCategory, StoreListing } from '@/services/storeDirectoryService';

const StoreDirectoryAdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'categories' | 'listings' | 'reviews'>('categories');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'active' | 'rejected'>('all');
  
  // Category management state
  const [categories, setCategories] = useState<StoreCategory[]>([]);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<StoreCategory | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    icon: ''
  });

  // Store listings state
  const [stores, setStores] = useState<StoreListing[]>([]);
  const [selectedStore, setSelectedStore] = useState<StoreListing | null>(null);
  const [showStoreDialog, setShowStoreDialog] = useState(false);

  // Reviews state
  const [reviews, setReviews] = useState<any[]>([]);
  const [selectedReview, setSelectedReview] = useState<any>(null);
  const [showReviewDialog, setShowReviewDialog] = useState(false);

  const { getStoreCategories, getStoreListings } = useStoreDirectory();
  const { getReviews } = useReviews();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Mock data for now since services may not be implemented
      const mockCategories = [
        {
          id: '1',
          name: 'Fashion & Apparel',
          description: 'Clothing, accessories, and fashion items',
          icon: 'Shirt',
          isActive: true,
          isApproved: true,
          suggestedBy: null
        },
        {
          id: '2',
          name: 'Music & Entertainment',
          description: 'Music equipment, instruments, and entertainment services',
          icon: 'Music',
          isActive: true,
          isApproved: true,
          suggestedBy: null
        }
      ];

      const mockStores = [
        {
          id: '1',
          name: 'Dance Wear Plus',
          description: 'Premium dance clothing and accessories',
          category: mockCategories[0],
          ownerName: 'Sarah Johnson',
          isPending: true,
          isActive: false,
          isVerified: false,
          createdAt: new Date().toISOString(),
          averageRating: 4.5,
          totalRatings: 24,
          viewCount: 156,
          images: [{ url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=200&h=200&fit=crop' }],
          contactInfo: {
            email: 'info@dancewearplus.com',
            phone: '(555) 123-4567',
            website: 'https://dancewearplus.com'
          },
          tags: ['dance', 'clothing', 'accessories']
        }
      ];

      setCategories(mockCategories);
      setStores(mockStores);
      setReviews([]); // Empty for now
    } catch (error) {
      console.error('Failed to load data:', error);
      // Set empty arrays as fallback
      setCategories([]);
      setStores([]);
      setReviews([]);
    }
  };

  const handleCategorySubmit = async () => {
    try {
      if (editingCategory) {
        // Update existing category
        console.log('Updating category:', editingCategory.id, categoryForm);
      } else {
        // Create new category
        console.log('Creating new category:', categoryForm);
      }
      
      setShowCategoryDialog(false);
      setCategoryForm({ name: '', description: '', icon: '' });
      setEditingCategory(null);
      await loadData();
    } catch (error) {
      console.error('Failed to save category:', error);
    }
  };

  const handleApproveStore = async (storeId: string) => {
    try {
      console.log('Approving store:', storeId);
      await loadData();
    } catch (error) {
      console.error('Failed to approve store:', error);
    }
  };

  const handleRejectStore = async (storeId: string, reason: string) => {
    try {
      console.log('Rejecting store:', storeId, 'Reason:', reason);
      await loadData();
    } catch (error) {
      console.error('Failed to reject store:', error);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      try {
        console.log('Deleting category:', categoryId);
        await loadData();
      } catch (error) {
        console.error('Failed to delete category:', error);
      }
    }
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredStores = stores.filter(store => {
    const matchesSearch = store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         store.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'pending' && store.isPending) ||
                         (statusFilter === 'active' && store.isActive && !store.isPending) ||
                         (statusFilter === 'rejected' && !store.isActive && !store.isPending);
    
    return matchesSearch && matchesStatus;
  });

  const filteredReviews = reviews.filter(review =>
    review.storeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.review?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background-main py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-serif text-4xl font-bold text-text-primary mb-2">
            Store Directory Administration
          </h1>
          <p className="text-text-secondary text-lg">
            Manage categories, moderate listings, and oversee user reviews
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-border mb-6">
          <div className="flex gap-8">
            {['categories', 'listings', 'reviews'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`pb-4 px-1 border-b-2 font-medium capitalize ${
                  activeTab === tab
                    ? 'border-brand-primary text-brand-primary'
                    : 'border-transparent text-text-secondary hover:text-text-primary'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <label htmlFor="admin-search" className="sr-only">
                Search {activeTab}
              </label>
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary w-4 h-4" />
              <Input
                id="admin-search"
                name="admin-search"
                placeholder={`Search ${activeTab}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                aria-label={`Search ${activeTab}`}
              />
            </div>
            
            {activeTab === 'listings' && (
              <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Listings</SelectItem>
                  <SelectItem value="pending">Pending Approval</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-text-primary">Category Management</h2>
              <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Category
                  </Button>
                </DialogTrigger>
                <DialogContent aria-describedby="category-dialog-description">
                  <DialogHeader>
                    <DialogTitle>
                      {editingCategory ? 'Edit Category' : 'Add New Category'}
                    </DialogTitle>
                    <div id="category-dialog-description" className="sr-only">
                      {editingCategory ? 'Edit an existing category' : 'Create a new category for the store directory'}
                    </div>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="category-name" className="block text-sm font-medium mb-2">Category Name</label>
                      <Input
                        id="category-name"
                        name="category-name"
                        value={categoryForm.name}
                        onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                        placeholder="e.g., Fashion & Apparel"
                        aria-label="Category name"
                      />
                    </div>
                    <div>
                      <label htmlFor="category-description" className="block text-sm font-medium mb-2">Description</label>
                      <Textarea
                        id="category-description"
                        name="category-description"
                        value={categoryForm.description}
                        onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                        placeholder="Brief description of this category..."
                        rows={3}
                        aria-label="Category description"
                      />
                    </div>
                    <div>
                      <label htmlFor="category-icon" className="block text-sm font-medium mb-2">Icon (Lucide Icon Name)</label>
                      <Input
                        id="category-icon"
                        name="category-icon"
                        value={categoryForm.icon}
                        onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })}
                        placeholder="e.g., Shirt, Music, Heart"
                        aria-label="Category icon name"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowCategoryDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCategorySubmit}>
                      {editingCategory ? 'Update' : 'Create'} Category
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {filteredCategories.map((category) => (
                <Card key={category.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-brand-primary/10 rounded-lg flex items-center justify-center">
                          <Store className="w-6 h-6 text-brand-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg text-text-primary">{category.name}</h3>
                          <p className="text-text-secondary text-sm">{category.description}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <Badge variant={category.isActive ? "default" : "secondary"}>
                              {category.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                            <Badge variant={category.isApproved ? "default" : "destructive"}>
                              {category.isApproved ? 'Approved' : 'Pending Approval'}
                            </Badge>
                            {category.suggestedBy && (
                              <Badge variant="outline">User Suggested</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingCategory(category);
                            setCategoryForm({
                              name: category.name,
                              description: category.description,
                              icon: category.icon || ''
                            });
                            setShowCategoryDialog(true);
                          }}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteCategory(category.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Listings Tab */}
        {activeTab === 'listings' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-text-primary">Store Listings</h2>
              <div className="flex gap-2">
                <Badge variant="outline">
                  {filteredStores.filter(s => s.isPending).length} Pending
                </Badge>
                <Badge variant="outline">
                  {filteredStores.filter(s => s.isActive && !s.isPending).length} Active
                </Badge>
              </div>
            </div>

            <div className="space-y-4">
              {filteredStores.map((store) => (
                <Card key={store.id} className={store.isPending ? 'border-yellow-200 bg-yellow-50' : ''}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex gap-4">
                        <img
                          src={store.images[0]?.url || '/placeholder.svg'}
                          alt={store.name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg text-text-primary">{store.name}</h3>
                            {store.isVerified && (
                              <Badge variant="outline">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Verified
                              </Badge>
                            )}
                          </div>
                          <p className="text-text-secondary text-sm mb-2">{store.description}</p>
                          <div className="flex items-center gap-4 text-sm text-text-secondary">
                            <span>Category: {store.category?.name || 'Unknown'}</span>
                            <span>Owner: {store.ownerName}</span>
                            <span>Created: {new Date(store.createdAt).toLocaleDateString()}</span>
                            <div className="flex items-center">
                              <Star className="w-4 h-4 text-yellow-400 mr-1" />
                              <span>{store.averageRating} ({store.totalRatings} reviews)</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-3">
                            <Badge variant={store.isPending ? "destructive" : store.isActive ? "default" : "secondary"}>
                              {store.isPending ? 'Pending' : store.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                            <Badge variant="outline">{store.viewCount} views</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedStore(store);
                            setShowStoreDialog(true);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {store.isPending && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleApproveStore(store.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRejectStore(store.id, 'Does not meet guidelines')}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-text-primary">Review Moderation</h2>
              <div className="flex gap-2">
                <Badge variant="outline">
                  {filteredReviews.filter(r => r.reportCount > 0).length} Reported
                </Badge>
                <Badge variant="outline">
                  {filteredReviews.length} Total Reviews
                </Badge>
              </div>
            </div>

            <div className="space-y-4">
              {filteredReviews.map((review) => (
                <Card key={review.id} className={review.reportCount > 0 ? 'border-red-200 bg-red-50' : ''}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium text-text-primary">{review.userName}</h4>
                          <Badge variant="outline">Store: {review.storeName}</Badge>
                          {review.reportCount > 0 && (
                            <Badge variant="destructive">
                              <Flag className="w-3 h-3 mr-1" />
                              {review.reportCount} Reports
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-text-secondary">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {review.review && (
                          <p className="text-text-secondary mb-2">{review.review}</p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-text-secondary">
                          <span>Helpful votes: {review.helpfulVotes}</span>
                          {review.isVerified && (
                            <Badge variant="outline" className="text-xs">Verified</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedReview(review);
                            setShowReviewDialog(true);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {review.reportCount > 0 && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => console.log('Hide review:', review.id)}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Hide
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Store Detail Dialog */}
        <Dialog open={showStoreDialog} onOpenChange={setShowStoreDialog}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto" aria-describedby="store-dialog-description">
            <DialogHeader>
              <DialogTitle>Store Details</DialogTitle>
              <div id="store-dialog-description" className="sr-only">
                Detailed view of store information for review and approval
              </div>
            </DialogHeader>
            {selectedStore && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-2">Basic Information</h3>
                    <div className="space-y-2 text-sm">
                      <div><strong>Name:</strong> {selectedStore.name}</div>
                      <div><strong>Category:</strong> {selectedStore.category?.name}</div>
                      <div><strong>Owner:</strong> {selectedStore.ownerName}</div>
                      <div><strong>Status:</strong> 
                        <Badge className="ml-2" variant={selectedStore.isPending ? "destructive" : "default"}>
                          {selectedStore.isPending ? 'Pending' : 'Active'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Contact Information</h3>
                    <div className="space-y-2 text-sm">
                      {selectedStore.contactInfo.email && (
                        <div><strong>Email:</strong> {selectedStore.contactInfo.email}</div>
                      )}
                      {selectedStore.contactInfo.phone && (
                        <div><strong>Phone:</strong> {selectedStore.contactInfo.phone}</div>
                      )}
                      {selectedStore.contactInfo.website && (
                        <div><strong>Website:</strong> {selectedStore.contactInfo.website}</div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-text-secondary text-sm">{selectedStore.description}</p>
                </div>

                {selectedStore.tags.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedStore.tags.map((tag, index) => (
                        <Badge key={index} variant="outline">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {selectedStore.isPending && (
                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      onClick={() => {
                        handleApproveStore(selectedStore.id);
                        setShowStoreDialog(false);
                      }}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve Store
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        handleRejectStore(selectedStore.id, 'Does not meet guidelines');
                        setShowStoreDialog(false);
                      }}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject Store
                    </Button>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Review Detail Dialog */}
        <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
          <DialogContent aria-describedby="review-dialog-description">
            <DialogHeader>
              <DialogTitle>Review Details</DialogTitle>
              <div id="review-dialog-description" className="sr-only">
                Detailed view of user review for moderation
              </div>
            </DialogHeader>
            {selectedReview && (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{selectedReview.userName}</h4>
                    <Badge variant="outline">Store: {selectedReview.storeName}</Badge>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= selectedReview.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-text-secondary">
                      {new Date(selectedReview.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {selectedReview.review && (
                    <div className="bg-surface-card p-4 rounded-lg">
                      <p className="text-text-secondary">{selectedReview.review}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex gap-4">
                    <span>Helpful votes: {selectedReview.helpfulVotes}</span>
                    <span>Reports: {selectedReview.reportCount}</span>
                  </div>
                  {selectedReview.isVerified && (
                    <Badge variant="outline">Verified</Badge>
                  )}
                </div>

                {selectedReview.reportCount > 0 && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      This review has been reported {selectedReview.reportCount} time(s) and may need moderation.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    variant="destructive"
                    onClick={() => {
                      console.log('Hide review:', selectedReview.id);
                      setShowReviewDialog(false);
                    }}
                  >
                    Hide Review
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      console.log('Mark as reviewed:', selectedReview.id);
                      setShowReviewDialog(false);
                    }}
                  >
                    Mark as Reviewed
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default StoreDirectoryAdminPage; 