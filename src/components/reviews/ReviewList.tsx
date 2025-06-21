import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { StarRating } from './StarRating';
import { Review } from '@/services/reviewService';
import { formatDistanceToNow } from 'date-fns';
import { ThumbsUp, Flag, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { reviewService } from '@/services/reviewService';
import { toast } from 'sonner';

interface ReviewListProps {
  reviews: Review[];
  onReviewsUpdate: () => void;
}

interface ReviewItemProps {
  review: Review;
  onReviewUpdate: () => void;
}

const ReviewItem: React.FC<ReviewItemProps> = ({ review, onReviewUpdate }) => {
  const [isHelpfulLoading, setIsHelpfulLoading] = useState(false);

  const handleMarkHelpful = async () => {
    setIsHelpfulLoading(true);
    try {
      await reviewService.markReviewHelpful(review.id);
      toast.success('Marked as helpful!');
      onReviewUpdate();
    } catch (error) {
      toast.error('Failed to mark as helpful');
    } finally {
      setIsHelpfulLoading(false);
    }
  };

  const handleReport = async () => {
    try {
      await reviewService.reportReview(review.id, 'inappropriate_content');
      toast.success('Review reported. Thank you for helping us maintain quality.');
    } catch (error) {
      toast.error('Failed to report review');
    }
  };

  return (
    <Card className="mb-4">
      <CardContent className="pt-6">
        {/* Review Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={review.user_avatar} />
              <AvatarFallback>
                {review.username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{review.username}</span>
                {review.verified_attendee && (
                  <Badge variant="secondary" className="text-xs">
                    Verified Attendee
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <StarRating rating={review.rating} size="sm" />
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                </span>
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleReport}>
                <Flag className="h-4 w-4 mr-2" />
                Report Review
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Review Content */}
        <div className="space-y-3">
          <h4 className="font-medium text-lg">{review.title}</h4>
          <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {review.comment}
          </p>
        </div>

        <Separator className="my-4" />

        {/* Review Footer */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkHelpful}
            disabled={isHelpfulLoading}
            className="text-muted-foreground hover:text-foreground"
          >
            <ThumbsUp className="h-4 w-4 mr-2" />
            Helpful ({review.helpful_votes})
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export const ReviewList: React.FC<ReviewListProps> = ({
  reviews,
  onReviewsUpdate
}) => {
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'rating_high' | 'rating_low' | 'helpful'>('newest');

  const sortedReviews = [...reviews].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'rating_high':
        return b.rating - a.rating;
      case 'rating_low':
        return a.rating - b.rating;
      case 'helpful':
        return b.helpful_votes - a.helpful_votes;
      default:
        return 0;
    }
  });

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No reviews yet. Be the first to share your experience!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Sort Controls */}
      <div className="flex items-center gap-2 mb-6">
        <span className="text-sm text-muted-foreground">Sort by:</span>
        <div className="flex gap-1">
          {[
            { value: 'newest', label: 'Newest' },
            { value: 'helpful', label: 'Most Helpful' },
            { value: 'rating_high', label: 'Highest Rating' },
            { value: 'rating_low', label: 'Lowest Rating' },
          ].map((option) => (
            <Button
              key={option.value}
              variant={sortBy === option.value ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSortBy(option.value as any)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Review Items */}
      <div className="space-y-4">
        {sortedReviews.map((review) => (
          <ReviewItem
            key={review.id}
            review={review}
            onReviewUpdate={onReviewsUpdate}
          />
        ))}
      </div>
    </div>
  );
};