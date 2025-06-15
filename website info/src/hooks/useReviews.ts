import { useState, useEffect } from 'react';
import { reviewService, Review, ReviewStats, CreateReviewRequest, UpdateReviewRequest, OrganizerReplyRequest } from '@/services/reviewService';
import { useAuth } from '@/hooks/useAuth';

export const useReviews = (entityType?: string, entityId?: string) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewStats, setReviewStats] = useState<ReviewStats>({
    averageRating: 0,
    totalReviews: 0,
    ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'recent' | 'rating' | 'helpful'>('recent');
  const { user } = useAuth();

  const loadReviews = async () => {
    if (!entityType || !entityId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const [reviewsData, statsData] = await Promise.all([
        reviewService.getReviews(entityType, entityId, sortBy),
        reviewService.getReviewStats(entityType, entityId)
      ]);
      
      setReviews(reviewsData);
      setReviewStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (entityType && entityId) {
      loadReviews();
    }
  }, [entityType, entityId, sortBy]);

  const canUserReview = async (): Promise<boolean> => {
    if (!user || !entityType || !entityId) return false;
    
    try {
      return await reviewService.canUserReview(entityType, entityId, user.id);
    } catch (err) {
      return false;
    }
  };

  const submitReview = async (rating: number, reviewText?: string): Promise<void> => {
    if (!user) {
      throw new Error('Must be logged in to submit a review');
    }

    if (!entityType || !entityId) {
      throw new Error('Entity type and ID are required');
    }

    try {
      await reviewService.submitReview(
        entityType,
        entityId,
        rating,
        reviewText,
        user.id,
        user.email || 'Anonymous User',
        user.email || ''
      );
      
      // Reload reviews to show the new review
      await loadReviews();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to submit review');
    }
  };

  const voteOnReview = async (reviewId: string, isHelpful: boolean): Promise<void> => {
    if (!user) {
      throw new Error('Must be logged in to vote on reviews');
    }

    try {
      await reviewService.voteOnReview(reviewId, user.id, isHelpful);
      await loadReviews();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to vote on review');
    }
  };

  const createReview = async (request: CreateReviewRequest): Promise<void> => {
    if (!user) {
      throw new Error('Must be logged in to submit a review');
    }

    try {
      await reviewService.createReview(
        request,
        user.id,
        user.email || 'Anonymous User',
        user.email || ''
      );
      
      // Reload reviews to show the new review
      await loadReviews();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create review');
    }
  };

  const updateReview = async (request: UpdateReviewRequest): Promise<void> => {
    if (!user) {
      throw new Error('Must be logged in to update a review');
    }

    try {
      await reviewService.updateReview(request, user.id);
      await loadReviews();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update review');
    }
  };

  const deleteReview = async (reviewId: string): Promise<void> => {
    if (!user) {
      throw new Error('Must be logged in to delete a review');
    }

    try {
      await reviewService.deleteReview(reviewId, user.id);
      await loadReviews();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete review');
    }
  };

  const addOrganizerReply = async (request: OrganizerReplyRequest): Promise<void> => {
    try {
      await reviewService.addOrganizerReply(request);
      await loadReviews();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to add organizer reply');
    }
  };

  const reportReview = async (reviewId: string): Promise<void> => {
    if (!user) {
      throw new Error('Must be logged in to report a review');
    }

    try {
      await reviewService.reportReview(reviewId, user.id);
      await loadReviews();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to report review');
    }
  };

  const changeSortOrder = (newSortBy: 'recent' | 'rating' | 'helpful') => {
    setSortBy(newSortBy);
  };

  const getUserReview = (): Review | undefined => {
    if (!user) return undefined;
    return reviews.find(review => review.userId === user.id);
  };

  const canEditReview = (review: Review): boolean => {
    if (!user || review.userId !== user.id) return false;
    
    const daysSinceCreation = (Date.now() - review.createdAt.getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceCreation <= 30; // 30-day edit window
  };

  // Generic methods that can work with any entity type
  const getReviews = async (type: string, id: string, sort: 'recent' | 'rating' | 'helpful' = 'recent'): Promise<Review[]> => {
    return await reviewService.getReviews(type, id, sort);
  };

  const getReviewStats = async (type: string, id: string): Promise<ReviewStats> => {
    return await reviewService.getReviewStats(type, id);
  };

  return {
    reviews,
    reviewStats,
    loading,
    error,
    sortBy,
    canUserReview,
    submitReview,
    voteOnReview,
    createReview,
    updateReview,
    deleteReview,
    addOrganizerReply,
    reportReview,
    changeSortOrder,
    getUserReview,
    canEditReview,
    getReviews,
    getReviewStats,
    refresh: loadReviews
  };
}; 