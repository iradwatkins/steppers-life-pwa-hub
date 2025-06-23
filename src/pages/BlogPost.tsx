import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { BlogPost as BlogPostType, BlogComment } from '@/types/blog';
import { blogService } from '@/services/blogService';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import RichTextEditor from '@/components/ui/rich-text-editor';
import { ArrowLeft, Calendar, Clock, Eye, Heart, MessageCircle, Share2, Play } from 'lucide-react';
import { formatDistanceToNow, parseISO, format } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState<BlogPostType | null>(null);
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [relatedPosts, setRelatedPosts] = useState<BlogPostType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchBlogPost();
      incrementViewCount();
    }
  }, [slug]);

  const fetchBlogPost = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/blog/posts/${slug}`);
      const data = await response.json();
      setPost(data.post);
      setComments(data.comments || []);
      setRelatedPosts(data.relatedPosts || []);
      setIsLiked(data.isLiked || false);
    } catch (error) {
      console.error('Error fetching blog post:', error);
      setPost(mockBlogPost);
      setComments(mockComments);
      setRelatedPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const incrementViewCount = async () => {
    try {
      await fetch(`/api/blog/posts/${slug}/view`, { method: 'POST' });
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
      const response = await fetch(`/api/blog/posts/${post?.id}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        setIsLiked(!isLiked);
        if (post) {
          setPost({
            ...post,
            like_count: isLiked ? post.like_count - 1 : post.like_count + 1
          });
        }
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleShare = () => {
    if (navigator.share && post) {
      navigator.share({
        title: post.title,
        text: post.excerpt,
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
      const response = await fetch(`/api/blog/posts/${post?.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment })
      });

      if (response.ok) {
        const comment = await response.json();
        setComments([comment, ...comments]);
        setNewComment('');
        if (post) {
          setPost({ ...post, comment_count: post.comment_count + 1 });
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

  const CommentCard = ({ comment }: { comment: BlogComment }) => (
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

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Blog Post Not Found</h1>
          <p className="text-muted-foreground mb-8">The blog post you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/blog')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Blog
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
          onClick={() => navigate('/blog')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Blog
        </Button>

        {/* Article Header */}
        <article>
          <header className="mb-8">
            <div className="flex flex-wrap gap-2 mb-4">
              {post.categories.map(category => (
                <Badge 
                  key={category.id} 
                  variant="secondary"
                  style={{ backgroundColor: category.color }}
                >
                  <Link to={`/blog?category=${category.slug}`}>
                    {category.name}
                  </Link>
                </Badge>
              ))}
            </div>
            
            <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
            
            <p className="text-xl text-muted-foreground mb-6">{post.excerpt}</p>

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={post.author_avatar} />
                  <AvatarFallback>{post.author_name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{post.author_name}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(parseISO(post.published_at || post.created_at), 'MMM d, yyyy')}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {post.reading_time_minutes} min read
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
                  {post.like_count}
                </Button>
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share2 className="h-4 w-4 mr-1" />
                  Share
                </Button>
              </div>
            </div>

            {post.featured_image && (
              <div className="mb-8">
                <img 
                  src={post.featured_image} 
                  alt={post.featured_image_alt || post.title}
                  className="w-full h-64 md:h-96 object-cover rounded-lg"
                />
              </div>
            )}
          </header>

          {/* YouTube Video */}
          {post.youtube_video_id && (
            <YouTubeEmbed videoId={post.youtube_video_id} />
          )}

          {/* Article Content */}
          <div className="prose prose-lg max-w-none mb-8">
            <RichTextEditor 
              content={post.content}
              onChange={() => {}}
              editable={false}
              className="border-0"
            />
          </div>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {post.tags.map(tag => (
                  <Badge key={tag.id} variant="outline">
                    <Link to={`/blog?tag=${tag.slug}`}>
                      #{tag.name}
                    </Link>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Separator className="my-8" />

          {/* Post Stats */}
          <div className="flex items-center justify-center gap-6 mb-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {post.view_count} views
            </div>
            <div className="flex items-center gap-1">
              <Heart className="h-4 w-4" />
              {post.like_count} likes
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="h-4 w-4" />
              {post.comment_count} comments
            </div>
          </div>

          <Separator className="my-8" />

          {/* Comments Section */}
          <section>
            <h3 className="text-2xl font-bold mb-6">Comments ({post.comment_count})</h3>
            
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

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="mt-12">
            <h3 className="text-2xl font-bold mb-6">Related Posts</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedPosts.map(relatedPost => (
                <Card key={relatedPost.id} className="overflow-hidden">
                  {relatedPost.featured_image && (
                    <div className="h-32 overflow-hidden">
                      <img 
                        src={relatedPost.featured_image} 
                        alt={relatedPost.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <h4 className="font-semibold line-clamp-2">
                      <Link to={`/blog/${relatedPost.slug}`} className="hover:text-primary">
                        {relatedPost.title}
                      </Link>
                    </h4>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {relatedPost.excerpt}
                    </p>
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
const mockBlogPost: BlogPostType = {
  id: '1',
  title: 'Mastering the Basic Step: A Beginner\'s Guide',
  slug: 'mastering-basic-step-beginners-guide',
  excerpt: 'Learn the fundamental stepper moves that form the foundation of all advanced techniques.',
  content: `
    <h2>Introduction</h2>
    <p>Stepper dancing is an incredible form of artistic expression that combines rhythm, athleticism, and creativity. Whether you're just starting out or looking to refine your basics, mastering the fundamental steps is crucial for your development as a dancer.</p>
    
    <h3>Getting Started</h3>
    <p>Before diving into complex choreography, it's essential to build a strong foundation with basic steps. These movements will serve as building blocks for more advanced techniques.</p>
    
    <h3>The Basic Step Pattern</h3>
    <p>The basic step pattern consists of several key movements that every stepper should master:</p>
    <ul>
      <li>The foundational stance</li>
      <li>Weight transfer techniques</li>
      <li>Arm coordination</li>
      <li>Timing and rhythm</li>
    </ul>
    
    <p>Remember, practice makes perfect. Start slowly and gradually increase your speed as you become more comfortable with the movements.</p>
  `,
  featured_image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
  author_id: '1',
  author_name: 'Sarah Johnson',
  author_avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b4e0?w=150',
  status: 'published',
  published_at: '2024-06-20T10:00:00Z',
  created_at: '2024-06-20T10:00:00Z',
  updated_at: '2024-06-20T10:00:00Z',
  categories: [
    { id: '1', name: 'Dance Techniques', slug: 'dance-techniques', post_count: 15, created_at: '2024-01-01', updated_at: '2024-01-01', color: '#3B82F6' }
  ],
  tags: [
    { id: '1', name: 'beginner', slug: 'beginner', post_count: 10, created_at: '2024-01-01', updated_at: '2024-01-01' },
    { id: '3', name: 'tutorial', slug: 'tutorial', post_count: 12, created_at: '2024-01-01', updated_at: '2024-01-01' }
  ],
  reading_time_minutes: 5,
  view_count: 1250,
  like_count: 89,
  comment_count: 12,
  youtube_video_id: 'dQw4w9WgXcQ'
};

const mockComments: BlogComment[] = [
  {
    id: '1',
    post_id: '1',
    user_id: '2',
    user_name: 'Mike Chen',
    user_avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    content: 'Great tutorial! This really helped me understand the fundamentals better.',
    status: 'approved',
    created_at: '2024-06-20T11:00:00Z',
    updated_at: '2024-06-20T11:00:00Z',
    replies: []
  }
];

export default BlogPost;