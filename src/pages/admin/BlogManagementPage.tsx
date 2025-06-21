import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BlogPost, BlogCategory, BlogTag, BlogStats } from '@/types/blog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Search, Edit, Trash2, Eye, Calendar, TrendingUp, Users, MessageCircle, Heart, BarChart3 } from 'lucide-react';
import { formatDistanceToNow, parseISO, format } from 'date-fns';

const BlogManagementPage = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [tags, setTags] = useState<BlogTag[]>([]);
  const [stats, setStats] = useState<BlogStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    fetchBlogData();
  }, [searchTerm, statusFilter, categoryFilter]);

  const fetchBlogData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search: searchTerm,
        status: statusFilter === 'all' ? '' : statusFilter,
        category: categoryFilter === 'all' ? '' : categoryFilter,
      });

      const response = await fetch(`/api/admin/blog?${params}`);
      const data = await response.json();
      
      setPosts(data.posts || []);
      setCategories(data.categories || []);
      setTags(data.tags || []);
      setStats(data.stats || null);
    } catch (error) {
      console.error('Error fetching blog data:', error);
      setPosts(mockBlogPosts);
      setCategories(mockCategories);
      setTags(mockTags);
      setStats(mockStats);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      const response = await fetch(`/api/admin/blog/posts/${postId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setPosts(posts.filter(post => post.id !== postId));
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const handleStatusChange = async (postId: string, newStatus: 'draft' | 'published' | 'archived') => {
    try {
      const response = await fetch(`/api/admin/blog/posts/${postId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setPosts(posts.map(post => 
          post.id === postId ? { ...post, status: newStatus } : post
        ));
      }
    } catch (error) {
      console.error('Error updating post status:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: 'secondary',
      published: 'default',
      archived: 'outline'
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const StatsCard = ({ title, value, icon: Icon, trend }: {
    title: string;
    value: string | number;
    icon: React.ComponentType<any>;
    trend?: string;
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <p className="text-xs text-muted-foreground">
            {trend}
          </p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Blog Management</h1>
          <p className="text-muted-foreground">Manage your blog posts, categories, and content</p>
        </div>
        <Button asChild>
          <Link to="/admin/blog/create">
            <Plus className="h-4 w-4 mr-2" />
            Create Post
          </Link>
        </Button>
      </div>

      {/* Stats Dashboard */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Posts"
            value={stats.total_posts}
            icon={BarChart3}
            trend={`${stats.published_posts} published`}
          />
          <StatsCard
            title="Total Views"
            value={stats.total_views.toLocaleString()}
            icon={Eye}
            trend="This month"
          />
          <StatsCard
            title="Total Likes"
            value={stats.total_likes.toLocaleString()}
            icon={Heart}
            trend="All time"
          />
          <StatsCard
            title="Total Comments"
            value={stats.total_comments.toLocaleString()}
            icon={MessageCircle}
            trend="All time"
          />
        </div>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.slug}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Posts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Blog Posts</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Categories</TableHead>
                  <TableHead>Stats</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map(post => (
                  <TableRow key={post.id}>
                    <TableCell>
                      {post.featured_image ? (
                        <img 
                          src={post.featured_image} 
                          alt={post.title}
                          className="w-10 h-10 object-cover rounded"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                          <BarChart3 className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium line-clamp-1">{post.title}</div>
                        <div className="text-sm text-muted-foreground line-clamp-1">
                          {post.excerpt}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={post.author_avatar} />
                          <AvatarFallback>{post.author_name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{post.author_name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select 
                        value={post.status} 
                        onValueChange={(value) => handleStatusChange(post.id, value as any)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {post.categories.slice(0, 2).map(category => (
                          <Badge key={category.id} variant="secondary" className="text-xs">
                            {category.name}
                          </Badge>
                        ))}
                        {post.categories.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{post.categories.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {post.view_count}
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          {post.like_count}
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="h-3 w-3" />
                          {post.comment_count}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{format(parseISO(post.created_at), 'MMM d, yyyy')}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatDistanceToNow(parseISO(post.updated_at), { addSuffix: true })}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/blog/${post.slug}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/admin/blog/edit/${post.id}`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Blog Post</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{post.title}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeletePost(post.id)}
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
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {categories.slice(0, 5).map(category => (
                <div key={category.id} className="flex items-center justify-between">
                  <span className="text-sm">{category.name}</span>
                  <Badge variant="secondary">{category.post_count}</Badge>
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" className="w-full mt-4" asChild>
              <Link to="/admin/blog/categories">Manage Categories</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Popular Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {tags.slice(0, 5).map(tag => (
                <div key={tag.id} className="flex items-center justify-between">
                  <span className="text-sm">#{tag.name}</span>
                  <Badge variant="outline">{tag.post_count}</Badge>
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" className="w-full mt-4" asChild>
              <Link to="/admin/blog/tags">Manage Tags</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-sm">
                <div className="font-medium">New comment</div>
                <div className="text-muted-foreground">2 minutes ago</div>
              </div>
              <div className="text-sm">
                <div className="font-medium">Post published</div>
                <div className="text-muted-foreground">1 hour ago</div>
              </div>
              <div className="text-sm">
                <div className="font-medium">Draft saved</div>
                <div className="text-muted-foreground">3 hours ago</div>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full mt-4" asChild>
              <Link to="/admin/blog/activity">View All Activity</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Mock data for development
const mockStats: BlogStats = {
  total_posts: 45,
  published_posts: 38,
  draft_posts: 7,
  total_views: 15420,
  total_likes: 892,
  total_comments: 246,
  categories_count: 8,
  tags_count: 24,
  most_viewed_posts: [],
  most_liked_posts: [],
  recent_posts: []
};

const mockCategories = [
  { id: '1', name: 'Dance Techniques', slug: 'dance-techniques', post_count: 15, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: '2', name: 'Fitness & Health', slug: 'fitness-health', post_count: 12, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: '3', name: 'Community Stories', slug: 'community-stories', post_count: 8, created_at: '2024-01-01', updated_at: '2024-01-01' },
];

const mockTags = [
  { id: '1', name: 'beginner', slug: 'beginner', post_count: 10, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: '2', name: 'advanced', slug: 'advanced', post_count: 8, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: '3', name: 'tutorial', slug: 'tutorial', post_count: 12, created_at: '2024-01-01', updated_at: '2024-01-01' },
];

const mockBlogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'Mastering the Basic Step: A Beginner\'s Guide',
    slug: 'mastering-basic-step-beginners-guide',
    excerpt: 'Learn the fundamental stepper moves that form the foundation of all advanced techniques.',
    content: '<p>Lorem ipsum dolor sit amet...</p>',
    featured_image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=150',
    author_id: '1',
    author_name: 'Sarah Johnson',
    status: 'published',
    published_at: '2024-06-20T10:00:00Z',
    created_at: '2024-06-20T10:00:00Z',
    updated_at: '2024-06-20T10:00:00Z',
    categories: [mockCategories[0]],
    tags: [mockTags[0], mockTags[2]],
    reading_time_minutes: 5,
    view_count: 1250,
    like_count: 89,
    comment_count: 12
  }
];

export default BlogManagementPage;