import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Book, Grid, List, Search, Filter } from 'lucide-react';
import { useMagazine } from '@/hooks/useMagazine';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import ImageWithLoading from '@/components/ui/ImageWithLoading';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function MagazinePage() {
  const navigate = useNavigate();
  const { categories, featuredArticles, loading, error } = useMagazine();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const CategoryCard = ({ category }: { category: any }) => (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-all duration-300 group"
      onClick={() => navigate(`/magazine/${category.slug}`)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Book className="w-8 h-8 text-primary" />
          <Badge variant="outline" className="text-xs">
            {category.articleCount || 0} articles
          </Badge>
        </div>
        <CardTitle className="group-hover:text-primary transition-colors">
          {category.name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
          {category.description || `Explore our collection of ${category.name.toLowerCase()} articles`}
        </p>
        <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
          Browse Category
        </Button>
      </CardContent>
    </Card>
  );

  const FeaturedArticleCard = ({ article }: { article: any }) => (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-all duration-300"
      onClick={() => navigate(`/magazine/article/${article.slug}`)}
    >
      <div className="flex flex-col md:flex-row">
        {article.featuredImage && (
          <ImageWithLoading
            src={article.featuredImage}
            alt={article.title}
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
            <span>{article.category?.name}</span>
            <span>•</span>
            <span>{new Date(article.createdAt).toLocaleDateString()}</span>
          </div>
          <h3 className="text-xl font-semibold mb-3 line-clamp-2 hover:text-primary transition-colors">
            {article.title}
          </h3>
          <p className="text-muted-foreground mb-4 line-clamp-2">
            {article.excerpt || 'Read this featured article from our magazine.'}
          </p>
          <Button variant="outline" className="hover:bg-primary hover:text-primary-foreground transition-colors">
            Read Article
          </Button>
        </div>
      </div>
    </Card>
  );

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Error Loading Magazine</h1>
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
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          SteppersLife Magazine
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Discover in-depth articles, expert insights, and inspiring stories from the world of dance and fitness. 
          Our magazine features curated content organized into engaging categories.
        </p>
      </div>

      {/* Featured Articles */}
      {featuredArticles.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <Book className="w-6 h-6" />
            Featured Stories
          </h2>
          <div className="space-y-6">
            {featuredArticles.map((article) => (
              <FeaturedArticleCard key={article.id} article={article} />
            ))}
          </div>
        </section>
      )}

      {/* Categories Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Grid className="w-6 h-6" />
            Browse Categories
          </h2>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
              : 'grid-cols-1'
          }`}>
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-8 w-8 rounded" />
                  <Skeleton className="h-6 w-3/4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3 mb-4" />
                  <Skeleton className="h-9 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredCategories.length > 0 ? (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
              : 'grid-cols-1 max-w-2xl mx-auto'
          }`}>
            {filteredCategories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold mb-2">
              {searchQuery ? 'No categories found' : 'No categories available'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery 
                ? `No categories match "${searchQuery}". Try a different search term.`
                : 'Categories will appear here once they are created by our editors.'
              }
            </p>
            {searchQuery && (
              <Button onClick={() => setSearchQuery('')} variant="outline">
                Clear Search
              </Button>
            )}
          </div>
        )}
      </section>

      {/* Call to Action */}
      <section className="mt-16 text-center bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-8">
        <h3 className="text-2xl font-semibold mb-4">Stay Updated</h3>
        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
          Get the latest articles and insights delivered to your inbox. Join our community of dance enthusiasts.
        </p>
        <Button size="lg" onClick={() => navigate('/profile')}>
          Subscribe to Updates
        </Button>
      </section>
    </div>
  );
} 