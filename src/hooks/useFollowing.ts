/**
 * useFollowing Hook - Epic G.005: Following Organizers, Instructors, Community Listings
 * 
 * React hook for managing following state with real-time updates, caching,
 * and comprehensive following functionality.
 */

import { useState, useEffect, useCallback } from 'react';
import { followingService, type FollowableEntity, type FollowingFeedItem, type FollowingRecommendation } from '@/services/followingService';
import { useAuth } from '@/hooks/useAuth';

export interface UseFollowingReturn {
  // Following status
  isFollowing: (entityId: string) => boolean;
  followerCount: (entityId: string) => number;
  
  // Actions
  followEntity: (entityId: string, entityType: 'organizer' | 'instructor' | 'business') => Promise<boolean>;
  unfollowEntity: (entityId: string) => Promise<boolean>;
  
  // Data
  followingFeed: FollowingFeedItem[];
  recommendations: FollowingRecommendation[];
  trendingEntities: FollowableEntity[];
  
  // Loading states
  isLoading: boolean;
  isFollowingLoading: Record<string, boolean>;
  
  // Actions for data
  refreshFeed: () => Promise<void>;
  refreshRecommendations: () => Promise<void>;
  refreshTrending: () => Promise<void>;
  searchEntities: (query: string, type?: 'organizer' | 'instructor' | 'business') => Promise<FollowableEntity[]>;
  
  // Utilities
  clearCache: () => void;
}

export const useFollowing = (): UseFollowingReturn => {
  const { user } = useAuth();
  
  // State
  const [followingStatus, setFollowingStatus] = useState<Record<string, boolean>>({});
  const [followerCounts, setFollowerCounts] = useState<Record<string, number>>({});
  const [followingFeed, setFollowingFeed] = useState<FollowingFeedItem[]>([]);
  const [recommendations, setRecommendations] = useState<FollowingRecommendation[]>([]);
  const [trendingEntities, setTrendingEntities] = useState<FollowableEntity[]>([]);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isFollowingLoading, setIsFollowingLoading] = useState<Record<string, boolean>>({});

  /**
   * Check if user is following an entity
   */
  const isFollowing = useCallback((entityId: string): boolean => {
    return followingStatus[entityId] || false;
  }, [followingStatus]);

  /**
   * Get follower count for an entity
   */
  const followerCount = useCallback((entityId: string): number => {
    return followerCounts[entityId] || 0;
  }, [followerCounts]);

  /**
   * Follow an entity
   */
  const followEntity = useCallback(async (
    entityId: string, 
    entityType: 'organizer' | 'instructor' | 'business'
  ): Promise<boolean> => {
    if (!user?.id) {
      console.warn('User not authenticated for following');
      return false;
    }

    try {
      setIsFollowingLoading(prev => ({ ...prev, [entityId]: true }));
      
      const success = await followingService.followEntity(entityId, entityType, user.id);
      
      if (success) {
        // Update local state immediately for responsive UI
        setFollowingStatus(prev => ({ ...prev, [entityId]: true }));
        setFollowerCounts(prev => ({ 
          ...prev, 
          [entityId]: (prev[entityId] || 0) + 1 
        }));
        
        // Refresh recommendations to remove followed entity
        refreshRecommendations();
      }
      
      return success;
    } catch (error) {
      console.error('Error following entity:', error);
      return false;
    } finally {
      setIsFollowingLoading(prev => ({ ...prev, [entityId]: false }));
    }
  }, [user?.id]);

  /**
   * Unfollow an entity
   */
  const unfollowEntity = useCallback(async (entityId: string): Promise<boolean> => {
    if (!user?.id) {
      console.warn('User not authenticated for unfollowing');
      return false;
    }

    try {
      setIsFollowingLoading(prev => ({ ...prev, [entityId]: true }));
      
      const success = await followingService.unfollowEntity(entityId, user.id);
      
      if (success) {
        // Update local state immediately for responsive UI
        setFollowingStatus(prev => ({ ...prev, [entityId]: false }));
        setFollowerCounts(prev => ({ 
          ...prev, 
          [entityId]: Math.max(0, (prev[entityId] || 1) - 1)
        }));
        
        // Refresh feed and recommendations
        refreshFeed();
        refreshRecommendations();
      }
      
      return success;
    } catch (error) {
      console.error('Error unfollowing entity:', error);
      return false;
    } finally {
      setIsFollowingLoading(prev => ({ ...prev, [entityId]: false }));
    }
  }, [user?.id]);

  /**
   * Refresh following feed
   */
  const refreshFeed = useCallback(async (): Promise<void> => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const feed = await followingService.getFollowingFeed(user.id, 20);
      setFollowingFeed(feed);
    } catch (error) {
      console.error('Error refreshing following feed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  /**
   * Refresh recommendations
   */
  const refreshRecommendations = useCallback(async (): Promise<void> => {
    if (!user?.id) return;

    try {
      const recs = await followingService.getRecommendations(user.id, 10);
      setRecommendations(recs);
    } catch (error) {
      console.error('Error refreshing recommendations:', error);
    }
  }, [user?.id]);

  /**
   * Refresh trending entities
   */
  const refreshTrending = useCallback(async (): Promise<void> => {
    try {
      const trending = await followingService.getTrendingEntities(undefined, 15);
      setTrendingEntities(trending);
    } catch (error) {
      console.error('Error refreshing trending entities:', error);
    }
  }, []);

  /**
   * Search entities
   */
  const searchEntities = useCallback(async (
    query: string, 
    type?: 'organizer' | 'instructor' | 'business'
  ): Promise<FollowableEntity[]> => {
    try {
      return await followingService.searchEntities(query, type, 20);
    } catch (error) {
      console.error('Error searching entities:', error);
      return [];
    }
  }, []);

  /**
   * Load following status for multiple entities
   */
  const loadFollowingStatus = useCallback(async (entityIds: string[]): Promise<void> => {
    if (!user?.id || entityIds.length === 0) return;

    try {
      const statusPromises = entityIds.map(async (entityId) => {
        const [isFollowingResult, followerCountResult] = await Promise.all([
          followingService.isFollowing(entityId, user.id),
          followingService.getFollowerCount(entityId)
        ]);
        return { entityId, isFollowing: isFollowingResult, followerCount: followerCountResult };
      });

      const results = await Promise.all(statusPromises);
      
      const newFollowingStatus: Record<string, boolean> = {};
      const newFollowerCounts: Record<string, number> = {};
      
      results.forEach(({ entityId, isFollowing, followerCount }) => {
        newFollowingStatus[entityId] = isFollowing;
        newFollowerCounts[entityId] = followerCount;
      });

      setFollowingStatus(prev => ({ ...prev, ...newFollowingStatus }));
      setFollowerCounts(prev => ({ ...prev, ...newFollowerCounts }));

    } catch (error) {
      console.error('Error loading following status:', error);
    }
  }, [user?.id]);

  /**
   * Clear cache
   */
  const clearCache = useCallback((): void => {
    followingService.clearCache();
    setFollowingStatus({});
    setFollowerCounts({});
    setFollowingFeed([]);
    setRecommendations([]);
    setTrendingEntities([]);
  }, []);

  // Load initial data when user is available
  useEffect(() => {
    if (user?.id) {
      refreshFeed();
      refreshRecommendations();
      refreshTrending();
    }
  }, [user?.id, refreshFeed, refreshRecommendations, refreshTrending]);

  return {
    // Following status
    isFollowing,
    followerCount,
    
    // Actions
    followEntity,
    unfollowEntity,
    
    // Data
    followingFeed,
    recommendations,
    trendingEntities,
    
    // Loading states
    isLoading,
    isFollowingLoading,
    
    // Actions for data
    refreshFeed,
    refreshRecommendations,
    refreshTrending,
    searchEntities,
    
    // Utilities
    clearCache,
    
    // Internal utility for components
    loadFollowingStatus: loadFollowingStatus as any
  };
};