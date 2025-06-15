import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Star, Plus, MessageSquare } from 'lucide-react';
import ReviewForm from './ReviewForm';
import ReviewList from './ReviewList';
import StarRating from './StarRating';
import { Review } from '@/services/reviewService';
import { useReviews } from '@/hooks/useReviews';
import { useAuth } from '@/hooks/useAuth';

interface ReviewsSectionProps {
  eventId: string;
  className?: string;
}

const ReviewsSection: React.FC<ReviewsSectionProps> = ({
  eventId,
  className = ''
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { reviewStats, canUserReview, getUserReview, loading } = useReviews(eventId);
  
  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | undefined>();
  const [userCanReview, setUserCanReview] = useState(false);

  useEffect(() => {
    const checkUserReviewStatus = async () => {
      if (user) {
        const canReview = await canUserReview();
        setUserCanReview(canReview);
      }
    };

    checkUserReviewStatus();
  }, [user, canUserReview]);

  const handleWriteReview = () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please sign in to write a review.",
        variant: "destructive"
      });
      return;
    }
    
    setEditingReview(undefined);
    setShowForm(true);
  };

  const handleEditReview = (review: Review) => {
    setEditingReview(review);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingReview(undefined);
    // The hook will automatically refresh the reviews
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingReview(undefined);
  };

  const userReview = getUserReview();
  const canWriteReview = userCanReview && !userReview;
  const canEditUserReview = userReview && user;

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-gray-200 rounded mb-4"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Reviews Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="font-serif text-2xl font-bold text-text-primary">
            Reviews & Ratings
          </h2>
          {reviewStats.totalReviews > 0 && (
            <div className="flex items-center gap-2">
              <StarRating 
                rating={reviewStats.averageRating} 
                showNumeric 
                size="md" 
              />
              <span className="text-text-secondary">
                ({reviewStats.totalReviews})
              </span>
            </div>
          )}
        </div>

        {/* Write Review Button */}
        {canWriteReview && !showForm && (
          <Button onClick={handleWriteReview}>
            <Plus className="w-4 h-4 mr-2" />
            Write Review
          </Button>
        )}

        {/* Edit Review Button */}
        {canEditUserReview && !showForm && (
          <Button 
            variant="outline" 
            onClick={() => handleEditReview(userReview)}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Edit Your Review
          </Button>
        )}
      </div>

      {/* Review Form */}
      {showForm && (
        <ReviewForm
          eventId={eventId}
          existingReview={editingReview}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      )}

      {/* User's Existing Review (if not editing) */}
      {userReview && !showForm && (
        <Card className="border-brand-primary/20 bg-brand-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Your Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <StarRating rating={userReview.rating} size="md" />
              {userReview.reviewText && (
                <p className="text-text-primary">{userReview.reviewText}</p>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">
                  Posted {new Date(userReview.createdAt).toLocaleDateString()}
                  {userReview.createdAt.getTime() !== userReview.updatedAt.getTime() && ' (edited)'}
                </span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleEditReview(userReview)}
                >
                  Edit Review
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      <ReviewList 
        eventId={eventId} 
        onEditReview={handleEditReview}
      />

      {/* Empty State for No Reviews */}
      {reviewStats.totalReviews === 0 && !showForm && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-surface-contrast rounded-full flex items-center justify-center mx-auto">
                <Star className="w-8 h-8 text-text-secondary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-text-primary mb-2">
                  No Reviews Yet
                </h3>
                <p className="text-text-secondary mb-6">
                  Be the first to share your experience with this event!
                </p>
                {canWriteReview && (
                  <Button onClick={handleWriteReview}>
                    <Plus className="w-4 h-4 mr-2" />
                    Write the First Review
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Call to Action for Non-Ticket Holders */}
      {!user && reviewStats.totalReviews === 0 && (
        <Card className="bg-surface-contrast">
          <CardContent className="p-6 text-center">
            <h4 className="font-medium text-text-primary mb-2">
              Want to leave a review?
            </h4>
            <p className="text-text-secondary text-sm">
              Purchase a ticket to this event to share your experience and help others make informed decisions.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ReviewsSection; 