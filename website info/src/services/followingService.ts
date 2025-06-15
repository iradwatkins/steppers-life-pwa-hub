// Following Service for managing follows of organizers, instructors, and community businesses

export type FollowableEntityType = 'organizer' | 'instructor' | 'business';

export interface FollowableEntity {
  id: string;
  type: FollowableEntityType;
  name: string;
  description?: string;
  avatar_url?: string;
  cover_image_url?: string;
  location?: {
    city: string;
    state: string;
    country: string;
  };
  specialties?: string[];
  follower_count: number;
  following_count?: number;
  verified: boolean;
  created_at: string;
  last_active?: string;
  social_links?: {
    website?: string;
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
  };
}

export interface OrganizerProfile extends FollowableEntity {
  type: 'organizer';
  company_name?: string;
  events_hosted: number;
  avg_event_rating: number;
  upcoming_events_count: number;
  total_tickets_sold: number;
  event_categories: string[];
}

export interface InstructorProfile extends FollowableEntity {
  type: 'instructor';
  years_experience: number;
  dance_styles: string[];
  skill_levels_taught: string[];
  certifications: string[];
  avg_rating: number;
  total_students_taught: number;
  classes_taught: number;
  availability_status: 'available' | 'busy' | 'unavailable';
}

export interface BusinessProfile extends FollowableEntity {
  type: 'business';
  business_type: string;
  services_offered: string[];
  hours_of_operation?: {
    [key: string]: string;
  };
  contact_info: {
    phone?: string;
    email?: string;
    address?: string;
  };
  rating: number;
  review_count: number;
  price_range: '$' | '$$' | '$$$' | '$$$$';
}

export interface FollowingRelationship {
  id: string;
  user_id: string;
  entity_id: string;
  entity_type: FollowableEntityType;
  followed_at: string;
  notification_preferences: {
    new_events: boolean;
    announcements: boolean;
    promotions: boolean;
    live_updates: boolean;
  };
  engagement_score: number;
  last_interaction?: string;
}

export interface FollowingFeedItem {
  id: string;
  entity_id: string;
  entity_type: FollowableEntityType;
  entity_name: string;
  entity_avatar: string;
  activity_type: 'new_event' | 'announcement' | 'achievement' | 'update' | 'promotion';
  title: string;
  description: string;
  content_url?: string;
  image_url?: string;
  created_at: string;
  engagement: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
  };
  tags: string[];
}

export interface FollowingRecommendation {
  entity: FollowableEntity;
  score: number;
  reasons: string[];
  mutual_connections: number;
  similar_followers: string[];
  trending_factor: number;
  category_match: number;
  location_relevance: number;
}

export interface FollowingAnalytics {
  total_following: number;
  by_type: {
    organizers: number;
    instructors: number;
    businesses: number;
  };
  engagement_stats: {
    avg_weekly_interactions: number;
    top_categories: string[];
    most_active_follows: FollowableEntity[];
  };
  discovery_stats: {
    follows_from_recommendations: number;
    follows_from_search: number;
    follows_from_events: number;
  };
  notification_stats: {
    total_notifications_received: number;
    notifications_per_week: number;
    most_active_entities: FollowableEntity[];
  };
}

export interface FollowingActivity {
  id: string;
  user_id: string;
  activity_type: 'followed' | 'unfollowed' | 'engaged' | 'shared' | 'reviewed';
  entity_id: string;
  entity_type: FollowableEntityType;
  details: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

class FollowingService {
  // Follow/Unfollow Operations
  async followEntity(userId: string, entityId: string, entityType: FollowableEntityType): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if already following
      const existingFollow = await this.getFollowingStatus(userId, entityId, entityType);
      if (existingFollow.isFollowing) {
        return { success: false, error: 'Already following this entity' };
      }

      // Create following relationship
      const followingRelationship: FollowingRelationship = {
        id: `follow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        user_id: userId,
        entity_id: entityId,
        entity_type: entityType,
        followed_at: new Date().toISOString(),
        notification_preferences: {
          new_events: true,
          announcements: true,
          promotions: false,
          live_updates: true
        },
        engagement_score: 0,
        last_interaction: new Date().toISOString()
      };

      // Store following relationship (in real app, this would be in database)
      const existingFollows = this.getStoredFollows(userId);
      existingFollows.push(followingRelationship);
      localStorage.setItem(`following_${userId}`, JSON.stringify(existingFollows));

      // Log activity
      await this.logFollowingActivity(userId, 'followed', entityId, entityType, `Followed ${entityType}`);

      // Trigger notification to entity owner (in real app)
      // await notificationService.sendFollowNotification(entityId, userId);

      return { success: true };
    } catch (error) {
      console.error('Error following entity:', error);
      return { success: false, error: 'Failed to follow entity' };
    }
  }

  async unfollowEntity(userId: string, entityId: string, entityType: FollowableEntityType): Promise<{ success: boolean; error?: string }> {
    try {
      // Get existing follows
      const existingFollows = this.getStoredFollows(userId);
      const updatedFollows = existingFollows.filter(
        follow => !(follow.entity_id === entityId && follow.entity_type === entityType)
      );

      if (existingFollows.length === updatedFollows.length) {
        return { success: false, error: 'Not following this entity' };
      }

      // Update storage
      localStorage.setItem(`following_${userId}`, JSON.stringify(updatedFollows));

      // Log activity
      await this.logFollowingActivity(userId, 'unfollowed', entityId, entityType, `Unfollowed ${entityType}`);

      return { success: true };
    } catch (error) {
      console.error('Error unfollowing entity:', error);
      return { success: false, error: 'Failed to unfollow entity' };
    }
  }

  // Following Status and Relationships
  async getFollowingStatus(userId: string, entityId: string, entityType: FollowableEntityType): Promise<{ isFollowing: boolean; relationship?: FollowingRelationship }> {
    try {
      const follows = this.getStoredFollows(userId);
      const relationship = follows.find(
        follow => follow.entity_id === entityId && follow.entity_type === entityType
      );

      return {
        isFollowing: !!relationship,
        relationship
      };
    } catch (error) {
      console.error('Error checking following status:', error);
      return { isFollowing: false };
    }
  }

  async getFollowingList(userId: string, entityType?: FollowableEntityType): Promise<FollowingRelationship[]> {
    try {
      const follows = this.getStoredFollows(userId);
      return entityType 
        ? follows.filter(follow => follow.entity_type === entityType)
        : follows;
    } catch (error) {
      console.error('Error getting following list:', error);
      return [];
    }
  }

  async getFollowersCount(entityId: string, entityType: FollowableEntityType): Promise<number> {
    try {
      // In real app, this would be a database query
      // For now, simulate with some logic
      const allUsers = ['user1', 'user2', 'user3', 'user4', 'user5']; // Mock user IDs
      let totalFollowers = 0;

      for (const userId of allUsers) {
        const follows = this.getStoredFollows(userId);
        const isFollowing = follows.some(
          follow => follow.entity_id === entityId && follow.entity_type === entityType
        );
        if (isFollowing) totalFollowers++;
      }

      // Add some mock baseline followers
      const mockBaseFollowers = parseInt(entityId.slice(-2), 16) || 50;
      return totalFollowers + mockBaseFollowers;
    } catch (error) {
      console.error('Error getting followers count:', error);
      return 0;
    }
  }

  // Entity Data Management
  async getOrganizerProfile(organizerId: string): Promise<OrganizerProfile | null> {
    try {
      // Mock organizer data - in real app, fetch from database
      const mockOrganizer: OrganizerProfile = {
        id: organizerId,
        type: 'organizer',
        name: 'Chicago Steppers Elite',
        description: 'Premier Chicago stepping events and competitions. Bringing the community together through dance.',
        avatar_url: '/placeholder.svg',
        cover_image_url: '/placeholder.svg',
        location: {
          city: 'Chicago',
          state: 'IL',
          country: 'USA'
        },
        specialties: ['Chicago Stepping', 'Competitions', 'Social Events'],
        follower_count: await this.getFollowersCount(organizerId, 'organizer'),
        verified: true,
        created_at: '2020-01-15T00:00:00Z',
        last_active: new Date().toISOString(),
        company_name: 'Chicago Steppers Elite LLC',
        events_hosted: 127,
        avg_event_rating: 4.8,
        upcoming_events_count: 8,
        total_tickets_sold: 15420,
        event_categories: ['Stepping', 'Social Dance', 'Competition'],
        social_links: {
          website: 'https://chicagostepperselite.com',
          facebook: 'https://facebook.com/chicagostepperselite',
          instagram: 'https://instagram.com/chicagostepperselite'
        }
      };

      return mockOrganizer;
    } catch (error) {
      console.error('Error getting organizer profile:', error);
      return null;
    }
  }

  async getInstructorProfile(instructorId: string): Promise<InstructorProfile | null> {
    try {
      // Mock instructor data
      const mockInstructor: InstructorProfile = {
        id: instructorId,
        type: 'instructor',
        name: 'Maria Rodriguez',
        description: 'Professional Chicago Stepping instructor with 15+ years experience. Specializing in technique and styling.',
        avatar_url: '/placeholder.svg',
        cover_image_url: '/placeholder.svg',
        location: {
          city: 'Chicago',
          state: 'IL',
          country: 'USA'
        },
        specialties: ['Chicago Stepping', 'Partner Work', 'Styling'],
        follower_count: await this.getFollowersCount(instructorId, 'instructor'),
        verified: true,
        created_at: '2018-06-01T00:00:00Z',
        last_active: new Date().toISOString(),
        years_experience: 15,
        dance_styles: ['Chicago Stepping', 'Smooth Stepping', 'Fast Stepping'],
        skill_levels_taught: ['Beginner', 'Intermediate', 'Advanced'],
        certifications: ['Certified Stepping Instructor', 'Dance Pedagogy Certificate'],
        avg_rating: 4.9,
        total_students_taught: 850,
        classes_taught: 234,
        availability_status: 'available',
        social_links: {
          instagram: 'https://instagram.com/mariasteps',
          youtube: 'https://youtube.com/mariarodriguessteps'
        }
      };

      return mockInstructor;
    } catch (error) {
      console.error('Error getting instructor profile:', error);
      return null;
    }
  }

  async getBusinessProfile(businessId: string): Promise<BusinessProfile | null> {
    try {
      // Mock business data
      const mockBusiness: BusinessProfile = {
        id: businessId,
        type: 'business',
        name: 'Smooth Steps Dance Studio',
        description: 'Full-service dance studio offering lessons, rentals, and events. Your home for stepping in the city.',
        avatar_url: '/placeholder.svg',
        cover_image_url: '/placeholder.svg',
        location: {
          city: 'Chicago',
          state: 'IL',
          country: 'USA'
        },
        specialties: ['Dance Lessons', 'Studio Rental', 'Events'],
        follower_count: await this.getFollowersCount(businessId, 'business'),
        verified: true,
        created_at: '2019-03-01T00:00:00Z',
        last_active: new Date().toISOString(),
        business_type: 'Dance Studio',
        services_offered: ['Private Lessons', 'Group Classes', 'Studio Rental', 'Event Hosting'],
        hours_of_operation: {
          'Monday': '6:00 PM - 10:00 PM',
          'Tuesday': '6:00 PM - 10:00 PM', 
          'Wednesday': '6:00 PM - 10:00 PM',
          'Thursday': '6:00 PM - 10:00 PM',
          'Friday': '7:00 PM - 12:00 AM',
          'Saturday': '2:00 PM - 12:00 AM',
          'Sunday': '2:00 PM - 8:00 PM'
        },
        contact_info: {
          phone: '(312) 555-0123',
          email: 'info@smoothstepsstudio.com',
          address: '123 Dance Street, Chicago, IL 60601'
        },
        rating: 4.7,
        review_count: 156,
        price_range: '$$',
        social_links: {
          website: 'https://smoothstepsstudio.com',
          facebook: 'https://facebook.com/smoothstepsstudio',
          instagram: 'https://instagram.com/smoothstepsstudio'
        }
      };

      return mockBusiness;
    } catch (error) {
      console.error('Error getting business profile:', error);
      return null;
    }
  }

  // Following Feed
  async getFollowingFeed(userId: string, limit: number = 20, offset: number = 0): Promise<FollowingFeedItem[]> {
    try {
      const follows = this.getStoredFollows(userId);
      const feedItems: FollowingFeedItem[] = [];

      // Generate mock feed items for followed entities
      for (const follow of follows) {
        const entity = await this.getEntityProfile(follow.entity_id, follow.entity_type);
        if (!entity) continue;

        // Generate 1-3 feed items per followed entity
        const itemCount = Math.floor(Math.random() * 3) + 1;
        
        for (let i = 0; i < itemCount; i++) {
          const mockItem: FollowingFeedItem = {
            id: `feed_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            entity_id: entity.id,
            entity_type: entity.type,
            entity_name: entity.name,
            entity_avatar: entity.avatar_url || '/placeholder.svg',
            activity_type: this.getRandomActivityType(),
            title: this.generateMockTitle(entity.type, entity.name),
            description: this.generateMockDescription(entity.type),
            content_url: `/events/${entity.id}`,
            image_url: '/placeholder.svg',
            created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
            engagement: {
              views: Math.floor(Math.random() * 500) + 50,
              likes: Math.floor(Math.random() * 100) + 5,
              comments: Math.floor(Math.random() * 25) + 1,
              shares: Math.floor(Math.random() * 15) + 1
            },
            tags: entity.specialties || []
          };

          feedItems.push(mockItem);
        }
      }

      // Sort by date and apply pagination
      const sortedItems = feedItems.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      return sortedItems.slice(offset, offset + limit);
    } catch (error) {
      console.error('Error getting following feed:', error);
      return [];
    }
  }

  // Recommendations
  async getRecommendations(userId: string, limit: number = 10): Promise<FollowingRecommendation[]> {
    try {
      const userFollows = this.getStoredFollows(userId);
      const followedEntityIds = userFollows.map(f => f.entity_id);
      
      // Mock recommendation data
      const mockEntities = await this.getMockEntities();
      const recommendations: FollowingRecommendation[] = [];

      for (const entity of mockEntities) {
        if (followedEntityIds.includes(entity.id)) continue;

        const recommendation: FollowingRecommendation = {
          entity,
          score: Math.random() * 100,
          reasons: this.generateRecommendationReasons(entity),
          mutual_connections: Math.floor(Math.random() * 10),
          similar_followers: ['friend1', 'friend2', 'friend3'].slice(0, Math.floor(Math.random() * 3)),
          trending_factor: Math.random() * 50,
          category_match: Math.random() * 100,
          location_relevance: Math.random() * 100
        };

        recommendations.push(recommendation);
      }

      return recommendations
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting recommendations:', error);
      return [];
    }
  }

  // Analytics
  async getFollowingAnalytics(userId: string): Promise<FollowingAnalytics> {
    try {
      const follows = this.getStoredFollows(userId);
      
      const analytics: FollowingAnalytics = {
        total_following: follows.length,
        by_type: {
          organizers: follows.filter(f => f.entity_type === 'organizer').length,
          instructors: follows.filter(f => f.entity_type === 'instructor').length,
          businesses: follows.filter(f => f.entity_type === 'business').length
        },
        engagement_stats: {
          avg_weekly_interactions: Math.floor(Math.random() * 50) + 10,
          top_categories: ['Chicago Stepping', 'Social Events', 'Lessons'],
          most_active_follows: [] // Would be populated with actual entities
        },
        discovery_stats: {
          follows_from_recommendations: Math.floor(follows.length * 0.3),
          follows_from_search: Math.floor(follows.length * 0.4),
          follows_from_events: Math.floor(follows.length * 0.3)
        },
        notification_stats: {
          total_notifications_received: Math.floor(Math.random() * 200) + 50,
          notifications_per_week: Math.floor(Math.random() * 20) + 5,
          most_active_entities: [] // Would be populated with actual entities
        }
      };

      return analytics;
    } catch (error) {
      console.error('Error getting following analytics:', error);
      return {
        total_following: 0,
        by_type: { organizers: 0, instructors: 0, businesses: 0 },
        engagement_stats: { avg_weekly_interactions: 0, top_categories: [], most_active_follows: [] },
        discovery_stats: { follows_from_recommendations: 0, follows_from_search: 0, follows_from_events: 0 },
        notification_stats: { total_notifications_received: 0, notifications_per_week: 0, most_active_entities: [] }
      };
    }
  }

  // Notification Preferences
  async updateNotificationPreferences(
    userId: string, 
    entityId: string, 
    entityType: FollowableEntityType, 
    preferences: Partial<FollowingRelationship['notification_preferences']>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const follows = this.getStoredFollows(userId);
      const followIndex = follows.findIndex(
        f => f.entity_id === entityId && f.entity_type === entityType
      );

      if (followIndex === -1) {
        return { success: false, error: 'Not following this entity' };
      }

      follows[followIndex].notification_preferences = {
        ...follows[followIndex].notification_preferences,
        ...preferences
      };

      localStorage.setItem(`following_${userId}`, JSON.stringify(follows));
      return { success: true };
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      return { success: false, error: 'Failed to update preferences' };
    }
  }

  // Helper methods
  private getStoredFollows(userId: string): FollowingRelationship[] {
    try {
      const stored = localStorage.getItem(`following_${userId}`);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting stored follows:', error);
      return [];
    }
  }

  private async logFollowingActivity(
    userId: string,
    activityType: FollowingActivity['activity_type'],
    entityId: string,
    entityType: FollowableEntityType,
    details: string
  ): Promise<void> {
    try {
      const activity: FollowingActivity = {
        id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        user_id: userId,
        activity_type: activityType,
        entity_id: entityId,
        entity_type: entityType,
        details,
        timestamp: new Date().toISOString()
      };

      // Store activity (in real app, this would be in database)
      const existingActivities = JSON.parse(localStorage.getItem(`following_activity_${userId}`) || '[]');
      existingActivities.unshift(activity);
      localStorage.setItem(`following_activity_${userId}`, JSON.stringify(existingActivities.slice(0, 100)));
    } catch (error) {
      console.error('Error logging following activity:', error);
    }
  }

  private async getEntityProfile(entityId: string, entityType: FollowableEntityType): Promise<FollowableEntity | null> {
    switch (entityType) {
      case 'organizer':
        return await this.getOrganizerProfile(entityId);
      case 'instructor':
        return await this.getInstructorProfile(entityId);
      case 'business':
        return await this.getBusinessProfile(entityId);
      default:
        return null;
    }
  }

  private getRandomActivityType(): FollowingFeedItem['activity_type'] {
    const types: FollowingFeedItem['activity_type'][] = ['new_event', 'announcement', 'achievement', 'update', 'promotion'];
    return types[Math.floor(Math.random() * types.length)];
  }

  private generateMockTitle(entityType: FollowableEntityType, entityName: string): string {
    const templates = {
      organizer: [
        `New stepping social this weekend!`,
        `${entityName} announces spring competition series`,
        `Special guest instructors for our next event`,
        `Early bird tickets now available`,
        `Thank you for an amazing event last night!`
      ],
      instructor: [
        `New beginner classes starting next month`,
        `${entityName} shares technique tips`,
        `Student showcase performances`,
        `Workshop announcement: Advanced styling`,
        `Class schedule updates`
      ],
      business: [
        `Spring studio rental specials`,
        `New equipment added to the studio`,
        `${entityName} hosts community event`,
        `Student appreciation week`,
        `Studio maintenance updates`
      ]
    };

    const entityTemplates = templates[entityType];
    return entityTemplates[Math.floor(Math.random() * entityTemplates.length)];
  }

  private generateMockDescription(entityType: FollowableEntityType): string {
    const descriptions = {
      organizer: [
        'Join us for an amazing night of stepping with great music and even better company.',
        'We are excited to announce our upcoming events and workshops.',
        'Thank you to everyone who came out to support our last event.',
        'Get ready for another unforgettable stepping experience.'
      ],
      instructor: [
        'Improving your technique starts with understanding the fundamentals.',
        'Join me for specialized workshops designed to elevate your dancing.',
        'Check out these tips to help you master this move.',
        'Register now for upcoming classes and workshops.'
      ],
      business: [
        'We are constantly working to improve our facilities and services.',
        'Thank you for choosing us for your dance needs.',
        'Exciting updates and new offerings are coming soon.',
        'Book your next event or class with us.'
      ]
    };

    const entityDescriptions = descriptions[entityType];
    return entityDescriptions[Math.floor(Math.random() * entityDescriptions.length)];
  }

  private generateRecommendationReasons(entity: FollowableEntity): string[] {
    const reasons = [
      `Popular in your area (${entity.location?.city || 'your city'})`,
      'Based on your dance style preferences',
      'Highly rated by the community',
      'Similar to others you follow',
      'Trending this week',
      'Recommended by friends',
      'Active in events you\'ve attended'
    ];

    return reasons.slice(0, Math.floor(Math.random() * 3) + 2);
  }

  private async getMockEntities(): Promise<FollowableEntity[]> {
    const entities: FollowableEntity[] = [];

    // Add mock organizers
    for (let i = 1; i <= 5; i++) {
      const organizer = await this.getOrganizerProfile(`organizer_${i}`);
      if (organizer) entities.push(organizer);
    }

    // Add mock instructors
    for (let i = 1; i <= 5; i++) {
      const instructor = await this.getInstructorProfile(`instructor_${i}`);
      if (instructor) entities.push(instructor);
    }

    // Add mock businesses
    for (let i = 1; i <= 5; i++) {
      const business = await this.getBusinessProfile(`business_${i}`);
      if (business) entities.push(business);
    }

    return entities;
  }
}

export const followingService = new FollowingService(); 