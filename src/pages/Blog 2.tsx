import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { BlogPost, BlogCategory, BlogTag, BlogListFilters } from '@/types/blog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Calendar, Clock, Eye, Heart, MessageCircle, Play } from 'lucide-react';
import { formatDistanceToNow, parseISO } from 'date-fns';

const Blog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [tags, setTags] = useState<BlogTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedTag, setSelectedTag] = useState(searchParams.get('tag') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'published_at');

  useEffect(() => {
    fetchBlogData();
  }, [searchParams]);

  const fetchBlogData = async () => {
    setLoading(true);
    try {
      const filters: BlogListFilters = {
        search: searchParams.get('search') || undefined,
        category: searchParams.get('category') || undefined,
        tag: searchParams.get('tag') || undefined,
        sort_by: (searchParams.get('sort') as any) || 'published_at',
        sort_order: 'desc',
        status: 'published'
      };

      const response = await fetch('/api/blog/posts?' + new URLSearchParams(filters as any));
      const data = await response.json();
      setPosts(data.posts || []);
      setCategories(data.categories || []);
      setTags(data.tags || []);
    } catch (error) {
      console.error('Error fetching blog data:', error);
      setPosts(mockBlogPosts);
      setCategories(mockCategories);
      setTags(mockTags);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: searchTerm });
  };

  const updateFilters = (newFilters: Partial<BlogListFilters>) => {
    const current = Object.fromEntries(searchParams.entries());
    const updated = { ...current, ...newFilters };
    
    Object.keys(updated).forEach(key => {
      if (!updated[key] || updated[key] === '') {
        delete updated[key];
      }
    });

    setSearchParams(new URLSearchParams(updated));
  };

  const calculateReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(' ').length;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  const PostCard = ({ post }: { post: BlogPost }) => (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {post.featured_image && (
        <div className="relative h-48 overflow-hidden">
          <img 
            src={post.featured_image} 
            alt={post.featured_image_alt || post.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
          {post.youtube_video_id && (
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
              <Play className="h-12 w-12 text-white" />
            </div>
          )}
        </div>
      )}
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          {post.categories.map(category => (
            <Badge 
              key={category.id} 
              variant="secondary"
              style={{ backgroundColor: category.color }}
              className="text-xs"
            >
              {category.name}
            </Badge>
          ))}
        </div>
        <CardTitle className="line-clamp-2 hover:text-primary transition-colors">
          <Link to={`/blog/${post.slug}`}>
            {post.title}
          </Link>
        </CardTitle>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {post.excerpt}
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={post.author_avatar} />
              <AvatarFallback>{post.author_name.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground">{post.author_name}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {formatDistanceToNow(parseISO(post.published_at || post.created_at), { addSuffix: true })}
          </div>
        </div>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {post.reading_time_minutes || calculateReadingTime(post.content)} min read
            </div>
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {post.view_count}
            </div>
            <div className="flex items-center gap-1">
              <Heart className="h-3 w-3" />
              {post.like_count}
            </div>
          </div>
          <div className="flex gap-1">
            {post.tags.slice(0, 2).map(tag => (
              <Badge key={tag.id} variant="outline" className="text-xs px-1 py-0">
                {tag.name}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Steppers Life Blog</h1>
        <p className="text-xl text-muted-foreground">
          Discover the latest in stepper dance, fitness, and community stories
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8 space-y-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search blog posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit">Search</Button>
        </form>

        <div className="flex flex-wrap gap-4">
          <Select value={selectedCategory} onValueChange={(value) => {
            setSelectedCategory(value);
            updateFilters({ category: value });
          }}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category.id} value={category.slug}>
                  {category.name} ({category.post_count})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedTag} onValueChange={(value) => {
            setSelectedTag(value);
            updateFilters({ tag: value });
          }}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Tags" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Tags</SelectItem>
              {tags.map(tag => (
                <SelectItem key={tag.id} value={tag.slug}>
                  {tag.name} ({tag.post_count})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(value) => {
            setSortBy(value);
            updateFilters({ sort: value });
          }}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="published_at">Latest</SelectItem>
              <SelectItem value="view_count">Most Viewed</SelectItem>
              <SelectItem value="like_count">Most Liked</SelectItem>
              <SelectItem value="title">Alphabetical</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Blog Posts Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="h-48 bg-muted animate-pulse" />
              <CardHeader>
                <div className="h-4 bg-muted animate-pulse rounded mb-2" />
                <div className="h-6 bg-muted animate-pulse rounded mb-2" />
                <div className="h-4 bg-muted animate-pulse rounded" />
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold mb-2">No blog posts found</h3>
          <p className="text-muted-foreground">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
};

// Mock data for development
const mockCategories: BlogCategory[] = [
  { id: '1', name: 'Dance Techniques', slug: 'dance-techniques', post_count: 15, created_at: '2024-01-01', updated_at: '2024-01-01', color: '#3B82F6' },
  { id: '2', name: 'Fitness & Health', slug: 'fitness-health', post_count: 12, created_at: '2024-01-01', updated_at: '2024-01-01', color: '#10B981' },
  { id: '3', name: 'Community Stories', slug: 'community-stories', post_count: 8, created_at: '2024-01-01', updated_at: '2024-01-01', color: '#F59E0B' },
];

const mockTags: BlogTag[] = [
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
    featured_image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500',
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
  },
  {
    id: '2',
    title: 'The Health Benefits of Stepper Dancing',
    slug: 'health-benefits-stepper-dancing',
    excerpt: 'Discover how stepper dancing can improve your cardiovascular health, coordination, and mental well-being.',
    content: '<p>Lorem ipsum dolor sit amet...</p>',
    featured_image: 'https://images.unsplash.com/photo-1594736797933-d0401ba4e5b6?w=500',
    author_id: '2',
    author_name: 'Dr. Michael Chen',
    status: 'published',
    published_at: '2024-06-19T14:00:00Z',
    created_at: '2024-06-19T14:00:00Z',
    updated_at: '2024-06-19T14:00:00Z',
    categories: [mockCategories[1]],
    tags: [mockTags[0]],
    reading_time_minutes: 7,
    view_count: 890,
    like_count: 65,
    comment_count: 8,
    youtube_video_id: 'dQw4w9WgXcQ'
  }
];

export default Blog;