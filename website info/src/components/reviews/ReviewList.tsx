import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { MoreHorizontal, Edit3, Trash2, Flag, Reply, CheckCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import StarRating from './StarRating';
import { Review } from '@/services/reviewService';
import { useReviews } from '@/hooks/useReviews';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';

interface ReviewListProps {
  eventId: string;
  onEditReview?: (review: Review) => void;
}

const ReviewList: React.FC<ReviewListProps> = ({
  eventId,
  onEditReview
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const {
    reviews,
    reviewStats,
    loading,
    error,
    sortBy,
    changeSortOrder,
    deleteReview,
    addOrganizerReply,
    reportReview,
    canEditReview
  } = useReviews(eventId);

  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  const handleDeleteReview = async (reviewId: string) => {
    try {
      await deleteReview(reviewId);
      toast({
        title: "Review Deleted",
        description: "Your review has been successfully deleted."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete review",
        variant: "destructive"
      });
    }
  };

  const handleReportReview = async (reviewId: string) => {
    try {
      await reportReview(reviewId);
      toast({
        title: "Review Reported",
        description: "Thank you for reporting this review. Our team will review it."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to report review",
        variant: "destructive"
      });
    }
  };

  const handleSubmitReply = async (reviewId: string) => {
    if (!replyText.trim()) {
      toast({
        title: "Reply Required",
        description: "Please enter a reply message.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmittingReply(true);
    try {
      await addOrganizerReply({
        reviewId,
        replyText: replyText.trim(),
        organizerName: user?.email || 'Event Organizer'
      });
      
      setReplyingTo(null);
      setReplyText('');
      
      toast({
        title: "Reply Posted",
        description: "Your reply has been posted successfully."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to post reply",
        variant: "destructive"
      });
    } finally {
      setIsSubmittingReply(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="w-32 h-4 bg-gray-200 rounded"></div>
                    <div className="w-24 h-3 bg-gray-200 rounded mt-1"></div>
                  </div>
                </div>
                <div className="w-full h-16 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-text-secondary">Failed to load reviews: {error}</p>
        </CardContent>
      </Card>
    );
  }

  if (reviews.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-surface-contrast rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-text-secondary" />
            </div>
            <h3 className="font-semibold text-lg text-text-primary">No Reviews Yet</h3>
            <p className="text-text-secondary">
              Be the first to share your experience with this event!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Reviews Header with Stats and Sorting */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <StarRating rating={reviewStats.averageRating} showNumeric size="md" />
            <span className="font-medium text-text-primary">
              ({reviewStats.totalReviews} {reviewStats.totalReviews === 1 ? 'review' : 'reviews'})
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-text-secondary">Sort by:</span>
          <Button
            variant={sortBy === 'recent' ? 'default' : 'outline'}
            size="sm"
            onClick={() => changeSortOrder('recent')}
          >
            Most Recent
          </Button>
          <Button
            variant={sortBy === 'rating' ? 'default' : 'outline'}
            size="sm"
            onClick={() => changeSortOrder('rating')}
          >
            Highest Rating
          </Button>
        </div>
      </div>

      {/* Rating Breakdown */}
      <Card>
        <CardContent className="p-4">
          <h4 className="font-medium text-text-primary mb-3">Rating Breakdown</h4>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = reviewStats.ratingBreakdown[rating as keyof typeof reviewStats.ratingBreakdown];
              const percentage = reviewStats.totalReviews > 0 ? (count / reviewStats.totalReviews) * 100 : 0;
              
              return (
                <div key={rating} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-12">
                    <span className="text-sm">{rating}</span>
                    <StarRating rating={1} size="sm" />
                  </div>
                  <div className="flex-1 h-2 bg-surface-contrast rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-text-secondary w-8 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review.id}>
            <CardContent className="p-6">
              {/* Review Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-primary rounded-full flex items-center justify-center">
                    <span className="text-text-on-primary font-semibold text-sm">
                      {review.userName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-text-primary">{review.userName}</h4>
                      {review.verified && (
                        <Badge variant="secondary" className="text-xs">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verified Attendee
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <StarRating rating={review.rating} size="sm" />
                      <span className="text-xs text-text-secondary">
                        {formatDistanceToNow(review.createdAt, { addSuffix: true })}
                        {review.createdAt.getTime() !== review.updatedAt.getTime() && ' (edited)'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Review Actions */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {user && user.id === review.userId && canEditReview(review) && (
                      <>
                        <DropdownMenuItem onClick={() => onEditReview?.(review)}>
                          <Edit3 className="w-4 h-4 mr-2" />
                          Edit Review
                        </DropdownMenuItem>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Review
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Review</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this review? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteReview(review.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    )}
                    
                    {user && user.id !== review.userId && (
                      <DropdownMenuItem onClick={() => handleReportReview(review.id)}>
                        <Flag className="w-4 h-4 mr-2" />
                        Report Review
                      </DropdownMenuItem>
                    )}
                    
                    {/* TODO: Add organizer check here */}
                    {user && !review.organizerReply && (
                      <DropdownMenuItem onClick={() => setReplyingTo(review.id)}>
                        <Reply className="w-4 h-4 mr-2" />
                        Reply as Organizer
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Review Content */}
              {review.reviewText && (
                <p className="text-text-primary mb-4 leading-relaxed">{review.reviewText}</p>
              )}

              {/* Organizer Reply */}
              {review.organizerReply && (
                <div className="bg-surface-contrast p-4 rounded-lg mt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs">
                      Organizer Response
                    </Badge>
                    <span className="text-xs text-text-secondary">
                      {formatDistanceToNow(review.organizerReply.createdAt, { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-text-primary text-sm">{review.organizerReply.text}</p>
                  <p className="text-xs text-text-secondary mt-2">
                    — {review.organizerReply.organizerName}
                  </p>
                </div>
              )}

              {/* Reply Form */}
              {replyingTo === review.id && (
                <div className="mt-4 p-4 border border-border-default rounded-lg">
                  <h5 className="font-medium text-text-primary mb-3">Reply as Organizer</h5>
                  <Textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Thank the reviewer and address any concerns..."
                    className="mb-3"
                    maxLength={500}
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-text-secondary">
                      {replyText.length}/500 characters
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setReplyingTo(null);
                          setReplyText('');
                        }}
                        disabled={isSubmittingReply}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleSubmitReply(review.id)}
                        disabled={!replyText.trim() || isSubmittingReply}
                      >
                        {isSubmittingReply ? 'Posting...' : 'Post Reply'}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ReviewList; 