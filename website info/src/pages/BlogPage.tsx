import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Calendar, Tag, Filter, X } from 'lucide-react';
import { useBlog } from '@/hooks/useBlog';
import { BlogSearchFilters } from '@/types/blog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import ImageWithLoading from '@/components/ui/ImageWithLoading';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function BlogPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { posts, categories, featuredPosts, loading, error, fetchPublishedPosts } = useBlog();
  const isInitialLoad = useRef(true);
  
  const [filters, setFilters] = useState<BlogSearchFilters>({
    query: searchParams.get('q') || '',
    category: searchParams.get('category') || '',
    tag: searchParams.get('tag') || '',
  });

  const [showFilters, setShowFilters] = useState(false);

  // Apply filters when they change (debounced to prevent excessive calls)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isInitialLoad.current) {
        // Check if we have URL params that require filtering
        const hasUrlParams = searchParams.get('q') || searchParams.get('category') || searchParams.get('tag');
        if (hasUrlParams) {
          // Only fetch if we have URL params different from default
          fetchPublishedPosts(filters);
        }
        isInitialLoad.current = false;
      } else {
        fetchPublishedPosts(filters);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [filters, fetchPublishedPosts, searchParams]);

  // Update URL params when filters change (separate effect to avoid re-fetching loop)
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.query) params.set('q', filters.query);
    if (filters.category) params.set('category', filters.category);
    if (filters.tag) params.set('tag', filters.tag);
    setSearchParams(params);
  }, [filters, setSearchParams]);

  const handleFilterChange = (key: keyof BlogSearchFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      category: '',
      tag: '',
    });
  };

  const hasActiveFilters = filters.query || filters.category || filters.tag;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const PostCard = ({ post }: { post: any }) => (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
      onClick={() => navigate(`/blog/${post.slug}`)}
    >
      {post.featuredImage && (
        <ImageWithLoading
          src={post.featuredImage}
          alt={post.title}
          className="aspect-video rounded-t-lg bg-muted"
          loading="lazy"
        />
      )}
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Avatar className="w-6 h-6">
            <AvatarImage src={post.authorAvatar} />
            <AvatarFallback>{post.authorName[0]}</AvatarFallback>
          </Avatar>
          <span>{post.authorName}</span>
          <span>•</span>
          <Calendar className="w-4 h-4" />
          <span>{formatDate(post.publishedAt)}</span>
          <span>•</span>
          <span>{post.readTimeMinutes} min read</span>
        </div>
        <CardTitle className="line-clamp-2 hover:text-primary transition-colors">
          {post.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-muted-foreground mb-4 line-clamp-3">
          {post.excerpt}
        </p>
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.slice(0, 3).map((tag: string) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {post.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{post.tags.length - 3} more
            </Badge>
          )}
        </div>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{post.viewCount} views</span>
          {post.featured && (
            <Badge variant="default" className="text-xs">
              Featured
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const FeaturedPostCard = ({ post }: { post: any }) => (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-shadow duration-200 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20"
      onClick={() => navigate(`/blog/${post.slug}`)}
    >
      <div className="flex flex-col md:flex-row">
        {post.featuredImage && (
          <ImageWithLoading
            src={post.featuredImage}
            alt={post.title}
            className="md:w-1/3 aspect-video md:aspect-square rounded-t-lg md:rounded-l-lg md:rounded-t-none bg-muted"
            loading="lazy"
          />
        )}
        <div className="flex-1 p-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <Badge variant="default" className="text-xs">
              Featured
            </Badge>
            <span>•</span>
            <Avatar className="w-5 h-5">
              <AvatarImage src={post.authorAvatar} />
              <AvatarFallback>{post.authorName[0]}</AvatarFallback>
            </Avatar>
            <span>{post.authorName}</span>
            <span>•</span>
            <span>{formatDate(post.publishedAt)}</span>
          </div>
          <h2 className="text-xl font-semibold mb-3 line-clamp-2 hover:text-primary transition-colors">
            {post.title}
          </h2>
          <p className="text-muted-foreground mb-4 line-clamp-2">
            {post.excerpt}
          </p>
          <div className="flex flex-wrap gap-2">
            {post.tags.slice(0, 4).map((tag: string) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Error Loading Blog</h1>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">SteppersLife Blog</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Discover dance tips, event planning guides, community spotlights, and insights from instructors.
        </p>
      </div>

      {/* Featured Posts */}
      {featuredPosts.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Featured Posts</h2>
          <div className="space-y-6">
            {featuredPosts.map((post) => (
              <FeaturedPostCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      )}

      {/* Search and Filters */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <label htmlFor="blog-search" className="sr-only">
              Search blog posts
            </label>
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              id="blog-search"
              name="blog-search"
              placeholder="Search blog posts..."
              value={filters.query}
              onChange={(e) => handleFilterChange('query', e.target.value)}
              className="pl-10"
              aria-label="Search blog posts"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="sm:w-auto"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>

        {showFilters && (
          <Card className="p-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="category-filter" className="text-sm font-medium mb-2 block">Category</label>
                <Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value)}>
                  <SelectTrigger id="category-filter" name="category-filter" aria-label="Filter posts by category">
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.slug}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label htmlFor="tag-filter" className="text-sm font-medium mb-2 block">Tag</label>
                <Input
                  id="tag-filter"
                  name="tag-filter"
                  placeholder="Filter by tag..."
                  value={filters.tag}
                  onChange={(e) => handleFilterChange('tag', e.target.value)}
                  aria-label="Filter posts by tag"
                />
              </div>
            </div>
            {hasActiveFilters && (
              <div className="mt-4 pt-4 border-t">
                <Button variant="ghost" onClick={clearFilters} size="sm">
                  <X className="w-4 h-4 mr-2" />
                  Clear Filters
                </Button>
              </div>
            )}
          </Card>
        )}
      </div>

      {/* Posts Grid */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">
            {hasActiveFilters ? 'Search Results' : 'Latest Posts'}
          </h2>
          {posts.length > 0 && (
            <span className="text-muted-foreground">
              {posts.length} post{posts.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <Skeleton className="aspect-video w-full" />
                <CardHeader>
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-6 w-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold mb-2">No posts found</h3>
            <p className="text-muted-foreground mb-4">
              {hasActiveFilters 
                ? 'Try adjusting your search filters or browse all posts.'
                : 'Check back later for new blog posts!'
              }
            </p>
            {hasActiveFilters && (
              <Button onClick={clearFilters} variant="outline">
                Clear Filters
              </Button>
            )}
          </div>
        )}
      </section>

      {/* Categories Sidebar */}
      {categories.length > 0 && (
        <section className="mt-12">
          <h3 className="text-xl font-semibold mb-4">Browse by Category</h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={filters.category === category.slug ? "default" : "outline"}
                size="sm"
                onClick={() => handleFilterChange('category', 
                  filters.category === category.slug ? '' : category.slug
                )}
                className="mb-2"
              >
                <Tag className="w-3 h-3 mr-1" />
                {category.name}
                <Badge variant="secondary" className="ml-2 text-xs">
                  {category.postCount}
                </Badge>
              </Button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
} 