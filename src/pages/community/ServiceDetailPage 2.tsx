import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { communityService } from '@/services/communityService';
import FollowButton from '@/components/following/FollowButton';
import { 
  Briefcase, 
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
  Send,
  ExternalLink,
  Share2,
  Award,
  Calendar,
  CheckCircle
} from 'lucide-react';
import type { Service, UserReview, UserComment } from '@/types/community';

const ServiceDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRating, setUserRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewContent, setReviewContent] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [activeImageTab, setActiveImageTab] = useState<'gallery' | 'portfolio'>('gallery');

  useEffect(() => {
    if (id) {
      loadService();
    }
  }, [id]);

  const loadService = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const result = await communityService.getService(id);
      if (result.success) {
        setService(result.data!);
        // Track view
        await communityService.incrementViewCount('service', id);
      } else {
        toast.error('Service not found');
        navigate('/community/browse');
      }
    } catch (error) {
      console.error('Failed to load service:', error);
      toast.error('Failed to load service details');
    } finally {
      setLoading(false);
    }
  };

  const handleRateService = async (rating: number) => {
    if (!user || !service) {
      toast.error('Please sign in to rate this service');
      return;
    }

    try {
      const result = await communityService.rateService(service.id, rating);
      if (result.success) {
        toast.success('Rating submitted');
        loadService(); // Reload to get updated rating
      } else {
        toast.error(result.error || 'Failed to submit rating');
      }
    } catch (error) {
      console.error('Error rating service:', error);
      toast.error('Failed to submit rating');
    }
  };

  const handleSubmitReview = async () => {
    if (!user || !service) {
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
      const result = await communityService.reviewService(service.id, {
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
        loadService(); // Reload to show new review
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
    if (!user || !service) {
      toast.error('Please sign in to comment');
      return;
    }

    if (!commentContent.trim()) {
      toast.error('Please write a comment');
      return;
    }

    setSubmittingComment(true);
    try {
      const result = await communityService.commentOnService(service.id, commentContent.trim());
      
      if (result.success) {
        toast.success('Comment submitted');
        setCommentContent('');
        loadService(); // Reload to show new comment
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
    if (!service) return;
    
    // Track contact
    await communityService.incrementContactCount('service', service.id);
    
    // Open contact method
    if (service.contact.phone) {
      window.location.href = `tel:${service.contact.phone}`;
    } else if (service.contact.email) {
      window.location.href = `mailto:${service.contact.email}`;
    }
  };

  const getCategoryBadgeColor = (slug: string) => {
    const colors = {
      'dj': 'bg-green-500',
      'photography': 'bg-yellow-500',
      'venue': 'bg-red-500',
      'planning': 'bg-orange-500',
      'instruction': 'bg-purple-500'
    };
    return colors[slug as keyof typeof colors] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center">Loading service details...</div>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Service Not Found</h1>
            <Button onClick={() => navigate('/community/browse')}>
              Back to Browse
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const allImages = [...(service.images || []), ...(service.portfolio_images || [])];

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

        {/* Main Service Info */}
        <Card className="mb-8">
          <CardHeader>
            {/* Image Gallery */}
            {allImages.length > 0 && (
              <div className="mb-6">
                <div className="flex gap-2 mb-4">
                  <Button 
                    variant={activeImageTab === 'gallery' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveImageTab('gallery')}
                  >
                    Gallery ({service.images?.length || 0})
                  </Button>
                  <Button 
                    variant={activeImageTab === 'portfolio' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveImageTab('portfolio')}
                  >
                    Portfolio ({service.portfolio_images?.length || 0})
                  </Button>
                </div>
                
                <div className="aspect-video bg-muted rounded-md relative overflow-hidden">
                  {activeImageTab === 'gallery' && service.images && service.images.length > 0 && (
                    <img 
                      src={service.images.find(img => img.is_primary)?.url || service.images[0]?.url} 
                      alt={service.business_name}
                      className="w-full h-full object-cover"
                    />
                  )}
                  
                  {activeImageTab === 'portfolio' && service.portfolio_images && service.portfolio_images.length > 0 && (
                    <img 
                      src={service.portfolio_images[0]?.url} 
                      alt={`${service.business_name} portfolio`}
                      className="w-full h-full object-cover"
                    />
                  )}
                  
                  {service.is_featured && (
                    <Badge className="absolute top-4 left-4 bg-stepping-gradient">Featured</Badge>
                  )}
                  
                  {service.is_verified && (
                    <Badge className="absolute top-4 right-4 bg-blue-500">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
              </div>
            )}
            
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Briefcase className="h-6 w-6 text-green-500" />
                  <Badge className={`text-white ${getCategoryBadgeColor(service.category.slug)}`}>
                    {service.category.name}
                  </Badge>
                  {service.status === 'approved' && (
                    <Badge variant="secondary">Active</Badge>
                  )}
                  {service.is_verified && (
                    <Badge className="bg-blue-500 text-white">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
                
                <CardTitle className="text-3xl mb-2">{service.business_name}</CardTitle>
                
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star}
                        className={`h-5 w-5 ${
                          star <= service.rating_average 
                            ? 'fill-yellow-400 text-yellow-400' 
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="font-medium ml-2">{service.rating_average.toFixed(1)}</span>
                    <span className="text-muted-foreground">({service.rating_count} reviews)</span>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    {service.view_count} views
                  </div>
                  
                  {service.years_experience && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Award className="h-4 w-4" />
                      {service.years_experience} years experience
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2">
                <FollowButton
                  entityId={service.id}
                  entityType="service"
                  entityName={service.business_name}
                />
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <CardDescription className="text-base">
              {service.description}
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
                
                {!service.location.is_online_only && service.location.address && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4" />
                    <span>
                      {service.location.address}
                      {service.location.city && `, ${service.location.city}`}
                      {service.location.state && `, ${service.location.state}`}
                      {service.location.zip_code && ` ${service.location.zip_code}`}
                    </span>
                  </div>
                )}
                
                {service.location.is_online_only && (
                  <div className="flex items-center gap-2 text-sm">
                    <Globe className="h-4 w-4" />
                    <span>Online Services</span>
                  </div>
                )}
                
                {service.location.service_area_notes && (
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 mt-0.5" />
                    <span>{service.location.service_area_notes}</span>
                  </div>
                )}
                
                {service.contact.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4" />
                    <a href={`tel:${service.contact.phone}`} className="hover:underline">
                      {service.contact.phone}
                    </a>
                  </div>
                )}
                
                {service.contact.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4" />
                    <a href={`mailto:${service.contact.email}`} className="hover:underline">
                      {service.contact.email}
                    </a>
                  </div>
                )}
                
                {service.contact.website && (
                  <div className="flex items-center gap-2 text-sm">
                    <Globe className="h-4 w-4" />
                    <a 
                      href={service.contact.website} 
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
                  {service.contact.social_facebook && (
                    <Button size="sm" variant="outline" asChild>
                      <a href={service.contact.social_facebook} target="_blank" rel="noopener noreferrer">
                        <Facebook className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  {service.contact.social_instagram && (
                    <Button size="sm" variant="outline" asChild>
                      <a href={service.contact.social_instagram} target="_blank" rel="noopener noreferrer">
                        <Instagram className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  {service.contact.social_twitter && (
                    <Button size="sm" variant="outline" asChild>
                      <a href={service.contact.social_twitter} target="_blank" rel="noopener noreferrer">
                        <Twitter className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
              
              {/* Availability */}
              {service.operating_hours && (
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Availability
                  </h3>
                  
                  <div className="space-y-1 text-sm">
                    {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
                      const hours = service.operating_hours?.[day as keyof typeof service.operating_hours];
                      if (!hours) return null;
                      
                      return (
                        <div key={day} className="flex justify-between">
                          <span className="capitalize font-medium">{day}:</span>
                          <span>{hours}</span>
                        </div>
                      );
                    })}
                    
                    {service.operating_hours.notes && (
                      <div className="pt-2 text-muted-foreground">
                        {service.operating_hours.notes}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* Service Types */}
            {service.service_types.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold mb-2">Services Offered</h3>
                <div className="flex flex-wrap gap-2">
                  {service.service_types.map((serviceType, index) => (
                    <Badge key={index} variant="outline">
                      {serviceType}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {/* Certifications */}
            {service.certifications.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  Certifications
                </h3>
                <div className="flex flex-wrap gap-2">
                  {service.certifications.map((cert, index) => (
                    <Badge key={index} className="bg-blue-500">
                      {cert}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {/* Keywords */}
            {service.keywords.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold mb-2">Keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {service.keywords.map((keyword, index) => (
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
                Contact for Quote
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Rating */}
        {user && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Rate This Service</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Button
                    key={star}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRateService(star)}
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
              <CardTitle>Reviews ({service.reviews.length})</CardTitle>
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
                  placeholder="Share your experience with this service provider..."
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
            {service.reviews.map((review) => (
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
            
            {service.reviews.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No reviews yet. Be the first to review this service!
              </div>
            )}
          </CardContent>
        </Card>

        {/* Comments Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Comments ({service.comments.length})
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Write Comment */}
            {user && (
              <div className="border rounded-lg p-4 space-y-4">
                <Textarea
                  placeholder="Ask a question or leave a comment..."
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
            {service.comments.map((comment) => (
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
            
            {service.comments.length === 0 && (
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

export default ServiceDetailPage;