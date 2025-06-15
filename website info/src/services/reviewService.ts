// Review Service for managing reviews and ratings for various entities (events, stores, etc.)
export interface Review {
  id: string;
  entityType: 'event' | 'store' | 'service';
  entityId: string;
  userId: string;
  userName: string;
  userEmail: string;
  rating: number; // 1-5 stars
  reviewText?: string;
  createdAt: Date;
  updatedAt: Date;
  verified: boolean; // Has user attended/purchased from the entity
  organizerReply?: {
    text: string;
    createdAt: Date;
    organizerName: string;
  };
  reported: boolean;
  reportCount: number;
  helpfulVotes: number;
  voterIds: string[]; // Track who voted to prevent duplicate votes
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingBreakdown: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export interface CreateReviewRequest {
  entityType: 'event' | 'store' | 'service';
  entityId: string;
  rating: number;
  reviewText?: string;
}

export interface UpdateReviewRequest {
  reviewId: string;
  rating: number;
  reviewText?: string;
}

export interface OrganizerReplyRequest {
  reviewId: string;
  replyText: string;
  organizerName: string;
}

class ReviewService {
  private reviews: Review[] = [];
  private readonly EDIT_WINDOW_DAYS = 30;

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    const mockReviews: Review[] = [
      // Event reviews (existing)
      {
        id: 'rev-001',
        entityType: 'event',
        entityId: '1', // Chicago Step Championship
        userId: 'user-001',
        userName: 'Sarah Johnson',
        userEmail: 'sarah@example.com',
        rating: 5,
        reviewText: 'Amazing championship event! The competition was fierce and the organization was top-notch. Marcus is an incredible instructor and the venue was perfect for the event. Will definitely be back next year!',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
        verified: true,
        reported: false,
        reportCount: 0,
        helpfulVotes: 12,
        voterIds: ['voter1', 'voter2', 'voter3'],
        organizerReply: {
          text: 'Thank you so much Sarah! We\'re thrilled you had such a great time. Looking forward to seeing you at our next event!',
          createdAt: new Date('2024-01-16'),
          organizerName: 'Chicago Step Alliance'
        }
      },
      {
        id: 'rev-002',
        entityType: 'event',
        entityId: '1',
        userId: 'user-002',
        userName: 'Mike Davis',
        userEmail: 'mike@example.com',
        rating: 4,
        reviewText: 'Great championship event! Loved the variety of competition levels and the workshops. The venue was excellent and the atmosphere was electric. Only minor issue was the parking situation.',
        createdAt: new Date('2024-01-14'),
        updatedAt: new Date('2024-01-14'),
        verified: true,
        reported: false,
        reportCount: 0,
        helpfulVotes: 8,
        voterIds: ['voter4', 'voter5']
      },
      // Store reviews (new)
      {
        id: 'rev-store-001',
        entityType: 'store',
        entityId: 'store_001',
        userId: 'user-003',
        userName: 'Lisa Chen',
        userEmail: 'lisa@example.com',
        rating: 5,
        reviewText: 'Absolutely love this boutique! The stepping outfits are gorgeous and high quality. Michelle was so helpful in finding the perfect dress for my competition. Highly recommend!',
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date('2024-01-20'),
        verified: true,
        reported: false,
        reportCount: 0,
        helpfulVotes: 15,
        voterIds: ['voter6', 'voter7', 'voter8'],
        organizerReply: {
          text: 'Thank you so much Lisa! We\'re delighted you found the perfect dress. Best of luck in your competition!',
          createdAt: new Date('2024-01-21'),
          organizerName: 'Michelle Johnson'
        }
      },
      {
        id: 'rev-store-002',
        entityType: 'store',
        entityId: 'store_001',
        userId: 'user-004',
        userName: 'Robert Williams',
        userEmail: 'robert@example.com',
        rating: 4,
        reviewText: 'Great selection of dance attire. Prices are reasonable and quality is good. Store has a nice atmosphere and staff is knowledgeable about stepping fashion.',
        createdAt: new Date('2024-01-18'),
        updatedAt: new Date('2024-01-18'),
        verified: true,
        reported: false,
        reportCount: 0,
        helpfulVotes: 6,
        voterIds: ['voter9', 'voter10']
      },
      {
        id: 'rev-store-003',
        entityType: 'store',
        entityId: 'store_002',
        userId: 'user-005',
        userName: 'Angela Thompson',
        userEmail: 'angela@example.com',
        rating: 5,
        reviewText: 'Best dance shoes in the city! Robert really knows his craft and the custom fitting service is amazing. My new shoes fit perfectly and feel incredible to dance in.',
        createdAt: new Date('2024-01-16'),
        updatedAt: new Date('2024-01-16'),
        verified: true,
        reported: false,
        reportCount: 0,
        helpfulVotes: 22,
        voterIds: ['voter11', 'voter12', 'voter13', 'voter14']
      },
      {
        id: 'rev-store-004',
        entityType: 'store',
        entityId: 'store_002',
        userId: 'user-006',
        userName: 'Marcus Williams',
        userEmail: 'marcus@example.com',
        rating: 5,
        reviewText: 'Family business with incredible expertise. The repair service saved my favorite dancing shoes. Highly recommend for anyone serious about stepping.',
        createdAt: new Date('2024-01-14'),
        updatedAt: new Date('2024-01-14'),
        verified: true,
        reported: false,
        reportCount: 0,
        helpfulVotes: 18,
        voterIds: ['voter15', 'voter16', 'voter17']
      }
    ];

    this.reviews = mockReviews;
  }

  // Get reviews for a specific entity
  async getReviews(entityType: string, entityId: string, sortBy: 'recent' | 'rating' | 'helpful' = 'recent'): Promise<Review[]> {
    let entityReviews = this.reviews.filter(review => 
      review.entityType === entityType && review.entityId === entityId && !review.reported
    );

    // Sort reviews
    if (sortBy === 'recent') {
      entityReviews.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } else if (sortBy === 'rating') {
      entityReviews.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'helpful') {
      entityReviews.sort((a, b) => b.helpfulVotes - a.helpfulVotes);
    }

    return entityReviews;
  }

  // Get review statistics for an entity
  async getReviewStats(entityType: string, entityId: string): Promise<ReviewStats> {
    const entityReviews = this.reviews.filter(review => 
      review.entityType === entityType && review.entityId === entityId && !review.reported
    );

    if (entityReviews.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      };
    }

    const totalRating = entityReviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = Math.round((totalRating / entityReviews.length) * 10) / 10;

    const ratingBreakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    entityReviews.forEach(review => {
      ratingBreakdown[review.rating as keyof typeof ratingBreakdown]++;
    });

    return {
      averageRating,
      totalReviews: entityReviews.length,
      ratingBreakdown
    };
  }

  // Check if user can review an entity
  async canUserReview(entityType: string, entityId: string, userId: string): Promise<boolean> {
    const existingReview = this.reviews.find(review => 
      review.entityType === entityType && review.entityId === entityId && review.userId === userId
    );
    
    // User can review if they haven't reviewed yet and have interacted with the entity
    return !existingReview && this.hasUserInteractedWith(entityType, entityId, userId);
  }

  // Mock method to check if user has interacted with the entity
  private hasUserInteractedWith(entityType: string, entityId: string, userId: string): boolean {
    // Mock logic - in real implementation, this would check:
    // - For events: ticket purchases
    // - For stores: purchase history or verified visits
    // - For services: service bookings
    return true; // For demo purposes, allow all users to review
  }

  // Create a new review
  async submitReview(entityType: string, entityId: string, rating: number, reviewText?: string, userId: string = 'current_user', userName: string = 'Current User', userEmail: string = 'user@example.com'): Promise<Review> {
    const canReview = await this.canUserReview(entityType, entityId, userId);
    if (!canReview) {
      throw new Error('User cannot review this entity. Must have interacted with it and not already reviewed.');
    }

    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5 stars.');
    }

    const newReview: Review = {
      id: `rev-${entityType}-${Date.now()}`,
      entityType: entityType as 'event' | 'store' | 'service',
      entityId,
      userId,
      userName,
      userEmail,
      rating,
      reviewText: reviewText?.trim(),
      createdAt: new Date(),
      updatedAt: new Date(),
      verified: true, // In real implementation, verify actual interaction
      reported: false,
      reportCount: 0,
      helpfulVotes: 0,
      voterIds: []
    };

    this.reviews.push(newReview);
    return newReview;
  }

  // Vote on review helpfulness
  async voteOnReview(reviewId: string, userId: string, isHelpful: boolean): Promise<Review> {
    const review = this.reviews.find(r => r.id === reviewId);
    if (!review) {
      throw new Error('Review not found.');
    }

    if (review.userId === userId) {
      throw new Error('Cannot vote on your own review.');
    }

    // Check if user already voted
    const hasVoted = review.voterIds.includes(userId);
    if (hasVoted) {
      throw new Error('User has already voted on this review.');
    }

    if (isHelpful) {
      review.helpfulVotes++;
      review.voterIds.push(userId);
    }

    return review;
  }

  // Update an existing review
  async updateReview(request: UpdateReviewRequest, userId: string): Promise<Review> {
    const review = this.reviews.find(r => r.id === request.reviewId && r.userId === userId);
    if (!review) {
      throw new Error('Review not found or user not authorized to edit.');
    }

    // Check if review is within edit window
    const daysSinceCreation = (Date.now() - review.createdAt.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceCreation > this.EDIT_WINDOW_DAYS) {
      throw new Error(`Reviews can only be edited within ${this.EDIT_WINDOW_DAYS} days of creation.`);
    }

    if (request.rating < 1 || request.rating > 5) {
      throw new Error('Rating must be between 1 and 5 stars.');
    }

    review.rating = request.rating;
    review.reviewText = request.reviewText?.trim();
    review.updatedAt = new Date();

    return review;
  }

  // Delete a review
  async deleteReview(reviewId: string, userId: string): Promise<boolean> {
    const reviewIndex = this.reviews.findIndex(r => r.id === reviewId && r.userId === userId);
    if (reviewIndex === -1) {
      throw new Error('Review not found or user not authorized to delete.');
    }

    const review = this.reviews[reviewIndex];
    
    // Check if review is within edit window
    const daysSinceCreation = (Date.now() - review.createdAt.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceCreation > this.EDIT_WINDOW_DAYS) {
      throw new Error(`Reviews can only be deleted within ${this.EDIT_WINDOW_DAYS} days of creation.`);
    }

    this.reviews.splice(reviewIndex, 1);
    return true;
  }

  // Add organizer reply to a review
  async addOrganizerReply(request: OrganizerReplyRequest): Promise<Review> {
    const review = this.reviews.find(r => r.id === request.reviewId);
    if (!review) {
      throw new Error('Review not found.');
    }

    if (review.organizerReply) {
      throw new Error('Organizer has already replied to this review.');
    }

    review.organizerReply = {
      text: request.replyText.trim(),
      createdAt: new Date(),
      organizerName: request.organizerName
    };

    return review;
  }

  // Report a review
  async reportReview(reviewId: string, userId: string): Promise<boolean> {
    const review = this.reviews.find(r => r.id === reviewId);
    if (!review) {
      throw new Error('Review not found.');
    }

    if (review.userId === userId) {
      throw new Error('Cannot report your own review.');
    }

    review.reportCount++;
    
    // Auto-hide reviews with multiple reports (mock moderation)
    if (review.reportCount >= 3) {
      review.reported = true;
    }

    return true;
  }

  // Get user's reviews
  async getUserReviews(userId: string, entityType?: string): Promise<Review[]> {
    let userReviews = this.reviews.filter(review => review.userId === userId);
    
    if (entityType) {
      userReviews = userReviews.filter(review => review.entityType === entityType);
    }
    
    return userReviews;
  }

  // Legacy methods for backward compatibility
  async getEventReviews(eventId: string, sortBy: 'recent' | 'rating' = 'recent'): Promise<Review[]> {
    return this.getReviews('event', eventId, sortBy);
  }

  async getEventReviewStats(eventId: string): Promise<ReviewStats> {
    return this.getReviewStats('event', eventId);
  }

  async canUserReviewEvent(eventId: string, userId: string): Promise<boolean> {
    return this.canUserReview('event', eventId, userId);
  }

  async createReview(request: CreateReviewRequest, userId: string, userName: string, userEmail: string): Promise<Review> {
    return this.submitReview(request.entityType, request.entityId, request.rating, request.reviewText, userId, userName, userEmail);
  }
}

export const reviewService = new ReviewService(); 