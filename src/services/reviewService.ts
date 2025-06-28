
import { supabase } from '@/integrations/supabase/client';

export interface Review {
  id: string;
  user_id: string;
  event_id: string;
  rating: number;
  comment: string;
  created_at: string;
  user?: {
    first_name: string;
    last_name: string;
  };
}

export interface ReviewStats {
  average_rating: number;
  total_reviews: number;
  rating_breakdown: Record<number, number>;
}

export class ReviewService {
  static async getEventReviews(eventId: string, limit = 10, offset = 0): Promise<Review[]> {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        user:profiles(first_name, last_name)
      `)
      .eq('event_id', eventId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching reviews:', error);
      return [];
    }

    return data || [];
  }

  static async getEventReviewStats(eventId: string): Promise<ReviewStats> {
    const { data, error } = await supabase
      .from('reviews')
      .select('rating')
      .eq('event_id', eventId);

    if (error) {
      console.error('Error fetching review stats:', error);
      return {
        average_rating: 0,
        total_reviews: 0,
        rating_breakdown: {},
      };
    }

    const reviews = data || [];
    const totalReviews = reviews.length;
    
    if (totalReviews === 0) {
      return {
        average_rating: 0,
        total_reviews: 0,
        rating_breakdown: {},
      };
    }

    const ratingSum = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = ratingSum / totalReviews;

    const ratingBreakdown: Record<number, number> = {};
    for (let i = 1; i <= 5; i++) {
      ratingBreakdown[i] = reviews.filter(review => review.rating === i).length;
    }

    return {
      average_rating: averageRating,
      total_reviews: totalReviews,
      rating_breakdown: ratingBreakdown,
    };
  }

  static async createReview(reviewData: {
    event_id: string;
    rating: number;
    comment: string;
  }): Promise<Review | null> {
    const { data, error } = await supabase
      .from('reviews')
      .insert({
        ...reviewData,
        user_id: (await supabase.auth.getUser()).data.user?.id,
      })
      .select(`
        *,
        user:profiles(first_name, last_name)
      `)
      .single();

    if (error) {
      console.error('Error creating review:', error);
      return null;
    }

    return data;
  }
}
