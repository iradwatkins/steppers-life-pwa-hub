import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { StarRating } from './StarRating';
import { ReviewForm } from './ReviewForm';
import { ReviewList } from './ReviewList';
import { ReviewService, Review, ReviewStats } from '@/services/reviewService';
import { PenTool, Star } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface ReviewsSectionProps {
  eventId: string;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({ eventId }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [userHasReviewed, setUserHasReviewed] = useState(false);

  const loadReviews = async () => {
    try {
      setIsLoading(true);
      const [reviewsData, statsData] = await Promise.all([
        ReviewService.getEventReviews(eventId),
        ReviewService.getEventReviewStats(eventId)
      ]);
      
      setReviews(reviewsData);
      setReviewStats(statsData);
      
      // Check if current user has already reviewed
      if (user) {
        setUserHasReviewed(
          reviewsData.some(review => review.user_id === user.id)
        );
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [eventId, user]);

  const handleReviewSubmitted = () => {
    setShowReviewForm(false);
    loadReviews();
  };

  const handleWriteReview = () => {
    if (!user) {
      toast.error('Please log in to write a review');
      return;
    }
    setShowReviewForm(true);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Review Form */}
      {showReviewForm && (
        <ReviewForm
          eventId={eventId}
          onReviewSubmitted={handleReviewSubmitted}
          onCancel={() => setShowReviewForm(false)}
        />
      )}

      {/* Review Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Reviews ({reviewStats?.total_reviews || 0})
              </CardTitle>
              <CardDescription>
                What attendees are saying about this event
              </CardDescription>
            </div>
            {user && !userHasReviewed && !showReviewForm && (
              <Button onClick={handleWriteReview} className="flex items-center gap-2">
                <PenTool className="h-4 w-4" />
                Write Review
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {reviewStats && reviewStats.total_reviews > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Overall Rating */}
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">
                    {reviewStats.average_rating.toFixed(1)}
                  </div>
                  <StarRating
                    rating={reviewStats.average_rating}
                    size="lg"
                    showValue={false}
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    Based on {reviewStats.total_reviews} review{reviewStats.total_reviews !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              {/* Rating Breakdown */}
              <div className="space-y-3">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = reviewStats.rating_breakdown[rating as keyof typeof reviewStats.rating_breakdown] || 0;
                  const percentage = reviewStats.total_reviews > 0 
                    ? (count / reviewStats.total_reviews) * 100 
                    : 0;
                  
                  return (
                    <div key={rating} className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <span className="text-sm">{rating}</span>
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      </div>
                      <Progress value={percentage} className="flex-1 h-2" />
                      <span className="text-sm text-muted-foreground w-8 text-right">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No reviews yet. Be the first to share your experience!
              </p>
              {user && !showReviewForm && (
                <Button onClick={handleWriteReview} className="mt-4">
                  Write First Review
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reviews List */}
      {reviews.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>All Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <ReviewList
              reviews={reviews}
              onReviewsUpdate={loadReviews}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};