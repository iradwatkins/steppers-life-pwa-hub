import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import StarRating from './StarRating';
import { Review, CreateReviewRequest, UpdateReviewRequest } from '@/services/reviewService';
import { useReviews } from '@/hooks/useReviews';

interface ReviewFormProps {
  eventId: string;
  existingReview?: Review;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  eventId,
  existingReview,
  onSuccess,
  onCancel
}) => {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [reviewText, setReviewText] = useState(existingReview?.reviewText || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { createReview, updateReview } = useReviews(eventId);

  const isEditing = !!existingReview;
  const isValid = rating > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValid) {
      toast({
        title: "Rating Required",
        description: "Please select a star rating.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditing && existingReview) {
        const updateRequest: UpdateReviewRequest = {
          reviewId: existingReview.id,
          rating,
          reviewText: reviewText.trim() || undefined
        };
        await updateReview(updateRequest);
        toast({
          title: "Review Updated",
          description: "Your review has been successfully updated."
        });
      } else {
        const createRequest: CreateReviewRequest = {
          eventId,
          rating,
          reviewText: reviewText.trim() || undefined
        };
        await createReview(createRequest);
        toast({
          title: "Review Submitted",
          description: "Thank you for your feedback! Your review has been posted."
        });
      }

      // Reset form
      if (!isEditing) {
        setRating(0);
        setReviewText('');
      }
      
      onSuccess?.();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit review",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (isEditing) {
      setRating(existingReview?.rating || 0);
      setReviewText(existingReview?.reviewText || '');
    } else {
      setRating(0);
      setReviewText('');
    }
    onCancel?.();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          {isEditing ? 'Edit Your Review' : 'Write a Review'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Star Rating */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-3">
              Overall Rating *
            </label>
            <div className="flex items-center gap-3">
              <StarRating
                rating={rating}
                interactive={true}
                onChange={setRating}
                size="lg"
              />
              {rating > 0 && (
                <span className="text-sm text-text-secondary">
                  {rating === 1 && "Poor"}
                  {rating === 2 && "Fair"}
                  {rating === 3 && "Good"}
                  {rating === 4 && "Very Good"}
                  {rating === 5 && "Excellent"}
                </span>
              )}
            </div>
          </div>

          {/* Review Text */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Your Review (Optional)
            </label>
            <Textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Share your experience with this event... What did you like? What could be improved?"
              className="min-h-[120px] resize-none"
              maxLength={1000}
            />
            <div className="text-xs text-text-secondary mt-1 text-right">
              {reviewText.length}/1000 characters
            </div>
          </div>

          {/* Review Guidelines */}
          <div className="bg-surface-contrast p-4 rounded-lg">
            <h4 className="font-medium text-sm text-text-primary mb-2">Review Guidelines</h4>
            <ul className="text-xs text-text-secondary space-y-1">
              <li>• Be honest and constructive in your feedback</li>
              <li>• Focus on your experience with the event</li>
              <li>• Avoid personal attacks or inappropriate language</li>
              <li>• Reviews can be edited for 30 days after posting</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              disabled={!isValid || isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  {isEditing ? 'Updating...' : 'Submitting...'}
                </>
              ) : (
                <>
                  {isEditing ? 'Update Review' : 'Submit Review'}
                </>
              )}
            </Button>
            
            {(isEditing || onCancel) && (
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ReviewForm; 