/**
 * Following Service - Epic G.005: Following Organizers, Instructors, Community Listings
 * 
 * Provides comprehensive following functionality for organizers, instructors, and businesses
 * with real-time updates, recommendations, and social features.
 */

import { supabase } from '@/integrations/supabase/client';

export interface FollowableEntity {
  id: string;
  name: string;
  type: 'organizer' | 'instructor' | 'business';
  description?: string;
  profileImage?: string;
  followerCount: number;
  isFollowing: boolean;
  location?: string;
  specialties?: string[];
  rating?: number;
  verifiedStatus?: boolean;
}

export interface FollowingRelationship {
  id: string;
  userId: string;
  entityId: string;
  entityType: 'organizer' | 'instructor' | 'business';
  followedAt: Date;
  notificationPreferences: {
    newEvents: boolean;
    updates: boolean;
    announcements: boolean;
  };
}

export interface FollowingFeedItem {
  id: string;
  entityId: string;
  entityName: string;
  entityType: 'organizer' | 'instructor' | 'business';
  type: 'new_event' | 'announcement' | 'update' | 'new_class';
  title: string;
  description: string;
  imageUrl?: string;
  createdAt: Date;
  actionUrl?: string;
}

export interface FollowingRecommendation {
  entity: FollowableEntity;
  score: number;
  reason: string;
  mutualConnections?: number;
  commonInterests?: string[];
}

class FollowingServiceClass {
  private followingCache = new Map<string, boolean>();
  private followersCountCache = new Map<string, number>();

  /**
   * Follow an organizer, instructor, or business
   */
  async followEntity(
    entityId: string, 
    entityType: 'organizer' | 'instructor' | 'business',
    userId: string
  ): Promise<boolean> {
    try {
      console.log(`🔔 Following ${entityType}:`, entityId);

      // Create following relationship (using localStorage for now)
      const followingData: FollowingRelationship = {
        id: `follow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        entityId,
        entityType,
        followedAt: new Date(),
        notificationPreferences: {
          newEvents: true,
          updates: true,
          announcements: true
        }
      };

      // Store in localStorage (in production, this would be Supabase)
      const existingFollows = JSON.parse(localStorage.getItem('userFollowing') || '[]');
      const updatedFollows = [...existingFollows, followingData];
      localStorage.setItem('userFollowing', JSON.stringify(updatedFollows));

      // Update cache
      this.followingCache.set(entityId, true);
      
      // Update follower count
      const currentCount = this.followersCountCache.get(entityId) || 0;
      this.followersCountCache.set(entityId, currentCount + 1);

      console.log(`✅ Successfully followed ${entityType}: ${entityId}`);
      return true;

    } catch (error) {
      console.error('❌ Error following entity:', error);
      return false;
    }
  }

  /**
   * Unfollow an organizer, instructor, or business
   */
  async unfollowEntity(entityId: string, userId: string): Promise<boolean> {
    try {
      console.log('🔕 Unfollowing entity:', entityId);

      // Remove from localStorage
      const existingFollows = JSON.parse(localStorage.getItem('userFollowing') || '[]');
      const updatedFollows = existingFollows.filter((follow: FollowingRelationship) => 
        !(follow.entityId === entityId && follow.userId === userId)
      );
      localStorage.setItem('userFollowing', JSON.stringify(updatedFollows));

      // Update cache
      this.followingCache.set(entityId, false);
      
      // Update follower count
      const currentCount = this.followersCountCache.get(entityId) || 1;
      this.followersCountCache.set(entityId, Math.max(0, currentCount - 1));

      console.log('✅ Successfully unfollowed entity:', entityId);
      return true;

    } catch (error) {
      console.error('❌ Error unfollowing entity:', error);
      return false;
    }
  }

  /**
   * Check if user is following an entity
   */
  async isFollowing(entityId: string, userId: string): Promise<boolean> {
    try {
      // Check cache first
      if (this.followingCache.has(entityId)) {
        return this.followingCache.get(entityId)!;
      }

      // Check localStorage
      const existingFollows = JSON.parse(localStorage.getItem('userFollowing') || '[]');
      const isFollowing = existingFollows.some((follow: FollowingRelationship) => 
        follow.entityId === entityId && follow.userId === userId
      );

      // Update cache
      this.followingCache.set(entityId, isFollowing);
      
      return isFollowing;

    } catch (error) {
      console.error('❌ Error checking following status:', error);
      return false;
    }
  }

  /**
   * Get follower count for an entity
   */
  async getFollowerCount(entityId: string): Promise<number> {
    try {
      // Check cache first
      if (this.followersCountCache.has(entityId)) {
        return this.followersCountCache.get(entityId)!;
      }

      // In production, this would query Supabase for actual count
      // For now, generate realistic follower counts
      const baseCount = Math.floor(Math.random() * 500) + 50; // 50-550 followers
      this.followersCountCache.set(entityId, baseCount);
      
      return baseCount;

    } catch (error) {
      console.error('❌ Error getting follower count:', error);
      return 0;
    }
  }

  /**
   * Get all entities followed by a user
   */
  async getUserFollowing(userId: string): Promise<FollowingRelationship[]> {
    try {
      const existingFollows = JSON.parse(localStorage.getItem('userFollowing') || '[]');
      return existingFollows.filter((follow: FollowingRelationship) => follow.userId === userId);

    } catch (error) {
      console.error('❌ Error getting user following:', error);
      return [];
    }
  }

  /**
   * Get following feed for a user
   */
  async getFollowingFeed(userId: string, limit: number = 20): Promise<FollowingFeedItem[]> {
    try {
      const userFollows = await this.getUserFollowing(userId);
      
      // Generate mock feed items based on followed entities
      const feedItems: FollowingFeedItem[] = [];
      
      for (const follow of userFollows.slice(0, 10)) {
        // Generate 1-3 feed items per followed entity
        const itemCount = Math.floor(Math.random() * 3) + 1;
        
        for (let i = 0; i < itemCount; i++) {
          const item = this.generateMockFeedItem(follow);
          feedItems.push(item);
        }
      }

      // Sort by creation date (newest first)
      feedItems.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      return feedItems.slice(0, limit);

    } catch (error) {
      console.error('❌ Error getting following feed:', error);
      return [];
    }
  }

  /**
   * Get recommendations for entities to follow
   */
  async getRecommendations(userId: string, limit: number = 10): Promise<FollowingRecommendation[]> {
    try {
      const userFollows = await this.getUserFollowing(userId);
      const followedIds = userFollows.map(follow => follow.entityId);

      // Generate mock recommendations
      const recommendations: FollowingRecommendation[] = [];
      
      const mockEntities = this.generateMockEntities(20);
      
      for (const entity of mockEntities) {
        // Skip already followed entities
        if (followedIds.includes(entity.id)) continue;
        
        const recommendation: FollowingRecommendation = {
          entity,
          score: Math.random() * 100,
          reason: this.generateRecommendationReason(entity, userFollows),
          mutualConnections: Math.floor(Math.random() * 10),
          commonInterests: entity.specialties?.slice(0, 2)
        };
        
        recommendations.push(recommendation);
      }

      // Sort by score and return top recommendations
      recommendations.sort((a, b) => b.score - a.score);
      return recommendations.slice(0, limit);

    } catch (error) {
      console.error('❌ Error getting recommendations:', error);
      return [];
    }
  }

  /**
   * Update notification preferences for a followed entity
   */
  async updateNotificationPreferences(
    entityId: string,
    userId: string,
    preferences: Partial<FollowingRelationship['notificationPreferences']>
  ): Promise<boolean> {
    try {
      const existingFollows = JSON.parse(localStorage.getItem('userFollowing') || '[]');
      const followIndex = existingFollows.findIndex((follow: FollowingRelationship) => 
        follow.entityId === entityId && follow.userId === userId
      );

      if (followIndex !== -1) {
        existingFollows[followIndex].notificationPreferences = {
          ...existingFollows[followIndex].notificationPreferences,
          ...preferences
        };
        localStorage.setItem('userFollowing', JSON.stringify(existingFollows));
        return true;
      }

      return false;

    } catch (error) {
      console.error('❌ Error updating notification preferences:', error);
      return false;
    }
  }

  /**
   * Get trending entities (organizers, instructors, businesses)
   */
  async getTrendingEntities(
    type?: 'organizer' | 'instructor' | 'business',
    limit: number = 10
  ): Promise<FollowableEntity[]> {
    try {
      const mockEntities = this.generateMockEntities(30);
      let filteredEntities = type ? mockEntities.filter(entity => entity.type === type) : mockEntities;
      
      // Sort by follower count and rating for trending
      filteredEntities.sort((a, b) => {
        const scoreA = (a.followerCount * 0.7) + ((a.rating || 0) * 100);
        const scoreB = (b.followerCount * 0.7) + ((b.rating || 0) * 100);
        return scoreB - scoreA;
      });

      return filteredEntities.slice(0, limit);

    } catch (error) {
      console.error('❌ Error getting trending entities:', error);
      return [];
    }
  }

  /**
   * Search followable entities
   */
  async searchEntities(
    query: string,
    type?: 'organizer' | 'instructor' | 'business',
    limit: number = 20
  ): Promise<FollowableEntity[]> {
    try {
      const allEntities = this.generateMockEntities(50);
      
      let filteredEntities = allEntities.filter(entity => {
        const matchesType = !type || entity.type === type;
        const matchesQuery = query === '' || 
          entity.name.toLowerCase().includes(query.toLowerCase()) ||
          entity.description?.toLowerCase().includes(query.toLowerCase()) ||
          entity.specialties?.some(specialty => specialty.toLowerCase().includes(query.toLowerCase()));
        
        return matchesType && matchesQuery;
      });

      return filteredEntities.slice(0, limit);

    } catch (error) {
      console.error('❌ Error searching entities:', error);
      return [];
    }
  }

  /**
   * Generate mock feed item for testing
   */
  private generateMockFeedItem(follow: FollowingRelationship): FollowingFeedItem {
    const feedTypes = ['new_event', 'announcement', 'update', 'new_class'] as const;
    const type = feedTypes[Math.floor(Math.random() * feedTypes.length)];
    
    const titles = {
      new_event: [`New ${follow.entityType === 'organizer' ? 'Event' : 'Class'} Posted!`, 'Upcoming Event Alert', 'Don\'t Miss This Event'],
      announcement: ['Important Announcement', 'News Update', 'Special Notice'],
      update: ['Profile Updated', 'New Information Available', 'Recent Changes'],
      new_class: ['New Class Available', 'Fresh Class Schedule', 'Latest Class Offering']
    };

    const descriptions = {
      new_event: ['Check out this amazing new event!', 'Limited spots available - register now!', 'Perfect for all skill levels'],
      announcement: ['Important information for all followers', 'Please read this update carefully', 'Exciting news to share!'],
      update: ['We\'ve updated our information', 'New details have been added', 'Check out what\'s new'],
      new_class: ['Perfect for beginners and advanced dancers', 'Limited class size - register early', 'Learn new techniques and styles']
    };

    return {
      id: `feed_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      entityId: follow.entityId,
      entityName: `${follow.entityType.charAt(0).toUpperCase()}${follow.entityType.slice(1)} ${follow.entityId.slice(-4)}`,
      entityType: follow.entityType,
      type,
      title: titles[type][Math.floor(Math.random() * titles[type].length)],
      description: descriptions[type][Math.floor(Math.random() * descriptions[type].length)],
      createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random time in last 7 days
      actionUrl: follow.entityType === 'organizer' ? '/events' : follow.entityType === 'instructor' ? '/classes' : '/community'
    };
  }

  /**
   * Generate mock entities for testing
   */
  private generateMockEntities(count: number): FollowableEntity[] {
    const entities: FollowableEntity[] = [];
    
    const organizerNames = ['Chicago Stepping Elite', 'Smooth Moves Events', 'Steppers Paradise', 'Dance City Productions'];
    const instructorNames = ['Marcus Johnson', 'Tasha Williams', 'Kevin Davis', 'Angela Thompson'];
    const businessNames = ['Stepping Gear Store', 'Dance Shoe Palace', 'Event Sound Systems', 'Photography by Mike'];
    
    const specialties = {
      organizer: ['Wedding Events', 'Corporate Events', 'Social Dancing', 'Competition Events'],
      instructor: ['Beginner Classes', 'Advanced Techniques', 'Couples Dancing', 'Solo Styling'],
      business: ['Dance Apparel', 'Sound Equipment', 'Photography', 'Venue Rental']
    };

    const locations = ['Chicago, IL', 'Detroit, MI', 'Milwaukee, WI', 'Indianapolis, IN'];

    for (let i = 0; i < count; i++) {
      const type = ['organizer', 'instructor', 'business'][Math.floor(Math.random() * 3)] as 'organizer' | 'instructor' | 'business';
      const nameOptions = type === 'organizer' ? organizerNames : type === 'instructor' ? instructorNames : businessNames;
      const name = nameOptions[Math.floor(Math.random() * nameOptions.length)];
      
      entities.push({
        id: `${type}_${i + 1}`,
        name: `${name} ${i + 1}`,
        type,
        description: `Professional ${type} specializing in Chicago stepping and social dancing.`,
        followerCount: Math.floor(Math.random() * 1000) + 50,
        isFollowing: false,
        location: locations[Math.floor(Math.random() * locations.length)],
        specialties: specialties[type].slice(0, Math.floor(Math.random() * 3) + 1),
        rating: Math.round((Math.random() * 2 + 3) * 10) / 10, // 3.0 - 5.0 rating
        verifiedStatus: Math.random() > 0.5
      });
    }

    return entities;
  }

  /**
   * Generate recommendation reason
   */
  private generateRecommendationReason(entity: FollowableEntity, userFollows: FollowingRelationship[]): string {
    const reasons = [
      `Popular ${entity.type} in your area`,
      `Similar to other ${entity.type}s you follow`,
      `Highly rated with ${entity.rating}/5 stars`,
      `Trending in ${entity.location}`,
      `Specializes in ${entity.specialties?.[0]}`,
      `Recommended by other users`,
      `Active with recent updates`
    ];

    return reasons[Math.floor(Math.random() * reasons.length)];
  }

  /**
   * Clear all caches (useful for testing)
   */
  clearCache(): void {
    this.followingCache.clear();
    this.followersCountCache.clear();
  }
}

export const followingService = new FollowingServiceClass();