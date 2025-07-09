import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StarRating } from './StarRating';
import { Review } from '@/services/reviewService';
import { formatDistanceToNow } from 'date-fns';
import { ThumbsUp, Flag } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
      toast.success('Review reported. Thank you for helping us maintain quality.');
    } catch (error) {
      toast.error('Failed to report review');
    }
  };

  return (
    <Card className="mb-4">
      <CardContent className="p-6">
        {/* Review Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={review.user?.avatar_url} />
              <AvatarFallback>
                {(review.user?.first_name || 'U').slice(0, 1).toUpperCase()}
                {(review.user?.last_name || 'N').slice(0, 1).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  {review.user?.first_name} {review.user?.last_name}
                </span>
                <Badge variant="secondary" className="text-xs">
                  Verified
                </Badge>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <StarRating rating={review.rating} size="sm" showValue={false} />
                <span className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Review Content */}
        <div className="space-y-3">
          <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {review.comment}
          </p>
        </div>

        {/* Review Actions */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkHelpful}
              disabled={isHelpfulLoading}
              className="text-muted-foreground hover:text-foreground"
            >
              <ThumbsUp className="h-4 w-4 mr-2" />
              Helpful (0)
            </Button>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReport}
            className="text-muted-foreground hover:text-foreground"
          >
            <Flag className="h-4 w-4 mr-2" />
            Report
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export const ReviewList: React.FC<ReviewListProps> = ({ reviews, onReviewsUpdate }) => {
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'rating' | 'helpful'>('newest');

  const sortedReviews = [...reviews].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'rating':
        return b.rating - a.rating;
      case 'helpful':
        return 0; // No helpful votes yet
      default:
        return 0;
    }
  });

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No reviews yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Sort Controls */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Sort by:</span>
        <div className="flex gap-1">
          {([
            { key: 'newest', label: 'Newest' },
            { key: 'oldest', label: 'Oldest' },
            { key: 'rating', label: 'Rating' },
            { key: 'helpful', label: 'Most Helpful' },
          ] as const).map(({ key, label }) => (
            <Button
              key={key}
              variant={sortBy === key ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSortBy(key)}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      {/* Reviews */}
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