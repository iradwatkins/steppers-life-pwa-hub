import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { 
  Star, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Clock, 
  CheckCircle, 
  Heart,
  Share2,
  Flag,
  ThumbsUp,
  ArrowLeft,
  Edit,
  MessageSquare
} from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useStoreDirectory } from '@/hooks/useStoreDirectory';
import { useReviews } from '@/hooks/useReviews';
import { StoreListing, StoreRating } from '@/services/storeDirectoryService';
import FollowButton from '@/components/FollowButton';

const StoreDetailPage: React.FC = () => {
  const { storeId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();
  const [store, setStore] = useState<StoreListing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews'>('overview');
  
  // Review submission state
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newReview, setNewReview] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const { getStoreById } = useStoreDirectory();
  const { getReviews, submitReview, voteOnReview, reportReview } = useReviews();
  const [reviews, setReviews] = useState<StoreRating[]>([]);

  useEffect(() => {
    if (storeId) {
      loadStoreData();
      loadReviews();
    }
  }, [storeId]);

  const loadStoreData = async () => {
    try {
      setIsLoading(true);
      const storeData = await getStoreById(storeId!);
      setStore(storeData);
    } catch (error) {
      console.error('Failed to load store:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadReviews = async () => {
    try {
      const reviewData = await getReviews('store', storeId!);
      setReviews(reviewData);
    } catch (error) {
      console.error('Failed to load reviews:', error);
    }
  };

  const handleSubmitReview = async () => {
    if (!newReview.trim()) return;
    
    try {
      setIsSubmittingReview(true);
      await submitReview('store', storeId!, newRating, newReview);
      setShowReviewDialog(false);
      setNewReview('');
      setNewRating(5);
      await loadReviews();
      await loadStoreData(); // Refresh to update average rating
    } catch (error) {
      console.error('Failed to submit review:', error);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const renderStarRating = (rating: number, interactive = false, size = 'w-4 h-4') => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${size} ${
              star <= rating 
                ? 'text-yellow-400 fill-yellow-400' 
                : interactive 
                  ? 'text-gray-300 hover:text-yellow-400 cursor-pointer'
                  : 'text-gray-300'
            }`}
            onClick={interactive ? () => setNewRating(star) : undefined}
          />
        ))}
      </div>
    );
  };

  const formatHours = (hours: any) => {
    if (!hours) return 'Hours not specified';
    
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    return days.map((day, index) => {
      const dayHours = hours[day];
      if (!dayHours) return null;
      if (dayHours.closed) return `${dayNames[index]}: Closed`;
      return `${dayNames[index]}: ${dayHours.open} - ${dayHours.close}`;
    }).filter(Boolean).join(', ');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-main py-8">
        <div className="container mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded mb-6"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen bg-background-main py-8">
        <div className="container mx-auto px-4">
          <Alert>
            <AlertDescription>
              Store not found. This store may have been removed or the link is incorrect.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-main py-8">
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Directory
        </Button>

        {/* Store Header */}
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Store Image */}
              <div className="relative">
                <img
                  src={store.images[0]?.url || '/placeholder.svg'}
                  alt={store.name}
                  className="w-full md:w-48 h-48 object-cover rounded-lg"
                />
                {store.isVerified && (
                  <Badge className="absolute top-3 right-3 bg-green-500 text-white">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>

              {/* Store Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h1 className="font-serif text-3xl font-bold text-text-primary mb-2">
                      {store.name}
                    </h1>
                    <Badge variant="secondary" className="mb-3">
                      {store.category?.name || 'Unknown Category'}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <FollowButton
                      entityId={store.id}
                      entityType="store"
                      variant="outline"
                    />
                    <Button variant="outline" size="sm">
                      <Heart className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    {renderStarRating(store.averageRating)}
                    <span className="font-semibold">{store.averageRating}</span>
                    <span className="text-text-secondary">({store.totalRatings} reviews)</span>
                  </div>
                  <span className="text-text-secondary">•</span>
                  <span className="text-text-secondary">{store.viewCount} views</span>
                </div>

                <p className="text-text-secondary mb-4">{store.description}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {store.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Contact Info Sidebar */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!store.address.isOnlineOnly && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-text-secondary mt-0.5" />
                    <div>
                      <div className="font-medium">Address</div>
                      <div className="text-sm text-text-secondary">
                        {store.address.street && `${store.address.street}, `}
                        {store.address.city}, {store.address.state}
                        {store.address.zipCode && ` ${store.address.zipCode}`}
                      </div>
                    </div>
                  </div>
                )}

                {store.contactInfo.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-text-secondary" />
                    <div>
                      <div className="font-medium">Phone</div>
                      <div className="text-sm text-text-secondary">{store.contactInfo.phone}</div>
                    </div>
                  </div>
                )}

                {store.contactInfo.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-text-secondary" />
                    <div>
                      <div className="font-medium">Email</div>
                      <div className="text-sm text-text-secondary">{store.contactInfo.email}</div>
                    </div>
                  </div>
                )}

                {store.contactInfo.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-text-secondary" />
                    <div>
                      <div className="font-medium">Website</div>
                      <a 
                        href={store.contactInfo.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-brand-primary hover:underline"
                      >
                        Visit Website
                      </a>
                    </div>
                  </div>
                )}

                {store.operatingHours && (
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-text-secondary mt-0.5" />
                    <div>
                      <div className="font-medium">Hours</div>
                      <div className="text-sm text-text-secondary">{formatHours(store.operatingHours)}</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-border mb-6">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-4 px-1 border-b-2 font-medium ${
                activeTab === 'overview'
                  ? 'border-brand-primary text-brand-primary'
                  : 'border-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`pb-4 px-1 border-b-2 font-medium ${
                activeTab === 'reviews'
                  ? 'border-brand-primary text-brand-primary'
                  : 'border-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              Reviews ({store.totalRatings})
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {/* Additional Images */}
              {store.images.length > 1 && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Gallery</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {store.images.slice(1).map((image) => (
                        <img
                          key={image.id}
                          src={image.url}
                          alt={image.alt}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Store Description */}
              <Card>
                <CardHeader>
                  <CardTitle>About This Business</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-text-secondary leading-relaxed">{store.description}</p>
                </CardContent>
              </Card>
            </div>

            <div>
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
                    <DialogTrigger asChild>
                      <Button className="w-full">
                        <Star className="w-4 h-4 mr-2" />
                        Write a Review
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Review {store.name}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Rating</label>
                          {renderStarRating(newRating, true, 'w-6 h-6')}
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Review</label>
                          <Textarea
                            value={newReview}
                            onChange={(e) => setNewReview(e.target.value)}
                            placeholder="Share your experience with this business..."
                            rows={4}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            onClick={handleSubmitReview}
                            disabled={isSubmittingReview || !newReview.trim()}
                            className="flex-1"
                          >
                            {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => setShowReviewDialog(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  <Button variant="outline" className="w-full">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Contact Business
                  </Button>
                  
                  <Button variant="outline" className="w-full">
                    <Flag className="w-4 h-4 mr-2" />
                    Report Issue
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {/* Reviews List */}
              <div className="space-y-6">
                {reviews.map((review) => (
                  <Card key={review.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <Avatar>
                          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${review.userName}`} />
                          <AvatarFallback>{review.userName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <div className="font-medium">{review.userName}</div>
                              <div className="flex items-center gap-2">
                                {renderStarRating(review.rating)}
                                <span className="text-sm text-text-secondary">
                                  {new Date(review.createdAt).toLocaleDateString()}
                                </span>
                                {review.isVerified && (
                                  <Badge variant="outline" className="text-xs">
                                    Verified
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <Button variant="ghost" size="sm">
                              <Flag className="w-4 h-4" />
                            </Button>
                          </div>
                          
                          {review.review && (
                            <p className="text-text-secondary mb-3">{review.review}</p>
                          )}
                          
                          <div className="flex items-center gap-4">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-text-secondary hover:text-text-primary"
                            >
                              <ThumbsUp className="w-4 h-4 mr-1" />
                              Helpful ({review.helpfulVotes})
                            </Button>
                          </div>
                          
                          {review.ownerResponse && (
                            <div className="mt-4 p-4 bg-surface-card rounded-lg">
                              <div className="font-medium text-sm mb-1">Response from business</div>
                              <p className="text-sm text-text-secondary">{review.ownerResponse.text}</p>
                              <div className="text-xs text-text-secondary mt-2">
                                {new Date(review.ownerResponse.respondedAt).toLocaleDateString()}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {reviews.length === 0 && (
                  <Card>
                    <CardContent className="text-center py-8">
                      <Star className="w-12 h-12 text-text-secondary mx-auto mb-4" />
                      <h3 className="font-semibold text-lg text-text-primary mb-2">No Reviews Yet</h3>
                      <p className="text-text-secondary mb-6">
                        Be the first to review this business and help others in the community!
                      </p>
                      <Button onClick={() => setShowReviewDialog(true)}>
                        Write the First Review
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            <div>
              {/* Rating Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Rating Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-4">
                    <div className="text-3xl font-bold text-text-primary">{store.averageRating}</div>
                    <div className="flex justify-center mb-2">
                      {renderStarRating(store.averageRating)}
                    </div>
                    <div className="text-sm text-text-secondary">
                      Based on {store.totalRatings} reviews
                    </div>
                  </div>
                  
                  {/* Rating Breakdown */}
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((stars) => {
                      const count = reviews.filter(r => r.rating === stars).length;
                      const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                      
                      return (
                        <div key={stars} className="flex items-center gap-2 text-sm">
                          <span className="w-8">{stars}★</span>
                          <div className="flex-1 bg-surface-contrast rounded-full h-2">
                            <div
                              className="bg-yellow-400 h-2 rounded-full"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="w-8 text-text-secondary">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreDetailPage; 