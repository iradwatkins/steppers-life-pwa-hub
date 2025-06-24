
import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MagazineArticle, MagazineCategory, MagazineTag, MagazineListFilters } from '@/types/magazine';
import { magazineService } from '@/services/magazineService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Calendar, User, Clock, Eye, Heart, Play, Star } from 'lucide-react';
import { formatDistanceToNow, parseISO } from 'date-fns';

const Magazine = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [articles, setArticles] = useState<MagazineArticle[]>([]);
  const [categories, setCategories] = useState<MagazineCategory[]>([]);
  const [tags, setTags] = useState<MagazineTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [selectedSection, setSelectedSection] = useState(searchParams.get('section') || 'all');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'published_at');

  const sections = [
    { id: 'all', name: 'All Sections' },
    { id: 'culture', name: 'Culture & History' },
    { id: 'techniques', name: 'Techniques' },
    { id: 'profiles', name: 'Profiles' },
    { id: 'events', name: 'Event Coverage' },
    { id: 'fashion', name: 'Fashion & Style' },
    { id: 'editorial', name: 'Editorial' }
  ];

  useEffect(() => {
    fetchMagazineData();
  }, [searchParams]);

  const fetchMagazineData = async () => {
    setLoading(true);
    try {
      const filters: MagazineListFilters = {
        search: searchParams.get('search') || undefined,
        category: searchParams.get('category') || undefined,
        section: searchParams.get('section') || undefined,
        sort_by: (searchParams.get('sort') as any) || 'published_at',
        sort_order: 'desc',
        status: 'published'
      };

      const data = await magazineService.getArticles(filters);
      setArticles(data.articles);
      setCategories(data.categories);
      setTags(data.tags);
    } catch (error) {
      console.error('Error fetching magazine data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: searchTerm });
  };

  const updateFilters = (newFilters: Partial<MagazineListFilters>) => {
    const current = Object.fromEntries(searchParams.entries());
    const updated = { ...current, ...newFilters };
    
    Object.keys(updated).forEach(key => {
      if (!updated[key] || updated[key] === '' || updated[key] === 'all') {
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

  const filteredArticles = articles.filter(article => {
    const matchesSearch = searchTerm === '' || 
                         article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
                           article.categories.some(cat => cat.slug === selectedCategory);
    const matchesSection = selectedSection === 'all' || article.section.toLowerCase() === selectedSection;
    return matchesSearch && matchesCategory && matchesSection;
  });

  const featuredArticles = articles.filter(article => article.is_featured);
  const coverStoryArticle = articles.find(article => article.is_cover_story);
  const otherArticles = filteredArticles.filter(article => !article.is_featured && !article.is_cover_story);

  const ArticleCard = ({ article }: { article: MagazineArticle }) => (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {article.featured_image && (
        <div className="relative h-48 overflow-hidden">
          <img 
            src={article.featured_image} 
            alt={article.featured_image_alt || article.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
          {article.youtube_video_id && (
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
              <Play className="h-12 w-12 text-white" />
            </div>
          )}
          {article.is_cover_story && (
            <div className="absolute top-2 left-2">
              <Badge className="bg-red-600 text-white">
                <Star className="h-3 w-3 mr-1" />
                Cover Story
              </Badge>
            </div>
          )}
          {article.is_featured && (
            <div className="absolute top-2 right-2">
              <Badge className="bg-stepping-gradient">Featured</Badge>
            </div>
          )}
        </div>
      )}
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          {article.categories.map(category => (
            <Badge 
              key={category.id} 
              variant="secondary"
              style={{ backgroundColor: category.color }}
              className="text-xs"
            >
              {category.name}
            </Badge>
          ))}
          <Badge variant="outline" className="text-xs">
            {article.section}
          </Badge>
        </div>
        <CardTitle className="line-clamp-2 hover:text-primary transition-colors">
          <Link to={`/magazine/${article.slug}`}>
            {article.title}
          </Link>
        </CardTitle>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {article.excerpt}
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={article.author_avatar} />
              <AvatarFallback>{article.author_name.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground">{article.author_name}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {formatDistanceToNow(parseISO(article.published_at || article.created_at), { addSuffix: true })}
          </div>
        </div>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {article.reading_time_minutes || calculateReadingTime(article.content)} min read
            </div>
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {article.view_count}
            </div>
            <div className="flex items-center gap-1">
              <Heart className="h-3 w-3" />
              {article.like_count}
            </div>
          </div>
          <div className="flex gap-1">
            {article.tags.slice(0, 2).map(tag => (
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
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">SteppersLife Magazine</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your premier source for stepping culture, techniques, profiles, and community stories
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1 max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search magazine articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit">Search</Button>
          </form>
          
          <div className="flex flex-wrap gap-4 justify-center">
            <Select value={selectedCategory} onValueChange={(value) => {
              setSelectedCategory(value);
              updateFilters({ category: value });
            }}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.slug}>
                    {category.name} ({category.post_count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedSection} onValueChange={(value) => {
              setSelectedSection(value);
              updateFilters({ section: value });
            }}>
              <SelectTrigger className="w-48">
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

        {/* Cover Story */}
        {coverStoryArticle && !searchTerm && selectedCategory === 'all' && selectedSection === 'all' && (
          <div className="mb-12">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">Cover Story</h2>
              <div className="w-24 h-1 bg-stepping-gradient mx-auto"></div>
            </div>
            <Card className="overflow-hidden">
              <div className="md:flex">
                <div className="md:w-1/2">
                  <div className="aspect-video md:aspect-square bg-muted">
                    {coverStoryArticle.featured_image && (
                      <img 
                        src={coverStoryArticle.featured_image} 
                        alt={coverStoryArticle.featured_image_alt || coverStoryArticle.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                </div>
                <div className="md:w-1/2 p-6 md:p-8">
                  <Badge className="mb-4 bg-red-600 text-white">
                    <Star className="h-3 w-3 mr-1" />
                    Cover Story
                  </Badge>
                  <CardTitle className="text-2xl md:text-3xl mb-4">{coverStoryArticle.title}</CardTitle>
                  <CardDescription className="text-base mb-6">{coverStoryArticle.excerpt}</CardDescription>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {coverStoryArticle.author_name}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDistanceToNow(parseISO(coverStoryArticle.published_at || coverStoryArticle.created_at), { addSuffix: true })}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {coverStoryArticle.reading_time_minutes} min read
                    </div>
                  </div>
                  <Link to={`/magazine/${coverStoryArticle.slug}`}>
                    <Button size="lg" className="bg-stepping-gradient">Read Cover Story</Button>
                  </Link>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Featured Articles Section */}
        {featuredArticles.length > 0 && !searchTerm && selectedCategory === 'all' && selectedSection === 'all' && (
          <div className="mb-12">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">Featured Articles</h2>
              <div className="w-24 h-1 bg-stepping-gradient mx-auto"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredArticles.slice(0, 3).map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </div>
        )}

        {/* Articles Grid */}
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
                <CardContent>
                  <div className="h-4 bg-muted animate-pulse rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : otherArticles.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">No articles found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        ) : (
          <>
            {/* Section Header */}
            {(searchTerm || selectedCategory !== 'all' || selectedSection !== 'all') && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">
                  {searchTerm ? `Search results for "${searchTerm}"` :
                   selectedSection !== 'all' ? `${sections.find(s => s.id === selectedSection)?.name} Articles` :
                   selectedCategory !== 'all' ? `${categories.find(c => c.slug === selectedCategory)?.name} Articles` :
                   'All Articles'}
                </h2>
                <p className="text-muted-foreground">{otherArticles.length} article{otherArticles.length !== 1 ? 's' : ''} found</p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {otherArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </>
        )}

        {/* Load More - Future Enhancement */}
        {!loading && otherArticles.length > 0 && otherArticles.length % 9 === 0 && (
          <div className="text-center mt-12">
            <Button variant="outline" size="lg" onClick={fetchMagazineData}>
              Load More Articles
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Magazine;
