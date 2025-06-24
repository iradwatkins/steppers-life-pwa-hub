import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MagazineArticle, MagazineCategory, MagazineTag, MagazineStats } from '@/types/magazine';
import { magazineService } from '@/services/magazineService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Search, Edit, Trash2, Eye, Calendar, TrendingUp, Users, MessageCircle, Heart, BarChart3, Star, Bookmark } from 'lucide-react';
import { formatDistanceToNow, parseISO, format } from 'date-fns';

const MagazineManagementPage = () => {
  const [articles, setArticles] = useState<MagazineArticle[]>([]);
  const [categories, setCategories] = useState<MagazineCategory[]>([]);
  const [tags, setTags] = useState<MagazineTag[]>([]);
  const [stats, setStats] = useState<MagazineStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sectionFilter, setSectionFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const sections = [
    { id: 'all', name: 'All Sections' },
    { id: 'culture', name: 'Culture & History' },
    { id: 'techniques', name: 'Techniques' },
    { id: 'profiles', name: 'Profiles' },
    { id: 'events', name: 'Event Coverage' },
    { id: 'fashion', name: 'Fashion & Style' },
    { id: 'editorial', name: 'Editorial' }
  ];

  const articleTypes = [
    { id: 'all', name: 'All Types' },
    { id: 'feature', name: 'Feature' },
    { id: 'profile', name: 'Profile' },
    { id: 'technique', name: 'Technique' },
    { id: 'culture', name: 'Culture' },
    { id: 'event_coverage', name: 'Event Coverage' },
    { id: 'editorial', name: 'Editorial' },
    { id: 'interview', name: 'Interview' },
    { id: 'review', name: 'Review' }
  ];

  useEffect(() => {
    fetchMagazineData();
  }, [searchTerm, statusFilter, categoryFilter, sectionFilter, typeFilter]);

  const fetchMagazineData = async () => {
    setLoading(true);
    try {
      const filters = {
        search: searchTerm || undefined,
        status: statusFilter === 'all' ? undefined : statusFilter,
        category: categoryFilter === 'all' ? undefined : categoryFilter,
        section: sectionFilter === 'all' ? undefined : sectionFilter,
        article_type: typeFilter === 'all' ? undefined : typeFilter,
      };

      const data = await magazineService.getArticles(filters);
      setArticles(data.articles || []);
      setCategories(data.categories || []);
      setTags(data.tags || []);
      
      const statsData = await magazineService.getStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching magazine data:', error);
      setArticles(mockMagazineArticles);
      setCategories(mockCategories);
      setTags(mockTags);
      setStats(mockStats);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteArticle = async (articleId: string) => {
    try {
      await magazineService.deleteArticle(articleId);
      setArticles(articles.filter(article => article.id !== articleId));
    } catch (error) {
      console.error('Error deleting article:', error);
    }
  };

  const handleStatusChange = async (articleId: string, newStatus: 'draft' | 'published' | 'archived') => {
    try {
      await magazineService.updateArticle({ id: articleId, status: newStatus });
      setArticles(articles.map(article => 
        article.id === articleId ? { ...article, status: newStatus } : article
      ));
    } catch (error) {
      console.error('Error updating article status:', error);
    }
  };

  const handleFeatureToggle = async (articleId: string, featured: boolean) => {
    try {
      await magazineService.setFeaturedArticle(articleId, featured);
      setArticles(articles.map(article => 
        article.id === articleId ? { ...article, is_featured: featured } : article
      ));
    } catch (error) {
      console.error('Error updating featured status:', error);
    }
  };

  const handleCoverStoryToggle = async (articleId: string, isCoverStory: boolean) => {
    try {
      await magazineService.setCoverStory(articleId, isCoverStory);
      setArticles(articles.map(article => 
        article.id === articleId ? { ...article, is_cover_story: isCoverStory } : article
      ));
    } catch (error) {
      console.error('Error updating cover story status:', error);
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
          <h1 className="text-3xl font-bold">Magazine Management</h1>
          <p className="text-muted-foreground">Manage your magazine articles, sections, and content</p>
        </div>
        <Button asChild>
          <Link to="/admin/magazine/create">
            <Plus className="h-4 w-4 mr-2" />
            Create Article
          </Link>
        </Button>
      </div>

      {/* Stats Dashboard */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <StatsCard
            title="Total Articles"
            value={stats.total_articles}
            icon={BarChart3}
            trend={`${stats.published_articles} published`}
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
          <StatsCard
            title="Featured Articles"
            value={stats.featured_articles?.length || 0}
            icon={Star}
            trend="Currently featured"
          />
        </div>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sectionFilter} onValueChange={setSectionFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Sections" />
              </SelectTrigger>
              <SelectContent>
                {sections.map(section => (
                  <SelectItem key={section.id} value={section.id}>
                    {section.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                {articleTypes.map(type => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
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

      {/* Articles Table */}
      <Card>
        <CardHeader>
          <CardTitle>Magazine Articles</CardTitle>
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
                  <TableHead>Section/Type</TableHead>
                  <TableHead>Features</TableHead>
                  <TableHead>Stats</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {articles.map(article => (
                  <TableRow key={article.id}>
                    <TableCell>
                      {article.featured_image ? (
                        <img 
                          src={article.featured_image} 
                          alt={article.title}
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
                        <div className="font-medium line-clamp-1 flex items-center gap-2">
                          {article.title}
                          {article.is_cover_story && (
                            <Badge className="bg-red-600 text-white text-xs">
                              <Star className="h-2 w-2 mr-1" />
                              Cover
                            </Badge>
                          )}
                          {article.is_featured && (
                            <Badge className="bg-stepping-gradient text-xs">Featured</Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground line-clamp-1">
                          {article.excerpt}
                        </div>
                        {article.issue_number && (
                          <div className="text-xs text-muted-foreground">
                            Issue {article.issue_number}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={article.author_avatar} />
                          <AvatarFallback>{article.author_name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{article.author_name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select 
                        value={article.status} 
                        onValueChange={(value) => handleStatusChange(article.id, value as any)}
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
                      <div className="space-y-1">
                        <Badge variant="outline" className="text-xs">
                          {article.section}
                        </Badge>
                        <div>
                          <Badge variant="secondary" className="text-xs capitalize">
                            {article.article_type.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1">
                          <Button
                            variant={article.is_featured ? "default" : "outline"}
                            size="sm"
                            className="h-6 text-xs"
                            onClick={() => handleFeatureToggle(article.id, !article.is_featured)}
                          >
                            <Star className="h-3 w-3 mr-1" />
                            {article.is_featured ? 'Featured' : 'Feature'}
                          </Button>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant={article.is_cover_story ? "destructive" : "outline"}
                            size="sm"
                            className="h-6 text-xs"
                            onClick={() => handleCoverStoryToggle(article.id, !article.is_cover_story)}
                          >
                            <Bookmark className="h-3 w-3 mr-1" />
                            {article.is_cover_story ? 'Cover' : 'Set Cover'}
                          </Button>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {article.view_count}
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          {article.like_count}
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="h-3 w-3" />
                          {article.comment_count}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{format(parseISO(article.created_at), 'MMM d, yyyy')}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatDistanceToNow(parseISO(article.updated_at), { addSuffix: true })}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/magazine/${article.slug}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/admin/magazine/edit/${article.id}`}>
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
                              <AlertDialogTitle>Delete Magazine Article</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{article.title}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteArticle(article.id)}
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
              <Link to="/admin/magazine/categories">Manage Categories</Link>
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
              <Link to="/admin/magazine/tags">Manage Tags</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Magazine Sections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {sections.slice(1, 6).map(section => {
                const sectionCount = articles.filter(a => a.section.toLowerCase() === section.id).length;
                return (
                  <div key={section.id} className="flex items-center justify-between">
                    <span className="text-sm">{section.name}</span>
                    <Badge variant="outline">{sectionCount}</Badge>
                  </div>
                );
              })}
            </div>
            <Button variant="outline" size="sm" className="w-full mt-4" asChild>
              <Link to="/admin/magazine/sections">Manage Sections</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Mock data for development
const mockStats: MagazineStats = {
  total_articles: 45,
  published_articles: 38,
  draft_articles: 7,
  total_views: 15420,
  total_likes: 892,
  total_comments: 246,
  categories_count: 8,
  tags_count: 24,
  most_viewed_articles: [],
  most_liked_articles: [],
  recent_articles: [],
  featured_articles: [],
  cover_stories: []
};

const mockCategories: MagazineCategory[] = [
  { id: '1', name: 'Culture & History', slug: 'culture-history', post_count: 15, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z', section_type: 'feature', display_order: 1, color: '#3B82F6' },
  { id: '2', name: 'Techniques', slug: 'techniques', post_count: 18, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z', section_type: 'regular', display_order: 2, color: '#10B981' },
  { id: '3', name: 'Profiles', slug: 'profiles', post_count: 8, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z', section_type: 'feature', display_order: 3, color: '#F59E0B' },
];

const mockTags: MagazineTag[] = [
  { id: '1', name: 'Chicago Stepping', slug: 'chicago-stepping', post_count: 15, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
  { id: '2', name: 'Beginner', slug: 'beginner', post_count: 12, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
  { id: '3', name: 'Advanced', slug: 'advanced', post_count: 8, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
];

const mockMagazineArticles: MagazineArticle[] = [
  {
    id: '1',
    title: 'The Evolution of Chicago Stepping: From the 1970s to Today',
    slug: 'evolution-chicago-stepping-1970s-today',
    excerpt: 'Explore the rich history and cultural significance of Chicago stepping.',
    content: '<p>Lorem ipsum dolor sit amet...</p>',
    featured_image: 'https://images.unsplash.com/photo-1547153760-18fc86324498?w=150',
    author_id: '1',
    author_name: 'Marcus Johnson',
    status: 'published',
    published_at: '2024-01-15T10:00:00Z',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    categories: [mockCategories[0]],
    tags: [mockTags[0]],
    reading_time_minutes: 8,
    view_count: 1247,
    like_count: 89,
    comment_count: 23,
    issue_number: '2024-01',
    section: 'Culture',
    is_cover_story: true,
    is_featured: true,
    article_type: 'feature',
    photo_essay: false,
    gallery_images: [],
    pull_quotes: []
  }
];

export default MagazineManagementPage;