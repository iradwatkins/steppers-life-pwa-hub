import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Eye, Clock, Share, Bookmark } from 'lucide-react';
import { useMagazine } from '@/hooks/useMagazine';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import ImageWithLoading from '@/components/ui/ImageWithLoading';

export default function MagazineArticlePage() {
  const navigate = useNavigate();
  const { articleSlug } = useParams<{ articleSlug: string }>();
  const { getArticleBySlug, loading, error } = useMagazine();
  const [article, setArticle] = useState<any>(null);

  useEffect(() => {
    if (articleSlug) {
      loadArticle();
    }
  }, [articleSlug]);

  const loadArticle = async () => {
    if (!articleSlug) return;
    
    try {
      const articleData = await getArticleBySlug(articleSlug);
      setArticle(articleData);
    } catch (err) {
      console.error('Error loading article:', err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderContentBlock = (block: any) => {
    switch (block.type) {
      case 'header':
        return (
          <h2 key={block.id} className="text-2xl font-bold mt-8 mb-4">
            {block.content}
          </h2>
        );
      case 'subheader':
        return (
          <h3 key={block.id} className="text-xl font-semibold mt-6 mb-3">
            {block.content}
          </h3>
        );
      case 'paragraph':
        return (
          <div 
            key={block.id} 
            className="prose prose-lg max-w-none mb-6"
            dangerouslySetInnerHTML={{ __html: block.content }}
          />
        );
      case 'image':
        const imageData = JSON.parse(block.content || '{}');
        return (
          <div key={block.id} className="my-8">
            <ImageWithLoading
              src={imageData.url}
              alt={imageData.alt || ''}
              className="w-full rounded-lg"
            />
            {imageData.caption && (
              <p className="text-sm text-muted-foreground mt-2 text-center">
                {imageData.caption}
              </p>
            )}
          </div>
        );
      case 'youtube_video':
        const videoData = JSON.parse(block.content || '{}');
        return (
          <div key={block.id} className="my-8">
            <div className="aspect-video">
              <iframe
                className="w-full h-full rounded-lg"
                src={`https://www.youtube.com/embed/${videoData.videoId}`}
                title={videoData.title || 'Video'}
                frameBorder="0"
                allowFullScreen
              />
            </div>
            {videoData.title && (
              <p className="text-sm text-muted-foreground mt-2 text-center">
                {videoData.title}
              </p>
            )}
          </div>
        );
      case 'embedded_video':
        return (
          <div 
            key={block.id} 
            className="my-8"
            dangerouslySetInnerHTML={{ __html: block.content }}
          />
        );
      case 'ad_placement':
        return (
          <div key={block.id} className="my-8 p-8 bg-muted rounded-lg text-center">
            <p className="text-muted-foreground">Advertisement</p>
            {/* This would be replaced with actual ad content */}
          </div>
        );
      default:
        return null;
    }
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Error Loading Article</h1>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <Skeleton className="h-8 w-32 mb-4" />
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-6 w-full mb-2" />
          <Skeleton className="h-6 w-2/3" />
        </div>
        <Skeleton className="aspect-video w-full mb-8" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Article Not Found</h1>
          <p className="text-muted-foreground mb-4">
            The article you're looking for doesn't exist or has been moved.
          </p>
          <Button onClick={() => navigate('/magazine')}>
            Back to Magazine
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Navigation */}
      <div className="mb-8">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate('/magazine')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Magazine
        </Button>
        
        {article.category && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/magazine/${article.category.slug}`)}
            className="ml-2"
          >
            {article.category.name}
          </Button>
        )}
      </div>

      {/* Article Header */}
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-6 leading-tight">
          {article.title}
        </h1>
        
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Avatar className="w-12 h-12">
              <AvatarImage src={article.authorAvatar} />
              <AvatarFallback>
                <User className="w-5 h-5" />
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{article.authorName || 'Editorial Team'}</p>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(article.createdAt)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{article.readTimeMinutes || 5} min read</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>{article.viewCount || 0} views</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Share className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm">
              <Bookmark className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {article.featuredImage && (
          <ImageWithLoading
            src={article.featuredImage}
            alt={article.title}
            className="w-full aspect-video rounded-lg mb-8"
          />
        )}
      </header>

      {/* Article Content */}
      <article className="prose prose-lg max-w-none">
        {article.contentBlocks && article.contentBlocks.length > 0 ? (
          article.contentBlocks
            .sort((a: any, b: any) => a.order - b.order)
            .map((block: any) => renderContentBlock(block))
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No content available for this article.</p>
          </div>
        )}
      </article>

      {/* Article Footer */}
      <footer className="mt-12 pt-8 border-t">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {article.category && (
              <Badge variant="secondary">
                {article.category.name}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Share className="w-4 h-4 mr-2" />
              Share Article
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
} 