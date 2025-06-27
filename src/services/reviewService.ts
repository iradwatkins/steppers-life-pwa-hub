import { supabase } from '@/integrations/supabase/client';

// Type definitions for review system
export interface Review {
  id: string;
  event_id: string;
  user_id: string;
  username: string;
  user_avatar?: string;
  rating: number; // 1-5 stars
  title: string;
  comment: string;
  verified_attendee: boolean;
  helpful_votes: number;
  created_at: string;
  updated_at: string;
}

export interface ReviewStats {
  total_reviews: number;
  average_rating: number;
  rating_distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  verified_reviews: number;
}

export interface CreateReviewData {
  event_id: string;
  rating: number;
  title: string;
  comment: string;
}

class ReviewService {
  // Get reviews for an event
  async getEventReviews(eventId: string): Promise<Review[]> {
    try {
      console.log('Fetching reviews for event:', eventId);
      
      const { supabase } = await import('@/integrations/supabase/client');
      
      const { data, error } = await supabase
        .from('event_reviews')
        .select(`
          *,
          users!inner (
            full_name,
            avatar_url
          )
        `)
        .eq('event_id', eventId)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching reviews:', error);
        throw error;
      }

      return (data || []).map(review => ({
        id: review.id,
        event_id: review.event_id,
        user_id: review.user_id,
        rating: review.rating,
        title: review.title || '',
        comment: review.comment || '',
        verified_attendee: review.verified_attendee || false,
        is_approved: review.is_approved,
        helpful_votes: review.helpful_votes || 0,
        created_at: review.created_at,
        updated_at: review.updated_at,
        user: {
          full_name: (review.users as any)?.full_name || 'Anonymous',
          avatar_url: (review.users as any)?.avatar_url
        }
      }));
    } catch (error) {
      console.error('Error fetching event reviews:', error);
      return [];
    }
  }

  // Get review statistics for an event
  async getReviewStats(eventId: string): Promise<ReviewStats> {
    try {
      const reviews = await this.getEventReviews(eventId);
      
      if (reviews.length === 0) {
        return {
          total_reviews: 0,
          average_rating: 0,
          rating_distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
          verified_reviews: 0
        };
      }

      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / reviews.length;
      
      const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      reviews.forEach(review => {
        distribution[review.rating as keyof typeof distribution]++;
      });

      const verifiedCount = reviews.filter(r => r.verified_attendee).length;

      return {
        total_reviews: reviews.length,
        average_rating: Math.round(averageRating * 10) / 10,
        rating_distribution: distribution,
        verified_reviews: verifiedCount
      };
    } catch (error) {
      console.error('Error calculating review stats:', error);
      return {
        total_reviews: 0,
        average_rating: 0,
        rating_distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        verified_reviews: 0
      };
    }
  }

  // Submit a new review
  async submitReview(eventId: string, userId: string, reviewData: {
    rating: number;
    title: string;
    comment: string;
  }): Promise<boolean> {
    try {
      console.log('Submitting review for event:', eventId, 'by user:', userId, reviewData);
      
      const { supabase } = await import('@/integrations/supabase/client');
      
      // Check if user attended the event (has completed order)
      const { data: attendeeCheck, error: attendeeError } = await supabase
        .from('orders')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .eq('status', 'completed')
        .single();

      const verifiedAttendee = !attendeeError && attendeeCheck;

      // Check if user already reviewed this event
      const { data: existingReview, error: existingError } = await supabase
        .from('event_reviews')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .single();

      if (!existingError && existingReview) {
        console.warn('User has already reviewed this event');
        return false;
      }

      const { data, error } = await supabase
        .from('event_reviews')
        .insert({
          event_id: eventId,
          user_id: userId,
          rating: reviewData.rating,
          title: reviewData.title,
          comment: reviewData.comment,
          verified_attendee: verifiedAttendee,
          is_approved: true, // Auto-approve for now, could add moderation later
          helpful_votes: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error submitting review:', error);
        throw error;
      }

      console.log('✅ Review submitted successfully:', data);
      return true;
    } catch (error) {
      console.error('Error submitting review:', error);
      return false;
    }
  }

  // Mark a review as helpful
  async markReviewHelpful(reviewId: string, userId: string): Promise<boolean> {
    try {
      console.log('Marking review helpful:', reviewId, 'by user:', userId);
      
      const { supabase } = await import('@/integrations/supabase/client');
      
      // Check if user already voted on this review
      const { data: existingVote, error: voteError } = await supabase
        .from('review_helpful_votes')
        .select('id')
        .eq('review_id', reviewId)
        .eq('user_id', userId)
        .single();

      if (!voteError && existingVote) {
        console.warn('User already voted on this review');
        return false;
      }

      // Add helpful vote
      const { error: insertError } = await supabase
        .from('review_helpful_votes')
        .insert({
          review_id: reviewId,
          user_id: userId,
          created_at: new Date().toISOString()
        });

      if (insertError) {
        console.error('❌ Error recording helpful vote:', insertError);
        throw insertError;
      }

      // Update helpful votes count
      const { error: updateError } = await supabase
        .rpc('increment_helpful_votes', { review_id: reviewId });

      if (updateError) {
        console.error('❌ Error updating helpful votes count:', updateError);
        throw updateError;
      }

      console.log('✅ Review marked as helpful successfully');
      return true;
    } catch (error) {
      console.error('Error marking review helpful:', error);
      return false;
    }
  }

  // Report a review
  async reportReview(reviewId: string, reason: string): Promise<void> {
    try {
      // Mock implementation - replace with actual API call
      console.log(`Reporting review ${reviewId} for: ${reason}`);
    } catch (error) {
      console.error('Error reporting review:', error);
      throw error;
    }
  }
}

export const reviewService = new ReviewService();
export default reviewService;