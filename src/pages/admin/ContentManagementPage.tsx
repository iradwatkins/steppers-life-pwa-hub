import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ContentService, CreateContentPageData, UpdateContentPageData } from '@/services/contentService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  FileText, 
  Plus, 
  Edit, 
  Eye, 
  Trash2, 
  Save, 
  ArrowLeft,
  Globe,
  Clock,
  Archive,
  History,
  RotateCcw,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import RichTextEditor from '@/components/ui/rich-text-editor';

interface ContentPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  meta_description: string | null;
  meta_keywords: string[] | null;
  type: 'page' | 'post' | 'faq_item';
  status: 'draft' | 'published' | 'archived';
  featured_image_url: string | null;
  sort_order: number;
  is_system_page: boolean;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

interface ContentPageVersion {
  id: string;
  page_id: string;
  version_number: number;
  title: string;
  content: string;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
}

interface ContentFilters {
  status?: 'draft' | 'published' | 'archived';
  type?: 'page' | 'post' | 'faq_item';
  search?: string;
}

function ContentManagementPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // State management
  const [contentPages, setContentPages] = useState<ContentPage[]>([]);
  const [selectedPage, setSelectedPage] = useState<ContentPage | null>(null);
  const [pageVersions, setPageVersions] = useState<ContentPageVersion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [filters, setFilters] = useState<ContentFilters>({});
  
  // Form state
  const [formData, setFormData] = useState<CreateContentPageData>({
    title: '',
    slug: '',
    content: '',
    metaDescription: '',
    metaKeywords: [],
    type: 'page',
    status: 'draft',
    sortOrder: 0,
    isSystemPage: false
  });
  
  // Check admin access
  useEffect(() => {
    if (!user?.role || !['admin', 'super_admin'].includes(user.role)) {
      navigate('/dashboard');
      return;
    }
  }, [user, navigate]);
  
  // Load content pages
  useEffect(() => {
    loadContentPages();
  }, [filters]);
  
  const loadContentPages = async () => {
    try {
      setIsLoading(true);
      const pages = await ContentService.getContentPages(filters);
      
      // Apply search filter locally
      const filteredPages = filters.search 
        ? pages.filter(page => 
            page.title.toLowerCase().includes(filters.search!.toLowerCase()) ||
            page.slug.toLowerCase().includes(filters.search!.toLowerCase())
          )
        : pages;
      
      setContentPages(filteredPages);
    } catch (error) {
      console.error('Error loading content pages:', error);
      toast({
        title: 'Error',
        description: 'Failed to load content pages',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const loadPageVersions = async (pageId: string) => {
    try {
      const versions = await ContentService.getContentPageVersions(pageId);
      setPageVersions(versions);
    } catch (error) {
      console.error('Error loading page versions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load page versions',
        variant: 'destructive'
      });
    }
  };
  
  const handleCreatePage = async () => {
    try {
      if (!formData.title || !formData.slug || !formData.content) {
        toast({
          title: 'Validation Error',
          description: 'Title, slug, and content are required',
          variant: 'destructive'
        });
        return;
      }
      
      await ContentService.createContentPage(formData);
      toast({
        title: 'Success',
        description: 'Content page created successfully'
      });
      
      setIsCreating(false);
      resetForm();
      loadContentPages();
    } catch (error: any) {
      console.error('Error creating page:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create content page',
        variant: 'destructive'
      });
    }
  };
  
  const handleUpdatePage = async () => {
    if (!selectedPage) return;
    
    try {
      const updateData: UpdateContentPageData = {
        title: formData.title,
        slug: formData.slug,
        content: formData.content,
        metaDescription: formData.metaDescription,
        metaKeywords: formData.metaKeywords,
        status: formData.status,
        sortOrder: formData.sortOrder
      };
      
      await ContentService.updateContentPage(selectedPage.id, updateData);
      toast({
        title: 'Success',
        description: 'Content page updated successfully'
      });
      
      setIsEditing(false);
      setSelectedPage(null);
      resetForm();
      loadContentPages();
    } catch (error: any) {
      console.error('Error updating page:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update content page',
        variant: 'destructive'
      });
    }
  };
  
  const handleDeletePage = async (pageId: string) => {
    try {
      await ContentService.deleteContentPage(pageId);
      toast({
        title: 'Success',
        description: 'Content page deleted successfully'
      });
      loadContentPages();
    } catch (error: any) {
      console.error('Error deleting page:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete content page',
        variant: 'destructive'
      });
    }
  };
  
  const handlePublishPage = async (pageId: string) => {
    try {
      await ContentService.publishPage(pageId);
      toast({
        title: 'Success',
        description: 'Content page published successfully'
      });
      loadContentPages();
    } catch (error: any) {
      console.error('Error publishing page:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to publish content page',
        variant: 'destructive'
      });
    }
  };
  
  const handleArchivePage = async (pageId: string) => {
    try {
      await ContentService.archivePage(pageId);
      toast({
        title: 'Success',
        description: 'Content page archived successfully'
      });
      loadContentPages();
    } catch (error: any) {
      console.error('Error archiving page:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to archive content page',
        variant: 'destructive'
      });
    }
  };
  
  const handleRollbackToVersion = async (versionId: string) => {
    if (!selectedPage) return;
    
    try {
      await ContentService.rollbackToVersion(selectedPage.id, versionId);
      toast({
        title: 'Success',
        description: 'Page rolled back to selected version successfully'
      });
      setShowVersionHistory(false);
      loadContentPages();
    } catch (error: any) {
      console.error('Error rolling back:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to rollback to version',
        variant: 'destructive'
      });
    }
  };
  
  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      content: '',
      metaDescription: '',
      metaKeywords: [],
      type: 'page',
      status: 'draft',
      sortOrder: 0,
      isSystemPage: false
    });
  };
  
  const startEditing = (page: ContentPage) => {
    setSelectedPage(page);
    setFormData({
      title: page.title,
      slug: page.slug,
      content: page.content,
      metaDescription: page.meta_description || '',
      metaKeywords: page.meta_keywords || [],
      type: page.type,
      status: page.status,
      sortOrder: page.sort_order,
      isSystemPage: page.is_system_page
    });
    setIsEditing(true);
  };
  
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge variant="default" className="bg-green-100 text-green-800"><Globe className="w-3 h-3 mr-1" />Published</Badge>;
      case 'draft':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Draft</Badge>;
      case 'archived':
        return <Badge variant="outline"><Archive className="w-3 h-3 mr-1" />Archived</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading content management...</p>
          </div>
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
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Admin</span>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Content Management</h1>
            <p className="text-muted-foreground">
              Manage static pages, terms, privacy policy, and other content
            </p>
          </div>
        </div>
        
        <Button
          onClick={() => setIsCreating(true)}
          className="flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create Page</span>
        </Button>
      </div>
      
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search pages..."
                  value={filters.search || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="status-filter">Status</Label>
              <Select
                value={filters.status || 'all'}
                onValueChange={(value) => setFilters(prev => ({ 
                  ...prev, 
                  status: value === 'all' ? undefined : value as any 
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="type-filter">Type</Label>
              <Select
                value={filters.type || 'all'}
                onValueChange={(value) => setFilters(prev => ({ 
                  ...prev, 
                  type: value === 'all' ? undefined : value as any 
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="page">Page</SelectItem>
                  <SelectItem value="post">Post</SelectItem>
                  <SelectItem value="faq_item">FAQ Item</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => setFilters({})}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Content Pages Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-4 h-4" />
            <span>Content Pages ({contentPages.length})</span>
          </CardTitle>
          <CardDescription>
            Manage all static content pages and posts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>System Page</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contentPages.map((page) => (
                  <TableRow key={page.id}>
                    <TableCell className="font-medium">{page.title}</TableCell>
                    <TableCell>
                      <code className="bg-muted px-2 py-1 rounded text-sm">
                        /{page.slug}
                      </code>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{page.type}</Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(page.status)}</TableCell>
                    <TableCell>
                      {page.is_system_page && (
                        <Badge variant="secondary">System</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(page.updated_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedPage(page);
                            setShowPreview(true);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => startEditing(page)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedPage(page);
                            loadPageVersions(page.id);
                            setShowVersionHistory(true);
                          }}
                        >
                          <History className="w-4 h-4" />
                        </Button>
                        
                        {page.status === 'draft' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePublishPage(page.id)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <Globe className="w-4 h-4" />
                          </Button>
                        )}
                        
                        {page.status === 'published' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleArchivePage(page.id)}
                            className="text-orange-600 hover:text-orange-700"
                          >
                            <Archive className="w-4 h-4" />
                          </Button>
                        )}
                        
                        {!page.is_system_page && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Content Page</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{page.title}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeletePage(page.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                
                {contentPages.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center space-y-2">
                        <FileText className="w-12 h-12 text-muted-foreground" />
                        <p className="text-muted-foreground">No content pages found</p>
                        <Button
                          variant="outline"
                          onClick={() => setIsCreating(true)}
                          className="mt-2"
                        >
                          Create First Page
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      {/* Create Page Dialog */}
      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Content Page</DialogTitle>
            <DialogDescription>
              Create a new static page, post, or FAQ item
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="create-title">Title *</Label>
                <Input
                  id="create-title"
                  value={formData.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    setFormData(prev => ({ 
                      ...prev, 
                      title,
                      slug: generateSlug(title)
                    }));
                  }}
                  placeholder="Page title"
                />
              </div>
              
              <div>
                <Label htmlFor="create-slug">Slug *</Label>
                <Input
                  id="create-slug"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="page-slug"
                />
              </div>
              
              <div>
                <Label htmlFor="create-type">Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="page">Page</SelectItem>
                    <SelectItem value="post">Post</SelectItem>
                    <SelectItem value="faq_item">FAQ Item</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="create-status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="create-meta-description">Meta Description</Label>
              <Textarea
                id="create-meta-description"
                value={formData.metaDescription}
                onChange={(e) => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
                placeholder="Brief description for SEO"
                rows={2}
              />
            </div>
            
            <div>
              <Label htmlFor="create-content">Content *</Label>
              <RichTextEditor
                content={formData.content}
                onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                placeholder="Write your content here..."
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreating(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleCreatePage}>
                <Save className="w-4 h-4 mr-2" />
                Create Page
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Edit Page Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Content Page</DialogTitle>
            <DialogDescription>
              Update page content and settings
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-title">Title *</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Page title"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-slug">Slug *</Label>
                <Input
                  id="edit-slug"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="page-slug"
                  disabled={selectedPage?.is_system_page}
                />
              </div>
              
              <div>
                <Label htmlFor="edit-type">Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}
                  disabled={selectedPage?.is_system_page}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="page">Page</SelectItem>
                    <SelectItem value="post">Post</SelectItem>
                    <SelectItem value="faq_item">FAQ Item</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="edit-meta-description">Meta Description</Label>
              <Textarea
                id="edit-meta-description"
                value={formData.metaDescription}
                onChange={(e) => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
                placeholder="Brief description for SEO"
                rows={2}
              />
            </div>
            
            <div>
              <Label htmlFor="edit-content">Content *</Label>
              <RichTextEditor
                content={formData.content}
                onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                placeholder="Write your content here..."
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  setSelectedPage(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleUpdatePage}>
                <Save className="w-4 h-4 mr-2" />
                Update Page
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Page Preview: {selectedPage?.title}</DialogTitle>
            <DialogDescription>
              Preview how this page will appear to users
            </DialogDescription>
          </DialogHeader>
          
          {selectedPage && (
            <div className="space-y-4">
              <div className="border-b pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold">{selectedPage.title}</h1>
                    <p className="text-sm text-muted-foreground">
                      /{selectedPage.slug} • {getStatusBadge(selectedPage.status)}
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Last updated: {new Date(selectedPage.updated_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
              
              <div 
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: selectedPage.content }}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Version History Dialog */}
      <Dialog open={showVersionHistory} onOpenChange={setShowVersionHistory}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Version History: {selectedPage?.title}</DialogTitle>
            <DialogDescription>
              View and rollback to previous versions
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {pageVersions.map((version, index) => (
              <Card key={version.id}>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">v{version.version_number}</Badge>
                        {index === 0 && <Badge variant="default">Current</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {new Date(version.created_at).toLocaleString()}
                      </p>
                      <p className="font-medium mt-2">{version.title}</p>
                    </div>
                    
                    {index > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRollbackToVersion(version.id)}
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Rollback
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {pageVersions.length === 0 && (
              <div className="text-center py-8">
                <History className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No version history available</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ContentManagementPage;