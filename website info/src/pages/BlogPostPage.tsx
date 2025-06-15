import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Eye, Clock, Share2, Tag, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useBlog } from '@/hooks/useBlog';
import { BlogPost } from '@/types/blog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { posts, loading: postsLoading, fetchPostBySlug } = useBlog();
  
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    const loadPost = async () => {
      if (!slug) {
        setError('Post not found');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const fetchedPost = await fetchPostBySlug(slug);
        
        if (!fetchedPost) {
          setError('Post not found');
        } else {
          setPost(fetchedPost);
          
          // Find related posts based on categories and tags
          const related = posts
            .filter(p => 
              p.id !== fetchedPost.id && 
              (p.categories.some(cat => fetchedPost.categories.includes(cat)) ||
               p.tags.some(tag => fetchedPost.tags.includes(tag)))
            )
            .slice(0, 3);
          setRelatedPosts(related);
        }
      } catch (err) {
        setError('Failed to load blog post');
        console.error('Error loading post:', err);
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [slug, fetchPostBySlug, posts]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleShare = async () => {
    if (navigator.share && post) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: window.location.href,
        });
      } catch (err) {
        // Fallback to clipboard
        navigator.clipboard.writeText(window.location.href);
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const EmbedRenderer = ({ embed }: { embed: any }) => {
    if (embed.type === 'youtube') {
      const videoId = embed.url.split('v=')[1]?.split('&')[0];
      const embedUrl = `https://www.youtube.com/embed/${videoId}${embed.startTime ? `?start=${embed.startTime}` : ''}${embed.endTime ? `&end=${embed.endTime}` : ''}`;
      
      return (
        <div className="my-8">
          <div className="aspect-video">
            <iframe
              src={embedUrl}
              title={embed.title || 'Video'}
              className="w-full h-full rounded-lg"
              allowFullScreen
            />
          </div>
          {embed.title && (
            <p className="text-sm text-muted-foreground mt-2 text-center">
              {embed.title}
            </p>
          )}
        </div>
      );
    } else if (embed.type === 'image') {
      return (
        <div className="my-8">
          <img
            src={embed.url}
            alt={embed.title || 'Embedded image'}
            className="w-full rounded-lg"
          />
          {embed.description && (
            <p className="text-sm text-muted-foreground mt-2 text-center italic">
              {embed.description}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Post Not Found</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => navigate('/blog')} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button variant="ghost" onClick={() => navigate('/blog')} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Blog
        </Button>
        
        <div className="space-y-6">
          <Skeleton className="h-12 w-3/4" />
          <div className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <Skeleton className="aspect-video w-full" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Back Button */}
      <Button variant="ghost" onClick={() => navigate('/blog')} className="mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Blog
      </Button>

      <article className="mb-12">
        {/* Post Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-6 leading-tight">
            {post.title}
          </h1>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <div className="flex items-center space-x-4">
              <Avatar className="w-12 h-12">
                <AvatarImage src={post.authorAvatar} />
                <AvatarFallback>
                  <User className="w-6 h-6" />
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{post.authorName}</p>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <span className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {formatDate(post.publishedAt!)}
                  </span>
                  <span className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {post.readTimeMinutes} min read
                  </span>
                  <span className="flex items-center">
                    <Eye className="w-4 h-4 mr-1" />
                    {post.viewCount} views
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              {post.featured && (
                <Badge variant="default">Featured</Badge>
              )}
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                <Tag className="w-3 h-3 mr-1" />
                {tag}
              </Badge>
            ))}
          </div>

          {/* Featured Image */}
          {post.featuredImage && (
            <div className="aspect-video mb-8 overflow-hidden rounded-lg">
              <img
                src={post.featuredImage}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </header>

        {/* Post Content */}
        <div className="prose prose-lg max-w-none">
          <ReactMarkdown
            components={{
              h1: ({ children }) => <h1 className="text-3xl font-bold mt-8 mb-4">{children}</h1>,
              h2: ({ children }) => <h2 className="text-2xl font-semibold mt-8 mb-4">{children}</h2>,
              h3: ({ children }) => <h3 className="text-xl font-semibold mt-6 mb-3">{children}</h3>,
              p: ({ children }) => <p className="mb-4 leading-relaxed">{children}</p>,
              ul: ({ children }) => <ul className="list-disc pl-6 mb-4 space-y-2">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal pl-6 mb-4 space-y-2">{children}</ol>,
              li: ({ children }) => <li className="leading-relaxed">{children}</li>,
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-primary pl-4 italic my-6 text-muted-foreground">
                  {children}
                </blockquote>
              ),
              code: ({ children }) => (
                <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
                  {children}
                </code>
              ),
              pre: ({ children }) => (
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto mb-4">
                  {children}
                </pre>
              ),
            }}
          >
            {post.content}
          </ReactMarkdown>
          
          {/* Render Embeds */}
          {post.embeds.length > 0 && (
            <div className="mt-8">
              {post.embeds.map((embed) => (
                <EmbedRenderer key={embed.id} embed={embed} />
              ))}
            </div>
          )}
        </div>
      </article>

      <Separator className="my-12" />

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold mb-6">Related Posts</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedPosts.map((relatedPost) => (
              <Card key={relatedPost.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <Link to={`/blog/${relatedPost.slug}`}>
                  {relatedPost.featuredImage && (
                    <div className="aspect-video overflow-hidden rounded-t-lg">
                      <img
                        src={relatedPost.featuredImage}
                        alt={relatedPost.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                      />
                    </div>
                  )}
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg line-clamp-2">
                      {relatedPost.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                      {relatedPost.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{formatDate(relatedPost.publishedAt!)}</span>
                      <span>{relatedPost.readTimeMinutes} min read</span>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* SEO Meta */}
      {(post.seoTitle || post.seoDescription) && (
        <div className="hidden">
          <meta name="title" content={post.seoTitle || post.title} />
          <meta name="description" content={post.seoDescription || post.excerpt} />
          <meta property="og:title" content={post.seoTitle || post.title} />
          <meta property="og:description" content={post.seoDescription || post.excerpt} />
          {post.featuredImage && (
            <meta property="og:image" content={post.featuredImage} />
          )}
        </div>
      )}
    </div>
  );
} 