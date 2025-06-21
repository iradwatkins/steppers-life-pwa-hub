import { Database } from '@/integrations/supabase/types';

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
  rating_breakdown: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
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
      // Mock data for development - replace with actual API call
      const mockReviews: Review[] = [
        {
          id: '1',
          event_id: eventId,
          user_id: 'user1',
          username: 'SalsaQueen23',
          user_avatar: '/api/placeholder/40/40',
          rating: 5,
          title: 'Amazing instructors and great atmosphere!',
          comment: 'I absolutely loved this class! The instructors were patient and really helped me improve my technique. The venue was perfect and the energy was fantastic. Can\'t wait for the next one!',
          verified_attendee: true,
          helpful_votes: 12,
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '2',
          event_id: eventId,
          user_id: 'user2',
          username: 'DanceEnthusiast',
          rating: 4,
          title: 'Great event, minor room issues',
          comment: 'The teaching quality was excellent and I learned so much. The only downside was the room got a bit crowded during peak times. Overall highly recommend!',
          verified_attendee: true,
          helpful_votes: 8,
          created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '3',
          event_id: eventId,
          user_id: 'user3',
          username: 'FirstTimer',
          rating: 5,
          title: 'Perfect for beginners!',
          comment: 'As someone completely new to salsa, I was nervous but the instructors made me feel so welcome. The step-by-step approach was perfect and I actually felt confident by the end!',
          verified_attendee: true,
          helpful_votes: 15,
          created_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '4',
          event_id: eventId,
          user_id: 'user4',
          username: 'AdvancedDancer',
          rating: 4,
          title: 'Good advanced techniques covered',
          comment: 'Nice to see some more challenging moves being taught. The instructors clearly know their stuff. Would love to see even more advanced workshops in the future.',
          verified_attendee: true,
          helpful_votes: 6,
          created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        }
      ];

      return mockReviews;
    } catch (error) {
      console.error('Error fetching event reviews:', error);
      throw error;
    }
  }

  // Get review statistics for an event
  async getEventReviewStats(eventId: string): Promise<ReviewStats> {
    try {
      const reviews = await this.getEventReviews(eventId);
      
      const ratingBreakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      let totalRating = 0;

      reviews.forEach(review => {
        ratingBreakdown[review.rating as keyof typeof ratingBreakdown]++;
        totalRating += review.rating;
      });

      const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;

      return {
        total_reviews: reviews.length,
        average_rating: Math.round(averageRating * 10) / 10,
        rating_breakdown: ratingBreakdown
      };
    } catch (error) {
      console.error('Error fetching review stats:', error);
      throw error;
    }
  }

  // Create a new review
  async createReview(reviewData: CreateReviewData): Promise<Review> {
    try {
      // Mock implementation - replace with actual API call
      const newReview: Review = {
        id: Date.now().toString(),
        event_id: reviewData.event_id,
        user_id: 'current-user',
        username: 'CurrentUser',
        rating: reviewData.rating,
        title: reviewData.title,
        comment: reviewData.comment,
        verified_attendee: false, // Would be determined by attendance records
        helpful_votes: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      return newReview;
    } catch (error) {
      console.error('Error creating review:', error);
      throw error;
    }
  }

  // Mark review as helpful
  async markReviewHelpful(reviewId: string): Promise<void> {
    try {
      // Mock implementation - replace with actual API call
      console.log(`Marking review ${reviewId} as helpful`);
    } catch (error) {
      console.error('Error marking review as helpful:', error);
      throw error;
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