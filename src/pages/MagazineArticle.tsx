import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MagazineArticle as MagazineArticleType, MagazineComment } from '@/types/magazine';
import { magazineService } from '@/services/magazineService';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import RichTextEditor from '@/components/ui/rich-text-editor';
import { ArrowLeft, Calendar, Clock, Eye, Heart, MessageCircle, Share2, Play, Star, Quote } from 'lucide-react';
import { formatDistanceToNow, parseISO, format } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';

const MagazineArticle = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [article, setArticle] = useState<MagazineArticleType | null>(null);
  const [comments, setComments] = useState<MagazineComment[]>([]);
  const [relatedArticles, setRelatedArticles] = useState<MagazineArticleType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchMagazineArticle();
      incrementViewCount();
    }
  }, [slug]);

  const fetchMagazineArticle = async () => {
    setLoading(true);
    try {
      const articleData = await magazineService.getArticleBySlug(slug!);
      setArticle(articleData);
      
      // Fetch related articles based on categories or section
      const relatedData = await magazineService.getArticlesBySection(articleData.section);
      setRelatedArticles(relatedData.filter(a => a.id !== articleData.id).slice(0, 4));
      
      // Mock comments and like status for now
      setComments(mockComments);
      setIsLiked(false);
    } catch (error) {
      console.error('Error fetching magazine article:', error);
      setArticle(mockMagazineArticle);
      setComments(mockComments);
      setRelatedArticles([]);
    } finally {
      setLoading(false);
    }
  };

  const incrementViewCount = async () => {
    try {
      await fetch(`/api/magazine/articles/${slug}/view`, { method: 'POST' });
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  };

  const handleLike = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(`/api/magazine/articles/${article?.id}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        setIsLiked(!isLiked);
        if (article) {
          setArticle({
            ...article,
            like_count: isLiked ? article.like_count - 1 : article.like_count + 1
          });
        }
      }
    } catch (error) {
      console.error('Error liking article:', error);
    }
  };

  const handleShare = () => {
    if (navigator.share && article) {
      navigator.share({
        title: article.title,
        text: article.excerpt,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    if (!newComment.trim()) return;

    setSubmittingComment(true);
    try {
      const response = await fetch(`/api/magazine/articles/${article?.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment })
      });

      if (response.ok) {
        const comment = await response.json();
        setComments([comment, ...comments]);
        setNewComment('');
        if (article) {
          setArticle({ ...article, comment_count: article.comment_count + 1 });
        }
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const YouTubeEmbed = ({ videoId }: { videoId: string }) => (
    <div className="aspect-video my-8">
      <iframe
        width="100%"
        height="100%"
        src={`https://www.youtube.com/embed/${videoId}`}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="rounded-lg"
      />
    </div>
  );

  const CommentCard = ({ comment }: { comment: MagazineComment }) => (
    <Card className="mb-4">
      <CardContent className="pt-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={comment.user_avatar} />
            <AvatarFallback>{comment.user_name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-medium text-sm">{comment.user_name}</span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(parseISO(comment.created_at), { addSuffix: true })}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{comment.content}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const PullQuoteCard = ({ quote }: { quote: string }) => (
    <div className="my-8 p-6 bg-gradient-to-r from-primary/10 to-secondary/10 border-l-4 border-primary rounded-r-lg">
      <Quote className="h-8 w-8 text-primary mb-4 opacity-60" />
      <blockquote className="text-xl font-medium italic text-foreground leading-relaxed">
        "{quote}"
      </blockquote>
    </div>
  );

  const PhotoGallery = ({ images }: { images: string[] }) => (
    <div className="my-8">
      <h3 className="text-lg font-semibold mb-4">Photo Gallery</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((image, index) => (
          <div key={index} className="aspect-square overflow-hidden rounded-lg">
            <img 
              src={image} 
              alt={`Gallery image ${index + 1}`}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="h-8 bg-muted animate-pulse rounded mb-4" />
          <div className="h-64 bg-muted animate-pulse rounded mb-8" />
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Article Not Found</h1>
          <p className="text-muted-foreground mb-8">The magazine article you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/magazine')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Magazine
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          className="mb-6"
          onClick={() => navigate('/magazine')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Magazine
        </Button>

        {/* Article Header */}
        <article>
          <header className="mb-8">
            <div className="flex flex-wrap gap-2 mb-4">
              {article.categories.map(category => (
                <Badge 
                  key={category.id} 
                  variant="secondary"
                  style={{ backgroundColor: category.color }}
                >
                  <Link to={`/magazine?category=${category.slug}`}>
                    {category.name}
                  </Link>
                </Badge>
              ))}
              <Badge variant="outline" className="text-xs">
                {article.section}
              </Badge>
              <Badge variant="outline" className="text-xs capitalize">
                {article.article_type.replace('_', ' ')}
              </Badge>
              {article.is_cover_story && (
                <Badge className="bg-red-600 text-white">
                  <Star className="h-3 w-3 mr-1" />
                  Cover Story
                </Badge>
              )}
              {article.is_featured && (
                <Badge className="bg-stepping-gradient">Featured</Badge>
              )}
              {article.issue_number && (
                <Badge variant="outline">Issue {article.issue_number}</Badge>
              )}
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">{article.title}</h1>
            
            <p className="text-xl text-muted-foreground mb-6 leading-relaxed">{article.excerpt}</p>

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={article.author_avatar} />
                  <AvatarFallback>{article.author_name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{article.author_name}</p>
                  {article.author_bio && (
                    <p className="text-sm text-muted-foreground">{article.author_bio}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(parseISO(article.published_at || article.created_at), 'MMM d, yyyy')}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {article.reading_time_minutes} min read
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleLike}
                  className={isLiked ? 'text-red-500' : ''}
                >
                  <Heart className={`h-4 w-4 mr-1 ${isLiked ? 'fill-current' : ''}`} />
                  {article.like_count}
                </Button>
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share2 className="h-4 w-4 mr-1" />
                  Share
                </Button>
              </div>
            </div>

            {article.featured_image && (
              <div className="mb-8">
                <img 
                  src={article.featured_image} 
                  alt={article.featured_image_alt || article.title}
                  className="w-full h-64 md:h-96 object-cover rounded-lg"
                />
                {article.featured_image_alt && (
                  <p className="text-sm text-muted-foreground mt-2 text-center italic">
                    {article.featured_image_alt}
                  </p>
                )}
              </div>
            )}
          </header>

          {/* YouTube Video */}
          {article.youtube_video_id && (
            <YouTubeEmbed videoId={article.youtube_video_id} />
          )}

          {/* Article Content */}
          <div className="prose prose-lg max-w-none mb-8">
            <RichTextEditor 
              content={article.content}
              onChange={() => {}}
              editable={false}
              className="border-0"
            />
          </div>

          {/* Pull Quotes */}
          {article.pull_quotes && article.pull_quotes.length > 0 && (
            <div className="mb-8">
              {article.pull_quotes.map((quote, index) => (
                <PullQuoteCard key={index} quote={quote} />
              ))}
            </div>
          )}

          {/* Photo Gallery */}
          {article.gallery_images && article.gallery_images.length > 0 && (
            <PhotoGallery images={article.gallery_images} />
          )}

          {/* Sidebar Content */}
          {article.sidebar_content && (
            <div className="my-8 p-6 bg-muted/50 rounded-lg border-l-4 border-secondary">
              <div className="prose prose-sm max-w-none">
                <RichTextEditor 
                  content={article.sidebar_content}
                  onChange={() => {}}
                  editable={false}
                  className="border-0"
                />
              </div>
            </div>
          )}

          {/* Tags */}
          {article.tags.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {article.tags.map(tag => (
                  <Badge key={tag.id} variant="outline">
                    <Link to={`/magazine?tag=${tag.slug}`}>
                      #{tag.name}
                    </Link>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Separator className="my-8" />

          {/* Article Stats */}
          <div className="flex items-center justify-center gap-6 mb-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {article.view_count} views
            </div>
            <div className="flex items-center gap-1">
              <Heart className="h-4 w-4" />
              {article.like_count} likes
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="h-4 w-4" />
              {article.comment_count} comments
            </div>
          </div>

          <Separator className="my-8" />

          {/* Comments Section */}
          <section>
            <h3 className="text-2xl font-bold mb-6">Comments ({article.comment_count})</h3>
            
            {/* Comment Form */}
            {user ? (
              <form onSubmit={handleCommentSubmit} className="mb-8">
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.user_metadata?.avatar_url} />
                    <AvatarFallback>
                      {user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <RichTextEditor
                      content={newComment}
                      onChange={setNewComment}
                      placeholder="Write a comment..."
                      className="mb-3"
                    />
                    <Button type="submit" disabled={submittingComment || !newComment.trim()}>
                      {submittingComment ? 'Posting...' : 'Post Comment'}
                    </Button>
                  </div>
                </div>
              </form>
            ) : (
              <Card className="mb-8">
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground mb-4">Please log in to leave a comment</p>
                  <Button onClick={() => navigate('/login')}>Log In</Button>
                </CardContent>
              </Card>
            )}

            {/* Comments List */}
            <div>
              {comments.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No comments yet. Be the first to share your thoughts!
                </p>
              ) : (
                comments.map(comment => (
                  <CommentCard key={comment.id} comment={comment} />
                ))
              )}
            </div>
          </section>
        </article>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <section className="mt-12">
            <h3 className="text-2xl font-bold mb-6">More from {article.section}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedArticles.map(relatedArticle => (
                <Card key={relatedArticle.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  {relatedArticle.featured_image && (
                    <div className="h-32 overflow-hidden">
                      <img 
                        src={relatedArticle.featured_image} 
                        alt={relatedArticle.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      {relatedArticle.is_featured && (
                        <Badge className="bg-stepping-gradient text-xs">Featured</Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {relatedArticle.section}
                      </Badge>
                    </div>
                    <h4 className="font-semibold line-clamp-2">
                      <Link to={`/magazine/${relatedArticle.slug}`} className="hover:text-primary">
                        {relatedArticle.title}
                      </Link>
                    </h4>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {relatedArticle.excerpt}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{relatedArticle.author_name}</span>
                      <span>•</span>
                      <span>{relatedArticle.reading_time_minutes} min read</span>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

// Mock data for development
const mockMagazineArticle: MagazineArticleType = {
  id: '1',
  title: 'The Evolution of Chicago Stepping: From the 1970s to Today',
  slug: 'evolution-chicago-stepping-1970s-today',
  excerpt: 'Explore the rich history and cultural significance of Chicago stepping, from its origins in the African American community to its modern-day evolution.',
  content: `
    <h2>Introduction</h2>
    <p>Chicago stepping is a partner dance that combines smooth footwork with elegant styling. This dance form represents more than just movement—it's a cultural expression that has evolved over decades, reflecting the creativity and resilience of the African American community in Chicago.</p>
    
    <h3>The 1970s: Birth of a Movement</h3>
    <p>In the vibrant neighborhoods of Chicago's South and West sides, a new dance form was taking shape. Influenced by the Bop and other partner dances, stepping emerged as a sophisticated alternative that emphasized smoothness over speed.</p>
    
    <h3>The Golden Era: 1980s-1990s</h3>
    <p>During this period, stepping gained popularity across Chicago's social scene. Dance floors in clubs like the Cotton Club and Sabre Room became proving grounds for the finest steppers.</p>
    
    <h3>Modern Evolution</h3>
    <p>Today, Chicago stepping has spread nationwide, with communities of steppers in cities across America. Social media and online platforms have helped preserve and share techniques, ensuring this cultural treasure continues to thrive.</p>
  `,
  featured_image: 'https://images.unsplash.com/photo-1547153760-18fc86324498?w=800',
  featured_image_alt: 'Historic Chicago stepping dancers at a 1980s social event',
  author_id: 'admin',
  author_name: 'Marcus Johnson',
  author_bio: 'Cultural historian specializing in African American dance traditions',
  author_avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
  status: 'published',
  published_at: '2024-01-15T10:00:00Z',
  created_at: '2024-01-14T15:30:00Z',
  updated_at: '2024-01-15T10:00:00Z',
  categories: [
    { id: '1', name: 'Culture & History', slug: 'culture-history', post_count: 12, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z', section_type: 'feature', display_order: 1, color: '#3B82F6' }
  ],
  tags: [
    { id: '1', name: 'Chicago Stepping', slug: 'chicago-stepping', post_count: 15, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
    { id: '2', name: 'History', slug: 'history', post_count: 8, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' }
  ],
  issue_number: '2024-01',
  section: 'Culture',
  is_cover_story: true,
  is_featured: true,
  article_type: 'feature',
  photo_essay: false,
  gallery_images: [],
  pull_quotes: [
    'The elegance of stepping lies not just in the moves, but in the connection between partners and the music.',
    'Chicago stepping represents more than dance—it\'s a cultural legacy that continues to evolve.'
  ],
  reading_time_minutes: 8,
  view_count: 1247,
  like_count: 89,
  comment_count: 23,
  youtube_video_id: 'dQw4w9WgXcQ'
};

const mockComments: MagazineComment[] = [
  {
    id: '1',
    post_id: '1',
    user_id: '2',
    user_name: 'Diana Williams',
    user_avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b4e0?w=150',
    content: 'Excellent article! As someone who has been stepping for over 20 years, this really captures the essence of our dance culture.',
    status: 'approved',
    created_at: '2024-01-15T12:00:00Z',
    updated_at: '2024-01-15T12:00:00Z',
    replies: []
  },
  {
    id: '2',
    post_id: '1',
    user_id: '3',
    user_name: 'Robert Brown',
    user_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    content: 'Great historical perspective. I learned to step in the 90s and remember many of these venues mentioned.',
    status: 'approved',
    created_at: '2024-01-15T14:30:00Z',
    updated_at: '2024-01-15T14:30:00Z',
    replies: []
  }
];

export default MagazineArticle;