import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { storeService } from '@/services/storeService';
import type { Store, StoreReview, StoreComment } from '@/types/store';
import type { UserReview, UserComment } from '@/types/community';
import FollowButton from '@/components/following/FollowButton';
import { 
  Store as StoreIcon, 
  ArrowLeft, 
  MapPin, 
  Phone, 
  Globe, 
  Clock, 
  Star,
  Mail,
  Facebook,
  Instagram,
  Twitter,
  MessageCircle,
  ThumbsUp,
  Send,
  ExternalLink,
  Share2,
  Heart
} from 'lucide-react';

const StoreDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRating, setUserRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewContent, setReviewContent] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    if (id) {
      loadStore();
    }
  }, [id]);

  const loadStore = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const result = await communityService.getStore(id);
      if (result.success) {
        setStore(result.data!);
        // Track view
        await communityService.incrementViewCount('store', id);
      } else {
        toast.error('Store not found');
        navigate('/community/browse');
      }
    } catch (error) {
      console.error('Failed to load store:', error);
      toast.error('Failed to load store details');
    } finally {
      setLoading(false);
    }
  };

  const handleRateStore = async (rating: number) => {
    if (!user || !store) {
      toast.error('Please sign in to rate this store');
      return;
    }

    try {
      const result = await communityService.rateStore(store.id, rating);
      if (result.success) {
        toast.success('Rating submitted');
        loadStore(); // Reload to get updated rating
      } else {
        toast.error(result.error || 'Failed to submit rating');
      }
    } catch (error) {
      console.error('Error rating store:', error);
      toast.error('Failed to submit rating');
    }
  };

  const handleSubmitReview = async () => {
    if (!user || !store) {
      toast.error('Please sign in to write a review');
      return;
    }

    if (userRating === 0) {
      toast.error('Please select a rating');
      return;
    }

    if (!reviewContent.trim()) {
      toast.error('Please write a review');
      return;
    }

    setSubmittingReview(true);
    try {
      const result = await communityService.reviewStore(store.id, {
        rating: userRating,
        title: reviewTitle.trim() || undefined,
        content: reviewContent.trim()
      });

      if (result.success) {
        toast.success('Review submitted successfully');
        setShowReviewForm(false);
        setUserRating(0);
        setReviewTitle('');
        setReviewContent('');
        loadStore(); // Reload to show new review
      } else {
        toast.error(result.error || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!user || !store) {
      toast.error('Please sign in to comment');
      return;
    }

    if (!commentContent.trim()) {
      toast.error('Please write a comment');
      return;
    }

    setSubmittingComment(true);
    try {
      const result = await communityService.commentOnStore(store.id, commentContent.trim());
      
      if (result.success) {
        toast.success('Comment submitted');
        setCommentContent('');
        loadStore(); // Reload to show new comment
      } else {
        toast.error(result.error || 'Failed to submit comment');
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      toast.error('Failed to submit comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleContact = async () => {
    if (!store) return;
    
    // Track contact
    await communityService.incrementContactCount('store', store.id);
    
    // Open contact method
    if (store.contact.phone) {
      window.location.href = `tel:${store.contact.phone}`;
    } else if (store.contact.email) {
      window.location.href = `mailto:${store.contact.email}`;
    }
  };

  const getCategoryBadgeColor = (slug: string) => {
    const colors = {
      'apparel': 'bg-purple-500',
      'shoes': 'bg-blue-500',
      'accessories': 'bg-green-500',
      'supplies': 'bg-indigo-500'
    };
    return colors[slug as keyof typeof colors] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center">Loading store details...</div>
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Store Not Found</h1>
            <Button onClick={() => navigate('/community/browse')}>
              Back to Browse
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/community/browse')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Browse
          </Button>
        </div>

        {/* Main Store Info */}
        <Card className="mb-8">
          <CardHeader>
            {store.images && store.images.length > 0 && (
              <div className="aspect-video bg-muted rounded-md mb-6 relative overflow-hidden">
                <img 
                  src={store.images.find(img => img.is_primary)?.url || store.images[0]?.url} 
                  alt={store.name}
                  className="w-full h-full object-cover"
                />
                {store.is_featured && (
                  <Badge className="absolute top-4 left-4 bg-stepping-gradient">Featured</Badge>
                )}
              </div>
            )}
            
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <StoreIcon className="h-6 w-6 text-blue-500" />
                  <Badge className={`text-white ${getCategoryBadgeColor(store.category.slug)}`}>
                    {store.category.name}
                  </Badge>
                  {store.status === 'approved' && (
                    <Badge variant="secondary">Verified</Badge>
                  )}
                </div>
                
                <CardTitle className="text-3xl mb-2">{store.name}</CardTitle>
                
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star}
                        className={`h-5 w-5 ${
                          star <= store.rating_average 
                            ? 'fill-yellow-400 text-yellow-400' 
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="font-medium ml-2">{store.rating_average.toFixed(1)}</span>
                    <span className="text-muted-foreground">({store.rating_count} reviews)</span>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    {store.view_count} views
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <FollowButton
                  entityId={store.id}
                  entityType="store"
                  entityName={store.name}
                />
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <CardDescription className="text-base">
              {store.description}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contact Info */}
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Contact Information
                </h3>
                
                {!store.location.is_online_only && store.location.address && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4" />
                    <span>
                      {store.location.address}
                      {store.location.city && `, ${store.location.city}`}
                      {store.location.state && `, ${store.location.state}`}
                      {store.location.zip_code && ` ${store.location.zip_code}`}
                    </span>
                  </div>
                )}
                
                {store.location.is_online_only && (
                  <div className="flex items-center gap-2 text-sm">
                    <Globe className="h-4 w-4" />
                    <span>Online Store Only</span>
                  </div>
                )}
                
                {store.contact.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4" />
                    <a href={`tel:${store.contact.phone}`} className="hover:underline">
                      {store.contact.phone}
                    </a>
                  </div>
                )}
                
                {store.contact.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4" />
                    <a href={`mailto:${store.contact.email}`} className="hover:underline">
                      {store.contact.email}
                    </a>
                  </div>
                )}
                
                {store.contact.website && (
                  <div className="flex items-center gap-2 text-sm">
                    <Globe className="h-4 w-4" />
                    <a 
                      href={store.contact.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:underline flex items-center gap-1"
                    >
                      Visit Website
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
                
                {/* Social Links */}
                <div className="flex gap-2 pt-2">
                  {store.contact.social_facebook && (
                    <Button size="sm" variant="outline" asChild>
                      <a href={store.contact.social_facebook} target="_blank" rel="noopener noreferrer">
                        <Facebook className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  {store.contact.social_instagram && (
                    <Button size="sm" variant="outline" asChild>
                      <a href={store.contact.social_instagram} target="_blank" rel="noopener noreferrer">
                        <Instagram className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  {store.contact.social_twitter && (
                    <Button size="sm" variant="outline" asChild>
                      <a href={store.contact.social_twitter} target="_blank" rel="noopener noreferrer">
                        <Twitter className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
              
              {/* Hours */}
              {store.operating_hours && (
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Hours
                  </h3>
                  
                  <div className="space-y-1 text-sm">
                    {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
                      const hours = store.operating_hours?.[day as keyof typeof store.operating_hours];
                      if (!hours) return null;
                      
                      return (
                        <div key={day} className="flex justify-between">
                          <span className="capitalize font-medium">{day}:</span>
                          <span>{hours}</span>
                        </div>
                      );
                    })}
                    
                    {store.operating_hours.notes && (
                      <div className="pt-2 text-muted-foreground">
                        {store.operating_hours.notes}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* Keywords */}
            {store.keywords.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold mb-2">Keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {store.keywords.map((keyword, index) => (
                    <Badge key={index} variant="secondary">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {/* Contact Button */}
            <div className="mt-6">
              <Button onClick={handleContact} className="bg-stepping-gradient">
                <Phone className="h-4 w-4 mr-2" />
                Contact Store
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Rating */}
        {user && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Rate This Store</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Button
                    key={star}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRateStore(star)}
                    className="p-1"
                  >
                    <Star 
                      className={`h-6 w-6 ${
                        star <= userRating 
                          ? 'fill-yellow-400 text-yellow-400' 
                          : 'text-gray-300 hover:text-yellow-400'
                      }`}
                    />
                  </Button>
                ))}
                <span className="ml-2 text-sm text-muted-foreground">
                  Click to rate
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Reviews Section */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Reviews ({store.reviews.length})</CardTitle>
              {user && (
                <Button 
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  variant="outline"
                >
                  Write Review
                </Button>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Write Review Form */}
            {showReviewForm && user && (
              <div className="border rounded-lg p-4 space-y-4">
                <h4 className="font-semibold">Write a Review</h4>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm">Rating:</span>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Button
                      key={star}
                      variant="ghost"
                      size="sm"
                      onClick={() => setUserRating(star)}
                      className="p-1"
                    >
                      <Star 
                        className={`h-5 w-5 ${
                          star <= userRating 
                            ? 'fill-yellow-400 text-yellow-400' 
                            : 'text-gray-300'
                        }`}
                      />
                    </Button>
                  ))}
                </div>
                
                <Input
                  placeholder="Review title (optional)"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                />
                
                <Textarea
                  placeholder="Share your experience with this store..."
                  value={reviewContent}
                  onChange={(e) => setReviewContent(e.target.value)}
                  className="min-h-[100px]"
                />
                
                <div className="flex gap-2">
                  <Button 
                    onClick={handleSubmitReview}
                    disabled={submittingReview}
                    className="bg-stepping-gradient"
                  >
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowReviewForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
            
            {/* Reviews List */}
            {store.reviews.map((review) => (
              <div key={review.id} className="border-b pb-4 last:border-b-0">
                <div className="flex items-start gap-3">
                  <Avatar>
                    <AvatarImage src={review.user_avatar} />
                    <AvatarFallback>{review.user_name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{review.user_name}</span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star}
                            className={`h-4 w-4 ${
                              star <= review.rating 
                                ? 'fill-yellow-400 text-yellow-400' 
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    
                    {review.title && (
                      <h4 className="font-medium mb-1">{review.title}</h4>
                    )}
                    
                    <p className="text-sm text-muted-foreground">
                      {review.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            {store.reviews.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No reviews yet. Be the first to review this store!
              </div>
            )}
          </CardContent>
        </Card>

        {/* Comments Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Comments ({store.comments.length})
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Write Comment */}
            {user && (
              <div className="border rounded-lg p-4 space-y-4">
                <Textarea
                  placeholder="Leave a comment or ask a question..."
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                />
                
                <Button 
                  onClick={handleSubmitComment}
                  disabled={submittingComment}
                  size="sm"
                  className="bg-stepping-gradient"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {submittingComment ? 'Posting...' : 'Post Comment'}
                </Button>
              </div>
            )}
            
            {/* Comments List */}
            {store.comments.map((comment) => (
              <div key={comment.id} className="flex items-start gap-3">
                <Avatar>
                  <AvatarImage src={comment.user_avatar} />
                  <AvatarFallback>{comment.user_name.charAt(0)}</AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{comment.user_name}</span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <p className="text-sm">{comment.content}</p>
                </div>
              </div>
            ))}
            
            {store.comments.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No comments yet. Start the conversation!
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StoreDetailPage;